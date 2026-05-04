import { Target, ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAppSettings } from "@/components/utils/useAppSettings";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function GoalsProgressWidget({ goals = [], loading = false }) {
  const { formatCurrency } = useAppSettings();

  if (loading) {
    return <div className="bg-white rounded-2xl shadow-sm h-24 animate-pulse" />;
  }

  const activeGoals = goals
    .filter(g => g.status !== "paused")
    .map(g => {
      const percent = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0;
      return { ...g, percent: Math.min(percent, 999) };
    })
    .sort((a, b) => b.percent - a.percent);

  const totalTarget = activeGoals.reduce((s, g) => s + (g.target_amount || 0), 0);
  const totalSaved = activeGoals.reduce((s, g) => s + (g.current_amount || 0), 0);
  const overallPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#FF6A00]" />
          <h2 className="font-bold text-[#0A0A0A] text-sm">Tujuan Tabungan</h2>
          {activeGoals.length > 0 && (
            <span className="text-[10px] font-bold text-[#FF6A00] bg-[#FF6A00]/10 px-1.5 py-0.5 rounded-full">
              {overallPercent}%
            </span>
          )}
        </div>
        <Link to={createPageUrl("Goals")} className="text-xs text-[#FF6A00] font-semibold flex items-center gap-0.5">
          Lihat semua <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {activeGoals.length === 0 ? (
        <Link to={createPageUrl("Goals")} className="flex items-center gap-3 px-4 pb-4">
          <div className="w-10 h-10 rounded-full bg-[#F2F4F7] flex items-center justify-center text-lg text-[#8FA4C8]">
            <Plus className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-[#1A1A1A]">Belum ada tujuan</p>
            <p className="text-[11px] text-[#8FA4C8]">Mulai bikin target tabungan</p>
          </div>
        </Link>
      ) : (
        <div className="px-4 pb-4 flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {activeGoals.map(g => {
            const completed = g.percent >= 100;
            const ringColor = completed ? "#00C9A7" : g.percent >= 60 ? "#F5A623" : "#FF6A00";
            const pieData = [
              { value: Math.min(g.percent, 100), color: ringColor },
              { value: Math.max(0, 100 - g.percent), color: "transparent" }
            ];
            return (
              <Link
                key={g.id}
                to={createPageUrl("Goals")}
                className="flex flex-col items-center flex-shrink-0 cursor-pointer group w-16"
              >
                <div className="relative w-12 h-12 mb-1.5">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={16} outerRadius={24} startAngle={90} endAngle={-270} stroke="none">
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <span className="absolute inset-0 flex items-center justify-center text-lg">
                    {g.icon || "🎯"}
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-[#1A1A1A] text-center truncate w-full">{g.name}</p>
                <p className="text-[9px] text-[#8FA4C8] text-center">{Math.round(g.percent)}%</p>
              </Link>
            );
          })}
          <Link
            to={createPageUrl("Goals")}
            className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-[#F2F4F7] group-hover:bg-[#E8EEF7] transition-colors flex items-center justify-center text-lg text-[#8FA4C8] mb-1.5">
              +
            </div>
            <p className="text-[10px] font-semibold text-[#8FA4C8]">Tambah</p>
          </Link>
        </div>
      )}

      {activeGoals.length > 0 && (
        <div className="px-4 pb-3 -mt-1 flex items-center justify-between text-[11px]">
          <span className="text-[#8FA4C8]">Terkumpul</span>
          <span className="font-bold text-[#1A1A1A]">{formatCurrency(totalSaved)} / {formatCurrency(totalTarget)}</span>
        </div>
      )}
    </div>
  );
}