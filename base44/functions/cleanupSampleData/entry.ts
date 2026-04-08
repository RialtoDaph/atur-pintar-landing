import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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

    // Fix hd722875@gmail.com's subscription
    const userList = await base44.asServiceRole.entities.User.filter({ email: "hd722875@gmail.com" });
    if (userList.length > 0) {
      const userId = userList[0].id;
      const today = "2026-04-08";
      const endDate = "2026-05-08";
      
      await base44.asServiceRole.entities.User.update(userId, {
        subscription_plan: "premium_monthly",
        subscription_status: "active",
        subscription_start_date: today,
        subscription_end_date: endDate
      });

      // Send notification
      await base44.asServiceRole.entities.AdminNotification.create({
        title: "🎉 Akun Premium Aktif!",
        message: "Pembayaran kamu sudah dikonfirmasi. Selamat menikmati Atur Pintar Premium!",
        target_type: "specific",
        target_email: "hd722875@gmail.com",
        is_read: false,
        read_by: []
      });
    }

    // Log cleanup
    await base44.asServiceRole.entities.SystemLog.create({
      log_type: "activity",
      user_email: user.email,
      action: "data_cleanup_completed",
      severity: "info",
      details: `Deleted sample data from larasadelia586@gmail.com and imeldaiis61@gmail.com. Total deleted: ${totalDeleted} records.`
    });

    return Response.json({ success: true, deleted: totalDeleted, entities: ENTITIES_TO_CLEAN.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});