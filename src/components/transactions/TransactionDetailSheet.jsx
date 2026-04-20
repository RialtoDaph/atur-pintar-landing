import { X, Pencil, Trash2, Repeat2, Target, Wallet, Calendar, Clock } from "lucide-react";

export default function TransactionDetailSheet({ tx, cat, accountName, onClose, onEdit, onDelete, formatCurrency }) {
  if (!tx) return null;

  const isIncome = tx.type === "income";
  const amountColor = isIncome ? "#16A34A" : tx.type === "savings" ? "#3B82F6" : "#EF4444";
  const amountPrefix = isIncome ? "+" : "−";

  const dateObj = new Date(tx.date);
  const dateLabel = dateObj.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl w-full max-w-md shadow-2xl pb-safe"
        style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#E2E8F0]" />
        </div>

        {/* Close btn */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3">
          <p className="text-sm font-semibold text-[#8FA4C8]">Detail Transaksi</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F2F4F7] flex items-center justify-center tap-highlight-fix">
            <X className="w-4 h-4 text-[#4A5568]" />
          </button>
        </div>

        {/* Amount hero */}
        <div className="px-5 pb-5 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3"
            style={{ backgroundColor: (cat?.color || "#888") + "18" }}
          >
            {cat?.emoji || "📦"}
          </div>
          <p className="text-3xl font-bold" style={{ color: amountColor }}>
            {amountPrefix}{formatCurrency(tx.amount)}
          </p>
          <p className="text-sm font-semibold text-[#1A1A1A] mt-1">{cat?.label || tx.category}</p>
          {tx.note && <p className="text-xs text-[#8FA4C8] mt-1">{tx.note}</p>}
        </div>

        {/* Details */}
        <div className="mx-5 bg-[#F8FAFC] rounded-2xl divide-y divide-[#F2F4F7] mb-5">
          <DetailRow icon={<Calendar className="w-3.5 h-3.5" />} label="Tanggal" value={dateLabel} />
          {tx.time && <DetailRow icon={<Clock className="w-3.5 h-3.5" />} label="Waktu" value={tx.time} />}
          {accountName && <DetailRow icon={<Wallet className="w-3.5 h-3.5" />} label="Rekening" value={accountName} />}
          {(tx.is_recurring || tx.is_recurring_child) && (
            <DetailRow icon={<Repeat2 className="w-3.5 h-3.5" />} label="Jenis" value="Transaksi Rutin" highlight />
          )}
        </div>

        {/* Actions */}
        <div className="px-5 flex gap-3">
          <button
            onClick={() => { onClose(); onEdit(); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#F97316] text-white text-sm font-bold tap-highlight-fix"
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={() => { onClose(); onDelete(); }}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FEF2F2] text-[#EF4444] text-sm font-bold tap-highlight-fix"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value, highlight }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2 text-[#8FA4C8]">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className={`text-xs font-semibold ${highlight ? "text-[#F97316]" : "text-[#1A1A1A]"}`}>{value}</span>
    </div>
  );
}