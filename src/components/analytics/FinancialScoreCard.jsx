import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
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

export default function FinancialScoreCard({ user }) {
  const [gamification, setGamification] = useState(null);
  const [healthScore, setHealthScore] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.GamificationProfile.filter({ created_by: user.email })
      .then(data => { if (data?.[0]) setGamification(data[0]); })
      .catch(() => {});

    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    base44.entities.FinancialHealthScore.filter({ created_by: user.email, month: monthStr })
      .then(data => { if (data?.[0]) setHealthScore(data[0]); })
      .catch(() => {});
  }, [user?.email]);

  const xp = gamification?.total_points || 0;
  const { current: lvl, next: nextLvl } = getLevelInfo(xp);
  const xpInLevel = xp - lvl.min;
  const xpNeeded = nextLvl ? nextLvl.min - lvl.min : 1;
  const pct = nextLvl ? Math.min((xpInLevel / xpNeeded) * 100, 100) : 100;

  const score = healthScore?.total_score;
  const scoreLabel = score == null ? "Belum dihitung"
    : score >= 700 ? "Sangat Baik 🌟"
    : score >= 400 ? "Cukup Baik 👍"
    : "Perlu Ditingkatkan 💪";
  const scoreColor = score == null ? "#8FA4C8"
    : score >= 700 ? "#00C9A7"
    : score >= 400 ? "#F5A623"
    : "#FF6B6B";

  return (
    <Link to={createPageUrl("Gamifikasi")} className="block">
      <div className="bg-white rounded-2xl shadow-sm p-4">
        {/* Level row — styled like the image */}
        <div className="flex items-center gap-4 mb-3">
          {/* Level badge */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md"
            style={{ background: "linear-gradient(135deg, #FF6B35 0%, #FFD700 100%)" }}
          >
            <span className="text-white font-black text-xl">{lvl.level}</span>
          </div>

          {/* Level info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#8FA4C8] font-medium">Level saat ini</p>
            <p className="text-base font-bold text-[#1A1A1A] leading-tight">{lvl.name}</p>
            <p className="text-sm font-bold mt-0.5" style={{ color: "#FF6B35" }}>
              {xp.toLocaleString("id-ID")} XP
            </p>
          </div>

          {/* Financial Score pill */}
          {score != null && (
            <div className="flex-shrink-0 text-right">
              <p className="text-[10px] text-[#8FA4C8] font-medium">Skor</p>
              <p className="text-lg font-black" style={{ color: scoreColor }}>{score}</p>
              <p className="text-[9px] font-semibold" style={{ color: scoreColor }}>{scoreLabel}</p>
            </div>
          )}
        </div>

        {/* XP Progress bar */}
        <div className="h-2 bg-[#F2F4F7] rounded-full overflow-hidden mb-1.5">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #FF6B35, #FFD700)" }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </div>

        {/* Next level hint */}
        <p className="text-[11px] text-[#8FA4C8]">
          {nextLvl
            ? `${(nextLvl.min - xp).toLocaleString("id-ID")} XP lagi → Level ${nextLvl.level}: ${nextLvl.name}`
            : "Level Maksimal! 🏆"}
        </p>
      </div>
    </Link>
  );
}