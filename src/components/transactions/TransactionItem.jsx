import { useState, useRef } from "react";
import { Pencil, Trash2, Repeat2 } from "lucide-react";

export default function TransactionItem({ tx, cat, accountName, onTap, onEdit, onDelete, formatCurrency }) {
  const [swipeX, setSwipeX] = useState(0);
  const startX = useRef(null);
  const startY = useRef(null);
  const isScrolling = useRef(false);

  const isIncome = tx.type === "income";
  const amountColor = isIncome ? "#16A34A" : tx.type === "savings" ? "#3B82F6" : "#EF4444";
  const amountPrefix = isIncome ? "+" : "−";
  const REVEAL_WIDTH = 96;

  function onTouchStart(e) {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isScrolling.current = false;
  }

  function onTouchMove(e) {
    if (startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    // Detect vertical scroll intent
    if (!isScrolling.current && Math.abs(dy) > Math.abs(dx)) {
      isScrolling.current = true;
      return;
    }
    if (isScrolling.current) return;

    if (dx < 0) {
      e.preventDefault();
      setSwipeX(Math.max(dx, -REVEAL_WIDTH));
    } else if (swipeX < 0) {
      e.preventDefault();
      setSwipeX(Math.min(0, swipeX + dx));
    }
  }

  function onTouchEnd() {
    if (isScrolling.current) { startX.current = null; return; }
    setSwipeX(swipeX < -REVEAL_WIDTH / 2 ? -REVEAL_WIDTH : 0);
    startX.current = null;
  }

  function handleTap() {
    if (swipeX !== 0) { setSwipeX(0); return; }
    onTap();
  }

  return (
    <div className="relative overflow-hidden">
      {/* Revealed action buttons */}
      <div className="absolute right-0 top-0 bottom-0 flex" style={{ width: REVEAL_WIDTH }}>
        <button
          onClick={() => { setSwipeX(0); onEdit(); }}
          className="w-12 h-full flex items-center justify-center bg-[#F97316] tap-highlight-fix"
        >
          <Pencil className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => { setSwipeX(0); onDelete(); }}
          className="w-12 h-full flex items-center justify-center bg-[#EF4444] tap-highlight-fix"
        >
          <Trash2 className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Main row */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 bg-white cursor-pointer active:bg-[#F8FAFC] tap-highlight-fix"
        style={{ transform: `translateX(${swipeX}px)`, transition: swipeX === 0 || swipeX === -REVEAL_WIDTH ? "transform 0.2s ease" : "none" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={handleTap}
      >
        {/* Category circle */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: (cat?.color || "#888") + "20" }}
        >
          {cat?.emoji || "📦"}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-[#1A1A1A] truncate">{cat?.label || tx.category}</p>
            {(tx.is_recurring || tx.is_recurring_child) && (
              <Repeat2 className="w-3 h-3 text-[#F97316] flex-shrink-0" />
            )}
          </div>
          {tx.note && <p className="text-[11px] text-[#8FA4C8] truncate mt-0.5">{tx.note}</p>}
          {accountName && <p className="text-[10px] text-[#B0BEC5] mt-0.5">{accountName}</p>}
        </div>

        {/* Amount + desktop actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-bold" style={{ color: amountColor }}>
            {amountPrefix}{formatCurrency(tx.amount)}
          </span>
          <div className="hidden sm:flex items-center gap-0.5">
            <button onClick={e => { e.stopPropagation(); onEdit(); }} className="p-1.5 text-[#CBD5E0] hover:text-[#F97316] tap-highlight-fix">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={e => { e.stopPropagation(); onDelete(); }} className="p-1.5 text-[#CBD5E0] hover:text-[#EF4444] tap-highlight-fix">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}