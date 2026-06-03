import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, Lightbulb, HelpCircle, MessageCircle } from "lucide-react";
import { useAppSettings } from "@/components/utils/useAppSettings";
import { Link } from "react-router-dom";
import { TIPS } from "@/components/tips/tipsData";

function TipItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(o => !o)}
      className="w-full text-left border-t border-[#F2F4F7] first:border-0"
    >
      <div className="flex items-start justify-between px-5 py-4 gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <HelpCircle className="w-4 h-4 text-[#F97316] flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-[#1A1A1A] leading-snug">{item.q}</p>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-[#8FA4C8] flex-shrink-0 mt-0.5" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#8FA4C8] flex-shrink-0 mt-0.5" />
        )}
      </div>
      {open && (
        <div className="px-5 pb-4 pt-0">
          <div className="bg-[#FFF5EB] border border-[#F97316]/20 rounded-xl px-4 py-3 ml-7">
            <p className="text-sm text-[#4A5568] leading-relaxed">{item.a}</p>
          </div>
        </div>
      )}
    </button>
  );
}

export default function Tips() {
  const { t } = useAppSettings();
  const [searchQ, setSearchQ] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  const filtered = TIPS
    .map(cat => ({
      ...cat,
      items: cat.items.filter(
        item =>
          item.q.toLowerCase().includes(searchQ.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQ.toLowerCase())
      ),
    }))
    .filter(cat => cat.items.length > 0)
    .filter(cat => !activeCategory || cat.category === activeCategory);

  return (
    <div data-tour="tips-page-hint" className="min-h-screen bg-[#F2F4F7] pb-10">
      {/* Header */}
      <div className="bg-[#0A0A0A] px-5 pt-6 pb-14">
        <div className="max-w-2xl mx-auto">
          <p className="text-[#8FA4C8] text-xs font-medium">Panduan Penggunaan</p>
          <h1 className="text-white text-2xl font-bold mt-0.5">Tips & Bantuan</h1>
          <p className="text-[#8FA4C8] text-sm mt-1">Pelajari cara memaksimalkan Atur Pintar</p>
          <div className="mt-4">
            <input
              value={searchQ}
              onChange={e => { setSearchQ(e.target.value); setActiveCategory(null); }}
              placeholder="Cari tips atau pertanyaan..."
              className="w-full bg-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:border-[#F97316] transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-6 space-y-4">
        {/* Category quick-filter pills */}
        {!searchQ && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${!activeCategory ? "bg-[#F97316] text-white" : "bg-white text-[#8FA4C8] shadow-sm"}`}
            >
              Semua
            </button>
            {TIPS.map((cat, i) => (
              <button
                key={i}
                onClick={() => setActiveCategory(cat.category === activeCategory ? null : cat.category)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${activeCategory === cat.category ? "bg-[#F97316] text-white" : "bg-white text-[#8FA4C8] shadow-sm"}`}
              >
                {cat.category}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <Lightbulb className="w-10 h-10 text-[#8FA4C8] mx-auto mb-3" />
            <p className="text-[#4A5568] font-semibold">Tidak ada hasil ditemukan</p>
            <p className="text-[#8FA4C8] text-sm mt-1">Coba kata kunci lain atau tanya Nana AI</p>
          </div>
        ) : (
          filtered.map((cat, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                <p className="text-sm font-bold text-[#1A1A1A]">{cat.category}</p>
                <span className="text-[10px] text-[#8FA4C8] bg-[#F2F4F7] px-2 py-0.5 rounded-full">{cat.items.length} tips</span>
              </div>
              {cat.items.map((item, j) => (
                <TipItem key={j} item={item} />
              ))}
            </div>
          ))
        )}

        {/* Nana CTA */}
        <div className="bg-[#0A0A0A] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a82e8090f60786b869983c/7708b64f5_generated_image.png"
              alt="Nana AI"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">Masih ada pertanyaan?</p>
            <p className="text-[#8FA4C8] text-xs mt-0.5">Tanya Nana AI — asisten keuangan pribadimu</p>
          </div>
          <Link
            to="/Nana"
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-[#F97316] rounded-xl text-white text-xs font-bold hover:bg-[#ea6a0e] transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Chat
          </Link>
        </div>

        <div className="bg-[#FFF5EB] border border-[#F97316]/20 rounded-2xl p-5 flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-[#F97316] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#F97316] mb-1">Tips Pro 💡</p>
            <p className="text-sm text-[#4A5568]">Catat transaksi sesegera mungkin setelah berbelanja agar tidak lupa. Gunakan fitur scan struk untuk cara tercepat mencatat pengeluaran!</p>
          </div>
        </div>
      </div>
    </div>
  );
}