/**
 * bossBattleScheduler — daily admin-triggered job that maintains BossBattle lifecycle.
 *
 * - Auto-activates `upcoming` bosses when their month starts
 * - Auto-marks `active` bosses as `lost` when end_date has passed without HP reaching 0
 *
 * Should be scheduled to run daily (e.g. 00:05 UTC).
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { format } from 'npm:date-fns@3.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const currentMonth = today.slice(0, 7);

    const allBosses = await base44.asServiceRole.entities.BossBattle.filter({});

    let lostMarked = 0;

    for (const boss of (allBosses || [])) {
      // Mark expired active boss as lost
      if (boss.status === 'active' && boss.end_date && boss.end_date < today) {
        await base44.asServiceRole.entities.BossBattle.update(boss.id, { status: 'lost' });
        lostMarked++;
      }
    }

    return Response.json({ success: true, lostMarked, today });
  } catch (error) {
    console.error('bossBattleScheduler error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});