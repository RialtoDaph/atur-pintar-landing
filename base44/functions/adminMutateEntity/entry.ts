import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const ALLOWED_ENTITIES = ['Transaction', 'SavingsGoal', 'Budget', 'Debt', 'Reminder'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { operation, entity, id, data } = await req.json();

    if (!ALLOWED_ENTITIES.includes(entity)) {
      return Response.json({ error: 'Entity not allowed' }, { status: 400 });
    }

    const repo = base44.asServiceRole.entities[entity];

    if (operation === 'update') {
      const result = await repo.update(id, data);
      return Response.json({ success: true, result });
    }

    if (operation === 'delete') {
      await repo.delete(id);
      return Response.json({ success: true });
    }

    if (operation === 'create') {
      const result = await repo.create(data);
      return Response.json({ success: true, result });
    }

    return Response.json({ error: 'Invalid operation' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});