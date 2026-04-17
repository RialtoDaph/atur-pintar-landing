import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { createPageUrl } from "@/utils";

function getGreeting(name) {
  const h = new Date().getHours();
  const firstName = name ? name.split(" ")[0] : "Kamu";
  if (h >= 6 && h < 11) return `Pagi, ${firstName}! ☀️`;
  if (h >= 11 && h < 15) return `Halo, ${firstName}! 👋`;
  if (h >= 15 && h < 19) return `Sore, ${firstName}! 🌤️`;
  return `Malam, ${firstName}! 🌙`;
}

export default function DashboardHeader({ user, streak, unreadCount, onBellClick }) {
  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <div className="bg-[#0A0A0A] px-5 pt-4 pb-6">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-bold leading-tight">{getGreeting(user?.full_name)}</h1>
          {streak > 0 && (
            <p className="text-[#FF6B35] text-sm font-semibold mt-0.5">🔥 Streak {streak} hari</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onBellClick}
            className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white tap-highlight-fix"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <Link
            to={createPageUrl("ProfileSettings")}
            className="w-9 h-9 rounded-full bg-[#FF6B35] flex items-center justify-center text-white text-xs font-bold tap-highlight-fix overflow-hidden"
          >
            {user?.photo_url
              ? <img src={user.photo_url} alt="avatar" className="w-full h-full object-cover" />
              : initials}
          </Link>
        </div>
      </div>
    </div>
  );
}