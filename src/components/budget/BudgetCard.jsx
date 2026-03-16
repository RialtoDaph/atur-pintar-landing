import { Pencil, Trash2, AlertTriangle } from "lucide-react";
import { useAppSettings } from "@/components/utils/useAppSettings";

export default function BudgetCard({ budget, categoryMeta, spent, onEdit, onDelete }) {
  const { t, formatCurrency } = useAppSettings();
  const rawPercent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
  const percent = Math.min(rawPercent, 100);
  const isOver = spent > budget.amount;
  const isCritical = !isOver && rawPercent >= 85;
  const isNear = !isOver && !isCritical && rawPercent >= 70;

  const borderColor = isOver ? "border-[#FF6B6B]/30" : isCritical ? "border-[#F5A623]/30" : isNear ? "border-yellow-200" : "border-transparent";
  const barColor = isOver ? "#FF6B6B" : isCritical ? "#F5A623" : isNear ? "#FFB347" : (categoryMeta.color || "#4F7CFF");

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border ${borderColor}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
            style={{ backgroundColor: (categoryMeta.color || "#95A5A6") + "20" }}
          >
            {categoryMeta.emoji}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-[#1A1A1A]">{categoryMeta.label}</p>
              {(isOver || isCritical) && (
                <AlertTriangle className="w-3.5 h-3.5" style={{ color: isOver ? "#FF6B6B" : "#F5A623" }} />
              )}
            </div>
            <p className="text-xs text-[#8FA4C8]">
              {formatCurrency(spent)} / {formatCurrency(budget.amount)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${isOver ? "text-[#FF6B6B]" : isCritical ? "text-[#F5A623]" : "text-[#1A1A1A]"}`}>
            {Math.round(rawPercent)}%
          </span>
          <button
            onClick={() => onEdit(budget)}
            className="text-[#CBD5E0] hover:text-[#FF6A00] transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            className="text-[#CBD5E0] hover:text-[#FF6B6B] transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="w-full bg-[#F2F4F7] rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${percent}%`, backgroundColor: barColor }}
        />
      </div>

      {isOver && (
        <p className="text-xs text-[#FF6B6B] mt-1.5 font-semibold">
          ⚠️ {t("budget_over")} {formatCurrency(spent - budget.amount)}
        </p>
      )}
      {isCritical && !isOver && (
        <p className="text-xs text-[#F5A623] mt-1.5 font-medium">
          🔔 Sisa {formatCurrency(budget.amount - spent)} — hampir habis!
        </p>
      )}
      {isNear && !isOver && !isCritical && (
        <p className="text-xs text-yellow-600 mt-1.5 font-medium">
          💡 Sisa {formatCurrency(budget.amount - spent)} — hemat bijak
        </p>
      )}
    </div>
  );
}