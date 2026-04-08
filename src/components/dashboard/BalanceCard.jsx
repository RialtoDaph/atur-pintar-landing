import { TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { useAppSettings } from "@/components/utils/useAppSettings";

export default function BalanceCard({ income, expense, savings, loading }) {
  const { formatCurrency, t } = useAppSettings();
  // balance = income minus all outflows (expense + savings deposits)
  const balance = income - expense;

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#161616] to-[#1a1a1a] rounded-2xl p-5 animate-pulse h-36" />
    );
  }

  return (
    <div data-tour="balance-card" className="bg-gradient-to-br from-[#1a1a1a] via-[#161616] to-[#111] rounded-2xl p-5 border border-[#2a2a2a] shadow-2xl" style={{boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,106,0,0.08)'}}>
      <p className="text-[#8FA4C8] text-[10px] font-bold uppercase tracking-[0.15em] mb-1 text-center">Total Saldo</p>
      <p className={`text-4xl font-black mb-5 text-center tracking-tight ${balance >= 0 ? "text-white" : "text-red-400"}`} style={{textShadow: balance >= 0 ? '0 0 32px rgba(255,255,255,0.15)' : 'none'}}>
        {balance >= 0 ? "" : "-"}{formatCurrency(Math.abs(balance))}
      </p>

      <div className="border-t border-[#ffffff08] mb-4"></div>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center text-center bg-white/5 rounded-xl py-3 px-2">
          <div className="bg-green-500/20 rounded-full w-9 h-9 flex items-center justify-center flex-shrink-0 mb-2 ring-1 ring-green-500/30">
            <TrendingUp className="w-4 h-4 text-[#99ff80]" />
          </div>
          <p className="text-[#8FA4C8] text-[9px] mb-1 font-medium uppercase tracking-wider">{t('income_label')}</p>
          <p className="text-white text-xs font-bold">{formatCurrency(income)}</p>
        </div>
        <div className="flex flex-col items-center text-center bg-white/5 rounded-xl py-3 px-2">
          <div className="bg-red-500/20 rounded-full w-9 h-9 flex items-center justify-center flex-shrink-0 mb-2 ring-1 ring-red-500/30">
            <TrendingDown className="w-4 h-4 text-[#ff6666]" />
          </div>
          <p className="text-[#8FA4C8] text-[9px] mb-1 font-medium uppercase tracking-wider">{t('expense_label')}</p>
          <p className="text-white text-xs font-bold">{formatCurrency(expense)}</p>
        </div>
        <div className="flex flex-col items-center text-center bg-white/5 rounded-xl py-3 px-2">
          <div className="bg-blue-500/20 rounded-full w-9 h-9 flex items-center justify-center flex-shrink-0 mb-2 ring-1 ring-blue-500/30">
            <PiggyBank className="w-4 h-4 text-[#80b3ff]" />
          </div>
          <p className="text-[#8FA4C8] text-[9px] mb-1 font-medium uppercase tracking-wider">{t('savings_label')}</p>
          <p className="text-white text-xs font-bold">{formatCurrency(savings)}</p>
        </div>
      </div>
    </div>
  );
}