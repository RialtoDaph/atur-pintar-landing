import { useState } from "react";
import { X } from "lucide-react";
import { useAppSettings } from "@/components/utils/useAppSettings";

export default function AddTransactionModal({ type, onClose, onSave, maxWithdrawal }) {
  const { t, settings } = useAppSettings();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const isDeposit = type === "deposit";
  const max = !isDeposit ? maxWithdrawal : Infinity;

  async function handleSave() {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    if (!isDeposit && val > max) return;
    setSaving(true);
    await onSave(val, type, note);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[#1A1A1A]">
            {isDeposit ? t('add_money') || 'Add Money' : t('withdraw') || 'Withdraw'}
          </h2>
          <button onClick={onClose} className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount input */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-2 block">{t('amount') || 'Amount'} ({settings.currency})</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA4C8] font-medium">{settings.currency_symbol}</span>
            <input
              autoFocus
              type="number"
              min="0"
              max={!isDeposit ? maxWithdrawal : undefined}
              className="w-full border border-[#E2E8F0] rounded-xl pl-12 pr-4 py-3.5 text-xl font-bold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-[#F8FAFC]"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          {!isDeposit && (
            <p className="text-xs text-[#8FA4C8] mt-1">{t('available') || 'Available'}: {settings.currency_symbol} {maxWithdrawal.toLocaleString(settings.language === 'id' ? "id-ID" : "en-US")}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-2 block">{t('note_optional') || 'Note (optional)'}</label>
          <input
            className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-[#F8FAFC]"
            placeholder={isDeposit ? t('note_deposit_placeholder') || 'e.g. Monthly savings' : t('note_withdraw_placeholder') || 'e.g. Emergency expense'}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !amount || parseFloat(amount) <= 0 || (!isDeposit && parseFloat(amount) > max)}
          className="w-full py-3.5 rounded-xl font-semibold text-sm disabled:opacity-40 transition-colors"
          style={{
            backgroundColor: isDeposit ? "#FF6A00" : "#FF5252",
            color: "white",
          }}
        >
          {saving ? t('saving') || 'Saving...' : isDeposit ? (t('add_money') || 'Add Money') : (t('withdraw') || 'Withdraw')}
        </button>
      </div>
    </div>
  );
}