import { X, Pencil, Trash2, Repeat2, CreditCard, Calendar, Clock, Tag } from "lucide-react";

export default function TransactionDetailSheet({ tx, cat, accountName, onClose, onEdit, onDelete, formatCurrency }) {
  if (!tx) return null;
  const isIncome = tx.type === "income";
  const isSavings = tx.type === "savings";
  const amountColor = isIncome ? "#16A34A" : isSavings ? "#3B82F6" : "#DC2626";
  const amountPrefix = isIncome ? "+" : isSavings ? "" : "−";

  const dateLabel = (() => {
    const d = new Date(tx.date);
    return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  })();

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mt-3 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#F2F4F7]">
          <p className="text-sm font-bold text-[#1A1A1A]">Detail Transaksi</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F2F4F7] flex items-center justify-center tap-highlight-fix">
            <X className="w-4 h-4 text-[#8FA4C8]" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Amount hero */}
          <div className="text-center py-4 bg-[#F8FAFC] rounded-2xl">
            <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl"
              style={{ backgroundColor: (cat.color || "#888") + "22" }}>
              {cat.emoji}
            </div>
            <p className="text-2xl font-bold" style={{ color: amountColor }}>
              {amountPrefix}{formatCurrency(tx.amount)}
            </p>
            <p className="text-sm text-[#8FA4C8] mt-1">{cat.label}</p>
          </div>

          {/* Details */}
          <div className="space-y-3">
            {tx.note && (
              <DetailRow icon={<Tag className="w-4 h-4" />} label="Catatan" value={tx.note} />
            )}
            <DetailRow icon={<Calendar className="w-4 h-4" />} label="Tanggal" value={dateLabel} />
            {tx.time && (
              <DetailRow icon={<Clock className="w-4 h-4" />} label="Waktu" value={tx.time} />
            )}
            {accountName && (
              <DetailRow icon={<CreditCard className="w-4 h-4" />} label="Rekening" value={accountName} />
            )}
            {(tx.is_recurring || tx.is_recurring_child) && (
              <DetailRow icon={<Repeat2 className="w-4 h-4" />} label="Tipe" value="Transaksi Rutin" />
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { onClose(); onEdit(); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FFF3E8] text-[#F97316] text-sm font-bold tap-highlight-fix"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={() => { onClose(); onDelete(); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FEF2F2] text-[#EF4444] text-sm font-bold tap-highlight-fix"
            >
              <Trash2 className="w-4 h-4" /> Hapus
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-[#F8FAFC]">
      <div className="w-8 h-8 rounded-xl bg-[#F2F4F7] flex items-center justify-center text-[#8FA4C8] flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[#8FA4C8] font-medium">{label}</p>
        <p className="text-sm font-semibold text-[#1A1A1A] truncate">{value}</p>
      </div>
    </div>
  );
}