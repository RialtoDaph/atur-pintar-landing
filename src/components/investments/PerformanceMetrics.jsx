import { TrendingUp, TrendingDown, Calendar, Clock } from "lucide-react";
import { useAppSettings } from "@/components/utils/AppSettingsContext";

export default function PerformanceMetrics({ investments, totalValue, totalInvested, formatCurrency }) {
  const { t } = useAppSettings();

  const totalGain = totalValue - totalInvested;
  const gainPercent = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : 0;
  const isPositive = totalGain >= 0;

  // Annualized return — pakai purchase_date untuk hitung durasi per investasi
  const validInvestments = investments.filter(inv => inv.purchase_date && inv.initial_amount > 0);
  const now = new Date();

  let annualizedReturn = null;
  if (validInvestments.length > 0) {
    // Weighted annualized return
    let totalWeightedAnnual = 0;
    let totalWeight = 0;
    validInvestments.forEach(inv => {
      const start = new Date(inv.purchase_date);
      const days = Math.max((now - start) / (1000 * 60 * 60 * 24), 1);
      const years = days / 365;
      const roi = (inv.current_value - inv.initial_amount) / inv.initial_amount;
      const annual = ((1 + roi) ** (1 / years) - 1) * 100;
      totalWeightedAnnual += annual * inv.initial_amount;
      totalWeight += inv.initial_amount;
    });
    annualizedReturn = (totalWeightedAnnual / totalWeight).toFixed(2);
  }

  const isAnnualizedPositive = annualizedReturn !== null && parseFloat(annualizedReturn) >= 0;

  // Oldest investment date (durasi memegang)
  const purchaseDates = investments.filter(i => i.purchase_date).map(i => new Date(i.purchase_date));
  const oldestDate = purchaseDates.length > 0 ? new Date(Math.min(...purchaseDates)) : null;
  let holdingDays = 0;
  if (oldestDate) {
    holdingDays = Math.floor((now - oldestDate) / (1000 * 60 * 60 * 24));
  }
  const holdingLabel = holdingDays >= 365
    ? `${(holdingDays / 365).toFixed(1)} thn`
    : holdingDays > 0 ? `${holdingDays} hari` : "-";

  // Diversification
  const byType = {};
  investments.forEach(inv => {
    const key = inv.type || "lainnya";
    byType[key] = (byType[key] || 0) + (inv.current_value || 0);
  });
  const typeCount = Object.keys(byType).length;

  return (
    <div className="grid grid-cols-2 gap-3">

      {/* ROI */}
      <div className="bg-white/10 rounded-2xl p-4">
        <p className="text-white/60 text-xs font-medium mb-1">ROI</p>
        <div className="flex items-center gap-1.5">
          {isPositive
            ? <TrendingUp className="w-4 h-4 text-[#00C9A7]" />
            : <TrendingDown className="w-4 h-4 text-[#FF6B6B]" />}
          <p className={`font-bold text-lg ${isPositive ? "text-[#00C9A7]" : "text-[#FF6B6B]"}`}>
            {isPositive ? "+" : ""}{gainPercent}%
          </p>
        </div>
      </div>

      {/* Annualized Return */}
      <div className="bg-white/10 rounded-2xl p-4">
        <p className="text-white/60 text-xs font-medium mb-1">Return/Tahun</p>
        {annualizedReturn !== null ? (
          <div className="flex items-center gap-1.5">
            {isAnnualizedPositive
              ? <TrendingUp className="w-4 h-4 text-[#00C9A7]" />
              : <TrendingDown className="w-4 h-4 text-[#FF6B6B]" />}
            <p className={`font-bold text-lg ${isAnnualizedPositive ? "text-[#00C9A7]" : "text-[#FF6B6B]"}`}>
              {isAnnualizedPositive ? "+" : ""}{annualizedReturn}%
            </p>
          </div>
        ) : (
          <p className="text-white/40 text-sm mt-1">—</p>
        )}
      </div>

      {/* Total Gain/Loss */}
      <div className="bg-white/10 rounded-2xl p-4">
        <p className="text-white/60 text-xs font-medium mb-1">Untung / Rugi</p>
        <p className={`font-bold text-base ${isPositive ? "text-[#00C9A7]" : "text-[#FF6B6B]"}`}>
          {isPositive ? "+" : ""}{formatCurrency(totalGain)}
        </p>
      </div>

      {/* Holding duration */}
      <div className="bg-white/10 rounded-2xl p-4">
        <p className="text-white/60 text-xs font-medium mb-1">Durasi Pegang</p>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#F97316]" />
          <p className="font-bold text-lg text-white">{holdingLabel}</p>
        </div>
      </div>

    </div>
  );
}