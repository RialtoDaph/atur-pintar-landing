import { base44 } from "@/api/base44Client";
import { TrendingUp, AlertTriangle, CheckCircle, Zap, Info, Bell, X, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const ALERT_CONFIG = {
  spending_spike:      { icon: TrendingUp,    color: "text-red-500",    bg: "bg-red-50",    label: "Spending" },
  bill_upcoming:       { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-50", label: "Tagihan" },
  goal_near:           { icon: CheckCircle,   color: "text-green-500",  bg: "bg-green-50",  label: "Tujuan" },
  savings_opportunity: { icon: Zap,           color: "text-blue-500",   bg: "bg-blue-50",   label: "Peluang" },
  unusual_pattern:     { icon: Info,          color: "text-yellow-600", bg: "bg-yellow-50", label: "Pola" },
  budget_exceeded:     { icon: AlertTriangle, color: "text-red-600",    bg: "bg-red-50",    label: "Budget" },
};

export default function AlertsDrawerAlertsTab({ adminNotifs, alerts, onReload, onAlertClick, currentUserEmail }) {
  const visibleAlerts = alerts.filter(a => a.status !== "dismissed");

  async function dismissAdminNotif(n) {
    // Per-user dismiss: append email to read_by. For broadcast (target_type === 'all')
    // we never touch is_read — that would leak read-status to other users.
    if (!currentUserEmail) return;
    const readBy = n.read_by || [];
    if (readBy.includes(currentUserEmail)) { onReload(); return; }
    const update = n.target_type === "specific"
      ? { read_by: [...readBy, currentUserEmail], is_read: true }
      : { read_by: [...readBy, currentUserEmail] };
    await base44.entities.AdminNotification.update(n.id, update).catch(() => {});
    onReload();
  }

  async function dismissAlert(id) {
    await base44.entities.Alert.update(id, { status: "dismissed" });
    onReload();
  }

  async function markRead(a) {
    if (a.status !== "unread") return;
    await base44.entities.Alert.update(a.id, { status: "read" });
    onReload();
  }

  async function dismissAll() {
    await Promise.all(visibleAlerts.map(a => base44.entities.Alert.update(a.id, { status: "dismissed" }).catch(() => {})));
    onReload();
  }

  async function markAllRead() {
    await Promise.all(visibleAlerts.filter(a => a.status === "unread").map(a => base44.entities.Alert.update(a.id, { status: "read" }).catch(() => {})));
    onReload();
  }

  const hasUnread = visibleAlerts.some(a => a.status === "unread");

  return (
    <div className="space-y-3">
      {/* Admin Notifications */}
      {adminNotifs.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-[#8FA4C8] uppercase tracking-widest px-1">Dari Admin ({adminNotifs.length})</p>
          {adminNotifs.map(n => (
            <div key={n.id} className="bg-white rounded-2xl p-3 shadow-sm ring-2 ring-[#F97316]/20">
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-[#F97316]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-[#1A1A1A] text-sm">{n.title}</p>
                    <button
                      onClick={() => dismissAdminNotif(n)}
                      className="p-1 rounded-lg hover:bg-[#F2F4F7] text-[#8FA4C8] flex-shrink-0"
                      aria-label="Tutup notifikasi"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[#4A5568] text-xs mt-0.5 leading-relaxed">{n.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action bar */}
      {visibleAlerts.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-bold text-[#8FA4C8] uppercase tracking-widest">Notifikasi ({visibleAlerts.length})</p>
          <div className="flex gap-1">
            {hasUnread && (
              <button onClick={markAllRead} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#F2F4F7] text-[#4A5568] hover:bg-[#E2E8F0] text-[10px] font-semibold transition-colors">
                <CheckCheck className="w-3 h-3" /> Baca Semua
              </button>
            )}
            <button onClick={dismissAll} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#F2F4F7] text-[#FF6B6B] hover:bg-[#FFE5E5] text-[10px] font-semibold transition-colors">
              Hapus Semua
            </button>
          </div>
        </div>
      )}

      {/* Empty */}
      {visibleAlerts.length === 0 && adminNotifs.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-[#1A1A1A] font-semibold text-sm">Semua bersih!</p>
          <p className="text-[#8FA4C8] text-xs mt-1">Tidak ada notifikasi aktif</p>
        </div>
      )}

      {/* Alert cards */}
      {visibleAlerts.length > 0 && (
        <div className="space-y-2">
          {visibleAlerts.map(alert => {
            const cfg = ALERT_CONFIG[alert.type] || ALERT_CONFIG.unusual_pattern;
            const Icon = cfg.icon;
            const unread = alert.status === "unread";
            return (
              <div
                key={alert.id}
                onClick={() => { markRead(alert); onAlertClick(alert); }}
                className={`bg-white rounded-2xl p-3 shadow-sm border ${
                  unread ? "border-[#F97316]/30 ring-1 ring-[#F97316]/10" : "border-transparent"
                } ${alert.action_url ? "cursor-pointer hover:bg-[#F8FAFC] transition-colors" : ""}`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${unread ? "text-[#1A1A1A]" : "text-[#4A5568]"}`}>
                        {alert.title}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); dismissAlert(alert.id); }}
                        className="p-1 rounded-lg hover:bg-[#F2F4F7] text-[#8FA4C8] flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-[#8FA4C8] mt-0.5 leading-relaxed">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {alert.severity && (
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                          alert.severity === "high" ? "bg-red-100 text-red-700" :
                          alert.severity === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {alert.severity === "high" ? "Penting" : alert.severity === "medium" ? "Sedang" : "Info"}
                        </span>
                      )}
                      {alert.created_date && (
                        <p className="text-[10px] text-[#8FA4C8]">
                          {format(new Date(alert.created_date), "dd MMM · HH:mm", { locale: id })}
                        </p>
                      )}
                    </div>
                  </div>
                  {unread && <span className="w-2 h-2 rounded-full bg-[#F97316] flex-shrink-0 mt-1.5" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}