import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle, ChevronDown, X, TrendingUp, ArrowRight, Sparkles, Zap } from "lucide-react";

const SALARY_OPTIONS = [
  "< Rp 3.000.000",
  "Rp 3.000.000 – 5.000.000",
  "Rp 5.000.000 – 10.000.000",
  "Rp 10.000.000 – 20.000.000",
  "> Rp 20.000.000",
];
const TRACKING_OPTIONS = ["Tidak mencatat", "Notes di HP", "Excel / Spreadsheet", "Aplikasi lain"];
const INTEREST_OPTIONS = ["Ya", "Mungkin", "Belum yakin"];

const PROBLEMS = [
  { emoji: "💸", text: "Gaji masuk, tapi gak tau kemana hilangnya" },
  { emoji: "🐷", text: "Udah coba nabung, tapi selalu kepake" },
  { emoji: "😶‍🌫️", text: "Gak pernah tau kondisi keuangan sendiri" },
];

const STEPS = [
  { num: "01", label: "Tambah pengeluaran" },
  { num: "02", label: "Semua langsung tercatat" },
  { num: "03", label: "Lihat dashboard" },
  { num: "04", label: "Nana AI kasih insight" },
  { num: "05", label: "Analitik canggih — sekali lihat tau kemana uang pergi" },
];

const FEATURES = [
  { emoji: "⚡", title: "Pencatatan simpel", desc: "Gak ribet, 3 detik selesai" },
  { emoji: "📊", title: "Dashboard jelas", desc: "Langsung ngerti kondisi keuangan" },
  { emoji: "🔍", title: "Analitik", desc: "Tau kebiasaan kamu dari data nyata" },
  { emoji: "🤖", title: "Nana AI", desc: "Kasih saran keuangan yang real" },
];

const PRICING = [
  {
    name: "Gratis",
    price: "Rp 0",
    period: "30 hari pertama",
    highlight: false,
    cta: "Mulai Gratis",
    features: ["Semua fitur tersedia", "Nana AI aktif", "Tidak perlu kartu kredit"],
  },
  {
    name: "Premium",
    price: "Rp 39.000",
    period: "per bulan",
    highlight: true,
    cta: "Coba Gratis 30 Hari",
    features: ["Semua fitur termasuk Nana AI", "Analitik canggih", "Dashboard real-time", "Support prioritas"],
  },
  {
    name: "Tahunan",
    price: "Rp 299.000",
    period: "per tahun",
    highlight: false,
    badge: "Hemat 36%",
    cta: "Pilih Tahunan",
    features: ["Semua fitur Premium", "Hemat Rp 169.000/tahun", "Nana AI unlimited"],
  },
];

