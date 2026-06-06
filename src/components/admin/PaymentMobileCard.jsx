import { CheckCircle2, XCircle, Eye } from "lucide-react";

const planLabel = (plan) => plan === "premium_monthly" ? "Premium Bulanan" : plan === "premium_yearly" ? "Premium Tahunan" : "Free";
const planColor = (plan) => plan === "premium_monthly" ? "bg-[#F97316]/10 text-[#F97316]" : plan === "premium_yearly" ? "bg-purple-50 text-purple-600" : "bg-[#F2F4F7] text-[#8FA4C8]";
const formatDate = (d) => d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-";

/**
 * Mobile card for a payment row (pending or history).
 * When `actions` is true, shows Approve/Reject buttons; otherwise shows status pill.
 */
export default function PaymentMobileCard({ payment, actions, processingId, onApprove, onReject, onViewProof }) {
  return (
    <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#1A1A1A] truncate">{payment.user_name || "-"}</p>
          <p className="text-xs text-[#8FA4C8] truncate">{payment.user_email}</p>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full flex-shrink-0 ${planColor(payment.plan)}`}>
          {planLabel(payment.plan)}
        </span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-base font-bold text-[#1A1A1A]">
          Rp {payment.amount?.toLocaleString("id-ID")}
        </p>
        <p className="text-xs text-[#8FA4C8]">{formatDate(payment.created_date)}</p>
      </div>

      {actions ? (
        <div className="flex gap-2 items-center">
          {payment.payment_proof_url && (
            <button
              onClick={() => onViewProof(payment.payment_proof_url)}
              className="flex items-center gap-1 px-2.5 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#F97316] font-semibold hover:bg-[#F97316]/5"
            >
              <Eye className="w-3.5 h-3.5" /> Bukti
            </button>
          )}
          <button
            onClick={() => onApprove(payment)}
            disabled={processingId === payment.id}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Setujui
          </button>
          <button
            onClick={() => onReject(payment)}
            disabled={processingId === payment.id}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-100 disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" /> Tolak
          </button>
        </div>
      ) : (
        <span className={`inline-block text-[10px] font-semibold px-2 py-1 rounded-full ${
          payment.status === "approved" ? "bg-green-50 text-green-600" :
          payment.status === "rejected" ? "bg-red-50 text-red-500" :
          "bg-amber-50 text-amber-600"
        }`}>
          {payment.status === "approved" ? "Disetujui" : payment.status === "rejected" ? "Ditolak" : "Menunggu"}
        </span>
      )}
    </div>
  );
}