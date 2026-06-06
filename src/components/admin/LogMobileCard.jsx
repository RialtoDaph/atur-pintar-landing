import { LogIn, Activity, AlertCircle, ShieldAlert, ScrollText } from "lucide-react";

const LOG_TYPE_CONFIG = {
  login: { label: "Login", icon: LogIn, color: "blue" },
  activity: { label: "Activity", icon: Activity, color: "green" },
  error: { label: "Error", icon: AlertCircle, color: "red" },
  sensitive_access: { label: "Akses Sensitif", icon: ShieldAlert, color: "orange" },
};

const TYPE_BG = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  orange: "bg-orange-50 text-orange-600",
  red: "bg-red-50 text-red-500",
  gray: "bg-gray-50 text-gray-500",
};

const SEVERITY_COLORS = {
  info: "bg-blue-50 text-blue-600",
  warning: "bg-amber-50 text-amber-600",
  error: "bg-red-50 text-red-500",
};

const formatDate = (d) => d ? new Date(d).toLocaleString("id-ID", {
  day: "2-digit", month: "short",
  hour: "2-digit", minute: "2-digit"
}) : "-";

/**
 * Mobile card representing a single SystemLog entry.
 */
export default function LogMobileCard({ log }) {
  const typeConf = LOG_TYPE_CONFIG[log.log_type] || { label: log.log_type, icon: ScrollText, color: "gray" };
  const Icon = typeConf.icon;

  return (
    <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${TYPE_BG[typeConf.color]}`}>
          <Icon className="w-3 h-3" />
          {typeConf.label}
        </span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${SEVERITY_COLORS[log.severity] || "bg-gray-50 text-gray-500"}`}>
          {log.severity}
        </span>
      </div>

      <p className="text-sm font-semibold text-[#1A1A1A] mb-1">{log.action}</p>
      {log.details && (
        <p className="text-xs text-[#8FA4C8] mb-2 line-clamp-2 break-words">{log.details}</p>
      )}

      <div className="flex items-center justify-between text-[11px] text-[#8FA4C8] gap-2">
        <span className="truncate flex-1">{log.user_email || "—"}</span>
        <span className="flex-shrink-0">{formatDate(log.created_date)}</span>
      </div>

      {log.target_email && (
        <p className="text-[11px] mt-1">
          <span className="text-[#8FA4C8]">Target: </span>
          <span className={`font-medium ${log.target_email === "ALL_USERS" ? "text-red-500" : "text-orange-500"}`}>
            {log.target_email}
          </span>
        </p>
      )}
    </div>
  );
}