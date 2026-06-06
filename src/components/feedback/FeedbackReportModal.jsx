import { useState, useEffect } from "react";
import { X, Bug, Lightbulb, Heart, MessageCircle, Clock, CheckCircle2, XCircle, Eye, Send, Inbox } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";

const TYPE_OPTIONS = [
  { value: "bug", label: "Bug", icon: Bug, color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
  { value: "suggestion", label: "Saran", icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
  { value: "praise", label: "Pujian", icon: Heart, color: "text-pink-500", bg: "bg-pink-50", border: "border-pink-200" },
  { value: "other", label: "Lain", icon: MessageCircle, color: "text-[#8FA4C8]", bg: "bg-[#F8FAFC]", border: "border-[#E2E8F0]" },
];

const STATUS_MAP = {
  open: { label: "Menunggu", icon: Clock, color: "text-[#8FA4C8]", bg: "bg-[#F8FAFC]" },
  in_review: { label: "Ditinjau", icon: Eye, color: "text-blue-500", bg: "bg-blue-50" },
  resolved: { label: "Selesai", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
  wont_fix: { label: "Ditolak", icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
};

export default function FeedbackReportModal({ user, onClose }) {
  useLockBodyScroll();
  const [tab, setTab] = useState("report");
  const [type, setType] = useState("bug");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [touched, setTouched] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (tab !== "history" || !user?.email) return;
    setLoadingHistory(true);
    base44.entities.FeedbackReport.filter({ created_by: user.email }, "-created_date")
      .then((items) => setHistory(items || []))
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
  }, [tab, user?.email]);

  async function handleSubmit() {
    setTouched(true);
    if (!message.trim()) return;
    setSending(true);
    try {
      // Save to entity first (for user history)
      await base44.entities.FeedbackReport.create({
        type,
        title: title.trim() || null,
        message: message.trim(),
        page: window.location.pathname,
        user_name: user?.full_name || "Anonymous",
        user_email: user?.email || null,
        status: "open",
      });

      // Forward to admin email (existing function — best-effort)
      base44.functions.invoke("sendFeedbackToNotion", {
        rating: null,
        message: `[${type.toUpperCase()}] ${title ? title + " — " : ""}${message}`,
        userName: user?.full_name || "Anonymous",
        userEmail: user?.email || null,
      }).catch(() => {});

      toast.success("Report terkirim! Terima kasih 🙏");
      setMessage("");
      setTitle("");
      setTouched(false);
      setTab("history");
    } catch {
      toast.error("Gagal mengirim. Coba lagi.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md shadow-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-slide-up-sheet sm:animate-none"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-[#F2F4F7] flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">💬</span>
              <h2 className="text-base font-bold text-[#1A1A1A]">Beta Feedback</h2>
              <span className="text-[9px] font-bold text-[#F97316] bg-[#F97316]/15 border border-[#F97316]/30 rounded px-1.5 py-0.5 leading-none uppercase tracking-wider">Beta</span>
            </div>
            <button
              onClick={onClose}
              aria-label="Tutup"
              className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors rounded-lg p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-[#8FA4C8]">Bantu kami perbaiki Atur Pintar. Lapor masalah & lihat statusnya.</p>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-[#F8FAFC] p-1 rounded-xl">
            <button
              onClick={() => setTab("report")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                tab === "report" ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#8FA4C8]"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              Lapor
            </button>
            <button
              onClick={() => setTab("history")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                tab === "history" ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#8FA4C8]"
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              Riwayat
              {history.length > 0 && (
                <span className="bg-[#F97316] text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-none">{history.length}</span>
              )}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === "report" ? (
            <ReportForm
              type={type} setType={setType}
              title={title} setTitle={setTitle}
              message={message} setMessage={setMessage}
              touched={touched} setTouched={setTouched}
            />
          ) : (
            <HistoryList history={history} loading={loadingHistory} onSwitchToReport={() => setTab("report")} />
          )}
        </div>

        {/* Footer (only for report tab) */}
        {tab === "report" && (
          <div className="px-5 py-4 border-t border-[#F2F4F7] flex gap-3 flex-shrink-0" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}>
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#8FA4C8] hover:bg-[#F8FAFC] transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={sending}
              aria-busy={sending}
              className="flex-1 py-3 rounded-xl bg-[#F97316] text-white text-sm font-semibold hover:bg-[#e05e00] transition-colors disabled:opacity-50"
            >
              {sending ? "Mengirim..." : "Kirim Report"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportForm({ type, setType, title, setTitle, message, setMessage, touched, setTouched }) {
  return (
    <div className="space-y-4">
      {/* Type picker */}
      <div>
        <p className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-2">Jenis</p>
        <div className="grid grid-cols-4 gap-2">
          {TYPE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = type === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setType(opt.value)}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all ${
                  active ? `${opt.bg} ${opt.border}` : "bg-white border-[#E2E8F0] hover:border-[#CBD5E1]"
                }`}
                aria-pressed={active}
              >
                <Icon className={`w-5 h-5 ${active ? opt.color : "text-[#8FA4C8]"}`} />
                <span className={`text-[11px] font-semibold ${active ? "text-[#1A1A1A]" : "text-[#8FA4C8]"}`}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Title (optional) */}
      <div>
        <label htmlFor="fb-title" className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-2 block">
          Judul singkat <span className="text-[#CBD5E1] normal-case">(opsional)</span>
        </label>
        <input
          id="fb-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Tombol simpan tidak berfungsi"
          maxLength={80}
          className="w-full border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#F97316] bg-[#F8FAFC]"
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="fb-message" className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-2 block">
          Detail <span className="text-red-400">*</span>
        </label>
        <textarea
          id="fb-message"
          rows={5}
          value={message}
          onChange={(e) => { setMessage(e.target.value); setTouched(true); }}
          placeholder="Ceritakan masalah/saranmu. Sertakan langkah reproduksi kalau ada bug."
          className={`w-full border rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#F97316] bg-[#F8FAFC] resize-none transition-colors ${
            touched && !message.trim() ? "border-red-400" : "border-[#E2E8F0]"
          }`}
        />
        {touched && !message.trim() && (
          <p className="text-xs text-red-400 mt-1">Detail tidak boleh kosong</p>
        )}
      </div>

      {/* Helper note */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3">
        <p className="text-[11px] text-[#8FA4C8] leading-relaxed">
          💡 Report kamu akan masuk ke tim dev. Cek tab <strong className="text-[#1A1A1A]">Riwayat</strong> untuk lihat status & balasan admin.
        </p>
      </div>
    </div>
  );
}

function HistoryList({ history, loading, onSwitchToReport }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-[#F8FAFC] rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!history.length) {
    return (
      <div className="text-center py-10">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Belum ada report</p>
        <p className="text-xs text-[#8FA4C8] mb-4">Mulai lapor masalah atau kasih saran biar Atur Pintar makin oke.</p>
        <button
          onClick={onSwitchToReport}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-semibold hover:bg-[#e05e00] transition-colors"
        >
          <Send className="w-3.5 h-3.5" /> Buat Report Pertama
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {history.map((item) => <ReportCard key={item.id} item={item} />)}
    </div>
  );
}

function ReportCard({ item }) {
  const typeOpt = TYPE_OPTIONS.find((t) => t.value === item.type) || TYPE_OPTIONS[3];
  const statusOpt = STATUS_MAP[item.status] || STATUS_MAP.open;
  const TypeIcon = typeOpt.icon;
  const StatusIcon = statusOpt.icon;
  const date = item.created_date ? new Date(item.created_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "";

  return (
    <div className="border border-[#E2E8F0] rounded-2xl p-3.5 bg-white">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-7 h-7 rounded-lg ${typeOpt.bg} flex items-center justify-center flex-shrink-0`}>
            <TypeIcon className={`w-3.5 h-3.5 ${typeOpt.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#1A1A1A] truncate">
              {item.title || typeOpt.label}
            </p>
            <p className="text-[10px] text-[#8FA4C8]">{date}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusOpt.bg} flex-shrink-0`}>
          <StatusIcon className={`w-3 h-3 ${statusOpt.color}`} />
          <span className={`text-[10px] font-semibold ${statusOpt.color}`}>{statusOpt.label}</span>
        </div>
      </div>

      <p className="text-xs text-[#5A6A7E] leading-relaxed mb-2 whitespace-pre-wrap break-words">{item.message}</p>

      {item.admin_response && (
        <div className="mt-2 bg-[#F8FAFC] border-l-2 border-[#F97316] rounded-r-lg px-3 py-2">
          <p className="text-[10px] font-bold text-[#F97316] uppercase tracking-wider mb-0.5">Balasan Admin</p>
          <p className="text-xs text-[#1A1A1A] whitespace-pre-wrap break-words">{item.admin_response}</p>
        </div>
      )}
    </div>
  );
}