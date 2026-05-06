import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { note, type = 'expense' } = body;
  if (!note) return Response.json({ category: null });

  const noteLower = note.toLowerCase().trim();

  // 1. Check user's CategoryLearning (personalized learning)
  const learns = await base44.entities.CategoryLearning.filter({ created_by: user.email }).catch(() => []);

  // Sort by count descending for best match first
  const sortedLearns = (learns || []).sort((a, b) => (b.count || 1) - (a.count || 1));

  for (const learn of sortedLearns) {
    if (learn.note_fragment && noteLower.includes(learn.note_fragment.toLowerCase())) {
      // Return both keys for frontend compatibility — `category` is the key/id learned previously,
      // `category_name` left null since learning stores ID not display name.
      return Response.json({ category: learn.category, category_name: null, source: 'learning', confidence: Math.min(learn.count / 5, 1) });
    }
  }

  // 2. Rule-based matching for common Indonesian merchants/expenses
  const rules = [
    // Food & Beverage
    { keywords: ['mcdonald', 'kfc', 'burger', 'pizza', 'ayam', 'makan', 'restoran', 'warung', 'cafe', 'kopi', 'starbucks', 'gofood', 'grabfood', 'shopeefood', 'ojek', 'nasi', 'mie', 'soto', 'bakso', 'sushi', 'ramen'], catName: 'Makan & Minum' },
    // Transport
    { keywords: ['gojek', 'grab', 'maxim', 'ojol', 'bensin', 'pertamax', 'pertalite', 'shell', 'parkir', 'tol', 'busway', 'transjakarta', 'krl', 'mrt', 'commuter', 'tiket kereta', 'kereta'], catName: 'Transportasi' },
    // Shopping
    { keywords: ['tokopedia', 'shopee', 'lazada', 'blibli', 'bukalapak', 'tiktok shop', 'amazon', 'belanja', 'beli'], catName: 'Belanja' },
    // Utilities & Bills
    { keywords: ['pln', 'listrik', 'air', 'pdam', 'gas', 'internet', 'wifi', 'indihome', 'firstmedia', 'myrepublic', 'tagihan'], catName: 'Tagihan & Utilitas' },
    // Subscriptions
    { keywords: ['netflix', 'spotify', 'youtube premium', 'disney', 'viu', 'vidio', 'iflix', 'appleone', 'apple music', 'google one', 'icloud', 'canva', 'adobe', 'chatgpt', 'openai', 'zoom', 'microsoft'], catName: 'Langganan Digital' },
    // Health
    { keywords: ['apotik', 'apotek', 'obat', 'dokter', 'rumah sakit', 'rs ', 'klinik', 'farmasi', 'vitamin', 'kesehatan'], catName: 'Kesehatan' },
    // Entertainment
    { keywords: ['bioskop', 'cgv', 'xxi', 'cinema', 'hiburan', 'konser', 'game', 'steam', 'playstation', 'xbox'], catName: 'Hiburan' },
    // Education
    { keywords: ['kursus', 'bimbel', 'sekolah', 'spp', 'kuliah', 'kampus', 'udemy', 'coursera', 'ruangguru', 'zenius', 'pendidikan', 'les '], catName: 'Pendidikan' },
    // Groceries
    { keywords: ['indomaret', 'alfamart', 'supermarket', 'hypermart', 'giant', 'hero', 'carrefour', 'transmart', 'lottemart', 'superindo', 'ranch market', 'sayur', 'buah'], catName: 'Belanja Bulanan' },
    // Insurance & Finance
    { keywords: ['asuransi', 'premi', 'polis', 'bpjs', 'cicilan', 'kredit', 'angsuran', 'leasing'], catName: 'Asuransi & Keuangan' },
    // Income
    { keywords: ['gaji', 'salary', 'bonus', 'thr', 'transfer masuk', 'freelance', 'honor', 'fee proyek'], catName: 'Gaji & Penghasilan' },
  ];

  for (const rule of rules) {
    if (rule.keywords.some(k => noteLower.includes(k))) {
      return Response.json({ category_name: rule.catName, source: 'rules', confidence: 0.75 });
    }
  }

  // 3. Use AI as fallback for unrecognized transactions.
  // Wrap in try/catch so an LLM outage doesn't 500 the whole categorize call —
  // frontend can still proceed with the "Lainnya" default.
  const prompt = `Kamu adalah asisten kategorisasi transaksi keuangan di Indonesia.
Tentukan kategori yang paling tepat untuk transaksi berikut:
- Catatan/Deskripsi: "${note}"
- Tipe: ${type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}

Pilih SATU dari kategori berikut dan balas HANYA nama kategorinya saja, tanpa penjelasan:
Makan & Minum, Transportasi, Belanja, Tagihan & Utilitas, Langganan Digital, Kesehatan, Hiburan, Pendidikan, Belanja Bulanan, Asuransi & Keuangan, Gaji & Penghasilan, Lainnya`;

  try {
    const aiResult = await base44.integrations.Core.InvokeLLM({ prompt });
    const aiCategory = typeof aiResult === 'string' ? aiResult.trim() : String(aiResult).trim();
    return Response.json({ category_name: aiCategory, source: 'ai', confidence: 0.65 });
  } catch (e) {
    return Response.json({ category_name: 'Lainnya', source: 'fallback', confidence: 0.3 });
  }
});