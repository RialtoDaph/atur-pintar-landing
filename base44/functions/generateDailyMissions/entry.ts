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

    if (existingMissions && existingMissions.length >= 3) {
      return Response.json({ message: 'Missions already generated for today', count: existingMissions.length });
    }

    // Create missions for today
    const missionsToCreate = DAILY_MISSIONS.map(m => ({
      date: today,
      mission_key: m.mission_key,
      title: m.title,
      icon: m.icon,
      xp_reward: m.xp_reward,
      is_completed: false,
    }));

    await base44.entities.DailyMission.bulkCreate(missionsToCreate);

    return Response.json({ success: true, message: 'Daily missions generated', count: missionsToCreate.length });
  } catch (error) {
    console.error('Error generating daily missions:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});