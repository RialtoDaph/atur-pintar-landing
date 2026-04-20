import { X, Pencil, Trash2, Repeat2, Calendar, Wallet, Tag, FileText, Clock } from "lucide-react";

export default function TxDetailSheet({ tx, cat, accountName, onClose, onEdit, onDelete, formatCurrency }) {
  if (!tx) return null;

  const isIncome = tx.type === "income";
  const amountColor = isIncome ? "#22C55E" : tx.type === "savings" ? "#3B82F6" : "#EF4444";
  const amountPrefix = isIncome ? "+" : "−";

  const dateLabel = tx.date
    ? new Date(tx.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "-";

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A1E25] rounded-t-3xl shadow-2xl" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {/* Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <p className="text-base font-bold text-white">Detail Transaksi</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center tap-highlight-fix">
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        {/* Amount hero */}
        <div className="px-5 py-4 flex flex-col items-center border-b border-white/10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3"
            style={{ backgroundColor: (cat?.color || "#F97316") + "25" }}
          >
            {cat?.emoji || "📦"}
          </div>
          <p className="text-3xl font-bold mb-1" style={{ color: amountColor }}>
            {amountPrefix}{formatCurrency(tx.amount)}
          </p>
          <p className="text-sm text-white/60">{cat?.name || cat?.label || tx.category}</p>
        </div>

        {/* Details */}
        <div className="px-5 py-4 space-y-3">
          <DetailRow icon={<Calendar className="w-4 h-4" />} label="Tanggal" value={dateLabel} />
          {tx.time && <DetailRow icon={<Clock className="w-4 h-4" />} label="Waktu" value={tx.time} />}
          {accountName && <DetailRow icon={<Wallet className="w-4 h-4" />} label="Rekening" value={accountName} />}
          {tx.note && <DetailRow icon={<FileText className="w-4 h-4" />} label="Catatan" value={tx.note} />}
          <DetailRow icon={<Tag className="w-4 h-4" />} label="Tipe" value={tx.type === "income" ? "Pemasukan" : tx.type === "savings" ? "Tabungan" : "Pengeluaran"} />
          {(tx.is_recurring || tx.is_recurring_child) && (
            <DetailRow icon={<Repeat2 className="w-4 h-4" />} label="Berulang" value="Ya" />
          )}
        </div>

        {/* Actions */}
        <div className="px-5 pb-6 flex gap-2">
          <button
            onClick={() => { onClose(); onDelete(); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#EF4444]/30 text-[#EF4444] text-sm font-semibold tap-highlight-fix"
          >
            <Trash2 className="w-4 h-4" />
            Hapus
          </button>
          <button
            onClick={() => { onClose(); onEdit(); }}
            className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-[#F97316] text-white text-sm font-bold tap-highlight-fix"
          >
            <Pencil className="w-4 h-4" />
            Edit Transaksi
          </button>
        </div>
      </div>
    </>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-white/40">{label}</p>
        <p className="text-sm text-white font-medium truncate">{value}</p>
      </div>
    </div>
  );
}