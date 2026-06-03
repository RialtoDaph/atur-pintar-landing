import { X } from "lucide-react";
import { Drawer } from "vaul";

export default function BottomSheetSelect({ isOpen, onClose, title, options, onSelect, selectedValue }) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={onClose}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl bg-white max-h-[85vh] sm:max-w-md sm:rounded-2xl sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 overscroll-contain">
          <div className="flex-shrink-0 mx-auto w-12 h-1 bg-gray-300 rounded-full mt-3 mb-4" />
          
          <div className="flex items-center justify-between px-6 pb-4 border-b border-[#E2E8F0]">
            <h3 className="text-lg font-bold text-[#1A1A1A]">{title}</h3>
            <button
              onClick={onClose}
              className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-6 space-y-2">
            {options.map((option) => (
              <button
                key={option.key}
                onClick={() => {
                  onSelect(option.key);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                  selectedValue === option.key
                    ? "border-[#F97316] bg-[#F97316]/10"
                    : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E0]"
                }`}
              >
                {option.emoji && <span className="text-xl flex-shrink-0">{option.emoji}</span>}
                <div className="flex-1">
                  <p className="font-semibold text-[#1A1A1A] text-sm">{option.label}</p>
                  {option.description && (
                    <p className="text-xs text-[#8FA4C8] mt-0.5">{option.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}