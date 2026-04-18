import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ACHIEVEMENTS_DEF } from "@/hooks/useGamification";

export default function Achievements() {
  const [unlocked, setUnlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {
    base44.auth.me().then(async u => {
      const records = await base44.entities.Achievement.filter({ created_by: u.email }).catch(() => []);
      const unlockedKeys = (records || []).map(r => r.achievement_key);
      setUnlocked(unlockedKeys);
      const bonus = (records || []).reduce((s, r) => s + (r.xp_reward || 0), 0);
      setTotalXP(bonus);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F4F7] pb-8">
      {/* Header */}
      <div className="bg-[#0A0A0A] px-5 pt-10 pb-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-[#8FA4C8] text-sm font-medium">Pencapaian kamu</p>
          <h1 className="text-white text-2xl font-bold mt-0.5">Achievement Kamu 🏅</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 mt-4 space-y-4">
        {/* Total XP bonus */}
        <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#8FA4C8] font-semibold uppercase tracking-widest">Total Bonus XP</p>
            <p className="text-2xl font-bold text-[#FF6B35]">{totalXP.toLocaleString("id-ID")} XP</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#8FA4C8]">Terkumpul</p>
            <p className="text-sm font-bold text-[#1A1A1A]">{unlocked.length} / {ACHIEVEMENTS_DEF.length}</p>
          </div>
        </div>

        {/* Group by category */}
        {["streak", "transaction", "goal", "level"].map(cat => {
          const catDefs = ACHIEVEMENTS_DEF.filter(a => a.category === cat);
          const catLabels = { streak: "🔥 Streak", transaction: "📝 Transaksi", goal: "🎯 Goals", level: "⚡ Level" };
          return (
            <div key={cat}>
              <p className="text-xs font-bold text-[#8FA4C8] uppercase tracking-widest mb-2 px-1">{catLabels[cat]}</p>
              <div className="grid grid-cols-2 gap-3">
                {catDefs.map(a => {
                  const isUnlocked = unlocked.includes(a.key);
                  return (
                    <div
                      key={a.key}
                      className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all ${
                        isUnlocked ? "border-[#FF6B35]/30" : "border-transparent opacity-50"
                      }`}
                    >
                      <div className={`text-3xl mb-2 ${!isUnlocked ? "grayscale" : ""}`}>{a.icon}</div>
                      <p className={`text-sm font-bold ${isUnlocked ? "text-[#1A1A1A]" : "text-[#8FA4C8]"}`}>{a.title}</p>
                      <p className="text-xs text-[#8FA4C8] mt-0.5">{a.hint}</p>
                      <p className={`text-xs font-bold mt-2 ${isUnlocked ? "text-[#FF6B35]" : "text-[#CBD5E0]"}`}>
                        +{a.xp} XP
                      </p>
                      {!isUnlocked && (
                        <p className="text-[10px] text-[#CBD5E0] mt-1">🔒 Belum terkunci</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}