import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, ChevronDown, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAppSettings } from "@/components/utils/useAppSettings";
import EditContractModal from "./EditContractModal";

const INTERVAL_LABEL = { daily: "harian", weekly: "mingguan", monthly: "bulanan", yearly: "tahunan" };

function calcMonthly(tx) {
  if (tx.recurring_interval === "yearly") return tx.amount / 12;
  if (tx.recurring_interval === "weekly") return tx.amount * 4.33;
  if (tx.recurring_interval === "daily") return tx.amount * 30;
  return tx.amount;
}

export default function ContractPaymentsCard({ user }) {
  const { formatCurrency } = useAppSettings();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(null); // "income" | "expense" | null
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    loadTemplates();
  }, [user?.email]);

  async function loadTemplates() {
    setLoading(true);
    const all = await base44.entities.Transaction.filter({ is_recurring: true, created_by: user.email });
    setTemplates(all.filter(t => !t.is_recurring_child && t.category !== "subscriptions"));
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm("Hapus transaksi rutin ini?")) return;
    await base44.entities.Transaction.delete(id);
    setTemplates(prev => prev.filter(t => t.id !== id));
  }

  async function handleUpdate(data) {
    await base44.entities.Transaction.update(editingId, data);
    setEditingId(null);
    loadTemplates();
  }

  async function handleAdd(data) {
    await base44.entities.Transaction.create({ ...data, is_recurring: true, is_recurring_child: false });
    setShowAdd(null);
    loadTemplates();
  }

  const incomes = templates.filter(t => t.type === "income");
  const expenses = templates.filter(t => t.type === "expense");

  const totalIncomeMonthly = incomes.reduce((s, t) => s + calcMonthly(t), 0);
  const totalExpenseMonthly = expenses.reduce((s, t) => s + calcMonthly(t), 0);
  const net = totalIncomeMonthly - totalExpenseMonthly;

  const editingContract = editingId ? templates.find(t => t.id === editingId) : null;

  return (
    <>
      <div data-tour="contract-payments-card" className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3.5 tap-highlight-fix"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🔄</span>
            <div className="text-left">
              <p className="text-sm font-bold text-[#1A1A1A]">Gaji & Transaksi Rutin</p>
              <p className="text-[11px] text-[#8FA4C8]">
                {loading ? "Memuat..." : templates.length === 0
                  ? "Belum ada transaksi rutin"
                  : `${templates.length} item · net ${net >= 0 ? "+" : ""}${formatCurrency(net)}/bln`}
              </p>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-[#8FA4C8] transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="border-t border-[#F2F4F7]">
            {/* Summary bar */}
            {templates.length > 0 && (
              <div className="px-4 py-3 bg-[#F8FAFC] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-[#00C9A7]" />
                  <span className="text-[11px] text-[#8FA4C8]">Masuk</span>
                  <span className="text-xs font-bold text-[#00C9A7]">{formatCurrency(totalIncomeMonthly)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-[#FF6B6B]" />
                  <span className="text-[11px] text-[#8FA4C8]">Keluar</span>
                  <span className="text-xs font-bold text-[#FF6B6B]">{formatCurrency(totalExpenseMonthly)}</span>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold ${net >= 0 ? "text-[#00C9A7]" : "text-[#FF6B6B]"}`}>
                    Net {net >= 0 ? "+" : ""}{formatCurrency(net)}/bln
                  </span>
                </div>
              </div>
            )}

            {loading ? (
              <div className="p-4 space-y-2">
                {[1, 2].map(i => <div key={i} className="h-12 bg-[#F2F4F7] rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <>
                {/* Income section */}
                <Section
                  label="💰 Pemasukan Rutin"
                  items={incomes}
                  isIncome
                  onEdit={setEditingId}
                  onDelete={handleDelete}
                  formatCurrency={formatCurrency}
                  onAdd={() => setShowAdd("income")}
                />

                {/* Expense section */}
                <Section
                  label="📤 Pengeluaran Rutin"
                  items={expenses}
                  isIncome={false}
                  onEdit={setEditingId}
                  onDelete={handleDelete}
                  formatCurrency={formatCurrency}
                  onAdd={() => setShowAdd("expense")}
                />
              </>
            )}
          </div>
        )}
      </div>

      {showAdd && (
        <EditContractModal
          contract={{
            type: showAdd,
            recurring_interval: "monthly",
            date: new Date().toISOString().split("T")[0]
          }}
          onClose={() => setShowAdd(null)}
          onSave={handleAdd}
        />
      )}

      {editingContract && (
        <EditContractModal
          contract={editingContract}
          onClose={() => setEditingId(null)}
          onSave={handleUpdate}
        />
      )}
    </>
  );
}

function Section({ label, items, isIncome, onEdit, onDelete, formatCurrency, onAdd }) {
  return (
    <div className="border-t border-[#F2F4F7]">
      <div className="px-4 py-2 flex items-center justify-between bg-[#F8FAFC]">
        <p className="text-[11px] font-bold text-[#8FA4C8] uppercase tracking-wide">{label}</p>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-[11px] text-[#FF6A00] font-semibold hover:opacity-80 tap-highlight-fix"
        >
          <Plus className="w-3 h-3" /> Tambah
        </button>
      </div>

      {items.length === 0 ? (
        <div className="px-4 py-3">
          <button
            onClick={onAdd}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-[#E2E8F0] text-xs font-semibold text-[#8FA4C8] hover:border-[#FF6A00] hover:text-[#FF6A00] transition-colors tap-highlight-fix"
          >
            <Plus className="w-3.5 h-3.5" />
            {isIncome ? "Tambah gaji / pendapatan rutin" : "Tambah tagihan / cicilan rutin"}
          </button>
        </div>
      ) : (
        <div className="divide-y divide-[#F2F4F7]">
          {items.map(tx => (
            <div key={tx.id} className="flex items-center gap-3 px-4 py-3 group hover:bg-[#F8FAFC] transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${isIncome ? "bg-[#00C9A7]/10" : "bg-[#FF6B6B]/10"}`}>
                {isIncome ? "💰" : "📤"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#1A1A1A] truncate">{tx.note || (isIncome ? "Pendapatan" : "Tagihan")}</p>
                <p className="text-[11px] text-[#8FA4C8] flex items-center gap-1">
                  <RefreshCw className="w-2.5 h-2.5" />
                  {INTERVAL_LABEL[tx.recurring_interval] || tx.recurring_interval}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className={`text-xs font-bold ${isIncome ? "text-[#00C9A7]" : "text-[#1A1A1A]"}`}>
                  {isIncome ? "+" : "−"}{formatCurrency(tx.amount)}
                </span>
                <button
                  onClick={() => onEdit(tx.id)}
                  className="p-1.5 rounded-lg text-[#CBD5E0] hover:text-[#4F7CFF] hover:bg-[#F2F4F7] transition-colors opacity-0 group-hover:opacity-100 tap-highlight-fix"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onDelete(tx.id)}
                  className="p-1.5 rounded-lg text-[#CBD5E0] hover:text-[#FF6B6B] hover:bg-[#FFF5F5] transition-colors opacity-0 group-hover:opacity-100 tap-highlight-fix"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}