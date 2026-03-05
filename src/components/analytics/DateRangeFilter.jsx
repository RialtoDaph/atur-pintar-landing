import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function DateRangeFilter({ onFilterChange, defaultPeriod = "6" }) {
  const [period, setPeriod] = useState(defaultPeriod);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const handlePeriodChange = (value) => {
    setPeriod(value);
    setShowCustom(false);
    onFilterChange({ type: "period", value });
  };

  const handleCustomRange = () => {
    if (customStart && customEnd) {
      onFilterChange({
        type: "custom",
        startDate: customStart,
        endDate: customEnd,
      });
    }
  };

  const periodOptions = [
    { label: "3 Bulan", value: "3" },
    { label: "6 Bulan", value: "6" },
    { label: "12 Bulan", value: "12" },
    { label: "Custom", value: "custom" },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm mb-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <p className="text-sm font-medium text-[#0A0A0A]">Rentang Waktu:</p>
        <div className="flex gap-2 flex-wrap">
          {periodOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                if (opt.value === "custom") {
                  setShowCustom(true);
                  setPeriod("custom");
                } else {
                  handlePeriodChange(opt.value);
                }
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === opt.value
                  ? "bg-[#FF6A00] text-white"
                  : "bg-[#F2F4F7] text-[#0A0A0A] hover:bg-[#E2E8F0]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range */}
      {showCustom && (
        <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="text-xs text-[#8FA4C8] font-medium block mb-1">
              Dari
            </label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#F2F4F7] text-[#0A0A0A] text-sm border border-[#E2E8F0] focus:outline-none focus:border-[#FF6A00]"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-[#8FA4C8] font-medium block mb-1">
              Sampai
            </label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#F2F4F7] text-[#0A0A0A] text-sm border border-[#E2E8F0] focus:outline-none focus:border-[#FF6A00]"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleCustomRange}
              disabled={!customStart || !customEnd}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#FF6A00] text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Terapkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}