import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAppSettings } from "@/components/utils/useAppSettings";
import { Zap, ChevronRight } from "lucide-react";
import BottomSheetSelect from "@/components/ui/BottomSheetSelect";

export default function RoundUpSettings() {
  const { t, formatCurrency } = useAppSettings();
  const [rule, setRule] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [rules, user] = await Promise.all([
      base44.entities.RoundUpRule.list(),
      base44.auth.me(),
    ]);
    const [gls] = await Promise.all([
      base44.entities.SavingsGoal.filter({ created_by: user.email, status: "active" }),
    ]);
    setGoals(gls);

    if (rules.length > 0) {
      setRule(rules[0]);
    } else {
      // Create default rule
      const newRule = await base44.entities.RoundUpRule.create({
        is_enabled: false,
        goal_id: "",
        round_to: 1000,
        total_saved: 0,
      });
      setRule(newRule);
    }
    setLoading(false);
  }

  async function toggleEnabled() {
    if (!rule) return;
    if (!rule.is_enabled && !rule.goal_id) {
      setShowGoalPicker(true);
      return;
    }
    setSaving(true);
    const updated = { ...rule, is_enabled: !rule.is_enabled };
    setRule(updated);
    await base44.entities.RoundUpRule.update(rule.id, { is_enabled: !rule.is_enabled });
    setSaving(false);
  }

  async function selectGoal(goalId) {
    if (!rule) return;
    setSaving(true);
    const updated = { ...rule, goal_id: goalId, is_enabled: !!goalId };
    setRule(updated);
    await base44.entities.RoundUpRule.update(rule.id, { goal_id: goalId, is_enabled: !!goalId });
    setSaving(false);
  }

  async function selectRoundTo(value) {
    if (!rule) return;
    setSaving(true);
    const updated = { ...rule, round_to: value };
    setRule(updated);
    await base44.entities.RoundUpRule.update(rule.id, { round_to: value });
    setSaving(false);
  }

  if (loading) {
    return <div className="h-16 bg-[#F2F4F7] rounded-2xl animate-pulse" />;
  }

  const linkedGoal = goals.find(g => g.id === rule?.goal_id);
  const roundOptions = [500, 1000, 2000, 5000, 10000];

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header toggle row */}
        <div className="flex items-center gap-3 px-4 py-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${rule?.is_enabled ? "bg-[#FF6A00]/15" : "bg-[#F2F4F7]"}`}>
            <Zap className={`w-5 h-5 ${rule?.is_enabled ? "text-[#FF6A00]" : "text-[#8FA4C8]"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#1A1A1A]">Round-Up Otomatis</p>
            <p className="text-xs text-[#8FA4C8] mt-0.5">
              {rule?.is_enabled
                ? `Aktif · ${formatCurrency(rule.total_saved || 0)} total tersimpan`
                : "Simpan kembalian ke tujuan tabungan"}
            </p>
          </div>
          <button
            onClick={toggleEnabled}
            disabled={saving}
            className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 tap-highlight-fix ${
              rule?.is_enabled ? "bg-[#FF6A00]" : "bg-[#E2E8F0]"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                rule?.is_enabled ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Config rows (only if enabled or goal set) */}
        {(rule?.is_enabled || rule?.goal_id) && (
          <div className="border-t border-[#F2F4F7]">
            {/* Target goal */}
            <button
              onClick={() => setShowGoalPicker(true)}
              className="flex items-center justify-between w-full px-4 py-3 hover:bg-[#F8FAFC] transition-colors tap-highlight-fix"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{linkedGoal?.icon || "🎯"}</span>
                <div className="text-left">
                  <p className="text-xs text-[#8FA4C8]">Tujuan Tabungan</p>
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    {linkedGoal?.name || "Pilih tujuan..."}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8FA4C8]" />
            </button>

            {/* Round-to amount */}
            <div className="px-4 pb-4 border-t border-[#F2F4F7]">
              <p className="text-xs text-[#8FA4C8] mt-3 mb-2 font-semibold uppercase tracking-widest">Bulatkan ke kelipatan</p>
              <div className="flex gap-2 flex-wrap">
                {roundOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => selectRoundTo(opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all tap-highlight-fix ${
                      rule?.round_to === opt
                        ? "bg-[#0A0A0A] text-white"
                        : "bg-[#F2F4F7] text-[#4A5568] hover:bg-[#E2E8F0]"
                    }`}
                  >
                    {formatCurrency(opt)}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#8FA4C8] mt-2">
                Contoh: pengeluaran Rp 8.300 → dibulatkan ke Rp 9.000 → Rp 700 disimpan otomatis
              </p>
            </div>
          </div>
        )}
      </div>

      <BottomSheetSelect
        isOpen={showGoalPicker}
        onClose={() => setShowGoalPicker(false)}
        title="Pilih Tujuan Tabungan"
        options={goals.map(g => ({ key: g.id, label: g.name, emoji: g.icon }))}
        onSelect={selectGoal}
        selectedValue={rule?.goal_id}
      />
    </>
  );
}