import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const INVESTMENT_TYPES = {
  saham: { label: "Saham", color: "#4F7CFF" },
  reksa_dana: { label: "Reksa Dana", color: "#00C9A7" },
  crypto: { label: "Crypto", color: "#F5A623" },
  deposito: { label: "Deposito", color: "#9B59B6" },
  obligasi: { label: "Obligasi", color: "#3498DB" },
  emas: { label: "Emas", color: "#F1C40F" },
  lainnya: { label: "Lainnya", color: "#95A5A6" },
};

export default function DiversificationChart({ investments, totalValue, formatCurrency }) {
  const byType = {};
  investments.forEach(inv => {
    const t = inv.type || "lainnya";
    byType[t] = (byType[t] || 0) + (inv.current_value || 0);
  });

  const pieData = Object.entries(byType)
    .map(([key, value]) => ({
      name: INVESTMENT_TYPES[key]?.label || key,
      value,
      color: INVESTMENT_TYPES[key]?.color || "#95A5A6",
    }))
    .sort((a, b) => b.value - a.value);

  if (pieData.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h2 className="font-bold text-[#1A1A1A] text-base mb-4">Diversifikasi Portofolio</h2>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={2}
          >
            {pieData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [formatCurrency(value), ""]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {pieData.map((item, i) => {
          const pct = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0;
          return (
            <div key={i} className="flex items-center gap-2 p-2 bg-[#F8FAFC] rounded-lg">
              <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#1A1A1A] truncate">{item.name}</p>
                <p className="text-[10px] text-[#8FA4C8]">{pct}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}