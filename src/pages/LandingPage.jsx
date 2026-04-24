import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowRight, CheckCircle, Mail, Instagram, Twitter, Sparkles, ChevronRight } from "lucide-react";

// ─── Matrix background (same as before) ───────────────────────────────────────
function MatrixBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const cols = Math.floor(w / 18);
    const drops = Array(cols).fill(1);
    const chars = "01アイウエオカキクケコABCDEF∑∆∫πΩ";
    let raf;
    const draw = () => {
      ctx.fillStyle = "rgba(10,10,10,0.06)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = "13px monospace";
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const progress = y / (h / 13);
        if (progress < 0.3) ctx.fillStyle = `rgba(255,106,0,${0.6 + Math.random() * 0.4})`;
        else if (progress < 0.6) ctx.fillStyle = `rgba(255,179,71,${0.3 + Math.random() * 0.3})`;
        else ctx.fillStyle = `rgba(255,106,0,${0.05 + Math.random() * 0.15})`;
        ctx.fillText(char, i * 18, y * 13);
        if (y * 13 > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.45 }} />;
}

// ─── Scroll reveal hook ────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "" }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Live counter ──────────────────────────────────────────────────────────────
const COUNTER_KEY = "ap_visitor_count";
const COUNTER_TS_KEY = "ap_visitor_ts";
const BASE_COUNT = 1247;
const INCREMENT_INTERVAL_MS = 2 * 60 * 1000; // 2 menit

