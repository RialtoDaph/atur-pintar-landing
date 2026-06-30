import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Send, Loader2 } from "lucide-react";

export default function RefundRequestForm() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    account_email: "",
    invoice_id: "",
    payment_date: "",
    reason: "",
    payment_proof_url: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setForm((f) => ({
        ...f,
        full_name: u.display_name || u.full_name || "",
        account_email: u.email || "",
      }));
    }).catch(() => {});
  }, []);

  const handleChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.account_email || !form.invoice_id || !form.payment_date || !form.reason) {
      setError("Mohon lengkapi semua field wajib.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const message = [
        `Permintaan Refund`,
        ``,
        `Nama: ${form.full_name}`,
        `Email akun: ${form.account_email}`,
        `Invoice/Transaction ID: ${form.invoice_id}`,
        `Tanggal pembayaran: ${form.payment_date}`,
        `Alasan: ${form.reason}`,
        form.payment_proof_url ? `Bukti pembayaran: ${form.payment_proof_url}` : `Bukti pembayaran: (belum dilampirkan)`,
      ].join("\n");

      await base44.entities.FeedbackReport.create({
        type: "other",
        title: `[REFUND] ${form.full_name} — Invoice ${form.invoice_id}`,
        message,
        page: "RefundPolicy",
        status: "open",
        user_name: form.full_name,
        user_email: form.account_email,
      });
      setSubmitted(true);
    } catch (err) {
      setError("Gagal mengirim. Coba lagi atau email langsung ke admin@aturpintar.id.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-4 bg-white/[0.04] border border-white/10 rounded-2xl p-5 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#FF6A00]/15 flex items-center justify-center mb-3">
          <CheckCircle2 className="w-6 h-6 text-[#FF6A00]" />
        </div>
        <p className="text-white font-bold text-base mb-1">Permintaan terkirim ✓</p>
        <p className="text-white/55 text-xs leading-relaxed">
          Tim CS akan meninjau dalam 1–3 hari kerja dan membalas ke <span className="text-white/80">{form.account_email}</span>. Cek folder spam jika tidak menerima balasan.
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mt-4 bg-white/[0.04] border border-white/10 rounded-2xl p-4 text-xs text-white/55">
        Login dulu untuk mengirim permintaan refund lewat form ini, atau kirim email langsung ke <span className="text-[#FF6A00]">admin@aturpintar.id</span>.
      </div>
    );
  }

  const inputCls = "w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#FF6A00]/50 focus:outline-none transition-colors";
  const labelCls = "block text-[11px] font-semibold text-white/70 mb-1.5 uppercase tracking-wider";

  return (
    <form onSubmit={handleSubmit} className="mt-4 bg-white/[0.04] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3">
      <p className="text-white font-bold text-sm mb-1">📝 Form Permintaan Refund</p>
      <p className="text-white/50 text-xs mb-3">Lebih cepat dari email — langsung masuk ke sistem admin kami.</p>

      <div>
        <label className={labelCls}>Nama lengkap *</label>
        <input type="text" className={inputCls} value={form.full_name} onChange={handleChange("full_name")} placeholder="Nama sesuai akun" />
      </div>

      <div>
        <label className={labelCls}>Email akun *</label>
        <input type="email" className={inputCls} value={form.account_email} onChange={handleChange("account_email")} placeholder="email@contoh.com" />
      </div>

      <div>
        <label className={labelCls}>Invoice / Transaction ID *</label>
        <input type="text" className={inputCls} value={form.invoice_id} onChange={handleChange("invoice_id")} placeholder="Contoh: XEN-INV-12345" />
      </div>

      <div>
        <label className={labelCls}>Tanggal pembayaran *</label>
        <input type="date" className={inputCls} value={form.payment_date} onChange={handleChange("payment_date")} />
      </div>

      <div>
        <label className={labelCls}>Alasan refund *</label>
        <textarea className={`${inputCls} min-h-[80px] resize-none`} value={form.reason} onChange={handleChange("reason")} placeholder="Jelaskan kenapa kamu minta refund..." />
      </div>

      <div>
        <label className={labelCls}>Link bukti pembayaran (opsional)</label>
        <input type="url" className={inputCls} value={form.payment_proof_url} onChange={handleChange("payment_proof_url")} placeholder="https://... (Drive, Imgur, dll)" />
        <p className="text-[10px] text-white/35 mt-1">Atau lampirkan via email follow-up ke admin@aturpintar.id setelah submit.</p>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button type="submit" disabled={submitting} className="w-full mt-2 bg-[#FF6A00] hover:bg-[#FF6A00]/90 disabled:opacity-50 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</> : <><Send className="w-4 h-4" /> Kirim Permintaan Refund</>}
      </button>

      <p className="text-[10px] text-white/35 text-center mt-1">
        Atau email langsung ke <span className="text-[#FF6A00]">admin@aturpintar.id</span>
      </p>
    </form>
  );
}