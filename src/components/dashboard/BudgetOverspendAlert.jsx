import { AlertTriangle, TrendingDown } from "lucide-react";
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

export default function BudgetOverspendAlert({ transactions, budgets, loading }) {
  if (loading) return null;

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Get current month spending
  const monthExpenses = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.type === "expense";
  });

  // Group spending by category
  const spendingByCategory = {};
  monthExpenses.forEach(t => {
    const cat = t.category || "lainnya";
    spendingByCategory[cat] = (spendingByCategory[cat] || 0) + t.amount;
  });

  // Find budgets at risk or exceeded
  const alerts = [];
  budgets.forEach(budget => {
    if (budget.month !== currentMonth) return;

    const spent = spendingByCategory[budget.category] || 0;
    const percentage = (spent / budget.amount) * 100;

    // Alert when at 80% or more
    if (percentage >= 80) {
      const catInfo = CATEGORIES[budget.category] || CATEGORIES.lainnya;
      alerts.push({
        category: budget.category,
        label: catInfo.label,
        emoji: catInfo.emoji,
        spent,
        budget: budget.amount,
        percentage: Math.min(Math.round(percentage), 100),
        isExceeded: spent > budget.amount,
      });
    }
  });

  if (alerts.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2.5">
      <h3 className="font-bold text-[#0A0A0A] text-sm flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-[#FF6A00]" />
        Peringatan Anggaran
      </h3>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div key={alert.category} className={`p-3 rounded-xl border ${alert.isExceeded ? "bg-[#FF6B6B]/8 border-[#FF6B6B]/30" : "bg-[#FFA500]/8 border-[#FFA500]/30"}`}>
            <div className="flex items-start gap-2.5">
              <span className="text-lg flex-shrink-0">{alert.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0A0A0A]">{alert.label}</p>
                <p className="text-xs text-[#8FA4C8] mt-0.5">
                  {formatRupiah(alert.spent)} dari {formatRupiah(alert.budget)} ({alert.percentage}%)
                </p>
                <div className="mt-2 w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${alert.isExceeded ? "bg-[#FF6B6B]" : "bg-[#FFA500]"}`}
                    style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}