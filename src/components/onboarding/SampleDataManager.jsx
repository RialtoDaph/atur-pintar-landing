import { useState } from "react";
import { Sparkles, Trash2, X, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAppSettings } from "@/components/utils/useAppSettings";

const SAMPLE_DATA_KEY = "sample_data_ids";

function getSampleIds() {
  try {
    return JSON.parse(localStorage.getItem(SAMPLE_DATA_KEY) || "null");
  } catch {
    return null;
  }
}

function saveSampleIds(ids) {
  localStorage.setItem(SAMPLE_DATA_KEY, JSON.stringify(ids));
}

export function hasSampleData() {
  return !!getSampleIds();
}

export async function seedSampleData() {
  const now = new Date();
  const m = (offset = 0) => {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return d;
  };

  const day = (monthOffset, dayNum) => {
    const d = new Date(now.getFullYear(), now.getMonth() + monthOffset, dayNum);
    return d.toISOString().split("T")[0];
  };

  const transactions = [
    // Bulan ini - income
    { amount: 8500000, type: "income", category: "salary", note: "Gaji Bulanan", date: day(0, 1) },
    { amount: 500000, type: "income", category: "freelance", note: "Project freelance desain", date: day(0, 5) },

    // Bulan ini - expense
    { amount: 1200000, type: "expense", category: "food", note: "Belanja bulanan Indomaret", date: day(0, 3) },
    { amount: 350000, type: "expense", category: "food", note: "GoFood - makan siang", date: day(0, 6) },
    { amount: 150000, type: "expense", category: "food", note: "Kopi & snack Starbucks", date: day(0, 8) },
    { amount: 2500000, type: "expense", category: "rent", note: "Sewa kos bulanan", date: day(0, 1) },
    { amount: 200000, type: "expense", category: "bills", note: "Tagihan listrik PLN", date: day(0, 4) },
    { amount: 85000, type: "expense", category: "bills", note: "Tagihan internet Indihome", date: day(0, 7) },
    { amount: 120000, type: "expense", category: "transport", note: "Grab - perjalanan kerja", date: day(0, 9) },
    { amount: 450000, type: "expense", category: "shopping", note: "Beli baju di Zara", date: day(0, 10) },
    { amount: 99000, type: "expense", category: "entertainment", note: "Langganan Netflix", date: day(0, 2) },
    { amount: 59000, type: "expense", category: "entertainment", note: "Langganan Spotify", date: day(0, 2) },
    { amount: 180000, type: "expense", category: "health", note: "Vitamin & suplemen", date: day(0, 11) },

    // Bulan lalu
    { amount: 8500000, type: "income", category: "salary", note: "Gaji Bulanan", date: day(-1, 1) },
    { amount: 1100000, type: "expense", category: "food", note: "Belanja bulanan", date: day(-1, 3) },
    { amount: 320000, type: "expense", category: "food", note: "Makan di restoran", date: day(-1, 8) },
    { amount: 2500000, type: "expense", category: "rent", note: "Sewa kos bulanan", date: day(-1, 1) },
    { amount: 200000, type: "expense", category: "bills", note: "Listrik PLN", date: day(-1, 5) },
    { amount: 85000, type: "expense", category: "bills", note: "Internet Indihome", date: day(-1, 7) },
    { amount: 210000, type: "expense", category: "transport", note: "Grab & Gojek", date: day(-1, 12) },
    { amount: 750000, type: "expense", category: "shopping", note: "Belanja online Tokopedia", date: day(-1, 15) },
    { amount: 99000, type: "expense", category: "entertainment", note: "Netflix", date: day(-1, 2) },
    { amount: 300000, type: "expense", category: "health", note: "Check-up dokter", date: day(-1, 20) },

    // 2 bulan lalu
    { amount: 8500000, type: "income", category: "salary", note: "Gaji Bulanan", date: day(-2, 1) },
    { amount: 400000, type: "income", category: "freelance", note: "Jual foto stok", date: day(-2, 14) },
    { amount: 950000, type: "expense", category: "food", note: "Belanja bulanan", date: day(-2, 4) },
    { amount: 2500000, type: "expense", category: "rent", note: "Sewa kos bulanan", date: day(-2, 1) },
    { amount: 200000, type: "expense", category: "bills", note: "Listrik PLN", date: day(-2, 5) },
    { amount: 85000, type: "expense", category: "bills", note: "Internet", date: day(-2, 7) },
    { amount: 175000, type: "expense", category: "transport", note: "Bensin & parkir", date: day(-2, 10) },
    { amount: 1200000, type: "expense", category: "shopping", note: "Sepatu Nike", date: day(-2, 18) },
    { amount: 99000, type: "expense", category: "entertainment", note: "Netflix", date: day(-2, 2) },
  ];

  const debts = [
    {
      name: "KPR BCA",
      total_amount: 450000000,
      remaining_amount: 390000000,
      interest_rate: 8.5,
      monthly_payment: 3500000,
      due_date: day(0, 15),
      type: "kpr",
      status: "active",
      icon: "🏠"
    },
    {
      name: "Kartu Kredit Mandiri",
      total_amount: 15000000,
      remaining_amount: 7500000,
      interest_rate: 24,
      monthly_payment: 1500000,
      due_date: day(0, 20),
      type: "kartu_kredit",
      status: "active",
      icon: "💳"
    }
  ];

  const goals = [
    {
      name: "Dana Darurat",
      target_amount: 50000000,
      current_amount: 18000000,
      icon: "🛡️",
      color: "#00C9A7",
      deadline: day(1, 1),
      status: "active",
      description: "6x pengeluaran bulanan sebagai dana darurat"
    },
    {
      name: "Liburan ke Jepang",
      target_amount: 25000000,
      current_amount: 7500000,
      icon: "✈️",
      color: "#FF6A00",
      deadline: day(8, 1),
      status: "active",
      description: "Tabungan untuk liburan impian ke Jepang"
    }
  ];

  const [txResults, debtResults, goalResults] = await Promise.all([
    base44.entities.Transaction.bulkCreate(transactions),
    base44.entities.Debt.bulkCreate(debts),
    base44.entities.SavingsGoal.bulkCreate(goals),
  ]);

  const ids = {
    transactions: txResults.map(t => t.id),
    debts: debtResults.map(d => d.id),
    goals: goalResults.map(g => g.id),
  };

  saveSampleIds(ids);
  return ids;
}

