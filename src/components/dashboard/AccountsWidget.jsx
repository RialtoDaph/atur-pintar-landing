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

export default function AccountsWidget({ user, accounts: accountsProp }) {
  const accounts = accountsProp || [];

  if (accounts.length === 0) return null;

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

      {/* List */}
      <div className="divide-y divide-[#F2F4F7]">
        {accounts.map(acc => (
          <div key={acc.id} className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ backgroundColor: (acc.color || "#FF6A00") + "15" }}>
              {acc.icon || "🏦"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-[#1A1A1A] truncate">{acc.name}</p>
                {acc.is_default && <span className="text-[9px] bg-[#FF6A00]/10 text-[#FF6A00] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">Utama</span>}
              </div>
              <p className="text-[11px] text-[#8FA4C8]">{acc.type === "bank" ? "Bank" : acc.type === "cash" ? "Cash" : acc.type === "ewallet" ? "E-Wallet" : "Lainnya"}</p>
            </div>
            <p className="text-sm font-bold flex-shrink-0" style={{ color: acc.color || "#FF6A00" }}>{compactRupiah(acc.balance)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}