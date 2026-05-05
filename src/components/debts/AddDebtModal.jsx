import { useState } from "react";
import { X } from "lucide-react";
import DateInput from "@/components/utils/DateInput";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";

function parseNum(val) { return parseInt(String(val).replace(/\D/g, ""), 10) || 0; }
function fmtNum(val) {
  const n = parseNum(val);
  return n > 0 ? n.toLocaleString("id-ID") : "";
}
function AmountInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1.5 block">{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA4C8] text-sm">Rp</span>
        <input type="text" inputMode="numeric" placeholder={placeholder || "0"}
          className="w-full border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-[#F8FAFC]"
          value={fmtNum(value)}
          onChange={e => onChange(parseNum(e.target.value))} />
      </div>
    </div>
  );
}

const DEBT_TYPES = [
{ key: "kpr", label: "KPR", emoji: "🏠" },
{ key: "kendaraan", label: "Kendaraan", emoji: "🚗" },
{ key: "kartu_kredit", label: "Kartu Kredit", emoji: "💳" },
{ key: "pinjaman_pribadi", label: "Pinjaman Pribadi", emoji: "🤝" },
{ key: "lainnya", label: "Lainnya", emoji: "📋" }];


export default function AddDebtModal({ onClose, onSave, debt }) {
  useLockBodyScroll();
  const [form, setForm] = useState({
    name: debt?.name || "", type: debt?.type || "lainnya",
    total_amount: debt?.total_amount || 0, remaining_amount: debt?.remaining_amount || 0,
    interest_rate: debt?.interest_rate || "", monthly_payment: debt?.monthly_payment || 0,
    due_date: debt?.due_date || "", icon: debt?.icon || ""
  });
  const [saving, setSaving] = useState(false);
  const isEdit = !!debt;

  async function handleSave() {
    if (!form.name?.trim()) return;

    const totalAmount = parseFloat(form.total_amount) || 0;
    const remainingAmount = parseFloat(form.remaining_amount) || 0;
    const monthlyPayment = parseFloat(form.monthly_payment) || 0;
    const interestRate = parseFloat(form.interest_rate) || 0;

    if (totalAmount <= 0 || remainingAmount <= 0) return;
    if (remainingAmount > totalAmount) return;
    if (monthlyPayment < 0 || interestRate < 0 || interestRate > 100) return;

    setSaving(true);
    try {
      await onSave({
        ...form,
        total_amount: totalAmount,
        remaining_amount: remainingAmount,
        interest_rate: interestRate > 0 ? interestRate : undefined,
        monthly_payment: monthlyPayment > 0 ? monthlyPayment : undefined
      });
    } catch (error) {
      console.error("Save debt failed:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div role="dialog" aria-modal="true" className="bg-white p-6 rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl max-h-[88vh] sm:max-h-[90vh] overflow-y-auto overscroll-contain animate-slide-up-sheet" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-[#1A1A1A]">{isEdit ? "Edit Utang/Kredit" : "Tambah Utang/Kredit"}</h2>
            <button onClick={onClose} className="text-[#9B9B9B] hover:text-[#1A1A1A] tap-highlight-fix"><X className="w-5 h-5" /></button>
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-2 block">Jenis</label>
            <div className="grid grid-cols-2 gap-2">
              {DEBT_TYPES.map(t => {
                const selected = form.type === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: t.key }))}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-all border tap-highlight-fix ${selected ? "border-[#FF6A00] bg-[#FFF5F0] text-[#FF6A00] font-semibold" : "border-[#E2E8F0] bg-white text-[#1A1A1A] hover:border-[#FF6A00]/50"}`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#F2F4F7] flex items-center justify-center flex-shrink-0">
                      <span className="text-base">{t.emoji}</span>
                    </div>
                    <span className="flex-1 truncate text-xs">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div>
              <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1.5 block">Nama Utang</label>
              <input type="text" placeholder="e.g. KPR BCA, Kartu Kredit Mandiri"
                className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-[#F8FAFC] tap-highlight-fix"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <AmountInput label="Total Utang (Rp)" value={form.total_amount} onChange={v => setForm(f => ({ ...f, total_amount: v }))} />
            <AmountInput label="Sisa Utang (Rp)" value={form.remaining_amount} onChange={v => setForm(f => ({ ...f, remaining_amount: v }))} />
            <AmountInput label="Cicilan/Bulan (Rp)" value={form.monthly_payment} onChange={v => setForm(f => ({ ...f, monthly_payment: v }))} placeholder="0 (opsional)" />
            <div>
              <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1.5 block">Bunga per Tahun (%)</label>
              <input type="number" placeholder="0 (opsional)"
                className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-[#F8FAFC] tap-highlight-fix"
                value={form.interest_rate}
                onChange={e => setForm(f => ({ ...f, interest_rate: e.target.value }))} />
            </div>
            <DateInput
              value={form.due_date}
              onChange={(date) => setForm((f) => ({ ...f, due_date: date }))}
              label="Tanggal Jatuh Tempo" />
            
          </div>

          <button onClick={handleSave} disabled={saving || !form.name || !form.total_amount || !form.remaining_amount}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#FF6A00] disabled:opacity-40 hover:bg-[#e05e00] transition-colors tap-highlight-fix">
            {saving ? "Menyimpan..." : isEdit ? "Perbarui Utang" : "Simpan Utang"}
          </button>
        </div>
      </div>
    </>);

}