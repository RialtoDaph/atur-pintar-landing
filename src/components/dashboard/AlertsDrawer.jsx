import { useState, useEffect } from "react";
import { X, TrendingUp, AlertTriangle, CheckCircle, Zap, Info, Bell } from "lucide-react";
import { base44 } from "@/api/base44Client";
import DashboardInsights from "@/components/dashboard/DashboardInsights";
import SmartAlertsPanel from "@/components/dashboard/SmartAlertsPanel";
import AnomalyDetector from "@/components/analytics/AnomalyDetector";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const ALERT_CONFIG = {
  spending_spike:      { icon: TrendingUp,    color: "text-red-500",    bg: "bg-red-50",    label: "Spending Spike" },
  bill_upcoming:       { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-50", label: "Tagihan" },
  goal_near:           { icon: CheckCircle,   color: "text-green-500", bg: "bg-green-50",  label: "Tujuan" },
  savings_opportunity: { icon: Zap,           color: "text-blue-500",  bg: "bg-blue-50",  label: "Peluang" },
  unusual_pattern:     { icon: Info,          color: "text-yellow-600",bg: "bg-yellow-50",label: "Pola Aneh" },
  budget_exceeded:     { icon: AlertTriangle, color: "text-red-600",   bg: "bg-red-50",   label: "Budget" },
};

export default function AlertsDrawer({ onClose, user }) {
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [alertRecords, setAlertRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    Promise.all([
      base44.entities.Transaction.filter({ created_by: user.email }, "-date", 100),
      base44.entities.SavingsGoal.filter({ created_by: user.email }, "-created_date"),
      base44.entities.Alert.filter({ created_by: user.email, status: "unread" }, "-created_date"),
    ]).then(([tx, gl, alerts]) => {
      setTransactions(tx);
      setGoals(gl);
      setAlertRecords(alerts);
      setLoading(false);
      // Mark all unread alerts as read
      alerts.forEach(a => base44.entities.Alert.update(a.id, { status: "read" }));
    });
  }, [user?.email]);

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
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-sm h-full bg-[#F2F4F7] overflow-y-auto flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-[#0A0A0A] sticky top-0 z-10">
            <div>
              <p className="text-white font-bold text-sm">Insights & Alerts</p>
              <p className="text-[#8FA4C8] text-xs mt-0.5">Ringkasan keuangan kamu</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors tap-highlight-fix"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl h-20 animate-pulse shadow-sm" />
                ))}
              </div>
            ) : (
              <>
                {/* Alert entity records — unread notifications */}
                {alertRecords.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest px-1">Notifikasi Baru ({alertRecords.length})</p>
                    {alertRecords.map(alert => {
                      const cfg = ALERT_CONFIG[alert.type] || ALERT_CONFIG.unusual_pattern;
                      const Icon = cfg.icon;
                      return (
                        <div key={alert.id} className="bg-white rounded-2xl p-3 shadow-sm ring-2 ring-[#FF6A00]/20">
                          <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                              <Icon className={`w-4 h-4 ${cfg.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-[#1A1A1A] text-sm">{alert.title}</p>
                              <p className="text-[#4A5568] text-xs mt-0.5 leading-relaxed">{alert.message}</p>
                              {alert.severity && (
                                <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1.5 ${
                                  alert.severity === "high" ? "bg-red-100 text-red-700" :
                                  alert.severity === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                                }`}>
                                  {alert.severity === "high" ? "Penting" : alert.severity === "medium" ? "Sedang" : "Info"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <Link
                      to={createPageUrl("Alerts")}
                      onClick={onClose}
                      className="block text-center text-xs font-semibold text-[#FF6A00] py-2 hover:underline"
                    >
                      Lihat semua riwayat alert →
                    </Link>
                  </div>
                )}
                {alertRecords.length === 0 && (
                  <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                    <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1A1A1A] text-sm">Semua beres!</p>
                      <p className="text-[#8FA4C8] text-xs">Tidak ada notifikasi baru</p>
                    </div>
                    <Link to={createPageUrl("Alerts")} onClick={onClose} className="ml-auto text-xs text-[#FF6A00] font-semibold hover:underline flex-shrink-0">Riwayat</Link>
                  </div>
                )}
                <SmartAlertsPanel user={user} />
                <AnomalyDetector transactions={transactions} />
                <DashboardInsights transactions={transactions} goals={goals} />
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}