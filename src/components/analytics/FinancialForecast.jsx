import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, Loader2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import { useAppSettings } from "@/components/utils/useAppSettings";

export default function FinancialForecast({ trendData, totalIncome, totalExpenses, savingsRate }) {
  const { formatCurrency, formatShortNumber } = useAppSettings();
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  async function generateForecast() {
    setLoading(true);
    setForecast(null);

    const historyText = trendData.map(d =>
      `${d.name}: Pemasukan ${Math.round(d.Income || 0).toLocaleString("id-ID")}, Pengeluaran ${Math.round(d.Expenses || 0).toLocaleString("id-ID")}`
    ).join("\n");

    const prompt = `Kamu adalah analis keuangan. Berdasarkan data historis berikut, prediksi 3 bulan ke depan (bulan 1, 2, 3 setelah data terakhir).

DATA HISTORIS (Rupiah):
${historyText}

Kembalikan HANYA JSON berikut (tanpa markdown):
{
  "months": [
    {"name": "Bulan +1", "income": 0, "expenses": 0},
    {"name": "Bulan +2", "income": 0, "expenses": 0},
    {"name": "Bulan +3", "income": 0, "expenses": 0}
  ],
  "insight": "Satu kalimat insight singkat tentang tren keuangan ke depan",
  "risk": "low|medium|high"
}`;

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            months: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  income: { type: "number" },
                  expenses: { type: "number" }
                }
              }
            },
            insight: { type: "string" },
            risk: { type: "string" }
          }
        }
      });
      setForecast(res);
    } catch (e) {
      setForecast({ error: true });
    }
    setLoading(false);
  }

  const chartData = [
    ...trendData.map(d => ({ name: d.name, income: d.Income, expenses: d.Expenses, type: "actual" })),
    ...(forecast?.months || []).map(d => ({ name: d.name, forecastIncome: d.income, forecastExpenses: d.expenses, type: "forecast" }))
  ];

  const riskColor = { low: "#00C9A7", medium: "#F5A623", high: "#FF6B6B" };
  const riskLabel = { low: "Rendah ✅", medium: "Sedang ⚠️", high: "Tinggi 🔴" };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

      {expanded && (
        <div className="px-4 sm:px-5 pb-5">
          {/* Chart - historical + forecast */}
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#8FA4C8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#8FA4C8" }} axisLine={false} tickLine={false} tickFormatter={v => formatShortNumber(v)} />
                <Tooltip formatter={(v) => [formatCurrency(v), undefined]} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 11 }} />
                {trendData.length > 0 && <ReferenceLine x={trendData[trendData.length - 1]?.name} stroke="#E2E8F0" strokeDasharray="4 4" label={{ value: "Sekarang", fontSize: 9, fill: "#8FA4C8" }} />}
                <Line type="monotone" dataKey="income" stroke="#00C9A7" strokeWidth={2} dot={{ r: 3 }} name="Pemasukan" connectNulls />
                <Line type="monotone" dataKey="expenses" stroke="#FF6B6B" strokeWidth={2} dot={{ r: 3 }} name="Pengeluaran" connectNulls />
                <Line type="monotone" dataKey="forecastIncome" stroke="#00C9A7" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Prediksi Pemasukan" connectNulls />
                <Line type="monotone" dataKey="forecastExpenses" stroke="#FF6B6B" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Prediksi Pengeluaran" connectNulls />
              </LineChart>
            </ResponsiveContainer>
          )}

          {/* Forecast result */}
          {forecast && !forecast.error && (
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest">Proyeksi</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: riskColor[forecast.risk], backgroundColor: riskColor[forecast.risk] + "20" }}>
                  Risiko: {riskLabel[forecast.risk] || forecast.risk}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {forecast.months.map((m, i) => {
                  const netFlow = m.income - m.expenses;
                  return (
                    <div key={i} className="bg-[#F2F4F7] rounded-xl p-2.5 text-center">
                      <p className="text-[9px] text-[#8FA4C8] mb-1">{m.name}</p>
                      <p className="text-[10px] font-bold text-[#00C9A7]">+{formatShortNumber(m.income)}</p>
                      <p className="text-[10px] font-bold text-[#FF6B6B]">-{formatShortNumber(m.expenses)}</p>
                      <p className={`text-[9px] font-semibold mt-0.5 ${netFlow >= 0 ? "text-[#4F7CFF]" : "text-[#FF6B6B]"}`}>
                        {netFlow >= 0 ? "+" : ""}{formatShortNumber(netFlow)}
                      </p>
                    </div>
                  );
                })}
              </div>
              {forecast.insight && (
                <p className="text-xs text-[#4A5568] bg-[#4F7CFF]/5 border border-[#4F7CFF]/20 rounded-xl p-3">
                  💡 {forecast.insight}
                </p>
              )}
            </div>
          )}

          {forecast?.error && (
            <p className="text-xs text-[#FF6B6B] text-center py-2">Gagal memuat prediksi. Coba lagi.</p>
          )}

          {!forecast && !loading && (
            <button
              onClick={generateForecast}
              className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-[#4F7CFF] hover:bg-[#4F7CFF]/5 rounded-xl transition-colors border border-[#4F7CFF]/20 mt-2"
            >
              <Sparkles className="w-4 h-4" />
              Prediksi dengan AI
            </button>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-[#8FA4C8]">
              <Loader2 className="w-4 h-4 animate-spin text-[#4F7CFF]" />
              AI sedang memproyeksikan keuangan kamu...
            </div>
          )}
        </div>
      )}
    </div>
  );
}