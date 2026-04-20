import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useAppSettings } from "@/components/utils/useAppSettings";
import { toast } from "sonner";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";
import EditTransactionModal from "@/components/transactions/EditTransactionModal";
import CSVImportModal from "@/components/transactions/CSVImportModal";
import RecurringTab from "@/components/transactions/RecurringTab";
import SubscriptionTab from "@/components/transactions/SubscriptionTab";
import PullToRefresh from "@/components/utils/PullToRefresh";
import TransactionItem from "@/components/transactions/TransactionItem";
import TransactionDetailSheet from "@/components/transactions/TransactionDetailSheet";
import TransactionAdvancedFilter from "@/components/transactions/TransactionAdvancedFilter";

const SESSION_KEY = "tx_filters_v2";

const DEFAULT_FILTERS = {
  type: "all",
  month: "",
  categories: [],
  accountId: "",
};

function getStoredFilters() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? { ...DEFAULT_FILTERS, ...JSON.parse(raw) } : { ...DEFAULT_FILTERS };
  } catch { return { ...DEFAULT_FILTERS }; }
}

function storeFilters(f) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(f)); } catch {}
}

// Date grouping helpers
function getDateLabel(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 6);
  const d = new Date(dateStr + "T00:00:00");

  if (d.getTime() === today.getTime()) return { key: "today", label: "Hari Ini", order: 0 };
  if (d.getTime() === yesterday.getTime()) return { key: "yesterday", label: "Kemarin", order: 1 };
  if (d >= weekAgo && d < yesterday) return {
    key: "week_" + dateStr,
    label: d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" }),
    order: 2
  };
  return {
    key: dateStr,
    label: d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    order: 3
  };
}

