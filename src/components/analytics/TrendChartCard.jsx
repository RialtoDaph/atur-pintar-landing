import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { TrendingUp } from "lucide-react";
import { useAppSettings } from "@/components/utils/useAppSettings";

export default function TrendChartCard({ trendData = [], periodSubtitle }) {
  const { formatCurrency, formatShortNumber } = useAppSettings();

  const hasData = trendData.some(d => (d.Income || 0) > 0 || (d.Expenses || 0) > 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#FF6A00]" />
          <div>
            <p className="text-sm font-bold text-[#1A1A1A]">Tren Pemasukan & Pengeluaran</p>
            {periodSubtitle && <p className="text-[11px] text-[#8FA4C8]">{periodSubtitle}</p>}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 sm:px-4 pb-4">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-40 text-[#8FA4C8] text-xs">
            <span className="text-3xl mb-2">📈</span>
            <p>Belum ada data tren untuk ditampilkan.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData} margin={{ top: 5, right: 8, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8FA4C8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#8FA4C8" }} axisLine={false} tickLine={false} tickFormatter={v => formatShortNumber(v)} />
              <Tooltip
                formatter={(v) => [formatCurrency(v), undefined]}
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
              <Line type="monotone" dataKey="Income" stroke="#00C9A7" strokeWidth={2.5} dot={{ r: 4, fill: "#00C9A7" }} name="Pemasukan" />
              <Line type="monotone" dataKey="Expenses" stroke="#FF6B6B" strokeWidth={2.5} dot={{ r: 4, fill: "#FF6B6B" }} name="Pengeluaran" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}