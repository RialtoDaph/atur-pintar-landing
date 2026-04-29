import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronDown, ChevronUp, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { format, startOfWeek, endOfWeek, subWeeks } from "date-fns";
import { id } from "date-fns/locale";

function fmt(n) {
  const abs = Math.abs(Math.round(n || 0));
  if (abs >= 1000000) return `${(abs / 1000000).toFixed(1)}jt`;
  if (abs >= 1000) return `${(abs / 1000).toFixed(0)}rb`;
  return abs.toLocaleString("id-ID");
}

export default function WeeklyRecapCard({ user }) {
  const [recap, setRecap] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    loadRecap();
  }, [user?.email]);

  async function loadRecap() {
    // Find last week's recap
    const lastMon = format(startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const recaps = await base44.entities.WeeklyRecap.filter({ created_by: user.email, week_start: lastMon }).catch(() => []);
    if (recaps && recaps.length > 0) {
      setRecap(recaps[0]);
    } else {
      // Try to generate
      generateRecap();
    }
  }

  async function generateRecap() {
    if (generating) return;
    setGenerating(true);
    try {
      const today = new Date();
      const lastMonDate = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
      const lastSunDate = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
      const weekStart = format(lastMonDate, "yyyy-MM-dd");
      const weekEnd = format(lastSunDate, "yyyy-MM-dd");

      // Fetch transactions for that week
      const txs = await base44.entities.Transaction.filter({ created_by: user.email }, "-date", 500).catch(() => []);
      const weekTxs = (txs || []).filter(t => t.date >= weekStart && t.date <= weekEnd && !t.is_deleted);

      const totalIncome = weekTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const totalExpense = weekTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      const net = totalIncome - totalExpense;
      const transactionCount = weekTxs.length;

      // Top categories
      const catMap = {};
      weekTxs.filter(t => t.type === "expense").forEach(t => {
        const cat = t.category || "other";
        if (!catMap[cat]) catMap[cat] = { category: cat, amount: 0, count: 0 };
        catMap[cat].amount += t.amount;
        catMap[cat].count += 1;
      });
      const topCategories = Object.values(catMap).sort((a, b) => b.amount - a.amount).slice(0, 3);

      // vs last week
      const prevStart = format(startOfWeek(subWeeks(today, 2), { weekStartsOn: 1 }), "yyyy-MM-dd");
      const prevEnd = format(endOfWeek(subWeeks(today, 2), { weekStartsOn: 1 }), "yyyy-MM-dd");
      const prevTxs = (txs || []).filter(t => t.date >= prevStart && t.date <= prevEnd && !t.is_deleted);
      const prevExpense = prevTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      const vsLastWeekPct = prevExpense > 0 ? Math.round(((totalExpense - prevExpense) / prevExpense) * 100) : null;

      // Generate summary with Nana AI
      let summaryText = "";
      if (transactionCount > 0) {
        const topCatText = topCategories.map(c => `${c.category} (Rp${fmt(c.amount)})`).join(", ");
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Buat ringkasan keuangan mingguan singkat 2-3 kalimat dalam Bahasa Indonesia yang personal dan supportif.
Data: Pemasukan Rp${fmt(totalIncome)}, Pengeluaran Rp${fmt(totalExpense)}, Selisih Rp${fmt(net)}.
Pengeluaran terbesar: ${topCatText}.
${vsLastWeekPct !== null ? `Pengeluaran ${Math.abs(vsLastWeekPct)}% ${vsLastWeekPct > 0 ? "lebih besar" : "lebih kecil"} dari minggu lalu.` : ""}
Buat narasi seperti teman yang bijak, bukan ceramah.`,
        });
        summaryText = typeof result === "string" ? result : (result?.text || "");
      } else {
        summaryText = "Minggu ini belum ada transaksi tercatat. Mulai mencatat untuk mendapatkan rekap yang lebih baik!";
      }

      const rec = await base44.entities.WeeklyRecap.create({
        week_start: weekStart,
        week_end: weekEnd,
        total_income: totalIncome,
        total_expense: totalExpense,
        net,
        transaction_count: transactionCount,
        top_categories: topCategories,
        vs_last_week_pct: vsLastWeekPct,
        summary_text: summaryText,
        is_read: false,
      });
      setRecap(rec);
    } catch (e) {
      // silently fail
    }
    setGenerating(false);
  }

  async function handleExpand() {
    setExpanded(e => !e);
    if (!expanded && recap && !recap.is_read) {
      await base44.entities.WeeklyRecap.update(recap.id, { is_read: true }).catch(() => {});
      setRecap(r => ({ ...r, is_read: true }));
    }
  }

  if (!recap && !generating) return null;

  if (generating) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#F0F2F5] p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#FFF7ED] flex items-center justify-center flex-shrink-0">
          <span className="text-sm">📊</span>
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-[#1A1A1A]">Membuat Rekap Mingguan...</p>
          <div className="h-1.5 bg-[#F2F4F7] rounded-full mt-1.5 overflow-hidden">
            <div className="h-full bg-[#F97316] rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!recap) return null;

  const vsPct = recap.vs_last_week_pct;
  const vsPositive = vsPct !== null && vsPct > 0;
  const vsZero = vsPct === null || vsPct === 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#F0F2F5] overflow-hidden">
      <button
        onClick={handleExpand}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left tap-highlight-fix"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FFF7ED] flex items-center justify-center flex-shrink-0">
            <span className="text-sm">📊</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-[#1A1A1A]">Rekap Minggu Lalu</p>
              {!recap.is_read && (
                <span className="w-2 h-2 rounded-full bg-[#F97316] flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-[#8FA4C8]">
              {recap.week_start} – {recap.week_end} · {recap.transaction_count} transaksi
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {vsPct !== null && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
              vsPositive ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"
            }`}>
              {vsPositive ? <TrendingUp className="w-2.5 h-2.5" /> : vsZero ? <Minus className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {Math.abs(vsPct)}%
            </span>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-[#8FA4C8]" /> : <ChevronDown className="w-4 h-4 text-[#8FA4C8]" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[#F2F4F7]">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mt-3 mb-3">
            <div className="bg-[#F0FDF4] rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-[#8FA4C8]">Pemasukan</p>
              <p className="text-sm font-bold text-green-600">+{fmt(recap.total_income)}</p>
            </div>
            <div className="bg-[#FEF2F2] rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-[#8FA4C8]">Pengeluaran</p>
              <p className="text-sm font-bold text-red-500">-{fmt(recap.total_expense)}</p>
            </div>
            <div className={`rounded-xl p-2.5 text-center ${recap.net >= 0 ? "bg-[#F0FDF4]" : "bg-[#FEF2F2]"}`}>
              <p className="text-[10px] text-[#8FA4C8]">Selisih</p>
              <p className={`text-sm font-bold ${recap.net >= 0 ? "text-green-600" : "text-red-500"}`}>
                {recap.net >= 0 ? "+" : ""}{fmt(recap.net)}
              </p>
            </div>
          </div>

          {/* Top categories */}
          {recap.top_categories?.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] text-[#8FA4C8] mb-1.5 font-semibold uppercase tracking-wide">Pengeluaran Terbesar</p>
              <div className="space-y-1.5">
                {recap.top_categories.map((c, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-[#4A5568] capitalize">{c.category}</span>
                    <span className="text-xs font-semibold text-[#1A1A1A]">Rp{c.amount?.toLocaleString("id-ID")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nana summary */}
          {recap.summary_text && (
            <div className="bg-[#FFF7ED] border border-[#F97316]/20 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs">✨</span>
                <span className="text-[10px] font-bold text-[#F97316]">Kata Nana</span>
              </div>
              <p className="text-xs text-[#4A5568] leading-relaxed">{recap.summary_text}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}