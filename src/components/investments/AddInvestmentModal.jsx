import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAppSettings } from "@/components/utils/useAppSettings";
import { INVESTMENT_TYPES_LIST } from "./investmentConstants";

export default function AddInvestmentModal({ onClose, onSave, investment = null }) {
  const { settings } = useAppSettings();
  const lang = settings.language === "en" ? "en" : "id";

  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    account_id: investment?.account_id || "",
    name: investment?.name || "",
    type: investment?.type || "reksa_dana",
    initial_amount: investment?.initial_amount?.toString() || "",
    current_value: investment?.current_value?.toString() || "",
    purchase_date: investment?.purchase_date || "",
    notes: investment?.notes || "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      base44.entities.Account.filter({ created_by: u.email })
        .then(accs => setAccounts(accs || []))
        .catch(() => {});
    }).catch(() => {});
  }, []);

  async function handleSave() {
    const name = form.name.trim();
    const initial = parseFloat(form.initial_amount) || 0;
    const current = parseFloat(form.current_value) || 0;
    if (!name || initial <= 0) return;

    setSaving(true);
    try {
      await onSave({
        account_id: form.account_id || undefined,
        name,
        type: form.type,
        initial_amount: initial,
        current_value: current > 0 ? current : initial,
        purchase_date: form.purchase_date || undefined,
        notes: form.notes || undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-[#F8FAFC]";
  const labelCls = "text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1.5 block";
  const isValid = form.name.trim() && parseFloat(form.initial_amount) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1A1A1A]">
            {investment
              ? (lang === "en" ? "Edit Investment" : "Edit Investasi")
              : (lang === "en" ? "Add Investment" : "Tambah Investasi")}
          </h2>
          <button onClick={onClose} className="text-[#9B9B9B] hover:text-[#1A1A1A]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">

          {/* 1. Dompet investasi */}
          <div>
            <label className={labelCls}>{lang === "en" ? "Wallet / Platform" : "Dompet / Platform"}</label>
            <select
              className={inputCls}
              value={form.account_id}
              onChange={e => setForm(f => ({ ...f, account_id: e.target.value }))}
            >
              <option value="">{lang === "en" ? "-- Select wallet --" : "-- Pilih dompet --"}</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.icon ? `${acc.icon} ` : ""}{acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Nama aset */}
          <div>
            <label className={labelCls}>{lang === "en" ? "Asset Name" : "Nama Aset"}</label>
            <input
              type="text"
              placeholder={lang === "en" ? "e.g. Reksa Dana Pertumbuhan, BTC, BBCA" : "mis. Reksa Dana Pertumbuhan, BTC, BBCA"}
              className={inputCls}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          {/* 3. Tipe investasi */}
          <div>
            <label className={labelCls}>{lang === "en" ? "Type" : "Tipe"}</label>
            <div className="grid grid-cols-4 gap-2">
              {INVESTMENT_TYPES_LIST.map(type => (
                <button
                  key={type.key}
                  onClick={() => setForm(f => ({ ...f, type: type.key }))}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                    form.type === type.key
                      ? "border-[#FF6A00] bg-[#FF6A00]/10"
                      : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E0]"
                  }`}
                >
                  <span className="text-xl">{type.emoji}</span>
                  <span className="text-[10px] font-medium text-[#4A5568] text-center leading-tight">
                    {lang === "en" ? type.label_en : type.label_id}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Nominal beli */}
          <div>
            <label className={labelCls}>{lang === "en" ? "Purchase Amount (Rp)" : "Nominal Beli (Rp)"}</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              className={inputCls}
              value={form.initial_amount}
              onChange={e => setForm(f => ({ ...f, initial_amount: e.target.value }))}
            />
          </div>

          {/* 5. Nilai saat ini */}
          <div>
            <label className={labelCls}>{lang === "en" ? "Current Value (Rp)" : "Nilai Saat Ini (Rp)"}</label>
            <input
              type="number"
              min="0"
              placeholder={lang === "en" ? "Leave empty = same as purchase" : "Kosongkan = sama dengan nominal beli"}
              className={inputCls}
              value={form.current_value}
              onChange={e => setForm(f => ({ ...f, current_value: e.target.value }))}
            />
            <p className="text-xs text-[#8FA4C8] mt-1">
              {lang === "en" ? "Update manually whenever the value changes." : "Update manual setiap nilai berubah."}
            </p>
          </div>

          {/* 6. Tanggal beli */}
          <div>
            <label className={labelCls}>{lang === "en" ? "Purchase Date" : "Tanggal Beli"}</label>
            <input
              type="date"
              className={inputCls}
              value={form.purchase_date}
              onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))}
            />
          </div>

          {/* 7. Catatan opsional */}
          <div>
            <label className={labelCls}>{lang === "en" ? "Notes (optional)" : "Catatan (opsional)"}</label>
            <input
              type="text"
              placeholder={lang === "en" ? "e.g. DCA monthly" : "mis. DCA bulanan"}
              className={inputCls}
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !isValid}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#FF6A00] disabled:opacity-40 hover:bg-[#e05e00] transition-colors"
        >
          {saving
            ? (lang === "en" ? "Saving..." : "Menyimpan...")
            : investment
              ? (lang === "en" ? "Update" : "Perbarui")
              : (lang === "en" ? "Add Investment" : "Tambah Investasi")}
        </button>
      </div>
    </div>
  );
}