function useLiveCount() {
  const [count, setCount] = useState(() => {
    try {
      const stored = parseInt(localStorage.getItem(COUNTER_KEY), 10);
      const ts = parseInt(localStorage.getItem(COUNTER_TS_KEY), 10);
      if (!stored || !ts) return BASE_COUNT;
      const elapsed = Date.now() - ts;
      const increments = Math.floor(elapsed / INCREMENT_INTERVAL_MS);
      return stored + increments;
    } catch {
      return BASE_COUNT;
    }
  });

  useEffect(() => {
    // Save initial if not stored
    if (!localStorage.getItem(COUNTER_KEY)) {
      localStorage.setItem(COUNTER_KEY, String(BASE_COUNT));
      localStorage.setItem(COUNTER_TS_KEY, String(Date.now()));
    }
    const interval = setInterval(() => {
      setCount(prev => {
        const next = prev + 1;
        localStorage.setItem(COUNTER_KEY, String(next));
        localStorage.setItem(COUNTER_TS_KEY, String(Date.now()));
        return next;
      });
    }, INCREMENT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return count;
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const pricingRef = useRef(null);
  const howRef = useRef(null);
  const liveCount = useLiveCount();

  const handleCTA = () => base44.auth.redirectToLogin();

  const LEVELS = [
    { icon: "🌱", level: "Lv.1", label: "Newbie Ngatur" },
    { icon: "💸", level: "Lv.2", label: "Si Pencatat" },
    { icon: "🎯", level: "Lv.3", label: "Budgeter Muda" },
    { icon: "🤝", level: "Lv.4", label: "Social Saver" },
    { icon: "🧠", level: "Lv.5", label: "Financial Aware" },
    { icon: "🏆", level: "Lv.7", label: "Atur Pintar Pro" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans overflow-x-hidden">
      <MatrixBackground />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .g-text { background: linear-gradient(135deg,#FF6A00 0%,#FFB347 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .glow { box-shadow: 0 0 40px rgba(255,106,0,0.28); }
        .card-d { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
      `}</style>

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center px-5 sm:px-12 lg:px-20 py-3 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/69a82e8090f60786b869983c/d2e52bdf2_3.png" alt="Logo" className="w-7 h-7" />
          <span className="font-black text-white text-sm tracking-tight">Atur Pintar</span>
        </div>
        <div className="hidden sm:flex items-center gap-6 ml-10">
          <button onClick={() => howRef.current?.scrollIntoView({ behavior: "smooth" })} className="text-xs text-white/50 hover:text-white transition-colors">Fitur</button>
          <button onClick={() => pricingRef.current?.scrollIntoView({ behavior: "smooth" })} className="text-xs text-white/50 hover:text-white transition-colors">Harga</button>
          <Link to="/About" className="text-xs text-white/50 hover:text-white transition-colors">Tentang</Link>
        </div>
        <button onClick={handleCTA} className="text-xs font-bold bg-[#FF6A00] hover:bg-[#e05e00] text-white px-4 py-2 rounded-full transition-colors ml-auto">
          Masuk / Daftar
        </button>
      </nav>

      {/* ══════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════ */}
      <section className="pt-28 pb-24 px-5 sm:px-12 lg:px-20 relative z-10 text-center sm:text-left">
        <div className="absolute top-10 left-0 w-[600px] h-[500px] rounded-full bg-[#FF6A00]/6 blur-[140px] pointer-events-none" />
        <div className="max-w-3xl mx-auto sm:mx-0">
          <Reveal>
            <div className="inline-flex items-center gap-2 bg-[#FF6A00]/10 border border-[#FF6A00]/25 rounded-full px-4 py-1.5 mb-7">
              <Sparkles className="w-3 h-3 text-[#FF6A00]" />
              <span className="text-[11px] text-[#FF6A00] font-bold uppercase tracking-wide">AI-Powered Personal Finance</span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.08] mb-6">
              Aplikasi keuangan yang<br />
              <span className="g-text">akhirnya kamu buka tiap hari.</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="text-base sm:text-lg text-white/55 max-w-xl mb-10 leading-relaxed mx-auto sm:mx-0">
              Bukan karena harus — tapi karena seru.<br />
              Catat duit, naik level, saingan sama teman.<br />
              Atur Pintar hadir buat kamu yang capek merasa <em>guilty</em> soal keuangan.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center sm:justify-start mb-8">
              <button
                onClick={handleCTA}
                className="group flex items-center gap-2.5 bg-[#FF6A00] hover:bg-[#e05e00] text-white font-bold text-base px-8 py-4 rounded-2xl transition-all glow hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
              >
                Mulai Gratis Sekarang
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => howRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center gap-2 text-white/60 hover:text-white border border-white/10 hover:border-white/25 font-semibold text-sm px-6 py-4 rounded-2xl transition-all w-full sm:w-auto justify-center"
              >
                Lihat cara kerjanya dulu ↓
              </button>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <p className="text-white/40 text-sm">
              Bergabung dengan{" "}
              <span className="text-[#FF6A00] font-bold tabular-nums">{liveCount.toLocaleString("id-ID")}</span>{" "}
              orang yang udah mulai atur duitnya dengan cara beda.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 2 — PAIN POINT
      ══════════════════════════════════════════════ */}
      <section className="pb-24 px-5 sm:px-12 lg:px-20 relative z-10">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-10 text-center">Jujur deh...</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { emoji: "😮‍💨", text: "Tiap awal bulan niat nabung.\nTiap akhir bulan bingung duitnya ke mana." },
              { emoji: "📱", text: "Udah download 5 aplikasi keuangan.\nSemuanya dibuka sekali, terus lupa." },
              { emoji: "😬", text: "Ngerti teorinya sih.\nTapi eksekusinya... nanti deh." },
            ].map((c, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="card-d rounded-2xl p-6 text-center h-full flex flex-col items-center gap-4">
                  <span className="text-4xl">{c.emoji}</span>
                  <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{c.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <p className="text-center text-white/45 text-sm italic max-w-lg mx-auto leading-relaxed">
              "Kamu gak sendiri. Dan kamu gak butuh lebih banyak teori — kamu butuh cara yang bikin kamu mau lakuin."
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 3 — FITUR UTAMA
      ══════════════════════════════════════════════ */}
      <section ref={howRef} className="pb-24 px-5 sm:px-12 lg:px-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-2 text-center">Kenalan sama cara baru ngatur uang.</h2>
          </Reveal>
          <Reveal delay={60}>
            <p className="text-center text-white/40 text-sm mb-10">Bukan sekadar catatan. Ini pengalaman.</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: "🎮",
                title: "Keuangan yang terasa kayak game.",
                desc: "Setiap kebiasaan finansial yang kamu lakuin = XP. Naik level, unlock fitur baru, jaga streak harianmu. Duit diatur sambil ngerasa menang tiap hari.",
              },
              {
                icon: "✨",
                title: "Kenalan sama Nana — AI bestie finansialmu.",
                desc: "Bukan chatbot kaku. Nana tau pola pengeluaranmu, kasih insight yang jujur, dan cukup lucu buat bikin kamu gak mager buka app. Dia di pihak kamu — selalu.",
              },
              {
                icon: "🏆",
                title: "Saingan nabung sama teman.",
                desc: "Shared wallet, leaderboard, dan challenge bareng. Karena kadang yang bikin kamu konsisten bukan aplikasinya — tapi tahu temenmu lagi ngejar juga.",
              },
              {
                icon: "🔥",
                title: "Kebiasaan kecil, hasil nyata.",
                desc: "Daily missions yang ringan, achievable, dan numpuk jadi perubahan besar. Satu habit per hari sudah cukup untuk mulai.",
              },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 70}>
                <div className="card-d rounded-2xl p-5 hover:border-[#F97316]/30 transition-all group h-full flex flex-col gap-3">
                  <span className="text-3xl">{f.icon}</span>
                  <p className="text-white font-bold text-sm leading-snug">{f.title}</p>
                  <p className="text-white/45 text-xs leading-relaxed flex-1">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 4 — NANA AI SPOTLIGHT
      ══════════════════════════════════════════════ */}
      <section className="pb-24 px-5 sm:px-12 lg:px-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="card-d rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#FF6A00]/5 blur-[100px] pointer-events-none" />

            {/* Left */}
            <Reveal>
              <div className="relative">
                <span className="text-[11px] font-black text-[#FF6A00] uppercase tracking-widest mb-3 block">Nana AI</span>
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">Halo, aku Nana. 👋</h2>
                <p className="text-white/55 text-sm leading-relaxed mb-6">
                  Aku bukan robot yang bakal ceramahin kamu soal investasi setiap pagi. Aku AI yang beneran tau kondisi keuanganmu — dan bakal jujur soal itu, tapi dengan cara yang gak bikin kamu pengen uninstall.
                </p>
                <div className="space-y-2.5 mb-6">
                  {[
                    "Analisa pola pengeluaran personal",
                    "Insight dari data kamu sendiri",
                    "Mood-based advice",
                    "Konteks lokal: THR, kondangan, kost, e-wallet",
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className="text-[#FF6A00] text-xs font-black">✦</span>
                      <p className="text-white/70 text-sm">{b}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[#FF6A00] text-xs italic font-semibold">
                  "Nana AI — financial bestie yang jujur, tapi tetap asik."
                </p>
              </div>
            </Reveal>

            {/* Right — Chat simulation */}
            <Reveal delay={150}>
              <div className="bg-[#0A0A0A] rounded-2xl p-5 border border-white/10 space-y-3">
                {/* Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-white/8">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#FFB347] flex items-center justify-center text-white font-black text-sm">N</div>
                  <div>
                    <p className="text-white text-xs font-bold">Nana AI</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <p className="text-white/40 text-[10px]">Online</p>
                    </div>
                  </div>
                </div>

                {/* Bubble Nana 1 */}
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#FFB347] flex items-center justify-center text-white font-black text-[10px] flex-shrink-0">N</div>
                  <div className="bg-white/7 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                    <p className="text-white/85 text-xs leading-relaxed">
                      Oke gue liat data kamu... GrabFood bulan ini <span className="text-[#FF6A00] font-bold">Rp 680rb</span> (16% total). Gabungin sama kopi = hampir sejuta. Kalau dikurangi 30% aja, setahun bisa nabung <span className="text-[#FF6A00] font-bold">Rp 2,4 juta extra</span>. Masih mau order jam 12 malem? 👀
                    </p>
                  </div>
                </div>

                {/* Bubble User */}
                <div className="flex justify-end">
                  <div className="bg-[#FF6A00] rounded-2xl rounded-tr-sm px-4 py-3 max-w-[75%]">
                    <p className="text-white text-xs leading-relaxed">Oke Nana, gue mau berubah 😅</p>
                  </div>
                </div>

                {/* Bubble Nana 2 */}
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#FFB347] flex items-center justify-center text-white font-black text-[10px] flex-shrink-0">N</div>
                  <div className="bg-white/7 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                    <p className="text-white/85 text-xs leading-relaxed">
                      Sip! Gue udah siapkan challenge 7 hari pertama kamu. Gas? 🔥
                    </p>
                  </div>
                </div>

                <button onClick={handleCTA} className="w-full mt-2 py-2.5 bg-[#FF6A00] rounded-xl text-white text-xs font-bold hover:bg-[#e05e00] transition-colors">
                  Coba Ngobrol sama Nana →
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 5 — GAMIFIKASI
      ══════════════════════════════════════════════ */}
      <section className="pb-24 px-5 sm:px-12 lg:px-20 relative z-10">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl p-8 sm:p-12 text-center overflow-hidden">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0A0A0A] mb-2">Level up bukan cuma di game.</h2>
            <p className="text-[#8FA4C8] text-sm mb-10 max-w-md mx-auto leading-relaxed">
              Di Atur Pintar, setiap kebiasaan finansial yang kamu lakuin punya reward nyata.
            </p>
          </Reveal>

          {/* Level progression */}
          <Reveal delay={100}>
            <div className="flex items-center justify-center flex-wrap gap-2 mb-8">
              {LEVELS.map((lv, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl shadow-md"
                      style={{
                        background: `linear-gradient(135deg, hsl(${120 - i * 20},80%,${50 - i * 2}%) 0%, #FF6A00 100%)`,
                        opacity: 0.85 + i * 0.025,
                      }}
                    >
                      {lv.icon}
                    </div>
                    <p className="text-[9px] font-bold text-[#0A0A0A]">{lv.level}</p>
                    <p className="text-[8px] text-[#8FA4C8] max-w-[64px] leading-tight">{lv.label}</p>
                  </div>
                  {i < LEVELS.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-[#F97316] flex-shrink-0 mb-6" />
                  )}
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={200}>
            <p className="text-[#8FA4C8] text-sm max-w-lg mx-auto leading-relaxed mb-6">
              XP kamu nambah setiap kali catat pengeluaran, jaga streak, selesaikan challenge, atau dengerin saran Nana.
              <br /><span className="text-[#0A0A0A] font-semibold">Karena konsistensi harusnya ada rewardnya.</span>
            </p>
            <button onClick={handleCTA} className="inline-flex items-center gap-2 bg-[#FF6A00] hover:bg-[#e05e00] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all hover:scale-105">
              Mulai Naik Level →
            </button>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 6 — PRICING
      ══════════════════════════════════════════════ */}
      <section ref={pricingRef} className="pb-24 px-5 sm:px-12 lg:px-20 relative z-10">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-2 text-center">Mulai gratis. Upgrade kalau udah ketagihan.</h2>
            <p className="text-center text-white/40 text-sm mb-10">Tanpa kartu kredit. Tanpa syarat tersembunyi.</p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* FREE */}
            <Reveal delay={60}>
              <div className="card-d rounded-2xl p-7 flex flex-col h-full">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Gratis</span>
                <p className="text-3xl font-black text-white mb-0.5">Rp 0</p>
                <p className="text-white/35 text-xs mb-6">per bulan</p>
                <div className="space-y-2.5 flex-1 mb-7">
                  {[
                    "Expense & income tracker",
                    "Daily missions & XP",
                    "Nana AI basic (5 chat/hari)",
                    "Leaderboard teman",
                    "1 financial goal",
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#F97316] flex-shrink-0" />
                      <p className="text-white/60 text-xs">{f}</p>
                    </div>
                  ))}
                </div>
                <button onClick={handleCTA} className="w-full py-3 rounded-xl border border-[#F97316]/50 text-[#F97316] font-bold text-sm hover:bg-[#F97316]/10 transition-colors">
                  Mulai Gratis →
                </button>
              </div>
            </Reveal>

            {/* PLUS */}
            <Reveal delay={120}>
              <div className="relative rounded-2xl p-7 flex flex-col h-full bg-[#FF6A00] border-2 border-[#FF6A00]">
                <div className="absolute -top-3.5 left-6 bg-white text-[#FF6A00] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  POPULER ⭐
                </div>
                <span className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-3">Plus</span>
                <p className="text-3xl font-black text-white mb-0.5">Rp 49.000</p>
                <p className="text-white/70 text-xs mb-1">per bulan</p>
                <p className="text-white/60 text-[11px] mb-6">atau Rp 399.000/tahun <span className="text-white font-bold">(hemat ~32%)</span></p>
                <div className="space-y-2.5 flex-1 mb-7">
                  {[
                    "Semua fitur Free",
                    "Nana AI unlimited chat",
                    "Advanced spending analytics",
                    "Shared wallet unlimited",
                    "Semua level unlocked",
                    "Badge & skin eksklusif",
                    "Laporan PDF bulanan",
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-white text-xs">⭐</span>
                      <p className="text-white/90 text-xs">{f}</p>
                    </div>
                  ))}
                </div>
                <button onClick={handleCTA} className="w-full py-3 rounded-xl bg-white text-[#FF6A00] font-bold text-sm hover:bg-white/90 transition-colors">
                  Coba 30 Hari Gratis →
                </button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <p className="text-center text-white/30 text-xs mt-5 italic">
              Lebih murah dari kopi yang kamu beli tadi pagi. ☕
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 7 — FINAL CTA
      ══════════════════════════════════════════════ */}
      <section className="pb-0 px-5 sm:px-12 lg:px-20 relative z-10">
        <div className="relative rounded-3xl overflow-hidden py-20 px-8 sm:px-16 text-center" style={{ background: "#1A1A2E" }}>
          {/* Decorative blobs */}
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-[#FF6A00]/10 blur-[80px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#FF6A00]/8 blur-[100px] pointer-events-none translate-x-1/3 translate-y-1/3" />

          <Reveal>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black g-text mb-4 leading-tight">
              Duit bukan musuh.<br />Malas yang musuh.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-white/60 text-base mb-10 max-w-md mx-auto">
              Dan Atur Pintar ada buat lawan mager bareng kamu.
            </p>
          </Reveal>
          <Reveal delay={180}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handleCTA}
                className="group flex items-center justify-center gap-2.5 bg-[#FF6A00] hover:bg-[#e05e00] text-white font-bold text-base px-8 py-4 rounded-2xl transition-all glow hover:scale-105 active:scale-95">
                Download Sekarang — Gratis →
              </button>
              <button onClick={() => pricingRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center justify-center gap-2 text-white border border-white/20 hover:border-white/40 font-semibold text-sm px-6 py-4 rounded-2xl transition-all hover:text-white">
                Lihat cara kerjanya dulu ↓
              </button>
            </div>
          </Reveal>
          <Reveal delay={250}>
            <p className="text-white/25 text-xs mt-8">Tersedia sebagai web app. iOS & Android segera hadir.</p>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 pt-10 pb-8 px-5 sm:px-12 lg:px-20 relative z-10 mt-0">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="https://media.base44.com/images/public/69a82e8090f60786b869983c/d2e52bdf2_3.png" alt="Logo" className="w-6 h-6" />
                <span className="text-sm font-black text-white">Atur Pintar</span>
              </div>
              <p className="text-white/30 text-xs leading-relaxed italic">"Duit diatur, hidup lebih pintar."</p>
            </div>
            <div>
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3">Tautan</p>
              <div className="space-y-2">
                <div><Link to="/PrivacyPolicy" className="text-white/30 hover:text-white/70 text-xs transition-colors">Privacy Policy</Link></div>
                <div><Link to="/TermsOfService" className="text-white/30 hover:text-white/70 text-xs transition-colors">Terms of Service</Link></div>
                <div><button onClick={handleCTA} className="text-white/30 hover:text-white/70 text-xs transition-colors">Hubungi Kami</button></div>
              </div>
            </div>
            <div>
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3">Kontak</p>
              <a href="mailto:admin@aturpintar.id" className="flex items-center gap-2 text-white/30 hover:text-white/70 text-xs transition-colors mb-3">
                <Mail className="w-3.5 h-3.5" />
                admin@aturpintar.id
              </a>
              <p className="text-white/20 text-[11px]">aturpintar.app</p>
              <div className="flex items-center gap-3 mt-3">
                <a href="https://instagram.com/aturpintar" target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#F97316]/20 flex items-center justify-center text-white/40 hover:text-[#F97316] transition-colors">
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a href="https://x.com/aturpintar" target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#F97316]/20 flex items-center justify-center text-white/40 hover:text-[#F97316] transition-colors">
                  <Twitter className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-5">
            <p className="text-white/20 text-xs text-center">© 2026 PT Rideff Vreka Tech. All rights reserved. · admin@aturpintar.id · aturpintar.app</p>
          </div>
        </div>
      </footer>
    </div>
  );
}