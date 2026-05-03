import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Scheduled job: hapus NanaConversation records yang lebih dari 90 hari
// Mencegah query lambat & DB bloat untuk user aktif

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow admin OR scheduled invocation
    const user = await base44.auth.me().catch(() => null);
    const isScheduled = !user; // scheduled tasks run without user context
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    const cutoffISO = cutoffDate.toISOString().slice(0, 10);

    // Fetch old records via service role
    const oldRecords = await base44.asServiceRole.entities.NanaConversation.filter({
      session_date: { $lt: cutoffISO }
    }, '-created_date', 1000).catch(() => []);

    let deleted = 0;
    for (const rec of oldRecords) {
      try {
        await base44.asServiceRole.entities.NanaConversation.delete(rec.id);
        deleted++;
      } catch {
        // skip failed deletions
      }
    }

    // Log cleanup
    await base44.asServiceRole.entities.SystemLog.create({
      log_type: 'activity',
      action: 'cleanup_old_nana_conversations',
      details: `Deleted ${deleted} NanaConversation records older than ${cutoffISO}`,
      severity: 'info',
    }).catch(() => {});

    return Response.json({
      success: true,
      deleted,
      cutoff_date: cutoffISO,
      triggered_by: isScheduled ? 'scheduled' : user?.email
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});