import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Pencil, Trash2, Calendar, Zap, CheckCircle, ChevronRight } from "lucide-react";
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
  const isCompleted = goal.status === "completed";

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <Link to={createPageUrl(`Goals?id=${goal.id}`)} className="block px-4 py-3">
        {/* Top row: icon + name + % + chevron */}
        <div className="flex items-center gap-3 mb-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
            style={{ backgroundColor: `${color}20` }}
          >
            {goal.icon || "💰"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-[#1A1A1A] text-sm truncate">{goal.name}</p>
              {isCompleted && <CheckCircle className="w-3.5 h-3.5 text-[#00C9A7] flex-shrink-0" />}
            </div>
            <p className="text-xs text-[#8FA4C8] truncate">
              {formatCurrency(goal.current_amount || 0)} / {formatCurrency(goal.target_amount)}
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-sm font-bold" style={{ color }}>{progress.toFixed(0)}%</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E0]" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-[#F2F4F7] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: color }}
          />
        </div>

        {/* Bottom meta: deadline + suggestion */}
        {(daysLeft !== null || suggestedMonthly) && (
          <div className="flex items-center gap-3 mt-2">
            {daysLeft !== null && (
              <div className={`flex items-center gap-1 text-[10px] ${isUrgent && !isCompleted ? "text-[#FF6B6B]" : "text-[#8FA4C8]"}`}>
                <Calendar className="w-3 h-3" />
                {daysLeft >= 0 ? `${daysLeft} hari lagi` : "Terlewat"}
              </div>
            )}
            {suggestedMonthly && !isCompleted && (
              <div className={`flex items-center gap-1 text-[10px] ${isUrgent ? "text-[#FF6B6B]" : "text-[#8FA4C8]"}`}>
                <Zap className="w-3 h-3" />
                {formatCurrency(suggestedMonthly)}/bln
              </div>
            )}
          </div>
        )}
      </Link>

      {/* Actions — compact icon buttons */}
      <div className="flex border-t border-[#F2F4F7]">
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(goal); }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-[#8FA4C8] hover:text-[#4F7CFF] hover:bg-[#F8FAFC] transition-colors tap-highlight-fix"
        >
          <Pencil className="w-3.5 h-3.5" /> {t('edit')}
        </button>
        <div className="w-px bg-[#F2F4F7]" />
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(goal.id); }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-[#8FA4C8] hover:text-red-500 hover:bg-red-50 transition-colors tap-highlight-fix"
        >
          <Trash2 className="w-3.5 h-3.5" /> {t('goals_delete')}
        </button>
      </div>
    </div>
  );
}