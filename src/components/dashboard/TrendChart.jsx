import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatRupiah } from "@/components/utils/formatRupiah";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-[#1E1E1E] border border-[#333] rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="text-[#8FA4C8] mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.dataKey === "income" ? "Pemasukan" : "Pengeluaran"}: {formatRupiah(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function TrendChart({ transactions, loading }) {
  const [view, setView] = useState("weekly"); // "weekly" | "daily"

  const data = useMemo(() => {
    if (!transactions?.length) return [];

    const now = new Date();

    if (view === "daily") {
      // Last 14 days
      return Array.from({ length: 14 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (13 - i));
        const dateStr = d.toISOString().split("T")[0];
        const dayTx = transactions.filter(t => t.date === dateStr);
        return {
          label: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
          income: dayTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
          expense: dayTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
        };
      });
    } else {
      // Last 8 weeks
      return Array.from({ length: 8 }, (_, i) => {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() - (7 * (7 - i)));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const weekTx = transactions.filter(t => {
          const d = new Date(t.date);
          return d >= weekStart && d <= weekEnd;
        });
        return {
          label: `${weekStart.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`,
          income: weekTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
          expense: weekTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
        };
      });
    }
  }, [transactions, view]);

  if (loading) return <div className="bg-white rounded-2xl shadow-sm h-48 animate-pulse" />;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#0A0A0A] text-sm">Tren Keuangan</h2>
        <div className="flex bg-[#F2F4F7] rounded-lg p-0.5">
          <button
            onClick={() => setView("daily")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${view === "daily" ? "bg-[#0A0A0A] text-white shadow-sm" : "text-[#8FA4C8]"}`}
          >
            Harian
          </button>
          <button
            onClick={() => setView("weekly")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${view === "weekly" ? "bg-[#0A0A0A] text-white shadow-sm" : "text-[#8FA4C8]"}`}
          >
            Mingguan
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00C9A7]" />
          <span className="text-[10px] text-[#8FA4C8] font-medium">Pemasukan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B]" />
          <span className="text-[10px] text-[#8FA4C8] font-medium">Pengeluaran</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00C9A7" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#00C9A7" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#8FA4C8" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 9, fill: "#8FA4C8" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}jt` : v >= 1000 ? `${(v/1000).toFixed(0)}rb` : v} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="income" stroke="#00C9A7" strokeWidth={2} fill="url(#colorIncome)" dot={false} activeDot={{ r: 4 }} />
          <Area type="monotone" dataKey="expense" stroke="#FF6B6B" strokeWidth={2} fill="url(#colorExpense)" dot={false} activeDot={{ r: 4 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}