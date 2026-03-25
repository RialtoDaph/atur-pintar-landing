import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, RefreshCw } from "lucide-react";

export default function AICardInsight({ type, data, formatCurrency }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const cacheRef = useRef({});

  const buildPrompt = () => {
    if (type === "budget") {
      const lines = data.map(d => `- ${d.name}: anggaran ${formatCurrency(d.budget)}, pengeluaran ${formatCurrency(d.spent)} (${d.budget > 0 ? ((d.spent / d.budget) * 100).toFixed(0) : 0}%)`).join("\n");
      return `Kamu adalah asisten keuangan pribadi yang cerdas. Berikan 1-2 kalimat insight singkat dan personal (Bahasa Indonesia, santai tapi helpful) berdasarkan perbandingan anggaran vs pengeluaran berikut:\n${lines}\nFokus pada kategori yang paling kritis (overspend atau hampir habis). Jangan gunakan poin atau daftar, langsung ke kalimat saja.`;
    }
    if (type === "goals") {
      const lines = data.map(g => `- ${g.name}: ${g.progress.toFixed(0)}% tercapai (${formatCurrency(g.current)} dari ${formatCurrency(g.target)})`).join("\n");
      return `Kamu adalah asisten keuangan pribadi. Berikan 1-2 kalimat motivasi dan saran singkat (Bahasa Indonesia, santai) untuk pencapaian tujuan tabungan berikut:\n${lines}\nPerhatikan tujuan yang paling jauh dari target atau paling dekat selesai. Jangan gunakan poin, langsung kalimat.`;
    }
    if (type === "investments") {
      const { totalInvested, totalCurrentValue, investmentReturn, investments } = data;
      const roi = totalInvested > 0 ? ((investmentReturn / totalInvested) * 100).toFixed(1) : 0;
      const lines = investments.map(inv => `- ${inv.name} (${inv.type}): modal ${formatCurrency(inv.initial_amount)}, nilai kini ${formatCurrency(inv.current_value)}`).join("\n");
      return `Kamu adalah analis investasi. Berikan 1-2 kalimat insight singkat (Bahasa Indonesia, santai tapi informatif) tentang portofolio investasi berikut:\nTotal ROI: ${roi}%, Return: ${formatCurrency(investmentReturn)}\n${lines}\nBerikan perspektif yang berguna tentang kinerja atau diversifikasi. Jangan gunakan poin, langsung kalimat.`;
    }
    return "";
  };

  const fetchInsight = async () => {
    const cacheKey = `${type}_${JSON.stringify(data).slice(0, 100)}`;
    if (cacheRef.current[cacheKey]) {
      setInsight(cacheRef.current[cacheKey]);
      setFetched(true);
      return;
    }
    setLoading(true);
    const prompt = buildPrompt();
    if (!prompt) { setLoading(false); return; }
    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    const text = typeof result === "string" ? result : result?.response || result?.content || "";
    cacheRef.current[cacheKey] = text;
    setInsight(text);
    setFetched(true);
    setLoading(false);
  };

  useEffect(() => {
    if (!fetched && data && (Array.isArray(data) ? data.length > 0 : true)) {
      fetchInsight();
    }
  }, []);

  if (loading) {
    return (
      <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex items-center gap-2 text-xs text-[#8FA4C8]">
        <div className="w-3 h-3 rounded-full border-2 border-[#FF6A00] border-t-transparent animate-spin flex-shrink-0" />
        <span>Nana sedang menganalisis...</span>
      </div>
    );
  }

  if (!insight) return null;

  return (
    <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
      <div className="flex items-start gap-2 bg-[#FF6A00]/5 border border-[#FF6A00]/20 rounded-xl px-3 py-2.5">
        <Sparkles className="w-3.5 h-3.5 text-[#FF6A00] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#1A1A1A] leading-relaxed flex-1">{insight}</p>
        <button onClick={fetchInsight} className="flex-shrink-0 text-[#8FA4C8] hover:text-[#FF6A00] transition-colors tap-highlight-fix" title="Refresh insight">
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}