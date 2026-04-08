import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { syncAccountBalance } from "@/components/utils/accountSync";

const INTERVAL_DAYS = { daily: 1, weekly: 7, monthly: 30, yearly: 365 };

function addInterval(dateStr, interval) {
  const d = new Date(dateStr);
  if (interval === "monthly") {
    d.setMonth(d.getMonth() + 1);
  } else if (interval === "yearly") {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    d.setDate(d.getDate() + INTERVAL_DAYS[interval]);
  }
  return d.toISOString().split("T")[0];
}

export async function processRecurringTransactions(userEmail) {
  const today = new Date().toISOString().split("T")[0];
  const filter = userEmail ? { is_recurring: true, created_by: userEmail } : { is_recurring: true };
  const all = await base44.entities.Transaction.filter(filter);

  for (const tx of all) {
    if (!tx.recurring_interval) continue;
    const lastGen = tx.recurring_last_generated || tx.date;
    let nextDate = addInterval(lastGen, tx.recurring_interval);

    // Only auto-generate for dates BEFORE today (not today itself)
    // Today's transaction must be manually recorded via "Tandai Selesai"
    if (nextDate < today) {
      let current = nextDate;
      let latestGenerated = lastGen;
      const toCreate = [];

      while (current < today) {
        toCreate.push({
          amount: tx.amount,
          type: tx.type,
          category: tx.category,
          note: tx.note,
          date: current,
          is_recurring_child: true,
          recurring_parent_id: tx.id,
          ...(tx.account_id ? { account_id: tx.account_id } : {}),
        });
        latestGenerated = current;
        current = addInterval(current, tx.recurring_interval);
      }

      await Promise.all([
        base44.entities.Transaction.bulkCreate(toCreate),
        base44.entities.Transaction.update(tx.id, {
          recurring_last_generated: latestGenerated,
        }),
      ]);
      // Sync account balance for each generated child
      if (tx.account_id) {
        for (const child of toCreate) {
          await syncAccountBalance(tx.account_id, child.amount, child.type, 1);
        }
      }
    }
  }
}

// Silent background component that runs on mount — once per day per session
export default function RecurringManager({ userEmail }) {
  useEffect(() => {
    if (!userEmail) return;
    const today = new Date().toISOString().split("T")[0];
    const key = `recurring_processed_${userEmail}_${today}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    processRecurringTransactions(userEmail).catch(console.error);
  }, [userEmail]);
  return null;
}