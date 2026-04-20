import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { file_url } = await req.json();
  if (!file_url) return Response.json({ error: 'file_url required' }, { status: 400 });

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Kamu adalah sistem OCR untuk mutasi rekening bank Indonesia.
Ekstrak SEMUA transaksi dari gambar/dokumen mutasi rekening ini.
Kembalikan HANYA array JSON transaksi. Setiap transaksi harus memiliki field:
- date: tanggal dalam format YYYY-MM-DD (jika tahun tidak ada, gunakan tahun saat ini 2026)
- amount: angka nominal (tanpa titik/koma, hanya angka positif)
- type: "income" jika uang masuk/kredit, "expense" jika uang keluar/debit
- note: keterangan transaksi (bersihkan singkatan, tulis deskriptif)
- category: salah satu dari: food, transport, shopping, health, entertainment, housing, subscriptions, salary, freelance, transfer, other

Aturan:
- Abaikan baris saldo (saldo awal, saldo akhir)
- Abaikan header tabel
- Jika ada kolom debit/kredit terpisah, nilai di kolom debit = expense, kredit = income
- Jika nominal 0 atau kosong, lewati baris tersebut
- Kembalikan semua transaksi yang ada, jangan diringkas

Format output: {"transactions": [...]}`,
    file_urls: [file_url],
    response_json_schema: {
      type: "object",
      properties: {
        transactions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              date: { type: "string" },
              amount: { type: "number" },
              type: { type: "string" },
              note: { type: "string" },
              category: { type: "string" }
            }
          }
        }
      }
    }
  });

  return Response.json({ transactions: result.transactions || [] });
});