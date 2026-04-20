import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Search, SlidersHorizontal, X, Upload } from "lucide-react";
import { useAppSettings } from "@/components/utils/useAppSettings";
import { toast } from "sonner";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";
import EditTransactionModal from "@/components/transactions/EditTransactionModal";
import CSVImportModal from "@/components/transactions/CSVImportModal";
import RecurringTab from "@/components/transactions/RecurringTab";
import SubscriptionTab from "@/components/transactions/SubscriptionTab";
import TransactionItem from "@/components/transactions/TransactionItem";
import TransactionDetailSheet from "@/components/transactions/TransactionDetailSheet";
import TxFilterBottomSheet from "@/components/transactions/TxFilterBottomSheet";

const SESSION_KEY = "tx_filters_v2";

function getDefaultFilters() {
  const now = new Date();
  return { month: now.getMonth(), year: now.getFullYear(), type: "all", categories: [], accountId: "" };
}

function loadFilters() {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : getDefaultFilters();
  } catch { return getDefaultFilters(); }
}

function getDateGroupLabel(dateStr) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  const diff = today - d;
  if (diff === 0) return "Hari Ini";
  if (d.getTime() === yesterday.getTime()) return "Kemarin";
  if (d >= weekAgo) return "Minggu Ini";
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function getGroupSortKey(dateStr) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  const diff = today - d;
  if (diff === 0) return "A"; // sorts first
  if (d.getTime() === yesterday.getTime()) return "B";
  if (d >= weekAgo) return "C_" + dateStr;
  return "D_" + dateStr; // older dates, sort by dateStr descending handled outside
}

