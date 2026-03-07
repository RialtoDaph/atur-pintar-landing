import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, ChevronRight, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAppSettings } from "@/components/utils/useAppSettings";

const CATEGORY_LABELS = {
  housing: { id: "Rumah/Sewa", en: "Housing/Rent", emoji: "🏠" },
  food: { id: "Makanan", en: "Food", emoji: "🍔" },
  transport: { id: "Transportasi", en: "Transport", emoji: "🚗" },
  health: { id: "Kesehatan", en: "Health", emoji: "❤️" },
  entertainment: { id: "Hiburan", en: "Entertainment", emoji: "🎬" },
  shopping: { id: "Belanja", en: "Shopping", emoji: "🛍️" },
  subscriptions: { id: "Langganan", en: "Subscriptions", emoji: "📱" },
  other: { id: "Lainnya", en: "Other", emoji: "📦" },
};

function getCatLabel(key, lang) {
  const meta = CATEGORY_LABELS[key] || { emoji: "📦", id: key, en: key };
  return `${meta.emoji} ${lang === "id" ? meta.id : meta.en}`;
}

export default function SavingsRecommendationWidget({ spendingByCategory, budgets, transactions3M }) {
  const { formatCurrency, settings } = useAppSettings();
  const lang = settings.language || "id";
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [expanded, setExpanded] = useState(false);

  // Compute 3-month average per category from transactions3M
  const catAvg3M = {};
  if (transactions3M?.length > 0) {
    const catSum = {};
    const months = new Set();
    transactions3M.forEach((tx) => {
      if (tx.type !== "expense") return;
      const m = tx.date?.slice(0, 7);
      if (m) months.add(m);
      const c = tx.category || "other";
      catSum[c] = (catSum[c] || 0) + tx.amount;
    });
    const numMonths = Math.max(months.size, 1);
    Object.entries(catSum).forEach(([k, v]) => { catAvg3M[k] = Math.round(v / numMonths); });
  }

  // Detect spikes
  const spikes = Object.entries(spendingByCategory)
    .filter(([k, v]) => catAvg3M[k] && v > catAvg3M[k] * 1.15)
    .map(([k, v]) => ({ key: k, thisMonth: v, avg: catAvg3M[k], diff: v - catAvg3M[k], pct: Math.round(((v - catAvg3M[k]) / catAvg3M[k]) * 100) }))
    .sort((a, b) => b.diff - a.diff);

  // Over-budget categories
  const overBudget = budgets.filter((b) => (spendingByCategory[b.category] || 0) > b.amount);

  const hasInsights = spikes.length > 0 || overBudget.length > 0;

  async function getRecommendation() {
    setLoading(true);
    setExpanded(true);

    const fmt = (n) => `Rp ${Math.round(n || 0).toLocaleString("id-ID")}`;

    const spikesText = spikes.map((s) =>
      `- ${getCatLabel(s.key, lang)}: bulan ini ${fmt(s.thisMonth)}, rata-rata 3 bulan lalu ${fmt(s.avg)} (+${s.pct}%, lebih ${fmt(s.diff)})`
    ).join("\n");

    const overText = overBudget.map((b) => {
      const spent = spendingByCategory[b.category] || 0;
      return `- ${getCatLabel(b.category, lang)}: limit ${fmt(b.amount)}, terpakai ${fmt(spent)} (lebih ${fmt(spent - b.amount)})`;
    }).join("\n");

    const prompt = `Analisis pola pengeluaran bulanan pengguna dan berikan rekomendasi penghematan yang spesifik dan actionable.

${spikesText ? `LONJAKAN PENGELUARAN vs rata-rata 3 bulan:\n${spikesText}\n` : ""}
${overText ? `KATEGORI MELEBIHI ANGGARAN:\n${overText}\n` : ""}
${!spikesText && !overText ? "Pengeluaran bulan ini relatif normal, tidak ada lonjakan signifikan." : ""}

Berikan 3-5 rekomendasi konkret dalam format:
1. Kategori yang paling bisa dihemat
2. Estimasi penghematan dalam Rupiah
3. Tips praktis yang bisa langsung dilakukan

Format jawaban: singkat, padat, gunakan bullet points. Maksimal 200 kata.`;

    try {
      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      setRecommendation(typeof res === "string" ? res : res?.response || "");
    } catch (e) {
      setRecommendation("Gagal memuat rekomendasi. Coba lagi.");
    }
    setLoading(false);
  }

  if (!hasInsights && !recommendation) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#00C9A7]/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-[#00C9A7]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#1A1A1A]">
            {lang === "id" ? "Pengeluaran Bulan Ini Normal 🎉" : "Spending On Track 🎉"}
          </p>
          <p className="text-xs text-[#8FA4C8]">
            {lang === "id" ? "Tidak ada lonjakan vs rata-rata 3 bulan lalu" : "No spikes vs 3-month average"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => { if (!recommendation && !loading) getRecommendation(); else setExpanded(e => !e); }}
        className="w-full flex items-center gap-3 p-4 hover:bg-[#F8FAFC] transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-[#FF6A00]/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-[#FF6A00]" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-[#1A1A1A]">
            {lang === "id" ? "Rekomendasi Penghematan Nana AI" : "Nana AI Savings Tips"}
          </p>
          <p className="text-xs text-[#8FA4C8]">
            {spikes.length > 0
              ? (lang === "id" ? `${spikes.length} kategori melonjak vs bulan lalu` : `${spikes.length} categories spiked vs avg`)
              : (lang === "id" ? `${overBudget.length} kategori melebihi anggaran` : `${overBudget.length} categories over budget`)}
          </p>
        </div>
        {loading ? (
          <Loader2 className="w-4 h-4 text-[#FF6A00] animate-spin flex-shrink-0" />
        ) : (
          <ChevronRight className={`w-4 h-4 text-[#8FA4C8] flex-shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`} />
        )}
      </button>

      {/* Spike badges */}
      {spikes.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {spikes.slice(0, 4).map((s) => (
            <span key={s.key} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[#FF6B6B]/10 text-[#FF6B6B]">
              {getCatLabel(s.key, lang)} +{s.pct}%
            </span>
          ))}
        </div>
      )}

      {/* Recommendation content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-[#F2F4F7] pt-3">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[#8FA4C8]">
              <Loader2 className="w-4 h-4 animate-spin" />
              {lang === "id" ? "Nana sedang menganalisis pola pengeluaranmu..." : "Nana is analyzing your spending pattern..."}
            </div>
          ) : recommendation ? (
            <ReactMarkdown className="prose prose-sm max-w-none text-[#1A1A1A] [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:my-2 [&>li]:mb-1 [&>strong]:font-semibold text-xs">
              {recommendation}
            </ReactMarkdown>
          ) : null}
        </div>
      )}
    </div>
  );
}