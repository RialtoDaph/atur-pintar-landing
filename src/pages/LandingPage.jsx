import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { usePricing } from "@/hooks/usePricing";
import { CheckCircle, TrendingUp, Sparkles, Users, ArrowRight, Play, Zap, BarChart2, MessageCircle, Shield } from "lucide-react";

const PROBLEMS = [
{ emoji: "💸", text: "Gaji masuk pagi, sore udah gak kerasa ada" },
{ emoji: "😩", text: "Nabung tapi selalu kepake pas butuh-butuhnya" },
{ emoji: "😶‍🌫️", text: "khir bulan cuma bisa nunggu gajian lagi" }];


const STEPS = [
{ num: "01", title: "Tambah pengeluaran", desc: "Ketik atau pilih, selesai dalam 3 detik." },
{ num: "02", title: "Semua langsung tercatat", desc: "Rapi, terorganisir, gak ada yang kelewat." },
{ num: "03", title: "Lihat dashboard kamu", desc: "Kondisi keuangan seketika kelihatan jelas." },
{ num: "04", title: "Nana AI kasih insight", desc: "Langsung tahu kamu boros di mana." },
{ num: "05", title: "Analitik canggih", desc: "Sekali lihat, tau kemana uang pergi tiap bulan." }];


const FEATURES = [
{ icon: <Zap className="w-5 h-5" />, title: "Pencatatan simpel", desc: "Gak ribet. Tambah transaksi dalam hitungan detik." },
{ icon: <BarChart2 className="w-5 h-5" />, title: "Dashboard jelas", desc: "Langsung ngerti kondisi keuangan tanpa pusing." },
{ icon: <TrendingUp className="w-5 h-5" />, title: "Analitik lengkap", desc: "Tau pola kebiasaan kamu dan kapan kamu boros." },
{ icon: <MessageCircle className="w-5 h-5" />, title: "Nana AI", desc: "Kasih saran real berdasarkan data keuangan kamu." }];


// PLANS is now built dynamically inside the component


