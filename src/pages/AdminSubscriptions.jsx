import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { CreditCard, Users, CheckCircle2, XCircle, RefreshCw, Clock, Eye } from "lucide-react";

export default function AdminSubscriptions() {
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [viewProof, setViewProof] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.role === "admin") loadData();
      else setLoading(false);
    });
  }, []);

  async function loadData() {
    setLoading(true);
    const [paymentsRes, usersRes] = await Promise.all([
      base44.entities.SubscriptionPayment.list("-created_date", 100),
      base44.functions.invoke("adminGetUsers", {}),
    ]);
    setPayments(paymentsRes);
    setUsers(usersRes.data?.users || []);
    setLoading(false);
  }

  async function handleApprove(payment) {
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
    } finally {
      setProcessingId(null);
      loadData();
    }
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
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Subscription Panel</h1>
            <p className="text-sm text-[#8FA4C8] mt-1">Kelola langganan & konfirmasi pembayaran</p>
          </div>
          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] shadow-sm">
            <RefreshCw className="w-4 h-4" />
            Refresh
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
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
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
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
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
    </AdminLayout>
  );
}