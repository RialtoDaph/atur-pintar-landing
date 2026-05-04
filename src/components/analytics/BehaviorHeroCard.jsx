import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { useAppSettings } from "@/components/utils/useAppSettings";
import { formatLocalDate } from "@/utils/dateUtils";

/**
 * BehaviorHeroCard — Auto-pick 1 insight perilaku terkuat dari data user.
 * Mengikuti filter periode dari Analytics page (3M/6M/12M/custom).
 * Logika prioritas:
 *  1. No-spend streak (kalo > 2 hari)
 *  2. Hari paling boros (kalo ada pola jelas, > Rp 100k)
 *  3. Top merchant (kalo > 3x kunjungan)
 *  4. Top category (fallback)
 */
export default function BehaviorHeroCard({ transactions = [], allCategoriesConfig = {}, filterPeriod = "6", customDateRange = null }) {
  const { formatShortNumber } = useAppSettings();

  const insight = useMemo(() => {
    const now = new Date();
    let start, end;
    if (customDateRange) {
      start = customDateRange.start;
      end = customDateRange.end;
    } else {
      const months = parseInt(filterPeriod) || 6;
      start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
      end = now;
    }
    const periodDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
    const periodLabel = customDateRange
      ? `${periodDays} hari`
      : (parseInt(filterPeriod) === 1 ? "bulan ini" : `${filterPeriod} bulan`);

    const expenses = transactions.filter(t => {
      if (t.type !== "expense") return false;
      const d = new Date(t.date);
      return d >= start && d <= end;
    });

    // Hitung totalAll di awal — fix fragile var scoping
    const totalAll = expenses.reduce((s, t) => s + (t.amount || 0), 0);

    if (expenses.length === 0) {
      return {
        emoji: "✨",
        title: "Mulai Catat Transaksi",
        subtitle: "Nana akan analisis kebiasaanmu setelah ada data",
        stats: [],
      };
    }

    // ===== 1. No-Spend Streak (current) — pakai local timezone =====
    const spendingDates = new Set(expenses.map(t => t.date));
    let currentStreak = 0;
    const cursor = new Date(now);
    cursor.setHours(0, 0, 0, 0);
    while (currentStreak < 30) {
      const iso = formatLocalDate(cursor);
      if (spendingDates.has(iso)) break;
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    if (currentStreak >= 2) {
      return {
        emoji: "🔥",
        title: `${currentStreak} hari tanpa belanja!`,
        subtitle: "Streak no-spend kamu lagi panas. Pertahankan!",
        stats: [
          { label: "Streak", value: `${currentStreak} hari` },
          { label: "Hari hemat", value: `${Math.max(0, periodDays - spendingDates.size)}` },
          { label: "Hari belanja", value: `${spendingDates.size}x` },
        ],
      };
    }

    // ===== 2. Hari Paling Boros (day of week pattern) =====
    const dayTotals = [0, 0, 0, 0, 0, 0, 0];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    expenses.forEach(t => {
      const dow = new Date(t.date).getDay();
      dayTotals[dow] += t.amount || 0;
      dayCounts[dow] += 1;
    });
    const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const avgPerDay = totalAll / 7;
    let maxIdx = 0;
    dayTotals.forEach((v, i) => { if (v > dayTotals[maxIdx]) maxIdx = i; });
    const maxVal = dayTotals[maxIdx];
    if (maxVal > avgPerDay * 1.5 && maxVal > 100000) {
      const pct = totalAll > 0 ? ((maxVal / totalAll) * 100).toFixed(0) : 0;
      return {
        emoji: "📅",
        title: `Kamu paling boros di hari ${DAY_NAMES[maxIdx]}`,
        subtitle: `${pct}% pengeluaran ${periodLabel} ada di hari ini`,
        stats: [
          { label: DAY_NAMES[maxIdx], value: formatShortNumber(maxVal) },
          { label: "Transaksi", value: `${dayCounts[maxIdx]}x` },
          { label: "Avg/transaksi", value: formatShortNumber(maxVal / Math.max(1, dayCounts[maxIdx])) },
        ],
      };
    }

    // ===== 3. Top Merchant (note-based) =====
    const merchantMap = {};
    expenses.forEach(t => {
      const raw = (t.note || "").trim();
      if (!raw) return;
      const key = raw.toLowerCase();
      if (!merchantMap[key]) merchantMap[key] = { name: raw, total: 0, count: 0 };
      merchantMap[key].total += t.amount || 0;
      merchantMap[key].count += 1;
    });
    const topMerchants = Object.values(merchantMap).sort((a, b) => b.count - a.count);
    if (topMerchants.length > 0 && topMerchants[0].count >= 3) {
      const m = topMerchants[0];
      return {
        emoji: "🏪",
        title: `${m.name} jadi langganan`,
        subtitle: `Kamu mampir ${m.count}x dalam ${periodLabel} terakhir`,
        stats: [
          { label: "Kunjungan", value: `${m.count}x` },
          { label: "Total", value: formatShortNumber(m.total) },
          { label: "Avg", value: formatShortNumber(m.total / m.count) },
        ],
      };
    }

    // ===== 4. Fallback: Top Category =====
    const catMap = {};
    expenses.forEach(t => {
      const cat = t.category || "other";
      catMap[cat] = (catMap[cat] || 0) + (t.amount || 0);
    });
    const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
    if (topCat) {
      const cfg = allCategoriesConfig[topCat[0]] || { label: topCat[0], emoji: "📦" };
      const pct = totalAll > 0 ? ((topCat[1] / totalAll) * 100).toFixed(0) : 0;
      return {
        emoji: cfg.emoji || "📦",
        title: `Pengeluaran terbesar: ${cfg.label}`,
        subtitle: `${pct}% dari total belanja ${periodLabel} ini`,
        stats: [
          { label: "Total", value: formatShortNumber(topCat[1]) },
          { label: "% total", value: `${pct}%` },
          { label: "Periode", value: periodLabel },
        ],
      };
    }

    return {
      emoji: "📊",
      title: "Mulai bangun kebiasaan",
      subtitle: "Catat transaksi rutin biar Nana bisa kasih insight",
      stats: [],
    };
  }, [transactions, allCategoriesConfig, formatShortNumber, filterPeriod, customDateRange]);

  return (
    <div className="bg-gradient-to-br from-[#FF6A00] to-[#FF9A3C] rounded-2xl shadow-sm p-5 sm:p-6 text-white relative overflow-hidden">
      {/* Decorative blob */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/5 rounded-full blur-3xl" />

      <div className="relative">
        {/* Top label */}
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-white/80" />
          <p className="text-[10px] uppercase tracking-widest font-bold text-white/80">Insight Utama</p>
        </div>

        {/* Hero content */}
        <div className="flex items-start gap-3 mb-4">
          <span className="text-4xl sm:text-5xl flex-shrink-0">{insight.emoji}</span>
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-bold leading-tight mb-1">{insight.title}</h2>
            <p className="text-xs sm:text-sm text-white/90 leading-snug">{insight.subtitle}</p>
          </div>
        </div>

        {/* Mini stats */}
        {insight.stats.length > 0 && (
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/20">
            {insight.stats.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-[9px] sm:text-[10px] text-white/70 uppercase tracking-wide font-medium mb-0.5">{s.label}</p>
                <p className="text-xs sm:text-sm font-bold">{s.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}