import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronRight } from "lucide-react";

function formatRp(n) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1).replace(".", ",")} M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1).replace(".", ",")} jt`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

const ACCOUNT_TYPE_ICONS = {
  bank: "🏦",
  cash: "💵",
  ewallet: "📱",
  other: "💼",
};

export default function BalanceSummary({ accounts }) {
  const total = accounts.reduce((s, a) => s + (a.balance || 0), 0);
  const shown = accounts.slice(0, 3);
  const hidden = accounts.length - 3;

  return (
    <div className="bg-white rounded-2xl px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-[#1A1A1A]">💳 Total Saldo</h3>
        <Link to={createPageUrl("Accounts")} className="text-xs text-[#FF6B35] font-semibold tap-highlight-fix">
          Kelola →
        </Link>
      </div>
      <p className="text-2xl font-black text-[#1A1A1A] mb-3">{formatRp(total)}</p>

      {accounts.length > 1 && (
        <div className="space-y-2">
          {shown.map(acc => (
            <div key={acc.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{acc.icon || ACCOUNT_TYPE_ICONS[acc.type] || "💳"}</span>
                <span className="text-sm text-[#4A5568] font-medium">{acc.name}</span>
              </div>
              <span className="text-sm font-bold text-[#1A1A1A]">{formatRp(acc.balance || 0)}</span>
            </div>
          ))}
          {hidden > 0 && (
            <Link
              to={createPageUrl("Accounts")}
              className="text-xs text-[#8FA4C8] font-semibold tap-highlight-fix"
            >
              +{hidden} rekening lainnya →
            </Link>
          )}
        </div>
      )}

      <Link
        to={createPageUrl("Accounts")}
        className="mt-3 flex items-center justify-center gap-1 text-xs font-bold text-[#FF6B35] py-2 border border-[#FF6B35]/20 rounded-xl tap-highlight-fix"
      >
        Kelola Rekening → <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );
}