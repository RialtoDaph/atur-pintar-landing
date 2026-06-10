import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, success_redirect_url, failure_redirect_url } = await req.json();

    if (!plan || !['premium_monthly', 'premium_yearly'].includes(plan)) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Read price from AppConfig (admin-controlled)
    let monthlyPrice = 49000;
    let yearlyPrice = 399900;
    try {
      const configs = await base44.asServiceRole.entities.AppConfig.list();
      if (configs && configs.length > 0) {
        monthlyPrice = configs[0].premium_price_monthly || 49000;
        yearlyPrice = configs[0].premium_price_yearly || 399900;
      }
    } catch (e) {
      console.warn('Could not read AppConfig, using defaults');
    }

    const amount = plan === 'premium_monthly' ? monthlyPrice : yearlyPrice;

    // Reuse pending invoice if still valid (< 24 jam, same plan)
    const existingPending = await base44.asServiceRole.entities.SubscriptionPayment.filter({
      user_email: user.email,
      status: 'pending',
    });

    if (existingPending.length > 0 && existingPending[0].xendit_invoice_url) {
      const existing = existingPending[0];
      const ageHours = (Date.now() - new Date(existing.created_date).getTime()) / (1000 * 60 * 60);
      if (ageHours < 24 && existing.plan === plan) {
        return Response.json({
          invoice_url: existing.xendit_invoice_url,
          invoice_id: existing.xendit_invoice_id,
          external_id: existing.xendit_external_id,
        });
      }
      await base44.asServiceRole.entities.SubscriptionPayment.update(existing.id, { status: 'expired' });
    }

    const userIdSafe = (user.id || user.email || 'anon').toString().slice(0, 8);
    const externalId = `AP-${userIdSafe}-${Date.now()}`;
    const secretKey = Deno.env.get('XENDIT_SECRET_KEY');
    if (!secretKey) {
      return Response.json({ error: 'XENDIT_SECRET_KEY not set' }, { status: 500 });
    }
    const auth = btoa(`${secretKey}:`);

    const planLabel = plan === 'premium_monthly' ? 'Atur Pintar Premium Bulanan' : 'Atur Pintar Premium Tahunan';

    const body = {
      external_id: externalId,
      amount: amount,
      currency: 'IDR',
      description: planLabel,
      payer_email: user.email,
      customer: {
        given_names: user.full_name || user.email,
        email: user.email,
      },
      items: [{
        name: planLabel,
        quantity: 1,
        price: amount,
        category: 'Digital Subscription',
      }],
      success_redirect_url: success_redirect_url || undefined,
      failure_redirect_url: failure_redirect_url || undefined,
      invoice_duration: 86400, // 24 jam
    };

    const xenditRes = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` },
      body: JSON.stringify(body),
    });

    const invoice = await xenditRes.json();

    if (!xenditRes.ok || !invoice.id || !invoice.invoice_url) {
      console.error('Xendit error:', invoice);
      return Response.json({ error: 'Failed to create invoice', detail: invoice }, { status: 500 });
    }

    await base44.asServiceRole.entities.SubscriptionPayment.create({
      user_email: user.email,
      user_name: user.full_name,
      plan: plan,
      amount: amount,
      status: 'pending',
      provider: 'xendit',
      xendit_external_id: externalId,
      xendit_invoice_id: invoice.id,
      xendit_invoice_url: invoice.invoice_url,
    });

    return Response.json({
      invoice_url: invoice.invoice_url,
      invoice_id: invoice.id,
      external_id: externalId,
    });

  } catch (error) {
    console.error('createXenditInvoice error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});