import { useMemo } from "react";
import { Flame } from "lucide-react";

function getGreeting(name) {
  const hour = new Date().getHours();
  const firstName = name ? name.split(" ")[0] : "Kamu";
  if (hour >= 6 && hour < 11) return `Pagi, ${firstName}! ☀️`;
  if (hour >= 11 && hour < 15) return `Halo, ${firstName}! 👋`;
  if (hour >= 15 && hour < 19) return `Sore, ${firstName}! 🌤️`;
  return `Malam, ${firstName}! 🌙`;
}

export default function DashboardGreeting({ user, streak = 0 }) {
  const greeting = useMemo(() => getGreeting(user?.full_name), [user?.full_name]);

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[#8FA4C8] text-xs font-medium">Selamat datang kembali</p>
        <h1 className="text-white text-xl font-bold mt-0.5">{greeting}</h1>
      </div>
      <div className="flex items-center gap-1.5 bg-[#FF6A00]/20 border border-[#FF6A00]/30 px-3 py-1.5 rounded-full">
        <Flame className="w-3.5 h-3.5 text-[#FF6A00]" />
        <span className="text-[#FF6A00] text-xs font-bold">Streak {streak} hari</span>
      </div>
    </div>
  );
}