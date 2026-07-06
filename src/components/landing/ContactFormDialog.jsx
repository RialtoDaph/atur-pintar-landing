import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { Mail, Send, Loader2, CheckCircle2 } from "lucide-react";

export default function ContactFormDialog({ open, onOpenChange }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Mohon isi nama, email, dan pesan.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const body = [
        `Pesan dari Landing Page`,
        ``,
        `Nama: ${form.name}`,
        `Email: ${form.email}`,
        form.subject ? `Subjek: ${form.subject}` : ``,
        ``,
        `Pesan:`,
        form.message,
      ].join("\n");

      await base44.integrations.Core.SendEmail({
        to: "admin@aturpintar.id",
        subject: `[KONTAK] ${form.name}${form.subject ? " - " + form.subject : ""}`,
        body,
      });
      setSubmitted(true);
    } catch (err) {
      setError("Gagal mengirim. Coba lagi atau email langsung ke admin@aturpintar.id.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (v) => {
    onOpenChange(v);
    if (!v && submitted) {
      setSubmitted(false);
      setForm({ name: "", email: "", subject: "", message: "" });
      setError("");
    }
  };

  const inputCls = "w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#F97316]/50 focus:outline-none transition-colors";
  const labelCls = "block text-[11px] font-semibold text-white/70 mb-1.5 uppercase tracking-wider";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#141414] border border-white/10 rounded-2xl max-w-md p-5 sm:p-6">
        {submitted ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#F97316]/15 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-[#F97316]" />
            </div>
            <p className="text-white font-bold text-base mb-1">Pesan terkirim</p>
            <p className="text-white/55 text-xs leading-relaxed">
              Terima kasih! Tim kami akan membalas ke <span className="text-white/80">{form.email}</span> dalam 1-3 hari kerja.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-white font-bold text-base flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F97316]" /> Hubungi Kami
              </DialogTitle>
              <DialogDescription className="text-white/50 text-xs">
                Kirim pesan langsung ke admin@aturpintar.id
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3 mt-2">
              <div>
                <label className={labelCls}>Nama *</label>
                <input type="text" required className={inputCls} value={form.name} onChange={handleChange("name")} placeholder="Nama kamu" />
              </div>
              <div>
                <label className={labelCls}>Email *</label>
                <input type="email" required className={inputCls} value={form.email} onChange={handleChange("email")} placeholder="email@contoh.com" />
              </div>
              <div>
                <label className={labelCls}>Subjek</label>
                <input type="text" className={inputCls} value={form.subject} onChange={handleChange("subject")} placeholder="Topik pesan (opsional)" />
              </div>
              <div>
                <label className={labelCls}>Pesan *</label>
                <textarea required className={`${inputCls} min-h-[100px] resize-none`} value={form.message} onChange={handleChange("message")} placeholder="Tulis pesan kamu..." />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button type="submit" disabled={submitting} className="w-full bg-[#F97316] hover:bg-[#e05e00] disabled:opacity-50 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</> : <><Send className="w-4 h-4" /> Kirim Pesan</>}
              </button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}