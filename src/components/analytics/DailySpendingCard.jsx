import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, ComposedChart } from "recharts";
import { ChevronRight, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { formatRupiah } from "@/components/utils/formatRupiah";
import { useAppSettings } from "@/components/utils/useAppSettings";

export default function DailySpendingCard({
  transactions,
  filterPeriod,
  customDateRange,
  onNavigateToDetail
}) {
  const navigate = useNavigate();
  const { formatShortNumber } = useAppSettings();
  const [expanded, setExpanded] = require("react").useState(true);
  const now = new Date();

      {/* Chart */}
      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={currentMonthlyData}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8FA4C8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#8FA4C8" }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => [formatRupiah(value), undefined]}
            contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
          />
          <Bar dataKey="value" fill="#FF6B6B" radius={[6, 6, 0, 0]} />
          <Line dataKey="value" stroke="#FF6B6B" strokeDasharray="5,5" dot={false} strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Summary */}
      <div className="mt-4 flex items-baseline gap-2">
        <p className="text-sm text-[#8FA4C8]">Ø</p>
        <p className="text-xl sm:text-2xl font-bold text-[#0A0A0A]">{formatShortNumber(currentDailyAvg)}</p>
        <p className="text-sm text-[#8FA4C8]">/Hari</p>
      </div>

      <div className="flex items-center gap-1">
        {isTrendPositive ? (
          <TrendingUp className="w-4 h-4 text-[#FF6B6B]" />
        ) : (
          <TrendingDown className="w-4 h-4 text-[#00C9A7]" />
        )}
        <span className={`text-sm font-semibold ${isTrendPositive ? "text-[#FF6B6B]" : "text-[#00C9A7]"}`}>
          {isTrendPositive ? "+" : ""}{formatShortNumber(trendDiff)}
        </span>
      </div>
      <span className="text-xs text-[#8FA4C8]">vs periode sebelumnya</span>
      </div>

      {/* Button */}
      <button
      onClick={handleNavigate}
      className="mt-4 flex items-center gap-2 text-[#00C9A7] text-sm font-medium hover:opacity-80 transition-opacity"
      >
      Lihat Detail
      <ChevronRight className="w-4 h-4" />
      </button>
      </>
      )}
      </div>
      );
}