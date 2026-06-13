import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Sends an email to the user when their feedback report gets a response or status change.
// Invoked by the "FeedbackReport response notifier" entity automation on update events
// where admin_response or status changed.

const STATUS_LABEL = {
  open: { id: "Dibuka", emoji: "📬" },
  in_review: { id: "Sedang Diproses", emoji: "🔍" },
  resolved: { id: "Selesai", emoji: "✅" },
  wont_fix: { id: "Tidak Diproses", emoji: "🚫" },
};

const TYPE_LABEL = {
  bug: "🐛 Bug",
  suggestion: "💡 Saran",
  praise: "💖 Apresiasi",
  other: "📝 Lainnya",
};

function escapeHtml(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildEmailBody({ feedback, statusChanged, responseChanged }) {
  const status = STATUS_LABEL[feedback.status] || STATUS_LABEL.open;
  const typeLabel = TYPE_LABEL[feedback.type] || TYPE_LABEL.other;
  const name = feedback.user_name || "kamu";
  const title = escapeHtml(feedback.title || "Laporan kamu");
  const response = feedback.admin_response ? escapeHtml(feedback.admin_response) : "";

  const headline = responseChanged
    ? "Tim Atur Pintar membalas laporan kamu"
    : statusChanged
    ? `Status laporan kamu diperbarui jadi: ${status.id}`
    : "Update laporan kamu";

  return `
<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#F2F4F7;font-family:'Inter',Arial,sans-serif;color:#1A1A1A;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="background:#0A0A0A;border-radius:16px 16px 0 0;padding:20px 24px;">
      <p style="margin:0;color:#F97316;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Atur Pintar</p>
      <h1 style="margin:6px 0 0;color:#fff;font-size:20px;font-weight:800;">${escapeHtml(headline)}</h1>
    </div>
    <div style="background:#fff;border-radius:0 0 16px 16px;padding:24px;">
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Halo <strong>${escapeHtml(name)}</strong>, terima kasih sudah melaporkan masukan untuk Atur Pintar 🙏</p>

      <div style="background:#F2F4F7;border-radius:12px;padding:14px 16px;margin-bottom:16px;">
        <p style="margin:0 0 4px;font-size:11px;color:#8FA4C8;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">${typeLabel}</p>
        <p style="margin:0;font-size:15px;font-weight:700;color:#1A1A1A;">${title}</p>
        <p style="margin:8px 0 0;font-size:13px;color:#4A5568;">Status: <strong style="color:#1A1A1A;">${status.emoji} ${status.id}</strong></p>
      </div>

      ${response ? `
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#8FA4C8;text-transform:uppercase;letter-spacing:0.5px;">Balasan tim:</p>
      <div style="background:#FFF7ED;border-left:3px solid #F97316;border-radius:8px;padding:14px 16px;margin-bottom:20px;">
        <p style="margin:0;font-size:14px;line-height:1.6;color:#1A1A1A;white-space:pre-wrap;">${response}</p>
      </div>
      ` : ""}

      <p style="margin:0 0 20px;font-size:13px;line-height:1.6;color:#4A5568;">
        Masukan kamu sangat membantu kami terus memperbaiki Atur Pintar. Kalau masih ada yang ingin disampaikan, balas saja melalui fitur Feedback di aplikasi.
      </p>

      <p style="margin:0;font-size:12px;color:#8FA4C8;">— Tim Atur Pintar</p>
    </div>
    <p style="text-align:center;font-size:11px;color:#8FA4C8;margin:16px 0 0;">PT Rideff Vreka Tech · Email otomatis, jangan dibalas langsung.</p>
  </div>
</body></html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));

    // The automation sends event + data + old_data. If payload_too_large, fetch fresh.
    let feedback = payload?.data;
    const oldData = payload?.old_data || {};
    if (payload?.payload_too_large && payload?.event?.entity_id) {
      feedback = await base44.asServiceRole.entities.FeedbackReport.get(payload.event.entity_id);
    }

    if (!feedback) {
      return Response.json({ skipped: true, reason: "no feedback data" });
    }

    const email = feedback.user_email || feedback.created_by;
    if (!email) {
      return Response.json({ skipped: true, reason: "no recipient email" });
    }

    // Decide what changed — automation may fire for unrelated field updates too.
    const responseChanged =
      (feedback.admin_response || "") !== (oldData.admin_response || "") &&
      !!feedback.admin_response;
    const statusChanged =
      (feedback.status || "") !== (oldData.status || "") &&
      feedback.status !== "open";

    if (!responseChanged && !statusChanged) {
      return Response.json({ skipped: true, reason: "no meaningful change" });
    }

    const status = STATUS_LABEL[feedback.status] || STATUS_LABEL.open;
    const subject = responseChanged
      ? `Tim Atur Pintar membalas: ${feedback.title || "laporan kamu"}`
      : `Update laporan kamu: ${status.id} ${status.emoji}`;

    const body = buildEmailBody({ feedback, statusChanged, responseChanged });

    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: "Atur Pintar",
      to: email,
      subject,
      body,
    });

    return Response.json({ success: true, sent_to: email, responseChanged, statusChanged });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});