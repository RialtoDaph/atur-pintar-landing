import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, ChevronRight } from "lucide-react";
import AddGoalModal from "@/components/goals/AddGoalModal";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import BalanceCard from "@/components/dashboard/BalanceCard";
import SpendingChart from "@/components/dashboard/SpendingChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import GoalsMiniList from "@/components/dashboard/GoalsMiniList";
import SmartAlerts from "@/components/dashboard/SmartAlerts";
import SmartAlertsPanel from "@/components/dashboard/SmartAlertsPanel";
import SubscriptionDetector from "@/components/dashboard/SubscriptionDetector";
import CashflowForecast from "@/components/dashboard/CashflowForecast";
import BudgetOverspendAlert from "@/components/dashboard/BudgetOverspendAlert";
import GoalAchievementNotice from "@/components/dashboard/GoalAchievementNotice";
import CategorySpendingTrend from "@/components/dashboard/CategorySpendingTrend";
import RecurringManager from "@/components/transactions/RecurringManager";
import ReminderWidget from "@/components/reminders/ReminderWidget";

function getWidgets() {
  const saved = localStorage.getItem("widgets");
  if (saved) return JSON.parse(saved);
  return { smartAlerts: true, cashflowForecast: true, subscriptionDetector: true, spendingChart: true, recentTransactions: true, savingsGoals: true };
}

export default function Dashboard() {
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddTx, setShowAddTx] = useState(false);
  const [widgets, setWidgets] = useState(getWidgets());
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem("onboarding_done"));

  useEffect(() => {
    const onStorage = () => setWidgets(getWidgets());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [g, t, b] = await Promise.all([
      base44.entities.SavingsGoal.list("-created_date"),
      base44.entities.Transaction.list("-date", 100),
      base44.entities.Budget.list("-created_date"),
    ]);
    setGoals(g);
    setTransactions(t);
    setBudgets(b);
    setLoading(false);
  }

  const now = new Date();
  const thisMonthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthIncome = thisMonthTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const monthExpense = thisMonthTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalSaved = goals.reduce((s, g) => s + (g.current_amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#F2F4F7]">
      <RecurringManager />
      
      {/* Top Header Section */}
      <div className="bg-[#0A0A0A] sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#8FA4C8] text-xs font-medium">Halo 👋</p>
              <h1 className="text-white text-xl font-bold mt-1">Keuanganmu</h1>
            </div>
            <button
              onClick={() => setShowAddTx(true)}
              className="w-10 h-10 rounded-full bg-[#FF6A00] flex items-center justify-center shadow-lg hover:bg-[#e05e00] transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Balance Card - Full Width Below Header */}
      <div className="bg-[#0A0A0A]">
        <div className="max-w-2xl mx-auto px-5 pb-6">
          <BalanceCard
            income={monthIncome}
            expense={monthExpense}
            savings={totalSaved}
            loading={loading}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-2xl mx-auto px-5 py-6 space-y-4 pb-20">

        {/* Alerts & Achievements Section - Priority High */}
        <SmartAlertsPanel />
        <GoalAchievementNotice goals={goals} transactions={transactions} loading={loading} />
        {widgets.smartAlerts && <SmartAlerts transactions={transactions} loading={loading} />}
        <BudgetOverspendAlert transactions={transactions} budgets={budgets} loading={loading} />
        <CategorySpendingTrend transactions={transactions} loading={loading} />

        {/* Quick Reminders */}
        <ReminderWidget />

        {/* Analytics & Insights Section */}
        <div className="space-y-4">
          {widgets.spendingChart && <SpendingChart transactions={thisMonthTx} loading={loading} />}
          {widgets.cashflowForecast && <CashflowForecast transactions={transactions} loading={loading} />}
          {widgets.subscriptionDetector && <SubscriptionDetector transactions={transactions} loading={loading} />}
        </div>

        {/* Transactions & Goals Section */}
        <div className="space-y-4">
          {widgets.recentTransactions && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#E2E8F0]">
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="font-bold text-[#1A1A1A] text-base">Transaksi Terbaru</h2>
                <Link to={createPageUrl("Transactions")} className="text-xs text-[#FF6A00] font-semibold flex items-center gap-1 hover:opacity-80">
                  Lihat semua <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <RecentTransactions transactions={transactions.slice(0, 5)} loading={loading} onRefresh={loadData} />
            </div>
          )}

          {widgets.savingsGoals && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#E2E8F0]">
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="font-bold text-[#1A1A1A] text-base">Tujuan Tabungan</h2>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="text-xs text-[#FF6A00] font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
                >
                  + Tambah
                </button>
              </div>
              <GoalsMiniList goals={goals} loading={loading} />
              {goals.length > 0 && (
                <div className="px-5 py-3 border-t border-[#E2E8F0]">
                  <Link to={createPageUrl("Goals")} className="text-xs text-[#8FA4C8] flex items-center gap-1 hover:text-[#FF6A00]">
                    Lihat semua <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {showAddGoal && (
        <AddGoalModal
          onClose={() => setShowAddGoal(false)}
          onSave={async (data) => {
            await base44.entities.SavingsGoal.create(data);
            setShowAddGoal(false);
            loadData();
          }}
        />
      )}

      {showOnboarding && (
        <OnboardingModal onClose={() => {
          setShowOnboarding(false);
          localStorage.setItem("onboarding_done", "true");
        }} />
      )}

      {showAddTx && (
        <AddTransactionModal
          onClose={() => setShowAddTx(false)}
          onSave={async (data) => {
            await base44.entities.Transaction.create(data);
            setShowAddTx(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}