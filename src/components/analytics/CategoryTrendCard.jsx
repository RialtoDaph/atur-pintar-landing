import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatRupiah } from "@/components/utils/formatRupiah";

export default function CategoryTrendCard({ transactions, categoryName = "Restaurant" }) {
  // Aggregate by month
  const monthlyData = useMemo(() => {
    const data = {};
    const today = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = date.toISOString().slice(0, 7);
      const monthLabel = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][date.getMonth()];
      data[key] = { month: monthLabel, amount: 0, key };
    }
    
    // Aggregate transactions (for now, mock by using all expenses)
    transactions.forEach(tx => {
      if (tx.type === "expense") {
        const key = tx.date.slice(0, 7);
        if (data[key]) {
          data[key].amount += tx.amount / 10; // Mock distribution
        }
      }
    });
    
    return Object.values(data);
  }, [transactions]);
  
  const avgMonthly = monthlyData.length > 0 ? monthlyData.reduce((sum, m) => sum + m.amount, 0) / monthlyData.length : 0;
  const lastMonth = monthlyData[monthlyData.length - 1]?.amount || 0;
  const prevMonth = monthlyData[monthlyData.length - 2]?.amount || 0;
  const trend = lastMonth - prevMonth;

  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-4 sm:p-6 shadow-sm border border-[#2D2D2D]">
      <h2 className="font-bold text-white text-base mb-4">{categoryName}</h2>
      
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3D3D3D" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8FA4C8" }} />
          <YAxis tick={{ fontSize: 10, fill: "#8FA4C8" }} />
          <Tooltip 
            formatter={(value) => formatRupiah(value)}
            contentStyle={{ borderRadius: 8, border: "none", backgroundColor: "#2D2D2D", color: "#fff", fontSize: 12 }}
          />
          <Bar dataKey="amount" fill="#4F7CFF" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-[#8FA4C8] text-xs mb-1">Durchschnitt</p>
          <p className="text-white text-xl font-bold">{formatRupiah(avgMonthly)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold">Trend</span>
          <div className={`flex items-center gap-1 ${trend >= 0 ? 'text-red-500' : 'text-green-500'}`}>
            {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="font-bold">{trend >= 0 ? '+' : ''}{formatRupiah(Math.abs(trend))}</span>
          </div>
        </div>
      </div>
      
      <button className="mt-3 text-[#00C9A7] text-sm font-medium hover:underline flex items-center gap-1">
        Zur Analyse →
      </button>
    </div>
  );
}