import { useState, useEffect } from "react";
import { X, RotateCcw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

function TxFilterBottomSheetInner({ filters, onApply, onClose }) {
  useLockBodyScroll();
  const [localFilters, setLocalFilters] = useState(filters);
  const [globalCategories, setGlobalCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    Promise.all([
      base44.entities.GlobalCategory.list("sort_order").catch(() => []),
      base44.auth.me().then(u => base44.entities.Account.filter({ created_by: u.email }, "name")).catch(() => []),
    ]).then(([cats, accs]) => {
      setGlobalCategories((cats || []).filter(c => c.is_active !== false && c.is_subcategory !== true));
      setAccounts(accs || []);
    });
  }, []);

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  function toggleCategory(id) {
    setLocalFilters(f => {
      const cats = f.categories || [];
      return { ...f, categories: cats.includes(id) ? cats.filter(c => c !== id) : [...cats, id] };
    });
  }

  function handleReset() {
    const now = new Date();
    const reset = {
      month: now.getMonth(),
      year: now.getFullYear(),
      type: "all",
      categories: [],
      accountId: "",
    };
    onApply(reset);
    onClose();
  }

  function handleApply() {
    onApply(localFilters);
    onClose();
  }

  const activeCount = [
    (localFilters.categories || []).length > 0,
    !!localFilters.accountId,
    localFilters.type !== "all",
  ].filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md shadow-2xl flex flex-col"
        style={{ maxHeight: "min(92dvh, calc(100dvh - 2rem))" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header — sticky */}
        <div className="flex-shrink-0">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-[#E2E8F0]" />
          </div>
          <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b border-[#F2F4F7]">
            <p className="text-base font-bold text-[#1A1A1A]">Filter Transaksi</p>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F2F4F7] flex items-center justify-center tap-highlight-fix">
              <X className="w-4 h-4 text-[#4A5568]" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="px-5 py-5 space-y-5 overflow-y-auto overscroll-contain flex-1">
          {/* Month picker */}
          <div>
            <p className="text-xs font-bold text-[#8FA4C8] uppercase tracking-widest mb-2">Bulan</p>
            <div className="flex gap-2 mb-2">
              {years.map(y => (
                <button key={y} onClick={() => setLocalFilters(f => ({ ...f, year: y }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all tap-highlight-fix ${localFilters.year === y ? "bg-[#F97316] text-white border-[#F97316]" : "border-[#E2E8F0] text-[#4A5568]"}`}>
                  {y}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {MONTHS.map((m, i) => (
                <button key={i} onClick={() => setLocalFilters(f => ({ ...f, month: i }))}
                  className={`py-2 rounded-xl text-[11px] font-semibold transition-all tap-highlight-fix ${localFilters.month === i ? "bg-[#F97316] text-white" : "bg-[#F2F4F7] text-[#4A5568]"}`}>
                  {m.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Type filter */}
          <div>
            <p className="text-xs font-bold text-[#8FA4C8] uppercase tracking-widest mb-2">Tipe</p>
            <div className="flex gap-2">
              {[["all", "Semua"], ["income", "Pemasukan"], ["expense", "Pengeluaran"]].map(([val, label]) => (
                <button key={val} onClick={() => setLocalFilters(f => ({ ...f, type: val }))}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all tap-highlight-fix ${localFilters.type === val ? "bg-[#F97316] text-white" : "bg-[#F2F4F7] text-[#4A5568]"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Category multi-select */}
          {globalCategories.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#8FA4C8] uppercase tracking-widest mb-2">Kategori</p>
              <div className="flex flex-wrap gap-2">
                {globalCategories.map(cat => {
                  const selected = (localFilters.categories || []).includes(cat.id);
                  return (
                    <button key={cat.id} onClick={() => toggleCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all tap-highlight-fix ${selected ? "bg-[#F97316] text-white border-[#F97316]" : "border-[#E2E8F0] text-[#4A5568] bg-[#F8FAFC]"}`}>
                      <span>{cat.emoji}</span>{cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Account filter */}
          {accounts.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#8FA4C8] uppercase tracking-widest mb-2">Rekening</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setLocalFilters(f => ({ ...f, accountId: "" }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all tap-highlight-fix ${!localFilters.accountId ? "bg-[#F97316] text-white border-[#F97316]" : "border-[#E2E8F0] text-[#4A5568] bg-[#F8FAFC]"}`}>
                  Semua
                </button>
                {accounts.map(acc => (
                  <button key={acc.id} onClick={() => setLocalFilters(f => ({ ...f, accountId: acc.id }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all tap-highlight-fix ${localFilters.accountId === acc.id ? "bg-[#F97316] text-white border-[#F97316]" : "border-[#E2E8F0] text-[#4A5568] bg-[#F8FAFC]"}`}>
                    <span>{acc.icon || "💳"}</span>{acc.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky footer — always visible */}
        <div className="px-5 py-4 border-t border-[#F2F4F7] flex gap-3 flex-shrink-0" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
          <button onClick={handleReset}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#4A5568] tap-highlight-fix">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button onClick={handleApply}
            className="flex-1 py-3 rounded-xl bg-[#F97316] text-white text-sm font-bold tap-highlight-fix">
            Terapkan Filter {activeCount > 0 ? `(${activeCount})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TxFilterBottomSheet({ open, filters, onApply, onClose }) {
  if (!open) return null;
  return <TxFilterBottomSheetInner filters={filters} onApply={onApply} onClose={onClose} />;
}