import { X, Sparkles } from "lucide-react";

export default function NanaIntroModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="p-6 text-center">
          {/* Close button */}
          <div className="flex justify-end mb-2">
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-[#F2F4F7] flex items-center justify-center text-[#4A5568] hover:bg-[#E2E8F0] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nana avatar */}
          <div className="w-24 h-24 rounded-[40px] bg-black border-2 border-[#F97316] overflow-hidden mx-auto mb-4">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a82e8090f60786b869983c/7708b64f5_generated_image.png"
              alt="Nana AI"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Sparkles className="w-4 h-4 text-[#F97316]" />
            <h2 className="text-xl font-bold text-[#1A1A1A]">Kenalan sama Nana!</h2>
          </div>

          <p className="text-sm text-[#4A5568] leading-relaxed mb-5">
            Halo! Aku <span className="font-semibold text-[#F97316]">Nana</span>, asisten keuangan pribadimu berbasis AI. 🎉
          </p>

          <div className="space-y-3 text-left mb-6">
            {[
              { emoji: "💬", text: "Tanya apa saja soal keuanganmu kapan saja" },
              { emoji: "📊", text: "Analisis pengeluaran & beri saran hemat" },
              { emoji: "🎯", text: "Bantu capai target tabungan & lunasi utang" },
              { emoji: "⚡", text: "Notifikasi cerdas sebelum kamu boros" },
            ].map((item) => (
              <div key={item.emoji} className="flex items-start gap-3 bg-[#F8FAFC] rounded-xl px-4 py-2.5">
                <span className="text-lg">{item.emoji}</span>
                <p className="text-sm text-[#1A1A1A] font-medium">{item.text}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-[#8FA4C8] mb-4">
            Klik tombol <span className="font-semibold">ikon Nana</span> di pojok kanan bawah untuk mulai mengobrol.
          </p>

          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-[#F97316] text-white text-sm font-bold hover:bg-[#e05e00] transition-colors"
          >
            Siap, ayo mulai! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}