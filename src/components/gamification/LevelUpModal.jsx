import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";

function LevelUpInner({ levelData, onClose }) {
  useLockBodyScroll();
  useEffect(() => {
    if (!levelData) return;
    const end = Date.now() + 2000;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#FF6B35", "#FFD700", "#FF9A5C"] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#FF6B35", "#FFD700", "#FF9A5C"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    setTimeout(frame, 200);
  }, [levelData]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.6, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="bg-white rounded-3xl p-8 max-w-xs w-full text-center shadow-2xl"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-6xl mb-4"
        >
          🏆
        </motion.div>
        <p className="text-xs font-bold text-[#FF6B35] uppercase tracking-widest mb-1">⬆️ LEVEL UP!</p>
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">Level {levelData.level}</h2>
        <p className="text-[#4A5568] text-sm font-semibold mb-3">{levelData.name} 🎉</p>
        {levelData.unlocks && (
          <div className="bg-[#FFF7ED] rounded-2xl px-4 py-3 mb-6">
            <p className="text-xs text-[#FF6B35] font-semibold">{levelData.unlocks}</p>
          </div>
        )}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-[#FF6B35] text-white font-bold text-sm shadow-lg shadow-[#FF6B35]/30 active:scale-95 transition-all"
        >
          Keren! →
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function LevelUpModal({ levelData, onClose }) {
  return (
    <AnimatePresence>
      {levelData && <LevelUpInner levelData={levelData} onClose={onClose} />}
    </AnimatePresence>
  );
}