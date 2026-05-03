import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Delete orphaned service account AppSettings
    const serviceEmail = 'service+1c1a7794-cfa4-4c7a-8f36-4adc17f611f6@no-reply.base44.com';
    const orphaned = await base44.asServiceRole.entities.AppSettings.filter({ created_by: serviceEmail });
    for (const record of orphaned) {
      await base44.asServiceRole.entities.AppSettings.delete(record.id);
    }

    return Response.json({
      success: true,
      cleaned_orphaned: orphaned.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});