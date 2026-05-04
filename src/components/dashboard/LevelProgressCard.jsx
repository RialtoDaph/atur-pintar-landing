import { motion } from "framer-motion";

const LEVEL_THRESHOLDS = [
  { level: 1, name: "Newbie Ngatur", min: 0, max: 499 },
  { level: 2, name: "Si Pencatat", min: 500, max: 1499 },
  { level: 3, name: "Budgeter Muda", min: 1500, max: 2999 },
  { level: 4, name: "Social Saver", min: 3000, max: 5999 },
  { level: 5, name: "Financial Aware", min: 6000, max: 9999 },
  { level: 6, name: "Investor Pemula", min: 10000, max: 19999 },
  { level: 7, name: "Atur Pintar Pro", min: 20000, max: Infinity },
];

function getLevelInfo(xp) {
  const current = LEVEL_THRESHOLDS.find(l => xp >= l.min && xp <= l.max) || LEVEL_THRESHOLDS[0];
  const next = LEVEL_THRESHOLDS.find(l => l.level === current.level + 1);
  return { current, next };
}

export default function LevelProgressCard({ gamificationProfile }) {
  const xp = gamificationProfile?.total_points || 0;
  const { current: lvl, next: nextLvl } = getLevelInfo(xp);
  const xpInLevel = xp - lvl.min;
  const xpNeeded = nextLvl ? nextLvl.min - lvl.min : 1;
  const pct = nextLvl ? Math.min((xpInLevel / xpNeeded) * 100, 100) : 100;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-[#1A1A1A]">⚡ Level {lvl.level} — {lvl.name}</p>
        <span className="text-xs font-bold text-[#FF6B35]">{xp.toLocaleString("id-ID")} XP</span>
      </div>
      <div className="h-2.5 bg-[#F2F4F7] rounded-full overflow-hidden mb-1.5">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #FF6B35, #FFD700)" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      {nextLvl ? (
        <p className="text-xs text-[#8FA4C8]">
          {(nextLvl.min - xp).toLocaleString("id-ID")} XP lagi untuk Level {nextLvl.level} — {nextLvl.name}
        </p>
      ) : (
        <p className="text-xs text-[#FF6B35] font-semibold">Level Maksimal tercapai! 🏆</p>
      )}
    </div>
  );
}