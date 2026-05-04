import { useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from "recharts";
import { useAppSettings } from "@/components/utils/useAppSettings";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export default function BudgetActualTrendChart({ budgets, transactions, periodSubtitle, monthRange }) {
  const { formatCurrency, formatShortNumber } = useAppSettings();

  const chartData = useMemo(() => {
    if (!monthRange) return [];
    const start = monthRange.start;
    const end = monthRange.end;
    const monthDiff =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    return Array.from({ length: monthDiff + 1 }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      const ym = `${year}-${String(month + 1).padStart(2, "0")}`;

      // Budget: total budget bulan tersebut (sum semua kategori)
      const monthBudgets = budgets.filter(b => b.month === ym);
      const totalBudget = monthBudgets.reduce((s, b) => s + (b.amount || 0), 0);

      // Aktual: total expense di bulan tsb
      const monthExpenses = transactions.filter(t => {
        if (t.type !== "expense") return false;
        const td = new Date(t.date);
        return td.getMonth() === month && td.getFullYear() === year;
      });
      const totalActual = monthExpenses.reduce((s, t) => s + t.amount, 0);

      return {
        name: MONTHS_ID[month],
        Budget: totalBudget,
        Aktual: totalActual,
      };
    });
  }, [budgets, transactions, monthRange]);

  const hasBudget = chartData.some(d => d.Budget > 0);

  if (!hasBudget) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="mb-3">
          <h2 className="font-bold text-[#1A1A1A] text-base">Tren Budget vs Aktual</h2>
          {periodSubtitle && <p className="text-xs text-[#8FA4C8] mt-0.5">{periodSubtitle}</p>}
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="text-4xl mb-3">💸</span>
          <p className="font-semibold text-[#1A1A1A] text-sm mb-1">Belum ada budget yang di-set</p>
          <p className="text-xs text-[#8FA4C8] mb-4">Atur budget bulananmu untuk lihat trennya</p>
          <Link
            to={createPageUrl("Budget")}
            className="px-4 py-2 bg-[#FF6A00] text-white text-xs font-semibold rounded-xl hover:bg-[#e55f00] transition-colors"
          >
            Buat Budget
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
      <div className="mb-3">
        <h2 className="font-bold text-[#1A1A1A] text-base">Tren Budget vs Aktual</h2>
        {periodSubtitle && <p className="text-xs text-[#8FA4C8] mt-0.5">{periodSubtitle}</p>}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8FA4C8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#8FA4C8" }} axisLine={false} tickLine={false} tickFormatter={v => formatShortNumber(v)} />
          <Tooltip
            formatter={(v) => [formatCurrency(v), undefined]}
            contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
          <Line type="monotone" dataKey="Budget" stroke="#4F7CFF" strokeWidth={2.5} dot={{ r: 4, fill: "#4F7CFF" }} />
          <Line type="monotone" dataKey="Aktual" stroke="#FF6B6B" strokeWidth={2.5} dot={{ r: 4, fill: "#FF6B6B" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}