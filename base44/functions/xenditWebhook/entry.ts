import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Verify Xendit callback token (from header)
    const callbackToken = req.headers.get('x-callback-token') || req.headers.get('X-Callback-Token');
    const expectedToken = Deno.env.get('XENDIT_WEBHOOK_TOKEN');

    if (!expectedToken) {
      console.error('XENDIT_WEBHOOK_TOKEN not set');
      return Response.json({ error: 'Server misconfigured' }, { status: 500 });
    }
    if (!callbackToken || callbackToken !== expectedToken) {
      console.error('Invalid Xendit callback token');
      return Response.json({ error: 'Invalid token' }, { status: 403 });
    }

    const notification = await req.json();
    const { id: invoice_id, external_id, status, paid_at } = notification;

    if (!invoice_id && !external_id) {
      return Response.json({ error: 'Missing invoice identifiers' }, { status: 400 });
    }

    // Find payment record by xendit_invoice_id (preferred) or external_id
    let payments = [];
    if (invoice_id) {
      payments = await base44.asServiceRole.entities.SubscriptionPayment.filter({ xendit_invoice_id: invoice_id });
    }
    if (payments.length === 0 && external_id) {
      payments = await base44.asServiceRole.entities.SubscriptionPayment.filter({ xendit_external_id: external_id });
    }

    if (payments.length === 0) {
      console.error('Invoice not found:', invoice_id, external_id);
      return Response.json({ message: 'Invoice not found' }, { status: 404 });
    }

    const payment = payments[0];

    // Idempotency: already approved? skip
    if (payment.status === 'approved') {
      return Response.json({ message: 'Already processed' });
    }

    // Map Xendit status → internal status
    let newStatus = payment.status;
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper === 'PAID' || statusUpper === 'SETTLED') {
      newStatus = 'approved';
    } else if (statusUpper === 'EXPIRED' || statusUpper === 'FAILED') {
      newStatus = 'rejected';
    }

    await base44.asServiceRole.entities.SubscriptionPayment.update(payment.id, {
      status: newStatus,
      approved_at: newStatus === 'approved' ? new Date().toISOString().split('T')[0] : payment.approved_at,
    });

    // On approval → upgrade user + create/update Subscription entity + email
    if (newStatus === 'approved') {
      const endDate = new Date(paid_at || Date.now());
      if (payment.plan === 'premium_monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
      const endDateStr = endDate.toISOString().split('T')[0];

      // Update user subscription
      const users = await base44.asServiceRole.entities.User.filter({ email: payment.user_email });
      if (users.length > 0) {
        await base44.asServiceRole.entities.User.update(users[0].id, {
          subscription_status: 'active',
          subscription_plan: payment.plan,
          subscription_end_date: endDateStr,
        });
      }

      // Upsert Subscription entity (recurring tracker)
      const existingSubs = await base44.asServiceRole.entities.Subscription
        .filter({ name: 'Atur Pintar Premium', created_by: payment.user_email })
        .catch(() => []);
      const subData = {
        name: 'Atur Pintar Premium',
        icon: '⭐',
        amount: payment.amount,
        billing_cycle: payment.plan === 'premium_monthly' ? 'monthly' : 'yearly',
        next_due_date: endDateStr,
        status: 'active',
      };
      if (existingSubs.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(existingSubs[0].id, subData).catch(() => {});
      } else {
        await base44.asServiceRole.entities.Subscription.create({ ...subData, created_by: payment.user_email }).catch(() => {});
      }

      // Audit log
      base44.asServiceRole.entities.SystemLog.create({
        log_type: 'activity',
        user_email: payment.user_email,
        action: 'subscription_payment_approved',
        entity_type: 'SubscriptionPayment',
        entity_id: payment.id,
        severity: 'info',
        details: `Payment approved via Xendit: ${payment.plan}, amount=${payment.amount}, invoice_id=${invoice_id}`,
      }).catch(() => {});

      // Confirmation email
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: payment.user_email,
        subject: 'Pembayaran Berhasil - Atur Pintar Premium',
        body: `<p>Halo ${payment.user_name || payment.user_email},</p><p>Pembayaran langganan Premium Atur Pintar kamu berhasil! Akses premium kamu sudah aktif sampai <b>${endDateStr}</b>.</p><p>Terima kasih!</p>`,
        from_name: 'Atur Pintar',
      }).catch(() => {});
    }

    return Response.json({ message: 'OK' });

  } catch (error) {
    console.error('xenditWebhook error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});