import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { formatRupiah } from "@/components/utils/formatRupiah";
import { useAppSettings } from "@/components/utils/useAppSettings";
import { ChevronLeft, Settings } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function SpendingDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { formatShortNumber } = useAppSettings();

  const type = searchParams.get("type") || "daily";
  const period = searchParams.get("period") || "6";

  const [transactions, setTransactions] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const now = new Date();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      Promise.all([
        base44.entities.Transaction.filter({ created_by: user.email }, "-date", 500),
        base44.entities.CustomCategory.list("-created_date")
      ]).then(([t, cc]) => {
        setTransactions(t);
        setCustomCategories(cc);
        setLoading(false);
      });
    }
  }, [user]);

  const getMonthRange = () => {
    const months = parseInt(period);
    return {
      start: new Date(now.getFullYear(), now.getMonth() - (months - 1), 1),
      end: now,
    };
  };

  const monthRange = getMonthRange();

  // Filter transactions
  const restaurantCatId = customCategories.find(
    c => c.name?.toLowerCase().includes("restoran") || c.name?.toLowerCase().includes("restaurant")
  )?.id;

  const barCatId = customCategories.find(
    c => c.name?.toLowerCase().includes("bar") || c.name?.toLowerCase().includes("minuman")
  )?.id;

  const isRestaurantBar = (tx) => {
    if (restaurantCatId && tx.category === `custom_${restaurantCatId}`) return true;
    if (barCatId && tx.category === `custom_${barCatId}`) return true;
    return false;
  };

  const filteredTransactions = transactions.filter(t => {
    const td = new Date(t.date);
    const inRange = td >= monthRange.start && td <= monthRange.end;
    const isExpense = t.type === "expense";

    if (type === "daily") {
      return inRange && isExpense;
    } else if (type === "restaurant_bar") {
      return inRange && isExpense && isRestaurantBar(t);
    }
    return false;
  });

  // Group by month
  const groupedByMonth = useMemo(() => {
    const groups = {};
    filteredTransactions.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(t);
    });
    return groups;
  }, [filteredTransactions]);

  // Calculate stats
  const totalSpent = filteredTransactions.reduce((s, t) => s + t.amount, 0);
  const totalDays = Math.ceil(
    (monthRange.end - monthRange.start) / (1000 * 60 * 60 * 24)
  ) + 1;
  const dailyAverage = totalSpent / totalDays;

  // Calculate previous period trend
  const prevMonthRange = {
    start: new Date(monthRange.start.getFullYear(), monthRange.start.getMonth() - (parseInt(period)), 1),
    end: new Date(monthRange.start.getFullYear(), monthRange.start.getMonth(), 0),
  };

  const prevTransactions = transactions.filter(t => {
    const td = new Date(t.date);
    const inRange = td >= prevMonthRange.start && td <= prevMonthRange.end;
    const isExpense = t.type === "expense";

    if (type === "daily") {
      return inRange && isExpense;
    } else if (type === "restaurant_bar") {
      return inRange && isExpense && isRestaurantBar(t);
    }
    return false;
  });

  const prevTotalDays = Math.ceil(
    (prevMonthRange.end - prevMonthRange.start) / (1000 * 60 * 60 * 24)
  ) + 1;
  const prevTotal = prevTransactions.reduce((s, t) => s + t.amount, 0);
  const prevDailyAvg = prevTotal / prevTotalDays;

  const trendDiff = dailyAverage - prevDailyAvg;

  // Format title
  const title = type === "daily" ? "Pengeluaran Harian" : "Restaurant & Bar";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F4F7] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#00C9A7] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F4F7] pb-10">
      {/* Header */}
      <div className="bg-[#0A0A0A] px-5 pt-6 pb-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(createPageUrl("Analytics"))}
            className="flex items-center gap-2 text-[#8FA4C8] text-sm mb-4 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-white text-2xl font-bold">{title}</h1>
            <Settings className="w-5 h-5 text-[#8FA4C8]" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 mt-6 space-y-5">
        {/* Stats */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#8FA4C8] font-medium mb-1">Rata-rata Harian</p>
              <p className="text-xl sm:text-2xl font-bold text-[#0A0A0A]">{formatShortNumber(dailyAverage)}</p>
              <p className="text-xs text-[#8FA4C8] mt-1">/Hari</p>
            </div>
            <div>
              <p className="text-xs text-[#8FA4C8] font-medium mb-1">Tren</p>
              <p className={`text-xl sm:text-2xl font-bold ${trendDiff >= 0 ? "text-[#FF6B6B]" : "text-[#00C9A7]"}`}>
                {trendDiff >= 0 ? "+" : ""}{formatShortNumber(trendDiff)}
              </p>
              <p className="text-xs text-[#8FA4C8] mt-1">/Bulan</p>
            </div>
          </div>
        </div>

        {/* Berdasarkan info */}
        <div className="text-sm text-[#8FA4C8]">
          Berdasarkan pada {Object.keys(groupedByMonth).length} bulan terakhir
        </div>

        {/* Transactions grouped by month */}
        <div className="space-y-4">
          {Object.entries(groupedByMonth)
            .sort()
            .reverse()
            .map(([monthKey, monthTxs]) => {
              const [year, month] = monthKey.split("-");
              const monthDate = new Date(year, parseInt(month) - 1);
              const monthLabel = monthDate.toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric"
              });
              const monthTotal = monthTxs.reduce((s, t) => s + t.amount, 0);

              return (
                <div key={monthKey} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                  <button className="w-full flex items-center justify-between hover:opacity-80 transition-opacity">
                    <div>
                      <p className="font-bold text-[#0A0A0A]">{monthLabel}</p>
                      <p className="text-xs text-[#8FA4C8] mt-0.5">
                        {monthTxs.length} {monthTxs.length === 1 ? "transaksi" : "transaksi"}
                      </p>
                    </div>
                    <p className="font-bold text-[#0A0A0A]">{formatRupiah(monthTotal)}</p>
                  </button>

                  {/* Expandable detail */}
                  <div className="mt-3 space-y-2 border-t border-[#E2E8F0] pt-3">
                    {monthTxs
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map(tx => (
                        <div key={tx.id} className="flex items-center justify-between text-sm">
                          <div className="flex-1 min-w-0">
                            <p className="text-[#0A0A0A] truncate">{tx.note}</p>
                            <p className="text-xs text-[#8FA4C8]">
                              {new Date(tx.date).toLocaleDateString("id-ID")}
                            </p>
                          </div>
                          <p className="font-semibold text-[#0A0A0A] ml-2 whitespace-nowrap">
                            {formatRupiah(tx.amount)}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#8FA4C8]">Tidak ada data transaksi untuk periode ini</p>
          </div>
        )}
      </div>
    </div>
  );
}