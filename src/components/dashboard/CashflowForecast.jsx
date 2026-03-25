import { TrendingUp, TrendingDown, Calendar, RefreshCw, ArrowRight } from "lucide-react";
import { useAppSettings } from "@/components/utils/useAppSettings";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

function countFutureOccurrences(template, today, daysInMonth) {
  const interval = template.recurring_interval;
  const templateDate = new Date(template.date);
  const templateDay = templateDate.getDate();
  const count = { income: 0, expense: 0 };
  const futureStart = today.getDate() + 1;

  if (interval === "monthly") {
    if (templateDay >= futureStart && templateDay <= daysInMonth) {
      count[template.type] = (count[template.type] || 0) + 1;
    }
  } else if (interval === "weekly") {
    const templateWeekday = templateDate.getDay();
    for (let d = futureStart; d <= daysInMonth; d++) {
      const wd = new Date(today.getFullYear(), today.getMonth(), d).getDay();
      if (wd === templateWeekday) count[template.type] = (count[template.type] || 0) + 1;
    }
  } else if (interval === "daily") {
    count[template.type] = (count[template.type] || 0) + (daysInMonth - today.getDate());
  } else if (interval === "yearly") {
    const sameMonth = templateDate.getMonth() === today.getMonth();
    if (sameMonth && templateDay >= futureStart) {
      count[template.type] = (count[template.type] || 0) + 1;
    }
  }
  return count;
}

function getHistoricalMonthlyAverage(transactions, type, months = 3) {
  const now = new Date();
  let totalAmount = 0;
  let monthCount = 0;
  for (let i = 1; i <= months; i++) {
    const pastMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(pastMonth.getFullYear(), pastMonth.getMonth() + 1, 1);
    const monthTxs = transactions.filter(tx => {
      const d = new Date(tx.date);
      return d >= pastMonth && d < nextMonth && tx.type === type;
    });
    const monthAmount = monthTxs.reduce((sum, tx) => sum + tx.amount, 0);
    if (monthAmount > 0) { totalAmount += monthAmount; monthCount++; }
  }
  return monthCount > 0 ? totalAmount / monthCount : 0;
}

