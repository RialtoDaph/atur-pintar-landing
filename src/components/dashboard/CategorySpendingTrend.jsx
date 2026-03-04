import { TrendingUp, AlertCircle } from "lucide-react";
import { formatRupiah } from "@/components/utils/formatRupiah";

const CATEGORIES = {
  makanan: { label: "Makan & Minum", emoji: "🍔" },
  transportasi: { label: "Transportasi", emoji: "🚗" },
  hiburan: { label: "Hiburan", emoji: "🎮" },
  belanja: { label: "Belanja", emoji: "🛍️" },
  utilitas: { label: "Utilitas", emoji: "💡" },
  kesehatan: { label: "Kesehatan", emoji: "🏥" },
  lainnya: { label: "Lainnya", emoji: "📌" },
};

export default function CategorySpendingTrend({ transactions, loading }) {
  if (loading) return null;

  const now = new Date();
  const thisMonth = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.type === "expense";
  });

  const lastMonth = transactions.filter(t => {
    const d = new Date(t.date);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear() && t.type === "expense";
  });

  // Group by category
  const thisSpending = {};
  const lastSpending = {};

  thisMonth.forEach(t => {
    const cat = t.category || "lainnya";
    thisSpending[cat] = (thisSpending[cat] || 0) + t.amount;
  });

  lastMonth.forEach(t => {
    const cat = t.category || "lainnya";
    lastSpending[cat] = (lastSpending[cat] || 0) + t.amount;
  });

  // Find categories with significant increase
  const alerts = Object.entries(thisSpending)
    .map(([category, amount]) => {
      const lastAmount = lastSpending[category] || 0;
      if (lastAmount === 0) return null;

      const increase = ((amount - lastAmount) / lastAmount) * 100;
      if (increase > 30) { // 30% increase threshold
        return {
          category,
          label: CATEGORIES[category]?.label || "Lainnya",
          emoji: CATEGORIES[category]?.emoji || "📌",
          thisMonth: amount,
          lastMonth: lastAmount,
          increase: Math.round(increase),
        };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => b.increase - a.increase)
    .slice(0, 2); // Max 2 alerts

  if (alerts.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2.5">
      <h3 className="font-bold text-[#0A0A0A] text-sm flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-[#FFA500]" />
        Tren Pengeluaran
      </h3>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div key={alert.category} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FFA500]/8 border border-[#FFA500]/20">
            <span className="text-lg flex-shrink-0">{alert.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-[#0A0A0A]">{alert.label}</p>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FFA500]/20 text-[#FFA500]">
                  ↑ {alert.increase}%
                </span>
              </div>
              <p className="text-xs text-[#8FA4C8]">
                {formatRupiah(alert.thisMonth)} (bulan lalu: {formatRupiah(alert.lastMonth)})
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}