export default function Transactions() {
  const { formatCurrency, t, settings } = useAppSettings();

  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [globalCategories, setGlobalCategories] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Search
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

  // Filter pill (quick)
  const [quickType, setQuickType] = useState("all");

  // Advanced filter
  const [showAdvFilter, setShowAdvFilter] = useState(false);
  const [filters, setFilters] = useState(getStoredFilters);

  // Modals
  const [editingTx, setEditingTx] = useState(null);
  const [detailTx, setDetailTx] = useState(null);
  const [showCSVImport, setShowCSVImport] = useState(false);

  // Tabs
  const [mainTab, setMainTab] = useState("history");

  // Pagination
  const [visibleCount, setVisibleCount] = useState(30);
  const loaderRef = useRef(null);

  // ---- Auth & load ----
  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) loadData();
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
      const [txs, accs, cats, gls] = await Promise.all([
        base44.entities.Transaction.filter({ created_by: user.email }, "-date", 500),
        base44.entities.Account.filter({ created_by: user.email }, "name"),
        base44.entities.GlobalCategory.list("sort_order"),
        base44.entities.SavingsGoal.filter({ created_by: user.email }, "-created_date").catch(() => []),
      ]);
      setTransactions((txs || []).filter(tx => !tx.is_deleted));
      // dedupe accounts
      const seen = new Set();
      setAccounts((accs || []).filter(a => { if (seen.has(a.name)) return false; seen.add(a.name); return true; }));
      setGlobalCategories((cats || []).filter(c => c.is_active !== false));
      setGoals(gls || []);
    } catch {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  // ---- Category lookup ----
  const getCategoryConfig = useCallback((key) => {
    if (!key) return { emoji: "📦", label: "Lainnya", color: "#95A5A6" };
    // Match by ID first (GlobalCategory id)
    const byId = globalCategories.find(c => c.id === key);
    if (byId) return { emoji: byId.emoji, label: byId.name, color: byId.color || "#888" };
    // Fallback key match
    const byKey = globalCategories.find(c => c.name?.toLowerCase() === key?.toLowerCase());
    if (byKey) return { emoji: byKey.emoji, label: byKey.name, color: byKey.color || "#888" };
    return { emoji: "📦", label: key, color: "#95A5A6" };
  }, [globalCategories]);

  const getAccountName = useCallback((accountId) => {
    if (!accountId) return null;
    const acc = accounts.find(a => a.id === accountId);
    return acc ? `${acc.icon || ""} ${acc.name}`.trim() : null;
  }, [accounts]);

  // ---- Derived month summary ----
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthSummary = useMemo(() => {
    const thisMonth = transactions.filter(tx => tx.date?.startsWith(currentMonthStr));
    return {
      income: thisMonth.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
      expense: thisMonth.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    };
  }, [transactions, currentMonthStr]);

  // ---- Filtering ----
  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.month && filters.month !== currentMonthStr) n++;
    if (filters.categories?.length) n++;
    if (filters.accountId) n++;
    if (filters.type !== "all") n++;
    return n;
  }, [filters, currentMonthStr]);

  const filtered = useMemo(() => {
    let result = [...transactions];
    // Quick type pill (overrides advanced type filter if set)
    const typeFilter = quickType !== "all" ? quickType : filters.type !== "all" ? filters.type : null;
    if (typeFilter) result = result.filter(tx => tx.type === typeFilter);
    // Month filter
    if (filters.month) result = result.filter(tx => tx.date?.startsWith(filters.month));
    // Category filter
    if (filters.categories?.length) result = result.filter(tx => filters.categories.includes(tx.category));
    // Account filter
    if (filters.accountId) result = result.filter(tx => tx.account_id === filters.accountId);
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(tx =>
        (tx.note || "").toLowerCase().includes(q) ||
        String(tx.amount).includes(q)
      );
    }
    return result;
  }, [transactions, quickType, filters, searchQuery]);

  // Reset pagination when filters change
  useEffect(() => { setVisibleCount(30); }, [quickType, filters, searchQuery]);

  const visibleFiltered = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loaderRef.current) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visibleCount < filtered.length) {
        setVisibleCount(c => c + 30);
      }
    }, { threshold: 0.5 });
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [visibleCount, filtered.length]);

  // ---- Grouping ----
  const { groups, sortedKeys } = useMemo(() => {
    const g = {};
    visibleFiltered.forEach(tx => {
      const { key, label, order } = getDateLabel(tx.date);
      if (!g[key]) g[key] = { label, order, items: [] };
      g[key].items.push(tx);
    });
    const sortedKeys = Object.keys(g).sort((a, b) => {
      // Sort by first item date desc
      const aDate = g[a].items[0]?.date || "";
      const bDate = g[b].items[0]?.date || "";
      return bDate.localeCompare(aDate);
    });
    return { groups: g, sortedKeys };
  }, [visibleFiltered]);

  // ---- Actions ----
  async function handleDelete(tx) {
    if (!confirm("Hapus transaksi ini?")) return;
    setTransactions(prev => prev.filter(t => t.id !== tx.id));
    try {
      await base44.entities.Transaction.update(tx.id, { is_deleted: true });
      await base44.functions.invoke("syncTransactionChanges", { action: "delete", oldTransaction: tx }).catch(() => {});
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
      await base44.functions.invoke("syncTransactionChanges", { action: "update", transaction: data, oldTransaction: oldTx }).catch(() => {});
      toast.success("Transaksi diperbarui");
      setEditingTx(null);
    } catch {
      toast.error("Gagal memperbarui");
      loadData();
    }
  }

  function handleApplyFilter(f) {
    setFilters(f);
    storeFilters(f);
  }

  function handleResetFilter() {
    setFilters({ ...DEFAULT_FILTERS });
    storeFilters({ ...DEFAULT_FILTERS });
    setQuickType("all");
  }

  function handleSearchToggle() {
    setShowSearch(v => {
      if (!v) setTimeout(() => searchInputRef.current?.focus(), 100);
      return !v;
    });
    setSearchQuery("");
  }

  // ---- Render ----
  return (
    <PullToRefresh onRefresh={loadData}>
      <div className="min-h-screen bg-[#F2F4F7] pb-28">

        {/* HEADER */}
        <div className="bg-[#0A0A0A] px-5 pt-10 pb-0">
          <div className="max-w-2xl mx-auto">
            {/* Title row */}
            <div className="flex items-center justify-between mb-4">
              {/* Filter icon (left) */}
              <button
                onClick={() => setShowAdvFilter(true)}
                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center relative tap-highlight-fix"
              >
                <SlidersHorizontal className="w-4 h-4 text-white" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F97316] text-[9px] text-white font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <h1 className="text-white text-lg font-bold">Transaksi</h1>

              {/* Search icon (right) */}
              <button
                onClick={handleSearchToggle}
                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center tap-highlight-fix"
              >
                {showSearch ? <X className="w-4 h-4 text-white" /> : <Search className="w-4 h-4 text-white" />}
              </button>
            </div>

            {/* Search bar */}
            {showSearch && (
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8FA4C8]" />
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Cari catatan atau nominal..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 tap-highlight-fix">
                    <X className="w-3.5 h-3.5 text-white/60" />
                  </button>
                )}
              </div>
            )}

            {/* Main tabs */}
            <div className="flex">
              {[["history", "Riwayat"], ["recurring", "Rutin"], ["subscription", "Langganan"]].map(([key, label]) => (
                <button key={key} onClick={() => setMainTab(key)}
                  className={`flex-1 py-3 text-xs font-semibold transition-all border-b-2 ${mainTab === key ? "text-[#F97316] border-[#F97316]" : "text-[#666] border-transparent"}`}>
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

              {/* Quick type pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {[["all", "Semua"], ["income", "Pemasukan"], ["expense", "Pengeluaran"]].map(([key, label]) => (
                  <button key={key}
                    onClick={() => setQuickType(key)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all tap-highlight-fix ${quickType === key ? "bg-[#F97316] text-white" : "bg-white text-[#4A5568] border border-[#E2E8F0]"}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Month summary */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-2xl px-4 py-3 border border-[#F0F2F5]">
                  <p className="text-[10px] text-[#8FA4C8] font-medium mb-1">Pemasukan bulan ini</p>
                  <p className="text-sm font-bold text-[#16A34A]">+{formatCurrency(monthSummary.income)}</p>
                </div>
                <div className="bg-white rounded-2xl px-4 py-3 border border-[#F0F2F5]">
                  <p className="text-[10px] text-[#8FA4C8] font-medium mb-1">Pengeluaran bulan ini</p>
                  <p className="text-sm font-bold text-[#DC2626]">−{formatCurrency(monthSummary.expense)}</p>
                </div>
              </div>

              {/* Active filter chips */}
              {(activeFilterCount > 0 || quickType !== "all") && (
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-[#8FA4C8]">Filter aktif</p>
                  <button onClick={handleResetFilter}
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#F97316]/10 text-[#F97316] text-[10px] font-semibold tap-highlight-fix">
                    <X className="w-2.5 h-2.5" /> Reset semua
                  </button>
                </div>
              )}

              {/* Transactions */}
              {loading ? (
                <div className="bg-white rounded-2xl p-4 space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F2F4F7] animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-[#F2F4F7] rounded-full animate-pulse w-2/3" />
                        <div className="h-2.5 bg-[#F2F4F7] rounded-full animate-pulse w-1/2" />
                      </div>
                      <div className="h-3 bg-[#F2F4F7] rounded-full animate-pulse w-16" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <p className="text-4xl mb-3">{searchQuery ? "🔍" : "📭"}</p>
                  <p className="text-[#1A1A1A] font-semibold text-sm mb-1">
                    {searchQuery ? "Transaksi tidak ditemukan" : "Belum ada transaksi"}
                  </p>
                  <p className="text-[#8FA4C8] text-xs">
                    {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : "Tap tombol + untuk menambah transaksi pertama"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedKeys.map(key => {
                    const group = groups[key];
                    const gIncome = group.items.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
                    const gExpense = group.items.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
                    return (
                      <div key={key}>
                        {/* Group header */}
                        <div className="flex items-center justify-between px-1 mb-1.5">
                          <p className="text-[11px] font-bold text-[#8FA4C8]">{group.label}</p>
                          <div className="flex gap-2 text-[10px]">
                            {gIncome > 0 && <span className="text-[#16A34A] font-semibold">+{formatCurrency(gIncome)}</span>}
                            {gExpense > 0 && <span className="text-[#DC2626] font-semibold">−{formatCurrency(gExpense)}</span>}
                          </div>
                        </div>

                        {/* Items card */}
                        <div className="bg-white rounded-2xl overflow-hidden border border-[#F0F2F5] divide-y divide-[#F8FAFC]">
                          {group.items
                            .sort((a, b) => {
                              // Sort by time desc within same date
                              const aT = (a.date + (a.time ? "T" + a.time : "T23:59"));
                              const bT = (b.date + (b.time ? "T" + b.time : "T23:59"));
                              return bT.localeCompare(aT);
                            })
                            .map(tx => {
                              const cat = getCategoryConfig(tx.category);
                              const accountName = getAccountName(tx.account_id);
                              return (
                                <TransactionItem
                                  key={tx.id}
                                  tx={tx}
                                  cat={cat}
                                  accountName={accountName}
                                  onTap={() => setDetailTx(tx)}
                                  onEdit={() => setEditingTx(tx)}
                                  onDelete={() => handleDelete(tx)}
                                  formatCurrency={formatCurrency}
                                />
                              );
                            })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Infinite scroll loader */}
                  {visibleCount < filtered.length && (
                    <div ref={loaderRef} className="flex justify-center py-4">
                      <div className="w-5 h-5 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {visibleCount >= filtered.length && filtered.length > 30 && (
                    <p className="text-center text-[11px] text-[#CBD5E0] py-2">
                      Semua {filtered.length} transaksi ditampilkan
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        {editingTx && (
          <EditTransactionModal
            transaction={editingTx}
            goals={goals}
            onClose={() => setEditingTx(null)}
            onSave={handleEdit}
          />
        )}

        {showCSVImport && (
          <CSVImportModal onClose={() => setShowCSVImport(false)} onSuccess={loadData} />
        )}

        {detailTx && (
          <TransactionDetailSheet
            tx={detailTx}
            cat={getCategoryConfig(detailTx.category)}
            accountName={getAccountName(detailTx.account_id)}
            onClose={() => setDetailTx(null)}
            onEdit={() => { setDetailTx(null); setEditingTx(detailTx); }}
            onDelete={() => { setDetailTx(null); handleDelete(detailTx); }}
            formatCurrency={formatCurrency}
          />
        )}

        <TransactionAdvancedFilter
          open={showAdvFilter}
          onClose={() => setShowAdvFilter(false)}
          filters={filters}
          onApply={handleApplyFilter}
          onReset={handleResetFilter}
        />
      </div>
    </PullToRefresh>
  );
}