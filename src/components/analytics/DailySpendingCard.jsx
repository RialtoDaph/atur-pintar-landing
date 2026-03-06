import { useState, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatRupiah } from "@/components/utils/formatRupiah";

export default function DailySpendingCard({ transactions }) {
  const { t } = { t: (key) => key }; // fallback
  
  // Get last 7 days spending
  const dailyData = useMemo(() => {
    const data = {};
    const today = new Date();
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      data[key] = 0;
    }
    
    // Aggregate transactions
    transactions.forEach(tx => {
      if (tx.type === "expense") {
        const key = tx.date;
        if (data[key] !== undefined) {
          data[key] += tx.amount;
        }
      }
    });
    
    // Convert to array with day labels
    return Object.entries(data).map(([date, amount]) => {
      const d = new Date(date);
      const dayShort = ['M', 'D', 'M', 'D', 'F', 'S', 'S'][d.getDay()];
      return { date, day: dayShort, amount };
    });
  }, [transactions]);
  
  const avgDaily = dailyData.length > 0 ? dailyData.reduce((sum, d) => sum + d.amount, 0) / dailyData.length : 0;
  const lastDay = dailyData[dailyData.length - 1]?.amount || 0;
  const prevAvg = dailyData.slice(0, 3).reduce((sum, d) => sum + d.amount, 0) / 3;
  const trend = lastDay - prevAvg;

  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-4 sm:p-6 shadow-sm border border-[#2D2D2D]">
      <h2 className="font-bold text-white text-base mb-4">Täglicher Bedarf</h2>
      
      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={dailyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3D3D3D" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#8FA4C8" }} />
          <YAxis tick={{ fontSize: 10, fill: "#8FA4C8" }} />
          <Tooltip 
            formatter={(value) => formatRupiah(value)}
            contentStyle={{ borderRadius: 8, border: "none", backgroundColor: "#2D2D2D", color: "#fff", fontSize: 12 }}
          />
          <Bar dataKey="amount" fill="#4F7CFF" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="amount" stroke="#FF6A00" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
      
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-[#8FA4C8] text-xs mb-1">Durchschnitt</p>
          <p className="text-white text-xl font-bold">{formatRupiah(avgDaily)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold">Trend</span>
          <div className={`flex items-center gap-1 ${trend >= 0 ? 'text-red-500' : 'text-green-500'}`}>
            {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="font-bold">{trend >= 0 ? '+' : ''}{formatRupiah(trend)}</span>
          </div>
        </div>
      </div>
      
      <button className="mt-3 text-[#00C9A7] text-sm font-medium hover:underline flex items-center gap-1">
        Zur Analyse →
      </button>
    </div>
  );
}