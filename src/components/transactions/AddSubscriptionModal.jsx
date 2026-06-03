import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const ICON_OPTIONS = ["💳", "🎬", "🎵", "📺", "📰", "☁️", "🎮", "📱", "🛒", "🏋️", "📚", "⭐"];
const CYCLE_OPTIONS = [
  { value: "monthly", label: "Bulanan" },
  { value: "quarterly", label: "Triwulan" },
  { value: "yearly", label: "Tahunan" },
];

export default function AddSubscriptionModal({ onClose, onSaved }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [icon, setIcon] = useState("💳");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [nextDueDate, setNextDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) { toast.error("Nama langganan wajib diisi"); return; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error("Nominal harus lebih dari 0"); return; }
    setSaving(true);
    try {
      await base44.entities.Subscription.create({
        name: name.trim(),
        amount: amt,
        icon,
        billing_cycle: billingCycle,
        next_due_date: nextDueDate,
        status: "active",
      });
      toast.success("Langganan ditambahkan");
      onSaved?.();
      onClose();
    } catch (e) {
      toast.error("Gagal menyimpan langganan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-end sm:items-center sm:justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative w-full sm:max-w-md bg-[#1A1E25] rounded-t-2xl sm:rounded-2xl z-10 pb-8 sm:pb-5"
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
        >
          {/* Handle (mobile) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-3 pb-2">
            <p className="text-white font-semibold text-base">Tambah Langganan</p>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white tap-highlight-fix">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-5 pt-2 space-y-4">
            {/* Icon picker */}
            <div>
              <p className="text-[11px] text-[#8FA4C8] mb-2">Ikon</p>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((emo) => (
                  <button
                    key={emo}
                    onClick={() => setIcon(emo)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center tap-highlight-fix transition-all ${
                      icon === emo ? "bg-[#F97316] ring-2 ring-[#F97316]/40" : "bg-white/10"
                    }`}
                  >
                    {emo}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <p className="text-[11px] text-[#8FA4C8] mb-1.5">Nama langganan</p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Netflix, Spotify"
                className="w-full bg-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[#F97316]/40"
              />
            </div>

            {/* Amount */}
            <div>
              <p className="text-[11px] text-[#8FA4C8] mb-1.5">Nominal (Rp)</p>
              <input
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[#F97316]/40"
              />
            </div>

            {/* Billing cycle */}
            <div>
              <p className="text-[11px] text-[#8FA4C8] mb-1.5">Siklus</p>
              <div className="grid grid-cols-3 gap-2">
                {CYCLE_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setBillingCycle(c.value)}
                    className={`py-2.5 rounded-xl text-xs font-semibold tap-highlight-fix transition-all ${
                      billingCycle === c.value ? "bg-[#F97316] text-white" : "bg-white/10 text-[#8FA4C8]"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Next due date */}
            <div>
              <p className="text-[11px] text-[#8FA4C8] mb-1.5">Jatuh tempo berikutnya</p>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full bg-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#F97316]/40"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-white/20 text-white text-sm font-semibold tap-highlight-fix"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-[#F97316] text-white text-sm font-semibold tap-highlight-fix disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}