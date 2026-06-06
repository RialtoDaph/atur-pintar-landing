import { CheckCircle2, Shield, UserX } from "lucide-react";

/**
 * Mobile-only card for a user row in AdminUsers.
 * Desktop continues to use the existing table layout.
 */
export default function UserMobileCard({ u, currentUserEmail, onRoleClick, onToggleDisabled }) {
  const daysSinceActive = Math.floor((new Date() - new Date(u.updated_date || u.created_date)) / (1000 * 60 * 60 * 24));
  const isPremium = u.subscription_plan && u.subscription_plan !== "free" && u.subscription_status === "active";

  return (
    <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-semibold text-[#1A1A1A] truncate">{u.full_name || "—"}</p>
            {u.role === "admin" && (
              <span className="text-[9px] font-bold text-[#F97316] bg-[#F97316]/15 border border-[#F97316]/30 rounded px-1 py-0.5 leading-none uppercase">
                Admin
              </span>
            )}
            {u.is_disabled && (
              <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 rounded px-1 py-0.5 leading-none uppercase">
                Disabled
              </span>
            )}
          </div>
          <p className="text-xs text-[#8FA4C8] truncate mt-0.5">{u.email}</p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-[10px] font-bold flex-shrink-0 ${
            isPremium ? "bg-[#F97316] text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          {u.subscription_plan || "free"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11px] mb-3">
        <div>
          <p className="text-[#8FA4C8]">Status</p>
          <p className="font-semibold text-[#1A1A1A] flex items-center gap-1">
            {u.subscription_status === "active" ? (
              <><CheckCircle2 className="w-3 h-3 text-green-600" /> Aktif</>
            ) : (
              <span className="text-gray-500">—</span>
            )}
          </p>
        </div>
        <div>
          <p className="text-[#8FA4C8]">Joined</p>
          <p className="font-semibold text-[#1A1A1A]">
            {new Date(u.created_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
          </p>
        </div>
        <div>
          <p className="text-[#8FA4C8]">Aktif</p>
          <p className="font-semibold text-[#1A1A1A]">{daysSinceActive}d lalu</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className={`text-[11px] font-semibold ${u.onboarding_completed ? "text-green-600" : "text-amber-600"}`}>
          {u.onboarding_completed ? "✓ Onboarding" : "⚠ Belum onboarding"}
        </span>
        {u.email !== currentUserEmail && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onRoleClick(u)}
              title={u.role === "admin" ? "Turunkan ke user" : "Jadikan admin"}
              className={`p-2 rounded-lg transition-colors ${
                u.role === "admin"
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Shield className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleDisabled(u)}
              title={u.is_disabled ? "Aktifkan akun" : "Nonaktifkan akun"}
              className={`p-2 rounded-lg transition-colors ${
                u.is_disabled
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-red-100 text-red-600 hover:bg-red-200"
              }`}
            >
              <UserX className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}