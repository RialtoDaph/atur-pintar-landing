import { motion } from "framer-motion";

export const LEVEL_DEFS = [
  { level: 1, name: "Newbie Ngatur",    min: 0,     max: 499 },
  { level: 2, name: "Si Pencatat",      min: 500,   max: 1499 },
  { level: 3, name: "Budgeter Muda",    min: 1500,  max: 2999 },
  { level: 4, name: "Social Saver",     min: 3000,  max: 5999 },
  { level: 5, name: "Financial Aware",  min: 6000,  max: 9999 },
  { level: 6, name: "Investor Pemula",  min: 10000, max: 19999 },
  { level: 7, name: "Atur Pintar Pro",  min: 20000, max: Infinity },
];

export function getLevelDef(xp) {
  for (let i = LEVEL_DEFS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_DEFS[i].min) return LEVEL_DEFS[i];
  }
  return LEVEL_DEFS[0];
}

export default function LevelProgress({ profile }) {
  const xp = profile?.total_points || 0;
  const currentLevel = getLevelDef(xp);
  const nextLevel = LEVEL_DEFS.find(l => l.level === currentLevel.level + 1);
  const pct = nextLevel
    ? Math.min(100, ((xp - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100)
    : 100;
  const remaining = nextLevel ? nextLevel.min - xp : 0;

  return (
    <div className="bg-white rounded-2xl px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs text-[#8FA4C8] font-semibold uppercase tracking-widest">Level Progress</p>
          <p className="text-base font-bold text-[#1A1A1A] mt-0.5">
            ⚡ Level {currentLevel.level} — {currentLevel.name}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#8FA4C8]">Total XP</p>
          <p className="text-lg font-black text-[#FF6B35]">{xp.toLocaleString("id-ID")}</p>
        </div>
      </div>

      <div className="h-2.5 bg-[#F2F4F7] rounded-full overflow-hidden mb-1.5">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #FF6B35, #FFD700)" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <div className="flex justify-between text-xs text-[#8FA4C8]">
        <span>{currentLevel.min.toLocaleString("id-ID")} XP</span>
        {nextLevel ? (
          <span className="font-semibold text-[#FF6B35]">
            {remaining.toLocaleString("id-ID")} XP lagi → Level {nextLevel.level}
          </span>
        ) : (
          <span className="font-semibold text-[#FF6B35]">🏆 Level Maksimum!</span>
        )}
        {nextLevel && <span>{nextLevel.min.toLocaleString("id-ID")} XP</span>}
      </div>
    </div>
  );
}