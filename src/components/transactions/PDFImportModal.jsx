import { useState, useRef, useEffect } from "react";
import { X, Upload, CheckCircle, FileText, ImageIcon, Loader2, RefreshCw, ChevronRight, AlertCircle, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { detectCategory } from "./bankCSVParser";
import AccountLogo from "@/components/ui/AccountLogo";

const STEPS = ["template", "upload", "map", "preview", "done"];
const STEP_LABELS = ["Bank/Wallet", "Upload", "Mapping", "Preview", "Selesai"];

// Bank/Wallet names yang punya template parsing khusus
const TEMPLATE_NAMES = ["BCA", "Mandiri", "BRI", "BNI", "GoPay", "OVO", "DANA", "ShopeePay", "Jenius", "CIMB Niaga", "SeaBank", "LinkAja", "Maybank"];
const DESC_MAP = {
  BCA: "Mutasi rekening BCA",
  Mandiri: "Mutasi rekening Mandiri",
  BRI: "Mutasi rekening BRI",
  BNI: "Mutasi rekening BNI",
  Jenius: "Mutasi rekening Jenius",
  "CIMB Niaga": "Mutasi rekening CIMB Niaga",
  SeaBank: "Mutasi rekening SeaBank",
  Maybank: "Mutasi rekening Maybank",
  GoPay: "Riwayat transaksi GoPay",
  OVO: "Riwayat transaksi OVO",
  DANA: "Riwayat transaksi DANA",
  ShopeePay: "Riwayat transaksi ShopeePay",
  LinkAja: "Riwayat transaksi LinkAja",
};

const CAT_EMOJI = {
  food: "🍔", transport: "🚗", shopping: "🛍️", health: "❤️",
  entertainment: "🎬", housing: "🏠", subscriptions: "📱",
  salary: "💼", freelance: "💻", transfer: "🔄", other: "📦"
};

function StepBar({ step }) {
  const idx = STEPS.indexOf(step);
  return (
    <div className="flex items-center mb-1">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1 gap-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${i < idx ? "bg-[#FF6A00] text-white" : i === idx ? "bg-[#FF6A00] text-white ring-4 ring-[#FF6A00]/20" : "bg-[#F2F4F7] text-[#CBD5E0]"}`}>
              {i < idx ? "✓" : i + 1}
            </div>
            <span className={`text-[9px] font-semibold leading-none ${i <= idx ? "text-[#FF6A00]" : "text-[#CBD5E0]"}`}>{STEP_LABELS[i]}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 flex-1 mb-4 mx-1 rounded-full transition-all ${i < idx ? "bg-[#FF6A00]" : "bg-[#F2F4F7]"}`} />
          )}
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
  const [bankTemplates, setBankTemplates] = useState([
    { id: "auto", name: "Deteksi Otomatis", icon: "🔍", description: "Cocok untuk semua format", logo_url: null, isAuto: true }
  ]);

  // Load DefaultAccount → ambil logo asli untuk tiap template bank/wallet
  useEffect(() => {
    base44.entities.DefaultAccount.list("sort_order").then(accs => {
      const byName = {};
      for (const a of accs || []) {
        if (a.is_active !== false) byName[a.name] = a;
      }
      const tpls = [
        { id: "auto", name: "Deteksi Otomatis", icon: "🔍", description: "Cocok untuk semua format", logo_url: null, isAuto: true },
        ...TEMPLATE_NAMES.map(n => {
          const acc = byName[n];
          return {
            id: n.toLowerCase().replace(/\s+/g, "_"),
            name: n,
            icon: acc?.icon || "🏦",
            description: DESC_MAP[n] || `Mutasi ${n}`,
            logo_url: acc?.logo_url || null,
            color: acc?.color || "#F97316",
          };
        })
      ];
      setBankTemplates(tpls);
    }).catch(() => {});
  }, []);

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

      // Ask AI to extract structured table from the file (with timeout)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout
      
      let result;
      try {
        result = await Promise.race([
          base44.integrations.Core.InvokeLLM({
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
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Pemrosesan timeout")), 55000))
        ]);
      } finally {
        clearTimeout(timeoutId);
      }

      const fields = result.fields || [];
      const rows = result.rows || [];

      if (fields.length === 0 || rows.length === 0) {
        toast.error("Tidak ada data transaksi yang berhasil dibaca.");
        setLoading(false);
        return;
      }

      setExtractedFields(fields);
      setExtractedRows(rows);

      // Auto-detect mapping dengan AI untuk akurasi lebih tinggi
      const autoMap = { date: "", amount: "", debit: "", credit: "", note: "", type: "" };
      
      // Gunakan AI untuk memahami kolom dengan lebih akurat
      const mapResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Diberikan daftar nama kolom dari file bank/e-wallet:
${JSON.stringify(fields)}

Identifikasi dan kembalikan mapping untuk setiap tipe kolom dalam format JSON:
{
  "date": "nama kolom untuk tanggal transaksi",
  "debit": "nama kolom untuk pengeluaran/debet (atau null)",
  "credit": "nama kolom untuk pemasukan/kredit (atau null)",
  "amount": "nama kolom untuk nominal total (jika ada kolom tunggal)",
  "note": "nama kolom untuk keterangan/deskripsi transaksi",
  "type": "nama kolom untuk jenis transaksi DB/CR/IN/OUT (atau null)"
}

Pastikan:
- Hanya gunakan nama kolom yang benar-benar ada di daftar
- Jika tidak yakin, return null untuk field tersebut
- Prioritas: date WAJIB ada, amount/debit-credit WAJIB ada minimal salah satu`,
        response_json_schema: {
          type: "object",
          properties: {
            date: { type: ["string", "null"] },
            debit: { type: ["string", "null"] },
            credit: { type: ["string", "null"] },
            amount: { type: ["string", "null"] },
            note: { type: ["string", "null"] },
            type: { type: ["string", "null"] }
          }
        }
      });

      // Apply AI mapping
      for (const [key, val] of Object.entries(mapResult)) {
        if (val && fields.includes(val)) autoMap[key] = val;
      }

      setMapping(autoMap);
      setStep("map");
    } catch (e) {
      const msg = e.message.includes("timeout") ? "Pemrosesan terlalu lama. Coba file yang lebih kecil atau jenis bank lain." : "Gagal membaca file: " + e.message;
      toast.error(msg);
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
    <>
      {/* Backdrop — translucent so FAB at z-80 stays visible above */}
      <div className="fixed inset-0 z-40 bg-black/40 sm:backdrop-blur-sm" onClick={onClose} />
      {/* Mobile: floating popup positioned just above the FAB. Desktop: centered modal */}
      <div
        className="fixed z-40 pointer-events-none flex justify-center sm:inset-0 sm:items-center"
        style={{
          left: 0,
          right: 0,
          bottom: 'calc(112px + env(safe-area-inset-bottom, 0px))',
          top: '64px'
        }}>
        <div
          role="dialog"
          aria-modal="true"
          className="bg-white rounded-3xl shadow-2xl flex flex-col overscroll-contain pointer-events-auto animate-slide-up-sheet w-[calc(100%-24px)] sm:w-full sm:max-w-lg"
          style={{ maxHeight: "100%" }}
          onClick={e => e.stopPropagation()}>
        {/* Header — sticky */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-[#F2F4F7]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-[#1A1A1A]">Import Mutasi PDF / Screenshot</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-[#F2F4F7] rounded-xl transition-colors flex-shrink-0">
              <X className="w-4 h-4 text-[#8FA4C8]" />
            </button>
          </div>
          <StepBar step={step} />
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4">

          {/* STEP 1: Pilih Bank/Wallet */}
          {step === "template" && (
            <div>
              <p className="text-xs text-[#8FA4C8] mb-4">Pilih bank atau e-wallet untuk membantu pemetaan kolom otomatis.</p>
              <div className="grid grid-cols-2 gap-2">
                {bankTemplates.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => { setSelectedTemplate(tpl); setStep("upload"); }}
                    className="flex items-center gap-2.5 p-3 rounded-2xl border-2 border-[#E2E8F0] active:border-[#FF6A00] active:bg-[#FFF5EB] hover:border-[#FF6A00] hover:bg-[#FFF5EB] transition-all text-left tap-highlight-fix"
                  >
                    {tpl.isAuto ? (
                      <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-[#F2F4F7] flex items-center justify-center">
                        <Search className="w-4 h-4 text-[#8FA4C8]" />
                      </div>
                    ) : tpl.logo_url ? (
                      <AccountLogo
                        logoUrl={tpl.logo_url}
                        size="w-8 h-8"
                        fallback={<span className="text-xl flex-shrink-0">{tpl.icon}</span>}
                      />
                    ) : (
                      <span className="text-xl flex-shrink-0">{tpl.icon}</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#1A1A1A] leading-tight">{tpl.name}</p>
                      <p className="text-[10px] text-[#8FA4C8] leading-tight mt-0.5 line-clamp-1">{tpl.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Upload */}
          {step === "upload" && (
            <div className="space-y-3">
              {selectedTemplate && (
                <div className="flex items-center gap-3 bg-[#FFF5EB] border border-[#FF6A00]/20 rounded-2xl px-4 py-3">
                  {selectedTemplate.logo_url ? (
                    <AccountLogo
                      logoUrl={selectedTemplate.logo_url}
                      size="w-8 h-8"
                      fallback={<span className="text-xl flex-shrink-0">{selectedTemplate.icon}</span>}
                    />
                  ) : (
                    <span className="text-xl flex-shrink-0">{selectedTemplate.icon}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#FF6A00]">{selectedTemplate.name}</p>
                    <p className="text-[10px] text-[#8FA4C8]">{selectedTemplate.description}</p>
                  </div>
                  <button onClick={() => setStep("template")} className="text-[10px] text-[#8FA4C8] hover:text-[#FF6A00] font-semibold whitespace-nowrap tap-highlight-fix">Ganti</button>
                </div>
              )}

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#FFF5EB] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[#FF6A00] animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-[#1A1A1A] text-sm">Membaca file...</p>
                    <p className="text-xs text-[#8FA4C8] mt-1">Ini mungkin memakan waktu 30-60 detik</p>
                    <p className="text-[10px] text-[#CBD5E0] mt-2">Jika lebih dari 1 menit, coba file yang lebih kecil</p>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    className="w-full border-2 border-dashed border-[#E2E8F0] rounded-2xl py-10 text-center active:border-[#FF6A00] active:bg-[#FFF5EB] hover:border-[#FF6A00] transition-colors tap-highlight-fix"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                  >
                    <div className="flex justify-center gap-3 mb-3">
                      <FileText className="w-7 h-7 text-[#CBD5E0]" />
                      <ImageIcon className="w-7 h-7 text-[#CBD5E0]" />
                    </div>
                    <p className="font-bold text-[#1A1A1A] text-sm mb-1">Upload PDF atau Screenshot</p>
                    <p className="text-xs text-[#8FA4C8]">PDF, PNG, JPG · Klik atau drag & drop</p>
                    <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                  </button>

                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4">
                    <p className="text-xs font-bold text-[#1A1A1A] mb-2">💡 Tips hasil terbaik</p>
                    <ul className="space-y-1">
                      <li className="text-xs text-[#8FA4C8] flex items-start gap-2"><span className="flex-shrink-0 mt-0.5">•</span>Pastikan teks dan angka terbaca jelas</li>
                      <li className="text-xs text-[#8FA4C8] flex items-start gap-2"><span className="flex-shrink-0 mt-0.5">•</span>Screenshot full page mutasi (scroll sampai habis)</li>
                      <li className="text-xs text-[#8FA4C8] flex items-start gap-2"><span className="flex-shrink-0 mt-0.5">•</span>PDF langsung dari bank lebih akurat dari foto</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 3: Mapping */}
          {step === "map" && (
            <div className="space-y-4">
              {/* Info row */}
              <div className="flex items-center gap-2 bg-[#F2F4F7] rounded-2xl px-4 py-3">
                <FileText className="w-4 h-4 text-[#FF6A00] flex-shrink-0" />
                <p className="text-xs text-[#4A5568]">
                  <span className="font-bold text-[#1A1A1A]">{extractedRows.length}</span> baris terdeteksi dari <span className="font-semibold text-[#FF6A00] truncate">{fileName}</span>
                </p>
              </div>

              {/* Mapping fields */}
              <div className="space-y-3">
                <MappingRow label="Tanggal" required value={mapping.date} fields={extractedFields} onChange={v => setMapping(m => ({ ...m, date: v }))} />

                {/* Amount section */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3 space-y-3">
                  <p className="text-[10px] font-bold text-[#8FA4C8] uppercase tracking-widest">Kolom Jumlah</p>
                  <div className="grid grid-cols-2 gap-2">
                    <MappingRow label="Debet (Keluar)" value={mapping.debit} fields={extractedFields} onChange={v => setMapping(m => ({ ...m, debit: v }))} />
                    <MappingRow label="Kredit (Masuk)" value={mapping.credit} fields={extractedFields} onChange={v => setMapping(m => ({ ...m, credit: v }))} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-[#E2E8F0]" />
                    <span className="text-[10px] text-[#CBD5E0] font-medium">atau</span>
                    <div className="flex-1 h-px bg-[#E2E8F0]" />
                  </div>
                  <MappingRow label="Nominal (1 kolom)" value={mapping.amount} fields={extractedFields} onChange={v => setMapping(m => ({ ...m, amount: v }))} />
                </div>

                <MappingRow label="Keterangan / Deskripsi" value={mapping.note} fields={extractedFields} onChange={v => setMapping(m => ({ ...m, note: v }))} />
                <MappingRow label="Jenis (DB/CR, IN/OUT)" value={mapping.type} fields={extractedFields} onChange={v => setMapping(m => ({ ...m, type: v }))} />
              </div>

              {!mapping.type && !mapping.debit && !mapping.credit && (
                <div>
                  <p className="text-[10px] font-bold text-[#8FA4C8] uppercase tracking-widest mb-2">Jenis Default</p>
                  <div className="grid grid-cols-2 gap-2">
                    {["expense", "income"].map(t => (
                      <button key={t} onClick={() => setDefaultType(t)}
                        className={`py-3 rounded-2xl text-sm font-semibold transition-colors tap-highlight-fix ${defaultType === t ? "bg-[#FF6A00] text-white" : "bg-[#F2F4F7] text-[#4A5568]"}`}>
                        {t === "expense" ? "💸 Pengeluaran" : "💰 Pemasukan"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Data preview */}
              {canMap && extractedRows.length > 0 && (
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3">
                  <p className="text-[10px] font-bold text-[#8FA4C8] uppercase tracking-widest mb-2">Preview 3 baris</p>
                  <div className="space-y-2">
                    {extractedRows.slice(0, 3).map((row, i) => (
                      <div key={i} className="flex flex-wrap gap-1.5 text-[11px]">
                        {mapping.date && <span className="bg-white border border-[#E2E8F0] px-2 py-0.5 rounded-lg text-[#4A5568]">📅 {row[mapping.date]}</span>}
                        {(mapping.debit || mapping.amount) && <span className="bg-white border border-[#E2E8F0] px-2 py-0.5 rounded-lg text-[#4A5568]">💰 {row[mapping.debit || mapping.amount]}</span>}
                        {mapping.credit && <span className="bg-white border border-[#E2E8F0] px-2 py-0.5 rounded-lg text-[#4A5568]">📈 {row[mapping.credit]}</span>}
                        {mapping.note && <span className="bg-white border border-[#E2E8F0] px-2 py-0.5 rounded-lg text-[#4A5568] max-w-[160px] truncate">📝 {row[mapping.note]}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={buildPreview}
                disabled={!canMap}
                className="w-full py-4 rounded-2xl font-bold text-sm text-white bg-[#FF6A00] disabled:opacity-40 active:bg-[#e05e00] hover:bg-[#e05e00] transition-colors tap-highlight-fix"
              >
                Proses & Lihat Preview →
              </button>
            </div>
          )}

          {/* STEP 4: Preview */}
          {step === "preview" && (
            <div className="space-y-3">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#1A1A1A]">{preview.length} transaksi siap diimpor</p>
                  {previewErrors.length > 0 && <p className="text-xs text-amber-600 mt-0.5">{previewErrors.length} baris dilewati</p>}
                </div>
                <button onClick={() => setStep("map")} className="flex items-center gap-1 text-xs text-[#8FA4C8] hover:text-[#FF6A00] transition-colors tap-highlight-fix">
                  <RefreshCw className="w-3 h-3" /> Edit Mapping
                </button>
              </div>

              <CategorySummary transactions={preview} />

              {/* Transaction list */}
              <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden" style={{ maxHeight: 260, overflowY: 'auto' }}>
                {preview.slice(0, 50).map((tx, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-[#F2F4F7] last:border-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                      style={{ backgroundColor: tx.type === "income" ? "#22C55E20" : "#EF444420" }}>
                      {tx.type === "income" ? "💰" : "💸"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1A1A1A] truncate">{tx.note || "-"}</p>
                      <p className="text-[10px] text-[#8FA4C8] mt-0.5">{tx.date} · <span className="text-[#FF6A00]">{tx.category}</span></p>
                    </div>
                    <span className={`text-xs font-bold flex-shrink-0 ${tx.type === "income" ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                      {tx.type === "income" ? "+" : "−"}Rp{(tx.amount || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
                {preview.length > 50 && (
                  <div className="px-4 py-3 text-center text-xs text-[#8FA4C8]">+ {preview.length - 50} transaksi lainnya</div>
                )}
              </div>

              {previewErrors.length > 0 && (
                <details>
                  <summary className="text-xs font-semibold text-amber-600 cursor-pointer flex items-center gap-1.5 tap-highlight-fix">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {previewErrors.length} baris dilewati — klik untuk detail
                  </summary>
                  <div className="mt-2 bg-amber-50 border border-amber-200 rounded-2xl p-3 space-y-1" style={{ maxHeight: 112, overflowY: 'auto' }}>
                    {previewErrors.map((e, i) => <p key={i} className="text-[10px] text-amber-700">{e}</p>)}
                  </div>
                </details>
              )}

              <button
                onClick={handleImport}
                disabled={importing || preview.length === 0}
                className="w-full py-4 rounded-2xl font-bold text-sm text-white bg-[#FF6A00] disabled:opacity-40 active:bg-[#e05e00] hover:bg-[#e05e00] transition-colors flex items-center justify-center gap-2 tap-highlight-fix"
              >
                {importing
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengimpor...</>
                  : `Import ${preview.length} Transaksi`}
              </button>
            </div>
          )}

          {/* STEP 5: Done */}
          {step === "done" && (
            <div className="text-center py-10">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-1">Import Berhasil! 🎉</h3>
              <p className="text-sm text-[#8FA4C8] mb-1">
                <span className="font-bold text-[#1A1A1A]">{importedCount}</span> transaksi berhasil ditambahkan
              </p>
              <p className="text-xs text-[#8FA4C8] mb-8">Kategori terisi otomatis dari keterangan transaksi</p>
              <button onClick={() => { onSuccess?.(); onClose(); }}
                className="w-full py-4 rounded-2xl font-bold text-sm text-white bg-[#FF6A00] active:bg-[#e05e00] hover:bg-[#e05e00] transition-colors tap-highlight-fix">
                Lihat Transaksi
              </button>
            </div>
          )}

          </div>
        </div>
      </div>
    </>
  );
}