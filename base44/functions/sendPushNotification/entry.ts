// Send a Web Push notification to one user (or all their devices).
//
// Usage (from another backend function or the client):
//   await base44.functions.invoke('sendPushNotification', {
//     to_user_email: 'someone@example.com',   // OR to_user_id
//     title: 'Tagihan Netflix jatuh tempo besok',
//     body:  'Rp 186.000 · Jangan lupa siapkan saldo',
//     url:   '/Dashboard',                    // optional deep link
//     tag:   'reminder-netflix'               // optional dedupe tag
//   });
//
// Sends to every active PushSubscription owned by that user.
// Dead subscriptions (410/404) are auto-deactivated.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.35';
import webpush from 'npm:web-push@3.6.7';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me().catch(() => null);
    if (!caller) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const publicKey  = Deno.env.get('VAPID_PUBLIC_KEY');
    const privateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const subject    = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@aturpintar.id';
    if (!publicKey || !privateKey) {
      return Response.json({ error: 'VAPID keys not configured' }, { status: 500 });
    }
    webpush.setVapidDetails(subject, publicKey, privateKey);

    const body = await req.json().catch(() => ({}));
    const { to_user_email, to_user_id, title, body: msgBody, url, tag, icon } = body || {};

    if (!title) return Response.json({ error: 'title is required' }, { status: 400 });

    // Resolve target user. Non-admins can only send to themselves.
    let targetEmail = to_user_email || caller.email;
    let targetId = to_user_id || null;
    if (caller.role !== 'admin' && targetEmail !== caller.email && targetId !== caller.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch subscriptions for target user via service role (admin sending to another user).
    const filter: Record<string, any> = { is_active: true };
    if (targetId) filter.created_by_id = targetId;
    else filter.created_by = targetEmail;

    const subs = await base44.asServiceRole.entities.PushSubscription.filter(filter);
    if (!subs || subs.length === 0) {
      return Response.json({ ok: true, sent: 0, note: 'no active subscriptions' });
    }

    const payload = JSON.stringify({
      title,
      body: msgBody || '',
      url: url || '/Dashboard',
      tag: tag || 'aturpintar-notif',
      icon: icon || undefined,
    });

    let sent = 0;
    let failed = 0;
    const deactivated: string[] = [];

    await Promise.all(subs.map(async (s: any) => {
      const subObj = {
        endpoint: s.endpoint,
        keys: { p256dh: s.p256dh, auth: s.auth },
      };
      try {
        await webpush.sendNotification(subObj, payload, { TTL: 60 });
        sent++;
        // Best-effort last_used_at (ignore errors)
        base44.asServiceRole.entities.PushSubscription.update(s.id, {
          last_used_at: new Date().toISOString(),
        }).catch(() => {});
      } catch (err: any) {
        failed++;
        const status = err?.statusCode;
        // 404/410 = gone → subscription is dead, deactivate it
        if (status === 404 || status === 410) {
          deactivated.push(s.id);
          await base44.asServiceRole.entities.PushSubscription.update(s.id, { is_active: false }).catch(() => {});
        }
      }
    }));

    return Response.json({ ok: true, sent, failed, deactivated: deactivated.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});