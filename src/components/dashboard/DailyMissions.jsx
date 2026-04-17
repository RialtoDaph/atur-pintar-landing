import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import confetti from "canvas-confetti";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const DEFAULT_MISSIONS = [
  { mission_key: "catat_transaksi", title: "Catat 1 pengeluaran", icon: "📝", xp_reward: 10 },
  { mission_key: "cek_budget", title: "Cek budget minggu ini", icon: "📊", xp_reward: 15 },
  { mission_key: "tanya_nana", title: "Tanya Nana 1 pertanyaan", icon: "✨", xp_reward: 20 },
];

const MISSION_LINK = {
  catat_transaksi: null, // handled by FAB
  cek_budget: "/Budget",
  tanya_nana: "/Nana",
};

export default function DailyMissions({ user, onXpGained }) {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);
  const [allDone, setAllDone] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (!user?.email) return;
    loadMissions();
  }, [user?.email]);

  async function loadMissions() {
    setLoading(true);
    const existing = await base44.entities.DailyMission.filter({ created_by: user.email, date: today });
    if (existing.length > 0) {
      setMissions(existing);
      setAllDone(existing.every(m => m.is_completed));
    } else {
      // Create default missions for today
      const created = await Promise.all(
        DEFAULT_MISSIONS.map(m =>
          base44.entities.DailyMission.create({ ...m, date: today, is_completed: false })
        )
      );
      setMissions(created);
      setAllDone(false);
    }
    setLoading(false);
  }

  async function completeMission(mission) {
    if (mission.is_completed || completing === mission.id) return;
    setCompleting(mission.id);

    const updated = await base44.entities.DailyMission.update(mission.id, {
      is_completed: true,
      completed_at: new Date().toISOString(),
    });

    const newMissions = missions.map(m => m.id === mission.id ? { ...m, is_completed: true } : m);
    setMissions(newMissions);
    setCompleting(null);

    // Award XP
    if (onXpGained) await onXpGained(mission.xp_reward);

    // Check if all done
    if (newMissions.every(m => m.is_completed)) {
      setAllDone(true);
      confetti({ particleCount: 60, spread: 80, origin: { y: 0.5 }, colors: ["#FF6B35", "#FFD700", "#22C55E"] });
    }
  }

  const completedCount = missions.filter(m => m.is_completed).length;
  const totalXP = missions.reduce((s, m) => s + (m.xp_reward || 0), 0);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="h-4 bg-[#F2F4F7] rounded animate-pulse mb-3 w-1/3" />
        {[1,2,3].map(i => <div key={i} className="h-12 bg-[#F2F4F7] rounded-xl animate-pulse mb-2" />)}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-[#1A1A1A]">Mission Hari Ini 🎯</h3>
          <span className="text-xs text-[#8FA4C8] font-semibold">{completedCount}/{missions.length}</span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-[#F2F4F7] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#FF6B35] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${missions.length > 0 ? (completedCount / missions.length) * 100 : 0}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* All done banner */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mx-4 mb-2 bg-[#F0FDF4] border border-[#22C55E]/30 rounded-xl px-3 py-2 text-center"
          >
            <p className="text-sm font-bold text-[#16A34A]">Semua mission hari ini selesai! 🎉 +{totalXP} XP</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mission list */}
      <div className="px-4 pb-4 space-y-2">
        {missions.map(mission => {
          const link = MISSION_LINK[mission.mission_key];
          const done = mission.is_completed;
          const isCompleting = completing === mission.id;

          const row = (
            <motion.div
              key={mission.id}
              layout
              className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-all ${
                done ? "bg-[#F0FDF4] border-[#22C55E]/20" : "bg-[#F8FAFC] border-[#E2E8F0]"
              }`}
            >
              <span className="text-xl w-7 flex-shrink-0 text-center">{mission.icon}</span>
              <span className={`flex-1 text-sm font-medium leading-snug ${done ? "line-through text-[#8FA4C8]" : "text-[#1A1A1A]"}`}>
                {mission.title}
              </span>
              <span className={`text-xs font-bold ${done ? "text-[#22C55E]" : "text-[#FF6B35]"}`}>
                +{mission.xp_reward} XP
              </span>
              <button
                onClick={() => completeMission(mission)}
                disabled={done || isCompleting}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all tap-highlight-fix ${
                  done
                    ? "bg-[#22C55E] border-[#22C55E]"
                    : "border-[#CBD5E0] hover:border-[#FF6B35]"
                }`}
              >
                {done && <span className="text-white text-xs">✓</span>}
                {isCompleting && <span className="w-3 h-3 border border-[#FF6B35] rounded-full animate-spin border-t-transparent" />}
              </button>
            </motion.div>
          );

          // Wrap non-done missions with their page link (as hint)
          if (!done && link) {
            return (
              <div key={mission.id} className="relative">
                {row}
                <Link
                  to={link}
                  className="absolute inset-0 rounded-xl opacity-0"
                  aria-label={`Buka ${mission.title}`}
                />
              </div>
            );
          }
          return <div key={mission.id}>{row}</div>;
        })}
      </div>
    </div>
  );
}