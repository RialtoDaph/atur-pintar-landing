import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const notification = await req.json();

    const { order_id, transaction_status, fraud_status, gross_amount, signature_key, status_code } = notification;

    // Verifikasi signature dari Midtrans (constant-time compare)
    const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY");
    const expectedSignature = await sha512(`${order_id}${status_code}${gross_amount}${serverKey}`);

    if (!signature_key || !timingSafeEqual(signature_key, expectedSignature)) {
      console.error("Invalid signature for order:", order_id);
      return Response.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // Cari record pembayaran
    const payments = await base44.asServiceRole.entities.SubscriptionPayment.filter({
      midtrans_order_id: order_id
    });

    if (payments.length === 0) {
      console.error("Order not found:", order_id);
      return Response.json({ message: 'Order not found' }, { status: 404 });
    }

    const payment = payments[0];

    // Idempotency: jika sudah approved, jangan proses ulang
    if (payment.status === 'approved') {
      return Response.json({ message: 'Already processed' });
    }

    let newStatus = payment.status;

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept' || !fraud_status) {
        newStatus = 'approved';
      }
    } else if (['deny', 'cancel', 'expire'].includes(transaction_status)) {
      newStatus = 'rejected';
    }

    // Update status pembayaran
    await base44.asServiceRole.entities.SubscriptionPayment.update(payment.id, {
      status: newStatus,
      approved_at: newStatus === 'approved' ? new Date().toISOString().split('T')[0] : payment.approved_at,
    });

    // Jika approved, update user subscription
    if (newStatus === 'approved') {
      const endDate = new Date();
      if (payment.plan === 'premium_monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // Cari user berdasarkan email
      const users = await base44.asServiceRole.entities.User.filter({ email: payment.user_email });
      if (users.length > 0) {
        await base44.asServiceRole.entities.User.update(users[0].id, {
          subscription_status: 'active',
          subscription_plan: payment.plan,
          subscription_end_date: endDate.toISOString().split('T')[0],
        });
      }

      // Buat/update Subscription entity — gunakan amount aktual dari payment (bukan hardcoded)
      const existingSubs = await base44.asServiceRole.entities.Subscription.filter({ name: 'Atur Pintar Premium', created_by: payment.user_email }).catch(() => []);
      const subData = {
        name: 'Atur Pintar Premium',
        icon: '⭐',
        amount: payment.amount,
        billing_cycle: payment.plan === 'premium_monthly' ? 'monthly' : 'yearly',
        next_due_date: endDate.toISOString().split('T')[0],
        status: 'active',
      };
      if (existingSubs.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(existingSubs[0].id, subData).catch(() => {});
      } else {
        await base44.asServiceRole.entities.Subscription.create({ ...subData, created_by: payment.user_email }).catch(() => {});
      }

      // Audit log: payment success
      base44.asServiceRole.entities.SystemLog.create({
        log_type: 'activity',
        user_email: payment.user_email,
        action: 'subscription_payment_approved',
        entity_type: 'SubscriptionPayment',
        entity_id: payment.id,
        severity: 'info',
        details: `Payment approved via Midtrans: ${payment.plan}, amount=${payment.amount}, order_id=${order_id}`,
      }).catch(() => {});

      // Kirim email notifikasi
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: payment.user_email,
        subject: 'Pembayaran Berhasil - Atur Pintar Premium',
        body: `<p>Halo ${payment.user_name || payment.user_email},</p><p>Pembayaran langganan Premium Atur Pintar kamu berhasil! Akses premium kamu sudah aktif.</p><p>Terima kasih!</p>`,
        from_name: 'Atur Pintar',
      });
    }

    return Response.json({ message: 'OK' });

  } catch (error) {
    console.error("Webhook error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function sha512(str) {
  const buf = await crypto.subtle.digest('SHA-512', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}