export default function LandingPage() {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(null);
  const [form, setForm] = useState({
    name: "", email: "", whatsapp: "", job: "",
    salary_estimate: "", city: "", biggest_money_problem: "",
    current_finance_tracking_method: "", early_access_interest: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    base44.entities.WaitingList.list("-created_date", 1000)
      .then((data) => setCount(data.length))
      .catch(() => setCount(0));
  }, [submitted]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nama wajib diisi";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email tidak valid";
    if (!form.job.trim()) e.job = "Pekerjaan wajib diisi";
    if (!form.salary_estimate) e.salary_estimate = "Pilih perkiraan gaji";
    if (!form.city.trim()) e.city = "Asal kota wajib diisi";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    await base44.entities.WaitingList.create(form);
    setLoading(false);
    setSubmitted(true);
  };

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  };

  const slotsLeft = count !== null ? Math.max(0, 500 - count) : null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .gt { background: linear-gradient(135deg, #FF6A00 0%, #FFB347 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .glow { box-shadow: 0 0 40px rgba(255,106,0,0.3); }
        .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
        .idk { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: white; }
        .idk:focus { outline: none; border-color: #FF6A00; box-shadow: 0 0 0 3px rgba(255,106,0,0.15); }
        .idk::placeholder { color: rgba(255,255,255,0.3); }
        .ierr { border-color: #EF4444 !important; }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/69a82e8090f60786b869983c/d2e52bdf2_3.png" alt="Logo" className="w-8 h-8" />
          <span className="font-bold text-white text-sm">Atur Pintar</span>
        </div>
        {slotsLeft !== null && slotsLeft > 0 && (
          <div className="hidden sm:flex items-center gap-2 bg-[#FF6A00]/10 border border-[#FF6A00]/20 rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] animate-pulse" />
            <span className="text-xs text-[#FF6A00] font-semibold">{slotsLeft} slot tersisa</span>
          </div>
        )}
        <button
          onClick={() => setShowForm(true)}
          className="text-xs font-bold bg-[#FF6A00] hover:bg-[#e05e00] text-white px-4 py-2 rounded-full transition-colors"
        >
          Coba Gratis
        </button>
      </nav>

      {/* ── 1. HERO ── */}
      <section className="pt-32 pb-20 px-5 text-center relative">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#FF6A00]/10 blur-[120px] pointer-events-none" />

        {/* Urgency badge */}
        <div className="inline-flex items-center gap-2 bg-[#FF6A00]/10 border border-[#FF6A00]/25 rounded-full px-4 py-1.5 mb-7">
          <Sparkles className="w-3.5 h-3.5 text-[#FF6A00]" />
          <span className="text-xs text-[#FF6A00] font-bold">Gratis untuk 500 user pertama</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black leading-tight mb-5 max-w-2xl mx-auto">
          Uang kamu hilang{" "}
          <span className="gt">tanpa sadar?</span>
        </h1>

        <p className="text-base sm:text-lg text-white/55 max-w-md mx-auto mb-10 leading-relaxed">
          Atur Pintar bantu kamu catat pengeluaran dan kasih insight dari AI biar kamu <span className="text-white font-semibold">gak boros lagi.</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <button
            onClick={() => setShowForm(true)}
            className="group flex items-center gap-2 bg-[#FF6A00] hover:bg-[#e05e00] text-white font-bold text-base px-8 py-4 rounded-2xl transition-all glow hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
          >
            Coba Gratis Sekarang
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href="#cara-kerja"
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium transition-colors"
          >
            Lihat Cara Kerja ↓
          </a>
        </div>

        {count !== null && (
          <div className="flex items-center justify-center gap-2">
            <div className="flex -space-x-2">
              {["🧑‍💼","👩‍💻","🧑‍🎓","👩‍💼","🧑‍🍳"].map((e, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-[#1A1A1A] border-2 border-[#0A0A0A] flex items-center justify-center text-sm">{e}</div>
              ))}
            </div>
            <p className="text-sm text-white/50">
              <span className="text-white font-bold">{count}</span> orang sudah bergabung
              {slotsLeft > 0 && <span className="text-[#FF6A00]"> · {slotsLeft} slot tersisa</span>}
            </p>
          </div>
        )}
      </section>

      {/* ── 2. PROBLEM ── */}
      <section className="px-5 pb-20 max-w-xl mx-auto">
        <p className="text-center text-white/30 text-xs font-bold uppercase tracking-widest mb-4">Kamu pernah ngerasain ini?</p>
        <h2 className="text-center text-2xl sm:text-3xl font-black text-white mb-8">Jujur deh... 👇</h2>
        <div className="space-y-3">
          {PROBLEMS.map((p, i) => (
            <div key={i} className="card rounded-2xl px-5 py-4 flex items-center gap-4">
              <span className="text-2xl">{p.emoji}</span>
              <p className="text-white/80 font-medium text-sm leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 bg-[#FF6A00]/8 border border-[#FF6A00]/20 rounded-2xl px-5 py-4 text-center">
          <p className="text-white/70 text-sm">Kalau iya, kamu <span className="text-white font-bold">gak sendirian.</span> Dan ini bukan soal gaji — ini soal <span className="text-[#FF6A00] font-bold">kebiasaan.</span></p>
        </div>
      </section>

      {/* ── 3. SOLUTION ── */}
      <section className="px-5 pb-20 max-w-xl mx-auto text-center">
        <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-4">Solusinya</p>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Dengan Atur Pintar:</h2>
        <p className="text-white/50 text-sm mb-8">Simple. Cepat. Pintar.</p>
        <div className="space-y-3 text-left mb-8">
          {[
            { emoji: "⚡", text: "Catat transaksi dalam 3 detik" },
            { emoji: "📱", text: "Lihat kondisi keuangan langsung" },
            { emoji: "🤖", text: "Dapat insight dari Nana AI" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-4 card rounded-2xl px-5 py-4">
              <span className="text-xl">{s.emoji}</span>
              <p className="text-white font-semibold text-sm">{s.text}</p>
              <CheckCircle className="w-4 h-4 text-[#FF6A00] ml-auto flex-shrink-0" />
            </div>
          ))}
        </div>
        <div className="bg-gradient-to-r from-[#FF6A00]/15 to-[#FFB347]/10 border border-[#FF6A00]/25 rounded-2xl px-6 py-5">
          <p className="text-white font-bold text-base leading-relaxed">
            "Bukan cuma catat.<br />Tapi <span className="gt">ngerti uang kamu.</span>"
          </p>
        </div>
      </section>

      {/* ── 4. DEMO FLOW ── */}
      <section id="cara-kerja" className="px-5 pb-20 max-w-2xl mx-auto">
        <p className="text-center text-white/30 text-xs font-bold uppercase tracking-widest mb-4">Cara Kerja</p>
        <h2 className="text-center text-2xl sm:text-3xl font-black text-white mb-10">Semudah 5 langkah 👆</h2>
        <div className="relative">
          {/* vertical line */}
          <div className="absolute left-6 top-6 bottom-6 w-px bg-white/8" />
          <div className="space-y-4">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-5 relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm z-10 ${i === 3 ? "bg-[#FF6A00] text-white" : "bg-[#1A1A1A] border border-white/10 text-white/50"}`}>
                  {s.num}
                </div>
                <div className="card rounded-2xl px-5 py-3.5 flex-1">
                  <p className="text-white text-sm font-semibold">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. FEATURES ── */}
      <section className="px-5 pb-20 max-w-2xl mx-auto">
        <p className="text-center text-white/30 text-xs font-bold uppercase tracking-widest mb-4">Fitur</p>
        <h2 className="text-center text-2xl sm:text-3xl font-black text-white mb-10">Yang kamu butuhkan, <span className="gt">ada semua.</span></h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="card rounded-2xl p-6 hover:border-[#FF6A00]/30 transition-all hover:bg-white/[0.06]">
              <div className="text-3xl mb-3">{f.emoji}</div>
              <h3 className="font-bold text-white mb-1">{f.title}</h3>
              <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. SOCIAL PROOF ── */}
      <section className="px-5 pb-20 max-w-xl mx-auto text-center">
        <div className="card rounded-3xl p-8">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-white font-bold text-lg leading-relaxed mb-3">
            "Dirancang untuk membantu kamu yang sering bingung kemana uang pergi."
          </p>
          <p className="text-white/40 text-sm">Sudah digunakan oleh early users</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {["😊","🙌","💪","🧠","✨"].map((e, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-[#1A1A1A] border-2 border-[#0A0A0A] flex items-center justify-center text-sm">{e}</div>
              ))}
            </div>
            {count !== null && (
              <p className="text-sm text-white/50"><span className="text-white font-bold">{count}</span> orang bergabung</p>
            )}
          </div>
          {/* Slot progress */}
          {count !== null && (
            <div className="mt-5">
              <div className="flex justify-between text-xs text-white/30 mb-2">
                <span>{count} dari 500 slot terisi</span>
                <span className="text-[#FF6A00]">{slotsLeft} tersisa</span>
              </div>
              <div className="w-full bg-white/8 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#FF6A00] to-[#FFB347] h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((count / 500) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 7. PRICING ── */}
      <section className="px-5 pb-20 max-w-3xl mx-auto">
        <p className="text-center text-white/30 text-xs font-bold uppercase tracking-widest mb-4">Harga</p>
        <h2 className="text-center text-2xl sm:text-3xl font-black text-white mb-2">Harga sederhana</h2>
        <p className="text-center text-white/40 text-sm mb-10">Akses semua fitur termasuk Nana AI</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PRICING.map((plan, i) => (
            <div
              key={i}
              className={`rounded-2xl p-6 relative ${plan.highlight ? "bg-[#FF6A00] glow" : "card"}`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">{plan.badge}</span>
              )}
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-[#FF6A00] text-[10px] font-bold px-3 py-1 rounded-full">PALING POPULER</span>
              )}
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${plan.highlight ? "text-white/70" : "text-white/40"}`}>{plan.name}</p>
              <p className={`text-2xl font-black mb-0.5 ${plan.highlight ? "text-white" : "text-white"}`}>{plan.price}</p>
              <p className={`text-xs mb-5 ${plan.highlight ? "text-white/70" : "text-white/40"}`}>{plan.period}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className={`flex items-center gap-2 text-xs ${plan.highlight ? "text-white/90" : "text-white/60"}`}>
                    <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${plan.highlight ? "text-white" : "text-[#FF6A00]"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowForm(true)}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${plan.highlight ? "bg-white text-[#FF6A00] hover:bg-white/90" : "bg-[#FF6A00]/10 border border-[#FF6A00]/30 text-[#FF6A00] hover:bg-[#FF6A00]/20"}`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── 8. FINAL CTA ── */}
      <section className="px-5 pb-28 max-w-2xl mx-auto text-center">
        <div className="card rounded-3xl p-10 glow relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF6A00]/10 to-transparent pointer-events-none" />
          <div className="relative">
            <Zap className="w-10 h-10 text-[#FF6A00] mx-auto mb-5" />
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-6">
              "Kalau kamu gak kontrol uangmu,{" "}
              <span className="gt">uangmu yang kontrol kamu.</span>"
            </h2>
            <button
              onClick={() => setShowForm(true)}
              className="group inline-flex items-center gap-2 bg-[#FF6A00] hover:bg-[#e05e00] text-white font-bold text-base px-10 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              Coba Gratis Sekarang
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            {slotsLeft !== null && slotsLeft > 0 && (
              <p className="mt-3 text-xs text-white/30">⚡ Hanya tersisa <span className="text-[#FF6A00] font-bold">{slotsLeft}</span> slot gratis</p>
            )}
          </div>
        </div>
      </section>

      {/* ── FORM MODAL ── */}
      {showForm && !submitted && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-6 px-4">
          <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl p-7 relative my-auto">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-[#FF6A00] flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-semibold text-[#FF6A00]">Atur Pintar — Daftar Gratis</span>
              </div>
              <h2 className="text-xl font-black text-white">Coba Gratis Sekarang</h2>
              <p className="text-sm text-white/40 mt-1">Isi form ini untuk mendapatkan akses pertama, gratis.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white/60 mb-1.5 block">Nama Lengkap *</label>
                <input className={`idk w-full rounded-xl px-4 py-3 text-sm ${errors.name ? "ierr" : ""}`} placeholder="John Doe" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-white/60 mb-1.5 block">Email *</label>
                <input type="email" className={`idk w-full rounded-xl px-4 py-3 text-sm ${errors.email ? "ierr" : ""}`} placeholder="nama@email.com" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-white/60 mb-1.5 block">WhatsApp <span className="text-white/30">(opsional)</span></label>
                <input className="idk w-full rounded-xl px-4 py-3 text-sm" placeholder="08xx-xxxx-xxxx" value={form.whatsapp} onChange={(e) => handleChange("whatsapp", e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/60 mb-1.5 block">Pekerjaan *</label>
                <input className={`idk w-full rounded-xl px-4 py-3 text-sm ${errors.job ? "ierr" : ""}`} placeholder="Karyawan, Freelancer, Mahasiswa..." value={form.job} onChange={(e) => handleChange("job", e.target.value)} />
                {errors.job && <p className="text-xs text-red-400 mt-1">{errors.job}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-white/60 mb-1.5 block">Perkiraan Gaji / Bulan *</label>
                <div className="relative">
                  <select className={`idk w-full rounded-xl px-4 py-3 text-sm appearance-none ${errors.salary_estimate ? "ierr" : ""} ${!form.salary_estimate ? "text-white/30" : "text-white"}`} value={form.salary_estimate} onChange={(e) => handleChange("salary_estimate", e.target.value)}>
                    <option value="" disabled>Pilih rentang gaji</option>
                    {SALARY_OPTIONS.map((s) => <option key={s} value={s} className="bg-[#111] text-white">{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
                {errors.salary_estimate && <p className="text-xs text-red-400 mt-1">{errors.salary_estimate}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-white/60 mb-1.5 block">Asal Kota *</label>
                <input className={`idk w-full rounded-xl px-4 py-3 text-sm ${errors.city ? "ierr" : ""}`} placeholder="Jakarta, Bandung, Surabaya..." value={form.city} onChange={(e) => handleChange("city", e.target.value)} />
                {errors.city && <p className="text-xs text-red-400 mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-white/60 mb-2 block">Kamu saat ini mencatat keuangan pakai apa?</label>
                <div className="grid grid-cols-2 gap-2">
                  {TRACKING_OPTIONS.map((opt) => (
                    <button type="button" key={opt} onClick={() => handleChange("current_finance_tracking_method", opt)}
                      className={`text-xs px-3 py-2.5 rounded-xl border font-medium transition-all text-left ${form.current_finance_tracking_method === opt ? "bg-[#FF6A00]/10 border-[#FF6A00] text-[#FF6A00]" : "border-white/10 text-white/50 hover:border-white/20"}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/60 mb-2 block">Bersedia coba versi awal?</label>
                <div className="flex gap-2">
                  {INTEREST_OPTIONS.map((opt) => (
                    <button type="button" key={opt} onClick={() => handleChange("early_access_interest", opt)}
                      className={`flex-1 text-xs px-3 py-2.5 rounded-xl border font-medium transition-all ${form.early_access_interest === opt ? "bg-[#FF6A00]/10 border-[#FF6A00] text-[#FF6A00]" : "border-white/10 text-white/50 hover:border-white/20"}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#FF6A00] hover:bg-[#e05e00] disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all mt-2 text-sm">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mendaftarkan...
                  </span>
                ) : "🚀 Coba Gratis Sekarang"}
              </button>
              <p className="text-center text-white/25 text-[10px]">Tidak perlu kartu kredit. Gratis 30 hari.</p>
            </form>
          </div>
        </div>
      )}

      {/* ── SUCCESS MODAL ── */}
      {submitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-9 h-9 text-green-400" />
            </div>
            <h2 className="text-xl font-black text-white mb-3">Kamu sudah masuk! 🎉</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Terima kasih! Kamu sudah masuk waiting list Atur Pintar.<br />
              Kami akan hubungi kamu saat akses awal dibuka.
            </p>
            <div className="card rounded-2xl p-4 mb-5">
              <p className="text-xs text-white/40 mb-1">Total yang sudah bergabung</p>
              <p className="text-3xl font-black gt">{count}</p>
              <p className="text-xs text-white/40 mt-1">dari 500 slot</p>
            </div>
            <button onClick={() => { setShowForm(false); setSubmitted(false); }} className="w-full bg-white/8 hover:bg-white/12 border border-white/10 text-white/60 text-sm font-medium py-3 rounded-xl transition-colors">
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="https://media.base44.com/images/public/69a82e8090f60786b869983c/d2e52bdf2_3.png" alt="Logo" className="w-6 h-6" />
          <span className="text-sm font-bold text-white">Atur Pintar</span>
        </div>
        <p className="text-white/25 text-xs">© 2025 Atur Pintar. AI Financial Tracker untuk generasi muda.</p>
      </footer>
    </div>
  );
}