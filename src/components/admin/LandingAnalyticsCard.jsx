import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Eye, MousePointerClick, Clock, TrendingUp } from "lucide-react";

function formatMs(ms) {
  if (!ms || isNaN(ms)) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} dtk`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}d`;
}

export default function LandingAnalyticsCard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    views: 0,
    clicks: 0,
    conversion: 0,
    avgTimeToClick: 0,
    byLocation: { hero: 0, nav: 0, final_cta: 0 },
    last7Days: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const events = await base44.entities.LandingAnalytics.list("-created_date", 5000);
      const views = events.filter(e => e.event_type === "page_view");
      const clicks = events.filter(e => e.event_type === "cta_click");

      const viewCount = views.length;
      const clickCount = clicks.length;
      const conversion = viewCount > 0 ? Math.round((clickCount / viewCount) * 100) : 0;

      const timesMs = clicks.map(c => c.time_on_page_ms).filter(t => typeof t === "number" && t > 0);
      const avgTimeToClick = timesMs.length > 0 ? timesMs.reduce((a, b) => a + b, 0) / timesMs.length : 0;

      const byLocation = { hero: 0, nav: 0, final_cta: 0 };
      clicks.forEach(c => { if (c.location && byLocation[c.location] !== undefined) byLocation[c.location]++; });

      // last 7 days breakdown
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const v = views.filter(e => e.created_date?.slice(0, 10) === key).length;
        const c = clicks.filter(e => e.created_date?.slice(0, 10) === key).length;
        last7Days.push({ date: key.slice(5), views: v, clicks: c });
      }

      setData({ views: viewCount, clicks: clickCount, conversion, avgTimeToClick, byLocation, last7Days });
    } catch (e) {
      console.error("Failed to load landing analytics:", e);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-[#8FA4C8]">Memuat data...</div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox icon={Eye} label="Pengunjung" value={data.views} color="#3B82F6" />
        <StatBox icon={MousePointerClick} label="Klik CTA" value={data.clicks} color="#F97316" />
        <StatBox icon={TrendingUp} label="Konversi" value={`${data.conversion}%`} color="#10B981" />
        <StatBox icon={Clock} label="Rata² waktu klik" value={formatMs(data.avgTimeToClick)} color="#8B5CF6" />
      </div>

      {/* CTA location breakdown */}
      <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
        <p className="text-xs font-semibold text-[#1A1A1A] mb-3">Klik per Lokasi Tombol</p>
        <div className="space-y-2">
          <LocationRow label="Hero (Mulai Gratis)" count={data.byLocation.hero} total={data.clicks} />
          <LocationRow label="Nav (Masuk / Daftar)" count={data.byLocation.nav} total={data.clicks} />
          <LocationRow label="Final CTA" count={data.byLocation.final_cta} total={data.clicks} />
        </div>
      </div>

      {/* 7-day breakdown */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E2E8F0]">
          <p className="text-xs font-semibold text-[#1A1A1A]">7 Hari Terakhir</p>
        </div>
        <div className="divide-y divide-[#F2F4F7]">
          {data.last7Days.map((d) => (
            <div key={d.date} className="flex items-center justify-between px-4 py-2.5 text-xs">
              <span className="text-[#64748B] font-mono">{d.date}</span>
              <div className="flex items-center gap-4">
                <span className="text-[#3B82F6]"><Eye className="w-3 h-3 inline mr-1" />{d.views}</span>
                <span className="text-[#F97316]"><MousePointerClick className="w-3 h-3 inline mr-1" />{d.clicks}</span>
                <span className="text-[#10B981] w-10 text-right">
                  {d.views > 0 ? `${Math.round((d.clicks / d.views) * 100)}%` : "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-[#8FA4C8] text-center">
        Tip: konversi rendah → coba ganti headline / posisi tombol CTA.
      </p>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl p-3 border border-[#E2E8F0] shadow-sm">
      <Icon className="w-4 h-4 mb-2" style={{ color }} />
      <p className="text-lg font-bold text-[#1A1A1A] leading-tight">{value}</p>
      <p className="text-[11px] text-[#8FA4C8] mt-0.5">{label}</p>
    </div>
  );
}

function LocationRow({ label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-[#1A1A1A]">{label}</span>
        <span className="text-[#64748B] font-medium">{count} ({pct}%)</span>
      </div>
      <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
        <div className="h-full bg-[#F97316] rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}