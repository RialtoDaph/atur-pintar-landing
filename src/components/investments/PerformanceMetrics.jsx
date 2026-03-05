import { TrendingUp, TrendingDown } from "lucide-react";

export default function PerformanceMetrics({ investments, totalValue, totalInvested, formatCurrency }) {
  const totalGain = totalValue - totalInvested;
  const gainPercent = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : 0;
  
  // Annualized return (simplified)
  const avgInvDate = investments.length > 0 
    ? investments.reduce((sum, inv) => sum + new Date(inv.purchase_date || new Date()).getTime(), 0) / investments.length
    : new Date().getTime();
  const daysInvested = (new Date().getTime() - avgInvDate) / (1000 * 60 * 60 * 24);
  const yearsInvested = Math.max(daysInvested / 365, 0.1);
  const annualizedReturn = totalInvested > 0 
    ? (((totalValue / totalInvested) ** (1 / yearsInvested) - 1) * 100).toFixed(2)
    : 0;

  // Diversification score by type
  const byType = {};
  investments.forEach(inv => {
    const t = inv.type || "lainnya";
    byType[t] = (byType[t] || 0) + (inv.current_value || 0);
  });
  const typeCount = Object.keys(byType).length;
  const diversificationScore = Math.min((typeCount / 7) * 100, 100).toFixed(0);

  const isPositive = totalGain >= 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/10 rounded-2xl p-4">
          <p className="text-white/60 text-xs font-medium mb-1">ROI (Return on Investment)</p>
          <div className="flex items-center gap-2">
            {isPositive ? <TrendingUp className="w-4 h-4 text-[#00C9A7]" /> : <TrendingDown className="w-4 h-4 text-[#FF6B6B]" />}
            <p className={`font-bold text-lg ${isPositive ? "text-[#00C9A7]" : "text-[#FF6B6B]"}`}>
              {isPositive ? "+" : ""}{gainPercent}%
            </p>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4">
          <p className="text-white/60 text-xs font-medium mb-1">Annualized Return</p>
          <div className="flex items-center gap-2">
            {annualizedReturn >= 0 ? <TrendingUp className="w-4 h-4 text-[#00C9A7]" /> : <TrendingDown className="w-4 h-4 text-[#FF6B6B]" />}
            <p className={`font-bold text-lg ${annualizedReturn >= 0 ? "text-[#00C9A7]" : "text-[#FF6B6B]"}`}>
              {annualizedReturn >= 0 ? "+" : ""}{annualizedReturn}%
            </p>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4">
          <p className="text-white/60 text-xs font-medium mb-1">Diversifikasi</p>
          <div className="flex items-center gap-2">
            <p className="font-bold text-lg text-[#FF6A00]">{diversificationScore}%</p>
            <span className="text-xs text-white/60">({typeCount}/7 jenis)</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4">
          <p className="text-white/60 text-xs font-medium mb-1">Total Gain/Loss</p>
          <p className={`font-bold text-lg ${isPositive ? "text-[#00C9A7]" : "text-[#FF6B6B]"}`}>
            {formatCurrency(totalGain)}
          </p>
        </div>
      </div>
    </div>
  );
}