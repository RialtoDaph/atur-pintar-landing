import { useMemo } from "react";
import { TrendingUp, TrendingDown, Target } from "lucide-react";
import { useAppSettings } from "@/components/utils/useAppSettings";

export default function MonthEndForecastCard({ transactions = [], budgets = [], embedded = false }) {
  const { formatCurrency } = useAppSettings();

  const data = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysRemaining = daysInMonth - today;

    const monthExpenses = transactions.filter((t) => {
      if (t.type !== "expense") return false;
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    const spentSoFar = monthExpenses.reduce((s, t) => s + (t.amount || 0), 0);
    const dailyAvg = today > 0 ? spentSoFar / today : 0;
    const projectedTotal = spentSoFar + dailyAvg * daysRemaining;

    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
    const totalBudget = budgets
      .filter((b) => b.month === monthKey)
      .reduce((s, b) => s + (b.amount || 0), 0);

    const overBudget = totalBudget > 0 && projectedTotal > totalBudget;
    const diff = totalBudget > 0 ? projectedTotal - totalBudget : 0;
    const progressPct = totalBudget > 0 ? Math.min(100, (projectedTotal / totalBudget) * 100) : 0;

    return {
      spentSoFar,
      dailyAvg,
      projectedTotal,
      daysRemaining,
      totalBudget,
      overBudget,
      diff,
      progressPct,
      hasBudget: totalBudget > 0,
      hasData: monthExpenses.length > 0,
    };
  }, [transactions, budgets]);

  const Wrapper = embedded
    ? ({ children }) => <>{children}</>
    : ({ children }) => <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">{children}</div>;

  if (!data.hasData) {
    return (
      <Wrapper>
        {!embedded && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔮</span>
            <h3 className="text-[#1A1A1A] font-bold text-base sm:text-lg">Proyeksi Akhir Bulan</h3>
          </div>
        )}
        <p className="text-xs text-[#8FA4C8]">Belum ada transaksi bulan ini.</p>
      </Wrapper>
    );
  }

  const statusColor = data.overBudget ? "#FF6B6B" : data.hasBudget ? "#00C9A7" : "#FF6A00";

  return (
    <Wrapper>
      <div className="flex items-center justify-between mb-4">
        {!embedded ? (
          <div className="flex items-center gap-2">
            <span className="text-xl">🔮</span>
            <div>
              <h3 className="text-[#1A1A1A] font-bold text-base sm:text-lg leading-tight">Proyeksi Akhir Bulan</h3>
              <p className="text-[10px] sm:text-xs text-[#8FA4C8] mt-0.5">Berdasarkan rata-rata harian</p>
            </div>
          </div>
        ) : <div />}
        <div
          className="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"
          style={{ background: `${statusColor}15`, color: statusColor }}
        >
          {data.overBudget ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {data.overBudget ? "Over Budget" : data.hasBudget ? "On Track" : "Tanpa Budget"}
        </div>
      </div>

      {/* Projected total */}
      <div className="mb-4">
        <p className="text-[11px] text-[#8FA4C8] mb-1">Estimasi Total Pengeluaran</p>
        <p className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">{formatCurrency(data.projectedTotal)}</p>
        {data.hasBudget && (
          <p className="text-xs mt-1" style={{ color: statusColor }}>
            {data.overBudget
              ? `Lebih ${formatCurrency(data.diff)} dari budget`
              : `Hemat ${formatCurrency(Math.abs(data.diff))} dari budget`}
          </p>
        )}
      </div>

      {/* Progress bar vs budget */}
      {data.hasBudget && (
        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-[#8FA4C8] mb-1">
            <span>0</span>
            <span>Budget {formatCurrency(data.totalBudget)}</span>
          </div>
          <div className="w-full h-2 bg-[#F2F4F7] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${data.progressPct}%`,
                background: data.overBudget
                  ? "linear-gradient(90deg, #FF6B6B, #FF8A8A)"
                  : "linear-gradient(90deg, #00C9A7, #4FD1C5)",
              }}
            />
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-[#F8FAFC] rounded-xl p-2.5 sm:p-3">
          <p className="text-[9px] sm:text-[10px] text-[#8FA4C8] font-medium">Sudah Habis</p>
          <p className="text-xs sm:text-sm font-bold text-[#1A1A1A] mt-0.5 truncate">
            {formatCurrency(data.spentSoFar)}
          </p>
        </div>
        <div className="bg-[#F8FAFC] rounded-xl p-2.5 sm:p-3">
          <p className="text-[9px] sm:text-[10px] text-[#8FA4C8] font-medium">Rata-rata/Hari</p>
          <p className="text-xs sm:text-sm font-bold text-[#1A1A1A] mt-0.5 truncate">
            {formatCurrency(data.dailyAvg)}
          </p>
        </div>
        <div className="bg-[#F8FAFC] rounded-xl p-2.5 sm:p-3">
          <p className="text-[9px] sm:text-[10px] text-[#8FA4C8] font-medium">Sisa Hari</p>
          <p className="text-xs sm:text-sm font-bold text-[#1A1A1A] mt-0.5">{data.daysRemaining} hari</p>
        </div>
      </div>

      {/* Tip */}
      {data.hasBudget && data.overBudget && (
        <div className="mt-3 p-2.5 rounded-xl bg-[#FFF5F5] flex items-start gap-2">
          <Target className="w-3.5 h-3.5 text-[#FF6B6B] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#1A1A1A] leading-relaxed">
            Untuk tetap dalam budget, batasi pengeluaran ke{" "}
            <span className="font-bold">
              {formatCurrency(Math.max(0, (data.totalBudget - data.spentSoFar) / Math.max(1, data.daysRemaining)))}
            </span>{" "}
            per hari.
          </p>
        </div>
      )}
    </Wrapper>
  );
}