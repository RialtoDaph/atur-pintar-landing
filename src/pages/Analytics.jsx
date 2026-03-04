import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar, TrendingUp, TrendingDown, DollarSign, Filter, ChevronDown, X } from "lucide-react";
import { formatRupiah } from "@/components/utils/formatRupiah";

const DEFAULT_CATEGORIES = {
  makanan: { label: "Makanan", emoji: "🍔", color: "#FF6B6B" },
  transportasi: { label: "Transportasi", emoji: "🚗", color: "#4ECDC4" },
  hiburan: { label: "Hiburan", emoji: "🎬", color: "#FFE66D" },
  belanja: { label: "Belanja", emoji: "🛍️", color: "#95E1D3" },
  tagihan: { label: "Tagihan", emoji: "📄", color: "#FF6348" },
  kesehatan: { label: "Kesehatan", emoji: "🏥", color: "#A29BFE" },
};

export default function Analytics() {
  const [transactions, setTransactions] = useState([]);
  const [customCategories, setCustomCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("3months");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showComparison, setShowComparison] = useState(false);
  const [drillDownCategory, setDrillDownCategory] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const txns = await base44.entities.Transaction.list();
        const customs = await base44.entities.CustomCategory.list();
        
        const categoryMap = {};
        customs.forEach(cat => {
          categoryMap[`custom_${cat.id}`] = { 
            label: cat.name, 
            emoji: cat.emoji, 
            color: cat.color 
          };
        });
        
        setCustomCategories(categoryMap);
        setTransactions(txns || []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const categories = { ...DEFAULT_CATEGORIES, ...customCategories };

  const getDateRange = (offset = 0) => {
    const end = new Date();
    const start = new Date();
    
    if (offset !== 0) {
      end.setMonth(end.getMonth() + offset);
      start.setMonth(start.getMonth() + offset);
    }
    
    if (timeRange === "1month") start.setMonth(start.getMonth() - 1);
    else if (timeRange === "3months") start.setMonth(start.getMonth() - 3);
    else if (timeRange === "6months") start.setMonth(start.getMonth() - 6);
    else if (timeRange === "1year") start.setFullYear(start.getFullYear() - 1);
    
    return { start, end };
  };

  const filteredTransactions = transactions.filter(txn => {
    const txnDate = new Date(txn.date);
    const { start, end } = getDateRange();
    const dateMatch = txnDate >= start && txnDate <= end;
    const categoryMatch = selectedCategory === "all" || txn.category === selectedCategory;
    return dateMatch && categoryMatch;
  });

  // Monthly data for trend chart
  const getMonthlyData = () => {
    const monthMap = {};
    const { start } = getDateRange();
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(start);
      date.setMonth(date.getMonth() + i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthMap[key] = { income: 0, expense: 0, month: date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }) };
    }

    filteredTransactions.forEach(txn => {
      const txnDate = new Date(txn.date);
      const key = `${txnDate.getFullYear()}-${String(txnDate.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap[key]) {
        if (txn.type === "income") monthMap[key].income += txn.amount;
        else if (txn.type === "expense") monthMap[key].expense += txn.amount;
      }
    });

    return Object.values(monthMap);
  };

  // Category breakdown
  const getCategoryData = () => {
    const catMap = {};
    const expenses = filteredTransactions.filter(t => t.type === "expense");
    
    expenses.forEach(txn => {
      const catKey = txn.category || "lainnya";
      if (!catMap[catKey]) catMap[catKey] = 0;
      catMap[catKey] += txn.amount;
    });

    return Object.entries(catMap).map(([key, amount]) => ({
      name: categories[key]?.label || key,
      value: amount,
      color: categories[key]?.color || "#888",
    })).sort((a, b) => b.value - a.value);
  };

  // Summary stats
  const stats = (() => {
    const income = filteredTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const savings = filteredTransactions.filter(t => t.type === "savings").reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expense, savings, balance: income - expense };
  })();

  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();

  const getPreviousPeriodStats = () => {
    const prevTransactions = transactions.filter(txn => {
      const txnDate = new Date(txn.date);
      const { start, end } = getDateRange(-1);
      return txnDate >= start && txnDate <= end;
    });

    const prevIncome = prevTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const prevExpense = prevTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    
    return { income: prevIncome, expense: prevExpense };
  };

  const getDrillDownTransactions = () => {
    if (!drillDownCategory) return [];
    return filteredTransactions.filter(t => t.category === drillDownCategory && t.type === "expense").sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const RichTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-lg p-3 text-white text-xs">
          <p className="font-semibold">{data.month || label}</p>
          {data.income && <p className="text-[#4ECDC4]">Pemasukan: {formatRupiah(data.income)}</p>}
          {data.expense && <p className="text-[#FF6B6B]">Pengeluaran: {formatRupiah(data.expense)}</p>}
          {data.value && <p className="text-[#8FA4C8]">Total: {formatRupiah(data.value)}</p>}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Memuat data...</div>;
  }

  if (drillDownCategory) {
    const categoryName = categories[drillDownCategory]?.label || drillDownCategory;
    const drillTxns = getDrillDownTransactions();
    return (
      <div className="min-h-screen bg-[#F2F4F7] pb-20 sm:pb-10">
        <div className="bg-[#0A0A0A] sticky top-0 z-30 px-5 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-[#8FA4C8] text-xs font-medium">Detail Kategori</p>
              <h1 className="text-white text-xl font-bold mt-0.5">{categories[drillDownCategory]?.emoji} {categoryName}</h1>
            </div>
            <button onClick={() => setDrillDownCategory(null)} className="text-[#8FA4C8] hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-5 py-6 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-[#E2E8F0]">
            <p className="text-[#8FA4C8] text-xs font-bold uppercase mb-2">Total Pengeluaran</p>
            <p className="text-[#FF6B6B] text-3xl font-bold">{formatRupiah(drillTxns.reduce((s, t) => s + t.amount, 0))}</p>
            <p className="text-[#8FA4C8] text-xs mt-1">{drillTxns.length} transaksi</p>
          </div>
          <div className="space-y-2">
            {drillTxns.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-[#E2E8F0]">
                <p className="text-[#8FA4C8]">Tidak ada transaksi dalam kategori ini</p>
              </div>
            ) : (
              drillTxns.map(txn => (
                <div key={txn.id} className="bg-white rounded-2xl p-4 border border-[#E2E8F0] flex items-center justify-between">
                  <div>
                    <p className="text-[#1A1A1A] font-medium text-sm">{txn.note || categoryName}</p>
                    <p className="text-[#8FA4C8] text-xs">{new Date(txn.date).toLocaleDateString('id-ID')}</p>
                  </div>
                  <p className="text-[#FF6B6B] font-bold">{formatRupiah(txn.amount)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F4F7] pb-20 sm:pb-10">
      {/* Header */}
      <div className="bg-[#0A0A0A] sticky top-0 z-30 px-5 py-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-[#8FA4C8] text-xs font-medium">Wawasan Keuangan</p>
          <h1 className="text-white text-xl font-bold mt-0.5">Analitik</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-6 pb-20">
        
        {/* Filters & Comparison */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <label className="text-xs text-[#8FA4C8] font-bold uppercase mb-2 block">Periode</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#E2E8F0] text-[#1A1A1A] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
            >
              <option value="1month">1 Bulan</option>
              <option value="3months">3 Bulan</option>
              <option value="6months">6 Bulan</option>
              <option value="1year">1 Tahun</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="text-xs text-[#8FA4C8] font-bold uppercase mb-2 block">Kategori</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#E2E8F0] text-[#1A1A1A] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
            >
              <option value="all">Semua Kategori</option>
              {Object.entries(categories).map(([key, cat]) => (
                <option key={key} value={key}>{cat.emoji} {cat.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                showComparison
                  ? "bg-[#FF6A00] text-white"
                  : "bg-white border border-[#E2E8F0] text-[#1A1A1A] hover:bg-[#F2F4F7]"
              }`}
            >
              Bandingkan
            </button>
          </div>
        </div>

        {/* Summary Stats with Comparison */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E2E8F0]">
            <p className="text-[#8FA4C8] text-xs font-bold uppercase">Pemasukan</p>
            <p className="text-[#1A1A1A] text-base font-bold mt-2">{formatRupiah(stats.income)}</p>
            {showComparison && (
              <div className="mt-2 pt-2 border-t border-[#E2E8F0]">
                <p className="text-[#8FA4C8] text-[10px]">Periode lalu</p>
                <p className="text-[#4ECDC4] text-xs font-semibold">{formatRupiah(getPreviousPeriodStats().income)}</p>
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E2E8F0]">
            <p className="text-[#8FA4C8] text-xs font-bold uppercase">Pengeluaran</p>
            <p className="text-[#FF6B6B] text-base font-bold mt-2">{formatRupiah(stats.expense)}</p>
            {showComparison && (
              <div className="mt-2 pt-2 border-t border-[#E2E8F0]">
                <p className="text-[#8FA4C8] text-[10px]">Periode lalu</p>
                <p className="text-[#FF6B6B] text-xs font-semibold">{formatRupiah(getPreviousPeriodStats().expense)}</p>
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E2E8F0]">
            <p className="text-[#8FA4C8] text-xs font-bold uppercase">Tabungan</p>
            <p className="text-[#1A1A1A] text-base font-bold mt-2">{formatRupiah(stats.savings)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E2E8F0]">
            <p className="text-[#8FA4C8] text-xs font-bold uppercase">Saldo</p>
            <p className={`text-base font-bold mt-2 ${stats.balance >= 0 ? "text-[#4ECDC4]" : "text-[#FF6B6B]"}`}>
              {formatRupiah(stats.balance)}
            </p>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-[#E2E8F0]">
          <h2 className="text-[#1A1A1A] font-bold text-base mb-4">Tren Bulanan</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#8FA4C8" style={{ fontSize: "12px" }} />
              <YAxis stroke="#8FA4C8" style={{ fontSize: "12px" }} />
              <Tooltip content={<RichTooltip />} />
              <Legend />
              <Bar dataKey="income" fill="#4ECDC4" name="Pemasukan" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expense" fill="#FF6B6B" name="Pengeluaran" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        {categoryData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-[#E2E8F0]">
              <h2 className="text-[#1A1A1A] font-bold text-base mb-4">Pengeluaran per Kategori</h2>
              <p className="text-[#8FA4C8] text-xs mb-3">Klik kategori untuk melihat detail transaksi</p>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={(entry) => setDrillDownCategory(Object.keys(categories).find(k => categories[k].label === entry.name))}
                    style={{ cursor: "pointer" }}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatRupiah(value)}
                    contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #2D2D2D", borderRadius: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5 border border-[#E2E8F0]">
              <h2 className="text-[#1A1A1A] font-bold text-base mb-4">Detail Kategori</h2>
              <div className="space-y-3">
                {categoryData.map((cat, i) => {
                  const percent = ((cat.value / stats.expense) * 100).toFixed(1);
                  return (
                    <div key={i} className="flex items-center justify-between pb-3 border-b border-[#F2F4F7] last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                        <p className="text-[#1A1A1A] font-medium text-sm">{cat.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#1A1A1A] font-bold text-sm">{formatRupiah(cat.value)}</p>
                        <p className="text-[#8FA4C8] text-xs">{percent}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center border border-[#E2E8F0]">
            <p className="text-[#8FA4C8] text-sm">Tidak ada data transaksi untuk periode ini</p>
          </div>
        )}
      </div>
    </div>
  );
}