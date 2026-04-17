import { useState, useEffect, useRef } from "react";
import { ArrowRight, ArrowLeft, Camera, Upload, Plus, Trash2, Check, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const STORAGE_KEY = "onboarding_progress_v2";

const ACCOUNT_ICONS = ["💳", "🏦", "💵", "🏧", "📱", "💰", "🪙", "💼"];
const ACCOUNT_TYPES = [
  { value: "bank", label: "Bank" },
  { value: "cash", label: "Cash / Tunai" },
  { value: "ewallet", label: "E-Wallet" },
  { value: "other", label: "Lainnya" },
];
const FINANCIAL_GOALS = [
  { value: "save_more", label: "Menabung lebih banyak 🐷" },
  { value: "pay_debt", label: "Melunasi utang 💳" },
  { value: "control_spending", label: "Mengontrol pengeluaran 📊" },
  { value: "financial_freedom", label: "Mencapai kebebasan finansial 🚀" },
  { value: "other", label: "Lainnya" },
];

function fmtNum(val) {
  const n = parseInt(String(val).replace(/\D/g, ""), 10) || 0;
  return n > 0 ? n.toLocaleString("id-ID") : "";
}
function parseNum(val) { return parseInt(String(val).replace(/\D/g, ""), 10) || 0; }

function ProgressBar({ step, total }) {
  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs text-[#8FA4C8] mb-2">
        <span className="font-semibold">Langkah {step} dari {total}</span>
        <span>{Math.round((step / total) * 100)}%</span>
      </div>
      <div className="h-2 bg-[#F2F4F7] rounded-full overflow-hidden">
        <div className="h-2 bg-[#FF6A00] rounded-full transition-all duration-500"
          style={{ width: `${(step / total) * 100}%` }} />
      </div>
      <div className="flex justify-between mt-2">
        {["Profil", "Keuangan", "Rekening", "Selesai"].map((label, i) => (
          <div key={i} className={`text-[10px] font-semibold ${i + 1 <= step ? "text-[#FF6A00]" : "text-[#CBD5E0]"}`}>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OnboardingQuestionnaire({ onClose }) {
  const savedRaw = localStorage.getItem(STORAGE_KEY);
  const saved = savedRaw ? JSON.parse(savedRaw) : {};

  const [step, setStep] = useState(saved.step || 1);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [photoUrl, setPhotoUrl] = useState(saved.photoUrl || "");
  const [fullName, setFullName] = useState(saved.fullName || "");
  const [phone, setPhone] = useState(saved.phone || "");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoRef = useRef(null);
  const cameraRef = useRef(null);

  // Step 2
  const [monthlyIncome, setMonthlyIncome] = useState(saved.monthlyIncome || 0);
  const [primaryGoal, setPrimaryGoal] = useState(saved.primaryGoal || "");
  const [occupation, setOccupation] = useState(saved.occupation || "");

  // Step 3 — accounts
  const [accounts, setAccounts] = useState(saved.accounts || []);
  const [accName, setAccName] = useState("");
  const [accType, setAccType] = useState("bank");
  const [accBalance, setAccBalance] = useState(0);
  const [accIcon, setAccIcon] = useState("🏦");
  const [accError, setAccError] = useState("");

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      step, photoUrl, fullName, phone, monthlyIncome, primaryGoal, occupation, accounts
    }));
  }, [step, photoUrl, fullName, phone, monthlyIncome, primaryGoal, occupation, accounts]);

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setPhotoUrl(file_url);
    setUploadingPhoto(false);
  }

  function addAccount() {
    if (!accName.trim()) { setAccError("Nama rekening wajib diisi"); return; }
    setAccError("");
    setAccounts(prev => [...prev, { id: Date.now(), name: accName.trim(), type: accType, balance: accBalance, icon: accIcon }]);
    setAccName(""); setAccType("bank"); setAccBalance(0); setAccIcon("🏦");
  }

  async function handleFinish() {
    setSaving(true);
    const promises = [];

    // Update user profile
    promises.push(base44.auth.updateMe({
      full_name: fullName,
      photo_url: photoUrl || undefined,
      phone,
      monthly_income: monthlyIncome || undefined,
      primary_goal: primaryGoal || undefined,
      onboarding_completed: true,
    }));

    // Create accounts
    promises.push(...accounts.map(acc =>
      base44.entities.Account.create({
        name: acc.name,
        type: acc.type,
        balance: acc.balance,
        icon: acc.icon,
        is_default: accounts.indexOf(acc) === 0,
      })
    ));

    // Save monthly income as recurring transaction
    if (monthlyIncome > 0) {
      const firstAcc = accounts[0];
      promises.push(base44.entities.Transaction.create({
        amount: monthlyIncome,
        type: "income",
        category: "salary",
        note: "Pendapatan bulanan",
        date: new Date().toISOString().split("T")[0],
        account_id: undefined,
        is_recurring: true,
        recurring_interval: "monthly",
      }));
    }

    await Promise.all(promises);
    localStorage.removeItem(STORAGE_KEY);
    setSaving(false);
    onClose();
    window.location.reload();
  }

  const initials = fullName ? fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?";

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden max-h-[95dvh] overflow-y-auto">
        <div className="p-6">
          <ProgressBar step={step} total={4} />

          {/* ===== STEP 1: Profil ===== */}
          {step === 1 && (
            <div>
              <div className="text-4xl mb-2 text-center">👋</div>
              <h2 className="text-xl font-bold text-[#1A1A1A] text-center mb-1">Halo! Kenalan dulu yuk</h2>
              <p className="text-sm text-[#8FA4C8] text-center mb-6">Cerita sedikit tentang dirimu</p>

              {/* Photo */}
              <div className="flex flex-col items-center mb-5">
                <div className="w-20 h-20 rounded-full bg-[#F2F4F7] border-2 border-dashed border-[#CBD5E0] flex items-center justify-center mb-2 overflow-hidden relative">
                  {uploadingPhoto ? (
                    <Loader2 className="w-6 h-6 text-[#8FA4C8] animate-spin" />
                  ) : photoUrl ? (
                    <img src={photoUrl} alt="profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-[#8FA4C8]">{initials}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => cameraRef.current?.click()}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FF6A00]/10 text-[#FF6A00] text-xs font-semibold hover:bg-[#FF6A00]/20 transition-colors">
                    <Camera className="w-3.5 h-3.5" /> Kamera
                  </button>
                  <button onClick={() => photoRef.current?.click()}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F2F4F7] text-[#4A5568] text-xs font-semibold hover:bg-[#E2E8F0] transition-colors">
                    <Upload className="w-3.5 h-3.5" /> Upload
                  </button>
                </div>
                <input ref={cameraRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handlePhotoUpload} />
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1.5 block">
                    Nama Lengkap <span className="text-red-400">*</span>
                  </label>
                  <input type="text" placeholder="Masukkan nama lengkapmu"
                    className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-[#F8FAFC]"
                    value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1.5 block">
                    WhatsApp / HP <span className="text-[#CBD5E0]">(opsional)</span>
                  </label>
                  <input type="tel" placeholder="+62 8xx-xxxx-xxxx"
                    className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-[#F8FAFC]"
                    value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>

              <button onClick={() => { if (!fullName.trim()) return; setStep(2); }} disabled={!fullName.trim()}
                className="w-full py-3.5 rounded-xl bg-[#FF6A00] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#e05e00] transition-colors disabled:opacity-40">
                Lanjut <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ===== STEP 2: Keuangan ===== */}
          {step === 2 && (
            <div>
              <div className="text-4xl mb-2 text-center">💰</div>
              <h2 className="text-xl font-bold text-[#1A1A1A] text-center mb-1">Cerita tentang keuanganmu</h2>
              <p className="text-sm text-[#8FA4C8] text-center mb-6">Ini membantu kami memberi rekomendasi yang tepat</p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1.5 block">
                    Pendapatan Bulanan (Rp) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA4C8] font-medium text-sm">Rp</span>
                    <input type="text" inputMode="numeric" placeholder="0"
                      className="w-full border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-3 text-lg font-bold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-[#F8FAFC]"
                      value={fmtNum(monthlyIncome)}
                      onChange={e => setMonthlyIncome(parseNum(e.target.value))} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1.5 block">Tujuan Keuangan Utama</label>
                  <div className="space-y-2">
                    {FINANCIAL_GOALS.map(g => (
                      <button key={g.value} onClick={() => setPrimaryGoal(g.value)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                          primaryGoal === g.value ? "border-[#FF6A00] bg-[#FF6A00]/10 text-[#FF6A00]" : "border-[#E2E8F0] text-[#4A5568] hover:border-[#CBD5E0]"
                        }`}>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1.5 block">
                    Pekerjaan <span className="text-[#CBD5E0]">(opsional)</span>
                  </label>
                  <input type="text" placeholder="Karyawan swasta, wiraswasta, dll"
                    className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-[#F8FAFC]"
                    value={occupation} onChange={e => setOccupation(e.target.value)} />
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(1)}
                  className="w-11 h-11 flex items-center justify-center rounded-xl border border-[#E2E8F0] text-[#4A5568] hover:bg-[#F8FAFC] flex-shrink-0">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button onClick={() => { if (!monthlyIncome) return; setStep(3); }} disabled={!monthlyIncome}
                  className="flex-1 py-3 rounded-xl bg-[#FF6A00] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#e05e00] transition-colors disabled:opacity-40">
                  Lanjut <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ===== STEP 3: Rekening ===== */}
          {step === 3 && (
            <div>
              <div className="text-4xl mb-2 text-center">🏦</div>
              <h2 className="text-xl font-bold text-[#1A1A1A] text-center mb-1">Tambahkan rekeningmu</h2>
              <p className="text-sm text-[#8FA4C8] text-center mb-1">Minimal 1 rekening diperlukan untuk mencatat transaksi</p>

              {/* Added accounts */}
              {accounts.length > 0 && (
                <div className="space-y-2 mb-4">
                  {accounts.map(acc => (
                    <div key={acc.id} className="flex items-center justify-between bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{acc.icon}</span>
                        <div>
                          <p className="text-sm font-semibold text-[#1A1A1A]">{acc.name}</p>
                          <p className="text-xs text-[#8FA4C8]">{acc.type} · Rp {acc.balance.toLocaleString("id-ID")}</p>
                        </div>
                      </div>
                      <button onClick={() => setAccounts(prev => prev.filter(a => a.id !== acc.id))}
                        className="text-[#CBD5E0] hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add account form */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 mb-4">
                <p className="text-xs font-bold text-[#8FA4C8] uppercase tracking-widest mb-3">Tambah Rekening</p>

                {/* Icon picker */}
                <div className="flex gap-2 mb-3 flex-wrap">
                  {ACCOUNT_ICONS.map(icon => (
                    <button key={icon} onClick={() => setAccIcon(icon)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                        accIcon === icon ? "bg-[#FF6A00] scale-110" : "bg-white border border-[#E2E8F0] hover:border-[#CBD5E0]"
                      }`}>
                      {icon}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <input type="text" placeholder="Nama rekening (misal: BCA Tabungan, OVO)"
                    className="w-full border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-white"
                    value={accName} onChange={e => { setAccName(e.target.value); setAccError(""); }} />
                  {accError && <p className="text-xs text-red-500">{accError}</p>}

                  <select value={accType} onChange={e => setAccType(e.target.value)}
                    className="w-full border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-white">
                    {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA4C8] text-sm">Rp</span>
                    <input type="text" inputMode="numeric" placeholder="Saldo awal (boleh 0)"
                      className="w-full border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-white"
                      value={fmtNum(accBalance)}
                      onChange={e => setAccBalance(parseNum(e.target.value))} />
                  </div>

                  <button onClick={addAccount}
                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#FF6A00] text-[#FF6A00] text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#FF6A00]/5 transition-colors">
                    <Plus className="w-4 h-4" /> Tambah Rekening
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(2)}
                  className="w-11 h-11 flex items-center justify-center rounded-xl border border-[#E2E8F0] text-[#4A5568] hover:bg-[#F8FAFC] flex-shrink-0">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setStep(4)} disabled={accounts.length === 0}
                  className="flex-1 py-3 rounded-xl bg-[#FF6A00] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#e05e00] transition-colors disabled:opacity-40">
                  {accounts.length === 0 ? "Tambah min. 1 rekening" : `Lanjut (${accounts.length} rekening) →`}
                </button>
              </div>
            </div>
          )}

          {/* ===== STEP 4: Done ===== */}
          {step === 4 && (
            <div className="text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Semua siap!</h2>
              <p className="text-sm text-[#4A5568] mb-5 leading-relaxed">
                Halo, <strong>{fullName}</strong>! Akunmu sudah siap digunakan.
              </p>

              {/* Summary */}
              <div className="bg-[#F8FAFC] rounded-2xl p-4 mb-6 text-left space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  <div>
                    <p className="text-xs text-[#8FA4C8]">Pendapatan bulanan</p>
                    <p className="text-sm font-bold text-[#1A1A1A]">Rp {monthlyIncome.toLocaleString("id-ID")}</p>
                  </div>
                </div>
                {accounts.map(acc => (
                  <div key={acc.id} className="flex items-center gap-2">
                    <span className="text-lg">{acc.icon}</span>
                    <div>
                      <p className="text-xs text-[#8FA4C8]">{acc.name}</p>
                      <p className="text-sm font-bold text-[#1A1A1A]">Saldo: Rp {acc.balance.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={handleFinish} disabled={saving}
                className="w-full py-4 rounded-xl bg-[#FF6A00] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#e05e00] transition-colors disabled:opacity-50">
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                ) : (
                  <><Check className="w-4 h-4" /> Mulai Pakai Atur Pintar!</>
                )}
              </button>

              <button onClick={() => setStep(3)} className="mt-3 text-xs text-[#8FA4C8] hover:text-[#4A5568] transition-colors">
                ← Kembali
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}