import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, TrendingUp, TrendingDown, Pencil, Wallet } from "lucide-react";
import AddInvestmentModal from "@/components/investments/AddInvestmentModal.jsx";
import { useAppSettings } from "@/components/utils/useAppSettings";

const INVESTMENT_TYPES_EMOJI = {
  reksa_dana: { emoji: "📈", label: "Reksa Dana" },
  saham: { emoji: "📊", label: "Saham" },
  crypto: { emoji: "🪙", label: "Kripto" },
  emas: { emoji: "🥇", label: "Emas" },
  deposito: { emoji: "🏦", label: "Deposito" },
  obligasi: { emoji: "📄", label: "Obligasi" },
  lainnya: { emoji: "💼", label: "Lainnya" },
};

export default function InvestmentsPage() {
  const { formatCurrency } = useAppSettings();
  const [investments, setInvestments] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingInv, setEditingInv] = useState(null);
  const [user, setUser] = useState(null);
  const [groupBy, setGroupBy] = useState("none"); // "none" | "wallet"

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      loadData(u);
    }).catch(() => setLoading(false));
  }, []);

  async function loadData(u) {
    setLoading(true);
    const [inv, accs] = await Promise.all([
      base44.entities.Investment.filter({ created_by: u.email }, "-created_date"),
      base44.entities.Account.filter({ created_by: u.email, type: "investment" }).catch(() => []),
    ]);
    setInvestments(inv || []);
    setAccounts(accs || []);
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Hapus investasi ini?")) return;
    setInvestments(prev => prev.filter(inv => inv.id !== id));
    await base44.entities.Investment.delete(id);
  }

  function handleEdit(inv) {
    setEditingInv(inv);
    setShowAdd(true);
  }

  async function handleSave(data) {
    if (editingInv) {
      await base44.entities.Investment.update(editingInv.id, data);
    } else {
      await base44.entities.Investment.create(data);
    }
    setShowAdd(false);
    setEditingInv(null);
    loadData(user);
  }

  const totalInvested = investments.reduce((s, i) => s + (i.initial_amount || 0), 0);
  const totalValue = investments.reduce((s, i) => s + (i.current_value || 0), 0);
  const totalGain = totalValue - totalInvested;
  const gainPercent = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : 0;
  const isPositiveTotal = totalGain >= 0;

  // Group by wallet
  const grouped = groupBy === "wallet"
    ? accounts.reduce((acc, wallet) => {
        acc[wallet.id] = { wallet, items: investments.filter(i => i.account_id === wallet.id) };
        return acc;
      }, { __none: { wallet: null, items: investments.filter(i => !i.account_id) } })
    : null;

  function InvestmentCard({ inv }) {
    const type = INVESTMENT_TYPES_EMOJI[inv.type] || INVESTMENT_TYPES_EMOJI.lainnya;
    const gain = (inv.current_value || 0) - (inv.initial_amount || 0);
    const gainPct = inv.initial_amount > 0 ? ((gain / inv.initial_amount) * 100).toFixed(2) : 0;
    const isPos = gain >= 0;
    const walletName = accounts.find(a => a.id === inv.account_id)?.name;

    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#FF6A00]/10 flex items-center justify-center text-xl">
              {inv.icon || type.emoji}
            </div>
            <div>
              <p className="font-semibold text-[#1A1A1A]">{inv.name}</p>
              <p className="text-xs text-[#8FA4C8]">
                {type.label}
                {walletName && <span className="ml-1">· {walletName}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleEdit(inv)} className="text-[#CBD5E0] hover:text-[#FF6A00] transition-colors">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => handleDelete(inv.id)} className="text-[#CBD5E0] hover:text-[#FF6B6B] transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-end">
          <div>
            <p className="text-xs text-[#8FA4C8]">Nilai Saat Ini</p>
            <p className="font-bold text-[#1A1A1A] text-lg">{formatCurrency(inv.current_value)}</p>
            <p className="text-xs text-[#8FA4C8]">Modal: {formatCurrency(inv.initial_amount)}</p>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-1 justify-end px-3 py-1.5 rounded-xl ${isPos ? "bg-[#00C9A7]/10" : "bg-[#FF6B6B]/10"}`}>
              {isPos ? <TrendingUp className="w-3.5 h-3.5 text-[#00C9A7]" /> : <TrendingDown className="w-3.5 h-3.5 text-[#FF6B6B]" />}
              <p className={`font-bold text-sm ${isPos ? "text-[#00C9A7]" : "text-[#FF6B6B]"}`}>
                {isPos ? "+" : ""}{gainPct}%
              </p>
            </div>
            <p className={`text-xs font-semibold mt-1 ${isPos ? "text-[#00C9A7]" : "text-[#FF6B6B]"}`}>
              {isPos ? "+" : ""}{formatCurrency(gain)}
            </p>
          </div>
        </div>

        {inv.purchase_date && (
          <p className="text-xs text-[#CBD5E0] mt-2">Beli: {inv.purchase_date}</p>
        )}
        {inv.notes && <p className="text-xs text-[#8FA4C8] mt-1 italic">{inv.notes}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F4F7] pb-10">
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
              className="w-10 h-10 rounded-full bg-[#FF6A00] flex items-center justify-center shadow-lg hover:bg-[#e05e00] transition-colors"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Summary Card */}
          {investments.length > 0 && (
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-[#8FA4C8] text-xs mb-1">Modal</p>
                  <p className="text-white font-bold text-sm">{formatCurrency(totalInvested)}</p>
                </div>
                <div>
                  <p className="text-[#8FA4C8] text-xs mb-1">Nilai Sekarang</p>
                  <p className="text-white font-bold text-sm">{formatCurrency(totalValue)}</p>
                </div>
                <div>
                  <p className="text-[#8FA4C8] text-xs mb-1">Untung/Rugi</p>
                  <p className={`font-bold text-sm ${isPositiveTotal ? "text-[#00C9A7]" : "text-[#FF6B6B]"}`}>
                    {isPositiveTotal ? "+" : ""}{gainPercent}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 mt-4 space-y-4">
        {/* Group toggle — only show if there are investment accounts */}
        {accounts.length > 0 && investments.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => setGroupBy("none")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${groupBy === "none" ? "bg-[#FF6A00] text-white" : "bg-white text-[#8FA4C8]"}`}
            >
              Semua
            </button>
            <button
              onClick={() => setGroupBy("wallet")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${groupBy === "wallet" ? "bg-[#FF6A00] text-white" : "bg-white text-[#8FA4C8]"}`}
            >
              <Wallet className="w-3 h-3" /> Per Dompet
            </button>
          </div>
        )}

        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse shadow-sm" />)
        ) : investments.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <TrendingUp className="w-12 h-12 text-[#8FA4C8] mx-auto mb-3" />
            <p className="text-[#4A5568] font-semibold">Belum ada investasi</p>
            <p className="text-[#8FA4C8] text-sm mt-1">Tambahkan investasi pertama kamu</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 bg-[#FF6A00] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#e05e00] transition-colors"
            >
              + Tambah Investasi
            </button>
          </div>
        ) : groupBy === "wallet" ? (
          // Grouped view
          Object.entries(grouped).map(([key, { wallet, items }]) => {
            if (items.length === 0) return null;
            const walletTotal = items.reduce((s, i) => s + (i.current_value || 0), 0);
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{wallet?.icon || "💼"}</span>
                    <p className="text-sm font-bold text-[#1A1A1A]">{wallet?.name || "Tanpa Dompet"}</p>
                  </div>
                  <p className="text-sm font-bold text-[#FF6A00]">{formatCurrency(walletTotal)}</p>
                </div>
                <div className="space-y-3">
                  {items.map(inv => <InvestmentCard key={inv.id} inv={inv} />)}
                </div>
              </div>
            );
          })
        ) : (
          // Flat view
          investments.map(inv => <InvestmentCard key={inv.id} inv={inv} />)
        )}
      </div>

      {showAdd && (
        <AddInvestmentModal
          investment={editingInv}
          onClose={() => { setShowAdd(false); setEditingInv(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}