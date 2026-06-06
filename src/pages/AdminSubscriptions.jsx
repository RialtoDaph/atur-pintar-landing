import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { CreditCard, Users, CheckCircle2, XCircle, RefreshCw, Clock, Eye, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import PaymentMobileCard from "@/components/admin/PaymentMobileCard";

export default function AdminSubscriptions() {
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [appConfig, setAppConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [viewProof, setViewProof] = useState(null);
  const [approveConfirm, setApproveConfirm] = useState(null); // payment with mismatched amount

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.role === "admin") loadData();
      else setLoading(false);
    });
  }, []);

  async function loadData() {
    setLoading(true);
    const [paymentsRes, usersRes, configRes] = await Promise.all([
      base44.entities.SubscriptionPayment.list("-created_date", 100),
      base44.functions.invoke("adminGetUsers", {}),
      base44.entities.AppConfig.list().catch(() => []),
    ]);
    setPayments(paymentsRes);
    setUsers(usersRes.data?.users || []);
    setAppConfig(configRes?.[0] || null);
    setLoading(false);
  }

  function getExpectedAmount(plan) {
    if (plan === "premium_yearly") return appConfig?.premium_price_yearly ?? 399900;
    if (plan === "premium_monthly") return appConfig?.premium_price_monthly ?? 49000;
    return 0;
  }

  async function executeApprove(payment) {
    setProcessingId(payment.id);
    try {
      const endDate = new Date();
      if (payment.plan === "premium_yearly") endDate.setFullYear(endDate.getFullYear() + 1);
      else endDate.setMonth(endDate.getMonth() + 1);

      // Upgrade the user FIRST so the payment is only marked approved if the upgrade actually applied
      const targetUser = users.find(u => u.email === payment.user_email);
      if (targetUser) {
        await base44.entities.User.update(targetUser.id, {
          subscription_plan: payment.plan,
          subscription_status: "active",
          subscription_end_date: endDate.toISOString().split("T")[0],
        });
      }

      await base44.entities.SubscriptionPayment.update(payment.id, {
        status: "approved",
        approved_at: new Date().toISOString().split("T")[0],
      });
      toast.success("Pembayaran disetujui");
    } finally {
      setProcessingId(null);
      setApproveConfirm(null);
      loadData();
    }
  }

  async function handleApprove(payment) {
    // Validate amount matches expected plan price (tolerate ±5% to allow for fee/rounding)
    const expected = getExpectedAmount(payment.plan);
    const paid = Number(payment.amount) || 0;
    const tolerance = expected * 0.05;
    if (Math.abs(paid - expected) > tolerance) {
      // Show confirm dialog with amount mismatch warning
      setApproveConfirm({ payment, expected, paid });
      return;
    }
    await executeApprove(payment);
  }

  async function handleReject(payment) {
    setProcessingId(payment.id);
    // Rejecting a single pending payment must NOT cancel an existing active subscription —
    // only mark this payment as rejected. Subscription expiry is handled separately.
    await base44.entities.SubscriptionPayment.update(payment.id, {
      status: "rejected",
    });
    setProcessingId(null);
    loadData();
  }

  const pending = payments.filter(p => p.status === "pending");
  const approved = payments.filter(p => p.status === "approved");
  const premiumUsers = users.filter(u =>
    (u.subscription_plan === "premium_monthly" || u.subscription_plan === "premium_yearly") &&
    u.subscription_status === "active"
  );

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-";

  const planLabel = (plan) => plan === "premium_monthly" ? "Premium Bulanan" : plan === "premium_yearly" ? "Premium Tahunan" : "Free";
  const planColor = (plan) => plan === "premium_monthly" ? "bg-[#F97316]/10 text-[#F97316]" : plan === "premium_yearly" ? "bg-purple-50 text-purple-600" : "bg-[#F2F4F7] text-[#8FA4C8]";

  if (loading) return (
    <AdminLayout currentPage="AdminSubscriptions">
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout currentPage="AdminSubscriptions">
      <div className="p-4 sm:p-8">
        <div className="flex items-center justify-between mb-6 gap-2">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">Subscription Panel</h1>
            <p className="text-xs sm:text-sm text-[#8FA4C8] mt-0.5 sm:mt-1">Kelola langganan & konfirmasi pembayaran</p>
          </div>
          <button onClick={loadData} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] shadow-sm flex-shrink-0">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1"><Users className="w-4 h-4 text-[#F97316]" /><p className="text-xs text-[#8FA4C8]">Total Users</p></div>
            <p className="text-2xl font-bold text-[#1A1A1A]">{users.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1"><CreditCard className="w-4 h-4 text-purple-500" /><p className="text-xs text-[#8FA4C8]">Premium Aktif</p></div>
            <p className="text-2xl font-bold text-purple-600">{premiumUsers.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-amber-500" /><p className="text-xs text-[#8FA4C8]">Menunggu</p></div>
            <p className="text-2xl font-bold text-amber-600">{pending.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1"><CheckCircle2 className="w-4 h-4 text-green-500" /><p className="text-xs text-[#8FA4C8]">Disetujui</p></div>
            <p className="text-2xl font-bold text-green-600">{approved.length}</p>
          </div>
        </div>

        {/* Pending Payments */}
        {pending.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-bold text-[#1A1A1A] mb-3">⏳ Menunggu Konfirmasi ({pending.length})</p>

            {/* Mobile: cards */}
            <div className="sm:hidden space-y-2">
              {pending.map(p => (
                <PaymentMobileCard
                  key={p.id}
                  payment={p}
                  actions
                  processingId={processingId}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onViewProof={setViewProof}
                />
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#F2F4F7]">
                      <th className="text-left px-5 py-3 text-xs font-bold text-[#8FA4C8] uppercase tracking-wider">User</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-[#8FA4C8] uppercase tracking-wider">Paket</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-[#8FA4C8] uppercase tracking-wider">Nominal</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-[#8FA4C8] uppercase tracking-wider">Tanggal</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-[#8FA4C8] uppercase tracking-wider">Bukti</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-[#8FA4C8] uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2F4F7]">
                    {pending.map(p => (
                      <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-[#1A1A1A]">{p.user_name || "-"}</p>
                          <p className="text-xs text-[#8FA4C8]">{p.user_email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${planColor(p.plan)}`}>{planLabel(p.plan)}</span>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-[#1A1A1A]">Rp {p.amount?.toLocaleString("id-ID")}</td>
                        <td className="px-5 py-4 text-sm text-[#8FA4C8]">{formatDate(p.created_date)}</td>
                        <td className="px-5 py-4">
                          {p.payment_proof_url ? (
                            <button onClick={() => setViewProof(p.payment_proof_url)} className="flex items-center gap-1 text-xs text-[#F97316] font-medium hover:underline">
                              <Eye className="w-3.5 h-3.5" /> Lihat
                            </button>
                          ) : <span className="text-xs text-[#8FA4C8]">-</span>}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(p)}
                              disabled={processingId === p.id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Setujui
                            </button>
                            <button
                              onClick={() => handleReject(p)}
                              disabled={processingId === p.id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-100 disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Tolak
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* All Payments History */}
        <div>
          <p className="text-sm font-bold text-[#1A1A1A] mb-3">Riwayat Pembayaran</p>

          {/* Mobile: cards */}
          <div className="sm:hidden space-y-2">
            {payments.map(p => (
              <PaymentMobileCard key={p.id} payment={p} />
            ))}
            {payments.length === 0 && (
              <p className="text-center text-sm text-[#8FA4C8] py-8">Belum ada riwayat pembayaran</p>
            )}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F2F4F7]">
                    <th className="text-left px-5 py-3 text-xs font-bold text-[#8FA4C8] uppercase tracking-wider">User</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-[#8FA4C8] uppercase tracking-wider">Paket</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-[#8FA4C8] uppercase tracking-wider">Nominal</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-[#8FA4C8] uppercase tracking-wider">Tanggal</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-[#8FA4C8] uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F4F7]">
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-[#1A1A1A]">{p.user_name || "-"}</p>
                        <p className="text-xs text-[#8FA4C8]">{p.user_email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${planColor(p.plan)}`}>{planLabel(p.plan)}</span>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-[#1A1A1A]">Rp {p.amount?.toLocaleString("id-ID")}</td>
                      <td className="px-5 py-4 text-sm text-[#8FA4C8]">{formatDate(p.created_date)}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          p.status === "approved" ? "bg-green-50 text-green-600" :
                          p.status === "rejected" ? "bg-red-50 text-red-500" :
                          "bg-amber-50 text-amber-600"
                        }`}>
                          {p.status === "approved" ? "Disetujui" : p.status === "rejected" ? "Ditolak" : "Menunggu"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {payments.length === 0 && (
              <div className="py-12 text-center text-sm text-[#8FA4C8]">Belum ada riwayat pembayaran</div>
            )}
          </div>
        </div>
      </div>

      {/* Proof Image Lightbox */}
      {viewProof && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setViewProof(null)}>
          <div className="relative max-w-lg w-full">
            <img src={viewProof} alt="Bukti transfer" className="w-full rounded-2xl" />
            <button onClick={() => setViewProof(null)} className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Amount Mismatch Confirmation */}
      {approveConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-[#1A1A1A]">Nominal Tidak Sesuai</h3>
            </div>
            <div className="px-6 py-4 space-y-2 text-sm">
              <p className="text-[#4A5568]">Bukti pembayaran tidak sesuai harga paket:</p>
              <div className="bg-[#F8FAFC] rounded-lg p-3 space-y-1">
                <div className="flex justify-between"><span className="text-[#8FA4C8]">User bayar:</span><span className="font-bold text-[#1A1A1A]">Rp {approveConfirm.paid.toLocaleString("id-ID")}</span></div>
                <div className="flex justify-between"><span className="text-[#8FA4C8]">Harga paket:</span><span className="font-bold text-[#1A1A1A]">Rp {approveConfirm.expected.toLocaleString("id-ID")}</span></div>
                <div className="flex justify-between border-t border-[#E2E8F0] pt-1 mt-1"><span className="text-[#8FA4C8]">Selisih:</span><span className={`font-bold ${approveConfirm.paid < approveConfirm.expected ? "text-red-600" : "text-green-600"}`}>Rp {Math.abs(approveConfirm.paid - approveConfirm.expected).toLocaleString("id-ID")}</span></div>
              </div>
              <p className="text-xs text-amber-600">Tetap setujui hanya jika sudah verifikasi manual.</p>
            </div>
            <div className="px-6 py-4 border-t border-[#E2E8F0] flex gap-2">
              <button onClick={() => setApproveConfirm(null)} className="flex-1 px-4 py-2 bg-[#F2F4F7] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#E2E8F0]">Batal</button>
              <button onClick={() => executeApprove(approveConfirm.payment)} className="flex-1 px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600">Tetap Setujui</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}