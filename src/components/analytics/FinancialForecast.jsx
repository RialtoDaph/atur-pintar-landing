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
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4F7CFF] to-[#9B59B6] flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1A1A1A]">Proyeksi 3 Bulan</p>
            <p className="text-xs text-[#8FA4C8]">Prediksi AI berdasarkan data historis</p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-[#8FA4C8] hover:text-[#1A1A1A] transition-colors tap-highlight-fix"
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="px-4 sm:px-5 pb-5 space-y-4">
          {!forecast && !loading && (
            <button
              onClick={generateForecast}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-[#FF6A00] hover:bg-[#FF6A00]/5 transition-colors rounded-lg"
            >
              <Sparkles className="w-4 h-4" />
              Hasilkan Proyeksi
            </button>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 py-5 text-sm text-[#8FA4C8]">
              <Loader2 className="w-4 h-4 animate-spin text-[#FF6A00]" />
              AI sedang menganalisis data...
            </div>
          )}

          {forecast && !loading && !forecast.error && (
            <>
              {/* Chart */}
              {chartData.length > 0 && (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#8FA4C8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#8FA4C8" }} axisLine={false} tickLine={false} tickFormatter={v => formatShortNumber(v)} />
                    <Tooltip formatter={(v) => [formatCurrency(v), undefined]} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
                    <Line type="monotone" dataKey="income" stroke="#00C9A7" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="forecastIncome" stroke="#00C9A7" strokeWidth={2} strokeDasharray="5,5" dot={false} />
                    <Line type="monotone" dataKey="expenses" stroke="#FF6B6B" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="forecastExpenses" stroke="#FF6B6B" strokeWidth={2} strokeDasharray="5,5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {/* Insight */}
              <div className="bg-[#F2F4F7] rounded-lg p-3 border border-[#E2E8F0]">
                <p className="text-xs text-[#8FA4C8] font-medium mb-1">Insight AI</p>
                <p className="text-sm text-[#1A1A1A]">{forecast.insight}</p>
              </div>

              {/* Risk Level */}
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: (riskColor[forecast.risk] || riskColor.medium) + "15" }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: riskColor[forecast.risk] || riskColor.medium }} />
                <span className="text-xs font-semibold" style={{ color: riskColor[forecast.risk] || riskColor.medium }}>
                  Tingkat Risiko: {riskLabel[forecast.risk] || riskLabel.medium}
                </span>
              </div>

              {/* Forecast Summary */}
              {forecast.months && forecast.months.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {forecast.months.map((m, i) => (
                    <div key={i} className="bg-[#F2F4F7] rounded-lg p-2 text-center text-xs">
                      <p className="text-[9px] text-[#8FA4C8] font-medium mb-1 truncate">{m.name}</p>
                      <p className="text-[10px] font-bold text-[#00C9A7]">I: {formatShortNumber(m.income)}</p>
                      <p className="text-[10px] font-bold text-[#FF6B6B]">E: {formatShortNumber(m.expenses)}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Regenerate button */}
              <button
                onClick={generateForecast}
                className="w-full text-xs text-[#8FA4C8] hover:text-[#FF6A00] py-2 transition-colors"
              >
                Regenerasi Proyeksi
              </button>
            </>
          )}

          {forecast?.error && (
            <div className="text-xs text-[#FF6B6B] text-center py-4">
              Gagal membuat proyeksi. Coba lagi.
            </div>
          )}
        </div>
      )}
    </div>
  );
}