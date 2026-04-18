import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ChevronRight } from "lucide-react";
import { addDays, format } from "date-fns";

const CHALLENGE_TEMPLATES = [
  {
    challenge_key: "7_hari_catat",
    title: "7 Hari Catat Semua",
    icon: "📝",
    description: "Catat SEMUA pengeluaran selama 7 hari tanpa skip",
    duration_days: 7,
    xp_reward: 150,
  },
  {
    challenge_key: "no_impulsif_7",
    title: "Minggu Tanpa Jajan Impulsif",
    icon: "🛍️",
    description: "Tidak ada pembelian impulsif selama 7 hari — hanya yang direncanakan",
    duration_days: 7,
    xp_reward: 200,
  },
  {
    challenge_key: "nabung_30_hari",
    title: "30 Hari Nabung Harian",
    icon: "🐷",
    description: "Sisihkan minimal Rp 10rb setiap hari selama 30 hari",
    duration_days: 30,
    xp_reward: 500,
  },
  {
    challenge_key: "audit_langganan",
    title: "Audit Langganan",
    icon: "✂️",
    description: "Cancel minimal 1 langganan yang tidak terpakai minggu ini",
    duration_days: 7,
    xp_reward: 100,
  },
];

export default function ChallengeSection({ user, gamificationProfile, onProfileUpdate, showHistory = false }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [completionModal, setCompletionModal] = useState(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!user?.email) return;
    loadChallenges();
  }, [user?.email]);

  async function loadChallenges() {
    setLoading(true);
    const all = await base44.entities.Challenge.filter({ created_by: user.email }).catch(() => []);
    // Check and expire challenges
    const updated = await Promise.all((all || []).map(async (c) => {
      if (c.status === "active" && c.end_date < today) {
        await base44.entities.Challenge.update(c.id, { status: "failed" });
        return { ...c, status: "failed" };
      }
      return c;
    }));
    setChallenges(updated);
    setLoading(false);
  }

  async function startChallenge(template) {
    const startDate = today;
    const endDate = format(addDays(new Date(), template.duration_days), "yyyy-MM-dd");
    const existing = challenges.find(c => c.challenge_key === template.challenge_key && c.status === "active");
    if (existing) { setShowPicker(false); return; }

    const created = await base44.entities.Challenge.create({
      challenge_key: template.challenge_key,
      title: template.title,
      icon: template.icon,
      description: template.description,
      start_date: startDate,
      end_date: endDate,
      duration_days: template.duration_days,
      status: "active",
      progress: 0,
      progress_days: 0,
      xp_reward: template.xp_reward,
    });
    setChallenges(prev => [...prev, created]);
    setShowPicker(false);
  }

  async function claimReward(challenge) {
    await base44.entities.Challenge.update(challenge.id, { status: "completed" });
    setChallenges(prev => prev.map(c => c.id === challenge.id ? { ...c, status: "completed" } : c));

    if (gamificationProfile) {
      const newXP = (gamificationProfile.total_points || 0) + (challenge.xp_reward || 0);
      await base44.entities.GamificationProfile.update(gamificationProfile.id, { total_points: newXP });
      if (onProfileUpdate) onProfileUpdate({ ...gamificationProfile, total_points: newXP });
    }
    setCompletionModal(null);
  }

  const active = challenges.filter(c => c.status === "active");
  const completed = challenges.filter(c => c.status === "completed");
  const usedKeys = challenges.filter(c => c.status === "active").map(c => c.challenge_key);
  const available = CHALLENGE_TEMPLATES.filter(t => !usedKeys.includes(t.challenge_key));

  function daysLeft(c) {
    const diff = Math.ceil((new Date(c.end_date) - new Date()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }

  if (loading) return <div className="bg-white rounded-2xl h-36 animate-pulse shadow-sm" />;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#1A1A1A]">Challenge Aktif 🎯</h3>
        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-[#FF6B35] bg-[#FF6B35]/10 px-3 py-1.5 rounded-full hover:bg-[#FF6B35]/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Mulai Baru
        </button>
      </div>

      {/* Active challenges */}
      {active.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
          <p className="text-3xl mb-2">🎯</p>
          <p className="text-sm text-[#8FA4C8]">Belum ada challenge aktif</p>
          <p className="text-xs text-[#CBD5E0] mt-1">Mulai challenge untuk dapat XP bonus!</p>
        </div>
      )}

      {active.map(c => (
        <div key={c.id} className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">{c.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#1A1A1A]">{c.title}</p>
              <p className="text-xs text-[#8FA4C8] mt-0.5 leading-relaxed">{c.description}</p>
              {/* Progress */}
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-[#8FA4C8]">Progress</span>
                  <span className="text-xs font-bold text-[#1A1A1A]">{Math.round(c.progress || 0)}%</span>
                </div>
                <div className="h-2 bg-[#F2F4F7] rounded-full overflow-hidden mb-2">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFD700]"
                    animate={{ width: `${c.progress || 0}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-[#8FA4C8]">Sisa {daysLeft(c)} hari</span>
                  <span className="text-[11px] font-bold text-[#FF6B35]">+{c.xp_reward} XP</span>
                </div>
              </div>
              {/* 100% — claim reward */}
              {(c.progress || 0) >= 100 && (
                <button
                  onClick={() => setCompletionModal(c)}
                  className="mt-2 w-full py-2 rounded-xl bg-[#16A34A] text-white text-xs font-bold hover:bg-[#15803D] transition-colors"
                >
                  Ambil Reward +{c.xp_reward} XP 🎉
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* History */}
      {showHistory && completed.length > 0 && (
        <div>
          <p className="text-xs font-bold text-[#8FA4C8] uppercase tracking-widest mb-2 mt-4">Riwayat Selesai ✅</p>
          <div className="space-y-2">
            {completed.map(c => (
              <div key={c.id} className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3 opacity-70">
                <span className="text-xl">{c.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1A1A1A]">{c.title}</p>
                  <p className="text-xs text-[#16A34A] font-semibold">+{c.xp_reward} XP ✓</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Challenge picker modal */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 p-4"
            onClick={() => setShowPicker(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#1A1A1A]">Pilih Challenge</h3>
                <button onClick={() => setShowPicker(false)} className="w-7 h-7 rounded-full bg-[#F2F4F7] flex items-center justify-center">
                  <X className="w-4 h-4 text-[#4A5568]" />
                </button>
              </div>
              <div className="space-y-3">
                {available.length === 0 && (
                  <p className="text-sm text-[#8FA4C8] text-center py-4">Semua challenge sudah aktif!</p>
                )}
                {available.map(t => (
                  <button
                    key={t.challenge_key}
                    onClick={() => startChallenge(t)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-[#E2E8F0] hover:border-[#FF6B35]/40 hover:bg-[#FFF7ED] transition-all text-left"
                  >
                    <span className="text-2xl flex-shrink-0">{t.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#1A1A1A]">{t.title}</p>
                      <p className="text-xs text-[#8FA4C8] leading-relaxed mt-0.5">{t.description}</p>
                      <p className="text-xs font-bold text-[#FF6B35] mt-1">{t.duration_days} hari · +{t.xp_reward} XP</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#CBD5E0] flex-shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion modal */}
      <AnimatePresence>
        {completionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-xs w-full text-center shadow-2xl"
            >
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-xs font-black text-[#FF6B35] uppercase tracking-widest mb-1">Challenge Selesai!</p>
              <h2 className="text-lg font-bold text-[#1A1A1A] mb-2">{completionModal.title}</h2>
              <p className="text-[#4A5568] text-sm mb-6">+{completionModal.xp_reward} XP earned!</p>
              <button
                onClick={() => claimReward(completionModal)}
                className="w-full py-3.5 rounded-2xl bg-[#FF6B35] text-white font-bold text-sm shadow-lg shadow-[#FF6B35]/30"
              >
                Ambil Reward →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}