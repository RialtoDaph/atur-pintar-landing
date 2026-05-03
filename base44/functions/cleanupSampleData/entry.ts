import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SAMPLE_EMAILS = ["larasadelia586@gmail.com", "imeldaiis61@gmail.com"];
const ENTITIES_TO_CLEAN = [
  "Transaction", "SavingsGoal", "Debt", "Account", "Budget", "Reminder",
  "GamificationProfile", "NanaPreferences", "UserRiskProfile", "Investment",
  "InvestmentTransaction", "InvestmentWatchlist", "InvestmentTaxLog",
  "Subscription", "Alert", "SplitBill", "SplitIOU", "CategoryLearning"
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    let totalDeleted = 0;

    // Delete records from all entities where created_by matches sample emails
    for (const entity of ENTITIES_TO_CLEAN) {
      for (const email of SAMPLE_EMAILS) {
        const records = await base44.asServiceRole.entities[entity].filter({ created_by: email });
        if (records?.length > 0) {
          for (const record of records) {
            await base44.asServiceRole.entities[entity].delete(record.id);
            totalDeleted++;
          }
        }
      }
    }

    // Log cleanup (destructive admin action → warning)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    await base44.asServiceRole.entities.SystemLog.create({
      log_type: "sensitive_access",
      user_email: user.email,
      user_id: user.id,
      action: "admin_sample_data_cleanup",
      ip_address: ip,
      severity: "warning",
      details: `Admin ${user.email} deleted sample data from ${SAMPLE_EMAILS.join(', ')}. Total deleted: ${totalDeleted} records.`
    });

    return Response.json({ success: true, deleted: totalDeleted, entities: ENTITIES_TO_CLEAN.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});