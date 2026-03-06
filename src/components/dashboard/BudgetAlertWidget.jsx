import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, CheckCircle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAppSettings } from "@/components/utils/useAppSettings";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

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

export default function BudgetAlertWidget({ transactions = [], loading = false, budgets = [] }) {
  const { formatCurrency, t } = useAppSettings();
  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  if (loading) {
    return <div className="bg-white rounded-2xl shadow-sm h-24 animate-pulse" />;
  }

  if (budgets.length === 0) return null;

  // Calculate spending per category for this month
  const now = new Date();
  const thisMonthExpenses = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.type === "expense";
  });

  const spendingByCategory = {};
  thisMonthExpenses.forEach(tx => {
    const key = tx.category || "other";
    spendingByCategory[key] = (spendingByCategory[key] || 0) + tx.amount;
  });

  // Only show budgets that are >= 70% used
  const alertBudgets = budgets
    .map(b => {
      const spent = spendingByCategory[b.category] || 0;
      const percent = b.amount > 0 ? (spent / b.amount) * 100 : 0;
      return { ...b, spent, percent };
    })
    .filter(b => b.percent >= 70)
    .sort((a, b) => b.percent - a.percent);

  if (alertBudgets.length === 0) {
    // Show a small green "all good" card
    return (
      <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#00C9A7]/15 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-[#00C9A7]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1A1A1A]">{t('budget_safe_title')}</p>
            <p className="text-[10px] text-[#8FA4C8]">{t('budget_safe_desc')}</p>
          </div>
        </div>
        <Link to={createPageUrl("Budget")} className="text-xs text-[#FF6A00] font-semibold flex items-center gap-0.5">
          Lihat <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#F5A623]" />
          <h2 className="font-bold text-[#0A0A0A] text-sm">{t('budget_alert_title')}</h2>
        </div>
        <Link to={createPageUrl("Budget")} className="text-xs text-[#FF6A00] font-semibold flex items-center gap-0.5">
          Lihat semua <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="px-4 pb-4 space-y-3">
        {alertBudgets.map(b => {
          const cat = DEFAULT_CATEGORIES[b.category] || { label: b.category, emoji: "📦", color: "#95A5A6" };
          const isOver = b.percent > 100;
          const isNear = b.percent >= 80 && !isOver;
          const barColor = isOver ? "#FF6B6B" : isNear ? "#F5A623" : cat.color;
          const displayPercent = Math.min(Math.round(b.percent), 100);
          const remaining = b.amount - b.spent;

          const pieData = [
            { value: Math.min(b.spent, b.amount), fill: barColor },
            { value: Math.max(b.amount - b.spent, 0), fill: "#F0F0EE" }
          ];

          return (
            <div key={b.id} className="flex items-center gap-3">
              <div className="w-16 h-16 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={32}
                      startAngle={90}
                      endAngle={-270}
                      strokeWidth={0}
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#1A1A1A]" style={{ width: 64, height: 64 }}>
                  <span>{displayPercent}%</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{cat.emoji}</span>
                  <span className="text-sm font-medium text-[#1A1A1A]">{cat.label}</span>
                  {isOver && (
                    <span className="text-[10px] font-bold text-white bg-[#FF6B6B] px-1.5 py-0.5 rounded-full">Lewat!</span>
                  )}
                  {isNear && !isOver && (
                    <span className="text-[10px] font-bold text-[#F5A623] bg-[#F5A623]/15 px-1.5 py-0.5 rounded-full">Hampir!</span>
                  )}
                </div>
                <div className="flex justify-between text-[10px] text-[#8FA4C8]">
                  <span>{formatCurrency(b.spent)} dari {formatCurrency(b.amount)}</span>
                  <span style={{ color: isOver ? "#FF6B6B" : "#8FA4C8" }}>
                    {isOver
                      ? `Lebih ${formatCurrency(Math.abs(remaining))}`
                      : `Sisa ${formatCurrency(remaining)}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}