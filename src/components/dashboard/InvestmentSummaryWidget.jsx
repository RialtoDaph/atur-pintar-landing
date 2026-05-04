import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useAppSettings } from "@/components/utils/useAppSettings";

const TYPE_EMOJI = {
  saham: "📈",
  reksa_dana: "💼",
  crypto: "🪙",
  deposito: "🏦",
  obligasi: "📜",
  emas: "🥇",
  lainnya: "💰",
};

export default function InvestmentSummaryWidget({ user }) {
  const { formatCurrency } = useAppSettings();
  const [investments, setInvestments] = useState([]);
  const [investTx, setInvestTx] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    Promise.all([
      base44.entities.Investment.filter({ created_by: user.email }),
      base44.entities.InvestmentTransaction.filter({ created_by: user.email }),
    ]).then(([invs, txs]) => {
      setInvestments(invs || []);
      setInvestTx(txs || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user?.email]);

  if (loading) {
    return <div className="bg-white rounded-2xl shadow-sm h-24 animate-pulse" />;
  }

  // Calculate cost basis per investment from buy/sell transactions
  const enriched = investments.map(inv => {
    const txs = investTx.filter(t => t.investment_id === inv.id);
    const cost = txs.reduce((s, t) => {
      if (t.type === "buy") return s + (t.total_amount || 0);
      if (t.type === "sell") return s - (t.total_amount || 0);
      return s;
    }, 0);
    const value = inv.current_value || 0;
    const profit = value - cost;
    const profitPct = cost > 0 ? (profit / cost) * 100 : 0;
    return { ...inv, cost, value, profit, profitPct };
  }).sort((a, b) => (b.value || 0) - (a.value || 0));

  const totalValue = enriched.reduce((s, i) => s + (i.value || 0), 0);
  const totalCost = enriched.reduce((s, i) => s + (i.cost || 0), 0);
  const totalProfit = totalValue - totalCost;
  const totalProfitPct = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
  const isGain = totalProfit >= 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          {isGain ? (
            <TrendingUp className="w-4 h-4 text-[#00C9A7]" />
          ) : (
            <TrendingDown className="w-4 h-4 text-[#FF6B6B]" />
          )}
          <h2 className="font-bold text-[#0A0A0A] text-sm">Investasi</h2>
          {enriched.length > 0 && totalCost > 0 && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                color: isGain ? "#00C9A7" : "#FF6B6B",
                backgroundColor: (isGain ? "#00C9A7" : "#FF6B6B") + "15",
              }}
            >
              {isGain ? "+" : ""}{totalProfitPct.toFixed(1)}%
            </span>
          )}
        </div>
        <Link to={createPageUrl("Investments")} className="text-xs text-[#FF6A00] font-semibold flex items-center gap-0.5">
          Lihat semua <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {enriched.length === 0 ? (
        <Link to={createPageUrl("Investments")} className="flex items-center gap-3 px-4 pb-4">
          <div className="w-10 h-10 rounded-full bg-[#F2F4F7] flex items-center justify-center text-lg text-[#8FA4C8]">
            <Plus className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-[#1A1A1A]">Belum ada investasi</p>
            <p className="text-[11px] text-[#8FA4C8]">Mulai pantau portofolio kamu</p>
          </div>
        </Link>
      ) : (
        <>
          <div className="px-4 pb-2">
            <p className="text-2xl font-bold text-[#1A1A1A]">{formatCurrency(totalValue)}</p>
            {totalCost > 0 && (
              <p className="text-[11px] mt-0.5" style={{ color: isGain ? "#00C9A7" : "#FF6B6B" }}>
                {isGain ? "▲" : "▼"} {formatCurrency(Math.abs(totalProfit))}
              </p>
            )}
          </div>

          <div className="px-4 pb-4 flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {enriched.slice(0, 6).map(inv => {
              const positive = inv.profit >= 0;
              return (
                <Link
                  key={inv.id}
                  to={createPageUrl("Investments")}
                  className="flex flex-col items-center flex-shrink-0 cursor-pointer group w-20 bg-[#F8FAFC] rounded-xl p-2"
                >
                  <span className="text-xl mb-1">{inv.icon || TYPE_EMOJI[inv.type] || "💰"}</span>
                  <p className="text-[10px] font-semibold text-[#1A1A1A] text-center truncate w-full">{inv.name}</p>
                  <p
                    className="text-[9px] font-bold mt-0.5"
                    style={{ color: positive ? "#00C9A7" : "#FF6B6B" }}
                  >
                    {positive ? "+" : ""}{inv.profitPct.toFixed(1)}%
                  </p>
                </Link>
              );
            })}
            <Link
              to={createPageUrl("Investments")}
              className="flex flex-col items-center justify-center flex-shrink-0 w-20 bg-[#F2F4F7] hover:bg-[#E8EEF7] transition-colors rounded-xl p-2 text-[#8FA4C8]"
            >
              <Plus className="w-4 h-4 mb-1" />
              <p className="text-[10px] font-semibold">Tambah</p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}