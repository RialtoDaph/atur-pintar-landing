import { Link } from "react-router-dom";
import { ArrowLeft, Shield, FileText, Mail, Building2 } from "lucide-react";

const APP_VERSION = "1.0.0";

export default function About() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); * { font-family: 'Inter', sans-serif; }`}</style>

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center px-5 sm:px-12 py-3 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/69a82e8090f60786b869983c/d2e52bdf2_3.png" alt="Logo" className="w-6 h-6" />
          <span className="font-black text-white text-sm">Atur Pintar</span>
        </div>
        <button onClick={() => window.history.back()} className="ml-auto flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-5 pt-24 pb-20">
        <p className="text-[#FF6A00] text-xs font-bold uppercase tracking-widest mb-2">Tentang Kami</p>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Atur Pintar</h1>
        <p className="text-white/30 text-xs mb-10">Versi {APP_VERSION}</p>

        <div className="space-y-6">

          {/* Company Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#FF6A00]/15 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#FF6A00]" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">PT Rideff Vreka Tech</p>
                <p className="text-white/40 text-xs">Pengelola Atur Pintar</p>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Atur Pintar dikembangkan oleh <strong className="text-white">PT Rideff Vreka Tech</strong>, perusahaan teknologi Indonesia yang berkomitmen membantu masyarakat mengelola keuangan pribadi dengan lebih cerdas melalui teknologi AI.
            </p>
          </div>

          {/* App Info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
            <p className="text-white font-bold text-sm mb-3">Informasi Aplikasi</p>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Nama Produk</span>
              <span className="text-white font-medium">Atur Pintar</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Versi</span>
              <span className="text-white font-medium">{APP_VERSION}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Pengelola</span>
              <span className="text-white font-medium">PT Rideff Vreka Tech</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Hukum yang Berlaku</span>
              <span className="text-white font-medium">Hukum Republik Indonesia</span>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">Dokumen Legal</p>
            <Link
              to="/PrivacyPolicy"
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/8 transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-semibold">Kebijakan Privasi</p>
                <p className="text-white/40 text-xs">Cara kami melindungi data kamu</p>
              </div>
              <ArrowLeft className="w-4 h-4 text-white/30 rotate-180 group-hover:text-[#FF6A00] transition-colors" />
            </Link>

            <Link
              to="/TermsOfService"
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/8 transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-semibold">Syarat & Ketentuan</p>
                <p className="text-white/40 text-xs">Ketentuan penggunaan layanan</p>
              </div>
              <ArrowLeft className="w-4 h-4 text-white/30 rotate-180 group-hover:text-[#FF6A00] transition-colors" />
            </Link>

            <a
              href="mailto:support@aturpintar.id"
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/8 transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#FF6A00]/15 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-[#FF6A00]" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-semibold">Hubungi Support</p>
                <p className="text-white/40 text-xs">support@aturpintar.id</p>
              </div>
              <ArrowLeft className="w-4 h-4 text-white/30 rotate-180 group-hover:text-[#FF6A00] transition-colors" />
            </a>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/5 py-6 px-5 text-center">
        <p className="text-white/20 text-xs">© 2025 PT Rideff Vreka Tech. Semua hak dilindungi.</p>
        <p className="text-white/15 text-xs mt-1">Atur Pintar adalah produk dari PT Rideff Vreka Tech</p>
      </footer>
    </div>
  );
}