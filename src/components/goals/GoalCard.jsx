import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Pencil, Trash2, Calendar, Zap, CheckCircle } from "lucide-react";
import { useAppSettings } from "@/components/utils/useAppSettings";

const COLORS = {
  blue: "#4F7CFF",
  green: "#34C87A",
  orange: "#F5A623",
  purple: "#9B59B6",
  pink: "#E91E8C",
  teal: "#1ABC9C",
};

export default function GoalCard({ goal, onEdit, onDelete }) {
  const { formatCurrency, t } = useAppSettings();
  const progress = goal.target_amount > 0
    ? Math.min(((goal.current_amount || 0) / goal.target_amount) * 100, 100)
    : 0;

  const color = COLORS[goal.color] || COLORS.blue;
  const remaining = Math.max(goal.target_amount - (goal.current_amount || 0), 0);

  const daysLeft = goal.deadline
    ? Math.max(Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)), 0)
    : null;
  const isUrgent = daysLeft !== null && daysLeft < 30;
  const months = daysLeft ? Math.max(daysLeft / 30, 0.5) : null;
  const suggestedMonthly = months && remaining > 0 ? Math.ceil(remaining / months) : null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
      <Link to={createPageUrl(`Goals?id=${goal.id}`)} className="block">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: `${color}20` }}>
              {goal.icon || "💰"}
            </div>
            <div>
              <p className="font-semibold text-[#1A1A1A] text-sm">{goal.name}</p>
              {goal.description && <p className="text-xs text-[#8FA4C8] mt-0.5">{goal.description}</p>}
            </div>
          </div>
          {goal.status === "completed" && <CheckCircle className="w-5 h-5 text-[#00C9A7]" />}
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-[#4A5568] font-medium">{formatCurrency(goal.current_amount || 0)} dari {formatCurrency(goal.target_amount)}</span>
            <span className="font-bold" style={{ color }}>{progress.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-[#F2F4F7] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: color }} />
          </div>
        </div>

        <div className="flex gap-3 text-xs">
          {daysLeft !== null && (
            <div className="flex items-center gap-1 text-[#8FA4C8]">
              <Calendar className="w-3.5 h-3.5" />
              {daysLeft >= 0 ? `${daysLeft} ${t('goals_days_left')}` : t('goals_expired')}
            </div>
          )}
          {suggestedMonthly && (
            <div className={`flex items-center gap-1 ${isUrgent ? "text-[#FF6B6B]" : "text-[#8FA4C8]"}`}>
              <Zap className="w-3.5 h-3.5" />
              {formatCurrency(suggestedMonthly)}/bln
            </div>
          )}
        </div>
      </Link>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(goal); }}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold bg-[#F2F4F7] text-[#1A1A1A] hover:bg-[#E2E8F0] transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" /> {t('edit')}
        </button>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(goal.id); }}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> {t('goals_delete')}
        </button>
      </div>
    </div>
  );
}