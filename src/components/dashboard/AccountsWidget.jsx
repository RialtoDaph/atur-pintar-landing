import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronRight } from "lucide-react";

function compactRupiah(value) {
  const abs = Math.abs(value || 0);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}Rp ${(abs / 1_000_000_000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}M`;
  if (abs >= 1_000_000) return `${sign}Rp ${(abs / 1_000_000).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}Jt`;
  if (abs >= 1_000) return `${sign}Rp ${(abs / 1_000).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}rb`;
  return `${sign}Rp ${abs.toLocaleString('id-ID')}`;
}

export default function AccountsWidget({ user }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.Account.filter({ created_by: user.email })
      .then(list => setAccounts(list || []))
      .finally(() => setLoading(false));
  }, [user?.email]);

  if (loading || accounts.length === 0) return null;

  const total = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#F2F4F7] overflow-hidden">
      {/* Header */}
      <Link to={createPageUrl("Accounts")} className="flex items-center justify-between px-4 py-3 border-b border-[#F2F4F7]">
        <div>
          <p className="text-sm font-bold text-[#1A1A1A]">Rekening & Dompet</p>
          <p className="text-xs text-[#8FA4C8]">{accounts.length} rekening · Total {compactRupiah(total)}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-[#8FA4C8]" />
      </Link>

      {/* Horizontal scroll */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {accounts.map(acc => (
          <div
            key={acc.id}
            className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl"
            style={{ backgroundColor: (acc.color || "#FF6A00") + "12", minWidth: 72 }}
          >
            <span className="text-lg">{acc.icon || "🏦"}</span>
            <p className="text-[10px] font-semibold text-[#1A1A1A] text-center leading-tight max-w-[64px] truncate">{acc.name}</p>
            <p className="text-[10px] font-bold" style={{ color: acc.color || "#FF6A00" }}>{compactRupiah(acc.balance)}</p>
            {acc.is_default && <span className="text-[8px] bg-[#FF6A00]/10 text-[#FF6A00] font-bold px-1.5 py-0.5 rounded-full">Utama</span>}
          </div>
        ))}
      </div>
    </div>
  );
}