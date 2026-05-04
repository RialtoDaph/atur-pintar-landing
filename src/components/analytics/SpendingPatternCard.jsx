import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Clock, Calendar } from "lucide-react";
import { useAppSettings } from "@/components/utils/useAppSettings";

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const DAY_FULL = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function SpendingPatternCard({ transactions = [], filterPeriod = "6", customDateRange = null, embedded = false }) {
  const { formatCurrency, formatShortNumber } = useAppSettings();
  const [tab, setTab] = useState("day"); // "day" | "hour"

  const { dayData, hourData, busiestDay, busiestHour, hasTimeData } = useMemo(() => {
    const now = new Date();
    let start, end;
    if (customDateRange) {
      start = customDateRange.start;
      end = customDateRange.end;
    } else {
      const months = parseInt(filterPeriod);
      start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
      end = now;
    }

    const filtered = transactions.filter((t) => {
      if (t.type !== "expense") return false;
      const d = new Date(t.date);
      return d >= start && d <= end;
    });

    // Day of week aggregation
    const dayTotals = [0, 0, 0, 0, 0, 0, 0];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    filtered.forEach((t) => {
      const d = new Date(t.date);
      const dow = d.getDay();
      dayTotals[dow] += t.amount || 0;
      dayCounts[dow] += 1;
    });
    const dayAverages = dayTotals.map((tot, i) => (dayCounts[i] > 0 ? tot / dayCounts[i] : 0));

    const dayDataArr = DAY_LABELS.map((lbl, i) => ({
      name: lbl,
      fullName: DAY_FULL[i],
      total: dayTotals[i],
      avg: dayAverages[i],
      count: dayCounts[i],
    }));

    let busiest = null;
    let maxTotal = 0;
    dayDataArr.forEach((d) => {
      if (d.total > maxTotal) {
        maxTotal = d.total;
        busiest = d;
      }
    });

    // Hour aggregation (only tx with time field)
    const txWithTime = filtered.filter((t) => t.time && /^\d{1,2}:\d{2}/.test(t.time));
    const hourTotals = Array(24).fill(0);
    const hourCounts = Array(24).fill(0);
    txWithTime.forEach((t) => {
      const h = parseInt(t.time.split(":")[0], 10);
      if (!isNaN(h) && h >= 0 && h < 24) {
        hourTotals[h] += t.amount || 0;
        hourCounts[h] += 1;
      }
    });

    // Group into 6 buckets of 4 hours
    const buckets = [
      { name: "00-04", range: [0, 4], label: "Dini Hari" },
      { name: "04-08", range: [4, 8], label: "Pagi" },
      { name: "08-12", range: [8, 12], label: "Siang Awal" },
      { name: "12-16", range: [12, 16], label: "Siang" },
      { name: "16-20", range: [16, 20], label: "Sore" },
      { name: "20-24", range: [20, 24], label: "Malam" },
    ];

    const hourDataArr = buckets.map((b) => {
      let total = 0, count = 0;
      for (let h = b.range[0]; h < b.range[1]; h++) {
        total += hourTotals[h];
        count += hourCounts[h];
      }
      return { name: b.name, label: b.label, total, count };
    });

    let busiestH = null;
    let maxH = 0;
    hourDataArr.forEach((h) => {
      if (h.total > maxH) {
        maxH = h.total;
        busiestH = h;
      }
    });

    return {
      dayData: dayDataArr,
      hourData: hourDataArr,
      busiestDay: busiest,
      busiestHour: busiestH,
      hasTimeData: txWithTime.length > 0,
    };
  }, [transactions, filterPeriod, customDateRange]);

  const totalDayExpense = dayData.reduce((s, d) => s + d.total, 0);
  const totalHourExpense = hourData.reduce((s, h) => s + h.total, 0);

  const renderDayTab = () => {
    if (totalDayExpense === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="text-3xl mb-2">📅</span>
          <p className="text-xs text-[#8FA4C8]">Belum ada data pengeluaran di periode ini.</p>
        </div>
      );
    }
    const maxVal = Math.max(...dayData.map((d) => d.total));
    return (
      <>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={dayData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8FA4C8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#8FA4C8" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatShortNumber(v)} />
            <Tooltip
              formatter={(v) => [formatCurrency(v), "Total"]}
              labelFormatter={(lbl, payload) => payload?.[0]?.payload?.fullName || lbl}
              contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
            />
            <Bar dataKey="total" radius={[6, 6, 0, 0]}>
              {dayData.map((entry, idx) => (
                <Cell key={idx} fill={entry.total === maxVal ? "#FF6A00" : "#FFC785"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {busiestDay && busiestDay.total > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-[#FFF5F5]">
            <p className="text-[11px] text-[#FF6B6B] font-semibold mb-0.5">Hari Paling Boros</p>
            <p className="text-sm font-bold text-[#1A1A1A]">
              {busiestDay.fullName} · {formatCurrency(busiestDay.total)}
            </p>
            <p className="text-[10px] text-[#8FA4C8] mt-0.5">
              Rata-rata {formatCurrency(busiestDay.avg)} per transaksi · {busiestDay.count} transaksi
            </p>
          </div>
        )}
      </>
    );
  };

  const renderHourTab = () => {
    if (!hasTimeData || totalHourExpense === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="text-3xl mb-2">⏰</span>
          <p className="text-xs text-[#8FA4C8] mb-1">Belum cukup data jam transaksi.</p>
          <p className="text-[10px] text-[#8FA4C8]">Tambah waktu saat catat transaksi untuk lihat polanya.</p>
        </div>
      );
    }
    const maxVal = Math.max(...hourData.map((h) => h.total));
    return (
      <>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={hourData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#8FA4C8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#8FA4C8" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatShortNumber(v)} />
            <Tooltip
              formatter={(v) => [formatCurrency(v), "Total"]}
              labelFormatter={(lbl, payload) => payload?.[0]?.payload?.label || lbl}
              contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
            />
            <Bar dataKey="total" radius={[6, 6, 0, 0]}>
              {hourData.map((entry, idx) => (
                <Cell key={idx} fill={entry.total === maxVal ? "#FF6A00" : "#FFC785"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {busiestHour && busiestHour.total > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-[#FFF5F5]">
            <p className="text-[11px] text-[#FF6B6B] font-semibold mb-0.5">Waktu Paling Boros</p>
            <p className="text-sm font-bold text-[#1A1A1A]">
              {busiestHour.label} ({busiestHour.name}) · {formatCurrency(busiestHour.total)}
            </p>
            <p className="text-[10px] text-[#8FA4C8] mt-0.5">{busiestHour.count} transaksi di jam ini</p>
          </div>
        )}
      </>
    );
  };

  // Embedded mode: keep day/hour sub-toggle (it's a different axis), but skip outer card + main header
  if (embedded) {
    return (
      <>
        <div className="flex bg-[#F2F4F7] rounded-xl p-1 w-fit mb-4">
          <button
            onClick={() => setTab("day")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === "day" ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#8FA4C8]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Hari
          </button>
          <button
            onClick={() => setTab("hour")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === "hour" ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#8FA4C8]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Jam
          </button>
        </div>
        {tab === "day" ? renderDayTab() : renderHourTab()}
      </>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">📊</span>
        <div>
          <h3 className="text-[#1A1A1A] font-bold text-base sm:text-lg leading-tight">Pola Hari & Jam</h3>
          <p className="text-[10px] sm:text-xs text-[#8FA4C8] mt-0.5">Kapan kamu paling boros</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#F2F4F7] rounded-xl p-1 w-fit mb-4">
        <button
          onClick={() => setTab("day")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            tab === "day" ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#8FA4C8]"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Hari
        </button>
        <button
          onClick={() => setTab("hour")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            tab === "hour" ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#8FA4C8]"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Jam
        </button>
      </div>

      {tab === "day" ? renderDayTab() : renderHourTab()}
    </div>
  );
}