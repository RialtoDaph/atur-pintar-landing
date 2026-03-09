import { useState } from "react";
import { X, ChevronRight } from "lucide-react";

const ENTRY_TYPES = [
  { key: "transaction", label: "💰 Transaksi", desc: "Catat pemasukan / pengeluaran" },
  { key: "investment", label: "📈 Investasi", desc: "Tambah aset investasi" },
  { key: "debt", label: "💳 Utang", desc: "Catat utang atau cicilan" },
  { key: "goal", label: "🎯 Tujuan Tabungan", desc: "Buat target tabungan baru" },
];

const TX_CATEGORIES = [
  "Makanan & Minuman", "Transportasi", "Belanja", "Hiburan", "Tagihan & Utilitas",
  "Kesehatan", "Pendidikan", "Gaji", "Freelance", "Investasi", "Lainnya"
];

const INVEST_TYPES = [
  { key: "emas", label: "🥇 Emas" },
  { key: "saham", label: "📊 Saham" },
  { key: "reksa_dana", label: "📦 Reksa Dana" },
  { key: "crypto", label: "🪙 Crypto" },
  { key: "deposito", label: "🏦 Deposito" },
  { key: "obligasi", label: "📜 Obligasi" },
  { key: "lainnya", label: "🗂️ Lainnya" },
];

const DEBT_TYPES = [
  { key: "kpr", label: "🏠 KPR" },
  { key: "kendaraan", label: "🚗 Kendaraan" },
  { key: "kartu_kredit", label: "💳 Kartu Kredit" },
  { key: "pinjaman_pribadi", label: "👤 Pinjaman Pribadi" },
  { key: "lainnya", label: "🗂️ Lainnya" },
];

function formatRp(val) {
  const num = val.replace(/\D/g, "");
  return num ? Number(num).toLocaleString("id-ID") : "";
}

function parseRp(val) {
  return val.replace(/\./g, "").replace(/,/g, "");
}

