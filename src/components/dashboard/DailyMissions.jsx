import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_MISSIONS = [
  { mission_key: "catat_transaksi", title: "Catat 1 pengeluaran", icon: "📝", xp_reward: 10 },
  { mission_key: "cek_budget",      title: "Cek budget minggu ini", icon: "📊", xp_reward: 15 },
  { mission_key: "tanya_nana",      title: "Tanya Nana 1 pertanyaan", icon: "✨", xp_reward: 20 },
];

const LEVELS = [
  { level: 1, name: "Newbie Ngatur",    min: 0 },
  { level: 2, name: "Si Pencatat",      min: 500 },
  { level: 3, name: "Budgeter Muda",    min: 1500 },
  { level: 4, name: "Social Saver",     min: 3000 },
  { level: 5, name: "Financial Aware",  min: 6000 },
  { level: 6, name: "Investor Pemula",  min: 10000 },
  { level: 7, name: "Atur Pintar Pro",  min: 20000 },
];

function getLevelFromXP(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

export default function DailyMissions({ user, onXPGained }) {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [levelUpModal, setLevelUpModal] = useState(null);
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (!user?.email) return;
    loadMissions();
  }, [user?.email]);

  async function loadMissions() {
    setLoading(true);
    try {
      const existing = await base44.entities.DailyMission.filter({ created_by: user.email, date: today });
      if (existing.length >= 3) {
        setMissions(existing);
      } else {
        // Auto-generate default missions
        const created = await Promise.all(
          DEFAULT_MISSIONS.map(m =>
            base44.entities.DailyMission.create({ ...m, date: today, is_completed: false })
          )
        );
        setMissions(created);
      }
    } catch (e) {
      setMissions([]);
    }
    setLoading(false);
  }

  async function completeMission(mission) {
    if (mission.is_completed) return;

    // Optimistic update
    setMissions(prev => prev.map(m => m.id === mission.id ? { ...m, is_completed: true } : m));

    try {
      await base44.entities.DailyMission.update(mission.id, { is_completed: true });

      // Update GamificationProfile XP
      const profiles = await base44.entities.GamificationProfile.filter({ created_by: user.email });
      if (profiles.length === 0) return;
      const p = profiles[0];
      const oldXP = p.total_points || 0;
      const newXP = oldXP + (mission.xp_reward || 10);

      const oldLevel = getLevelFromXP(oldXP);
      const newLevel = getLevelFromXP(newXP);

      // Streak logic
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");
      const last = p.last_activity_date;
      let streakUpdates = {};
      if (last === todayStr) {
        streakUpdates = {};
      } else if (last === yesterday) {
        const newStreak = (p.daily_streak || 0) + 1;
        streakUpdates = {
          daily_streak: newStreak,
          longest_streak: Math.max(p.longest_streak || 0, newStreak),
          last_activity_date: todayStr,
        };
      } else {
        streakUpdates = {
          daily_streak: 1,
          last_activity_date: todayStr,
        };
      }

      await base44.entities.GamificationProfile.update(p.id, {
        total_points: newXP,
        level: newLevel.level,
        ...streakUpdates,
      });

      if (onXPGained) onXPGained(mission.xp_reward);

      if (newLevel.level > oldLevel.level) {
        setLevelUpModal(newLevel);
      }
    } catch (e) {
      // revert
      setMissions(prev => prev.map(m => m.id === mission.id ? { ...m, is_completed: false } : m));
    }
  }

  const completed = missions.filter(m => m.is_completed).length;
  const allDone = missions.length > 0 && completed === missions.length;

  if (loading) return <div className="bg-white rounded-2xl h-24 animate-pulse shadow-sm" />;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-[#F2F4F7] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#F2F4F7] flex items-center justify-between">
          <p className="text-sm font-bold text-[#1A1A1A]">Mission Hari Ini 🎯</p>
          <span className="text-xs text-[#8FA4C8] font-medium">{completed}/{missions.length} selesai</span>
        </div>

        <div className="divide-y divide-[#F2F4F7]">
          {missions.map(mission => (
            <div key={mission.id} className="px-4 py-3 flex items-center gap-3">
              <span className="text-xl flex-shrink-0">{mission.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-snug ${mission.is_completed ? "line-through text-[#8FA4C8]" : "text-[#1A1A1A]"}`}>
                  {mission.title}
                </p>
                <p className="text-xs text-[#FF6A00] font-bold mt-0.5">+{mission.xp_reward} XP</p>
              </div>
              <button
                onClick={() => completeMission(mission)}
                disabled={mission.is_completed}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  mission.is_completed
                    ? "bg-[#FF6A00] border-[#FF6A00]"
                    : "border-[#E2E8F0] hover:border-[#FF6A00]"
                }`}
              >
                {mission.is_completed && <span className="text-white text-xs">✓</span>}
              </button>
            </div>
          ))}
        </div>

        {allDone && (
          <div className="px-4 py-3 bg-[#FF6A00]/5 border-t border-[#FF6A00]/20 text-center">
            <p className="text-sm font-bold text-[#FF6A00]">Semua mission selesai! 🎉 +45 XP</p>
          </div>
        )}
      </div>

      {/* Level Up Modal */}
      <AnimatePresence>
        {levelUpModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setLevelUpModal(null)}
          >
            <motion.div
              initial={{ scale: 0.4, y: 60 }} animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 12 }}
              className="bg-white rounded-3xl px-8 py-8 flex flex-col items-center gap-4 shadow-2xl mx-6 max-w-xs w-full"
              onClick={e => e.stopPropagation()}
            >
              <motion.div animate={{ rotate: [0, -15, 15, -10, 10, 0] }} transition={{ duration: 0.8 }} className="text-6xl">⬆️</motion.div>
              <div className="text-center">
                <p className="text-xs font-bold text-[#FF6A00] uppercase tracking-widest mb-1">LEVEL UP!</p>
                <h2 className="text-xl font-black text-[#1A1A1A]">Level {levelUpModal.level} 🎉</h2>
                <p className="text-sm font-semibold text-[#FF6A00] mt-1">{levelUpModal.name}</p>
              </div>
              <button
                onClick={() => setLevelUpModal(null)}
                className="w-full py-3 rounded-2xl bg-[#FF6A00] text-white font-bold text-sm hover:bg-[#e05e00] transition-colors"
              >
                Keren! →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}