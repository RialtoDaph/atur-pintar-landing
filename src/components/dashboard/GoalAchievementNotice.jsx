import { Sparkles, Target } from "lucide-react";
import { formatRupiah } from "@/components/utils/formatRupiah";

export default function GoalAchievementNotice({ goals, transactions, loading }) {
  if (loading || !goals.length) return null;

  const now = new Date();
  const recentTx = transactions.filter(t => {
    const d = new Date(t.date);
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    return diffDays <= 7; // Last 7 days
  });

  // Check for recently completed goals
  const achievements = goals.filter(goal => {
    if (goal.status !== "completed") return false;
    // Check if updated recently (simple heuristic: current_amount == target_amount and progress made in last 7 days)
    return goal.current_amount >= goal.target_amount;
  }).slice(0, 2); // Show max 2

  if (achievements.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-[#00C9A7]/10 to-[#00C9A7]/5 rounded-2xl p-4 border border-[#00C9A7]/30">
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#00C9A7] flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-bold text-[#0A0A0A] text-sm">Selamat! 🎉</p>
          <p className="text-xs text-[#8FA4C8] mt-0.5">
            Kamu berhasil mencapai {achievements.length === 1 ? "tujuan" : "beberapa tujuan"} tabungan. Terus pertahankan momentum!
          </p>
          <div className="mt-2 space-y-1">
            {achievements.map((goal) => (
              <div key={goal.id} className="flex items-center gap-2 text-xs">
                <Target className="w-3 h-3 text-[#00C9A7]" />
                <span className="text-[#0A0A0A] font-medium">{goal.name}</span>
                <span className="text-[#8FA4C8]">• {formatRupiah(goal.target_amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}