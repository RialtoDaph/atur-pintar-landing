import { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * CollapsibleSection — wraps heavy admin sections (WaitingList, StreakManager)
 * with a tappable header that expands/collapses content. Default collapsed on mobile.
 */
export default function CollapsibleSection({ title, subtitle, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F8FAFC] transition-colors text-left"
      >
        <div>
          <p className="font-semibold text-[#1A1A1A] text-sm">{title}</p>
          {subtitle && <p className="text-xs text-[#8FA4C8] mt-0.5">{subtitle}</p>}
        </div>
        <ChevronDown className={`w-4 h-4 text-[#8FA4C8] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-[#F2F4F7]">{children}</div>}
    </div>
  );
}