import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

/**
 * Deduplicates Account, SavingsGoal, Reminder, Subscription, Alert records per user.
 * Safe to run multiple times (idempotent).
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const results = {};

    // Helper to count successful deletions instead of relying on filtered length
    // (skipped/failed items shouldn't be counted as deduplicated).
    async function dedupBy(list, keyFn, deleteFn) {
      const seen = {};
      let deleted = 0;
      for (const item of (list || [])) {
        const key = keyFn(item);
        if (!key) continue;
        if (!seen[key]) {
          seen[key] = item;
        } else {
          try { await deleteFn(item.id); deleted++; } catch (_) {}
        }
      }
      return deleted;
    }

    // ── 1. Deduplicate Accounts ──────────────────────────────────────────────
    const accounts = await base44.entities.Account.filter({ created_by: user.email });
    results.accounts_deduplicated = await dedupBy(
      accounts,
      (acc) => acc.name?.trim()?.toLowerCase(),
      (id) => base44.entities.Account.delete(id),
    );

    // ── 2. Deduplicate SavingsGoals ──────────────────────────────────────────
    const goals = await base44.entities.SavingsGoal.filter({ created_by: user.email });
    results.goals_deduplicated = await dedupBy(
      goals,
      (g) => g.name?.trim()?.toLowerCase(),
      (id) => base44.entities.SavingsGoal.delete(id),
    );

    // ── 3. Deduplicate Reminders ─────────────────────────────────────────────
    const reminders = await base44.entities.Reminder.filter({ created_by: user.email });
    results.reminders_deduplicated = await dedupBy(
      reminders,
      (r) => r.title?.trim()?.toLowerCase(),
      (id) => base44.entities.Reminder.delete(id),
    );

    // ── 4. Deduplicate Subscriptions ─────────────────────────────────────────
    const subs = await base44.entities.Subscription.filter({ created_by: user.email });
    results.subscriptions_deduplicated = await dedupBy(
      subs,
      (s) => s.name?.trim()?.toLowerCase(),
      (id) => base44.entities.Subscription.delete(id),
    );

    // ── 5. Deduplicate Alerts (by title, keep most recent) ──────────────────
    const alerts = await base44.entities.Alert.filter({ created_by: user.email });
    // Also delete alerts older than 60 days
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const alertsByTitle = {};
    let alertsDeleted = 0;
    for (const a of alerts) {
      // Delete stale alerts
      if (a.created_date && a.created_date < sixtyDaysAgo) {
        await base44.entities.Alert.delete(a.id).catch(() => {});
        alertsDeleted++;
        continue;
      }
      const key = a.title?.trim();
      if (!key) continue;
      if (!alertsByTitle[key]) {
        alertsByTitle[key] = a;
      } else {
        // Keep the newer one
        const existing = alertsByTitle[key];
        if ((a.created_date || "") > (existing.created_date || "")) {
          await base44.entities.Alert.delete(existing.id).catch(() => {});
          alertsByTitle[key] = a;
        } else {
          await base44.entities.Alert.delete(a.id).catch(() => {});
        }
        alertsDeleted++;
      }
    }
    results.alerts_deduplicated = alertsDeleted;

    // ── 6. Deduplicate GamificationProfiles ─────────────────────────────────
    const profiles = await base44.entities.GamificationProfile.filter({ created_by: user.email });
    if (profiles.length > 1) {
      const sorted = [...profiles].sort((a, b) => (b.total_points || 0) - (a.total_points || 0));
      for (const p of sorted.slice(1)) {
        await base44.entities.GamificationProfile.delete(p.id).catch(() => {});
      }
      results.gamification_deduplicated = profiles.length - 1;
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});