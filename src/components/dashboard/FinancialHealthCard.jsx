import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

function getScoreLabel(score) {
  if (score <= 200) return "Mulai Perjalanan 🌱";
  if (score <= 400) return "Berkembang 📈";
  if (score <= 600) return "Lumayan Oke 💪";
  if (score <= 800) return "Hampir Pro 🎯";
  return "Atur Pintar Pro 🏆";
}

export default function FinancialHealthCard({ user }) {
  const [score, setScore] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    const thisMonth = new Date().toISOString().slice(0, 7);
    base44.entities.FinancialHealthScore.filter({ created_by: user.email, month: thisMonth })
      .then(data => {
        if (data && data.length > 0) setScore(data[0].total_score);
        else setScore(0);
      })
      .catch(() => setScore(0));
  }, [user?.email]);

  const displayScore = score ?? 0;
  const progress = Math.min(100, (displayScore / 1000) * 100);

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: "linear-gradient(135deg, #FF6B35 0%, #FF8C5A 100%)" }}>
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/80 text-xs font-semibold uppercase tracking-widest">Financial Health Score</p>
          <span className="text-white/60 text-xs">Bulan ini</span>
        </div>
        <div className="flex items-end gap-3 mb-3">
          <p className="text-white text-5xl font-black leading-none">{displayScore}</p>
          <div className="mb-1">
            <p className="text-white text-sm font-semibold">{getScoreLabel(displayScore)}</p>
            <p className="text-white/60 text-xs">dari 1000</p>
          </div>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}