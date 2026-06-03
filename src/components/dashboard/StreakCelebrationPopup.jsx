import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";

function StreakInner({ message, streak, onClose }) {
  useLockBodyScroll();
  useEffect(() => {
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors: ["#F97316", "#FFB347", "#FFF"] });
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ scale: 0.5, y: 60, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 14, stiffness: 200 }}
        className="bg-white rounded-3xl px-8 py-8 flex flex-col items-center gap-4 shadow-2xl mx-6 max-w-xs w-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Nana Avatar */}
        <motion.div
          animate={{ rotate: [-8, 8, -8, 8, 0] }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#F97316] shadow-lg"
        >
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a82e8090f60786b869983c/7708b64f5_generated_image.png"
            alt="Nana"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Streak number */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center gap-2">
            <span className="text-4xl font-black text-[#F97316]">{streak}</span>
            <span className="text-3xl">🔥</span>
          </div>
          <p className="text-sm font-bold text-[#8FA4C8] mt-0.5">HARI BERTURUT-TURUT</p>
        </motion.div>

        <p className="text-center text-sm font-semibold text-[#1A1A1A] leading-snug">{message}</p>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="w-full py-3 rounded-2xl font-bold text-white text-sm"
          style={{ background: "#F97316" }}
        >
          Lanjutkan! 💪
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default function StreakCelebrationPopup({ show, message, streak, onClose }) {
  return (
    <AnimatePresence>
      {show && <StreakInner message={message} streak={streak} onClose={onClose} />}
    </AnimatePresence>
  );
}