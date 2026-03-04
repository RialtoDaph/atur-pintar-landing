import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, TrendingUp, PiggyBank, Target } from "lucide-react";
import PremiumGate from "@/components/premium/PremiumGate";
import { formatRupiah } from "@/components/utils/formatRupiah";

const CATEGORIES = {
  food: { label: "Makanan", emoji: "🍔", color: "#FF6B6B" },
  transport: { label: "Transportasi", emoji: "🚗", color: "#4ECDC4" },
  utilities: { label: "Tagihan", emoji: "💡", color: "#45B7D1" },
  entertainment: { label: "Hiburan", emoji: "🎬", color: "#FFA07A" },
  shopping: { label: "Belanja", emoji: "🛍️", color: "#DDA15E" },
  health: { label: "Kesehatan", emoji: "⚕️", color: "#BC6C25" },
  education: { label: "Pendidikan", emoji: "📚", color: "#6A4C93" },
  other: { label: "Lainnya", emoji: "📌", color: "#8E9AAF" },
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, txData, goalData, budgetData, investmentData] = await Promise.all([
          base44.auth.me(),
          base44.entities.Transaction.list(),
          base44.entities.SavingsGoal.list(),
          base44.entities.Budget.list(),
          base44.entities.Investment.list(),
        ]);
        setUser(userData);
        setTransactions(txData);
        setGoals(goalData);
        setBudgets(budgetData);
        setInvestments(investmentData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Process 6-month income vs expense trend
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const monthKey = `${year}-${month}`;
    
    const monthIncome = transactions
      .filter(t => t.type === "income" && t.date?.startsWith(monthKey))
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const monthExpense = transactions
      .filter(t => t.type === "expense" && t.date?.startsWith(monthKey))
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    last6Months.push({
      month: monthNames[date.getMonth()],
      income: monthIncome,
      expense: monthExpense,
    });
  }

  // Process current month category breakdown
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const categoryData = {};

  transactions
    .filter(t => t.type === "expense" && t.date?.startsWith(currentMonth))
    .forEach(t => {
      const cat = t.category || "other";
      categoryData[cat] = (categoryData[cat] || 0) + (t.amount || 0);
    });

  const pieData = Object.entries(categoryData).map(([key, value]) => ({
    name: CATEGORIES[key]?.label || key,
    value,
    color: CATEGORIES[key]?.color || "#8E9AAF",
  }));

  // 12-month spending trend
  const last12Months = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const monthKey = `${year}-${month}`;
    
    const monthExpense = transactions
      .filter(t => t.type === "expense" && t.date?.startsWith(monthKey))
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    last12Months.push({
      month: monthNames[date.getMonth()],
      expense: monthExpense,
    });
  }

  // Budget vs spending comparison
  const budgetComparison = budgets
    .filter(b => b.month === currentMonth)
    .map(b => ({
      category: CATEGORIES[b.category]?.label || b.category,
      budget: b.amount,
      spent: categoryData[b.category] || 0,
    }));

  // Goals progress
  const goalsProgress = goals.map(g => ({
    name: g.name,
    current: g.current_amount || 0,
    target: g.target_amount || 0,
    percentage: Math.round(((g.current_amount || 0) / (g.target_amount || 1)) * 100),
  }));

  // Investments summary
  const investmentsTotal = investments.reduce((sum, inv) => sum + (inv.current_value || 0), 0);
  const investmentsGain = investments.reduce((sum, inv) => sum + ((inv.current_value || 0) - (inv.initial_amount || 0)), 0);
  const gainPercent = investmentsTotal > 0 ? ((investmentsGain / investmentsTotal) * 100).toFixed(2) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6A00]" />
      </div>
    );
  }

  return (
    <PremiumGate>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analitik Keuangan</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Lihat tren dan insight dari pengeluaran Anda</p>
        </div>

        {/* 12-month spending trend */}
        <Card className="dm-card">
          <CardHeader>
            <CardTitle>Tren Pengeluaran (12 Bulan)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={last12Months}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatRupiah(value)} />
                <Area type="monotone" dataKey="expense" stroke="#FF6A00" fill="#FF6A0020" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 6-month income vs expense */}
        <Card className="dm-card">
          <CardHeader>
            <CardTitle>Pemasukan vs Pengeluaran (6 Bulan)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={last6Months}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatRupiah(value)} />
                <Legend />
                <Bar dataKey="income" fill="#10B981" name="Pemasukan" />
                <Bar dataKey="expense" fill="#FF6A00" name="Pengeluaran" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Current month by category */}
        {pieData.length > 0 && (
          <Card className="dm-card">
            <CardHeader>
              <CardTitle>Pengeluaran Bulan Ini Berdasarkan Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatRupiah(value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatRupiah(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Budget allocation vs spending */}
        {budgetComparison.length > 0 && (
          <Card className="dm-card">
            <CardHeader>
              <CardTitle>Alokasi Anggaran vs Pengeluaran</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatRupiah(value)} />
                  <Legend />
                  <Bar dataKey="budget" fill="#6A4C93" name="Anggaran" />
                  <Bar dataKey="spent" fill="#FF6A00" name="Pengeluaran" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Savings goals progress */}
        {goalsProgress.length > 0 && (
          <Card className="dm-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Progres Tujuan Tabungan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goalsProgress.map((goal) => (
                  <div key={goal.name}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{goal.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{goal.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-[#FF6A00] h-2 rounded-full"
                        style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {formatRupiah(goal.current)} / {formatRupiah(goal.target)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Investments summary */}
        {investments.length > 0 && (
          <Card className="dm-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Ringkasan Investasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Nilai</p>
                  <p className="text-2xl font-bold">{formatRupiah(investmentsTotal)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Keuntungan</p>
                  <p className={`text-2xl font-bold ${investmentsGain >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatRupiah(investmentsGain)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Return</p>
                  <p className={`text-2xl font-bold ${gainPercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {gainPercent}%
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {investments.map((inv) => (
                  <div key={inv.id} className="flex justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">{inv.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Beli: {formatRupiah(inv.initial_amount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatRupiah(inv.current_value)}</p>
                      <p className={`text-sm ${inv.current_value >= inv.initial_amount ? "text-green-600" : "text-red-600"}`}>
                        {formatRupiah(inv.current_value - inv.initial_amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PremiumGate>
  );
}