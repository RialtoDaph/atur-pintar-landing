import { X, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";

export default function NanaHistoryPanel({ conversations, activeId, onSelect, onClose }) {
  useLockBodyScroll();
  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center sm:justify-center bg-black/50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full sm:max-w-md bg-white dark:bg-[#1A1E25] rounded-t-2xl sm:rounded-2xl border border-[#E2E8F0] dark:border-[#2D2D2D] shadow-xl max-h-[70vh] flex flex-col animate-slide-up-sheet overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] dark:border-[#2D2D2D] flex-shrink-0">
          <p className="text-sm font-bold text-[#1A1A1A] dark:text-white">Riwayat Obrolan</p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#F2F4F7] dark:hover:bg-[#2D2D2D] flex items-center justify-center tap-highlight-fix"
          >
            <X className="w-4 h-4 text-[#1A1A1A] dark:text-white" />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain p-2">
          {conversations.length === 0 ? (
            <p className="text-xs text-[#8FA4C8] text-center py-8">Belum ada riwayat obrolan</p>
          ) : (
            conversations.map((c) => {
              const isActive = c.id === activeId;
              const dateStr = c.created_date ? format(new Date(c.created_date), "d MMM yyyy") : "";
              return (
                <button
                  key={c.id}
                  onClick={() => onSelect(c)}
                  className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl mb-1 transition-colors tap-highlight-fix ${
                    isActive
                      ? "bg-[#FF6A00]/10 border border-[#FF6A00]/30"
                      : "hover:bg-[#F2F4F7] dark:hover:bg-[#2D2D2D] border border-transparent"
                  }`}
                >
                  <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isActive ? "text-[#FF6A00]" : "text-[#8FA4C8]"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-[#1A1A1A] dark:text-white truncate">
                      {c.metadata?.name || "Obrolan"}
                    </p>
                    {dateStr && <p className="text-[11px] text-[#8FA4C8] mt-0.5">{dateStr}</p>}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}