export default function LandingPage() {
  const { monthly, yearly, monthlyLabel, yearlyLabel, yearlyDiscount, loading: pricingLoading } = usePricing();
  const howRef = useRef(null);
  const featuresRef = useRef(null);
  const pricingRef = useRef(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradePlan, setUpgradePlan] = useState('premium_monthly');

  const handleCTA = () => {
    base44.auth.redirectToLogin();
  };

  const handlePlanCTA = (planKey) => {
    if (planKey === 'free') { base44.auth.redirectToLogin(); return; }
    setUpgradePlan(planKey);
    setShowUpgradeModal(true);
  };

  const scrollToHow = () => {
    howRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const PLANS = [
    {
      key: 'free',
      name: 'Free',
      price: 'Rp 0',
      period: 'Gratis selamanya',
      features: ['Catat transaksi (unlimited)', 'Dashboard keuangan', 'Chat Nana AI (30x/bulan)', 'Anggaran maks. 2 kategori', 'Goals maks. 2 tujuan', 'Analisis AI (3 bulan terakhir)'],
      limits: ['❌ Fitur Investasi', '❌ Analitik lanjutan'],
      cta: 'Mulai Gratis',
      highlight: false,
    },
    {
      key: 'premium_monthly',
      name: 'Premium',
      price: pricingLoading ? '...' : monthlyLabel,
      period: 'per bulan',
      features: ['Semua fitur Free', 'Anggaran & Goals unlimited', 'Nana AI chat unlimited', 'Fitur Investasi penuh', 'Analitik lanjutan semua kartu', 'Export PDF & Google Sheets', 'Custom kategori & widget'],
      limits: [],
      cta: 'Upgrade Sekarang',
      highlight: true,
      badge: 'Populer',
    },
    {
      key: 'premium_yearly',
      name: 'Premium Tahunan',
      price: pricingLoading ? '...' : yearlyLabel,
      period: 'per tahun',
      features: ['Semua fitur Premium', `Hemat ${yearlyDiscount}% vs bulanan`, 'Priority support'],
      limits: [],
      cta: 'Upgrade Sekarang',
      highlight: false,
      badge: yearlyDiscount > 0 ? `Hemat ${yearlyDiscount}%` : 'Best Value',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans overflow-x-hidden">
      {showUpgradeModal && <LandingUpgradeModal plan={upgradePlan} monthly={monthly} yearly={yearly} monthlyLabel={monthlyLabel} yearlyLabel={yearlyLabel} yearlyDiscount={yearlyDiscount} onClose={() => setShowUpgradeModal(false)} />}
      {/* 7. PRICING */}
      <section ref={pricingRef} className="px-5 sm:px-12 lg:px-20 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto sm:mx-0">
          <div className="mb-10 text-center sm:text-left">
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-2">Harga</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Harga sederhana, gak ribet</h2>
            <p className="text-white/40 text-sm mt-2">Akses semua fitur termasuk Nana AI</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLANS.map((plan, i) =>
            <div key={i} className={`relative rounded-2xl p-6 flex flex-col ${plan.highlight ? "bg-[#FF6A00] border border-[#FF6A00]" : "card-d"}`}>
              {plan.badge && <div className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${plan.highlight ? "bg-white text-[#FF6A00]" : "bg-[#FF6A00] text-white"}`}>{plan.badge}</div>}
              <p className="font-black text-base mb-1 text-white">{plan.name}</p>
              <p className={`text-3xl font-black mb-0.5 ${plan.highlight ? "text-white" : "g-text"}`}>{plan.price}</p>
              <p className={`text-xs mb-5 ${plan.highlight ? "text-white/70" : "text-white/35"}`}>{plan.period}</p>
              <div className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((feat, j) =>
                <div key={j} className="flex items-center gap-2">
                  <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${plan.highlight ? "text-white" : "text-[#FF6A00]"}`} />
                  <p className={`text-xs ${plan.highlight ? "text-white/90" : "text-white/60"}`}>{feat}</p>
                </div>
                )}
              </div>
              <button onClick={() => handlePlanCTA(plan.key)} className={`w-full font-bold text-sm py-3 rounded-xl transition-all ${plan.highlight ? "bg-white text-[#FF6A00] hover:bg-white/90" : "border border-white/15 text-white hover:border-[#FF6A00]/50 hover:text-[#FF6A00]"}`}>
                {plan.cta}
              </button>
            </div>
            )}
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="px-5 sm:px-12 lg:px-20 pb-24 relative z-10">
        <div className="max-w-2xl mx-auto sm:mx-0 card-d rounded-3xl p-10 sm:p-14 relative overflow-hidden text-center sm:text-left">
          <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-[#FF6A00]/6 blur-[80px] pointer-events-none" />
          <h2 className="text-2xl sm:text-4xl font-black text-white mb-3 leading-tight relative">
            Kalau kamu gak kontrol uangmu,<br />
            <span className="g-text">uangmu yang kontrol kamu.</span>
          </h2>
          <p className="text-white/40 text-sm mb-8 relative">Mulai gratis sekarang. Gak perlu kartu kredit. Upgrade kapanpun kamu mau.</p>
          <div className="flex justify-center sm:justify-start">
          <button
              onClick={handleCTA}
              className="relative group inline-flex items-center gap-3 bg-[#FF6A00] hover:bg-[#e05e00] text-white font-black text-base px-10 py-4 rounded-2xl transition-all glow hover:scale-105 active:scale-95">
              
            <Users className="w-5 h-5" />
            Mulai Gratis Sekarang
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8 px-5 sm:px-12 lg:px-20 relative z-10 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
          <img src="https://media.base44.com/images/public/69a82e8090f60786b869983c/d2e52bdf2_3.png" alt="Logo" className="w-5 h-5" />
          <span className="text-sm font-black text-white">Atur Pintar</span>
        </div>
        <p className="text-white/20 text-xs mb-3">© 2026 Atur Pintar. Kelola uangmu lebih cerdas.</p>
        <div className="flex items-center justify-center sm:justify-start gap-4">
          <Link to="/PrivacyPolicy" className="text-white/30 hover:text-white/60 text-xs transition-colors">Kebijakan Privasi</Link>
          <span className="text-white/15 text-xs">·</span>
          <Link to="/TermsOfService" className="text-white/30 hover:text-white/60 text-xs transition-colors">Syarat & Ketentuan</Link>
        </div>
      </footer>
    </div>);

}

