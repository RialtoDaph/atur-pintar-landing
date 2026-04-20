import { useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pencil, Trash2, Power, Calendar, Wallet, Tag } from "lucide-react";
import { base44 } from "@/api/base44Client";

function daysLeft(dateStr) {
  if (!dateStr) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
}

// ── Detail / Edit Sheet ──────────────────────────────────────────────────────
function SubDetailSheet({ sub, formatCurrency, onClose, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(sub.name || "");
  const [amount, setAmount] = useState(sub.amount ?? "");
  const [status, setStatus] = useState(sub.status || "active");
  const [saving, setSaving] = useState(false);

  const dueDateLabel = sub.next_due_date
    ? new Date(sub.next_due_date).toLocaleDateString("id-ID", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : "-";

  async function handleSave() {
    setSaving(true);
    await base44.entities.Subscription.update(sub.id, { name, amount: parseFloat(amount) || 0, status });
    setSaving(false);
    onSave();
    onClose();
  }

  async function handleDelete() {
    if (!window.confirm(`Hapus langganan "${sub.name}"?`)) return;
    await base44.entities.Subscription.delete(sub.id);
    onSave();
    onClose();
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-end"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative w-full bg-[#1A1E25] rounded-t-2xl z-10 pb-8"
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          <div className="px-5 pt-3">
            {/* Icon + name hero */}
            <div className="flex flex-col items-center py-5">
              <div className="w-16 h-16 rounded-2xl bg-[#F97316]/20 flex items-center justify-center text-3xl mb-3">
                {sub.icon || "💳"}
              </div>
              {editing ? (
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="text-white font-semibold text-center bg-white/10 rounded-xl px-3 py-1.5 text-sm w-full max-w-xs"
                  placeholder="Nama langganan"
                />
              ) : (
                <p className="text-white font-semibold">{sub.name}</p>
              )}
              {editing ? (
                <div className="mt-2 flex items-center gap-1 text-white">
                  <span className="text-sm">Rp</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="bg-white/10 rounded-xl px-3 py-1.5 text-sm text-white w-32 text-center"
                    placeholder="Nominal"
                  />
                </div>
              ) : (
                <p className="text-2xl font-bold text-white mt-1">{formatCurrency(sub.amount)}</p>
              )}
            </div>

            {/* Detail rows */}
            <div className="bg-white/5 rounded-xl divide-y divide-white/10">
              <Row icon={<Calendar className="w-4 h-4" />} label="Jatuh tempo" value={dueDateLabel} />
              <Row icon={<Tag className="w-4 h-4" />} label="Status" value={
                editing ? (
                  <button
                    onClick={() => setStatus(s => s === "active" ? "paused" : "active")}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      status === "active" ? "bg-[#4ADE80]/20 text-[#4ADE80]" : "bg-[#9CA3AF]/20 text-[#9CA3AF]"
                    }`}
                  >
                    {status === "active" ? "Aktif" : "Dijeda"} (tap untuk ganti)
                  </button>
                ) : (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    sub.status === "active" ? "bg-[#4ADE80]/20 text-[#4ADE80]" : "bg-[#9CA3AF]/20 text-[#9CA3AF]"
                  }`}>
                    {sub.status === "active" ? "Aktif" : "Dijeda"}
                  </span>
                )
              } />
              {sub.billing_cycle && (
                <Row icon={<Wallet className="w-4 h-4" />} label="Siklus" value={
                  sub.billing_cycle === "yearly" ? "Tahunan" :
                  sub.billing_cycle === "quarterly" ? "Triwulan" : "Bulanan"
                } />
              )}
            </div>

            {/* Actions */}
            {editing ? (
              <div className="flex gap-3 mt-5">
                <button onClick={() => setEditing(false)} className="flex-1 py-3 rounded-xl border border-white/20 text-white text-sm font-semibold tap-highlight-fix">
                  Batal
                </button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-[#F97316] text-white text-sm font-semibold tap-highlight-fix">
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            ) : (
              <div className="flex gap-3 mt-5">
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 rounded-xl border border-[#F87171]/40 text-[#F87171] text-sm font-semibold flex items-center justify-center gap-2 tap-highlight-fix"
                >
                  <Trash2 className="w-4 h-4" /> Hapus
                </button>
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 py-3 rounded-xl bg-[#F97316] text-white text-sm font-semibold flex items-center justify-center gap-2 tap-highlight-fix"
                >
                  <Pencil className="w-4 h-4" /> Edit
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Row({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-[#8FA4C8]">{icon}</span>
      <span className="text-[#8FA4C8] text-sm flex-shrink-0">{label}</span>
      <span className="text-white text-sm font-medium ml-auto text-right">{value}</span>
    </div>
  );
}

// ── Swipeable Sub Card ───────────────────────────────────────────────────────
function SubCard({ sub, idx, formatCurrency, onRefresh }) {
  const [offsetX, setOffsetX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const startX = useRef(null);
  const ACTION_W = 130; // total width of action buttons revealed

  const days = daysLeft(sub.next_due_date);
  const isUrgent = days <= 7;
  const dueDateLabel = sub.next_due_date
    ? new Date(sub.next_due_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : "-";

  function onTouchStart(e) {
    startX.current = e.touches[0].clientX;
    setDragging(true);
  }

  function onTouchMove(e) {
    if (startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    // only allow swipe left (negative)
    const clamped = Math.max(-ACTION_W, Math.min(0, dx + (offsetX === -ACTION_W ? -ACTION_W : 0)));
    setOffsetX(clamped);
  }

  function onTouchEnd() {
    setDragging(false);
    startX.current = null;
    if (offsetX < -ACTION_W / 2) {
      setOffsetX(-ACTION_W);
    } else {
      setOffsetX(0);
    }
  }

  async function toggleStatus() {
    const newStatus = sub.status === "active" ? "paused" : "active";
    await base44.entities.Subscription.update(sub.id, { status: newStatus });
    setOffsetX(0);
    onRefresh();
  }

  async function handleDelete() {
    if (!window.confirm(`Hapus "${sub.name}"?`)) return;
    await base44.entities.Subscription.delete(sub.id);
    onRefresh();
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="relative overflow-hidden rounded-2xl shadow-sm"
      >
        {/* Action buttons behind the card */}
        <div className="absolute right-0 top-0 bottom-0 flex" style={{ width: ACTION_W }}>
          {/* Toggle active/pause */}
          <button
            onClick={toggleStatus}
            className="flex-1 flex flex-col items-center justify-center gap-1 bg-[#3B82F6] text-white text-[11px] font-semibold tap-highlight-fix"
          >
            <Power className="w-4 h-4" />
            {sub.status === "active" ? "Jeda" : "Aktifkan"}
          </button>
          {/* Delete */}
          <button
            onClick={handleDelete}
            className="flex-1 flex flex-col items-center justify-center gap-1 bg-[#EF4444] text-white text-[11px] font-semibold rounded-r-2xl tap-highlight-fix"
          >
            <Trash2 className="w-4 h-4" />
            Hapus
          </button>
        </div>

        {/* Card face */}
        <div
          style={{
            transform: `translateX(${offsetX}px)`,
            transition: dragging ? "none" : "transform 0.25s ease",
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClick={() => { if (offsetX === 0) setShowDetail(true); else setOffsetX(0); }}
          className={`relative rounded-2xl p-4 border cursor-pointer ${
            isUrgent ? "bg-[#FFF5F5] border-[#FECACA]" : "bg-white border-transparent"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
              isUrgent ? "bg-[#FEE2E2]" : "bg-[#F2F4F7]"
            }`}>
              {sub.icon || "💳"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-[#1A1A1A]">{sub.name}</p>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  sub.status === "active"
                    ? "bg-[#4ADE80]/20 text-[#16A34A]"
                    : "bg-[#9CA3AF]/20 text-[#6B7280]"
                }`}>
                  {sub.status === "active" ? "Aktif" : "Dijeda"}
                </span>
              </div>
              <p className={`text-[11px] mt-0.5 ${isUrgent ? "text-[#EF4444] font-semibold" : "text-[#8FA4C8]"}`}>
                {isUrgent ? "⚠️ Segera perpanjang!" : days < 999 ? `✓ ${days} hari lagi` : "✓ Aktif"}
              </p>
              <p className="text-[10px] text-[#B0BEC5] mt-0.5">Jatuh tempo: {dueDateLabel}</p>
            </div>
            <p className="text-sm font-bold text-[#1A1A1A] flex-shrink-0">
              {formatCurrency(sub.amount)}
            </p>
          </div>
        </div>
      </motion.div>

      {showDetail && (
        <SubDetailSheet
          sub={sub}
          formatCurrency={formatCurrency}
          onClose={() => setShowDetail(false)}
          onSave={onRefresh}
        />
      )}
    </>
  );
}

// ── Main Tab ─────────────────────────────────────────────────────────────────
export default function TxLanggananTab({ subscriptions, formatCurrency, onRefresh }) {
  const stats = useMemo(() => {
    const active = subscriptions.filter(s => s.status === "active");
    const totalMonthly = active.reduce((sum, s) => {
      if (s.billing_cycle === "yearly") return sum + (s.amount || 0) / 12;
      if (s.billing_cycle === "quarterly") return sum + (s.amount || 0) / 3;
      return sum + (s.amount || 0);
    }, 0);
    const dueSoon = subscriptions.filter(s => daysLeft(s.next_due_date) <= 7).length;
    return { activeCount: active.length, totalMonthly, dueSoon };
  }, [subscriptions]);

  return (
    <div className="pb-4 pt-3">
      {/* Summary banner */}
      <div className="mx-3 bg-[#1A1E25] rounded-2xl p-4 mb-4 shadow-sm">
        <p className="text-[11px] text-[#8FA4C8] mb-1">Total per bulan</p>
        <p className="text-xl font-bold text-white">{formatCurrency(stats.totalMonthly)}</p>
        <div className="flex gap-2 mt-2">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#4ADE80]/20 text-[#4ADE80]">
            ✓ {stats.activeCount} aktif
          </span>
          {stats.dueSoon > 0 && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F87171]/20 text-[#F87171]">
              ⚠️ {stats.dueSoon} segera
            </span>
          )}
        </div>
        <p className="text-[10px] text-[#8FA4C8] mt-2">← Swipe kartu untuk aksi cepat</p>
      </div>

      {/* List */}
      {subscriptions.length === 0 ? (
        <div className="text-center py-12 px-6">
          <p className="text-4xl mb-3">💳</p>
          <p className="text-sm font-semibold text-[#4A5568]">Belum ada langganan</p>
        </div>
      ) : (
        <div className="mx-3 space-y-2">
          {subscriptions.map((sub, idx) => (
            <SubCard
              key={sub.id}
              sub={sub}
              idx={idx}
              formatCurrency={formatCurrency}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}