import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight } from "lucide-react";

function formatRp(n) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1).replace(".", ",")} jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}.000`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export default function NanaDailyInsight({ todayExpense }) {
  const hasSpent = todayExpense > 0;

  const insight = hasSpent
    ? `Pengeluaran hari ini: ${formatRp(todayExpense)}. ${
        todayExpense > 200_000
          ? "Lumayan banyak — yuk cek apakah sesuai rencana 👀"
          : "Masih aman nih. Keep it up! 💪"
      }`
    : "Belum ada catatan hari ini. Yuk mulai catat! 📝";

  return (
    <div className="bg-white rounded-2xl border border-[#FF6B35]/20 px-4 py-3 flex items-center gap-3 shadow-sm">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FF9A5C] flex items-center justify-center flex-shrink-0 text-lg shadow">
        ✨
      </div>
      <p className="flex-1 text-sm text-[#1A1A1A] leading-snug">{insight}</p>
      <Link
        to={createPageUrl("Nana")}
        className="flex items-center gap-1 text-xs font-bold text-[#FF6B35] whitespace-nowrap tap-highlight-fix flex-shrink-0"
      >
        Tanya Nana <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}