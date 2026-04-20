import { useState, useRef } from "react";
import { X, Upload, CheckCircle, FileText, ImageIcon, Loader2, RefreshCw, ChevronRight, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { detectCategory } from "./bankCSVParser";

const STEPS = ["template", "upload", "map", "preview", "done"];
const STEP_LABELS = ["Bank/Wallet", "Upload", "Mapping", "Preview", "Selesai"];

const BANK_TEMPLATES = [
  { id: "auto", name: "Deteksi Otomatis", icon: "🔍", description: "Cocok untuk semua format" },
  { id: "bca", name: "BCA", icon: "🏦", description: "Mutasi rekening BCA" },
  { id: "mandiri", name: "Mandiri", icon: "🏦", description: "Mutasi rekening Mandiri" },
  { id: "bri", name: "BRI", icon: "🏦", description: "Mutasi rekening BRI" },
  { id: "bni", name: "BNI", icon: "🏦", description: "Mutasi rekening BNI" },
  { id: "gopay", name: "GoPay", icon: "💚", description: "Riwayat transaksi GoPay" },
  { id: "ovo", name: "OVO", icon: "💜", description: "Riwayat transaksi OVO" },
  { id: "dana", name: "DANA", icon: "💙", description: "Riwayat transaksi DANA" },
  { id: "shopee", name: "ShopeePay", icon: "🧡", description: "Riwayat transaksi ShopeePay" },
];

const CAT_EMOJI = {
  food: "🍔", transport: "🚗", shopping: "🛍️", health: "❤️",
  entertainment: "🎬", housing: "🏠", subscriptions: "📱",
  salary: "💼", freelance: "💻", transfer: "🔄", other: "📦"
};

function StepBar({ step }) {
  const idx = STEPS.indexOf(step);
  return (
    <div className="flex items-center gap-1 mb-5">
      {STEP_LABELS.map((l, i) => (
        <div key={l} className="flex items-center gap-1 flex-1">
          <div className={`flex-1 text-center text-[10px] font-semibold py-1 rounded-full transition-all ${i <= idx ? "bg-[#FF6A00] text-white" : "bg-[#F2F4F7] text-[#8FA4C8]"}`}>
            {l}
          </div>
          {i < STEP_LABELS.length - 1 && <ChevronRight className="w-3 h-3 text-[#CBD5E0] flex-shrink-0" />}
        </div>
      ))}
    </div>
  );
}

function MappingRow({ label, required, value, fields, onChange }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1 block">{label}{required && " *"}</label>
      <select
        className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-[#F8FAFC]"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">-- {required ? "Wajib dipilih" : "Tidak dipetakan"} --</option>
        {fields.map(f => <option key={f} value={f}>{f}</option>)}
      </select>
    </div>
  );
}

function CategorySummary({ transactions }) {
  const counts = transactions.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + 1;
    return acc;
  }, {});
  return (
    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 mb-4">
      <p className="text-[10px] font-bold text-[#8FA4C8] uppercase tracking-widest mb-2">Ringkasan Kategori</p>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([cat, count]) => (
          <div key={cat} className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold border bg-[#FFF5EB] border-[#FF6A00]/20 text-[#FF6A00]">
            <span>{CAT_EMOJI[cat] || "📦"}</span>
            <span>{cat}</span>
            <span className="bg-white/60 px-1 rounded-full text-[9px]">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PDFImportModal({ onClose, onSuccess }) {
  const [step, setStep] = useState("template");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  // AI-extracted raw fields (column names detected by AI)
  const [extractedFields, setExtractedFields] = useState([]); // array of field names
  const [extractedRows, setExtractedRows] = useState([]);     // array of row objects

  // mapping: field → extracted field name
  const [mapping, setMapping] = useState({ date: "", amount: "", debit: "", credit: "", note: "", type: "" });
  const [defaultType, setDefaultType] = useState("expense");

  const [preview, setPreview] = useState([]);
  const [previewErrors, setPreviewErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const fileRef = useRef();

  async function handleFile(file) {
    if (!file) return;
    const validExts = [".pdf", ".png", ".jpg", ".jpeg", ".webp"];
    if (!validExts.some(e => file.name.toLowerCase().endsWith(e))) {
      toast.error("Format tidak didukung. Gunakan PDF, PNG, atau JPG.");
      return;
    }
    setFileName(file.name);
    setLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFileUrl(file_url);

      // Ask AI to extract structured table from the file
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Kamu adalah OCR untuk mutasi rekening bank Indonesia.
Dari file ini, ekstrak SEMUA baris transaksi sebagai tabel terstruktur.
Kembalikan field "fields" berisi array nama kolom yang ada,
dan "rows" berisi array objek dengan pasangan key-value sesuai kolom tersebut.

PENTING:
- Sertakan kolom tanggal, nominal/debet/kredit, keterangan, dan jenis jika ada
- Jangan sertakan baris saldo, header, atau baris kosong
- Nominal hanya berisi angka (tanpa Rp, titik, koma)
- Jika ada 2 kolom nominal terpisah (debet & kredit), pertahankan keduanya
- Kembalikan semua baris transaksi yang ada

Format: { "fields": ["col1","col2",...], "rows": [{"col1": "val", ...}, ...] }`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            fields: { type: "array", items: { type: "string" } },
            rows: { type: "array", items: { type: "object", additionalProperties: true } }
          }
        }
      });

      const fields = result.fields || [];
      const rows = result.rows || [];

      if (fields.length === 0 || rows.length === 0) {
        toast.error("Tidak ada data transaksi yang berhasil dibaca.");
        setLoading(false);
        return;
      }

      setExtractedFields(fields);
      setExtractedRows(rows);

      // Auto-detect mapping
      const autoMap = { date: "", amount: "", debit: "", credit: "", note: "", type: "" };
      fields.forEach(f => {
        const lower = f.toLowerCase();
        if (!autoMap.date && (lower.includes("tanggal") || lower.includes("date") || lower.includes("tgl") || lower.includes("waktu"))) autoMap.date = f;
        if (!autoMap.debit && (lower.includes("debet") || lower.includes("debit") || lower === "keluar" || lower.includes("db"))) autoMap.debit = f;
        if (!autoMap.credit && (lower.includes("kredit") || lower.includes("credit") || lower === "masuk" || lower.includes("cr"))) autoMap.credit = f;
        if (!autoMap.amount && !autoMap.debit && (lower.includes("nominal") || lower.includes("jumlah") || lower.includes("amount") || lower === "nilai")) autoMap.amount = f;
        if (!autoMap.note && (lower.includes("keterangan") || lower.includes("deskripsi") || lower.includes("catatan") || lower.includes("description") || lower.includes("note") || lower.includes("merchant"))) autoMap.note = f;
        if (!autoMap.type && (lower === "type" || lower === "tipe" || lower.includes("jenis") || lower === "db/cr")) autoMap.type = f;
      });

      // Apply template hints
      if (selectedTemplate && selectedTemplate.id !== "auto") {
        const hints = {
          bca: { date: "Tanggal", note: "Keterangan", debit: "Debet", credit: "Kredit" },
          mandiri: { date: "Tanggal Transaksi", note: "Deskripsi Transaksi", debit: "Nominal Debet", credit: "Nominal Kredit" },
          bri: { date: "TANGGAL", note: "KETERANGAN", amount: "NOMINAL", type: "DB/CR" },
          bni: { date: "Tanggal", note: "Keterangan", debit: "Debit", credit: "Kredit" },
          gopay: { date: "Tanggal", note: "Keterangan", amount: "Nominal", type: "Jenis" },
          ovo: { date: "Date", note: "Description", amount: "Amount", type: "Type" },
          dana: { date: "Tanggal", note: "Keterangan", amount: "Nominal", type: "Tipe" },
          shopee: { date: "Waktu Transaksi", note: "Keterangan", amount: "Jumlah", type: "Tipe Transaksi" },
        }[selectedTemplate.id] || {};
        for (const [key, colName] of Object.entries(hints)) {
          if (fields.includes(colName)) autoMap[key] = colName;
        }
      }

      setMapping(autoMap);
      setStep("map");
    } catch (e) {
      toast.error("Gagal membaca file: " + e.message);
    }
    setLoading(false);
  }

  function buildPreview() {
    const results = [];
    const errors = [];

    extractedRows.forEach((row, idx) => {
      let amount = 0;
      let type = defaultType;

      if (mapping.debit && mapping.credit) {
        const db = parseFloat((row[mapping.debit] || "0").toString().replace(/[^0-9.]/g, "")) || 0;
        const cr = parseFloat((row[mapping.credit] || "0").toString().replace(/[^0-9.]/g, "")) || 0;
        if (db > 0) { amount = db; type = "expense"; }
        else if (cr > 0) { amount = cr; type = "income"; }
        else { errors.push(`Baris ${idx + 1}: jumlah kosong`); return; }
      } else if (mapping.amount) {
        amount = parseFloat((row[mapping.amount] || "0").toString().replace(/[^0-9.]/g, "")) || 0;
        if (mapping.type) {
          const tv = (row[mapping.type] || "").toLowerCase();
          const isIncome = tv.includes("cr") || tv.includes("kredit") || tv.includes("masuk") || tv.includes("income") || tv.includes("topup") || tv.includes("refund");
          type = isIncome ? "income" : "expense";
        }
      } else {
        errors.push(`Baris ${idx + 1}: kolom jumlah tidak dipetakan`);
        return;
      }

      if (amount <= 0) { errors.push(`Baris ${idx + 1}: jumlah tidak valid (${amount})`); return; }

      // Parse date
      let dateStr = mapping.date ? (row[mapping.date] || "") : "";
      let date = null;
      dateStr = dateStr.trim();
      if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) date = dateStr.slice(0, 10);
      else {
        const dmy = dateStr.match(/^(\d{1,2})[\/\-](\d{2})[\/\-](\d{4})/);
        if (dmy) date = `${dmy[3]}-${dmy[2].padStart(2,"0")}-${dmy[1].padStart(2,"0")}`;
      }
      if (!date) {
        const MMAP = { jan:"01",feb:"02",mar:"03",apr:"04",mei:"05",may:"05",jun:"06",jul:"07",agu:"08",aug:"08",sep:"09",okt:"10",oct:"10",nov:"11",des:"12",dec:"12" };
        const dm = dateStr.match(/^(\d{1,2})\s+([a-zA-Z]{3})\s+(\d{4})/);
        if (dm && MMAP[dm[2].toLowerCase()]) date = `${dm[3]}-${MMAP[dm[2].toLowerCase()]}-${dm[1].padStart(2,"0")}`;
      }
      if (!date) { errors.push(`Baris ${idx + 1}: format tanggal tidak dikenali (${dateStr})`); return; }

      const note = mapping.note ? (row[mapping.note] || "") : "";
      const category = detectCategory(note, type);
      results.push({ date, amount, type, note, category });
    });

    setPreview(results);
    setPreviewErrors(errors);
    setStep("preview");
  }

  async function handleImport() {
    if (preview.length === 0) return;
    setImporting(true);
    try {
      const BATCH = 50;
      let total = 0;
      for (let i = 0; i < preview.length; i += BATCH) {
        await base44.entities.Transaction.bulkCreate(preview.slice(i, i + BATCH));
        total += Math.min(BATCH, preview.length - i);
      }
      setImportedCount(total);
      setStep("done");
    } catch (e) {
      toast.error("Gagal mengimpor: " + e.message);
    }
    setImporting(false);
  }

  const canMap = mapping.date && (mapping.amount || mapping.debit || mapping.credit);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-xl shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 pt-5 pb-3 border-b border-[#F2F4F7]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[#1A1A1A]">Import Mutasi PDF / Screenshot</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-[#F2F4F7] rounded-lg transition-colors">
              <X className="w-4 h-4 text-[#8FA4C8]" />
            </button>
          </div>
          <StepBar step={step} />
        </div>

        <div className="px-6 pb-6 pt-4">

          {/* STEP 1: Pilih Bank/Wallet */}
          {step === "template" && (
            <div className="space-y-3">
              <p className="text-xs text-[#8FA4C8] mb-4">Pilih bank atau e-wallet untuk membantu pemetaan kolom otomatis.</p>
              <div className="grid grid-cols-2 gap-2.5">
                {BANK_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => { setSelectedTemplate(tpl); setStep("upload"); }}
                    className="flex items-center gap-3 p-3.5 rounded-2xl border-2 border-[#E2E8F0] hover:border-[#FF6A00] hover:bg-[#FFF5EB] transition-all text-left group"
                  >
                    <span className="text-2xl">{tpl.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#FF6A00] transition-colors">{tpl.name}</p>
                      <p className="text-[10px] text-[#8FA4C8] truncate">{tpl.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Upload */}
          {step === "upload" && (
            <div>
              {selectedTemplate && (
                <div className="flex items-center gap-2 bg-[#FFF5EB] border border-[#FF6A00]/20 rounded-xl px-3 py-2 mb-4">
                  <span className="text-lg">{selectedTemplate.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#FF6A00]">{selectedTemplate.name}</p>
                    <p className="text-[10px] text-[#8FA4C8]">{selectedTemplate.description}</p>
                  </div>
                  <button onClick={() => setStep("template")} className="text-[10px] text-[#8FA4C8] hover:text-[#FF6A00] font-semibold">Ganti</button>
                </div>
              )}

              {loading ? (
                <div className="flex flex-col items-center justify-center py-14 gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFF5EB] flex items-center justify-center">
                    <Loader2 className="w-7 h-7 text-[#FF6A00] animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-[#1A1A1A] text-sm">Membaca {fileName}...</p>
                    <p className="text-xs text-[#8FA4C8] mt-1">AI sedang menganalisis, harap tunggu</p>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="border-2 border-dashed border-[#E2E8F0] rounded-2xl p-10 text-center cursor-pointer hover:border-[#FF6A00] transition-colors group"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                  >
                    <div className="flex justify-center gap-3 mb-3">
                      <FileText className="w-7 h-7 text-[#8FA4C8] group-hover:text-[#FF6A00] transition-colors" />
                      <ImageIcon className="w-7 h-7 text-[#8FA4C8] group-hover:text-[#FF6A00] transition-colors" />
                    </div>
                    <p className="font-semibold text-[#1A1A1A] mb-1 text-sm">Upload PDF atau Screenshot Mutasi</p>
                    <p className="text-xs text-[#8FA4C8]">PDF, PNG, JPG · Drag & drop atau klik</p>
                    <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                  </div>

                  <div className="mt-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-2">
                    <p className="text-xs font-semibold text-[#1A1A1A]">Tips untuk hasil terbaik:</p>
                    <ul className="text-xs text-[#8FA4C8] space-y-1 list-disc list-inside">
                      <li>Pastikan teks/angka terbaca jelas (tidak blur)</li>
                      <li>Screenshot full page mutasi (scroll sampai habis)</li>
                      <li>PDF langsung dari bank lebih akurat dari foto fisik</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 3: Mapping */}
          {step === "map" && (
            <div>
              <div className="flex items-center gap-2 mb-4 bg-[#F2F4F7] rounded-xl px-4 py-2.5">
                <FileText className="w-4 h-4 text-[#FF6A00] flex-shrink-0" />
                <p className="text-sm text-[#4A5568]">
                  <span className="font-bold text-[#1A1A1A]">{extractedRows.length}</span> baris dari{" "}
                  <span className="font-semibold text-[#FF6A00]">{fileName}</span>
                </p>
              </div>

              <div className="space-y-3 mb-4">
                <MappingRow label="Tanggal" required value={mapping.date} fields={extractedFields} onChange={v => setMapping(m => ({ ...m, date: v }))} />
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 space-y-3">
                  <p className="text-[10px] font-bold text-[#8FA4C8] uppercase tracking-widest">Kolom Jumlah</p>
                  <div className="grid grid-cols-2 gap-2">
                    <MappingRow label="Debet (Keluar)" value={mapping.debit} fields={extractedFields} onChange={v => setMapping(m => ({ ...m, debit: v }))} />
                    <MappingRow label="Kredit (Masuk)" value={mapping.credit} fields={extractedFields} onChange={v => setMapping(m => ({ ...m, credit: v }))} />
                  </div>
                  <p className="text-[10px] text-[#8FA4C8] text-center">— atau —</p>
                  <MappingRow label="Nominal (1 kolom)" value={mapping.amount} fields={extractedFields} onChange={v => setMapping(m => ({ ...m, amount: v }))} />
                </div>
                <MappingRow label="Keterangan / Deskripsi" value={mapping.note} fields={extractedFields} onChange={v => setMapping(m => ({ ...m, note: v }))} />
                <MappingRow label="Jenis (DB/CR, IN/OUT)" value={mapping.type} fields={extractedFields} onChange={v => setMapping(m => ({ ...m, type: v }))} />
              </div>

              {!mapping.type && !mapping.debit && !mapping.credit && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-2">Jenis Default Transaksi</p>
                  <div className="flex gap-2">
                    {["expense", "income"].map(t => (
                      <button key={t} onClick={() => setDefaultType(t)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${defaultType === t ? "bg-[#FF6A00] text-white" : "bg-[#F2F4F7] text-[#4A5568]"}`}>
                        {t === "expense" ? "💸 Pengeluaran" : "💰 Pemasukan"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview 3 baris */}
              {canMap && extractedRows.length > 0 && (
                <div className="bg-[#F8FAFC] rounded-xl p-3 mb-4 max-h-32 overflow-y-auto">
                  <p className="text-[10px] font-bold text-[#8FA4C8] uppercase mb-2">Preview 3 baris pertama</p>
                  {extractedRows.slice(0, 3).map((row, i) => (
                    <div key={i} className="text-[11px] text-[#4A5568] py-1.5 border-b border-[#E2E8F0] last:border-0 flex flex-wrap gap-2">
                      {mapping.date && <span className="bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0]">📅 {row[mapping.date]}</span>}
                      {(mapping.debit || mapping.amount) && <span className="bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0]">💰 {row[mapping.debit || mapping.amount]}</span>}
                      {mapping.credit && <span className="bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0]">📈 {row[mapping.credit]}</span>}
                      {mapping.note && <span className="bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0] truncate max-w-[140px]">📝 {row[mapping.note]}</span>}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={buildPreview}
                disabled={!canMap}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#FF6A00] disabled:opacity-40 hover:bg-[#e05e00] transition-colors"
              >
                Proses & Lihat Preview →
              </button>
            </div>
          )}

          {/* STEP 4: Preview */}
          {step === "preview" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-[#1A1A1A]">{preview.length} transaksi siap diimpor</p>
                  {previewErrors.length > 0 && <p className="text-xs text-amber-600">{previewErrors.length} baris dilewati</p>}
                </div>
                <button onClick={() => setStep("map")} className="flex items-center gap-1 text-xs text-[#8FA4C8] hover:text-[#FF6A00] transition-colors">
                  <RefreshCw className="w-3 h-3" /> Edit Mapping
                </button>
              </div>

              <CategorySummary transactions={preview} />

              <div className="max-h-64 overflow-y-auto border border-[#E2E8F0] rounded-xl mb-4 divide-y divide-[#F2F4F7]">
                {preview.slice(0, 50).map((tx, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-3 py-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                      style={{ backgroundColor: tx.type === "income" ? "#22C55E20" : "#EF444420" }}>
                      {tx.type === "income" ? "💰" : "💸"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#1A1A1A] truncate">{tx.note || "-"}</p>
                      <p className="text-[10px] text-[#8FA4C8]">{tx.date} · <span className="text-[#FF6A00]">{tx.category}</span></p>
                    </div>
                    <span className={`text-xs font-bold flex-shrink-0 ${tx.type === "income" ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                      {tx.type === "income" ? "+" : "−"}Rp{(tx.amount || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
                {preview.length > 50 && (
                  <div className="px-3 py-2 text-center text-xs text-[#8FA4C8]">+ {preview.length - 50} transaksi lainnya</div>
                )}
              </div>

              {previewErrors.length > 0 && (
                <details className="mb-4">
                  <summary className="text-xs font-semibold text-amber-600 cursor-pointer flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {previewErrors.length} baris dilewati — klik untuk detail
                  </summary>
                  <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-3 max-h-28 overflow-y-auto">
                    {previewErrors.map((e, i) => <p key={i} className="text-[10px] text-amber-700">{e}</p>)}
                  </div>
                </details>
              )}

              <button
                onClick={handleImport}
                disabled={importing || preview.length === 0}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#FF6A00] disabled:opacity-40 hover:bg-[#e05e00] transition-colors flex items-center justify-center gap-2"
              >
                {importing
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengimpor...</>
                  : `Import ${preview.length} Transaksi`}
              </button>
            </div>
          )}

          {/* STEP 5: Done */}
          {step === "done" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-9 h-9 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-1">Import Berhasil! 🎉</h3>
              <p className="text-[#8FA4C8] text-sm mb-1">
                <span className="font-bold text-[#1A1A1A]">{importedCount}</span> transaksi berhasil diimpor
              </p>
              <p className="text-xs text-[#8FA4C8] mb-6">Kategori terisi otomatis berdasarkan keterangan transaksi</p>
              <button onClick={() => { onSuccess?.(); onClose(); }}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#FF6A00] hover:bg-[#e05e00] transition-colors">
                Lihat Transaksi
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}