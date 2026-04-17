import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const NANA_IMG = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a82e8090f60786b869983c/7708b64f5_generated_image.png";

function formatRupiah(n) {
  return "Rp " + Math.abs(n).toLocaleString("id-ID");
}

function getNanaComment(amount) {
  if (amount === 0) return "Belum ada catatan hari ini. Yuk mulai catat! 📝";
  if (amount < 50000) return `Pengeluaran hari ini ${formatRupiah(amount)}. Hemat banget! 🎉`;
  if (amount < 200000) return `Pengeluaran hari ini ${formatRupiah(amount)}. Masih aman nih! 😊`;
  if (amount < 500000) return `Pengeluaran hari ini ${formatRupiah(amount)}. Mulai hati-hati ya! 👀`;
  return `Pengeluaran hari ini ${formatRupiah(amount)}. Wah lumayan besar, review lagi yuk! 💸`;
}

export default function NanaInsightCard({ transactions = [] }) {
  const today = new Date().toISOString().split("T")[0];
  const todayExpense = transactions
    .filter(t => t.date === today && t.type === "expense" && !t.is_deleted)
    .reduce((s, t) => s + (t.amount || 0), 0);

  const message = getNanaComment(todayExpense);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#F2F4F7] px-4 py-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#F2F4F7] flex-shrink-0 overflow-hidden">
        <img src={NANA_IMG} alt="Nana" className="w-full h-full object-contain" />
      </div>
      <p className="flex-1 text-sm text-[#1A1A1A] leading-snug">{message}</p>
      <Link
        to={createPageUrl("Nana")}
        className="flex-shrink-0 text-xs font-bold text-[#FF6A00] hover:text-[#e05e00] transition-colors whitespace-nowrap"
      >
        Tanya Nana →
      </Link>
    </div>
  );
}