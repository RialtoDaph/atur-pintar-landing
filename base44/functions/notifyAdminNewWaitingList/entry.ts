import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data } = body;

    // Only handle create events
    if (event?.type !== 'create') {
      return Response.json({ ok: true });
    }

    const record = data || {};

    const createdAt = record.created_date
      ? new Date(record.created_date).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'full', timeStyle: 'short' })
      : new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'full', timeStyle: 'short' });

    const subject = `Pendaftar Baru Waiting List - ${record.name || 'Unknown'}`;

    const body_html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 12px;">
  <div style="background: #FF6A00; padding: 16px 24px; border-radius: 8px 8px 0 0; margin-bottom: 0;">
    <h2 style="color: white; margin: 0; font-size: 18px;">🎉 Pendaftar Baru Waiting List</h2>
    <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">Atur Pintar</p>
  </div>
  <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #eee;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px 0; color: #888; font-size: 13px; width: 40%;">Nama</td>
        <td style="padding: 10px 0; color: #111; font-size: 13px; font-weight: 600;">${record.name || '-'}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px 0; color: #888; font-size: 13px;">Email</td>
        <td style="padding: 10px 0; color: #111; font-size: 13px; font-weight: 600;">${record.email || '-'}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px 0; color: #888; font-size: 13px;">WhatsApp</td>
        <td style="padding: 10px 0; color: #111; font-size: 13px; font-weight: 600;">${record.whatsapp || '-'}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px 0; color: #888; font-size: 13px;">Kota</td>
        <td style="padding: 10px 0; color: #111; font-size: 13px; font-weight: 600;">${record.city || '-'}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px 0; color: #888; font-size: 13px;">Pekerjaan</td>
        <td style="padding: 10px 0; color: #111; font-size: 13px; font-weight: 600;">${record.job || '-'}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px 0; color: #888; font-size: 13px;">Cara mencatat</td>
        <td style="padding: 10px 0; color: #111; font-size: 13px; font-weight: 600;">${record.current_finance_tracking_method || '-'}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px 0; color: #888; font-size: 13px;">Minat early access</td>
        <td style="padding: 10px 0; color: #111; font-size: 13px; font-weight: 600;">${record.early_access_interest || '-'}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px 0; color: #888; font-size: 13px;">Masalah keuangan</td>
        <td style="padding: 10px 0; color: #111; font-size: 13px;">${record.biggest_money_problem || '-'}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #888; font-size: 13px;">Waktu daftar</td>
        <td style="padding: 10px 0; color: #111; font-size: 13px; font-weight: 600;">${createdAt}</td>
      </tr>
    </table>
  </div>
  <p style="text-align: center; color: #bbb; font-size: 11px; margin-top: 16px;">Notifikasi otomatis dari Atur Pintar</p>
</div>
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'aturpintar21@gmail.com',
      subject,
      body: body_html,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});