// Modal upgrade untuk user yang belum/sudah login dari landing page
function LandingUpgradeModal({ plan, monthly, yearly, monthlyLabel, yearlyLabel, yearlyDiscount, onClose }) {
  const [selectedPlan, setSelectedPlan] = useState(plan || 'premium_monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [step, setStep] = useState('check'); // check | register | pay

  useEffect(() => {
    if (document.querySelector('script[src*="snap.midtrans.com"]')) return;
    const script = document.createElement('script');
    script.src = 'https://app.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', 'Mid-client-DbRxTJwt9Fuh-xM6');
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      setIsLoggedIn(auth);
      setStep(auth ? 'pay' : 'register');
    });
  }, []);

  async function triggerPayment() {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('createMidtransTransaction', { plan: selectedPlan });
      const { token } = res.data;
      setLoading(false);
      window.snap.pay(token, {
        onSuccess: async () => {
          const endDate = new Date();
          if (selectedPlan === 'premium_monthly') endDate.setMonth(endDate.getMonth() + 1);
          else endDate.setFullYear(endDate.getFullYear() + 1);
          await base44.auth.updateMe({
            subscription_status: 'active',
            subscription_plan: selectedPlan,
            subscription_end_date: endDate.toISOString().split('T')[0],
          });
          setSuccess(true);
        },
        onPending: async () => {
          await base44.auth.updateMe({ subscription_status: 'pending', subscription_plan: selectedPlan });
          setSuccess(true);
        },
        onError: () => setError('Pembayaran gagal. Silakan coba lagi.'),
      });
    } catch (e) {
      setLoading(false);
      setError('Terjadi kesalahan. Coba lagi.');
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4">
        <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-sm p-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-xl font-bold text-white mb-2">Selamat datang di Premium!</p>
          <p className="text-white/50 text-sm mb-6">Akses premium kamu sudah aktif. Mulai jelajahi semua fitur.</p>
          <button onClick={() => { onClose(); window.location.href = '/Dashboard'; }} className="w-full py-3 bg-[#FF6A00] text-white rounded-xl font-bold hover:bg-[#e05e00] transition-colors">Ke Dashboard →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#FF6A00] to-[#FF8C42] p-5">
          <p className="text-white font-black text-lg mb-0.5">🚀 Satu langkah lagi</p>
          <p className="text-white/75 text-xs">menuju finansial lebih sehat</p>
        </div>
        <div className="p-5">
          {/* Plan Selector */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <button onClick={() => setSelectedPlan('premium_monthly')} className={`p-3 rounded-xl border-2 text-left transition-all ${selectedPlan === 'premium_monthly' ? 'border-[#FF6A00] bg-[#FF6A00]/10' : 'border-white/10'}`}>
              <p className="text-white/50 text-[10px]">Bulanan</p>
              <p className="text-white font-black text-sm">{monthlyLabel}</p>
              <p className="text-white/30 text-[10px]">/bulan</p>
            </button>
            <button onClick={() => setSelectedPlan('premium_yearly')} className={`p-3 rounded-xl border-2 text-left relative transition-all ${selectedPlan === 'premium_yearly' ? 'border-purple-400 bg-purple-500/10' : 'border-white/10'}`}>
              {yearlyDiscount > 0 && <span className="absolute -top-2 -right-1 bg-purple-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Hemat {yearlyDiscount}%</span>}
              <p className="text-white/50 text-[10px]">Tahunan</p>
              <p className="text-white font-black text-sm">{yearlyLabel}</p>
              <p className="text-white/30 text-[10px]">/tahun</p>
            </button>
          </div>

          {step === 'register' && isLoggedIn === false && (
            <div className="space-y-3 mb-4">
              <p className="text-white/60 text-xs font-medium">Daftar dulu, lalu lanjut bayar:</p>
              <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Nama Lengkap" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#FF6A00]" />
              <input value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="Alamat Email" type="email" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#FF6A00]" />
              <p className="text-white/30 text-[10px]">Dengan mendaftar, kamu menyetujui <Link to="/TermsOfService" className="text-[#FF6A00] hover:underline" target="_blank">Syarat & Ketentuan</Link> dan <Link to="/PrivacyPolicy" className="text-[#FF6A00] hover:underline" target="_blank">Kebijakan Privasi</Link> kami.</p>
            </div>
          )}

          {error && <p className="text-red-400 text-xs mb-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

          <button
            onClick={() => { if (isLoggedIn) triggerPayment(); else base44.auth.redirectToLogin(); }}
            disabled={loading}
            className="w-full py-3 bg-[#FF6A00] hover:bg-[#e05e00] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
          >
            {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Memproses...</> : isLoggedIn ? '⚡ Bayar Sekarang' : '🔑 Daftar & Lanjut Bayar'}
          </button>
          <p className="text-white/25 text-[10px] text-center mt-2">Pembayaran aman via Midtrans · SSL Encrypted</p>
        </div>
      </div>
    </div>
  );
}