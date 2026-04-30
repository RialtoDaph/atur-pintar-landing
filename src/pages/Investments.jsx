import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PremiumBlurCard from "@/components/subscription/PremiumBlurCard";
import { Plus, Trash2, TrendingUp, TrendingDown, Pencil, ArrowUp, ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAppSettings } from "@/components/utils/useAppSettings";
import { INVESTMENT_TYPES_MAP } from "@/components/investments/investmentConstants";

// ── Add Investment Modal ─────────────────────────────────────────────────────
function AddInvestmentModal({ investment, onClose, onSave }) {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    name: investment?.name || "",
    type: investment?.type || "reksa_dana",
    account_id: investment?.account_id || "",
    initial_amount: investment?.initial_amount || "",
    purchase_date: investment?.purchase_date || new Date().toISOString().split("T")[0],
    notes: investment?.notes || "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.DefaultAccount.filter({ type: "investasi", is_active: true }, "sort_order")
      .then(setAccounts).catch(() => {});
  }, []);

  async function handleSave() {
    if (!form.name || !form.initial_amount) return;
    setSaving(true);
    const data = {
      ...form,
      initial_amount: parseFloat(String(form.initial_amount).replace(/[^0-9.]/g, "")) || 0,
      current_value: investment?.current_value ?? (parseFloat(String(form.initial_amount).replace(/[^0-9.]/g, "")) || 0),
    };
    // On new investment, set current_value = initial_amount
    if (!investment) data.current_value = data.initial_amount;
    await onSave(data);
    setSaving(false);
  }

  const TYPES = ["saham","reksa_dana","crypto","deposito","emas","lainnya"];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#F2F4F7]">
          <p className="font-bold text-[#1A1A1A]">{investment ? "Edit Investasi" : "Tambah Investasi"}</p>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#F2F4F7] text-[#8FA4C8]">✕</button>
        </div>
        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <p className="text-xs font-semibold text-[#8FA4C8] mb-1.5">Nama Investasi</p>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Contoh: Saham BBCA, Bibit, Bitcoin"
              className="w-full px-4 py-3 bg-[#F2F4F7] rounded-xl text-sm text-[#1A1A1A] outline-none focus:ring-2 focus:ring-[#F97316]/30" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#8FA4C8] mb-1.5">Tipe</p>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map(t => {
                const meta = INVESTMENT_TYPES_MAP[t] || {};
                return (
                  <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border-2 transition-all ${form.type === t ? "border-[#F97316] bg-[#FFF7ED] text-[#F97316]" : "border-[#E2E8F0] text-[#4A5568]"}`}>
                    {meta.emoji} {meta.label_id || t}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#8FA4C8] mb-1.5">Platform/Akun (Opsional)</p>
            <select value={form.account_id} onChange={e => setForm(f => ({ ...f, account_id: e.target.value }))}
              className="w-full px-4 py-3 bg-[#F2F4F7] rounded-xl text-sm text-[#1A1A1A] outline-none">
              <option value="">Pilih platform</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#8FA4C8] mb-1.5">Modal Awal</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA4C8] font-medium text-sm">Rp</span>
              <input type="text" inputMode="numeric"
                value={form.initial_amount ? Number(String(form.initial_amount).replace(/[^0-9]/g,"")).toLocaleString("id-ID") : ""}
                onChange={e => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setForm(f => ({ ...f, initial_amount: raw }));
                }}
                placeholder="0"
                className="w-full pl-10 pr-4 py-3 bg-[#F2F4F7] rounded-xl text-sm text-[#1A1A1A] outline-none focus:ring-2 focus:ring-[#F97316]/30 font-bold" />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#8FA4C8] mb-1.5">Tanggal Beli</p>
            <input type="date" value={form.purchase_date} onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))}
              className="w-full px-4 py-3 bg-[#F2F4F7] rounded-xl text-sm text-[#1A1A1A] outline-none" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#8FA4C8] mb-1.5">Catatan (Opsional)</p>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Catatan tambahan..."
              rows={2}
              className="w-full px-4 py-3 bg-[#F2F4F7] rounded-xl text-sm text-[#1A1A1A] outline-none resize-none" />
          </div>
        </div>
        <div className="px-5 pb-6 pt-2">
          <button onClick={handleSave} disabled={saving || !form.name || !form.initial_amount}
            className="w-full py-3.5 bg-[#F97316] text-white rounded-2xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
            {investment ? "Simpan Perubahan" : "Tambah Investasi"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Transaction Modal ────────────────────────────────────────────────────
function AddTransactionModal({ investment, onClose, onSave }) {
  const [form, setForm] = useState({
    type: "buy",
    amount: "",
    transaction_date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.amount) return;
    setSaving(true);
    await onSave({
      investment_id: investment.id,
      type: form.type,
      total_amount: parseFloat(String(form.amount).replace(/[^0-9.]/g, "")) || 0,
      transaction_date: form.transaction_date,
      notes: form.notes,
    });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#F2F4F7]">
          <div>
            <p className="font-bold text-[#1A1A1A]">Tambah Transaksi</p>
            <p className="text-xs text-[#8FA4C8]">{investment.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#F2F4F7] text-[#8FA4C8]">✕</button>
        </div>
        <div className="px-5 py-4 space-y-4">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setForm(f => ({ ...f, type: "buy" }))}
              className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${form.type === "buy" ? "border-[#00C9A7] bg-[#00C9A7]/10 text-[#00C9A7]" : "border-[#E2E8F0] text-[#4A5568]"}`}>
              📈 Beli
            </button>
            <button onClick={() => setForm(f => ({ ...f, type: "sell" }))}
              className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${form.type === "sell" ? "border-[#FF6B6B] bg-[#FF6B6B]/10 text-[#FF6B6B]" : "border-[#E2E8F0] text-[#4A5568]"}`}>
              📉 Jual
            </button>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#8FA4C8] mb-1.5">Nominal</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA4C8] font-medium text-sm">Rp</span>
              <input type="text" inputMode="numeric"
                value={form.amount ? Number(String(form.amount).replace(/[^0-9]/g,"")).toLocaleString("id-ID") : ""}
                onChange={e => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setForm(f => ({ ...f, amount: raw }));
                }}
                placeholder="0"
                className="w-full pl-10 pr-4 py-3 bg-[#F2F4F7] rounded-xl text-sm text-[#1A1A1A] outline-none focus:ring-2 focus:ring-[#F97316]/30 font-bold" />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#8FA4C8] mb-1.5">Tanggal</p>
            <input type="date" value={form.transaction_date} onChange={e => setForm(f => ({ ...f, transaction_date: e.target.value }))}
              className="w-full px-4 py-3 bg-[#F2F4F7] rounded-xl text-sm text-[#1A1A1A] outline-none" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#8FA4C8] mb-1.5">Catatan (Opsional)</p>
            <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Catatan..."
              className="w-full px-4 py-3 bg-[#F2F4F7] rounded-xl text-sm text-[#1A1A1A] outline-none" />
          </div>
        </div>
        <div className="px-5 pb-6 pt-2">
          <button onClick={handleSave} disabled={saving || !form.amount}
            className="w-full py-3.5 bg-[#F97316] text-white rounded-2xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
            Simpan Transaksi
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function InvestmentsPage() {
  const { formatCurrency } = useAppSettings();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingInv, setEditingInv] = useState(null);
  const [showAddTx, setShowAddTx] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); }).catch(() => {});
  }, []);

  useEffect(() => { if (user) loadData(); }, [user]);

  async function loadData() {
    setLoading(true);
    const inv = await base44.entities.Investment.filter({ created_by: user.email }, "-created_date").catch(() => []);
    setInvestments(inv || []);
    setLoading(false);
  }

  async function handleSave(data) {
    if (editingInv) {
      await base44.entities.Investment.update(editingInv.id, data);
    } else {
      await base44.entities.Investment.create(data);
    }
    setShowAdd(false);
    setEditingInv(null);
    loadData();
  }

  async function handleAddTransaction(txData) {
    // Create the transaction record
    await base44.entities.InvestmentTransaction.create(txData);

    // Update current_value: buy = add, sell = subtract
    const inv = investments.find(i => i.id === txData.investment_id);
    if (inv) {
      const delta = txData.type === "buy" ? txData.total_amount : -txData.total_amount;
      const newValue = (inv.current_value || 0) + delta;
      await base44.entities.Investment.update(txData.investment_id, { current_value: newValue });
    }

    setShowAddTx(null);
    loadData();
  }

  async function handleDelete(id) {
    if (!window.confirm("Hapus investasi ini?")) return;
    await base44.entities.Investment.delete(id);
    setInvestments(prev => prev.filter(i => i.id !== id));
  }

  const isPremium = user?.subscription_plan === "premium_monthly" || user?.subscription_plan === "premium_yearly";

  if (!loading && !isPremium) {
    return (
      <div className="min-h-screen bg-[#F2F4F7] pb-8">
        <div className="bg-[#0A0A0A] px-5 pt-10 pb-6">
          <div className="max-w-2xl mx-auto">
            <p className="text-[#8FA4C8] text-sm font-medium">Portofolio</p>
            <h1 className="text-white text-2xl font-bold mt-0.5">Investasi</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-5 mt-6 space-y-4">
          <PremiumBlurCard>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="font-bold text-[#1A1A1A] mb-2">Portofolio Investasi</p>
              <div className="space-y-3">
                {["Reksa Dana - Pertumbuhan", "Saham BBCA", "Emas Digital"].map((n, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-[#F2F4F7] pb-2">
                    <span className="text-sm text-[#1A1A1A]">{n}</span>
                    <span className="text-sm font-bold text-[#00C9A7]">+{(i+1)*3}.{i+1}%</span>
                  </div>
                ))}
              </div>
            </div>
          </PremiumBlurCard>
        </div>
      </div>
    );
  }

  const totalModal = investments.reduce((s, i) => s + (i.initial_amount || 0), 0);
  const totalNilai = investments.reduce((s, i) => s + (i.current_value || 0), 0);
  const totalUntungRugi = totalNilai - totalModal;
  const isPortfolioPositive = totalUntungRugi >= 0;

  return (
    <div className="min-h-screen bg-[#F2F4F7] pb-8">
      {/* Header */}
      <div className="bg-[#0A0A0A] px-5 pt-10 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[#8FA4C8] text-sm font-medium">Portofolio</p>
              <h1 className="text-white text-2xl font-bold mt-0.5">Investasi</h1>
            </div>
            <button
              onClick={() => { setEditingInv(null); setShowAdd(true); }}
              className="w-10 h-10 rounded-full bg-[#FF6A00] flex items-center justify-center shadow-lg"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Portfolio Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-2xl p-3 border border-white/5">
              <p className="text-[#8FA4C8] text-[10px] font-semibold uppercase">Total Modal</p>
              <p className="text-white text-sm font-bold mt-1">{formatCurrency(totalModal)}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 border border-white/5">
              <p className="text-[#8FA4C8] text-[10px] font-semibold uppercase">Nilai Sekarang</p>
              <p className="text-white text-sm font-bold mt-1">{formatCurrency(totalNilai)}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 border border-white/5">
              <p className="text-[#8FA4C8] text-[10px] font-semibold uppercase">Untung/Rugi</p>
              <div className="flex items-center gap-1 mt-1">
                {isPortfolioPositive
                  ? <ArrowUp className="w-3 h-3 text-[#00C9A7]" />
                  : <ArrowDown className="w-3 h-3 text-[#FF6B6B]" />}
                <p className={`text-sm font-bold ${isPortfolioPositive ? "text-[#00C9A7]" : "text-[#FF6B6B]"}`}>
                  {formatCurrency(Math.abs(totalUntungRugi))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Cards */}
      <div className="max-w-2xl mx-auto px-5 mt-4 space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-40 animate-pulse" />)
        ) : investments.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm mt-4">
            <TrendingUp className="w-10 h-10 text-[#8FA4C8] mx-auto mb-3" />
            <p className="text-[#4A5568] font-semibold">Belum ada investasi</p>
            <p className="text-[#8FA4C8] text-sm mt-1">Tap + untuk menambahkan investasi pertamamu</p>
            <button onClick={() => setShowAdd(true)}
              className="mt-4 px-5 py-2.5 bg-[#F97316] text-white rounded-full text-sm font-bold">
              Tambah Investasi
            </button>
          </div>
        ) : investments.map(inv => {
          const type = INVESTMENT_TYPES_MAP[inv.type] || INVESTMENT_TYPES_MAP.lainnya;
          const gain = (inv.current_value || 0) - (inv.initial_amount || 0);
          const gainPct = inv.initial_amount > 0 ? ((gain / inv.initial_amount) * 100).toFixed(1) : "0.0";
          const isPos = gain >= 0;

          return (
            <div key={inv.id} className="bg-white rounded-2xl p-5 shadow-sm">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F97316]/10 flex items-center justify-center text-xl">
                    {type.emoji}
                  </div>
                  <div>
                    <p className="font-bold text-[#1A1A1A]">{inv.name}</p>
                    <p className="text-xs text-[#8FA4C8]">{type.label_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingInv(inv); setShowAdd(true); }}
                    className="p-2 text-[#CBD5E0] hover:text-[#F97316] transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(inv.id)}
                    className="p-2 text-[#CBD5E0] hover:text-[#FF6B6B] transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="p-3 bg-[#F8FAFC] rounded-xl">
                  <p className="text-[10px] text-[#8FA4C8] font-semibold uppercase">Modal Awal</p>
                  <p className="text-sm font-bold text-[#1A1A1A] mt-1">{formatCurrency(inv.initial_amount)}</p>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-xl">
                  <p className="text-[10px] text-[#8FA4C8] font-semibold uppercase">Nilai Skrg</p>
                  <p className="text-sm font-bold text-[#1A1A1A] mt-1">{formatCurrency(inv.current_value)}</p>
                </div>
                <div className={`p-3 rounded-xl ${isPos ? "bg-[#00C9A7]/10" : "bg-[#FF6B6B]/10"}`}>
                  <p className="text-[10px] text-[#8FA4C8] font-semibold uppercase">Untung/Rugi</p>
                  <div className="flex flex-col mt-1">
                    <p className={`text-xs font-bold ${isPos ? "text-[#00C9A7]" : "text-[#FF6B6B]"}`}>
                      {isPos ? "+" : ""}{formatCurrency(gain)}
                    </p>
                    <p className={`text-[10px] font-semibold ${isPos ? "text-[#00C9A7]" : "text-[#FF6B6B]"}`}>
                      {isPos ? "+" : ""}{gainPct}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-[#F2F4F7] pt-3">
                <button onClick={() => setShowAddTx(inv.id)}
                  className="text-xs font-bold text-[#F97316] hover:text-[#e05e00]">
                  + Tambah Transaksi
                </button>
                <Link to={`${createPageUrl("InvestmentDetail")}?id=${inv.id}`}
                  className="text-xs font-semibold text-[#8FA4C8] hover:text-[#1A1A1A]">
                  Lihat Detail →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {showAdd && (
        <AddInvestmentModal
          investment={editingInv}
          onClose={() => { setShowAdd(false); setEditingInv(null); }}
          onSave={handleSave}
        />
      )}

      {showAddTx && (
        <AddTransactionModal
          investment={investments.find(i => i.id === showAddTx)}
          onClose={() => setShowAddTx(null)}
          onSave={handleAddTransaction}
        />
      )}
    </div>
  );
}