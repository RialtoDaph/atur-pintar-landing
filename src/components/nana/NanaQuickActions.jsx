const QUICK_ACTIONS = [
  { label: "💸 Boleh jajan berapa hari ini?", message: "Hari ini aku boleh jajan berapa biar tetap aman?" },
  { label: "🎯 Progress tabungan aku", message: "Tunjukin progress semua goal tabungan aku" },
  { label: "📊 Analisa bulan ini", message: "Analisa pengeluaran dan pemasukan aku bulan ini" },
  { label: "💡 Saran nabung", message: "Kasih saran nabung yang realistis buat kondisi keuangan aku sekarang" },
  { label: "📅 Tagihan minggu ini", message: "Ada tagihan atau cicilan apa aja yang jatuh tempo minggu ini?" },
  { label: "🏆 Top kategori boros", message: "Kategori apa yang paling boros bulan ini?" },
  { label: "😤 Lagi stress duit", message: "Aku lagi stress soal keuangan, butuh bantuan" },
  { label: "🔥 Roast pengeluaran aku", message: "Roast pengeluaran aku bulan ini" },
];

export default function NanaQuickActions({ onSelect, disabled }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none px-1">
      {QUICK_ACTIONS.map(a => (
        <button
          key={a.label}
          onClick={() => !disabled && onSelect(a.message)}
          disabled={disabled}
          className="flex-shrink-0 text-xs font-semibold bg-white dark:bg-[#1A1E25] border border-[#E2E8F0] dark:border-[#2D2D2D] text-[#1A1A1A] dark:text-white rounded-full px-3 py-1.5 hover:border-[#FF6A00] hover:bg-[#FF6A00]/5 dark:hover:bg-[#FF6A00]/10 transition-all disabled:opacity-40 tap-highlight-fix whitespace-nowrap"
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}