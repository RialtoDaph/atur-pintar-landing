import { useState, useRef } from "react";
import { Pencil, Trash2, Repeat2 } from "lucide-react";

export default function TxItem({ tx, cat, accountName, onEdit, onDelete, onTap, formatCurrency }) {
  const [swipeX, setSwipeX] = useState(0);
  const startX = useRef(null);
  const isSwiping = useRef(false);

  const isIncome = tx.type === "income";
  const amountColor = isIncome ? "#22C55E" : tx.type === "savings" ? "#3B82F6" : "#EF4444";
  const amountPrefix = isIncome ? "+" : "−";

  function onTouchStart(e) {
    startX.current = e.touches[0].clientX;
    isSwiping.current = false;
  }

  function onTouchMove(e) {
    if (startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    if (Math.abs(dx) > 5) isSwiping.current = true;
    if (dx < 0) {
      setSwipeX(Math.max(dx, -96));
    } else if (swipeX < 0) {
      setSwipeX(Math.min(0, swipeX + dx));
    }
  }

  function onTouchEnd() {
    if (swipeX < -48) {
      setSwipeX(-96);
    } else {
      setSwipeX(0);
    }
    startX.current = null;
  }

  function handleTap() {
    if (isSwiping.current) return;
    if (swipeX !== 0) { setSwipeX(0); return; }
    onTap?.();
  }

  const bgColor = "#262C35";

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons behind */}
      <div className="absolute right-0 top-0 bottom-0 flex" style={{ width: 96 }}>
        <button
          onClick={() => { setSwipeX(0); onEdit(); }}
          className="w-12 h-full flex items-center justify-center tap-highlight-fix"
          style={{ backgroundColor: "#F97316" }}
        >
          <Pencil className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => { setSwipeX(0); onDelete(); }}
          className="w-12 h-full flex items-center justify-center tap-highlight-fix"
          style={{ backgroundColor: "#EF4444" }}
        >
          <Trash2 className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Main row */}
      <div
        className="flex items-center gap-3 px-4 py-3 transition-transform duration-150 active:brightness-90"
        style={{ backgroundColor: bgColor, transform: `translateX(${swipeX}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={handleTap}
      >
        {/* Category circle */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: (cat?.color || "#F97316") + "25" }}
        >
          {cat?.emoji || "📦"}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-white truncate">{cat?.name || cat?.label || tx.category}</p>
            {(tx.is_recurring || tx.is_recurring_child) && (
              <Repeat2 className="w-3 h-3 text-[#F97316] flex-shrink-0" />
            )}
          </div>
          {tx.note && (
            <p className="text-xs text-white/50 truncate mt-0.5">{tx.note}</p>
          )}
          {accountName && (
            <p className="text-xs text-white/30 truncate mt-0.5">{accountName}</p>
          )}
        </div>

        {/* Amount */}
        <div className="flex-shrink-0 text-right">
          <p className="text-sm font-bold" style={{ color: amountColor }}>
            {amountPrefix}{formatCurrency(tx.amount)}
          </p>
          {tx.time && (
            <p className="text-[10px] text-white/30 mt-0.5">{tx.time}</p>
          )}
        </div>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-0.5 ml-1">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 text-white/30 hover:text-[#F97316] tap-highlight-fix transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 text-white/30 hover:text-[#EF4444] tap-highlight-fix transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}