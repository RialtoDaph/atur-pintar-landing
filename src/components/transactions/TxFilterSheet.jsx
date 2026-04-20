import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function TxFilterSheet({ open, onClose, filters, onApply, onReset }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [globalCategories, setGlobalCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    setLocalFilters(filters);
  }, [open]);

  useEffect(() => {
    base44.entities.GlobalCategory.list("sort_order").then(res => {
      setGlobalCategories((res || []).filter(c => c.is_active !== false && !c.is_subcategory));
    }).catch(() => {});
    base44.auth.me().then(u => {
      if (!u?.email) return;
      base44.entities.Account.filter({ created_by: u.email }, "name").then(accs => {
        setAccounts(accs || []);
      }).catch(() => {});
    }).catch(() => {});
  }, []);

  if (!open) return null;

  // Month picker helpers
  const now = new Date();
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    months.push({ key, label });
  }

  function toggleCategory(id) {
    setLocalFilters(prev => {
      const cats = new Set(prev.categoryIds || []);
      cats.has(id) ? cats.delete(id) : cats.add(id);
      return { ...prev, categoryIds: [...cats] };
    });
  }

  function toggleAccount(id) {
    setLocalFilters(prev => {
      const accs = new Set(prev.accountIds || []);
      accs.has(id) ? accs.delete(id) : accs.add(id);
      return { ...prev, accountIds: [...accs] };
    });
  }

  const activeCount = [
    localFilters.month,
    localFilters.type && localFilters.type !== "all",
    (localFilters.categoryIds || []).length > 0,
    (localFilters.accountIds || []).length > 0,
  ].filter(Boolean).length;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A1E25] rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col">
        {/* Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-0 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <p className="text-base font-bold text-white">Filter Transaksi</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center tap-highlight-fix">
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {/* Month */}
          <div>
            <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2">Bulan</p>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setLocalFilters(p => ({ ...p, month: null }))}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all tap-highlight-fix ${!localFilters.month ? "bg-[#F97316] border-[#F97316] text-white" : "border-white/20 text-white/60"}`}
              >
                Semua
              </button>
              {months.map(m => (
                <button
                  key={m.key}
                  onClick={() => setLocalFilters(p => ({ ...p, month: p.month === m.key ? null : m.key }))}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all tap-highlight-fix ${localFilters.month === m.key ? "bg-[#F97316] border-[#F97316] text-white" : "border-white/20 text-white/60"}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2">Tipe</p>
            <div className="flex gap-2">
              {[["all", "Semua"], ["income", "Pemasukan"], ["expense", "Pengeluaran"]].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setLocalFilters(p => ({ ...p, type: key }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all tap-highlight-fix ${localFilters.type === key || (!localFilters.type && key === "all") ? "bg-[#F97316] border-[#F97316] text-white" : "border-white/20 text-white/60"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          {globalCategories.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2">Kategori</p>
              <div className="flex flex-wrap gap-2">
                {globalCategories.map(cat => {
                  const isSelected = (localFilters.categoryIds || []).includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all tap-highlight-fix ${isSelected ? "bg-[#F97316] border-[#F97316] text-white" : "border-white/20 text-white/60"}`}
                    >
                      <span>{cat.emoji}</span>
                      {cat.name}
                      {isSelected && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Accounts */}
          {accounts.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2">Rekening</p>
              <div className="flex flex-wrap gap-2">
                {accounts.map(acc => {
                  const isSelected = (localFilters.accountIds || []).includes(acc.id);
                  return (
                    <button
                      key={acc.id}
                      onClick={() => toggleAccount(acc.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all tap-highlight-fix ${isSelected ? "bg-[#F97316] border-[#F97316] text-white" : "border-white/20 text-white/60"}`}
                    >
                      <span>{acc.icon || "💳"}</span>
                      {acc.name}
                      {isSelected && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="px-5 py-4 border-t border-white/10 flex gap-2 flex-shrink-0" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
          <button
            onClick={() => { onReset(); onClose(); }}
            className="flex-1 py-3 rounded-xl border border-white/20 text-sm font-semibold text-white/70 tap-highlight-fix"
          >
            Reset
          </button>
          <button
            onClick={() => { onApply(localFilters); onClose(); }}
            className="flex-[2] py-3 rounded-xl bg-[#F97316] text-white text-sm font-bold tap-highlight-fix"
          >
            Terapkan {activeCount > 0 ? `(${activeCount})` : ""}
          </button>
        </div>
      </div>
    </>
  );
}