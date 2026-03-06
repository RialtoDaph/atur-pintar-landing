import { useState, useMemo } from "react";
import { BarChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart, Legend } from "recharts";
import { ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { formatRupiah } from "@/components/utils/formatRupiah";
import { useAppSettings } from "@/components/utils/useAppSettings";

export default function RestaurantBarSpendingCard({
  transactions,
  customCategories,
  filterPeriod,
  customDateRange,
  onNavigateToDetail
}) {
  const navigate = useNavigate();
  const { formatShortNumber } = useAppSettings();
  const now = new Date();

  // Find restaurant and bar category IDs
  // Support for specific food & beverage sub-categories
  const foodBevCats = customCategories.filter(c => {
    const name = c.name?.toLowerCase() || "";
    return (
      name.includes("makan") ||
      name.includes("restoran") ||
      name.includes("restaurant") ||
      name.includes("minuman") ||
      name.includes("kopi") ||
      name.includes("coffee") ||
      name.includes("bar") ||
      name.includes("makanan")
    );
  });

  const getMonthRange = () => {
    if (customDateRange) {
      return customDateRange;
    }
    const months = parseInt(filterPeriod);
    return {
      start: new Date(now.getFullYear(), now.getMonth() - (months - 1), 1),
      end: now,
    };
  };

  const monthRange = getMonthRange();

  const monthDiff =
    (monthRange.end.getFullYear() - monthRange.start.getFullYear()) * 12 +
    (monthRange.end.getMonth() - monthRange.start.getMonth());

  // Filter for food & beverage categories
  const isRestaurantBar = (tx) => {
    return foodBevCats.some(cat => tx.category === `custom_${cat.id}`);
  };

  // Calculate monthly expenses for current period (stacked by sub-category)
  const currentMonthlyData = Array.from({ length: monthDiff + 1 }, (_, i) => {
    const d = new Date(monthRange.start.getFullYear(), monthRange.start.getMonth() + i, 1);
    const month = d.getMonth();
    const year = d.getFullYear();
    
    const monthTx = transactions.filter(t => {
      const td = new Date(t.date);
      return (
        td.getMonth() === month &&
        td.getFullYear() === year &&
        t.type === "expense" &&
        isRestaurantBar(t)
      );
    });
    
    // Aggregate by sub-category
    const byCategory = {};
    let total = 0;
    
    monthTx.forEach(t => {
      const catId = t.category.replace("custom_", "");
      const cat = foodBevCats.find(c => c.id === catId);
      const catName = cat?.name || "Other";
      
      if (!byCategory[catName]) byCategory[catName] = 0;
      byCategory[catName] += t.amount;
      total += t.amount;
    });
    
    return {
      name: d.toLocaleDateString("id-ID", { month: "short" }),
      total: total,
      label: d.toLocaleDateString("id-ID", { month: "2-digit", year: "2-digit" }),
      ...byCategory
    };
  });

  // Calculate daily average for current period
  const totalDays = Math.ceil(
    (monthRange.end - monthRange.start) / (1000 * 60 * 60 * 24)
  ) + 1;
  const currentTotal = currentMonthlyData.reduce((s, m) => s + m.value, 0);
  const currentDailyAvg = currentTotal / totalDays;

  // Calculate previous period for trend
  const prevMonthRange = {
    start: new Date(monthRange.start.getFullYear(), monthRange.start.getMonth() - (monthDiff + 1), 1),
    end: new Date(monthRange.start.getFullYear(), monthRange.start.getMonth(), 0),
  };

  const prevMonthDiff =
    (prevMonthRange.end.getFullYear() - prevMonthRange.start.getFullYear()) * 12 +
    (prevMonthRange.end.getMonth() - prevMonthRange.start.getMonth());

  const prevMonthlyData = Array.from({ length: prevMonthDiff + 1 }, (_, i) => {
    const d = new Date(prevMonthRange.start.getFullYear(), prevMonthRange.start.getMonth() + i, 1);
    const month = d.getMonth();
    const year = d.getFullYear();
    const monthTx = transactions.filter(t => {
      const td = new Date(t.date);
      return (
        td.getMonth() === month &&
        td.getFullYear() === year &&
        t.type === "expense" &&
        isRestaurantBar(t)
      );
    });
    return monthTx.reduce((s, t) => s + t.amount, 0);
  });

  const prevTotalDays = Math.ceil(
    (prevMonthRange.end - prevMonthRange.start) / (1000 * 60 * 60 * 24)
  ) + 1;
  const prevTotal = prevMonthlyData.reduce((s, m) => s + m, 0);
  const prevDailyAvg = prevTotal / prevTotalDays;

  const trendDiff = currentDailyAvg - prevDailyAvg;
  const isTrendPositive = trendDiff >= 0;

  const handleNavigate = () => {
    navigate(`${createPageUrl("SpendingDetail")}?type=restaurant_bar&period=${filterPeriod}`);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
      <h2 className="font-bold text-[#0A0A0A] text-base mb-4">Restaurant & Bar</h2>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={currentMonthlyData}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8FA4C8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#8FA4C8" }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => [formatRupiah(value), undefined]}
            contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
          />
          <Legend wrapperStyle={{ paddingTop: 12, fontSize: 11 }} />
          {foodBevCats.map((cat, idx) => {
            const colors = ["#FF6A00", "#FF8C3A", "#FFB366", "#FFD699", "#FFCC66", "#FFB347"];
            return (
              <Bar
                key={cat.id}
                dataKey={cat.name}
                fill={colors[idx % colors.length]}
                stackId="food-bev"
                radius={idx === foodBevCats.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
              />
            );
          })}
          <Line
            type="monotone"
            dataKey="total"
            stroke="#8FA4C8"
            strokeDasharray="4 4"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Summary */}
      <div className="mt-4 flex items-baseline gap-2">
        <p className="text-sm text-[#8FA4C8]">Ø</p>
        <p className="text-xl sm:text-2xl font-bold text-[#0A0A0A]">{formatShortNumber(currentDailyAvg)}</p>
        <p className="text-sm text-[#8FA4C8]">/Hari</p>
      </div>

      {/* Trend */}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex items-center gap-1">
          {isTrendPositive ? (
            <TrendingUp className="w-4 h-4 text-[#FF6B6B]" />
          ) : (
            <TrendingDown className="w-4 h-4 text-[#00C9A7]" />
          )}
          <span className={`text-sm font-semibold ${isTrendPositive ? "text-[#FF6B6B]" : "text-[#00C9A7]"}`}>
            {isTrendPositive ? "+" : ""}{formatShortNumber(trendDiff)}
          </span>
        </div>
        <span className="text-xs text-[#8FA4C8]">vs periode sebelumnya</span>
      </div>

      {/* Button */}
      <button
        onClick={handleNavigate}
        className="mt-4 flex items-center gap-2 text-[#00C9A7] text-sm font-medium hover:opacity-80 transition-opacity"
      >
        Lihat Detail
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}