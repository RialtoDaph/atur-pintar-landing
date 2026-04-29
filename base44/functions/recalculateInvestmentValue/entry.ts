import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { investment_id } = await req.json();

    if (!investment_id) {
      return Response.json({ error: 'investment_id required' }, { status: 400 });
    }

    // Get investment
    const investment = await base44.entities.Investment.list().then(items =>
      items.find(i => i.id === investment_id && i.created_by === user.email)
    );

    if (!investment) {
      return Response.json({ error: 'Investment not found' }, { status: 404 });
    }

    // Get all transactions for this investment
    const transactions = await base44.entities.InvestmentTransaction.filter({
      investment_id: investment_id,
    }).catch(() => []);

    // Calculate current_value
    let current_value = investment.initial_amount || 0;

    for (const tx of transactions || []) {
      if (tx.type === 'buy') {
        current_value += tx.total_amount || 0;
      } else if (tx.type === 'sell') {
        current_value -= tx.total_amount || 0;
      } else if (tx.type === 'dividend') {
        current_value += tx.total_amount || 0;
      } else if (tx.type === 'adjustment') {
        current_value = tx.total_amount || 0;
      }
    }

    // Update investment
    await base44.entities.Investment.update(investment_id, { current_value });

    return Response.json({
      success: true,
      investment_id,
      current_value,
      transaction_count: transactions?.length || 0,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});