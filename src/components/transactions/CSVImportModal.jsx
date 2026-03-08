import { useState, useRef } from "react";
import { X, Upload, FileText, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const FIELD_MAP_OPTIONS = [
  { key: "date", label: "Tanggal *", required: true },
  { key: "amount", label: "Jumlah *", required: true },
  { key: "note", label: "Catatan / Deskripsi", required: false },
  { key: "type", label: "Jenis (income/expense)", required: false },
  { key: "category", label: "Kategori", required: false },
];

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1)
    .filter(l => l.trim())
    .map(line => {
      const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
      const obj = {};
      headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
      return obj;
    });
  return { headers, rows };
}

function autoDetect(headers) {
  const map = { date: "", amount: "", note: "", type: "", category: "" };
  headers.forEach(h => {
    const lower = h.toLowerCase();
    if (!map.date && (lower.includes("date") || lower.includes("tanggal") || lower.includes("tgl"))) map.date = h;
    if (!map.amount && (lower.includes("amount") || lower.includes("nominal") || lower.includes("jumlah") || lower.includes("debit") || lower.includes("kredit"))) map.amount = h;
    if (!map.note && (lower.includes("note") || lower.includes("description") || lower.includes("keterangan") || lower.includes("catatan") || lower.includes("desc"))) map.note = h;
    if (!map.type && (lower.includes("type") || lower.includes("jenis") || lower.includes("tipe"))) map.type = h;
    if (!map.category && (lower.includes("category") || lower.includes("kategori") || lower.includes("cat"))) map.category = h;
  });
  return map;
}

const DEFAULT_CATEGORIES = {
  makanan: "food", makan: "food", food: "food",
  transportasi: "transport", transport: "transport", bensin: "transport",
  belanja: "shopping", shopping: "shopping",
  hiburan: "entertainment", entertainment: "entertainment",
  kesehatan: "health", health: "health",
  gaji: "salary", salary: "salary",
  freelance: "freelance",
  tabungan: "savings", savings: "savings",
  rumah: "housing", housing: "housing", kos: "housing",
};

function guessCategory(text) {
  if (!text) return "other";
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(DEFAULT_CATEGORIES)) {
    if (lower.includes(key)) return val;
  }
  return "other";
}

