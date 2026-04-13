import { useState, useRef, useCallback } from "react";
import { X, Upload, FileText, CheckCircle, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  BANK_TEMPLATES,
  parseCSV,
  autoDetectMapping,
  transformRows,
  detectCategory,
  parseDate,
  parseAmount,
  detectType,
} from "./bankCSVParser";

const STEPS = ["template", "upload", "map", "preview", "done"];

function StepBar({ step }) {
  const labels = ["Template", "Upload", "Mapping", "Preview", "Selesai"];
  const idx = STEPS.indexOf(step);
  return (
    <div className="flex items-center gap-1 mb-5">
      {labels.map((l, i) => (
        <div key={l} className="flex items-center gap-1 flex-1">
          <div className={`flex-1 text-center text-[10px] font-semibold py-1 rounded-full transition-all ${i <= idx ? "bg-[#FF6A00] text-white" : "bg-[#F2F4F7] text-[#8FA4C8]"}`}>
            {l}
          </div>
          {i < labels.length - 1 && <ChevronRight className="w-3 h-3 text-[#CBD5E0] flex-shrink-0" />}
        </div>
      ))}
    </div>
  );
}

export default function CSVImportModal({ onClose, onSuccess }) {
  const [step, setStep] = useState("template");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({ date: "", amount: "", debit: "", credit: "", note: "", type: "", category: "" });
  const [defaultType, setDefaultType] = useState("expense");
  const [preview, setPreview] = useState([]);
  const [previewErrors, setPreviewErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef();

  function applyTemplate(tpl) {
    setSelectedTemplate(tpl);
    setStep("upload");
  }

  function handleFile(f) {
    if (!f) return;
    if (!f.name.endsWith(".csv")) { toast.error("Hanya file CSV yang didukung"); return; }
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      // Detect delimiter
      const text = e.target.result;
      const firstLine = text.split(/\r?\n/)[0];
      const delimiter = firstLine.includes(";") ? ";" : ",";
      const { headers, rows } = parseCSV(text, delimiter);

      if (headers.length === 0) { toast.error("File CSV tidak valid atau kosong"); return; }
      setHeaders(headers);
      setRows(rows);

      // Apply template mapping or auto-detect
      if (selectedTemplate && selectedTemplate.id !== "auto" && selectedTemplate.mapping) {
        const tplMap = { date: "", amount: "", debit: "", credit: "", note: "", type: "", category: "" };
        for (const [field, colName] of Object.entries(selectedTemplate.mapping)) {
          if (headers.includes(colName)) tplMap[field] = colName;
        }
        // Fallback to auto if template columns not found
        const detected = autoDetectMapping(headers);
        setMapping({ ...detected, ...Object.fromEntries(Object.entries(tplMap).filter(([_, v]) => v)) });
      } else {
        setMapping(autoDetectMapping(headers));
      }
      setStep("map");
    };
    reader.readAsText(f, "UTF-8");
  }

  function buildPreview() {
    const { results, errors } = transformRows(rows, mapping, defaultType);
    setPreview(results);
    setPreviewErrors(errors);
    setStep("preview");
  }

  async function handleImport() {
    if (preview.length === 0) return;
    setImporting(true);
    const BATCH = 50;
    let total = 0;
    try {
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
        <div className="sticky top-0 bg-white z-10 px-6 pt-5 pb-3 border-b border-[#F2F4F7]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[#1A1A1A]">Import Mutasi Bank / E-Wallet</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-[#F2F4F7] rounded-lg transition-colors">
              <X className="w-4 h-4 text-[#8FA4C8]" />
            </button>
          </div>
          <StepBar step={step} />
        </div>

        <div className="px-6 pb-6 pt-4">

          {/* STEP 1: Template */}
          {step === "template" && (
            <div className="space-y-3">
              <p className="text-xs text-[#8FA4C8] mb-4">Pilih format bank/e-wallet untuk mempermudah pemetaan kolom secara otomatis.</p>
              <div className="grid grid-cols-2 gap-2.5">
                {BANK_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => applyTemplate(tpl)}
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

              <div
                className="border-2 border-dashed border-[#E2E8F0] rounded-2xl p-10 text-center cursor-pointer hover:border-[#FF6A00] transition-colors group"
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
              >
                <Upload className="w-8 h-8 text-[#8FA4C8] group-hover:text-[#FF6A00] mx-auto mb-3 transition-colors" />
                <p className="font-semibold text-[#1A1A1A] mb-1 text-sm">Upload file CSV mutasi</p>
                <p className="text-xs text-[#8FA4C8]">Drag & drop atau klik untuk pilih file</p>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => handleFile(e.target.files[0])} />
              </div>

              <div className="mt-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-[#1A1A1A]">Tips Export CSV:</p>
                <ul className="text-xs text-[#8FA4C8] space-y-1 list-disc list-inside">
                  <li>BCA: M-Banking → Mutasi → Export CSV</li>
                  <li>Mandiri: Mandiri Online → Rekening → Mutasi → Download</li>
                  <li>GoPay/OVO/DANA: Riwayat → Export/Download</li>
                  <li>Pastikan file tidak dipassword-protect</li>
                </ul>
              </div>
            </div>
          )}

          {/* STEP 3: Column Mapping */}
          {step === "map" && (
            <div>
              <div className="flex items-center gap-2 mb-4 bg-[#F2F4F7] rounded-xl px-4 py-2.5">
                <FileText className="w-4 h-4 text-[#FF6A00] flex-shrink-0" />
                <p className="text-sm text-[#4A5568]">
                  <span className="font-bold text-[#1A1A1A]">{rows.length}</span> baris dari{" "}
                  <span className="font-semibold text-[#FF6A00]">{fileName}</span>
                </p>
              </div>

              <div className="space-y-3 mb-4">
                {/* Date */}
                <MappingRow label="Tanggal *" required value={mapping.date} headers={headers} onChange={v => setMapping(m => ({ ...m, date: v }))} />

                {/* Amount Mode: separate debit/credit OR single amount */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 space-y-3">
                  <p className="text-[10px] font-bold text-[#8FA4C8] uppercase tracking-widest">Kolom Jumlah</p>
                  <div className="grid grid-cols-2 gap-2">
                    <MappingRow label="Debet (Keluar)" value={mapping.debit} headers={headers} onChange={v => setMapping(m => ({ ...m, debit: v }))} compact />
                    <MappingRow label="Kredit (Masuk)" value={mapping.credit} headers={headers} onChange={v => setMapping(m => ({ ...m, credit: v }))} compact />
                  </div>
                  <p className="text-[10px] text-[#8FA4C8] text-center">— atau —</p>
                  <MappingRow label="Nominal (1 kolom)" value={mapping.amount} headers={headers} onChange={v => setMapping(m => ({ ...m, amount: v }))} />
                </div>

                <MappingRow label="Keterangan / Deskripsi" value={mapping.note} headers={headers} onChange={v => setMapping(m => ({ ...m, note: v }))} />
                <MappingRow label="Jenis (DB/CR, IN/OUT)" value={mapping.type} headers={headers} onChange={v => setMapping(m => ({ ...m, type: v }))} />
              </div>

              {/* Default type when no type column */}
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

              {/* Preview rows */}
              {canMap && rows.length > 0 && (
                <div className="bg-[#F8FAFC] rounded-xl p-3 mb-4 max-h-32 overflow-y-auto">
                  <p className="text-[10px] font-bold text-[#8FA4C8] uppercase mb-2">Preview 3 baris pertama</p>
                  {rows.slice(0, 3).map((row, i) => (
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

          {/* STEP 4: Preview with auto-categories */}
          {step === "preview" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-[#1A1A1A]">{preview.length} transaksi siap diimpor</p>
                  {previewErrors.length > 0 && (
                    <p className="text-xs text-amber-600">{previewErrors.length} baris dilewati (format tidak valid)</p>
                  )}
                </div>
                <button onClick={() => setStep("map")} className="flex items-center gap-1 text-xs text-[#8FA4C8] hover:text-[#FF6A00] transition-colors">
                  <RefreshCw className="w-3 h-3" /> Edit Mapping
                </button>
              </div>

              {/* Category summary */}
              <CategorySummary transactions={preview} />

              {/* Transaction list preview */}
              <div className="max-h-64 overflow-y-auto border border-[#E2E8F0] rounded-xl mb-4 divide-y divide-[#F2F4F7]">
                {preview.slice(0, 50).map((tx, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-3 py-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ backgroundColor: tx.type === "income" ? "#22C55E20" : "#EF444420" }}>
                      {tx.type === "income" ? "💰" : "💸"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#1A1A1A] truncate">{tx.note || tx.category}</p>
                      <p className="text-[10px] text-[#8FA4C8]">{tx.date} · <span className="text-[#FF6A00]">{tx.category}</span></p>
                    </div>
                    <span className={`text-xs font-bold flex-shrink-0 ${tx.type === "income" ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                      {tx.type === "income" ? "+" : "−"}Rp {tx.amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
                {preview.length > 50 && (
                  <div className="px-3 py-2 text-center text-xs text-[#8FA4C8]">+ {preview.length - 50} transaksi lainnya</div>
                )}
              </div>

              {/* Errors */}
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
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Mengimpor...</>
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

// ── Sub-components ────────────────────────────────────────────────────────────

function MappingRow({ label, required, value, headers, onChange, compact }) {
  return (
    <div className={compact ? "" : ""}>
      <label className="text-[10px] font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1 block">{label}</label>
      <select
        className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-[#F8FAFC]"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">-- {required ? "Wajib dipilih" : "Tidak dipetakan"} --</option>
        {headers.map(h => <option key={h} value={h}>{h}</option>)}
      </select>
    </div>
  );
}

function CategorySummary({ transactions }) {
  const counts = {};
  transactions.forEach(tx => {
    const key = `${tx.type}:${tx.category}`;
    if (!counts[key]) counts[key] = { category: tx.category, type: tx.type, count: 0, total: 0 };
    counts[key].count++;
    counts[key].total += tx.amount;
  });

  const sorted = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 6);

  const CAT_EMOJI = {
    food: "🍔", transport: "🚗", shopping: "🛍️", health: "❤️",
    entertainment: "🎬", housing: "🏠", subscriptions: "📱",
    salary: "💼", freelance: "💻", other: "📦"
  };

  return (
    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 mb-4">
      <p className="text-[10px] font-bold text-[#8FA4C8] uppercase tracking-widest mb-2">Ringkasan Kategori (Auto-detect)</p>
      <div className="flex flex-wrap gap-1.5">
        {sorted.map(item => (
          <div key={`${item.type}:${item.category}`} className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold border ${item.type === "income" ? "bg-green-50 border-green-200 text-green-700" : "bg-[#FFF5EB] border-[#FF6A00]/20 text-[#FF6A00]"}`}>
            <span>{CAT_EMOJI[item.category] || "📦"}</span>
            <span>{item.category}</span>
            <span className="bg-white/60 px-1 rounded-full text-[9px]">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}