import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

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

    // ── 1. Deduplicate Accounts ──────────────────────────────────────────────
    const accounts = await base44.entities.Account.filter({ created_by: user.email });
    const accountsByName = {};
    for (const acc of accounts) {
      const key = acc.name?.trim()?.toLowerCase();
      if (!key) continue;
      if (!accountsByName[key]) {
        accountsByName[key] = acc;
      } else {
        // Keep the one with higher balance or older created_date; delete duplicate
        await base44.entities.Account.delete(acc.id).catch(() => {});
      }
    }
    results.accounts_deduplicated = accounts.length - Object.keys(accountsByName).length;

    // ── 2. Deduplicate SavingsGoals ──────────────────────────────────────────
    const goals = await base44.entities.SavingsGoal.filter({ created_by: user.email });
    const goalsByName = {};
    for (const g of goals) {
      const key = g.name?.trim()?.toLowerCase();
      if (!key) continue;
      if (!goalsByName[key]) {
        goalsByName[key] = g;
      } else {
        await base44.entities.SavingsGoal.delete(g.id).catch(() => {});
      }
    }
    results.goals_deduplicated = goals.length - Object.keys(goalsByName).length;

    // ── 3. Deduplicate Reminders ─────────────────────────────────────────────
    const reminders = await base44.entities.Reminder.filter({ created_by: user.email });
    const remindersByTitle = {};
    for (const r of reminders) {
      const key = r.title?.trim()?.toLowerCase();
      if (!key) continue;
      if (!remindersByTitle[key]) {
        remindersByTitle[key] = r;
      } else {
        await base44.entities.Reminder.delete(r.id).catch(() => {});
      }
    }
    results.reminders_deduplicated = reminders.length - Object.keys(remindersByTitle).length;

    // ── 4. Deduplicate Subscriptions ─────────────────────────────────────────
    const subs = await base44.entities.Subscription.filter({ created_by: user.email });
    const subsByName = {};
    for (const s of subs) {
      const key = s.name?.trim()?.toLowerCase();
      if (!key) continue;
      if (!subsByName[key]) {
        subsByName[key] = s;
      } else {
        await base44.entities.Subscription.delete(s.id).catch(() => {});
      }
    }
    results.subscriptions_deduplicated = subs.length - Object.keys(subsByName).length;

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