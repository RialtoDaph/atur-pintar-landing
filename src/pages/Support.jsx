import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Clock, MapPin, MessageCircle, HelpCircle } from "lucide-react";
import SupportContactForm from "@/components/support/SupportContactForm";

export default function Support() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); * { font-family: 'Inter', sans-serif; }`}</style>

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center px-5 sm:px-12 py-3 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/69a82e8090f60786b869983c/d2e52bdf2_3.png" alt="Logo" className="w-6 h-6" />
          <span className="font-black text-white text-sm">Atur Pintar</span>
        </div>
        <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")} className="ml-auto flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-5 pt-24 pb-20">
        <p className="text-[#FF6A00] text-xs font-bold uppercase tracking-widest mb-2">Support</p>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Pusat Bantuan</h1>
        <p className="text-white/40 text-sm mb-10">Ada pertanyaan atau butuh bantuan? Tim kami siap membantu kamu.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
            <div className="w-9 h-9 rounded-full bg-[#F97316]/15 flex items-center justify-center mb-2">
              <Mail className="w-4 h-4 text-[#F97316]" />
            </div>
            <p className="text-white/50 text-[11px] uppercase tracking-wider font-semibold mb-0.5">Email</p>
            <p className="text-white text-sm font-medium">admin@aturpintar.id</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
            <div className="w-9 h-9 rounded-full bg-[#F97316]/15 flex items-center justify-center mb-2">
              <Phone className="w-4 h-4 text-[#F97316]" />
            </div>
            <p className="text-white/50 text-[11px] uppercase tracking-wider font-semibold mb-0.5">Telepon / WhatsApp</p>
            <p className="text-white text-sm font-medium">+62 878-1104-2612</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
            <div className="w-9 h-9 rounded-full bg-[#F97316]/15 flex items-center justify-center mb-2">
              <Clock className="w-4 h-4 text-[#F97316]" />
            </div>
            <p className="text-white/50 text-[11px] uppercase tracking-wider font-semibold mb-0.5">Jam Operasional</p>
            <p className="text-white text-sm font-medium">Senin - Jumat, 09:00 - 18:00 WIB</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
            <div className="w-9 h-9 rounded-full bg-[#F97316]/15 flex items-center justify-center mb-2">
              <MapPin className="w-4 h-4 text-[#F97316]" />
            </div>
            <p className="text-white/50 text-[11px] uppercase tracking-wider font-semibold mb-0.5">Alamat</p>
            <p className="text-white text-sm font-medium leading-snug">Graha Adhiyasa Ciledug, Kab. Cirebon, Jawa Barat</p>
          </div>
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-4 h-4 text-[#FF6A00]" />
            <h2 className="text-white font-bold text-base">Pertanyaan Umum</h2>
          </div>
          <div className="space-y-3">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
              <p className="text-white text-sm font-semibold mb-1">Bagaimana cara membatalkan langganan?</p>
              <p className="text-white/50 text-xs leading-relaxed">Kamu bisa membaca panduan lengkap pembatalan langganan di halaman <Link to="/cancellation-policy" className="text-[#FF6A00] hover:underline">Pembatalan Langganan</Link>.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
              <p className="text-white text-sm font-semibold mb-1">Bagaimana cara mengajukan refund?</p>
              <p className="text-white/50 text-xs leading-relaxed">Untuk pengajuan refund, silakan kunjungi halaman <Link to="/refund-policy" className="text-[#FF6A00] hover:underline">Kebijakan Refund</Link> dan isi form yang tersedia.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
              <p className="text-white text-sm font-semibold mb-1">Berapa lama waktu respons support?</p>
              <p className="text-white/50 text-xs leading-relaxed">Tim kami akan merespons dalam 1-3 hari kerja pada jam operasional Senin-Jumat, 09:00-18:00 WIB.</p>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-4 h-4 text-[#FF6A00]" />
            <h2 className="text-white font-bold text-base">Kirim Pesan</h2>
          </div>
          <p className="text-white/40 text-xs mb-4">Isi form di bawah ini, pesan langsung dikirim ke admin@aturpintar.id</p>
          <SupportContactForm />
        </div>
      </div>

      <footer className="border-t border-white/5 py-6 px-5 text-center">
        <div className="flex items-center justify-center gap-4 mb-2 flex-wrap">
          <Link to="/" className="text-white/30 hover:text-white/60 text-xs transition-colors">Beranda</Link>
          <span className="text-white/15 text-xs">·</span>
          <Link to="/privacy-policy" className="text-white/30 hover:text-white/60 text-xs transition-colors">Kebijakan Privasi</Link>
          <span className="text-white/15 text-xs">·</span>
          <Link to="/terms-of-service" className="text-white/30 hover:text-white/60 text-xs transition-colors">Syarat & Ketentuan</Link>
          <span className="text-white/15 text-xs">·</span>
          <Link to="/refund-policy" className="text-white/30 hover:text-white/60 text-xs transition-colors">Refund</Link>
        </div>
        <p className="text-white/20 text-xs">© 2026 PT Rideff Vreka Tech. Semua hak dilindungi.</p>
      </footer>
    </div>
  );
}