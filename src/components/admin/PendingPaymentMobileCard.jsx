/**
 * Mobile-only card for a pending payment row.
 * Desktop continues to use the existing table layout.
 */
export default function PendingPaymentMobileCard({ payment, onApprove, onReject }) {
  const daysPending = Math.floor((new Date() - new Date(payment.created_date)) / (1000 * 60 * 60 * 24));
  const userEmail = payment.user_email || payment.created_by;

  return (
    <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#1A1A1A] truncate">{userEmail}</p>
          <p className="text-xs text-[#8FA4C8] mt-0.5">
            {new Date(payment.created_date).toLocaleDateString("id-ID")} · {payment.plan || "—"}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-[10px] font-bold flex-shrink-0 ${
            daysPending > 3 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {daysPending}d
        </span>
      </div>
      <p className="text-base font-bold text-[#1A1A1A] mb-3">
        Rp {(payment.amount || 0).toLocaleString("id-ID")}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onApprove(payment.id, userEmail, payment.plan, payment.amount)}
          className="flex-1 px-3 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors"
        >
          Approve
        </button>
        <button
          onClick={() => onReject(payment.id)}
          className="flex-1 px-3 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors"
        >
          Reject
        </button>
      </div>
    </div>
  );
}