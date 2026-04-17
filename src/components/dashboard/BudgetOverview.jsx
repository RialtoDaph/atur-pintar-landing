import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronRight } from "lucide-react";

const DEFAULT_CATEGORIES = {
  food: { label: "Makanan", emoji: "🍔" },
  transport: { label: "Transport", emoji: "🚗" },
  shopping: { label: "Belanja", emoji: "🛍️" },
  health: { label: "Kesehatan", emoji: "💊" },
  entertainment: { label: "Hiburan", emoji: "🎬" },
  bills: { label: "Tagihan", emoji: "💡" },
  education: { label: "Pendidikan", emoji: "📚" },
  other: { label: "Lainnya", emoji: "📦" },
};

function getCategoryLabel(key) {
  if (key?.startsWith("custom_")) return { label: "Kategori", emoji: "🏷️" };
  return DEFAULT_CATEGORIES[key] || { label: key, emoji: "💸" };
}

function getBarColor(pct) {
  if (pct < 70) return "#22C55E";
  if (pct < 90) return "#F59E0B";
  return "#EF4444";
}

export default function BudgetOverview({ budgets, transactions }) {
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const monthBudgets = budgets.filter(b => b.month === currentMonth);

  if (monthBudgets.length === 0) {
    return (
      <div className="bg-white rounded-2xl px-4 py-5 shadow-sm">
        <h3 className="text-sm font-bold text-[#1A1A1A] mb-3">Budget Bulan Ini 💰</h3>
        <div className="text-center py-4">
          <div className="text-3xl mb-2">💸</div>
          <p className="text-sm text-[#8FA4C8] mb-3">Belum ada budget yang diset</p>
          <Link
            to={createPageUrl("Budget")}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#FF6B35] text-white text-sm font-bold"
          >
            Set Budget → <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  // Calculate spending per category this month
  const monthTx = transactions.filter(t => {
    const d = t.date?.slice(0, 7);
    return d === currentMonth && t.type === "expense" && !t.is_deleted;
  });

  const spendingByCategory = {};
  monthTx.forEach(t => {
    spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
  });

  // Sort by budget amount, show top 4
  const top4 = [...monthBudgets]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4)
    .map(b => ({
      ...b,
      spent: spendingByCategory[b.category] || 0,
      pct: Math.min(100, ((spendingByCategory[b.category] || 0) / b.amount) * 100),
    }));

  return (
    <div className="bg-white rounded-2xl px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#1A1A1A]">Budget Bulan Ini 💰</h3>
        <Link to={createPageUrl("Budget")} className="text-xs text-[#FF6B35] font-semibold tap-highlight-fix">
          Semua →
        </Link>
      </div>

      <div className="space-y-3">
        {top4.map(b => {
          const { label, emoji } = getCategoryLabel(b.category);
          const barColor = getBarColor(b.pct);
          return (
            <div key={b.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-[#1A1A1A]">{emoji} {label}</span>
                <span className="text-xs text-[#8FA4C8]">
                  Rp {b.spent.toLocaleString("id-ID")} / Rp {b.amount.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="h-2 bg-[#F2F4F7] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${b.pct}%`, backgroundColor: barColor }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <Link
        to={createPageUrl("Budget")}
        className="mt-4 flex items-center justify-center gap-1 text-xs font-bold text-[#FF6B35] py-2 border border-[#FF6B35]/20 rounded-xl tap-highlight-fix"
      >
        Lihat Semua Budget → <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );
}