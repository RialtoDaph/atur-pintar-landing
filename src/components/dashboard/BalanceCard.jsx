import { TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { useAppSettings } from "@/components/utils/useAppSettings";

const NANA_HAPPY = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a82e8090f60786b869983c/6fd28e434_generated_image.png";
const NANA_WORRIED = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a82e8090f60786b869983c/6b948dd67_generated_image.png";
const NANA_SAD = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a82e8090f60786b869983c/eef7f84ea_generated_image.png";

export default function BalanceCard({ income, expense, savings, loading }) {
  const { formatCurrency, t } = useAppSettings();
  const balance = income - expense;

  const nanaImage = balance < 0 ? NANA_SAD : balance < income * 0.1 ? NANA_WORRIED : NANA_HAPPY;

  if (loading) {
    return (
      <div className="bg-[#0A0A0A] rounded-2xl p-5 animate-pulse h-36" />
    );
  }

  return (
    <div className="bg-[#161616] rounded-2xl p-4 border border-[#222] relative overflow-hidden">
      <p className="text-[#8FA4C8] text-xs font-semibold uppercase tracking-widest mb-1">{t('balance_card_title')}</p>
      <div className="flex items-center justify-between">
        <p className={`text-3xl font-bold mb-4 ${balance >= 0 ? "text-white" : "text-red-400"}`}>
          {balance >= 0 ? "" : "-"}{formatCurrency(Math.abs(balance))}
        </p>
        <img
          src={nanaImage}
          alt="Nana"
          className="w-24 h-24 object-contain absolute right-2 bottom-0"
          style={{ mixBlendMode: "normal" }}
        />
      </div>

      <div className="border-t border-[#2d2d2d] mb-3"></div>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-green-500/40 rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-[#99ff80]" />
          </div>
          <div>
            <p className="text-[#8FA4C8] text-[9px]">{t('income_label')}</p>
            <p className="text-white text-xs font-semibold">{formatCurrency(income)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-red-500/40 rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-4 h-4 text-[#ff6666]" />
          </div>
          <div>
            <p className="text-[#8FA4C8] text-[9px]">{t('expense_label')}</p>
            <p className="text-white text-xs font-semibold">{formatCurrency(expense)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-blue-500/40 rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0">
            <PiggyBank className="w-4 h-4 text-[#80b3ff]" />
          </div>
          <div>
            <p className="text-[#8FA4C8] text-[9px]">{t('savings_label')}</p>
            <p className="text-white text-xs font-semibold">{formatCurrency(savings)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}