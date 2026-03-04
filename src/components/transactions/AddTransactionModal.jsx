import { useState } from "react";
import { X } from "lucide-react";

const CATEGORIES = {
  expense: [
    { key: "housing", label: "Housing", emoji: "🏠" },
    { key: "food", label: "Food & Dining", emoji: "🍔" },
    { key: "transport", label: "Transport", emoji: "🚗" },
    { key: "health", label: "Health", emoji: "❤️" },
    { key: "entertainment", label: "Entertainment", emoji: "🎬" },
    { key: "shopping", label: "Shopping", emoji: "🛍️" },
    { key: "subscriptions", label: "Subscriptions", emoji: "📱" },
    { key: "other", label: "Other", emoji: "📦" },
  ],
  income: [
    { key: "salary", label: "Salary", emoji: "💼" },
    { key: "freelance", label: "Freelance", emoji: "💻" },
    { key: "other", label: "Other", emoji: "📦" },
  ],
};

export default function AddTransactionModal({ onClose, onSave }) {
  const [tab, setTab] = useState("expense");
  const [form, setForm] = useState({
    amount: "",
    category: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.amount || !form.category) return;
    setSaving(true);
    await onSave({
      ...form,
      type: tab,
      amount: parseFloat(form.amount),
    });
    setSaving(false);
  }

  const cats = CATEGORIES[tab] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1B2559]">Add Transaction</h2>
          <button onClick={onClose} className="text-[#8FA4C8] hover:text-[#1B2559] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type tabs */}
        <div className="flex bg-[#F2F4F7] rounded-xl p-1 mb-5">
          {["expense", "income"].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setForm(f => ({ ...f, category: "" })); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t
                  ? t === "expense"
                    ? "bg-[#FF6B6B] text-white shadow-sm"
                    : "bg-[#00C9A7] text-white shadow-sm"
                  : "text-[#8FA4C8]"
              }`}
            >
              {t === "expense" ? "Expense" : "Income"}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1.5 block">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA4C8] font-medium text-lg">$</span>
            <input
              autoFocus
              type="number"
              className="w-full border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-3.5 text-2xl font-bold text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-[#00C9A7] bg-[#F8FAFC]"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
        </div>

        {/* Category */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-2 block">Category</label>
          <div className="grid grid-cols-4 gap-2">
            {cats.map((c) => (
              <button
                key={c.key}
                onClick={() => setForm({ ...form, category: c.key })}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                  form.category === c.key
                    ? "border-[#00C9A7] bg-[#00C9A7]/10"
                    : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E0]"
                }`}
              >
                <span className="text-xl">{c.emoji}</span>
                <span className="text-[10px] font-medium text-[#4A5568] text-center leading-tight">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Note & Date */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1.5 block">Note (optional)</label>
            <input
              className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-[#00C9A7] bg-[#F8FAFC]"
              placeholder="e.g. Grocery run, Netflix..."
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1.5 block">Date</label>
            <input
              type="date"
              className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-[#00C9A7] bg-[#F8FAFC]"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !form.amount || !form.category}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-white disabled:opacity-40 transition-colors"
          style={{ backgroundColor: tab === "expense" ? "#FF6B6B" : "#00C9A7" }}
        >
          {saving ? "Saving..." : `Add ${tab === "expense" ? "Expense" : "Income"}`}
        </button>
      </div>
    </div>
  );
}