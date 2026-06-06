/**
 * RevenueSnapshot — compact card showing MRR, Conversion, Churn in one block.
 * Replaces 3 separate cards in AdminDashboard for mobile-friendly density.
 */
export default function RevenueSnapshot({ mrr, premiumUsers, totalUsers, conversionRate, churnCount }) {
  const fmt = (n) => n?.toLocaleString("id-ID") ?? "-";

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E2E8F0]">
      <p className="text-xs text-[#8FA4C8] font-medium mb-3">Revenue Snapshot</p>

      {/* Primary metric: MRR */}
      <div className="mb-4">
        <p className="text-[10px] text-[#8FA4C8] uppercase tracking-wider">Monthly Recurring Revenue</p>
        <p className="text-2xl sm:text-3xl font-bold text-[#F97316] mt-0.5">Rp {fmt(mrr)}</p>
        <p className="text-xs text-[#8FA4C8] mt-1">Dari {premiumUsers} premium users</p>
      </div>

      {/* Secondary metrics: 2-col grid */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#F2F4F7]">
        <div>
          <p className="text-[10px] text-[#8FA4C8] uppercase tracking-wider">Conversion</p>
          <p className="text-lg font-bold text-[#1A1A1A] mt-0.5">{conversionRate}%</p>
          <p className="text-[10px] text-[#8FA4C8]">{premiumUsers}/{totalUsers} users</p>
        </div>
        <div>
          <p className="text-[10px] text-[#8FA4C8] uppercase tracking-wider">Churn (Bulan Ini)</p>
          <p className="text-lg font-bold text-[#1A1A1A] mt-0.5">{churnCount || 0}</p>
          <p className="text-[10px] text-[#8FA4C8]">Subs expired</p>
        </div>
      </div>
    </div>
  );
}