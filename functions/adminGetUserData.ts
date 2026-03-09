import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { user_email } = await req.json();
    if (!user_email) return Response.json({ error: 'user_email required' }, { status: 400 });

    const [transactions, goals, budgets, debts, reminders, customCategories] = await Promise.all([
      base44.asServiceRole.entities.Transaction.filter({ created_by: user_email }, '-date', 200),
      base44.asServiceRole.entities.SavingsGoal.filter({ created_by: user_email }),
      base44.asServiceRole.entities.Budget.filter({ created_by: user_email }),
      base44.asServiceRole.entities.Debt.filter({ created_by: user_email }),
      base44.asServiceRole.entities.Reminder.filter({ created_by: user_email }),
      base44.asServiceRole.entities.CustomCategory.filter({ created_by: user_email }),
    ]);

    return Response.json({ transactions, goals, budgets, debts, reminders, customCategories });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});