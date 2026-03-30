import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAppSettings } from "@/components/utils/AppSettingsContext";
import { Link } from "react-router-dom";
import { Wallet, ChevronRight } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function WalletWidget() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useAppSettings();

  useEffect(() => {
    base44.entities.Wallet.filter({ is_active: true }).then((data) => {
      setWallets(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (wallets.length === 0) return null;

  const total = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-[#FF6A00]" />
          </div>
          <span className="text-sm font-bold text-[#1A1A1A]">Dompet Saya</span>
        </div>
        <Link to={createPageUrl("Wallets")} className="flex items-center gap-1 text-xs text-[#FF6A00] font-semibold">
          Lihat semua <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="text-xs text-gray-500 mb-3">Total saldo semua akun</div>
      <div className="text-2xl font-black text-[#1A1A1A] mb-4">{formatCurrency(total)}</div>

      <div className="space-y-2">
        {wallets.slice(0, 3).map((w) => (
          <div key={w.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ backgroundColor: (w.color || "#FF6A00") + "20" }}>
                {w.icon || "💰"}
              </div>
              <span className="text-sm font-medium text-[#1A1A1A]">{w.name}</span>
            </div>
            <span className="text-sm font-bold text-[#1A1A1A]">{formatCurrency(w.balance || 0)}</span>
          </div>
        ))}
        {wallets.length > 3 && (
          <p className="text-xs text-gray-400 text-center pt-1">+{wallets.length - 3} dompet lainnya</p>
        )}
      </div>
    </div>
  );
}