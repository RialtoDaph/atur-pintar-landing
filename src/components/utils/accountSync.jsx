import { base44 } from "@/api/base44Client";

/**
 * Adjusts an account's balance based on a transaction.
 * @param {string} accountId
 * @param {number} amount
 * @param {string} type - "income" | "expense" | "savings"
 * @param {1 | -1} direction - 1 = apply, -1 = reverse
 */
export async function syncAccountBalance(accountId, amount, type, direction = 1) {
  if (!accountId || !amount) return;
  const accounts = await base44.entities.Account.filter({ id: accountId });
  const account = accounts[0];
  if (!account) return;

  const delta = type === "income" ? amount : -amount;
  const newBalance = (account.balance || 0) + delta * direction;
  await base44.entities.Account.update(accountId, { balance: newBalance });
}