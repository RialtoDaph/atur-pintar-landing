import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Camera, Upload, Loader2, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { syncAccountBalance } from "@/components/utils/accountSync";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";
import AccountAvatar from "@/components/ui/AccountAvatar";

export default function ReceiptScanModal({ onClose, onSuccess }) {
  useLockBodyScroll();
  const [step, setStep] = useState("upload"); // upload | reviewing | done
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState(""); // pesan progres saat scan
  const [extracted, setExtracted] = useState(null);
  const [scanId, setScanId] = useState(null);
  const [globalCategories, setGlobalCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [lastFile, setLastFile] = useState(null); // untuk retry
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.email) {
        base44.entities.Account.filter({ created_by: u.email }, "name").then(accs => {
          setAccounts(accs || []);
          const def = (accs || []).find(a => a.is_default) || (accs || [])[0];
          if (def) setExtracted(prev => prev ? { ...prev, account_id: def.id } : prev);
        }).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  async function loadCategories() {
    if (globalCategories.length > 0) return globalCategories;
    const cats = await base44.entities.GlobalCategory.list("sort_order");
    const active = (cats || []).filter(c => c.is_active !== false);
    setGlobalCategories(active);
    return active;
  }

  // util: jalankan promise dengan timeout
  function withTimeout(promise, ms, label) {
    return Promise.race([
      promise,
      new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timeout (${ms / 1000}s)`)), ms))
    ]);
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    // Validasi tipe & ukuran file SEBELUM upload
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG/PNG)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 10MB. Coba kompres dulu.");
      return;
    }
    if (file.size < 1024) {
      toast.error("Gambar terlalu kecil/rusak. Coba foto ulang.");
      return;
    }

    setLastFile(file);
    await runScan(file);
  }

  async function runScan(file) {
    setScanning(true);
    setScanStatus("Mengunggah gambar...");
    try {
      const cats = await loadCategories();

      const { file_url } = await withTimeout(
        base44.integrations.Core.UploadFile({ file }),
        30000,
        "Upload gambar"
      );

      setScanStatus("Nana sedang membaca struk...");
      const catList = cats.map(c => c.name).join(", ");
      const today = new Date().toLocaleDateString("en-CA");

      const data = await withTimeout(
        base44.integrations.Core.InvokeLLM({
          prompt: `Kamu adalah sistem OCR ahli untuk struk belanja Indonesia. Analisis gambar struk ini dengan teliti.

PENTING - format angka Indonesia:
- Titik (.) = pemisah ribuan: 15.000 → 15000
- Koma (,) = desimal: 15.000,50 → 15000.50
- Hilangkan simbol Rp, IDR, spasi

Ekstrak:
1. merchant_name: Nama toko/restoran (biasanya di atas struk)
2. total_amount: TOTAL akhir yang dibayar (cari kata: TOTAL, GRAND TOTAL, JUMLAH BAYAR, TOTAL BAYAR). Harus berupa angka, JANGAN 0 kalau struk terlihat.
3. scan_date: Tanggal transaksi format YYYY-MM-DD. Jika tidak terbaca pakai: ${today}
4. suggested_category: Pilih SATU nama kategori PERSIS dari daftar: ${catList}

Jika gambar buram atau bukan struk, isi merchant_name = "" dan total_amount = 0.`,
          file_urls: [file_url],
          model: "gemini_3_flash",
          response_json_schema: {
            type: "object",
            properties: {
              merchant_name: { type: "string" },
              total_amount: { type: "number" },
              scan_date: { type: "string" },
              suggested_category: { type: "string" },
            },
            required: ["merchant_name", "total_amount", "scan_date"]
          }
        }),
        60000,
        "Pembacaan struk"
      );

      // Validasi hasil — jika nominal 0, beri peringatan tapi tetap lanjut agar user bisa edit
      const totalAmount = Number(data?.total_amount) || 0;
      const merchantName = (data?.merchant_name || "").trim();

      if (totalAmount === 0 && !merchantName) {
        toast.error("Struk tidak terbaca. Pastikan foto jelas & cahaya cukup.");
        setScanning(false);
        setScanStatus("");
        return;
      }

      if (totalAmount === 0) {
        toast.warning("Nominal tidak terbaca jelas. Mohon isi manual.");
      }

      const matchedCat = cats.find(c =>
        c.name.toLowerCase() === (data.suggested_category || "").toLowerCase()
      );

      setScanStatus("Menyimpan data...");
      const scan = await base44.entities.ReceiptScan.create({
        image_url: file_url,
        merchant_name: merchantName,
        total_amount: totalAmount,
        scan_date: data.scan_date || today,
        suggested_category: matchedCat?.id || data.suggested_category || "",
        scanned_at: new Date().toISOString(),
        status: "pending",
      });

      setScanId(scan.id);
      const defAcc = accounts.find(a => a.is_default) || accounts[0];
      setExtracted({
        image_url: file_url,
        merchant_name: merchantName,
        total_amount: totalAmount,
        scan_date: data.scan_date || today,
        category: matchedCat?.id || "",
        note: merchantName,
        account_id: defAcc?.id || "",
      });
      setStep("reviewing");
    } catch (err) {
      const msg = err?.message || "Terjadi kesalahan tidak diketahui";
      if (msg.includes("timeout")) {
        toast.error(`${msg}. Coba foto yang lebih jelas atau ulangi.`);
      } else if (msg.toLowerCase().includes("network") || msg.toLowerCase().includes("fetch")) {
        toast.error("Koneksi bermasalah. Cek internet kamu lalu coba lagi.");
      } else {
        toast.error("Gagal scan struk: " + msg);
      }
    }
    setScanning(false);
    setScanStatus("");
  }

  async function handleConfirm() {
    if (!extracted) return;
    if (!extracted.account_id) {
      toast.error("Pilih rekening terlebih dahulu");
      return;
    }
    const amount = Math.round(extracted.total_amount || 0);
    if (amount <= 0) {
      toast.error("Nominal harus lebih dari 0");
      return;
    }
    setSaving(true);
    try {
      const tx = await base44.entities.Transaction.create({
        amount,
        type: "expense",
        date: extracted.scan_date,
        category: extracted.category || "other",
        note: extracted.note || extracted.merchant_name,
        account_id: extracted.account_id,
        is_recurring: false,
        is_recurring_child: false,
      });
      await syncAccountBalance(extracted.account_id, amount, "expense", 1).catch(() => {});
      if (scanId) {
        await base44.entities.ReceiptScan.update(scanId, {
          status: "confirmed",
          transaction_id: tx.id,
        });
      }
      window.dispatchEvent(new CustomEvent("transaction-added"));
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

  const expenseCats = globalCategories.filter(c => c.type === "expense" || c.type === "both");

  return (
    <>
      {/* Backdrop — translucent so FAB stays visible above */}
      <div className="fixed inset-0 z-40 bg-black/40 sm:backdrop-blur-sm" onClick={onClose} />
      {/* Floating popup — same positioning as AddTransactionModal */}
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
          className="bg-white rounded-3xl shadow-2xl overflow-y-auto overscroll-contain pointer-events-auto animate-slide-up-sheet w-[calc(100%-24px)] sm:w-full sm:max-w-md md:max-w-lg"
          style={{ maxHeight: "100%" }}
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#F2F4F7] sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F97316]" />
              <p className="font-bold text-[#1A1A1A] text-sm">Scan Struk AI</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-[#F2F4F7] rounded-lg">
              <X className="w-4 h-4 text-[#8FA4C8]" />
            </button>
          </div>

          <div className="px-5 py-5">
            {step === "upload" && (
              <div className="text-center">
                {scanning ? (
                  <div className="py-12 flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-[#F97316] animate-spin" />
                    <p className="text-sm text-[#1A1A1A] font-semibold">{scanStatus || "Memproses..."}</p>
                    <p className="text-[11px] text-[#8FA4C8]">Mohon tunggu, proses bisa sampai 60 detik</p>
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-full bg-[#FFF7ED] flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-10 h-10 text-[#F97316]" />
                    </div>
                    <p className="text-sm text-[#8FA4C8] mb-3">Foto struk belanja dan Nana AI akan otomatis mengisi data transaksi untuk kamu.</p>
                    <p className="text-[11px] text-[#8FA4C8] mb-5">💡 Tips: pastikan foto jelas, cahaya cukup, & seluruh struk masuk dalam frame</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => cameraRef.current?.click()}
                        className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl bg-[#F97316] text-white">
                        <Camera className="w-6 h-6" />
                        <span className="text-xs font-semibold">Kamera</span>
                      </button>
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl bg-[#F2F4F7] text-[#4A5568]">
                        <Upload className="w-6 h-6" />
                        <span className="text-xs font-semibold">Galeri</span>
                      </button>
                    </div>
                    {lastFile && (
                      <button
                        onClick={() => runScan(lastFile)}
                        className="mt-3 text-xs text-[#F97316] font-semibold underline">
                        🔄 Coba scan ulang file sebelumnya
                      </button>
                    )}
                  </>
                )}
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </div>
            )}

            {step === "reviewing" && extracted && (
              <div>
                {/* Result banner — matches AddTransactionModal pattern */}
                <div className="mb-4 bg-[#FFF5EB] border border-[#F97316]/20 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
                    <span className="text-xs font-bold text-[#F97316]">Struk terbaca</span>
                  </div>
                  <div className="flex justify-between items-start gap-3">
                    {extracted.image_url && (
                      <img src={extracted.image_url} alt="Struk" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#1A1A1A] truncate">{extracted.merchant_name || "Tanpa nama"}</p>
                      <p className="text-base font-bold text-[#F97316]">Rp{(extracted.total_amount || 0).toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                </div>

                {/* Amount — large centered like AddTransactionModal */}
                <div className="py-4 border-b border-[#F2F4F7] mb-4">
                  <p className="text-[11px] text-[#8FA4C8] mb-2 text-center">nominal</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl font-bold text-[#DC2626]">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={(extracted.total_amount || 0).toLocaleString("id-ID")}
                      onChange={e => {
                        const num = parseInt(e.target.value.replace(/\D/g, ""), 10) || 0;
                        setExtracted(x => ({ ...x, total_amount: num }));
                      }}
                      className="text-3xl font-bold bg-transparent border-none outline-none text-center w-full max-w-[220px]"
                      style={{ color: "#DC2626" }}
                    />
                  </div>
                </div>

                {/* Account pills — same as AddTransactionModal */}
                {accounts.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[11px] text-[#8FA4C8] mb-2">dari rekening</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {accounts.map(acc => {
                        const active = extracted.account_id === acc.id;
                        return (
                          <button key={acc.id} onClick={() => setExtracted(x => ({ ...x, account_id: acc.id }))}
                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border-[1.5px] transition-all"
                            style={{
                              borderColor: active ? "#F97316" : "#E2E8F0",
                              backgroundColor: active ? "#FFF7ED" : "#F8FAFC",
                              color: active ? "#EA580C" : "#4A5568"
                            }}>
                            <AccountAvatar logoUrl={acc.logo_url} name={acc.name} color={acc.color || "#F97316"} size="w-5 h-5" />
                            {acc.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Category chips — same style as AddTransactionModal */}
                <div className="mb-4">
                  <p className="text-[11px] text-[#8FA4C8] mb-2">kategori</p>
                  <div className="flex flex-wrap gap-1.5">
                    {expenseCats.map(cat => {
                      const selected = extracted.category === cat.id;
                      return (
                        <button key={cat.id}
                          onClick={() => setExtracted(x => ({ ...x, category: selected ? "" : cat.id }))}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-[11px] font-semibold transition-all"
                          style={{
                            backgroundColor: selected ? "#DC262620" : "#F2F4F7",
                            borderColor: selected ? "#DC2626" : "#E2E8F0",
                            color: selected ? "#DC2626" : "#4A5568"
                          }}>
                          <span>{cat.emoji}</span>{cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date & merchant — grid like AddTransactionModal */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-[11px] text-[#8FA4C8] mb-1.5">tanggal</p>
                    <input type="date" value={extracted.scan_date}
                      onChange={e => setExtracted(x => ({ ...x, scan_date: e.target.value }))}
                      className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-2 bg-[#F8FAFC]"
                      style={{ "--tw-ring-color": "#DC2626" }} />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#8FA4C8] mb-1.5">merchant</p>
                    <input type="text" value={extracted.merchant_name}
                      onChange={e => setExtracted(x => ({ ...x, merchant_name: e.target.value, note: e.target.value }))}
                      className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-2 bg-[#F8FAFC]" />
                  </div>
                </div>

                <div className="mb-5">
                  <p className="text-[11px] text-[#8FA4C8] mb-1.5">catatan</p>
                  <input type="text" value={extracted.note}
                    onChange={e => setExtracted(x => ({ ...x, note: e.target.value }))}
                    className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-2 bg-[#F8FAFC]" />
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button onClick={handleReject}
                    className="flex-1 py-3.5 rounded-[10px] border border-[#E2E8F0] text-sm font-semibold text-[#8FA4C8]">
                    Tolak
                  </button>
                  <button onClick={handleConfirm} disabled={saving}
                    className="flex-1 py-3.5 rounded-[10px] bg-[#F97316] text-white text-sm font-bold flex items-center justify-center gap-2"
                    style={{ opacity: saving ? 0.4 : 1 }}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Simpan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}