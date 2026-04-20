import { useState, useRef } from "react";
import { Pencil, Trash2, Repeat2 } from "lucide-react";

export default function TransactionItem({ tx, cat, accountName, onTap, onEdit, onDelete, formatCurrency }) {
  const [swipeX, setSwipeX] = useState(0);
  const startX = useRef(null);
  const startY = useRef(null);
  const isSwipingRef = useRef(false);

  const isIncome = tx.type === "income";
  const isSavings = tx.type === "savings";
  const amountColor = isIncome ? "#16A34A" : isSavings ? "#3B82F6" : "#DC2626";
  const amountPrefix = isIncome ? "+" : isSavings ? "" : "−";

  function onTouchStart(e) {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isSwipingRef.current = false;
  }

  function onTouchMove(e) {
    if (startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = Math.abs(e.touches[0].clientY - startY.current);
    // Only horizontal swipe, ignore scroll
    if (!isSwipingRef.current && dy > 8) { startX.current = null; return; }
    if (Math.abs(dx) > 5) isSwipingRef.current = true;
    if (dx < 0) {
      e.preventDefault();
      setSwipeX(Math.max(dx, -96));
    } else if (swipeX < 0) {
      e.preventDefault();
      setSwipeX(Math.min(0, swipeX + dx));
    }
  }

  function onTouchEnd() {
    if (swipeX < -48) setSwipeX(-96);
    else setSwipeX(0);
    startX.current = null;
  }

  function handleTap() {
    if (swipeX !== 0) { setSwipeX(0); return; }
    onTap();
  }

  return (
    <div className="relative overflow-hidden">
      {/* Swipe actions */}
      <div className="absolute right-0 top-0 bottom-0 flex" style={{ width: 96 }}>
        <button
          onClick={() => { setSwipeX(0); onEdit(); }}
          className="w-12 h-full flex flex-col items-center justify-center gap-1 bg-[#FF8C00] tap-highlight-fix"
        >
          <Pencil className="w-4 h-4 text-white" />
          <span className="text-[9px] text-white font-semibold">Edit</span>
        </button>
        <button
          onClick={() => { setSwipeX(0); onDelete(); }}
          className="w-12 h-full flex flex-col items-center justify-center gap-1 bg-[#EF4444] tap-highlight-fix"
        >
          <Trash2 className="w-4 h-4 text-white" />
          <span className="text-[9px] text-white font-semibold">Hapus</span>
        </button>
      </div>

      {/* Main row */}
      <div
        className="flex items-center gap-3 px-4 py-3 bg-white transition-transform duration-150 cursor-pointer active:bg-[#F8FAFC]"
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={handleTap}
      >
        {/* Category circle */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: (cat.color || "#888") + "22" }}
        >
          {cat.emoji || "📦"}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-[13px] font-semibold text-[#1A1A1A] truncate">{cat.label}</p>
            {(tx.is_recurring || tx.is_recurring_child) && (
              <Repeat2 className="w-3 h-3 text-[#F97316] flex-shrink-0" />
            )}
          </div>
          {tx.note && (
            <p className="text-[11px] text-[#8FA4C8] truncate mt-0.5">{tx.note}</p>
          )}
          {accountName && (
            <p className="text-[10px] text-[#CBD5E0] truncate mt-0.5">💳 {accountName}</p>
          )}
        </div>

        {/* Amount + time */}
        <div className="flex-shrink-0 text-right">
          <p className="text-[13px] font-bold" style={{ color: amountColor }}>
            {amountPrefix}{formatCurrency(tx.amount)}
          </p>
          {tx.time && (
            <p className="text-[10px] text-[#CBD5E0] mt-0.5">{tx.time}</p>
          )}
        </div>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-0.5 ml-1">
          <button onClick={e => { e.stopPropagation(); onEdit(); }} className="text-[#CBD5E0] hover:text-[#F97316] p-1.5 tap-highlight-fix">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }} className="text-[#CBD5E0] hover:text-[#EF4444] p-1.5 tap-highlight-fix">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}