import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Sword } from "lucide-react";

export default function BossBattleCard({ user, gamificationProfile, onProfileUpdate }) {
  const [boss, setBoss] = useState(null);
  const [contribution, setContribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attacking, setAttacking] = useState(false);
  const [damageResult, setDamageResult] = useState(null);
  const [showWinModal, setShowWinModal] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const currentMonth = today.slice(0, 7);

  useEffect(() => {
    if (!user?.email) return;
    loadBoss();
  }, [user?.email]);

  async function loadBoss() {
    setLoading(true);
    const bosses = await base44.entities.BossBattle.filter({ status: "active", month: currentMonth }).catch(() => []);
    const activeBoss = bosses?.[0];
    if (!activeBoss) { setLoading(false); return; }
    setBoss(activeBoss);

    const contribs = await base44.entities.BossBattleContribution.filter({
      created_by: user.email, boss_id: activeBoss.id,
    }).catch(() => []);
    setContribution(contribs?.[0] || null);
    setLoading(false);
  }

  async function handleAttack() {
    if (!boss || attacking) return;
    // Already attacked today?
    if (contribution?.last_attack_date === today) {
      setDamageResult({ msg: "Sudah menyerang hari ini! Kembali besok ⚔️", dmg: 0 });
      return;
    }

    setAttacking(true);

    // Calculate damage from missions
    const missions = await base44.entities.DailyMission.filter({ created_by: user.email, date: today }).catch(() => []);
    const completedMissions = (missions || []).filter(m => m.is_completed).length;
    const streak = gamificationProfile?.daily_streak || 0;
    const streakBonus = Math.min(streak * 50, 500);
    const damage = completedMissions * 100 + streakBonus;

    // Update boss HP
    const newHP = Math.max(0, (boss.current_hp || 0) - damage);
    const isFirstContrib = !contribution;
    const newParticipantCount = isFirstContrib ? (boss.participant_count || 0) + 1 : (boss.participant_count || 0);

    await base44.entities.BossBattle.update(boss.id, {
      current_hp: newHP,
      participant_count: newParticipantCount,
      status: newHP <= 0 ? "won" : "active",
    });

    // Save contribution
    if (contribution) {
      await base44.entities.BossBattleContribution.update(contribution.id, {
        damage_dealt: (contribution.damage_dealt || 0) + damage,
        habits_completed: (contribution.habits_completed || 0) + completedMissions,
        last_attack_date: today,
        total_damage_all_time: (contribution.total_damage_all_time || 0) + damage,
      });
    } else {
      await base44.entities.BossBattleContribution.create({
        boss_id: boss.id,
        month: currentMonth,
        damage_dealt: damage,
        habits_completed: completedMissions,
        last_attack_date: today,
        total_damage_all_time: damage,
      });
    }

    // Add +20 XP
    if (gamificationProfile) {
      const newXP = (gamificationProfile.total_points || 0) + 20;
      await base44.entities.GamificationProfile.update(gamificationProfile.id, { total_points: newXP });
      if (onProfileUpdate) onProfileUpdate({ ...gamificationProfile, total_points: newXP });
    }

    setBoss(prev => ({ ...prev, current_hp: newHP, participant_count: newParticipantCount, status: newHP <= 0 ? "won" : "active" }));
    setContribution(prev => ({
      ...(prev || {}),
      damage_dealt: ((prev?.damage_dealt) || 0) + damage,
      last_attack_date: today,
    }));
    setDamageResult({ msg: `⚔️ Kamu kasih ${damage} damage ke boss!`, dmg: damage, missions: completedMissions, streak });

    if (newHP <= 0) setShowWinModal(true);
    setAttacking(false);
  }

  if (loading) return <div className="bg-white rounded-2xl h-36 animate-pulse shadow-sm" />;
  if (!boss) return null;

  const hpPct = Math.max(0, Math.min(100, (boss.current_hp / boss.max_hp) * 100));
  const alreadyAttackedToday = contribution?.last_attack_date === today;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-4 border-2 border-[#FF6B35]/20">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{boss.icon || "👹"}</span>
          <div className="flex-1">
            <p className="text-[10px] font-black text-[#FF6B35] uppercase tracking-widest">Boss Bulan Ini</p>
            <p className="text-sm font-bold text-[#1A1A1A]">{boss.name}</p>
          </div>
          {boss.status === "won" && <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Kalah!</span>}
          {boss.status === "lost" && <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">Boss Kabur</span>}
        </div>

        {/* HP Bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs text-[#8FA4C8] font-medium">HP Boss</p>
            <p className="text-xs font-bold text-[#1A1A1A]">
              {Math.max(0, boss.current_hp).toLocaleString("id-ID")} / {boss.max_hp.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="h-3 bg-[#F2F4F7] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: hpPct > 50 ? "#EF4444" : hpPct > 20 ? "#F97316" : "#16A34A" }}
              initial={{ width: "100%" }}
              animate={{ width: `${hpPct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-3">
          <p className="text-xs text-[#8FA4C8]">👥 <span className="font-semibold text-[#1A1A1A]">{boss.participant_count || 0}</span> pejuang aktif</p>
          <p className="text-xs text-[#8FA4C8]">🏆 Reward: <span className="font-semibold text-[#FF6B35]">{boss.reward_xp || 200} XP</span></p>
        </div>

        {/* Damage result */}
        <AnimatePresence>
          {damageResult && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-3 bg-[#FFF7ED] border border-[#FF6B35]/20 rounded-xl px-3 py-2"
            >
              <p className="text-xs font-semibold text-[#FF6B35]">{damageResult.msg}</p>
              {damageResult.dmg > 0 && (
                <p className="text-[11px] text-[#8FA4C8] mt-0.5">
                  {damageResult.missions} mission × 100 + streak bonus {Math.min((damageResult.streak || 0) * 50, 500)} = {damageResult.dmg} dmg · +20 XP
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attack button */}
        {boss.status === "active" && (
          <button
            onClick={handleAttack}
            disabled={attacking || alreadyAttackedToday}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
              alreadyAttackedToday
                ? "bg-[#F2F4F7] text-[#8FA4C8] cursor-not-allowed"
                : "bg-[#FF6B35] text-white hover:bg-[#E05E28] active:scale-95 shadow-md shadow-[#FF6B35]/25"
            }`}
          >
            <Sword className="w-4 h-4" />
            {attacking ? "Menyerang..." : alreadyAttackedToday ? "Sudah Serang Hari Ini ✓" : "Serang Boss! ⚔️"}
          </button>
        )}

        {boss.status === "lost" && (
          <p className="text-center text-sm text-[#8FA4C8] italic">😔 Boss lolos bulan ini... Tapi bulan depan kita lebih siap!</p>
        )}
      </div>

      {/* Win Modal */}
      <AnimatePresence>
        {showWinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-xs w-full text-center shadow-2xl"
            >
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-xs font-black text-[#FF6B35] uppercase tracking-widest mb-1">Komunitas Menang!</p>
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">{boss.name} dikalahkan!</h2>
              <p className="text-[#4A5568] text-sm mb-2">+{boss.reward_xp || 200} XP untuk semua peserta!</p>
              <p className="text-[#4A5568] text-sm mb-6">🏆 Badge '{boss.reward_badge || "Penakluk Boss"}' unlocked!</p>
              <button
                onClick={() => setShowWinModal(false)}
                className="w-full py-3.5 rounded-2xl bg-[#FF6B35] text-white font-bold text-sm shadow-lg shadow-[#FF6B35]/30"
              >
                Luar Biasa! 🎊
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}