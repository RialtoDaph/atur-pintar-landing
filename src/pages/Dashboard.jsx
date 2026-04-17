import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

import AddTransactionModal from "@/components/transactions/AddTransactionModal";
import { useAppSettings } from "@/components/utils/useAppSettings";
import OnboardingQuestionnaire from "@/components/onboarding/OnboardingQuestionnaire";
import PullToRefresh from "@/components/utils/PullToRefresh";
import RecurringManager from "@/components/transactions/RecurringManager";
import { syncAccountBalance } from "@/components/utils/accountSync";
import AlertsDrawer from "@/components/dashboard/AlertsDrawer";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import FHSCard from "@/components/dashboard/FHSCard";
import NanaDailyInsight from "@/components/dashboard/NanaDailyInsight";
import DailyMissions from "@/components/dashboard/DailyMissions";
import LevelProgress, { getLevelDef } from "@/components/dashboard/LevelProgress";
import BudgetOverview from "@/components/dashboard/BudgetOverview";
import BalanceSummary from "@/components/dashboard/BalanceSummary";

// ── Level Up popup ────────────────────────────────────────────────────────────
function LevelUpModal({ levelDef, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.4, y: 60 }} animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 12 }}
        className="bg-white rounded-3xl px-8 py-8 flex flex-col items-center gap-4 shadow-2xl mx-6 max-w-xs w-full"
        onClick={e => e.stopPropagation()}
      >
        <motion.div animate={{ rotate: [0, -15, 15, -10, 10, 0] }} transition={{ duration: 0.8 }} className="text-6xl">⭐</motion.div>
        <div className="text-center">
          <p className="text-xs font-bold text-[#FF6B35] uppercase tracking-widest mb-1">⬆️ Level Up!</p>
          <h2 className="text-xl font-black text-[#1A1A1A]">Kamu sekarang Level {levelDef.level}</h2>
          <p className="text-base font-bold text-[#FF6B35] mt-1">{levelDef.name}</p>
        </div>
        <button onClick={onClose}
          className="w-full py-3 rounded-2xl bg-[#FF6B35] text-white font-bold text-sm">
          Keren! →
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAlertsDrawer, setShowAlertsDrawer] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [gamificationProfile, setGamificationProfile] = useState(null);
  const [levelUpModal, setLevelUpModal] = useState(null);

  // ── Load user ────────────────────────────────────────────────────────────────
  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (!u?.onboarding_completed && !localStorage.getItem("onboarding_done")) {
        setShowOnboarding(true);
      }
      // Subscription expiry check
      if (u?.role !== "admin" && u?.subscription_status === "active") {
        const endDate = u?.subscription_end_date || u?.subscription_expiry;
        if (endDate && endDate < new Date().toISOString().split("T")[0]) {
          base44.auth.updateMe({ subscription_status: "expired", subscription_plan: "free" }).catch(() => {});
        }
      }
      // Dedup once
      if (u?.onboarding_completed && !sessionStorage.getItem("dedup_done")) {
        sessionStorage.setItem("dedup_done", "1");
        base44.functions.invoke("deduplicateUserData", {}).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  // ── Load gamification profile + streak check ─────────────────────────────────
  useEffect(() => {
    if (!user?.email) return;
    loadGamificationProfile();
    loadUnread();
  }, [user?.email]);

  async function loadGamificationProfile() {
    const profiles = await base44.entities.GamificationProfile.filter({ created_by: user.email });
    if (profiles.length === 0) return;
    const p = profiles[0];
    // Check streak reset
    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
    if (p.last_activity_date && p.last_activity_date !== today && p.last_activity_date !== yesterday && (p.daily_streak || 0) > 0) {
      const updated = await base44.entities.GamificationProfile.update(p.id, { daily_streak: 0 });
      setGamificationProfile(updated);
    } else {
      setGamificationProfile(p);
    }
  }

  async function loadUnread() {
    const alerts = await base44.entities.Alert.filter({ created_by: user.email, status: "unread" });
    setUnreadCount(alerts.length);
  }

  // ── Award XP from mission ─────────────────────────────────────────────────────
  async function handleMissionXP(xpReward) {
    if (!user?.email) return;
    let p = gamificationProfile;
    if (!p) {
      const profiles = await base44.entities.GamificationProfile.filter({ created_by: user.email });
      if (profiles.length === 0) return;
      p = profiles[0];
    }
    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
    const last = p.last_activity_date;
    const oldXP = p.total_points || 0;
    const newXP = oldXP + xpReward;
    const oldLevel = getLevelDef(oldXP);
    const newLevel = getLevelDef(newXP);

    let newStreak = p.daily_streak || 0;
    let updates = { total_points: newXP, level: newLevel.level };

    if (last !== today) {
      newStreak = last === yesterday ? newStreak + 1 : 1;
      updates.daily_streak = newStreak;
      updates.last_activity_date = today;
    }

    const updated = await base44.entities.GamificationProfile.update(p.id, updates);
    setGamificationProfile(updated);

    if (newLevel.level > oldLevel.level) {
      setLevelUpModal(newLevel);
    }
  }

  // ── Queries ──────────────────────────────────────────────────────────────────
  const enabled = !!user?.onboarding_completed;

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions_dashboard", user?.email],
    queryFn: () => base44.entities.Transaction.filter({ created_by: user.email }, "-date", 100),
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets", user?.email],
    queryFn: () => base44.entities.Budget.filter({ created_by: user.email }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts_dashboard", user?.email],
    queryFn: () => base44.entities.Account.filter({ created_by: user.email }),
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  const { data: fhsList = [], isLoading: fhsLoading } = useQuery({
    queryKey: ["fhs", user?.email],
    queryFn: () => base44.entities.FinancialHealthScore.filter({ created_by: user.email }, "-created_date", 2),
    enabled,
    staleTime: 10 * 60 * 1000,
  });

  // ── Derived data ─────────────────────────────────────────────────────────────
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const today = format(new Date(), "yyyy-MM-dd");

  const fhs = fhsList.find(f => f.month === currentMonth) || fhsList[0] || null;
  const todayExpense = transactions
    .filter(t => t.date === today && t.type === "expense" && !t.is_deleted)
    .reduce((s, t) => s + t.amount, 0);

  const streak = gamificationProfile?.daily_streak || 0;

  async function loadData() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["transactions_dashboard", user?.email] }),
      queryClient.invalidateQueries({ queryKey: ["budgets", user?.email] }),
      queryClient.invalidateQueries({ queryKey: ["accounts_dashboard", user?.email] }),
      queryClient.invalidateQueries({ queryKey: ["fhs", user?.email] }),
    ]);
  }

  return (
    <PullToRefresh onRefresh={loadData}>
      <div className="min-h-screen bg-[#F2F4F7] pb-8">
        {user && <RecurringManager userEmail={user.email} />}

        {/* Section 1: Greeting Header */}
        <DashboardHeader
          user={user}
          streak={streak}
          unreadCount={unreadCount}
          onBellClick={() => setShowAlertsDrawer(true)}
        />

        <div className="max-w-2xl mx-auto space-y-3 px-4 pt-3">
          {/* Section 2: FHS Card — overlaps header slightly */}
          <FHSCard fhs={fhs} loading={fhsLoading && enabled} />

          {/* Section 3: Nana Daily Insight */}
          <NanaDailyInsight todayExpense={todayExpense} />

          {/* Subscription expired warning */}
          {user?.subscription_status === "expired" && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700">Langganan kamu sudah berakhir</p>
                <p className="text-xs text-red-500">Perpanjang untuk akses fitur premium</p>
              </div>
              <a href="/Subscription" className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold">Perpanjang</a>
            </div>
          )}

          {/* Section 4: Daily Missions */}
          {enabled && (
            <DailyMissions user={user} onXpGained={handleMissionXP} />
          )}

          {/* Section 5: Level Progress */}
          <LevelProgress profile={gamificationProfile} />

          {/* Section 6: Budget Overview */}
          <BudgetOverview budgets={budgets} transactions={transactions} />

          {/* Section 7: Balance Summary */}
          <BalanceSummary accounts={accounts} />

          <div className="h-4" />
        </div>

        {/* Add Transaction Modal */}
        {showAddTransaction && (
          <AddTransactionModal
            goals={[]}
            onClose={() => setShowAddTransaction(false)}
            onSave={async (data) => {
              await base44.entities.Transaction.create(data);
              if (data.account_id) await syncAccountBalance(data.account_id, data.amount, data.type, 1);
              setShowAddTransaction(false);
              loadData();
              if (user) await handleMissionXP(10);
            }}
          />
        )}

        {/* Onboarding */}
        {showOnboarding && (
          <OnboardingQuestionnaire onClose={() => {
            setShowOnboarding(false);
            loadData();
            loadGamificationProfile();
          }} />
        )}

        {/* Alerts Drawer */}
        {showAlertsDrawer && (
          <AlertsDrawer onClose={() => { setShowAlertsDrawer(false); setUnreadCount(0); }} user={user} />
        )}

        {/* Level Up Modal */}
        <AnimatePresence>
          {levelUpModal && (
            <LevelUpModal levelDef={levelUpModal} onClose={() => setLevelUpModal(null)} />
          )}
        </AnimatePresence>
      </div>
    </PullToRefresh>
  );
}