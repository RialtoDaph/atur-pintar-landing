/**
 * completeDailyMission — entity automation handler
 * Triggered on Transaction.create or NanaConversation.create
 * Marks the relevant DailyMission as completed and awards XP.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const entityName = payload?.event?.entity_name;
    const eventType = payload?.event?.type;
    const data = payload?.data;

    if (eventType !== 'create' || !data) {
      return Response.json({ skipped: true });
    }

    const userEmail = data.created_by;
    if (!userEmail) return Response.json({ skipped: true, reason: 'no user' });

    // Determine which mission key to complete
    let missionKey = null;
    if (entityName === 'Transaction') {
      missionKey = 'catat_transaksi';
    } else if (entityName === 'NanaConversation' && data.role === 'user') {
      missionKey = 'tanya_nana';
    }

    if (!missionKey) return Response.json({ skipped: true, reason: 'no matching mission' });

    const today = new Date().toISOString().slice(0, 10);

    // Find today's mission for this user
    const missions = await base44.asServiceRole.entities.DailyMission.filter({
      created_by: userEmail,
      date: today,
      mission_key: missionKey,
      is_completed: false,
    });

    if (!missions || missions.length === 0) {
      return Response.json({ skipped: true, reason: 'mission already completed or not found' });
    }

    const mission = missions[0];

    // Mark mission completed (auto-complete only — XP is owned exclusively by
    // processGamification when user taps the mission card, to avoid double-counting
    // with the transaction_created / nana_message_sent triggers.
    await base44.asServiceRole.entities.DailyMission.update(mission.id, { is_completed: true });

    return Response.json({ success: true, mission_key: missionKey, auto_completed: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});