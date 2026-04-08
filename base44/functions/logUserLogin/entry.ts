import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Log the login
    await base44.asServiceRole.entities.SystemLog.create({
      log_type: 'login',
      action: 'user_login',
      user_email: user.email,
      severity: 'info',
      details: 'Login successful'
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error logging login:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});