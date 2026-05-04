import { X } from "lucide-react";
import NanaPreferencesSettings from "@/components/settings/NanaPreferencesSettings";

export default function NanaPreferencesModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center sm:justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full sm:max-w-lg bg-[#F2F4F7] dark:bg-[#0F1114] rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[85vh] flex flex-col animate-slide-up-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2E8F0] dark:border-[#2D2D2D] bg-white dark:bg-[#1A1E25] rounded-t-2xl flex-shrink-0">
          <div>
            <p className="text-base font-bold text-[#1A1A1A] dark:text-white">Preferensi Nana AI</p>
            <p className="text-xs text-[#8FA4C8]">Sesuaikan cara Nana berbicara ke kamu</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#F2F4F7] dark:hover:bg-[#2D2D2D] flex items-center justify-center tap-highlight-fix"
          >
            <X className="w-4 h-4 text-[#1A1A1A] dark:text-white" />
          </button>
        </div>
        <div className="overflow-y-auto p-4">
          <NanaPreferencesSettings />
        </div>
      </div>
    </div>
  );
}