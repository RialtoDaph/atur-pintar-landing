import { useState } from "react";
import FeedbackModal from "@/components/settings/FeedbackModal";

/**
 * Floating Beta Feedback launcher — bottom-right, sits ABOVE BossBattleFloating.
 * Mobile: above the bottom nav + above boss icon (110px + 56px breathing).
 * Desktop: pinned bottom-right above boss icon.
 * Reuses existing FeedbackModal (no business logic change).
 */
export default function FloatingFeedback({ user }) {
  const [open, setOpen] = useState(false);

  if (!user?.onboarding_completed) return null;

  return (
    <>
      {/* Floating trigger — chat bubble emoji.
          Mobile: bottom = boss(110px) + 60px = 170px above safe-area
          Desktop: bottom = boss(24px) + 60px = ~84px from bottom */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Kasih feedback beta"
        className="fixed z-[70] right-4 sm:right-6 flex items-center justify-center active:scale-90 transition-transform sm:bottom-[84px]"
        style={{
          bottom: "calc(170px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <span className="relative">
          <span className="text-4xl drop-shadow-lg" aria-hidden="true">💬</span>
          <span className="absolute -top-1 -right-1 text-[8px] font-bold text-white bg-[#F97316] rounded px-1 py-0.5 leading-none uppercase tracking-wider shadow-md">
            Beta
          </span>
        </span>
      </button>

      {open && <FeedbackModal user={user} onClose={() => setOpen(false)} />}
    </>
  );
}