export default function NanaQuickEntryModal({ onClose, onSend }) {
  const [step, setStep] = useState("pick"); // pick | form
  const [type, setType] = useState(null);
  const [form, setForm] = useState({});

  function selectType(key) {
    setType(key);
    setForm({ date: new Date().toISOString().split("T")[0] });
    setStep("form");
  }

  function setField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function setRpField(key, raw) {
    setField(key, formatRp(raw));
  }

  function buildMessage() {
    const d = form;
    if (type === "transaction") {
      return `Tolong catat transaksi berikut ke sistem:\n- Jenis: ${d.txType || "-"}\n- Kategori: ${d.category || "-"}\n- Jumlah: Rp ${d.amount || "0"}\n- Tanggal: ${d.date}\n- Catatan: ${d.note || "-"}\nMohon simpan data ini ke entitas Transaction.`;
    }
    if (type === "investment") {
      return `Tolong catat investasi berikut ke sistem:\n- Nama aset: ${d.name || "-"}\n- Jenis: ${d.investType || "-"}\n- Harga beli: Rp ${d.buyPrice || "0"}\n- Jumlah / unit: ${d.qty || "1"}\n- Nilai sekarang: Rp ${d.currentValue || d.buyPrice || "0"}\n- Tanggal beli: ${d.date}\n- Catatan: ${d.note || "-"}\nMohon simpan data ini ke entitas Investment.`;
    }
    if (type === "debt") {
      return `Tolong catat utang berikut ke sistem:\n- Nama utang: ${d.name || "-"}\n- Jenis: ${d.debtType || "-"}\n- Total utang: Rp ${d.total || "0"}\n- Sisa utang: Rp ${d.remaining || d.total || "0"}\n- Bunga per tahun: ${d.interest || "0"}%\n- Cicilan per bulan: Rp ${d.monthly || "0"}\n- Jatuh tempo berikutnya: ${d.due || d.date}\n- Catatan: ${d.note || "-"}\nMohon simpan data ini ke entitas Debt.`;
    }
    if (type === "goal") {
      return `Tolong buat tujuan tabungan berikut ke sistem:\n- Nama tujuan: ${d.name || "-"}\n- Target: Rp ${d.target || "0"}\n- Sudah terkumpul: Rp ${d.saved || "0"}\n- Deadline: ${d.deadline || "-"}\n- Deskripsi: ${d.note || "-"}\nMohon simpan data ini ke entitas SavingsGoal.`;
    }
    return "";
  }

  function handleSend() {
    const msg = buildMessage();
    if (msg) onSend(msg);
    onClose();
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full sm:w-[400px] bg-[#0A0A0A] border border-[#2D2D2D] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2D2D2D]">
          {step === "form" && (
            <button onClick={() => setStep("pick")} className="text-[#8FA4C8] text-xs hover:text-white transition-colors">
              ← Kembali
            </button>
          )}
          <p className="text-white font-bold text-sm flex-1 text-center">
            {step === "pick" ? "Catat ke Nana" : ENTRY_TYPES.find((t) => t.key === type)?.label}
          </p>
          <button onClick={onClose} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <X className="w-3 h-3 text-white" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4">
          {/* Step 1: Pick type */}
          {step === "pick" && (
            <div className="space-y-2">
              <p className="text-[#8FA4C8] text-xs mb-3">Pilih jenis data yang ingin kamu catat:</p>
              {ENTRY_TYPES.map((t) => (
                <button key={t.key} onClick={() => selectType(t.key)}
                  className="w-full flex items-center justify-between bg-[#161616] border border-[#2D2D2D] rounded-xl px-4 py-3 hover:border-[#FF6A00] hover:bg-[#FF6A00]/10 transition-all group">
                  <div className="text-left">
                    <p className="text-white text-sm font-medium">{t.label}</p>
                    <p className="text-[#8FA4C8] text-xs">{t.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8FA4C8] group-hover:text-[#FF6A00] transition-colors" />
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Form */}
          {step === "form" && (
            <div className="space-y-3">

              {/* TRANSACTION FORM */}
              {type === "transaction" && (
                <>
                  <div>
                    <label className="text-[#8FA4C8] text-xs mb-1 block">Jenis Transaksi *</label>
                    <div className="flex gap-2">
                      {["expense", "income", "savings"].map((t) => (
                        <button key={t} onClick={() => setField("txType", t)}
                          className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${form.txType === t ? "bg-[#FF6A00] border-[#FF6A00] text-white" : "bg-[#161616] border-[#2D2D2D] text-[#8FA4C8] hover:border-[#FF6A00]"}`}>
                          {t === "expense" ? "Pengeluaran" : t === "income" ? "Pemasukan" : "Tabungan"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[#8FA4C8] text-xs mb-1 block">Kategori *</label>
                    <select value={form.category || ""} onChange={(e) => setField("category", e.target.value)}
                      className="w-full bg-[#161616] border border-[#2D2D2D] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FF6A00]">
                      <option value="">Pilih kategori</option>
                      {TX_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[#8FA4C8] text-xs mb-1 block">Jumlah (Rp) *</label>
                    <input type="text" inputMode="numeric" placeholder="0" value={form.amount || ""}
                      onChange={(e) => setRpField("amount", e.target.value)}
                      className="w-full bg-[#161616] border border-[#2D2D2D] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FF6A00]" />
                  </div>
                  <div>
                    <label className="text-[#8FA4C8] text-xs mb-1 block">Tanggal *</label>
                    <input type="date" value={form.date || today} max={today}
                      onChange={(e) => setField("date", e.target.value)}
                      className="w-full bg-[#161616] border border-[#2D2D2D] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FF6A00]" />
                  </div>
                  <div>
                    <label className="text-[#8FA4C8] text-xs mb-1 block">Catatan (opsional)</label>
                    <input type="text" placeholder="Misal: Makan siang di kantor" value={form.note || ""}
                      onChange={(e) => setField("note", e.target.value)}
                      className="w-full bg-[#161616] border border-[#2D2D2D] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FF6A00]" />
                  </div>
                </>
              )}

              {/* INVESTMENT FORM */}
              {type === "investment" && (
                <>
                  <div>
                    <label className="text-[#8FA4C8] text-xs mb-1 block">Jenis Investasi *</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {INVEST_TYPES.map((t) => (
                        <button key={t.key} onClick={() => setField("investType", t.key)}
                          className={`py-2 rounded-xl text-xs font-medium border transition-all ${form.investType === t.key ? "bg-[#FF6A00] border-[#FF6A00] text-white" : "bg-[#161616] border-[#2D2D2D] text-[#8FA4C8] hover:border-[#FF6A00]"}`}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[#8FA4C8] text-xs mb-1 block">Nama Aset *</label>
                    <input type="text" placeholder={form.investType === "emas" ? "Misal: Emas Antam 10gr" : "Misal: BBCA, IHSG Reksa Dana"} value={form.name || ""}
                      onChange={(e) => setField("name", e.target.value)}
                      className="w-full bg-[#161616] border border-[#2D2D2D] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FF6A00]" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[#8FA4C8] text-xs mb-1 block">Harga Beli (Rp) *</label>
                      <input type="text" inputMode="numeric" placeholder="0" value={form.buyPrice || ""}
                        onChange={(e) => setRpField("buyPrice", e.target.value)}
                        className="w-full bg-[#161616] border border-[#2D2D2D] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FF6A00]" />
                    </div>
                    <div>
                      <label className="text-[#8FA4C8] text-xs mb-1 block">Jumlah / Unit</label>
                      <input type="number" placeholder="1" min="0" step="any" value={form.qty || ""}
                        onChange={(e) => setField("qty", e.target.value)}
                        className="w-full bg-[#161616] border border-[#2D2D2D] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FF6A00]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[#8FA4C8] text-xs mb-1 block">Nilai Sekarang (Rp)</label>
                    <input type="text" inputMode="numeric" placeholder="Sama dengan harga beli jika baru" value={form.currentValue || ""}
                      onChange={(e) => setRpField("currentValue", e.target.value)}
                      className="w-full bg-[#161616] border border-[#2D2D2D] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FF6A00]" />
                  </div>
                  <div>
                    <label className="text-[#8FA4C8] text-xs mb-1 block">Tanggal Beli *</label>
                    <input type="date" value={form.date || today} max={today}
                      onChange={(e) => setField("date", e.target.value)}
                      className="w-full bg-[#161616] border border-[#2D2D2D] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FF6A00]" />
                  </div>
                  <div>
                    <label className="text-[#8FA4C8] text-xs mb-1 block">Catatan (opsional)</label>
                    <input type="text" placeholder="Misal: Beli di Pegadaian" value={form.note || ""}
                      onChange={(e) => setField("note", e.target.value)}
                      className="w-full bg-[#161616] border border-[#2D2D2D] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FF6A00]" />
                  </div>
                </>
              )}

              {/* DEBT FORM */}
              {type === "debt" && (
                <>
                  <div>
                    <label className="text-[#8FA4C8] text-xs mb-1 block">Jenis Utang *</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {DEBT_TYPES.map((t) => (
                        <button key={t.key} onClick={() => setField("debtType", t.key)}
                          className={`py-2 rounded-xl text-xs font-medium border transition-all ${form.debtType === t.key ? "bg-[#FF6A00] border-[#FF6A00] text-white" : "bg-[#161616] border-[#2D2D2D] text-[#8FA4C8] hover:border-[#FF6A00]"}`}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[#8FA4C8] text-xs mb-1 block">Nama Utang *</label>
                    <input type="text" placeholder="Misal: KPR BRI, Cicilan Motor Honda" value={form.name || ""}
                      onChange={(e) => setField("name", e.target.value)}
                      className="w-full bg-[#161616] border border-[#2D2D2D] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FF6A00]" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[#8FA4C8] text-xs mb-1 block">Total Utang (Rp) *</label>
                      <input type="text" inputMode="numeric" placeholder="0" value={form.total || ""}
                        onChange={(e) => setRpField("total", e.target.value)}
                        className="w-full bg-[#161616] border border-[#2D2D2D] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FF6A00]" />
                    </div>
                    <div>
                      <label className="text-[#8FA4C8] text-xs mb-1 block">Sisa Utang (Rp) *</label>
                      <input type="text" inputMode="numeric" placeholder="0" value={form.remaining || ""}
                        onChange={(e) => setRpField("remaining", e.target.value)}
                        className="w-full bg-[#161616] border border-[#2D2D2D] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FF6A00]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[#8FA4C8] text-xs mb-1 block">Bunga / Tahun (%)</label>
                      <input type="number" placeholder="0" min="0" step="0.1" value={form.interest || ""}
                        onChange={(e) => setField("interest", e.target.value)}
                        className="w-full bg-[#161616] border border-[#2D2D2D] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FF6A00]" />
                    </div>
                    <div>
                      <label className="text-[#8FA4C8] text-xs mb-1 block">Cicilan / Bulan (Rp)</label>
                      <input type="text" inputMode="numeric" placeholder="0" value={form.monthly || ""}
                        onChange={(e) => setRpField("monthly", e.target.value)}
                        className="w-full bg-[#161616] border border-[#2D2D2D] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FF6A00]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[#8FA4C8] text-xs mb-1 block">Jatuh Tempo Berikutnya</label>
                    <input type="date" value={form.due || ""} onChange={(e) => setField("due", e.target.value)}
                      className="w-full bg-[#161616] border border-[#2D2D2D] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FF6A00]" />
                  </div>
                  <div>
                    <label className="text-[#8FA4C8] text-xs mb-1 block">Catatan (opsional)</label>
                    <input type="text" placeholder="Misal: Cicilan ke-12 dari 60" value={form.note || ""}
                      onChange={(e) => setField("note", e.target.value)}
                      className="w-full bg-[#161616] border border-[#2D2D2D] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FF6A00]" />
                  </div>
                </>
              )}

              {/* GOAL FORM */}
              {type === "goal" && (
                <>
                  <div>
                    <label className="text-[#8FA4C8] text-xs mb-1 block">Nama Tujuan *</label>
                    <input type="text" placeholder="Misal: Dana Darurat, Liburan Bali, DP Rumah" value={form.name || ""}
                      onChange={(e) => setField("name", e.target.value)}
                      className="w-full bg-[#161616] border border-[#2D2D2D] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FF6A00]" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[#8FA4C8] text-xs mb-1 block">Target (Rp) *</label>
                      <input type="text" inputMode="numeric" placeholder="0" value={form.target || ""}
                        onChange={(e) => setRpField("target", e.target.value)}
                        className="w-full bg-[#161616] border border-[#2D2D2D] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FF6A00]" />
                    </div>
                    <div>
                      <label className="text-[#8FA4C8] text-xs mb-1 block">Sudah Terkumpul (Rp)</label>
                      <input type="text" inputMode="numeric" placeholder="0" value={form.saved || ""}
                        onChange={(e) => setRpField("saved", e.target.value)}
                        className="w-full bg-[#161616] border border-[#2D2D2D] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FF6A00]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[#8FA4C8] text-xs mb-1 block">Deadline Tabungan</label>
                    <input type="date" value={form.deadline || ""} min={today}
                      onChange={(e) => setField("deadline", e.target.value)}
                      className="w-full bg-[#161616] border border-[#2D2D2D] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FF6A00]" />
                  </div>
                  <div>
                    <label className="text-[#8FA4C8] text-xs mb-1 block">Deskripsi (opsional)</label>
                    <input type="text" placeholder="Misal: Untuk liburan keluarga akhir tahun" value={form.note || ""}
                      onChange={(e) => setField("note", e.target.value)}
                      className="w-full bg-[#161616] border border-[#2D2D2D] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FF6A00]" />
                  </div>
                </>
              )}

              <button onClick={handleSend}
                className="w-full mt-2 py-3 bg-[#FF6A00] hover:bg-[#e05e00] rounded-xl text-white text-sm font-bold transition-colors">
                Kirim ke Nana →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}