export default function CashflowForecast({ transactions, loading, user }) {
  const { formatCurrency, t } = useAppSettings();
  const [recurringTemplates, setRecurringTemplates] = useState([]);
  const [recurringLoaded, setRecurringLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    base44.entities.Transaction.filter({ is_recurring: true, created_by: user.email })
      .then(data => { setRecurringTemplates(data); setRecurringLoaded(true); })
      .catch(() => setRecurringLoaded(true));
  }, [user]);

  if (loading || !recurringLoaded) return null;

  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(0, daysInMonth - dayOfMonth);
  const progressPct = Math.round((dayOfMonth / daysInMonth) * 100);

  const thisMonth = transactions.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const currentIncome = thisMonth.filter(tx => tx.type === "income").reduce((s, tx) => s + tx.amount, 0);
  const currentExpense = thisMonth.filter(tx => tx.type === "expense").reduce((s, tx) => s + tx.amount, 0);

  let scheduledFutureIncome = 0;
  let scheduledFutureExpense = 0;
  const childParentIdsThisMonth = new Set(
    thisMonth.filter(tx => tx.is_recurring_child && tx.recurring_parent_id).map(tx => tx.recurring_parent_id)
  );
  for (const tpl of recurringTemplates) {
    const occ = countFutureOccurrences(tpl, now, daysInMonth);
    if (tpl.recurring_interval === "monthly" && childParentIdsThisMonth.has(tpl.id)) continue;
    scheduledFutureIncome += (occ.income || 0) * tpl.amount;
    scheduledFutureExpense += (occ.expense || 0) * tpl.amount;
  }

  const historicalMonthlyExpense = getHistoricalMonthlyAverage(transactions, "expense", 3);
  const historicalMonthlyIncome = getHistoricalMonthlyAverage(transactions, "income", 3);
  const dailyExpense = historicalMonthlyExpense / daysInMonth;
  const dailyIncome = historicalMonthlyIncome / daysInMonth;

  const projectedTotalExpense = currentExpense + (dailyExpense * daysLeft) + scheduledFutureExpense;
  const projectedTotalIncome = currentIncome + (dailyIncome * daysLeft) + scheduledFutureIncome;
  const projectedBalance = projectedTotalIncome - projectedTotalExpense;
  const isPositive = projectedBalance >= 0;
  const hasScheduled = scheduledFutureIncome > 0 || scheduledFutureExpense > 0;

  // Burn rate: avg daily spend this month
  const dailyBurnRate = dayOfMonth > 0 ? currentExpense / dayOfMonth : 0;

  // Income vs expense ratio
  const coverageRatio = projectedTotalIncome > 0
    ? Math.min((projectedTotalIncome / projectedTotalExpense) * 100, 100)
    : 0;

  const monthNames = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-[#0A0A0A] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#FF6A00]" />
          <span className="text-white font-bold text-sm">Proyeksi Cashflow</span>
          <span className="text-[#8FA4C8] text-xs">{monthNames[now.getMonth()]} {now.getFullYear()}</span>
        </div>
        {hasScheduled && (
          <span className="flex items-center gap-1 text-[9px] text-[#FF6A00] font-semibold bg-[#FF6A00]/20 px-2 py-0.5 rounded-full">
            <RefreshCw className="w-2.5 h-2.5" />
            Recurring
          </span>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Month progress bar */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-[#8FA4C8]">Hari ke-{dayOfMonth} dari {daysInMonth}</span>
            <span className="text-xs font-semibold text-[#1A1A1A]">{daysLeft} hari lagi</span>
          </div>
          <div className="h-2 bg-[#F2F4F7] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#FF6A00] transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-[#8FA4C8]">Awal bulan</span>
            <span className="text-[10px] text-[#FF6A00] font-medium">{progressPct}% terlewati</span>
            <span className="text-[10px] text-[#8FA4C8]">Akhir bulan</span>
          </div>
        </div>

        {/* Projected balance — hero */}
        <div className={`rounded-xl p-3.5 flex items-center justify-between ${
          isPositive ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"
        }`}>
          <div>
            <p className="text-[11px] text-[#8FA4C8] mb-0.5">Estimasi saldo akhir bulan</p>
            <p className={`text-xl font-bold ${isPositive ? "text-green-600" : "text-red-500"}`}>
              {isPositive ? "+" : "-"}{formatCurrency(Math.abs(projectedBalance))}
            </p>
            <p className="text-[10px] mt-0.5 font-medium" style={{ color: isPositive ? "#16a34a" : "#ef4444" }}>
              {isPositive ? "✅ Cashflow sehat" : "⚠️ Pengeluaran melebihi pemasukan"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[#8FA4C8] mb-1">Coverage</div>
            <div className={`text-lg font-bold ${coverageRatio >= 100 ? "text-green-600" : "text-red-500"}`}>
              {projectedTotalExpense > 0 ? Math.round((projectedTotalIncome / projectedTotalExpense) * 100) : 0}%
            </div>
            <div className="text-[10px] text-[#8FA4C8]">income/expense</div>
          </div>
        </div>

        {/* Income vs Expense flow */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#F8FAFC] rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-green-500" />
              <span className="text-[11px] font-semibold text-[#1A1A1A]">Pemasukan</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#8FA4C8]">Sudah masuk</span>
                <span className="font-semibold text-green-600">{formatCurrency(currentIncome)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-[#8FA4C8]">Proyeksi tambahan</span>
                <span className="font-medium text-[#1A1A1A]">+{formatCurrency((dailyIncome * daysLeft) + scheduledFutureIncome)}</span>
              </div>
              <div className="border-t border-[#E2E8F0] pt-1 flex justify-between text-[10px]">
                <span className="font-bold text-[#1A1A1A]">Total est.</span>
                <span className="font-bold text-green-600">{formatCurrency(projectedTotalIncome)}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F8FAFC] rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[11px] font-semibold text-[#1A1A1A]">Pengeluaran</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#8FA4C8]">Sudah keluar</span>
                <span className="font-semibold text-red-500">{formatCurrency(currentExpense)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-[#8FA4C8]">Proyeksi tambahan</span>
                <span className="font-medium text-[#1A1A1A]">+{formatCurrency((dailyExpense * daysLeft) + scheduledFutureExpense)}</span>
              </div>
              <div className="border-t border-[#E2E8F0] pt-1 flex justify-between text-[10px]">
                <span className="font-bold text-[#1A1A1A]">Total est.</span>
                <span className="font-bold text-red-500">{formatCurrency(projectedTotalExpense)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Burn rate */}
        <div className="flex items-center justify-between bg-[#F8FAFC] rounded-xl px-3.5 py-2.5">
          <div>
            <p className="text-[11px] font-semibold text-[#1A1A1A]">Burn Rate Harian</p>
            <p className="text-[10px] text-[#8FA4C8] mt-0.5">Rata-rata pengeluaran per hari bulan ini</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-[#FF6A00]">{formatCurrency(dailyBurnRate)}</p>
            <p className="text-[10px] text-[#8FA4C8]">/hari</p>
          </div>
        </div>

        <p className="text-[10px] text-[#8FA4C8] text-center">
          Berdasarkan rata-rata 3 bulan terakhir + transaksi recurring
        </p>
      </div>
    </div>
  );
}