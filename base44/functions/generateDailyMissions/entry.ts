import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { format } from 'npm:date-fns@3.0.0';

const DAILY_MISSIONS = [
  { mission_key: "catat_transaksi", title: "Catat Transaksi", icon: "📝", xp_reward: 10 },
  { mission_key: "cek_budget", title: "Cek Budget", icon: "📊", xp_reward: 10 },
  { mission_key: "tanya_nana", title: "Tanya Nana AI", icon: "💬", xp_reward: 10 },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = format(new Date(), "yyyy-MM-dd");

    // Check if missions for today already exist
    const existingMissions = await base44.entities.DailyMission.filter({
      created_by: user.email,
      date: today,
    }).catch(() => []);

    // Only create missions whose mission_key is missing for today.
    // Without this guard, partially-existing days got duplicate missions
    // (e.g. 1 already there → bulkCreate 3 more → 4 total).
    const existingKeys = new Set((existingMissions || []).map(m => m.mission_key));
    const missionsToCreate = DAILY_MISSIONS
      .filter(m => !existingKeys.has(m.mission_key))
      .map(m => ({
        date: today,
        mission_key: m.mission_key,
        title: m.title,
        icon: m.icon,
        xp_reward: m.xp_reward,
        is_completed: false,
      }));

    if (missionsToCreate.length === 0) {
      return Response.json({ message: 'All missions already generated for today', count: existingMissions.length });
    }

    await base44.entities.DailyMission.bulkCreate(missionsToCreate);

    return Response.json({ success: true, message: 'Daily missions generated', count: missionsToCreate.length });
  } catch (error) {
    console.error('Error generating daily missions:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});