import { useState } from "react";
import { X, CreditCard } from "lucide-react";
import { useAppSettings } from "@/components/utils/useAppSettings";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";
import BottomSheetSelect from "@/components/ui/BottomSheetSelect";

export default function PayDebtModal({ debt, accounts = [], onClose, onConfirm }) {
  useLockBodyScroll();
  const { formatCurrency } = useAppSettings();
  const [amount, setAmount] = useState(debt?.monthly_payment ? String(debt.monthly_payment) : "");
  const [note, setNote] = useState(`Cicilan ${debt?.name || ""}`);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [accountId, setAccountId] = useState(accounts.find(a => a.is_default)?.id || accounts[0]?.id || "");
  const [saving, setSaving] = useState(false);
  const [showAccountSheet, setShowAccountSheet] = useState(false);

  const selectedAccount = accounts.find(a => a.id === accountId);
  const accountOptions = [
    { key: "", label: "Tanpa rekening", emoji: "—" },
    ...accounts.map(a => ({ key: a.id, label: a.name, emoji: a.icon || "💳" })),
  ];

  function formatInput(val) {
    const num = val.replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function parseAmount(val) {
    return parseInt(val.replace(/\./g, ""), 10) || 0;
  }

  async function handleConfirm() {
    const parsed = parseAmount(amount);
    if (!parsed || parsed <= 0) return;
    setSaving(true);
    await onConfirm({ amount: parsed, note, date, accountId: accountId || undefined });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm shadow-2xl flex flex-col" style={{ maxHeight: "min(92dvh, calc(100dvh - 2rem))" }}>
        {/* Header — sticky */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#F2F4F7] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF6B6B]/10 flex items-center justify-center text-xl">
              {debt?.icon || "💳"}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A1A1A]">Bayar Cicilan</h2>
              <p className="text-xs text-[#8FA4C8]">{debt?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#9B9B9B] hover:text-[#1A1A1A] tap-highlight-fix">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="px-6 py-5 overflow-y-auto overscroll-contain flex-1">
        <div className="bg-[#F8FAFC] rounded-2xl p-4 mb-5">
          <div className="flex justify-between text-xs text-[#8FA4C8] mb-1">
            <span>Sisa Utang</span>
            <span>Cicilan/bln</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-[#FF6B6B]">{formatCurrency(debt?.remaining_amount || 0)}</span>
            <span className="font-bold text-[#1A1A1A]">{debt?.monthly_payment ? formatCurrency(debt.monthly_payment) : "-"}</span>
          </div>
        </div>

        <div className="space-y-3 mb-5">
          <div>
            <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1.5 block">Jumlah Bayar (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(formatInput(e.target.value))}
              className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#F97316] bg-[#F8FAFC] tap-highlight-fix font-bold text-base"
            />
          </div>
          {accounts.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1.5 block">Dari Rekening</label>
              <button
                type="button"
                onClick={() => setShowAccountSheet(true)}
                className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#F97316] bg-[#F8FAFC] tap-highlight-fix flex items-center justify-between text-left"
              >
                <span>{selectedAccount ? `${selectedAccount.icon || "💳"} ${selectedAccount.name}` : "Tanpa rekening"}</span>
                <span className="text-[#8FA4C8]">›</span>
              </button>
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1.5 block">Catatan</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#F97316] bg-[#F8FAFC] tap-highlight-fix"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1.5 block">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#F97316] bg-[#F8FAFC] tap-highlight-fix"
            />
          </div>
        </div>

        </div>

        {/* Sticky footer — always visible */}
        <div className="px-6 py-4 border-t border-[#F2F4F7] flex-shrink-0" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
          <button
            onClick={handleConfirm}
            disabled={saving || !parseAmount(amount)}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#F97316] disabled:opacity-40 hover:bg-[#e05e00] transition-colors tap-highlight-fix flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            {saving ? "Menyimpan..." : "Catat Pembayaran"}
          </button>
        </div>
      </div>

      <BottomSheetSelect
        isOpen={showAccountSheet}
        onClose={() => setShowAccountSheet(false)}
        title="Pilih Rekening"
        options={accountOptions}
        onSelect={(id) => setAccountId(id)}
        selectedValue={accountId}
      />
    </div>
  );
}