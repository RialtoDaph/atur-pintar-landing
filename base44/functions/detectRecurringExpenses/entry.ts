import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Fetch last 12 months of expense transactions
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 12);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const allTx = await base44.entities.Transaction.filter({ created_by: user.email });
  const expenses = allTx.filter(tx =>
    tx.type === 'expense' &&
    !tx.is_recurring &&
    !tx.is_recurring_child &&
    !tx.is_deleted &&
    tx.date >= cutoffStr &&
    tx.note
  );

  // Group by normalized note (lowercase, trimmed)
  const groups = {};
  for (const tx of expenses) {
    const key = tx.note.toLowerCase().trim();
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  }

  // Also group by amount similarity (within ±5%) regardless of note
  // for cases like "PLN", "PDAM" with slightly different notes
  const amountGroups = {};
  for (const tx of expenses) {
    const roundedAmount = Math.round(tx.amount / 1000) * 1000; // round to nearest 1k
    const amountKey = `amt_${roundedAmount}`;
    if (!amountGroups[amountKey]) amountGroups[amountKey] = [];
    amountGroups[amountKey].push(tx);
  }

  const candidates = [];
  const processedNotes = new Set();

  // Process note-based groups
  for (const [note, txList] of Object.entries(groups)) {
    if (txList.length < 2) continue;
    processedNotes.add(note);

    const sorted = txList.sort((a, b) => new Date(a.date) - new Date(b.date));
    const dates = sorted.map(t => new Date(t.date));

    // Calculate intervals between consecutive transactions
    const intervals = [];
    for (let i = 1; i < dates.length; i++) {
      const days = Math.round((dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24));
      intervals.push(days);
    }

    // Check for weekly (~7 days), monthly (~28-35 days), or yearly (~330-380 days)
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    let billingCycle = null;
    let isRecurring = false;

    if (avgInterval >= 5 && avgInterval <= 10 && intervals.length >= 3) {
      billingCycle = 'weekly';
      isRecurring = true;
    } else if (avgInterval >= 25 && avgInterval <= 40 && intervals.length >= 2) {
      billingCycle = 'monthly';
      isRecurring = true;
    } else if (avgInterval >= 330 && avgInterval <= 400) {
      billingCycle = 'yearly';
      isRecurring = true;
    }

    if (!isRecurring) continue;

    // Check if amounts are consistent (within ±10%)
    const amounts = sorted.map(t => t.amount);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const allConsistent = amounts.every(a => Math.abs(a - avgAmount) / avgAmount <= 0.10);
    if (!allConsistent && billingCycle !== 'yearly') continue;

    // Calculate next due date
    const lastDate = new Date(sorted[sorted.length - 1].date);
    const nextDate = new Date(lastDate);
    if (billingCycle === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
    else if (billingCycle === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
    else if (billingCycle === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

    candidates.push({
      name: txList[0].note,
      amount: Math.round(avgAmount),
      billing_cycle: billingCycle,
      category: txList[0].category || 'other',
      next_due_date: nextDate.toISOString().split('T')[0],
      last_seen_date: sorted[sorted.length - 1].date,
      occurrence_count: txList.length,
      transaction_notes: [...new Set(sorted.map(t => t.note))].slice(0, 3),
    });
  }

  // Check existing DetectedSubscriptions and Subscriptions to avoid duplicates
  const [existingDetected, existingSubs] = await Promise.all([
    base44.entities.DetectedSubscription.filter({ created_by: user.email }),
    base44.entities.Subscription.filter({ created_by: user.email }).catch(() => []),
  ]);

  const existingNames = new Set([
    ...existingDetected.map(d => d.name.toLowerCase().trim()),
    ...existingSubs.map(s => s.name.toLowerCase().trim()),
  ]);

  // Filter out already-known subscriptions
  const newCandidates = candidates.filter(c =>
    !existingNames.has(c.name.toLowerCase().trim())
  );

  // Save new candidates to DetectedSubscription entity
  let created = 0;
  for (const candidate of newCandidates) {
    await base44.entities.DetectedSubscription.create({
      ...candidate,
      status: 'pending',
    });
    created++;
  }

  // Re-scan dismissed ones to update if count increased significantly
  return Response.json({
    total_scanned: expenses.length,
    candidates_found: candidates.length,
    new_candidates: created,
  });
});