import { useState } from "react";
import FeedbackReportModal from "@/components/feedback/FeedbackReportModal";

/**
 * Floating Beta Feedback launcher — bottom-right, sits ABOVE BossBattleFloating.
 * Symmetric with Boss icon (same text-5xl size, aligned vertically).
 * Mobile: bottom = 174px (boss 110px + 64px offset)
 * Desktop: bottom = 88px (boss 24px + 64px offset)
 */
export default function FloatingFeedback({ user }) {
  const [open, setOpen] = useState(false);

  if (!user?.onboarding_completed) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Beta feedback & lapor masalah"
        className="fixed z-[70] right-4 sm:right-6 flex items-center justify-center active:scale-90 transition-transform sm:bottom-[88px]"
        style={{
          bottom: "calc(174px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <span className="relative">
          <span className="text-5xl drop-shadow-lg" aria-hidden="true">💬</span>
          <span className="absolute -top-1 -right-1 text-[8px] font-bold text-white bg-[#F97316] rounded px-1 py-0.5 leading-none uppercase tracking-wider shadow-md">
            Beta
          </span>
        </span>
      </button>

      {open && <FeedbackReportModal user={user} onClose={() => setOpen(false)} />}
    </>
  );
}