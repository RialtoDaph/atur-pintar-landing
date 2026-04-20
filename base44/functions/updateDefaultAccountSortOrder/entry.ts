import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SORT_ORDER_MAP = {
  // BANK
  "BCA": 1,
  "Mandiri": 2,
  "BNI": 3,
  "BRI": 4,
  "CIMB": 5,
  "Jenius": 6,
  "SeaBank": 7,
  "BSI": 8,
  "BTN": 9,
  "Danamon": 10,
  "Permata": 11,
  "Maybank": 12,
  "Blu by BCA": 13,
  "Jago": 14,
  "Rekening Lainnya": 15,
  // EWALLET
  "GoPay": 20,
  "OVO": 21,
  "DANA": 22,
  "ShopeePay": 23,
  "LinkAja": 24,
  "PayPal": 25,
  "iSaku": 26,
  "E-Wallet Lainnya": 27,
  // CASH
  "Dompet Cash": 30,
  "Celengan": 31,
  "Kas Rumah": 32,
  "Uang Arisan": 33,
  "Cash Lainnya": 34,
  // INVESTASI
  "Bibit": 40,
  "Ajaib": 41,
  "Stockbit": 42,
  "Bareksa": 43,
  "Pluang": 44,
  "Reksadana": 45,
  "Investasi Lainnya": 46
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const accounts = await base44.asServiceRole.entities.DefaultAccount.list();
    
    let updated = 0;
    for (const acc of (accounts || [])) {
      const newSort = SORT_ORDER_MAP[acc.name];
      if (newSort !== undefined && newSort !== acc.sort_order) {
        await base44.asServiceRole.entities.DefaultAccount.update(acc.id, { sort_order: newSort });
        updated++;
      }
    }

    return Response.json({ 
      success: true, 
      message: `Updated ${updated} default accounts with new sort_order`,
      totalAccounts: accounts.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});