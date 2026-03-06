import { useState } from "react";
import { X } from "lucide-react";
import { useAppSettings } from "@/components/utils/useAppSettings";

const ICONS = ["💰", "🏠", "✈️", "🚗", "💍", "🎓", "🏖️", "💻", "🛍️", "🎯"];
const COLORS = [
  { name: "blue", hex: "#4F7CFF" },
  { name: "green", hex: "#34C87A" },
  { name: "orange", hex: "#F5A623" },
  { name: "purple", hex: "#9B59B6" },
  { name: "pink", hex: "#E91E8C" },
  { name: "teal", hex: "#1ABC9C" },
];

export default function AddGoalModal({ onClose, onSave, goal = null }) {
  const { t, formatCurrency, settings } = useAppSettings();
  const [form, setForm] = useState(goal || {
    name: "",
    target_amount: "",
    current_amount: "",
    icon: "💰",
    color: "blue",
    deadline: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.name || !form.target_amount) return;
    setSaving(true);
    await onSave({
      ...form,
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.current_amount) || 0,
    });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[#1A1A1A]">{goal ? t('edit_goal') || 'Edit Goal' : t('add_goal') || 'New Savings Goal'}</h2>
          <button onClick={onClose} className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Icon picker */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-2">{t('icon') || 'Icon'}</p>
          <div className="flex flex-wrap gap-2">
            {ICONS.map((icon) => (
              <button
                key={icon}
                onClick={() => setForm({ ...form, icon })}
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                  form.icon === icon ? "bg-[#1A1A1A] scale-110" : "bg-[#F7F6F3] hover:bg-[#EFEFED]"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-2">{t('color') || 'Color'}</p>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => setForm({ ...form, color: c.name })}
                className={`w-7 h-7 rounded-full transition-all ${form.color === c.name ? "ring-2 ring-offset-2 ring-[#1A1A1A] scale-110" : ""}`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1 block">{t('goal_name') || 'Goal Name'}</label>
            <input
              className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-[#F8FAFC]"
              placeholder={t('goal_name_placeholder') || 'e.g. Dream Vacation'}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1 block">{t('target_amount') || 'Target'} ({settings.currency})</label>
              <input
                type="number"
                className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-[#F8FAFC]"
                placeholder="5000"
                value={form.target_amount}
                onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1 block">{t('current_saved') || 'Saved'} ({settings.currency})</label>
              <input
                type="number"
                className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-[#F8FAFC]"
                placeholder="0"
                value={form.current_amount}
                onChange={(e) => setForm({ ...form, current_amount: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1 block">{t('deadline_optional') || 'Deadline (optional)'}</label>
            <input
              type="date"
              className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-[#F8FAFC]"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-1 block">{t('description_optional') || 'Description (optional)'}</label>
            <textarea
              rows={2}
              className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-[#F8FAFC] resize-none"
              placeholder={t('goal_desc_placeholder') || 'Why are you saving for this?'}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !form.name || !form.target_amount}
          className="mt-6 w-full bg-[#FF6A00] text-white py-3.5 rounded-xl font-semibold text-sm disabled:opacity-40 hover:bg-[#e05e00] transition-colors"
        >
          {saving ? t('saving') : goal ? (t('update_goal') || 'Update Goal') : (t('create_goal') || 'Create Goal')}
        </button>
      </div>
    </div>
  );
}