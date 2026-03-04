import { useState } from "react";
import { X } from "lucide-react";

const ALL_CATEGORIES = [
  { key: "housing", label: "Housing", emoji: "🏠" },
  { key: "food", label: "Food", emoji: "🍔" },
  { key: "transport", label: "Transport", emoji: "🚗" },
  { key: "health", label: "Health", emoji: "❤️" },
  { key: "entertainment", label: "Entertainment", emoji: "🎬" },
  { key: "shopping", label: "Shopping", emoji: "🛍️" },
  { key: "subscriptions", label: "Subscriptions", emoji: "📱" },
  { key: "other", label: "Other", emoji: "📦" },
];

export default function AddBudgetModal({ onClose, onSave, existingCategories }) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const available = ALL_CATEGORIES.filter(c => !existingCategories.includes(c.key));

  async function handleSave() {
    if (!category || !amount) return;
    setSaving(true);
    await onSave({ category, amount: parseFloat(amount) });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1A1A1A]">Tambah Anggaran</h2>
          <button onClick={onClose} className="text-[#9B9B9B] hover:text-[#1A1A1A]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-5">
          <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-2 block">Kategori</label>
          <div className="grid grid-cols-4 gap-2">
            {available.map(c => (
              <button key={c.key} onClick={() => setCategory(c.key)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                  category === c.key ? "border-[#FF6A00] bg-[#FF6A00]/10" : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E0]"
                }`}>
                <span className="text-xl">{c.emoji}</span>
                <span className="text-[10px] font-medium text-[#4A5568] text-center leading-tight">{c.label}</span>
              </button>
            ))}
          </div>
          {available.length === 0 && <p className="text-sm text-[#8FA4C8] text-center py-4">Semua kategori sudah dianggarkan</p>}
        </div>

        <div className="mb-6">
          <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1.5 block">Batas Anggaran (Rp)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA4C8] font-medium">Rp</span>
            <input
              type="number"
              className="w-full border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-3.5 text-xl font-bold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-[#F8FAFC]"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving || !category || !amount}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#FF6A00] disabled:opacity-40 hover:bg-[#e05e00] transition-colors">
          {saving ? "Menyimpan..." : "Simpan Anggaran"}
        </button>
      </div>
    </div>
  );
}