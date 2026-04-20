import { useState, useRef } from "react";
import { X, Upload, CheckCircle, AlertCircle, FileText, ImageIcon, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = ["upload", "preview", "done"];

function StepBar({ step }) {
  const labels = ["Upload", "Preview", "Selesai"];
  const idx = STEPS.indexOf(step);
  return (
    <div className="flex items-center gap-1 mb-5">
      {labels.map((l, i) => (
        <div key={l} className="flex items-center gap-1 flex-1">
          <div className={`flex-1 text-center text-[10px] font-semibold py-1 rounded-full transition-all ${i <= idx ? "bg-[#FF6A00] text-white" : "bg-[#F2F4F7] text-[#8FA4C8]"}`}>
            {l}
          </div>
          {i < labels.length - 1 && <span className="text-[#CBD5E0] text-xs">›</span>}
        </div>
      ))}
    </div>
  );
}

const CAT_EMOJI = {
  food: "🍔", transport: "🚗", shopping: "🛍️", health: "❤️",
  entertainment: "🎬", housing: "🏠", subscriptions: "📱",
  salary: "💼", freelance: "💻", transfer: "🔄", other: "📦"
};

export default function PDFImportModal({ onClose, onSuccess }) {
  const [step, setStep] = useState("upload");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const fileRef = useRef();

  async function handleFile(file) {
    if (!file) return;

    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"];
    const validExts = [".pdf", ".png", ".jpg", ".jpeg", ".webp"];
    const isValid = validTypes.includes(file.type) || validExts.some(e => file.name.toLowerCase().endsWith(e));

    if (!isValid) {
      toast.error("Format tidak didukung. Gunakan PDF, PNG, JPG, atau WEBP.");
      return;
    }

    setFileName(file.name);
    setLoading(true);

    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Extract transactions via AI
      const res = await base44.functions.invoke("extractBankStatement", { file_url });
      const txs = res.data?.transactions || [];

      if (txs.length === 0) {
        toast.error("Tidak ada transaksi yang berhasil dibaca. Coba file yang lebih jelas.");
        setLoading(false);
        return;
      }

      setPreview(txs);
      setStep("preview");
    } catch (e) {
      toast.error("Gagal membaca file: " + e.message);
    }
    setLoading(false);
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-xl shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 pt-5 pb-3 border-b border-[#F2F4F7]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[#1A1A1A]">Scan Mutasi PDF / Screenshot</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-[#F2F4F7] rounded-lg transition-colors">
              <X className="w-4 h-4 text-[#8FA4C8]" />
            </button>
          </div>
          <StepBar step={step} />
        </div>

        <div className="px-6 pb-6 pt-4">

          {/* STEP 1: Upload */}
          {step === "upload" && (
            <div>
              <p className="text-xs text-[#8FA4C8] mb-4">Upload file PDF atau screenshot mutasi rekening/e-wallet. AI akan membaca dan mengekstrak semua transaksi secara otomatis.</p>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-14 gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFF5EB] flex items-center justify-center">
                    <Loader2 className="w-7 h-7 text-[#FF6A00] animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-[#1A1A1A] text-sm">Membaca {fileName}...</p>
                    <p className="text-xs text-[#8FA4C8] mt-1">AI sedang menganalisis transaksi, harap tunggu</p>
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
                    <p className="font-semibold text-[#1A1A1A] mb-1 text-sm">Upload PDF atau Screenshot</p>
                    <p className="text-xs text-[#8FA4C8]">PDF, PNG, JPG, WEBP · Drag & drop atau klik</p>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      className="hidden"
                      onChange={e => handleFile(e.target.files[0])}
                    />
                  </div>

                  <div className="mt-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-2">
                    <p className="text-xs font-semibold text-[#1A1A1A]">Tips untuk hasil terbaik:</p>
                    <ul className="text-xs text-[#8FA4C8] space-y-1 list-disc list-inside">
                      <li>Pastikan teks/angka terbaca jelas (tidak blur)</li>
                      <li>Screenshot full page mutasi (scroll sampai habis)</li>
                      <li>PDF langsung dari bank lebih akurat dari scan fisik</li>
                      <li>Mendukung mutasi BCA, Mandiri, BNI, GoPay, OVO, DANA, dll</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 2: Preview */}
          {step === "preview" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-[#1A1A1A]">{preview.length} transaksi ditemukan</p>
                  <p className="text-xs text-[#8FA4C8]">dari {fileName}</p>
                </div>
                <button
                  onClick={() => { setStep("upload"); setPreview([]); setFileName(""); }}
                  className="text-xs text-[#8FA4C8] hover:text-[#FF6A00] font-semibold transition-colors"
                >
                  Ganti File
                </button>
              </div>

              {/* Category summary */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 mb-4">
                <p className="text-[10px] font-bold text-[#8FA4C8] uppercase tracking-widest mb-2">Ringkasan Kategori (Auto-detect)</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(
                    preview.reduce((acc, tx) => {
                      const key = tx.category || "other";
                      acc[key] = (acc[key] || 0) + 1;
                      return acc;
                    }, {})
                  ).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([cat, count]) => (
                    <div key={cat} className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold border bg-[#FFF5EB] border-[#FF6A00]/20 text-[#FF6A00]">
                      <span>{CAT_EMOJI[cat] || "📦"}</span>
                      <span>{cat}</span>
                      <span className="bg-white/60 px-1 rounded-full text-[9px]">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction list */}
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

          {/* STEP 3: Done */}
          {step === "done" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-9 h-9 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-1">Import Berhasil! 🎉</h3>
              <p className="text-[#8FA4C8] text-sm mb-1">
                <span className="font-bold text-[#1A1A1A]">{importedCount}</span> transaksi berhasil diimpor
              </p>
              <p className="text-xs text-[#8FA4C8] mb-6">Kategori terisi otomatis oleh AI</p>
              <button
                onClick={() => { onSuccess?.(); onClose(); }}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#FF6A00] hover:bg-[#e05e00] transition-colors"
              >
                Lihat Transaksi
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}