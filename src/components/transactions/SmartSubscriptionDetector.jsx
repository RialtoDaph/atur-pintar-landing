import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Sparkles, Check, X, RefreshCw, ChevronRight, Loader2, Zap } from "lucide-react";

function formatIDR(n) { return "Rp" + Math.round(n || 0).toLocaleString("id-ID"); }
function daysUntil(dateStr) {
  if (!dateStr) return 999;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

const CYCLE_LABELS = { weekly: "Mingguan", monthly: "Bulanan", yearly: "Tahunan" };
const CYCLE_MONTHS = { weekly: 0.25, monthly: 1, yearly: 12 };

export default function SmartSubscriptionDetector({ user, onConfirmed }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const load = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    const data = await base44.entities.DetectedSubscription.filter(
      { created_by: user.email, status: "pending" },
      "-occurrence_count"
    ).catch(() => []);
    setPending(data || []);
    setLoading(false);
  }, [user?.email]);

  useEffect(() => { load(); }, [load]);

  async function handleScan() {
    setScanning(true);
    try {
      const res = await base44.functions.invoke("detectRecurringExpenses", {});
      const { new_candidates } = res.data || {};
      if (new_candidates > 0) {
        toast.success(`🎉 ${new_candidates} langganan terdeteksi!`);
        await load();
      } else {
        toast.success("Tidak ada pola baru ditemukan.");
      }
    } catch {
      toast.error("Gagal memindai transaksi.");
    }
    setScanning(false);
  }

  async function handleConfirm(item) {
    try {
      // Add to Subscription entity
      await base44.entities.Subscription.create({
        name: item.name,
        amount: item.amount,
        billing_cycle: item.billing_cycle === 'weekly' ? 'monthly' : item.billing_cycle,
        next_due_date: item.next_due_date,
        status: "active",
        icon: getIcon(item.name),
        notes: `Auto-detected: ${item.occurrence_count}x ditemukan`,
      });
      // Mark as confirmed
      await base44.entities.DetectedSubscription.update(item.id, { status: "confirmed" });
      setPending(p => p.filter(d => d.id !== item.id));
      toast.success(`✅ ${item.name} ditambahkan ke Langganan!`);
      if (onConfirmed) onConfirmed();
    } catch {
      toast.error("Gagal menambahkan langganan.");
    }
  }

  async function handleDismiss(item) {
    await base44.entities.DetectedSubscription.update(item.id, { status: "dismissed" });
    setPending(p => p.filter(d => d.id !== item.id));
    toast.success("Diabaikan.");
  }

  if (loading) return (
    <div className="flex justify-center py-8">
      <div className="w-6 h-6 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A0A0A] to-[#1a1a1a] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F97316]/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#F97316]" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">Detektor Otomatis</p>
              <p className="text-white/50 text-[10px]">Scan riwayat transaksi untuk menemukan langganan</p>
            </div>
          </div>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F97316] text-white text-xs font-bold active:scale-95 transition-transform disabled:opacity-50"
          >
            {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {scanning ? "Memindai..." : "Scan"}
          </button>
        </div>
        {pending.length > 0 && (
          <div className="bg-[#F97316]/20 rounded-xl px-3 py-2">
            <p className="text-[#F97316] text-xs font-semibold">
              ✨ {pending.length} potensi langganan ditemukan — tinjau di bawah
            </p>
          </div>
        )}
      </div>

      {/* Pending detections */}
      {pending.length === 0 && !scanning && (
        <div className="bg-white rounded-2xl p-8 text-center border border-[#F0F2F5]">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Belum ada deteksi</p>
          <p className="text-xs text-[#8FA4C8]">Tekan "Scan" untuk mencari pola pengeluaran berulang dari riwayat transaksimu.</p>
        </div>
      )}

      {pending.length > 0 && (
        <div>
          <p className="text-xs font-bold text-[#8FA4C8] uppercase tracking-widest mb-2 px-1">
            Perlu Ditinjau ({pending.length})
          </p>
          <div className="space-y-2">
            {pending.map(item => (
              <DetectedCard
                key={item.id}
                item={item}
                onConfirm={() => handleConfirm(item)}
                onDismiss={() => handleDismiss(item)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DetectedCard({ item, onConfirm, onDismiss }) {
  const [expanded, setExpanded] = useState(false);
  const days = daysUntil(item.next_due_date);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#F0F2F5] overflow-hidden">
      <div className="flex items-center gap-3 p-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 flex items-center justify-center text-lg flex-shrink-0">
          {getIcon(item.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold text-[#1A1A1A] truncate">{item.name}</p>
            <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#F97316]/15 text-[#F97316]">
              Auto
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-[#8FA4C8]">{CYCLE_LABELS[item.billing_cycle]}</p>
            <span className="text-[#8FA4C8]">·</span>
            <p className="text-xs text-[#8FA4C8]">{item.occurrence_count}x terdeteksi</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-[#1A1A1A]">{formatIDR(item.amount)}</p>
          {item.next_due_date && (
            <p className="text-[10px]" style={{ color: days <= 7 ? "#EF4444" : "#8FA4C8" }}>
              {days <= 0 ? "Kemarin" : days === 1 ? "Besok" : `~${days} hari`}
            </p>
          )}
        </div>
        <button onClick={() => setExpanded(e => !e)} className="p-1 ml-1">
          <ChevronRight className={`w-4 h-4 text-[#CBD5E0] transition-transform ${expanded ? "rotate-90" : ""}`} />
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && item.transaction_notes?.length > 0 && (
        <div className="px-3.5 pb-2.5 border-t border-[#F2F4F7]">
          <p className="text-[10px] font-bold text-[#8FA4C8] uppercase tracking-wider mt-2 mb-1.5">Contoh Transaksi Ditemukan</p>
          <div className="space-y-1">
            {item.transaction_notes.map((n, i) => (
              <div key={i} className="flex items-center gap-2 bg-[#F8FAFC] rounded-lg px-2.5 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F97316]/50 flex-shrink-0" />
                <p className="text-xs text-[#4A5568] truncate">{n}</p>
              </div>
            ))}
          </div>
          {item.last_seen_date && (
            <p className="text-[10px] text-[#8FA4C8] mt-2">
              Terakhir: {new Date(item.last_seen_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 px-3.5 pb-3.5 mt-1">
        <button
          onClick={onDismiss}
          className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl bg-[#F2F4F7] text-xs font-semibold text-[#8FA4C8] active:scale-95 transition-transform"
        >
          <X className="w-3.5 h-3.5" /> Abaikan
        </button>
        <button
          onClick={onConfirm}
          className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl bg-[#F97316] text-white text-xs font-bold active:scale-95 transition-transform"
        >
          <Check className="w-3.5 h-3.5" /> Konfirmasi
        </button>
      </div>
    </div>
  );
}

function getIcon(name) {
  if (!name) return "📱";
  const lower = name.toLowerCase();
  if (lower.includes("netflix")) return "🎬";
  if (lower.includes("spotify")) return "🎵";
  if (lower.includes("youtube")) return "▶️";
  if (lower.includes("disney")) return "🏰";
  if (lower.includes("apple")) return "🍎";
  if (lower.includes("google")) return "🔍";
  if (lower.includes("icloud")) return "☁️";
  if (lower.includes("microsoft") || lower.includes("office")) return "💻";
  if (lower.includes("adobe")) return "🎨";
  if (lower.includes("canva")) return "🖌️";
  if (lower.includes("chatgpt") || lower.includes("openai")) return "🤖";
  if (lower.includes("zoom")) return "📹";
  if (lower.includes("pln") || lower.includes("listrik")) return "⚡";
  if (lower.includes("pdam") || lower.includes("air")) return "💧";
  if (lower.includes("internet") || lower.includes("wifi") || lower.includes("indihome")) return "🌐";
  if (lower.includes("bpjs")) return "🏥";
  if (lower.includes("asuransi")) return "🛡️";
  if (lower.includes("gym") || lower.includes("fitness")) return "💪";
  return "🔄";
}