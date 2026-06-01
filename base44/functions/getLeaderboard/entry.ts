/**
 * getLeaderboard — service-role aggregation for Boss Battle leaderboard.
 *
 * Why backend: BossBattleContribution & GamificationProfile have RLS that filter
 * by created_by — calling .list() from frontend returns only the current user's
 * rows. We need service role to aggregate across all users.
 *
 * Privacy: returns aggregated stats only, with email masked. No PII leaked.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function maskEmail(email) {
  if (!email) return 'Pengguna';
  const local = (email.split('@')[0] || '');
  if (local.length <= 4) return local + '@...';
  return local.slice(0, 3) + '***' + local.slice(-1) + '@...';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Aggregate total damage per user across all bosses (service role bypasses RLS)
    const [contribs, profiles] = await Promise.all([
      base44.asServiceRole.entities.BossBattleContribution.list('-updated_date', 1000).catch(() => []),
      base44.asServiceRole.entities.GamificationProfile.list('-total_points', 500).catch(() => []),
    ]);

    const damageMap = {};
    for (const c of (contribs || [])) {
      if (!c.created_by) continue;
      if (!damageMap[c.created_by]) damageMap[c.created_by] = 0;
      damageMap[c.created_by] += (c.total_damage_all_time || c.damage_dealt || 0);
    }

    const profileMap = {};
    for (const p of (profiles || [])) {
      if (p.created_by && !profileMap[p.created_by]) profileMap[p.created_by] = p;
    }

    const myEmail = user.email;
    const entries = Object.entries(damageMap)
      .filter(([_, dmg]) => dmg > 0)
      .map(([email, totalDamage]) => ({
        email,
        isMe: email === myEmail,
        displayName: email === myEmail ? 'Kamu 👤' : maskEmail(email),
        totalDamage,
        xp: profileMap[email]?.total_points || 0,
        streak: profileMap[email]?.daily_streak || 0,
      }))
      .sort((a, b) => b.totalDamage - a.totalDamage)
      .slice(0, 20);

    // Strip email from response (we already exposed displayName + isMe)
    const safeEntries = entries.map(({ email: _e, ...rest }) => rest);

    const myRank = entries.findIndex(e => e.isMe);

    return Response.json({ success: true, entries: safeEntries, myRank });
  } catch (error) {
    console.error('getLeaderboard error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});