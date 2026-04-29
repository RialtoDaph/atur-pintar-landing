import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Camera, Upload, Loader2, Sparkles, Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export default function ReceiptScanModal({ onClose, onSuccess }) {
  const [step, setStep] = useState("upload"); // upload | reviewing | done
  const [scanning, setScanning] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [scanId, setScanId] = useState(null);
  const [globalCategories, setGlobalCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  async function loadCategories() {
    if (globalCategories.length > 0) return globalCategories;
    const cats = await base44.entities.GlobalCategory.list("sort_order");
    const active = (cats || []).filter(c => c.is_active !== false);
    setGlobalCategories(active);
    return active;
  }

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    setScanning(true);
    try {
      const cats = await loadCategories();
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const catList = cats.map(c => c.name).slice(0, 20).join(", ");
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Kamu adalah sistem ekstraksi data struk belanja. Ekstrak informasi dari gambar struk ini.
Kategori yang tersedia: ${catList}
Pilih kategori_id yang paling cocok dari daftar ini (kembalikan nama kategori persis).
Kembalikan JSON dengan field: merchant_name (string), total_amount (number, tanpa titik/koma), scan_date (YYYY-MM-DD, atau hari ini jika tidak ada), suggested_category (nama kategori dari daftar).`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            merchant_name: { type: "string" },
            total_amount: { type: "number" },
            scan_date: { type: "string" },
            suggested_category: { type: "string" },
          }
        }
      });

      const data = res;
      const matchedCat = cats.find(c =>
        c.name.toLowerCase() === (data.suggested_category || "").toLowerCase()
      );

      // Save to ReceiptScan with status=pending
      const scan = await base44.entities.ReceiptScan.create({
        image_url: file_url,
        merchant_name: data.merchant_name || "",
        total_amount: data.total_amount || 0,
        scan_date: data.scan_date || new Date().toLocaleDateString("en-CA"),
        suggested_category: matchedCat?.id || data.suggested_category || "",
        scanned_at: new Date().toISOString(),
        status: "pending",
      });

      setScanId(scan.id);
      setExtracted({
        image_url: file_url,
        merchant_name: data.merchant_name || "",
        total_amount: data.total_amount || 0,
        scan_date: data.scan_date || new Date().toLocaleDateString("en-CA"),
        category: matchedCat?.id || "",
        note: data.merchant_name || "",
      });
      setStep("reviewing");
    } catch (err) {
      toast.error("Gagal memindai struk: " + (err.message || ""));
    }
    setScanning(false);
  }

  async function handleConfirm() {
    if (!extracted) return;
    setSaving(true);
    try {
      const user = await base44.auth.me();
      // Create transaction
      const tx = await base44.entities.Transaction.create({
        amount: Math.round(extracted.total_amount),
        type: "expense",
        date: extracted.scan_date,
        category: extracted.category || "other",
        note: extracted.note || extracted.merchant_name,
        account_id: extracted.account_id || undefined,
        is_recurring: false,
        is_recurring_child: false,
      });
      // Update ReceiptScan
      if (scanId) {
        await base44.entities.ReceiptScan.update(scanId, {
          status: "confirmed",
          transaction_id: tx.id,
        });
      }
      toast.success("Transaksi dari struk berhasil disimpan!");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error("Gagal menyimpan: " + err.message);
    }
    setSaving(false);
  }

  async function handleReject() {
    if (scanId) {
      await base44.entities.ReceiptScan.update(scanId, { status: "rejected" }).catch(() => {});
    }
    toast.info("Struk ditolak.");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-y-auto" style={{ maxHeight: "90dvh" }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#F2F4F7]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F97316]" />
            <p className="font-bold text-[#1A1A1A] text-sm">Scan Struk AI</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F2F4F7] rounded-lg"><X className="w-4 h-4 text-[#8FA4C8]" /></button>
        </div>

        <div className="px-5 py-5">
          {step === "upload" && (
            <div className="text-center">
              {scanning ? (
                <div className="py-12 flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-[#F97316] animate-spin" />
                  <p className="text-sm text-[#8FA4C8]">Nana sedang membaca struk kamu...</p>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-[#FFF7ED] flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-10 h-10 text-[#F97316]" />
                  </div>
                  <p className="text-sm text-[#8FA4C8] mb-6">Foto struk belanja dan Nana AI akan otomatis mengisi data transaksi untuk kamu.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => cameraRef.current?.click()}
                      className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl bg-[#F97316] text-white"
                    >
                      <Camera className="w-6 h-6" />
                      <span className="text-xs font-semibold">Kamera</span>
                    </button>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl bg-[#F2F4F7] text-[#4A5568]"
                    >
                      <Upload className="w-6 h-6" />
                      <span className="text-xs font-semibold">Galeri</span>
                    </button>
                  </div>
                </>
              )}
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>
          )}

          {step === "reviewing" && extracted && (
            <div>
              <p className="text-xs text-[#8FA4C8] mb-4">Nana berhasil membaca struk. Periksa dan edit jika perlu:</p>

              {extracted.image_url && (
                <img src={extracted.image_url} alt="Struk" className="w-full rounded-xl mb-4 max-h-40 object-cover" />
              )}

              <div className="space-y-3">
                <div>
                  <p className="text-[11px] text-[#8FA4C8] mb-1">Nama Merchant</p>
                  <input
                    value={extracted.merchant_name}
                    onChange={e => setExtracted(x => ({ ...x, merchant_name: e.target.value, note: e.target.value }))}
                    className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#1A1A1A] bg-[#F8FAFC] focus:outline-none"
                  />
                </div>
                <div>
                  <p className="text-[11px] text-[#8FA4C8] mb-1">Total (Rp)</p>
                  <input
                    type="number"
                    value={extracted.total_amount}
                    onChange={e => setExtracted(x => ({ ...x, total_amount: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#1A1A1A] bg-[#F8FAFC] focus:outline-none"
                  />
                </div>
                <div>
                  <p className="text-[11px] text-[#8FA4C8] mb-1">Tanggal</p>
                  <input
                    type="date"
                    value={extracted.scan_date}
                    onChange={e => setExtracted(x => ({ ...x, scan_date: e.target.value }))}
                    className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#1A1A1A] bg-[#F8FAFC] focus:outline-none"
                  />
                </div>
                <div>
                  <p className="text-[11px] text-[#8FA4C8] mb-1">Kategori</p>
                  <select
                    value={extracted.category}
                    onChange={e => setExtracted(x => ({ ...x, category: e.target.value }))}
                    className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#1A1A1A] bg-[#F8FAFC] focus:outline-none"
                  >
                    <option value="">-- pilih kategori --</option>
                    {globalCategories.filter(c => c.type === "expense" || c.type === "both").map(c => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-[11px] text-[#8FA4C8] mb-1">Catatan</p>
                  <input
                    value={extracted.note}
                    onChange={e => setExtracted(x => ({ ...x, note: e.target.value }))}
                    className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#1A1A1A] bg-[#F8FAFC] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={handleReject}
                  className="flex-1 py-3 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#8FA4C8]"
                >
                  Tolak
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-[#F97316] text-white text-sm font-bold flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Simpan Transaksi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}