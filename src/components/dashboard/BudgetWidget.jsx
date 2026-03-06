import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAppSettings } from "@/components/utils/useAppSettings";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronRight, AlertCircle } from "lucide-react";

const DEFAULT_CATEGORIES = {
  housing: { label: "Housing", emoji: "🏠", color: "#4F7CFF" },
  food: { label: "Food", emoji: "🍔", color: "#00C9A7" },
  transport: { label: "Transport", emoji: "🚗", color: "#F5A623" },
  health: { label: "Health", emoji: "❤️", color: "#FF6B6B" },
  entertainment: { label: "Entertainment", emoji: "🎬", color: "#9B59B6" },
  shopping: { label: "Shopping", emoji: "🛍️", color: "#E91E8C" },
  subscriptions: { label: "Subscriptions", emoji: "📱", color: "#1ABC9C" },
  other: { label: "Other", emoji: "📦", color: "#95A5A6" },
};

export default function BudgetWidget() {
  const { formatCurrency, t } = useAppSettings();
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    
    Promise.all([
      base44.entities.Budget.filter({ month: currentMonth, created_by: user.email }),
      base44.entities.Transaction.filter({ created_by: user.email }, "-date", 200),
    ]).then(([b, t]) => {
      setBudgets(b);
      setTransactions(t);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  if (loading) {
    return <div className="bg-white rounded-2xl shadow-sm h-24 animate-pulse" />;
  }

  if (budgets.length === 0) return null;

  const now = new Date();
  const thisMonthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.type === "expense";
  });

  const spendingByCategory = {};
  thisMonthTx.forEach(tx => {
    const key = tx.category || "other";
    spendingByCategory[key] = (spendingByCategory[key] || 0) + tx.amount;
  });

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + (spendingByCategory[b.category] || 0), 0);
  const overallPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const isOver = totalSpent > totalBudget;
  const overBudgetCount = budgets.filter(b => (spendingByCategory[b.category] || 0) > b.amount).length;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-[#0A0A0A] text-sm">{t('budget_title')}</h2>
        <Link to={createPageUrl("Budget")} className="text-xs text-[#FF6A00] font-semibold flex items-center gap-0.5">
          {t('view_all')} <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[#8FA4C8]">{t('total_budget')}</span>
          <span className="font-bold text-[#1A1A1A]">{formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}</span>
        </div>
        <div className="h-1.5 bg-[#F2F4F7] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${overallPercent}%`,
              backgroundColor: isOver ? "#FF6B6B" : overallPercent > 70 ? "#F5A623" : "#00C9A7"
            }}
          />
        </div>
      </div>

      {overBudgetCount > 0 && (
        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#FF6B6B]/10">
          <AlertCircle className="w-3.5 h-3.5 text-[#FF6B6B] flex-shrink-0" />
          <span className="text-xs text-[#FF6B6B] font-medium">
            {overBudgetCount} {t('category')} over budget
          </span>
        </div>
      )}
    </div>
  );
}