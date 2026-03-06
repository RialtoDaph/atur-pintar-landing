import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { useAppSettings } from "@/components/utils/useAppSettings";

const INVESTMENT_TYPES = {
  saham: { label: "Saham", emoji: "📈", color: "#4F7CFF" },
  reksa_dana: { label: "Reksa Dana", emoji: "💰", color: "#00C9A7" },
  crypto: { label: "Crypto", emoji: "₿", color: "#F5A623" },
  deposito: { label: "Deposito", emoji: "🏦", color: "#9B59B6" },
  obligasi: { label: "Obligasi", emoji: "📄", color: "#3498DB" },
  emas: { label: "Emas", emoji: "🥇", color: "#F1C40F" },
  lainnya: { label: "Lainnya", emoji: "💼", color: "#95A5A6" },
};

export default function PortfolioSummary() {
  const { formatCurrency, t } = useAppSettings();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      base44.entities.Investment.filter({ created_by: user.email }, "-created_date", 50)
        .then(data => { setInvestments(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return <div className="bg-white rounded-2xl shadow-sm h-36 animate-pulse" />;
  }

  if (investments.length === 0) return null;

  const totalInvested = investments.reduce((s, i) => s + (i.initial_amount || 0), 0);
  const totalValue = investments.reduce((s, i) => s + (i.current_value || 0), 0);
  const totalGain = totalValue - totalInvested;
  const gainPercent = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : 0;
  const isPositive = totalGain >= 0;

  // Pie chart data per type
  const byType = {};
  investments.forEach(inv => {
    const t = inv.type || "lainnya";
    if (!byType[t]) byType[t] = 0;
    byType[t] += inv.current_value || 0;
  });
  const pieData = Object.entries(byType).map(([key, value]) => ({
    name: INVESTMENT_TYPES[key]?.label || key,
    value,
    color: INVESTMENT_TYPES[key]?.color || "#95A5A6",
    emoji: INVESTMENT_TYPES[key]?.emoji || "💼",
  }));

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <h2 className="font-bold text-[#0A0A0A] text-sm">{t('portfolio_title')}</h2>
        <Link to={createPageUrl("Investments")} className="text-xs text-[#FF6A00] font-semibold flex items-center gap-0.5">
          {t('view_all')} <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="px-4 pb-3">
        {/* Summary row only */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#8FA4C8] text-[10px] font-semibold uppercase tracking-widest">{t('total_value')}</p>
            <p className="text-[#1A1A1A] font-bold text-lg">{formatCurrency(totalValue)}</p>
          </div>
          <div className={`flex flex-col items-end px-2.5 py-1 rounded-lg ${isPositive ? "bg-[#00C9A7]/10" : "bg-[#FF6B6B]/10"}`}>
            <span className={`text-xs font-bold ${isPositive ? "text-[#00C9A7]" : "text-[#FF6B6B]"}`}>
              {isPositive ? "+" : ""}{gainPercent}%
            </span>
            <span className={`text-[9px] font-medium ${isPositive ? "text-[#00C9A7]" : "text-[#FF6B6B]"}`}>
              {isPositive ? "+" : ""}{formatCurrency(totalGain)}
            </span>
          </div>
        </div>

        {/* Top 3 investments only - minimal list */}
        {investments.slice(0, 3).length > 0 && (
          <div className="mt-3 space-y-2">
            {investments.slice(0, 3).map(inv => {
              const type = INVESTMENT_TYPES[inv.type] || INVESTMENT_TYPES.lainnya;
              const gain = (inv.current_value || 0) - (inv.initial_amount || 0);
              const gainPct = inv.initial_amount > 0 ? ((gain / inv.initial_amount) * 100).toFixed(1) : 0;
              const pos = gain >= 0;
              return (
                <div key={inv.id} className="flex items-center justify-between bg-[#F8FAFC] rounded-lg px-2.5 py-1.5">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm flex-shrink-0">{inv.icon || type.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#1A1A1A] truncate">{inv.name}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs font-bold text-[#1A1A1A]">{formatCurrency(inv.current_value)}</p>
                    <p className={`text-[10px] font-semibold ${pos ? "text-[#00C9A7]" : "text-[#FF6B6B]"}`}>
                      {pos ? "+" : ""}{gainPct}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}