export default function CSVImportModal({ onClose, onSuccess }) {
  const [step, setStep] = useState("upload");
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({ date: "", amount: "", note: "", type: "", category: "" });
  const [typeDefault, setTypeDefault] = useState("expense");
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const fileRef = useRef();

  function handleFile(f) {
    if (!f || !f.name.endsWith(".csv")) {
      toast.error("Hanya file CSV yang didukung");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const { headers, rows } = parseCSV(e.target.result);
      if (headers.length === 0) { toast.error("File CSV tidak valid"); return; }
      setHeaders(headers);
      setRows(rows);
      setMapping(autoDetect(headers));
      setStep("map");
    };
    reader.readAsText(f);
  }

  async function handleImport() {
    if (!mapping.date || !mapping.amount) return;
    setImporting(true);
    const transactions = rows
      .filter(row => row[mapping.date] && row[mapping.amount])
      .map(row => {
        let type = typeDefault;
        if (mapping.type && row[mapping.type]) {
          const v = row[mapping.type].toLowerCase();
          if (v.includes("income") || v.includes("pemasukan") || v.includes("credit") || v.includes("kr")) type = "income";
          else type = "expense";
        }
        const rawAmt = (row[mapping.amount] || "0").replace(/[^0-9.,\-]/g, "").replace(/\./g, "").replace(",", ".");
        const amount = Math.abs(parseFloat(rawAmt)) || 0;
        const note = mapping.note ? row[mapping.note] : "";
        const catRaw = mapping.category ? row[mapping.category] : note;
        return { date: row[mapping.date], amount, note, type, category: guessCategory(catRaw) };
      })
      .filter(tx => tx.amount > 0);

    if (transactions.length === 0) {
      toast.error("Tidak ada data valid untuk diimpor");
      setImporting(false);
      return;
    }

    // Import in batches of 50
    const BATCH = 50;
    let total = 0;
    for (let i = 0; i < transactions.length; i += BATCH) {
      await base44.entities.Transaction.bulkCreate(transactions.slice(i, i + BATCH));
      total += Math.min(BATCH, transactions.length - i);
    }
    setImportedCount(total);
    setStep("done");
    setImporting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1A1A1A]">Import CSV</h2>
          <button onClick={onClose} className="text-[#9B9B9B] hover:text-[#1A1A1A]"><X className="w-5 h-5" /></button>
        </div>

        {step === "upload" && (
          <div>
            <div
              className="border-2 border-dashed border-[#E2E8F0] rounded-2xl p-10 text-center cursor-pointer hover:border-[#FF6A00] transition-colors group"
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
            >
              <Upload className="w-8 h-8 text-[#8FA4C8] group-hover:text-[#FF6A00] mx-auto mb-3 transition-colors" />
              <p className="font-semibold text-[#1A1A1A] mb-1">Upload file CSV</p>
              <p className="text-xs text-[#8FA4C8]">Drag & drop atau klik untuk pilih file</p>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            </div>

            <div className="mt-4 bg-[#FFF5EB] border border-[#FF6A00]/20 rounded-xl p-4">
              <p className="text-xs font-semibold text-[#FF6A00] mb-2">Format CSV yang direkomendasikan:</p>
              <code className="text-xs text-[#4A5568] bg-white rounded-lg px-3 py-2 block font-mono">
                date,amount,note,type<br/>
                2024-01-15,50000,Makan siang,expense<br/>
                2024-01-16,5000000,Gaji,income
              </code>
            </div>
          </div>
        )}

        {step === "map" && (
          <>
            <div className="flex items-center gap-2 mb-4 bg-[#F2F4F7] rounded-xl px-4 py-2.5">
              <FileText className="w-4 h-4 text-[#8FA4C8] flex-shrink-0" />
              <p className="text-sm text-[#4A5568]"><span className="font-semibold text-[#1A1A1A]">{rows.length}</span> baris ditemukan. Cocokkan kolom:</p>
            </div>

            <div className="space-y-3 mb-5">
              {FIELD_MAP_OPTIONS.map(field => (
                <div key={field.key}>
                  <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1.5 block">{field.label}</label>
                  <select
                    className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-[#F8FAFC]"
                    value={mapping[field.key]}
                    onChange={e => setMapping(m => ({ ...m, [field.key]: e.target.value }))}
                  >
                    <option value="">-- Tidak dipetakan --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}

              {!mapping.type && (
                <div>
                  <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1.5 block">Jenis Default</label>
                  <div className="flex gap-2">
                    {["expense", "income"].map(t => (
                      <button key={t} onClick={() => setTypeDefault(t)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${typeDefault === t ? "bg-[#FF6A00] text-white" : "bg-[#F2F4F7] text-[#4A5568] hover:bg-[#E2E8F0]"}`}>
                        {t === "expense" ? "Pengeluaran" : "Pemasukan"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            {mapping.date && mapping.amount && rows.length > 0 && (
              <div className="bg-[#F8FAFC] rounded-xl p-3 mb-5 max-h-36 overflow-y-auto">
                <p className="text-xs font-semibold text-[#8FA4C8] mb-2">Preview (5 baris pertama)</p>
                {rows.slice(0, 5).map((row, i) => (
                  <div key={i} className="text-xs text-[#4A5568] py-1.5 border-b border-[#E2E8F0] last:border-0 flex gap-3 flex-wrap">
                    {mapping.date && <span className="text-[#8FA4C8]">📅 <span className="text-[#1A1A1A]">{row[mapping.date]}</span></span>}
                    {mapping.amount && <span className="text-[#8FA4C8]">💰 <span className="text-[#1A1A1A] font-medium">Rp {row[mapping.amount]}</span></span>}
                    {mapping.note && row[mapping.note] && <span className="text-[#8FA4C8]">📝 <span className="text-[#1A1A1A]">{row[mapping.note]}</span></span>}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={importing || !mapping.date || !mapping.amount}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#FF6A00] disabled:opacity-40 hover:bg-[#e05e00] transition-colors"
            >
              {importing ? "Mengimpor..." : `Import ${rows.length} Transaksi`}
            </button>
          </>
        )}

        {step === "done" && (
          <div className="text-center py-8">
            <CheckCircle className="w-14 h-14 text-[#00C9A7] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Import Berhasil!</h3>
            <p className="text-[#8FA4C8] text-sm mb-6"><span className="font-semibold text-[#1A1A1A]">{importedCount}</span> transaksi berhasil diimpor ke akunmu.</p>
            <button onClick={() => { onSuccess(); onClose(); }}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#FF6A00] hover:bg-[#e05e00] transition-colors">
              Lihat Transaksi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}