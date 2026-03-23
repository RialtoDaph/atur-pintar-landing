import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all users and all AppSettings using service role
    const [users, allSettings] = await Promise.all([
      base44.asServiceRole.entities.User.list(),
      base44.asServiceRole.entities.AppSettings.list(),
    ]);

    // Map settings to users by created_by email
    const settingsByEmail = {};
    for (const s of allSettings) {
      if (s.created_by) settingsByEmail[s.created_by] = s;
    }

    const result = users.map(u => ({
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      role: u.role,
      created_date: u.created_date,
      settings: settingsByEmail[u.email] || null,
    }));

    return Response.json({ users: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});