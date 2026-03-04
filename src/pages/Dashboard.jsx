import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Plus, TrendingUp, Target, Wallet, ArrowRight } from "lucide-react";
import GoalCard from "../components/goals/GoalCard";
import StatCard from "../components/dashboard/StatCard";
import AddGoalModal from "../components/goals/AddGoalModal";

export default function Dashboard() {
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddGoal, setShowAddGoal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [g, t] = await Promise.all([
      base44.entities.SavingsGoal.list("-created_date"),
      base44.entities.Transaction.list("-created_date", 100),
    ]);
    setGoals(g);
    setTransactions(t);
    setLoading(false);
  }

  const totalSaved = goals.reduce((s, g) => s + (g.current_amount || 0), 0);
  const totalTarget = goals.reduce((s, g) => s + (g.target_amount || 0), 0);
  const completedGoals = goals.filter((g) => g.status === "completed").length;
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#F7F6F3] px-4 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-xs font-semibold tracking-widest text-[#9B9B9B] uppercase mb-1">Overview</p>
          <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">My Savings</h1>
        </div>
        <button
          onClick={() => setShowAddGoal(true)}
          className="flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#333] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Goal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard
          label="Total Saved"
          value={`$${totalSaved.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<Wallet className="w-5 h-5" />}
          accent="#4F7CFF"
        />
        <StatCard
          label="Overall Progress"
          value={`${overallProgress.toFixed(1)}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          accent="#34C87A"
        />
        <StatCard
          label="Goals Completed"
          value={`${completedGoals} / ${goals.length}`}
          icon={<Target className="w-5 h-5" />}
          accent="#F5A623"
        />
      </div>

      {/* Goals */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-[#1A1A1A]">Your Goals</h2>
        {goals.length > 0 && (
          <Link
            to={createPageUrl("Goals")}
            className="flex items-center gap-1 text-sm text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-[#EFEFED] animate-pulse" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-[#EFEFED] flex items-center justify-center mb-4 text-2xl">💰</div>
          <p className="text-[#1A1A1A] font-semibold text-lg mb-1">No goals yet</p>
          <p className="text-[#9B9B9B] text-sm mb-6">Create your first savings goal to get started</p>
          <button
            onClick={() => setShowAddGoal(true)}
            className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#333] transition-colors"
          >
            Create a Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goals.slice(0, 4).map((goal) => (
            <GoalCard key={goal.id} goal={goal} onUpdate={loadData} transactions={transactions.filter(t => t.goal_id === goal.id)} />
          ))}
        </div>
      )}

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
    </div>
  );
}