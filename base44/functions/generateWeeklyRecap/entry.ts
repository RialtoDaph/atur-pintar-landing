import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function fmt(n) {
  const abs = Math.abs(Math.round(n || 0));
  if (abs >= 1000000) return `${(abs / 1000000).toFixed(1)}jt`;
  if (abs >= 1000) return `${(abs / 1000).toFixed(0)}rb`;
  return abs.toLocaleString('id-ID');
}

function getLastWeekRange() {
  const now = new Date();
  // Last Monday
  const dayOfWeek = now.getDay(); // 0=Sun
  const daysToLastMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const lastMon = new Date(now);
  lastMon.setDate(now.getDate() - daysToLastMon - 7);
  lastMon.setHours(0, 0, 0, 0);

  const lastSun = new Date(lastMon);
  lastSun.setDate(lastMon.getDate() + 6);
  lastSun.setHours(23, 59, 59, 999);

  const fmt2 = (d) => d.toISOString().split('T')[0];
  return { start: fmt2(lastMon), end: fmt2(lastSun) };
}

function getPrevWeekRange(weekStart) {
  const d = new Date(weekStart);
  d.setDate(d.getDate() - 7);
  const end = new Date(d);
  end.setDate(d.getDate() + 6);
  return {
    start: d.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { start: weekStart, end: weekEnd } = getLastWeekRange();

    // Check if recap already exists for this user+week
    const existing = await base44.entities.WeeklyRecap.filter({ created_by: user.email, week_start: weekStart });
    if (existing && existing.length > 0) {
      return Response.json({ message: 'Recap already exists', recap: existing[0] });
    }

    // Fetch transactions for the week.
    // Exclude soft-deleted AND recurring TEMPLATES (only generated children represent real spending).
    const allTxs = await base44.entities.Transaction.filter({ created_by: user.email }, '-date', 500);
    const isRealTx = (t) => !t.is_deleted && !(t.is_recurring === true && !t.is_recurring_child);
    const weekTxs = (allTxs || []).filter(t => isRealTx(t) && t.date >= weekStart && t.date <= weekEnd);

    const totalIncome = weekTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = weekTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const net = totalIncome - totalExpense;
    const transactionCount = weekTxs.length;

    // Top categories
    const catMap = {};
    weekTxs.filter(t => t.type === 'expense').forEach(t => {
      const cat = t.category || 'other';
      if (!catMap[cat]) catMap[cat] = { category: cat, amount: 0, count: 0 };
      catMap[cat].amount += t.amount;
      catMap[cat].count += 1;
    });
    const topCategories = Object.values(catMap).sort((a, b) => b.amount - a.amount).slice(0, 3);

    // vs last week
    const prevRange = getPrevWeekRange(weekStart);
    const prevTxs = (allTxs || []).filter(t => isRealTx(t) && t.date >= prevRange.start && t.date <= prevRange.end);
    const prevExpense = prevTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const vsLastWeekPct = prevExpense > 0 ? Math.round(((totalExpense - prevExpense) / prevExpense) * 100) : null;

    // Nana summary
    let summaryText = 'Minggu ini belum ada transaksi tercatat. Mulai mencatat untuk mendapatkan rekap yang lebih baik!';
    if (transactionCount > 0) {
      const topCatText = topCategories.map(c => `${c.category} (Rp${fmt(c.amount)})`).join(', ');
      const prompt = `Buat ringkasan keuangan mingguan singkat 2-3 kalimat dalam Bahasa Indonesia yang personal dan supportif.
Data: Pemasukan Rp${fmt(totalIncome)}, Pengeluaran Rp${fmt(totalExpense)}, Selisih Rp${fmt(net)}.
Pengeluaran terbesar: ${topCatText}.
${vsLastWeekPct !== null ? `Pengeluaran ${Math.abs(vsLastWeekPct)}% ${vsLastWeekPct > 0 ? 'lebih besar' : 'lebih kecil'} dari minggu lalu.` : ''}
Buat narasi seperti teman yang bijak, bukan ceramah.`;
      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      summaryText = typeof result === 'string' ? result : (result?.text || summaryText);
    }

    const recap = await base44.entities.WeeklyRecap.create({
      week_start: weekStart,
      week_end: weekEnd,
      total_income: totalIncome,
      total_expense: totalExpense,
      net,
      transaction_count: transactionCount,
      top_categories: topCategories,
      vs_last_week_pct: vsLastWeekPct,
      summary_text: summaryText,
      is_read: false,
    });

    return Response.json({ success: true, recap });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});