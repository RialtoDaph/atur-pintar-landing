import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";

export default function ConfirmMarkDoneModal({ title, amount, formatCurrency, onConfirm, onClose }) {
  useLockBodyScroll();
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");

  useEffect(() => {
    base44.entities.Account.filter({}).then((data) => {
      setAccounts(data || []);
      const def = data?.find(a => a.is_default);
      if (def) setSelectedAccountId(def.id);
      else if (data?.[0]) setSelectedAccountId(data[0].id);
    }).catch(() => {});
  }, []);

  async function handleConfirm() {
    setLoading(true);
    await onConfirm(selectedAccountId || null);
    setDone(true);
    setLoading(false);
    setTimeout(() => onClose(), 1400);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0" onClick={!done ? onClose : undefined}>
      <div role="dialog" aria-modal="true" className="bg-white my-32 p-5 text-center rounded-2xl w-full max-w-sm shadow-xl max-h-[90vh] overflow-y-auto overscroll-contain" onClick={(e) => e.stopPropagation()}>
        {done ?
        <div className="flex flex-col items-center gap-3 py-3">
            <div className="w-16 h-16 rounded-full bg-[#00C9A7]/15 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-9 h-9 text-[#00C9A7]" />
            </div>
            <p className="text-sm font-bold text-[#1A1A1A]">Berhasil Dicatat!</p>
            <p className="text-xs text-[#8FA4C8]">Transaksi telah ditambahkan ke riwayat</p>
          </div> :

        <>
            <div className="w-12 h-12 rounded-full bg-[#00C9A7]/10 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-[#00C9A7]" />
            </div>
            <h3 className="text-sm font-bold text-[#1A1A1A] mb-1">Tandai Selesai?</h3>
            <p className="text-xs text-[#8FA4C8] mb-1">{title}</p>
            {amount != null &&
          <p className="text-base font-bold text-[#1A1A1A] mb-4">{formatCurrency(amount)}</p>
          }
            <p className="text-[11px] text-[#8FA4C8] mb-3">
              Transaksi ini akan dicatat ke riwayat pengeluaran hari ini.
            </p>
            {accounts.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] text-[#8FA4C8] font-semibold mb-1 text-left">Potong dari rekening:</p>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/30 focus:border-[#00C9A7] bg-white">
                  <option value="">-- Tidak potong rekening --</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.icon || "💳"} {a.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2">
              <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#8FA4C8] hover:bg-[#F8FAFC] transition-colors tap-highlight-fix">
              
                Batal
              </button>
              <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[#00C9A7] text-white text-sm font-bold disabled:opacity-60 hover:bg-[#00b396] transition-colors tap-highlight-fix">
              
                {loading ? "Mencatat..." : "Ya, Catat!"}
              </button>
            </div>
          </>
        }
      </div>
    </div>);

}