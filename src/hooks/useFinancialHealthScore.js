import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";

function calcConsistency(txCount) {
  if (txCount === 0) return 0;
  if (txCount <= 5) return 50;
  if (txCount <= 10) return 100;
  if (txCount <= 20) return 175;
  return 250;
}

function calcBudgetAdherence(budgets, transactions, month) {
  if (!budgets || budgets.length === 0) return 0;
  const monthTx = transactions.filter(t => (t.date || "").startsWith(month) && !t.is_deleted);
  const spendByCategory = {};
  for (const tx of monthTx) {
    if (tx.type === "expense") {
      spendByCategory[tx.category] = (spendByCategory[tx.category] || 0) + (tx.amount || 0);
    }
  }
  const notExceeded = budgets.filter(b => (spendByCategory[b.category] || 0) <= (b.amount || 0)).length;
  return Math.round((notExceeded / budgets.length) * 250);
}

function calcStreak(streak) {
  if (!streak || streak === 0) return 0;
  if (streak <= 3) return 50;
  if (streak <= 7) return 100;
  if (streak <= 14) return 150;
  return 200;
}

function calcGoalProgress(goals) {
  const active = (goals || []).filter(g => g.status === "active" && g.target_amount > 0);
  if (active.length === 0) return 0;
  const avg = active.reduce((s, g) => s + Math.min((g.current_amount || 0) / g.target_amount, 1), 0) / active.length * 100;
  if (avg === 0) return 0;
  if (avg <= 25) return 50;
  if (avg <= 50) return 100;
  if (avg <= 75) return 150;
  return 200;
}

function calcNanaInteraction(nanaCount) {
  if (nanaCount === 0) return 0;
  if (nanaCount <= 5) return 30;
  if (nanaCount <= 15) return 70;
  return 100;
}

export function useFinancialHealthScore(user) {
  const calculatedRef = useRef(false);

  useEffect(() => {
    if (!user?.email || calculatedRef.current) return;
    calculatedRef.current = true;
    calculateAndSaveFHS(user.email);
  }, [user?.email]);
}

async function calculateAndSaveFHS(email) {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  try {
    const [transactions, budgets, gamProfiles, goals, nanaConvs] = await Promise.all([
      base44.entities.Transaction.filter({ created_by: email }).catch(() => []),
      base44.entities.Budget.filter({ created_by: email, month }).catch(() => []),
      base44.entities.GamificationProfile.filter({ created_by: email }).catch(() => []),
      base44.entities.SavingsGoal.filter({ created_by: email }).catch(() => []),
      base44.entities.NanaConversation.filter({ created_by: email, session_date: { $gte: `${month}-01` } }).catch(() => []),
    ]);

    // 1. Konsistensi Pencatatan
    const monthTx = (transactions || []).filter(t => (t.date || "").startsWith(month) && !t.is_deleted && !(t.is_recurring && !t.is_recurring_child));
    const consistency_score = calcConsistency(monthTx.length);

    // 2. Budget Adherence
    const budget_adherence_score = calcBudgetAdherence(budgets, transactions || [], month);

    // 3. Streak
    const streak = gamProfiles?.[0]?.daily_streak || 0;
    const streak_score = calcStreak(streak);

    // 4. Goal Progress
    const goal_progress_score = calcGoalProgress(goals);

    // 5. Nana Interaction (count user messages this month)
    const nanaUserMsgs = (nanaConvs || []).filter(c => c.role === "user").length;
    const nana_interaction_score = calcNanaInteraction(nanaUserMsgs);

    const total_score = consistency_score + budget_adherence_score + streak_score + goal_progress_score + nana_interaction_score;
    const last_calculated_at = new Date().toISOString();

    // Check existing FHS for this month
    const existing = await base44.entities.FinancialHealthScore.filter({ created_by: email, month }).catch(() => []);

    const payload = {
      month,
      total_score,
      consistency_score,
      budget_adherence_score,
      streak_score,
      goal_progress_score,
      nana_interaction_score,
      last_calculated_at,
    };

    if (existing && existing.length > 0) {
      await base44.entities.FinancialHealthScore.update(existing[0].id, payload);
    } else {
      await base44.entities.FinancialHealthScore.create(payload);
    }
  } catch (e) {
    // Silent fail — non-critical
  }
}