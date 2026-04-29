import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";
import { useAppSettings } from "@/components/utils/useAppSettings";

const INVESTMENT_TYPES = [
  { value: "reksa_dana", label: "Reksa Dana", emoji: "📈" },
  { value: "saham", label: "Saham", emoji: "📊" },
  { value: "crypto", label: "Kripto", emoji: "🪙" },
  { value: "emas", label: "Emas", emoji: "🥇" },
  { value: "deposito", label: "Deposito", emoji: "🏦" },
  { value: "obligasi", label: "Obligasi", emoji: "📄" },
  { value: "lainnya", label: "Lainnya", emoji: "💼" },
];

export default function AddInvestmentModal({ investment, onClose, onSave }) {
  const { formatCurrency } = useAppSettings();
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    name: investment?.name || "",
    type: investment?.type || "reksa_dana",
    account_id: investment?.account_id || "",
    initial_amount: investment?.initial_amount || "",
    current_value: investment?.current_value || "",
    purchase_date: investment?.purchase_date || new Date().toISOString().split("T")[0],
    notes: investment?.notes || "",
    icon: investment?.icon || "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      base44.entities.Account.filter({ created_by: u.email, type: "investment" })
        .then(setAccounts)
        .catch(() => {});
    }).catch(() => {});
  }, []);

  const selectedType = INVESTMENT_TYPES.find(t => t.value === form.type);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...form,
      initial_amount: parseFloat(form.initial_amount) || 0,
      current_value: parseFloat(form.current_value) || 0,
      icon: form.icon || selectedType?.emoji || "💼",
    });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1A1A1A]">
            {investment ? "Edit Investasi" : "Tambah Investasi"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F2F4F7] flex items-center justify-center">
            <X className="w-4 h-4 text-[#4A5568]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama */}
          <div>
            <label className="text-xs font-semibold text-[#4A5568] mb-1.5 block">Nama Investasi</label>
            <input
              type="text"
              placeholder="e.g., Reksa Dana Manulife, Saham BBCA"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#FF6A00]"
            />
          </div>

          {/* Jenis Investasi */}
          <div>
            <label className="text-xs font-semibold text-[#4A5568] mb-1.5 block">Jenis Investasi</label>
            <div className="grid grid-cols-4 gap-2">
              {INVESTMENT_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: t.value })}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                    form.type === t.value
                      ? "border-[#FF6A00] bg-[#FF6A00]/5"
                      : "border-[#E2E8F0] bg-white"
                  }`}
                >
                  <span className="text-xl">{t.emoji}</span>
                  <span className="text-[10px] font-semibold text-[#4A5568] text-center leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dompet Investasi */}
          {accounts.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-[#4A5568] mb-1.5 block">Dompet Investasi (opsional)</label>
              <select
                value={form.account_id}
                onChange={e => setForm({ ...form, account_id: e.target.value })}
                className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#FF6A00] bg-white"
              >
                <option value="">-- Pilih Dompet --</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.icon ? `${a.icon} ` : ""}{a.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Modal Awal */}
          <div>
            <label className="text-xs font-semibold text-[#4A5568] mb-1.5 block">Modal Awal (Rp)</label>
            <input
              type="number"
              placeholder="0"
              value={form.initial_amount}
              onChange={e => setForm({ ...form, initial_amount: e.target.value })}
              required
              min="0"
              className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#FF6A00]"
            />
          </div>

          {/* Nilai Saat Ini */}
          <div>
            <label className="text-xs font-semibold text-[#4A5568] mb-1.5 block">Nilai Saat Ini (Rp)</label>
            <input
              type="number"
              placeholder="0"
              value={form.current_value}
              onChange={e => setForm({ ...form, current_value: e.target.value })}
              required
              min="0"
              className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#FF6A00]"
            />
          </div>

          {/* Tanggal Beli */}
          <div>
            <label className="text-xs font-semibold text-[#4A5568] mb-1.5 block">Tanggal Pembelian</label>
            <input
              type="date"
              value={form.purchase_date}
              onChange={e => setForm({ ...form, purchase_date: e.target.value })}
              className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#FF6A00]"
            />
          </div>

          {/* Catatan */}
          <div>
            <label className="text-xs font-semibold text-[#4A5568] mb-1.5 block">Catatan (opsional)</label>
            <textarea
              placeholder="Catatan tambahan..."
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#FF6A00] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#FF6A00] text-white font-bold py-3.5 rounded-xl disabled:opacity-60 transition-colors hover:bg-[#e05e00]"
          >
            {saving ? "Menyimpan..." : investment ? "Simpan Perubahan" : "Tambah Investasi"}
          </button>
        </form>
      </div>
    </div>
  );
}