export async function deleteSampleData() {
  const ids = getSampleIds();
  if (!ids) return;

  const promises = [
    ...ids.transactions.map(id => base44.entities.Transaction.delete(id).catch(() => {})),
    ...ids.debts.map(id => base44.entities.Debt.delete(id).catch(() => {})),
    ...ids.goals.map(id => base44.entities.SavingsGoal.delete(id).catch(() => {})),
  ];

  await Promise.all(promises);
  localStorage.removeItem(SAMPLE_DATA_KEY);
}

// Banner widget shown on dashboard
export default function SampleDataBanner({ onDismiss }) {
  const [deleting, setDeleting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  async function handleDelete() {
    setDeleting(true);
    await deleteSampleData();
    setDeleting(false);
    setDismissed(true);
    onDismiss?.();
  }

  return (
    <div className="bg-gradient-to-r from-[#FF6A00]/10 to-[#FF6A00]/5 border border-[#FF6A00]/20 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <Sparkles className="w-4 h-4 text-[#FF6A00] flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#1A1A1A]">Data contoh aktif</p>
          <p className="text-[10px] text-[#8FA4C8] leading-tight">Grafik menggunakan data simulasi. Hapus saat siap input data nyata.</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FF6B6B]/10 hover:bg-[#FF6B6B]/20 text-[#FF6B6B] text-[10px] font-bold transition-colors tap-highlight-fix"
        >
          {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
          Hapus
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="w-6 h-6 flex items-center justify-center rounded-lg text-[#8FA4C8] hover:text-[#1A1A1A] tap-highlight-fix"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}