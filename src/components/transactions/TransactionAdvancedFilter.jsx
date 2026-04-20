import { useState, useEffect } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function TransactionAdvancedFilter({ open, onClose, filters, onApply, onReset }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, open]);

  useEffect(() => {
    if (!open) return;
    Promise.all([
      base44.entities.GlobalCategory.list("sort_order"),
      base44.auth.me().then(u => base44.entities.Account.filter({ created_by: u.email }, "name")),
    ]).then(([cats, accs]) => {
      setCategories((cats || []).filter(c => c.is_active !== false));
      setAccounts(accs || []);
    }).catch(() => {});
  }, [open]);

  if (!open) return null;

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  function toggleCategory(id) {
    setLocalFilters(f => {
      const cats = new Set(f.categories || []);
      cats.has(id) ? cats.delete(id) : cats.add(id);
      return { ...f, categories: [...cats] };
    });
  }

  function toggleAccount(id) {
    setLocalFilters(f => ({ ...f, accountId: f.accountId === id ? "" : id }));
  }

  const parentCats = categories.filter(c => !c.is_subcategory);

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mt-3 mb-1" />

        <div className="flex items-center justify-between px-5 py-3 border-b border-[#F2F4F7]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#F97316]" />
            <p className="text-sm font-bold text-[#1A1A1A]">Filter Lanjutan</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F2F4F7] flex items-center justify-center tap-highlight-fix">
            <X className="w-4 h-4 text-[#8FA4C8]" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5 pb-8">
          {/* Month */}
          <div>
            <p className="text-[11px] font-bold text-[#8FA4C8] uppercase tracking-widest mb-2">Bulan</p>
            <input
              type="month"
              value={localFilters.month || currentMonth}
              onChange={e => setLocalFilters(f => ({ ...f, month: e.target.value }))}
              className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#F97316] bg-[#F8FAFC]"
            />
          </div>

          {/* Type */}
          <div>
            <p className="text-[11px] font-bold text-[#8FA4C8] uppercase tracking-widest mb-2">Tipe</p>
            <div className="flex gap-2">
              {[["all", "Semua"], ["income", "Pemasukan"], ["expense", "Pengeluaran"]].map(([key, label]) => (
                <button key={key}
                  onClick={() => setLocalFilters(f => ({ ...f, type: key }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all tap-highlight-fix ${localFilters.type === key ? "bg-[#F97316] text-white border-[#F97316]" : "border-[#E2E8F0] text-[#4A5568]"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          {parentCats.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-[#8FA4C8] uppercase tracking-widest mb-2">Kategori</p>
              <div className="flex flex-wrap gap-1.5">
                {parentCats.map(cat => {
                  const active = (localFilters.categories || []).includes(cat.id);
                  return (
                    <button key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all tap-highlight-fix ${active ? "bg-[#F97316] text-white border-[#F97316]" : "border-[#E2E8F0] text-[#4A5568]"}`}>
                      <span>{cat.emoji}</span> {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Accounts */}
          {accounts.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-[#8FA4C8] uppercase tracking-widest mb-2">Rekening</p>
              <div className="flex flex-wrap gap-2">
                {accounts.map(acc => {
                  const active = localFilters.accountId === acc.id;
                  return (
                    <button key={acc.id}
                      onClick={() => toggleAccount(acc.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all tap-highlight-fix ${active ? "bg-[#F97316] text-white border-[#F97316]" : "border-[#E2E8F0] text-[#4A5568]"}`}>
                      <span>{acc.icon || "💳"}</span> {acc.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => { onReset(); onClose(); }}
              className="flex-1 py-3 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#8FA4C8] tap-highlight-fix"
            >
              Reset
            </button>
            <button
              onClick={() => { onApply(localFilters); onClose(); }}
              className="flex-1 py-3 rounded-xl bg-[#F97316] text-white text-sm font-bold tap-highlight-fix"
            >
              Terapkan Filter
            </button>
          </div>
        </div>
      </div>
    </>
  );
}