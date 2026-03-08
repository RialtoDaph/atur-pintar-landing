import { useState } from "react";
import { X, Send, CheckCircle, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAppSettings } from "@/components/utils/useAppSettings";

export default function FeedbackModal({ onClose }) {
  const { t } = useAppSettings();
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    if (!feedback.trim()) return;
    setSending(true);
    base44.analytics.track({
      eventName: "user_feedback_submitted",
      properties: { rating, feedback_length: feedback.length },
    });
    await new Promise((r) => setTimeout(r, 600));
    setSent(true);
    setSending(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-dialog-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        {sent ? (
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 text-[#00C9A7] mx-auto mb-3" aria-hidden="true" />
            <p className="font-bold text-[#1A1A1A] text-lg">{t("feedback_success_title")}</p>
            <p className="text-sm text-[#8FA4C8] mt-1">{t("feedback_success_desc")}</p>
            <button
              onClick={onClose}
              className="mt-4 w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#333] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00] focus-visible:ring-offset-2"
            >
              {t("close")}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 id="feedback-dialog-title" className="font-bold text-[#1A1A1A]">
                  {t("feedback_title")}
                </h2>
                <p className="text-xs text-[#8FA4C8] mt-0.5">{t("feedback_subtitle")}</p>
              </div>
              <button
                onClick={onClose}
                aria-label={t("close")}
                className="w-8 h-8 rounded-full bg-[#F2F4F7] flex items-center justify-center text-[#8FA4C8] hover:bg-[#E2E8F0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Star Rating */}
            <div className="mb-4">
              <p className="text-xs font-bold text-[#8FA4C8] uppercase tracking-widest mb-2">
                {t("feedback_rating_label")}
              </p>
              <div className="flex gap-1" role="group" aria-label={t("feedback_rating_label")}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    aria-label={`${star} bintang`}
                    aria-pressed={rating === star}
                    className="p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00] focus-visible:ring-offset-1 rounded"
                  >
                    <Star
                      className="w-7 h-7"
                      fill={(hoveredRating || rating) >= star ? "#FF6A00" : "none"}
                      stroke={(hoveredRating || rating) >= star ? "#FF6A00" : "#CBD5E0"}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback text */}
            <div className="mb-4">
              <label
                htmlFor="feedback-msg"
                className="text-xs font-bold text-[#8FA4C8] uppercase tracking-widest mb-2 block"
              >
                {t("feedback_message_label")}
              </label>
              <textarea
                id="feedback-msg"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={t("feedback_message_placeholder")}
                rows={4}
                className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#1A1A1A] placeholder-[#CBD5E0] resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent"
              />
              {feedback.trim() === "" && (
                <p className="text-xs text-[#FF6B6B] mt-1 hidden peer-invalid:block" role="alert">
                  {t("feedback_required")}
                </p>
              )}
            </div>

            <button
              onClick={handleSend}
              disabled={sending || !feedback.trim()}
              aria-disabled={sending || !feedback.trim()}
              className="w-full bg-[#FF6A00] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#e05e00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00] focus-visible:ring-offset-2"
            >
              {sending ? (
                <div
                  className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"
                  role="status"
                  aria-label={t("feedback_sending")}
                />
              ) : (
                <Send className="w-4 h-4" aria-hidden="true" />
              )}
              {sending ? t("feedback_sending") : t("feedback_send")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}