import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useAppSettings } from "@/components/utils/AppSettingsContext";

const INVESTMENT_TYPE_COLORS = {
  saham: "#4F7CFF",
  reksa_dana: "#00C9A7",
  crypto: "#F5A623",
  deposito: "#9B59B6",
  obligasi: "#3498DB",
  emas: "#F1C40F",
  lainnya: "#95A5A6",
};

const INVESTMENT_TYPE_LABELS = {
  id: { saham: "Saham", reksa_dana: "Reksa Dana", crypto: "Crypto", deposito: "Deposito", obligasi: "Obligasi", emas: "Emas", lainnya: "Lainnya" },
  en: { saham: "Stocks", reksa_dana: "Mutual Fund", crypto: "Crypto", deposito: "Deposit", obligasi: "Bonds", emas: "Gold", lainnya: "Other" },
};

export default function DiversificationChart({ investments, totalValue, formatCurrency }) {
  const { t, settings } = useAppSettings();
  const labels = INVESTMENT_TYPE_LABELS[settings.language] || INVESTMENT_TYPE_LABELS.id;

  const byType = {};
  investments.forEach(inv => {
    const key = inv.type || "lainnya";
    byType[key] = (byType[key] || 0) + (inv.current_value || 0);
  });

  const pieData = Object.entries(byType)
    .map(([key, value]) => ({
      key,
      name: labels[key] || key,
      value,
      color: INVESTMENT_TYPE_COLORS[key] || "#95A5A6",
    }))
    .sort((a, b) => b.value - a.value);

  if (pieData.length === 0) return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h2 className="font-bold text-[#1A1A1A] text-base mb-4">{t('diversification_portfolio') || 'Diversifikasi Portofolio'}</h2>
      <p className="text-sm text-[#8FA4C8] text-center py-8">{t('investments_empty_title')}</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h2 className="font-bold text-[#1A1A1A] text-base mb-4">{t('diversification_portfolio') || 'Diversifikasi Portofolio'}</h2>
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
            {pieData.map((entry) => (
              <Cell key={entry.key} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [formatCurrency(value), ""]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {pieData.map((item) => {
          const pct = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0;
          return (
            <div key={item.key} className="flex items-center gap-2 p-2 bg-[#F8FAFC] rounded-lg">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
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