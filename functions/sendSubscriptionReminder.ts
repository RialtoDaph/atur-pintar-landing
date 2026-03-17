import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Use service role to access all users
    const users = await base44.asServiceRole.entities.User.list();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let remindersSent = 0;

    for (const user of users) {
      // Skip users without premium subscription or expiry date
      if (!user.subscription_end_date || !user.subscription_plan || user.subscription_plan === 'free') continue;
      if (user.subscription_status !== 'approved') continue;

      const endDate = new Date(user.subscription_end_date);
      endDate.setHours(0, 0, 0, 0);

      const diffDays = Math.round((endDate - today) / (1000 * 60 * 60 * 24));

      // Only send reminder if 7 days left AND haven't sent reminder today
      if (diffDays !== 7) continue;

      // Check if reminder was already sent recently (within last 6 days)
      if (user.last_reminder_sent_date) {
        const lastSent = new Date(user.last_reminder_sent_date);
        lastSent.setHours(0, 0, 0, 0);
        const daysSinceLastSent = Math.round((today - lastSent) / (1000 * 60 * 60 * 24));
        if (daysSinceLastSent < 6) continue;
      }

      const planLabel = user.subscription_plan === 'premium_monthly' ? 'Premium Bulanan' : 'Premium Tahunan';
      const endDateFormatted = endDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

      const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#F2F4F7;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F2F4F7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#0A0A0A;padding:32px 40px;text-align:center;">
              <p style="margin:0;color:#FF6A00;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Atur Pintar</p>
              <p style="margin:6px 0 0;color:#8FA4C8;font-size:13px;">Financial Tracker</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1A1A1A;">⚠️ Langganan Segera Berakhir</p>
              <p style="margin:0 0 24px;font-size:15px;color:#64748B;line-height:1.6;">
                Halo <strong>${user.full_name || user.email}</strong>, langganan <strong>${planLabel}</strong> kamu akan berakhir dalam <strong>7 hari</strong>.
              </p>

              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF7F0;border:1px solid #FFD4B3;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#FF6A00;text-transform:uppercase;letter-spacing:0.5px;">Detail Langganan</p>
                    <p style="margin:0 0 4px;font-size:14px;color:#1A1A1A;">Paket: <strong>${planLabel}</strong></p>
                    <p style="margin:0;font-size:14px;color:#1A1A1A;">Berakhir: <strong>${endDateFormatted}</strong></p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;font-size:14px;color:#64748B;line-height:1.6;">
                Perpanjang sekarang agar kamu tidak kehilangan akses ke fitur-fitur Premium seperti AI Financial Coach, analitik lanjutan, dan laporan keuangan bulanan.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://app.aturpintar.id/Subscription" style="display:inline-block;background-color:#FF6A00;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:12px;">
                      Perpanjang Langganan
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#F8FAFC;padding:24px 40px;text-align:center;border-top:1px solid #E2E8F0;">
              <p style="margin:0;font-size:12px;color:#94A3B8;">Email ini dikirim otomatis oleh Atur Pintar. Jika kamu memiliki pertanyaan, balas email ini.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject: '⚠️ Langganan Atur Pintar Kamu Akan Berakhir dalam 7 Hari!',
        body: emailBody,
      });

      // Update last_reminder_sent_date on user
      await base44.asServiceRole.entities.User.update(user.id, {
        last_reminder_sent_date: today.toISOString().split('T')[0],
      });

      remindersSent++;
    }

    return Response.json({ success: true, reminders_sent: remindersSent });

  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});