export default function Transactions() {
  const { formatCurrency, t } = useAppSettings();

  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [globalCategories, setGlobalCategories] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [mainTab, setMainTab] = useState("history");
  const [typeFilter, setTypeFilter] = useState("all"); // pill filter
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState(loadFilters);

  const [visibleCount, setVisibleCount] = useState(30);
  const [detailTx, setDetailTx] = useState(null);
  const [editingTx, setEditingTx] = useState(null);
  const [showCSVImport, setShowCSVImport] = useState(false);

  const searchRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  useEffect(() => {
    base44.entities.GlobalCategory.list("sort_order").then(res => {
      setGlobalCategories((res || []).filter(c => c.is_active !== false));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    loadData();
    base44.entities.Account.filter({ created_by: user.email }, "name").then(setAccounts).catch(() => {});
    base44.entities.SavingsGoal.filter({ created_by: user.email }, "-created_date").then(setGoals).catch(() => {});
  }, [user]);

  useEffect(() => {
    const handler = () => { if (user) loadData(); };
    window.addEventListener("refresh-dashboard", handler);
    return () => window.removeEventListener("refresh-dashboard", handler);
  }, [user]);

  useEffect(() => {
    if (!user?.email) return;
    const unsub = base44.entities.Transaction.subscribe(() => loadData());
    return unsub;
  }, [user?.email]);

  async function loadData() {
    setLoading(true);
    try {
      const txs = await base44.entities.Transaction.filter({ created_by: user.email }, "-date", 500);
      setTransactions(txs || []);
    } catch {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Hapus transaksi ini?")) return;
    const tx = transactions.find(t => t.id === id);
    setTransactions(prev => prev.filter(t => t.id !== id));
    try {
      await base44.entities.Transaction.update(id, { is_deleted: true });
      await base44.functions.invoke("syncTransactionChanges", { action: "delete", oldTransaction: tx });
      toast.success("Transaksi dihapus");
    } catch {
      toast.error("Gagal menghapus");
      loadData();
    }
  }

  async function handleEdit(id, data) {
    const oldTx = transactions.find(t => t.id === id);
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    try {
      await base44.entities.Transaction.update(id, data);
      await base44.functions.invoke("syncTransactionChanges", { action: "update", transaction: data, oldTransaction: oldTx });
      toast.success("Transaksi diperbarui");
      setEditingTx(null);
    } catch {
      toast.error("Gagal memperbarui");
      loadData();
    }
  }

  function handleApplyFilters(newFilters) {
    setFilters(newFilters);
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(newFilters)); } catch {}
    setVisibleCount(30);
  }

  const getCategoryInfo = useCallback((categoryKey) => {
    if (!categoryKey) return { emoji: "📦", label: "Lainnya", color: "#95A5A6" };
    // Try GlobalCategory by ID first
    const byCatId = globalCategories.find(c => c.id === categoryKey);
    if (byCatId) return { emoji: byCatId.emoji, label: byCatId.name, color: byCatId.color || "#888" };
    // Fallback: match by name/key
    const fallback = globalCategories.find(c => c.name?.toLowerCase() === categoryKey?.toLowerCase());
    if (fallback) return { emoji: fallback.emoji, label: fallback.name, color: fallback.color || "#888" };
    return { emoji: "📦", label: categoryKey, color: "#95A5A6" };
  }, [globalCategories]);

  const getAccountName = useCallback((accountId) => {
    const acc = accounts.find(a => a.id === accountId);
    return acc ? `${acc.icon || "💳"} ${acc.name}` : null;
  }, [accounts]);

  // Month summary (always current month from filters)
  const { monthIncome, monthExpense } = useMemo(() => {
    const now = new Date();
    const m = filters.month ?? now.getMonth();
    const y = filters.year ?? now.getFullYear();
    const monthTxs = transactions.filter(tx => {
      if (tx.is_deleted) return false;
      const d = new Date(tx.date);
      return d.getMonth() === m && d.getFullYear() === y;
    });
    return {
      monthIncome: monthTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
      monthExpense: monthTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    };
  }, [transactions, filters.month, filters.year]);

  const filtered = useMemo(() => {
    const m = filters.month;
    const y = filters.year;
    let result = transactions.filter(tx => {
      if (tx.is_deleted) return false;
      const d = new Date(tx.date);
      if (d.getMonth() !== m || d.getFullYear() !== y) return false;
      if (filters.type !== "all" && tx.type !== filters.type) return false;
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;
      if ((filters.categories || []).length > 0 && !filters.categories.includes(tx.category)) return false;
      if (filters.accountId && tx.account_id !== filters.accountId) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const noteMatch = (tx.note || "").toLowerCase().includes(q);
        const amountMatch = String(tx.amount).includes(q);
        if (!noteMatch && !amountMatch) return false;
      }
      return true;
    });
    return result.sort((a, b) => {
      const dateDiff = new Date(b.date) - new Date(a.date);
      if (dateDiff !== 0) return dateDiff;
      if (a.time && b.time) return b.time.localeCompare(a.time);
      return 0;
    });
  }, [transactions, filters, typeFilter, searchQuery]);

  useEffect(() => { setVisibleCount(30); }, [typeFilter, searchQuery, filters]);

  const visibleFiltered = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  // Group by date label
  const { groupedItems, sortedGroupKeys } = useMemo(() => {
    const g = {};
    visibleFiltered.forEach(tx => {
      const label = getDateGroupLabel(tx.date);
      const sortKey = getGroupSortKey(tx.date);
      if (!g[label]) g[label] = { label, sortKey, items: [] };
      g[label].items.push(tx);
    });
    const keys = Object.keys(g).sort((a, b) => {
      const sa = g[a].sortKey, sb = g[b].sortKey;
      if (sa < sb) return -1;
      if (sa > sb) return 1;
      return 0;
    });
    return { groupedItems: g, sortedGroupKeys: keys };
  }, [visibleFiltered]);

  const activeFilterCount = useMemo(() => [
    (filters.categories || []).length > 0,
    !!filters.accountId,
    filters.type !== "all",
  ].filter(Boolean).length, [filters]);

  const MONTHS_ID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  return (
    <div className="min-h-screen bg-[#F2F4F7] pb-28">
      {/* Header */}
      <div className="bg-[#0A0A0A] px-5 pt-10 pb-0 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto">
          {/* Top bar */}
          {showSearch ? (
            <div className="flex items-center gap-3 mb-4 h-10">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8FA4C8]" />
                <input
                  ref={searchRef}
                  autoFocus
                  type="search"
                  placeholder="Cari catatan atau nominal..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-[#8FA4C8] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                />
              </div>
              <button onClick={() => { setShowSearch(false); setSearchQuery(""); }} className="text-[#8FA4C8] tap-highlight-fix">
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-4 h-10">
              <button
                onClick={() => setShowFilter(true)}
                className="relative w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center tap-highlight-fix"
              >
                <SlidersHorizontal className="w-4 h-4 text-white" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F97316] text-white text-[9px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <h1 className="text-white text-base font-bold">Transaksi</h1>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowSearch(true)} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center tap-highlight-fix">
                  <Search className="w-4 h-4 text-white" />
                </button>
                <button onClick={() => setShowCSVImport(true)} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center tap-highlight-fix">
                  <Upload className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          )}

          {/* Main tabs */}
          <div className="flex">
            {[["history", "Riwayat"], ["recurring", "Rutin"], ["subscription", "Langganan"]].map(([key, label]) => (
              <button key={key} onClick={() => setMainTab(key)}
                className={`flex-1 py-3 text-xs font-semibold transition-all border-b-2 tap-highlight-fix ${mainTab === key ? "text-[#F97316] border-[#F97316]" : "text-[#666] border-transparent"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4">
        {mainTab === "recurring" && <RecurringTab user={user} globalCategories={globalCategories} />}
        {mainTab === "subscription" && <SubscriptionTab user={user} />}

        {mainTab === "history" && (
          <div className="space-y-3">
            {/* Type pill filter */}
            <div className="flex gap-2">
              {[["all", "Semua"], ["income", "Pemasukan"], ["expense", "Pengeluaran"]].map(([val, label]) => (
                <button key={val} onClick={() => setTypeFilter(val)}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-all tap-highlight-fix ${typeFilter === val ? "bg-[#F97316] text-white border-[#F97316]" : "border-[#CBD5E0] text-[#4A5568] bg-white"}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Month label + mini summary */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#8FA4C8]">
                {MONTHS_ID[filters.month]} {filters.year}
              </p>
              <div className="flex gap-2">
                {monthIncome > 0 && (
                  <span className="text-[11px] font-bold text-[#16A34A]">+{formatCurrency(monthIncome)}</span>
                )}
                {monthExpense > 0 && (
                  <span className="text-[11px] font-bold text-[#EF4444]">−{formatCurrency(monthExpense)}</span>
                )}
              </div>
            </div>

            {/* Summary mini cards */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#F0FDF4] rounded-xl px-4 py-3">
                <p className="text-[10px] font-medium text-[#16A34A] mb-0.5">Pemasukan</p>
                <p className="text-sm font-bold text-[#16A34A]">+{formatCurrency(monthIncome)}</p>
              </div>
              <div className="bg-[#FEF2F2] rounded-xl px-4 py-3">
                <p className="text-[10px] font-medium text-[#EF4444] mb-0.5">Pengeluaran</p>
                <p className="text-sm font-bold text-[#EF4444]">−{formatCurrency(monthExpense)}</p>
              </div>
            </div>

            {/* Transaction list */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {loading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F2F4F7] animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-[#F2F4F7] rounded-full animate-pulse w-3/4" />
                        <div className="h-2.5 bg-[#F2F4F7] rounded-full animate-pulse w-1/2" />
                      </div>
                      <div className="h-3 bg-[#F2F4F7] rounded-full animate-pulse w-16" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-14 text-center px-6">
                  <p className="text-4xl mb-3">{searchQuery ? "🔍" : "📭"}</p>
                  <p className="text-sm font-semibold text-[#1A1A1A] mb-1">
                    {searchQuery ? "Transaksi tidak ditemukan" : "Belum ada transaksi"}
                  </p>
                  <p className="text-xs text-[#8FA4C8]">
                    {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : `Belum ada transaksi di ${MONTHS_ID[filters.month]} ${filters.year}`}
                  </p>
                </div>
              ) : (
                <>
                  {sortedGroupKeys.map(groupLabel => {
                    const group = groupedItems[groupLabel];
                    const groupIncome = group.items.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
                    const groupExpense = group.items.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
                    return (
                      <div key={groupLabel}>
                        {/* Group header */}
                        <div className="flex items-center justify-between px-4 py-2 bg-[#F8FAFC] border-y border-[#F2F4F7]">
                          <p className="text-[11px] font-bold text-[#1A1A1A]">{groupLabel}</p>
                          <div className="flex gap-2">
                            {groupIncome > 0 && <span className="text-[10px] font-semibold text-[#16A34A]">+{formatCurrency(groupIncome)}</span>}
                            {groupExpense > 0 && <span className="text-[10px] font-semibold text-[#EF4444]">−{formatCurrency(groupExpense)}</span>}
                          </div>
                        </div>
                        {/* Items */}
                        {group.items.map((tx, idx) => {
                          const cat = getCategoryInfo(tx.category);
                          const accountName = getAccountName(tx.account_id);
                          return (
                            <div key={tx.id} className={idx < group.items.length - 1 ? "border-b border-[#F2F4F7]" : ""}>
                              <TransactionItem
                                tx={tx}
                                cat={cat}
                                accountName={accountName}
                                onTap={() => setDetailTx({ tx, cat, accountName })}
                                onEdit={() => setEditingTx(tx)}
                                onDelete={() => handleDelete(tx.id)}
                                formatCurrency={formatCurrency}
                              />
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}

                  {/* Load more */}
                  {visibleCount < filtered.length && (
                    <div className="px-4 py-3 border-t border-[#F2F4F7]">
                      <button
                        onClick={() => setVisibleCount(c => c + 30)}
                        className="w-full py-3 rounded-xl bg-[#F2F4F7] text-sm font-semibold text-[#4A5568] tap-highlight-fix active:bg-[#E2E8F0] transition-colors"
                      >
                        Muat lebih ({filtered.length - visibleCount} lagi)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Detail sheet */}
      {detailTx && (
        <TransactionDetailSheet
          tx={detailTx.tx}
          cat={detailTx.cat}
          accountName={detailTx.accountName}
          onClose={() => setDetailTx(null)}
          onEdit={() => { setDetailTx(null); setEditingTx(detailTx.tx); }}
          onDelete={() => { setDetailTx(null); handleDelete(detailTx.tx.id); }}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Filter sheet */}
      <TxFilterBottomSheet
        open={showFilter}
        filters={filters}
        onApply={handleApplyFilters}
        onClose={() => setShowFilter(false)}
      />

      {editingTx && (
        <EditTransactionModal transaction={editingTx} goals={goals} onClose={() => setEditingTx(null)} onSave={handleEdit} />
      )}

      {showCSVImport && (
        <CSVImportModal onClose={() => setShowCSVImport(false)} onSuccess={loadData} />
      )}
    </div>
  );
}