import { motion } from "framer-motion";

function getScoreLabel(score) {
  if (score <= 200) return "Mulai Perjalanan 🌱";
  if (score <= 400) return "Berkembang 📈";
  if (score <= 600) return "Lumayan Oke 💪";
  if (score <= 800) return "Hampir Pro 🎯";
  return "Atur Pintar Pro 🏆";
}

export default function FHSCard({ fhs, loading }) {
  const score = fhs?.total_score || 0;
  const pct = Math.min(100, (score / 1000) * 100);
  const label = getScoreLabel(score);

  if (loading) {
    return <div className="rounded-2xl h-32 bg-[#FF6B35]/60 animate-pulse" />;
  }

  return (
    <div>
      <div
        className="rounded-2xl p-5 shadow-lg"
        style={{ background: "linear-gradient(135deg, #FF6B35 0%, #FF9A5C 100%)" }}
      >
        <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-1">
          Financial Health Score
        </p>
        <div className="flex items-end justify-between mb-3">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl font-black text-white leading-none"
          >
            {score}
          </motion.span>
          <span className="text-white/70 text-sm font-semibold">/ 1000</span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-white/30 rounded-full overflow-hidden mb-2">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-white font-bold text-sm">{label}</span>
          {fhs?.week_change !== undefined && (
            <span className="text-white/80 text-xs">
              {fhs.week_change >= 0
                ? `↑ Naik ${fhs.week_change} poin minggu ini`
                : `↓ Turun ${Math.abs(fhs.week_change)} poin minggu ini`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}