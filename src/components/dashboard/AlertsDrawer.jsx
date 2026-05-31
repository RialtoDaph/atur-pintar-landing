import { useState, useEffect } from "react";
import { X, Bell, Calendar, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import DashboardInsights from "@/components/dashboard/DashboardInsights";
import SmartAlertsPanel from "@/components/dashboard/SmartAlertsPanel";
import AnomalyDetector from "@/components/analytics/AnomalyDetector";
import AlertsDrawerRemindersTab from "@/components/dashboard/AlertsDrawerRemindersTab";
import AlertsDrawerAlertsTab from "@/components/dashboard/AlertsDrawerAlertsTab";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";

export default function AlertsDrawer({ onClose, user }) {
  useLockBodyScroll();
  const [tab, setTab] = useState("alerts");
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [adminNotifs, setAdminNotifs] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function loadData() {
    if (!user?.email) return;
    const [tx, gl, al, notifs, rems] = await Promise.all([
      base44.entities.Transaction.filter({ created_by: user.email }, "-date", 100),
      base44.entities.SavingsGoal.filter({ created_by: user.email }, "-created_date"),
      base44.entities.Alert.filter({ created_by: user.email }, "-created_date", 50),
      base44.entities.AdminNotification.list(),
      base44.entities.Reminder.filter({ created_by: user.email }, "-created_date"),
    ]);
    setTransactions(tx);
    setGoals(gl);
    setAlerts(al || []);
    const myNotifs = (notifs || []).filter(n =>
      (n.target_type === "all" || n.target_email === user.email) && !n.read_by?.includes(user.email)
    );
    setAdminNotifs(myNotifs);
    setReminders((rems || []).filter(r => !r.type || r.type === "tagihan" || r.type === "lainnya"));
    setLoading(false);

    // Mark admin notifs as read
    myNotifs.forEach(n => {
      base44.entities.AdminNotification.update(n.id, { read_by: [...(n.read_by || []), user.email] }).catch(() => {});
    });
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  function handleAlertClick(alert) {
    if (alert.action_url) {
      onClose();
      navigate(alert.action_url);
    }
  }

  const unreadCount = alerts.filter(a => a.status === "unread" && a.status !== "dismissed").length + adminNotifs.length;
  const upcomingCount = (() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return reminders.filter(r => {
      if (!r.is_active || r.last_dismissed_month === currentMonth) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const clampedDay = Math.min(r.due_day, maxDay);
      let target = new Date(today.getFullYear(), today.getMonth(), clampedDay);
      if (target <= today) target = new Date(today.getFullYear(), today.getMonth() + 1, clampedDay);
      const days = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
      return days <= 7;
    }).length;
  })();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Drawer */}
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-sm h-full bg-[#F2F4F7] overflow-y-auto overscroll-contain flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-3 bg-[#0A0A0A] sticky top-0 z-10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[#8FA4C8] text-xs">Pusat Notifikasi</p>
                <p className="text-white font-bold text-base mt-0.5">Pengingat & Notifikasi</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors tap-highlight-fix">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-white/10 rounded-xl p-1">
              <button
                onClick={() => setTab("alerts")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 relative ${
                  tab === "alerts" ? "bg-[#FF6A00] text-white shadow-sm" : "text-[#8FA4C8]"
                }`}
              >
                <Bell className="w-3.5 h-3.5" /> Notif
                {unreadCount > 0 && tab !== "alerts" && (
                  <span className="absolute top-0.5 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setTab("reminders")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 relative ${
                  tab === "reminders" ? "bg-[#FF6A00] text-white shadow-sm" : "text-[#8FA4C8]"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" /> Pengingat
                {upcomingCount > 0 && tab !== "reminders" && (
                  <span className="absolute top-0.5 right-1 w-4 h-4 bg-[#FF6A00] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {upcomingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setTab("insights")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  tab === "insights" ? "bg-[#FF6A00] text-white shadow-sm" : "text-[#8FA4C8]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Insights
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse shadow-sm" />)}
              </div>
            ) : tab === "alerts" ? (
              <AlertsDrawerAlertsTab
                adminNotifs={adminNotifs}
                alerts={alerts}
                onReload={loadData}
                onAlertClick={handleAlertClick}
                currentUserEmail={user?.email}
              />
            ) : tab === "reminders" ? (
              <AlertsDrawerRemindersTab
                user={user}
                reminders={reminders}
                onReload={loadData}
              />
            ) : (
              <div className="space-y-3">
                <SmartAlertsPanel user={user} />
                <AnomalyDetector transactions={transactions} />
                <DashboardInsights transactions={transactions} goals={goals} />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}