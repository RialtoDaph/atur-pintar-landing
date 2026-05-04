import { useState } from "react";
import { Trophy, Calendar, Coffee, Flame, Scale } from "lucide-react";
import BehaviorInsightsCard from "./BehaviorInsightsCard";
import SpendingPatternCard from "./SpendingPatternCard";
import SpendingHeatmapCard from "./SpendingHeatmapCard";

/**
 * BehaviorInsightsTabs — Gabungkan 5 behavior view jadi 1 card dengan tabs.
 * Tabs: Merchant, 50/30/20, No-Spend, Pola Hari/Jam, Heatmap
 */
export default function BehaviorInsightsTabs({ transactions, filterPeriod, customDateRange, allCategoriesConfig }) {
  const [tab, setTab] = useState("merchant");

  const tabs = [
    { id: "merchant", label: "Merchant", icon: Trophy },
    { id: "lifestyle", label: "50/30/20", icon: Scale },
    { id: "nospend", label: "No-Spend", icon: Coffee },
    { id: "pattern", label: "Pola", icon: Calendar },
    { id: "heatmap", label: "Heatmap", icon: Flame },
  ];

  const activeTab = tabs.find((t) => t.id === tab);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F2F4F7] flex items-center justify-center text-xl flex-shrink-0">
            🧠
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[#0A0A0A] font-bold text-base sm:text-lg leading-tight tracking-tight">
              Kebiasaanmu
            </h3>
            <p className="text-xs text-[#8FA4C8] mt-0.5 truncate">
              {activeTab ? `Lihat ${activeTab.label.toLowerCase()}` : "Pahami pola finansialmu"}
            </p>
          </div>
        </div>
      </div>

      {/* Underline Tabs */}
      <div className="border-b border-[#F2F4F7]">
        <div className="flex gap-1 overflow-x-auto px-3 sm:px-4" style={{ scrollbarWidth: "none" }}>
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`relative flex items-center gap-1.5 px-3 py-3 text-xs font-semibold whitespace-nowrap flex-shrink-0 tap-highlight-fix transition-colors ${
                  active ? "text-[#FF6A00]" : "text-[#8FA4C8] hover:text-[#1A1A1A]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {active && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#FF6A00] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-5 sm:px-6 py-5 sm:py-6">
        {(tab === "merchant" || tab === "lifestyle" || tab === "nospend") && (
          <BehaviorInsightsCard
            key={tab}
            transactions={transactions}
            filterPeriod={filterPeriod}
            customDateRange={customDateRange}
            allCategoriesConfig={allCategoriesConfig}
            initialTab={tab}
            embedded
          />
        )}
        {tab === "pattern" && (
          <SpendingPatternCard
            transactions={transactions}
            filterPeriod={filterPeriod}
            customDateRange={customDateRange}
            embedded
          />
        )}
        {tab === "heatmap" && (
          <SpendingHeatmapCard transactions={transactions} embedded />
        )}
      </div>
    </div>
  );
}