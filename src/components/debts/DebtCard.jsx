import { useState, useEffect, useRef } from "react";
import { MoreVertical, Pencil, Trash2, CheckCircle, CreditCard } from "lucide-react";
import { useAppSettings } from "@/components/utils/useAppSettings";

export default function DebtCard({ debt, type, onPay, onEdit, onMarkPaid, onDelete, onOpenDetail }) {
  const { t, formatCurrency } = useAppSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const rawPercent = debt.total_amount > 0 ? ((debt.total_amount - debt.remaining_amount) / debt.total_amount) * 100 : 0;
  const percent = Math.min(Math.max(rawPercent, 0), 100);
  const barColor = percent >= 85 ? "#22C55E" : percent >= 50 ? "#4F7CFF" : "#F97316";

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [menuOpen]);

  return (
    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-transparent">
      <div className="flex items-center gap-3">
        {/* Tappable area to open detail */}
        <button
          onClick={() => onOpenDetail(debt)}
          className="flex items-center gap-3 flex-1 min-w-0 text-left tap-highlight-fix"
        >
          <div className="w-9 h-9 rounded-full bg-[#FF6B6B]/10 flex items-center justify-center text-base flex-shrink-0">
            {debt.icon || type.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-[#1A1A1A] truncate">{debt.name}</p>
            <div className="w-full bg-[#F2F4F7] rounded-full h-1 mt-1.5">
              <div className="h-1 rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: barColor }} />
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-sm text-[#1A1A1A]">{formatCurrency(debt.remaining_amount)}</p>
            <p className="text-[10px] text-[#8FA4C8]">{Math.round(rawPercent)}% terbayar</p>
          </div>
        </button>

        {/* Overflow menu */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8FA4C8] hover:bg-[#F2F4F7] transition-colors tap-highlight-fix"
            aria-label="Menu"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 w-44 bg-white rounded-xl shadow-lg border border-[#E2E8F0] py-1 overflow-hidden">
              <button
                onClick={() => { setMenuOpen(false); onPay(debt.id); }}
                className="w-full px-3 py-2 text-left text-sm text-[#1A1A1A] hover:bg-[#F8FAFC] flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-[#F97316]" /> Bayar Cicilan
              </button>
              <button
                onClick={() => { setMenuOpen(false); onEdit(debt); }}
                className="w-full px-3 py-2 text-left text-sm text-[#1A1A1A] hover:bg-[#F8FAFC] flex items-center gap-2"
              >
                <Pencil className="w-4 h-4 text-[#8FA4C8]" /> Edit
              </button>
              <button
                onClick={() => { setMenuOpen(false); onMarkPaid(debt); }}
                className="w-full px-3 py-2 text-left text-sm text-[#1A1A1A] hover:bg-[#F8FAFC] flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-[#00C9A7]" /> {t('debts_mark_paid_title')}
              </button>
              <button
                onClick={() => { setMenuOpen(false); onDelete(debt.id); }}
                className="w-full px-3 py-2 text-left text-sm text-[#FF6B6B] hover:bg-[#FFF5F5] flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> {t('alerts_delete')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}