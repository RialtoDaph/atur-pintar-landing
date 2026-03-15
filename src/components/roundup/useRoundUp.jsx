import { base44 } from "@/api/base44Client";

/**
 * Calculates and creates a round-up savings transaction after an expense.
 * @param {number} expenseAmount - The actual expense amount
 * @param {string} expenseDate - The date of the expense (YYYY-MM-DD)
 * @param {string} expenseNote - The note of the original transaction
 */
export async function applyRoundUp(expenseAmount, expenseDate, expenseNote = "") {
  // Fetch the user's round-up rule
  const rules = await base44.entities.RoundUpRule.list();
  if (!rules.length) return;

  const rule = rules[0];
  if (!rule.is_enabled || !rule.goal_id || !rule.round_to) return;

  const roundTo = rule.round_to;
  const remainder = expenseAmount % roundTo;
  if (remainder === 0) return; // Already a round number, no round-up needed

  const roundUpAmount = roundTo - remainder;

  // Create the savings transaction
  await base44.entities.Transaction.create({
    amount: roundUpAmount,
    type: "savings",
    category: "other",
    note: `Round-up dari: ${expenseNote || "transaksi"}`,
    date: expenseDate,
    goal_id: rule.goal_id,
    is_recurring: false,
    is_recurring_child: false,
  });

  // Update the goal's current_amount
  const goals = await base44.entities.SavingsGoal.filter({ id: rule.goal_id });
  if (goals.length > 0) {
    const goal = goals[0];
    const newAmount = (goal.current_amount || 0) + roundUpAmount;
    await base44.entities.SavingsGoal.update(goal.id, {
      current_amount: newAmount,
      status: newAmount >= goal.target_amount ? "completed" : goal.status,
    });
  }

  // Update rule's total_saved counter
  await base44.entities.RoundUpRule.update(rule.id, {
    total_saved: (rule.total_saved || 0) + roundUpAmount,
  });
}