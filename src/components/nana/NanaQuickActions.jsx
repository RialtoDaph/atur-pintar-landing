const QUICK_ACTIONS = [
  {
    icon: "💸",
    title: "Boleh jajan berapa?",
    desc: "Cek budget aman buat hari ini",
    message: "Hari ini aku boleh jajan berapa biar tetap aman?",
  },
  {
    icon: "🎯",
    title: "Progress tabungan aku",
    desc: "Lihat semua goal & sisa target",
    message: "Tunjukin progress semua goal tabungan aku",
  },
  {
    icon: "📊",
    title: "Analisa bulan ini",
    desc: "Pemasukan vs pengeluaran",
    message: "Analisa pengeluaran dan pemasukan aku bulan ini",
  },
  {
    icon: "📅",
    title: "Tagihan minggu ini",
    desc: "Yang jatuh tempo 7 hari",
    message: "Ada tagihan atau cicilan apa aja yang jatuh tempo minggu ini?",
  },
  {
    icon: "🏆",
    title: "Kategori paling boros",
    desc: "Top spending bulan ini",
    message: "Kategori apa yang paling boros bulan ini?",
  },
  {
    icon: "💡",
    title: "Saran nabung",
    desc: "Realistis sesuai kondisi aku",
    message: "Kasih saran nabung yang realistis buat kondisi keuangan aku sekarang",
  },
  {
    icon: "🔥",
    title: "Roast pengeluaran aku",
    desc: "Bikin sadar boros di mana",
    message: "Roast pengeluaran aku bulan ini",
  },
];

export default function NanaQuickActions({ onSelect, disabled }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none px-1 -mx-1">
      {QUICK_ACTIONS.map((a) => (
        <button
          key={a.title}
          onClick={() => !disabled && onSelect(a.message)}
          disabled={disabled}
          className="flex-shrink-0 w-[180px] text-left bg-white dark:bg-[#1A1E25] border border-[#E2E8F0] dark:border-[#2D2D2D] rounded-2xl px-3 py-2.5 hover:border-[#FF6A00] hover:bg-[#FF6A00]/5 dark:hover:bg-[#FF6A00]/10 transition-all disabled:opacity-40 tap-highlight-fix shadow-sm"
        >
          <div className="flex items-start gap-2">
            <span className="text-lg leading-none mt-0.5">{a.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[#1A1A1A] dark:text-white leading-tight truncate">
                {a.title}
              </p>
              <p className="text-[11px] text-[#8FA4C8] mt-0.5 leading-snug line-clamp-2">
                {a.desc}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}