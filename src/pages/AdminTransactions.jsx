import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, RefreshCw, ArrowUpCircle, ArrowDownCircle, Filter } from "lucide-react";

const CATEGORIES = [
  "food", "transport", "shopping", "health", "entertainment", "education",
  "bills", "salary", "freelance", "investment", "savings", "other"
];

export default function AdminTransactions() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterUser, setFilterUser] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 25;

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.role === "admin") loadData();
      else setLoading(false);
    });
  }, []);

  async function loadData() {
    setLoading(true);
    const res = await base44.functions.invoke("adminGetAllTransactions", {});
    setTransactions(res.data?.transactions || []);
    setLoading(false);
  }

  const filtered = transactions.filter(t => {
    const matchSearch =
      t.note?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase()) ||
      t.created_by?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || t.type === filterType;
    const matchUser = !filterUser || t.created_by?.toLowerCase().includes(filterUser.toLowerCase());
    const matchMonth = !filterMonth || t.date?.startsWith(filterMonth);
    return matchSearch && matchType && matchUser && matchMonth;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const totalIncome = filtered.filter(t => t.type === "income").reduce((s, t) => s + (t.amount || 0), 0);
  const totalExpense = filtered.filter(t => t.type === "expense").reduce((s, t) => s + (t.amount || 0), 0);

  const fmt = (n) => n?.toLocaleString("id-ID") ?? "0";
  const formatDate = (d) => d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-";

  if (loading) return (
    <AdminLayout currentPage="AdminTransactions">
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout currentPage="AdminTransactions">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Transaction Database</h1>
            <p className="text-sm text-[#8FA4C8] mt-1">{transactions.length} total transaksi dari semua user</p>
          </div>
          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] shadow-sm">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-[#8FA4C8] mb-1">Total Ditampilkan</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">{filtered.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-[#8FA4C8] mb-1">Total Pemasukan</p>
            <p className="text-2xl font-bold text-green-600">Rp {fmt(totalIncome)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-[#8FA4C8] mb-1">Total Pengeluaran</p>
            <p className="text-2xl font-bold text-red-500">Rp {fmt(totalExpense)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <div className="flex gap-3 flex-wrap items-center">
            <Filter className="w-4 h-4 text-[#8FA4C8]" />
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8FA4C8]" />
              <input type="text" placeholder="Cari note, kategori..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]" />
            </div>
            <input type="text" placeholder="Filter by email user..." value={filterUser} onChange={e => { setFilterUser(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] min-w-[200px]" />
            <input type="month" value={filterMonth} onChange={e => { setFilterMonth(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6A00]" />
            <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6A00]">
              <option value="all">Semua Tipe</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="savings">Savings</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F2F4F7]">
                  <th className="text-left px-5 py-3 text-xs font-bold text-[#8FA4C8] uppercase tracking-wider">Tanggal</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-[#8FA4C8] uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-[#8FA4C8] uppercase tracking-wider">Tipe</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-[#8FA4C8] uppercase tracking-wider">Kategori</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-[#8FA4C8] uppercase tracking-wider">Note</th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-[#8FA4C8] uppercase tracking-wider">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F4F7]">
                {paginated.map(t => (
                  <tr key={t.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-3 text-sm text-[#1A1A1A]">{formatDate(t.date)}</td>
                    <td className="px-5 py-3 text-xs text-[#8FA4C8] max-w-[180px] truncate">{t.created_by}</td>
                    <td className="px-5 py-3">
                      <span className={`flex items-center gap-1 text-xs font-semibold w-fit px-2 py-1 rounded-full ${
                        t.type === "income" ? "bg-green-50 text-green-600" :
                        t.type === "expense" ? "bg-red-50 text-red-500" :
                        "bg-blue-50 text-blue-600"
                      }`}>
                        {t.type === "income" ? <ArrowUpCircle className="w-3 h-3" /> : <ArrowDownCircle className="w-3 h-3" />}
                        {t.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-[#1A1A1A]">{t.category || "—"}</td>
                    <td className="px-5 py-3 text-sm text-[#8FA4C8] max-w-[200px] truncate">{t.note || "—"}</td>
                    <td className={`px-5 py-3 text-sm font-semibold text-right ${t.type === "income" ? "text-green-600" : "text-red-500"}`}>
                      {t.type === "income" ? "+" : "-"}Rp {fmt(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {paginated.length === 0 && (
            <div className="py-12 text-center text-sm text-[#8FA4C8]">Tidak ada transaksi ditemukan</div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-[#F2F4F7] flex items-center justify-between">
              <p className="text-xs text-[#8FA4C8]">
                Menampilkan {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} dari {filtered.length}
              </p>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-sm hover:bg-[#F8FAFC] disabled:opacity-40">Prev</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`px-3 py-1.5 rounded-lg border text-sm ${page === n ? "bg-[#FF6A00] text-white border-[#FF6A00]" : "border-[#E2E8F0] hover:bg-[#F8FAFC]"}`}>
                    {n}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-sm hover:bg-[#F8FAFC] disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}