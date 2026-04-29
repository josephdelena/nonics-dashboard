import { getCachedAdsData } from "@/lib/ads-sheets";
import { fetchCachedOrders } from "@/lib/sheets";
import { formatRupiah, formatNumber, formatPercent } from "@/lib/utils";
import AdsTable from "./AdsTable";
import Link from "next/link";

export const revalidate = 3600;

interface Props {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}

function filterByRange(
  rows: { date: string }[],
  range: string,
  from?: string,
  to?: string
) {
  const now = new Date();
  const todayStr = toYMD(now);
  const yesterdayStr = toYMD(new Date(now.getTime() - 86400000));
  const day7Str = toYMD(new Date(now.getTime() - 7 * 86400000));
  const day30Str = toYMD(new Date(now.getTime() - 30 * 86400000));

  return rows.filter((r) => {
    const d = r.date;
    if (!d) return false;
    if (range === "today") return d === todayStr;
    if (range === "yesterday") return d === yesterdayStr;
    if (range === "7d") return d >= day7Str && d <= todayStr;
    if (range === "30d") return d >= day30Str && d <= todayStr;
    if (range === "custom") {
      const f = from || "0000-00-00";
      const t = to || "9999-99-99";
      return d >= f && d <= t;
    }
    return true; // "all"
  });
}

function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function AdsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const range = sp.range || "30d";
  const fromParam = sp.from;
  const toParam = sp.to;

  const [allAds, allOrders] = await Promise.all([
    getCachedAdsData(),
    fetchCachedOrders().catch(() => []),
  ]);

  const filteredAds = filterByRange(allAds, range, fromParam, toParam) as typeof allAds;

  // KPI aggregates
  const totalSpend = filteredAds.reduce((s, r) => s + r.cost, 0);
  const totalClicks = filteredAds.reduce((s, r) => s + r.clicks, 0);
  const totalImpressions = filteredAds.reduce((s, r) => s + r.impressions, 0);
  const totalConversions = filteredAds.reduce((s, r) => s + r.conversions, 0);
  const totalConversionsValue = filteredAds.reduce((s, r) => s + r.conversions_value, 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  // Orders dari sheet untuk CPA & ROAS
  const grossSales = allOrders.reduce((s, o) => s + o.total, 0);
  const totalOrdersCount = allOrders.length;
  const cpa = totalOrdersCount > 0 && totalSpend > 0 ? totalSpend / totalOrdersCount : 0;
  const roas = totalSpend > 0 ? grossSales / totalSpend : 0;

  const RANGES = [
    { key: "today", label: "Hari Ini" },
    { key: "yesterday", label: "Kemarin" },
    { key: "7d", label: "7 Hari" },
    { key: "30d", label: "30 Hari" },
    { key: "all", label: "Semua" },
  ];

  function rangeHref(key: string) {
    const p = new URLSearchParams();
    p.set("range", key);
    return `/ads?${p.toString()}`;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <header
        className="border-b border-[rgba(255,255,255,0.06)] px-6 py-4 flex items-center justify-between"
        style={{ background: "var(--bg2)" }}
      >
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-bold tracking-wider flex items-center gap-2">
              <div className="w-3 h-3 rotate-45 bg-gradient-to-br from-[#F5A623] to-[#F0C040] shrink-0" />
              <span className="text-[#E8E6E3]">NONICS</span>{" "}
              <span className="shimmer-gold">MANTAP</span>
            </h1>
            <p className="text-[10px] text-[#6B6B78] tracking-[0.2em] uppercase ml-5">
              Sales Intelligence Dashboard
            </p>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav
        className="border-b border-[rgba(255,255,255,0.06)] px-6 py-2 flex gap-2"
        style={{ background: "var(--bg2)" }}
      >
        <Link
          href="/"
          className="rounded-full px-4 py-2 text-xs font-medium transition-all text-[#6B6B78] border border-transparent hover:bg-[rgba(255,255,255,0.05)]"
        >
          <span className="mr-1.5">⚡</span>Overview
        </Link>
        <Link
          href="/ads"
          className="rounded-full px-4 py-2 text-xs font-medium transition-all text-[#F5A623] border border-[rgba(245,166,35,0.3)]"
          style={{ background: "linear-gradient(135deg, rgba(245,166,35,0.2), rgba(240,192,64,0.1))" }}
        >
          <span className="mr-1.5">📊</span>Google Ads
        </Link>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-6 space-y-6">
        {/* Date Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#6B6B78] text-xs uppercase tracking-wider mr-2">Periode:</span>
          {RANGES.map((r) => (
            <Link
              key={r.key}
              href={rangeHref(r.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all border ${
                range === r.key
                  ? "text-[#F5A623] border-[rgba(245,166,35,0.3)]"
                  : "text-[#6B6B78] border-transparent hover:bg-[rgba(255,255,255,0.05)]"
              }`}
              style={
                range === r.key
                  ? { background: "linear-gradient(135deg, rgba(245,166,35,0.2), rgba(240,192,64,0.1))" }
                  : undefined
              }
            >
              {r.label}
            </Link>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="hidden lg:flex gap-3">
          <KpiCard title="Total Spend" value={formatRupiah(Math.round(totalSpend))} accent />
          <KpiCard title="Total Klik" value={formatNumber(totalClicks)} />
          <KpiCard title="Avg CTR" value={avgCtr.toFixed(2) + "%"} />
          <KpiCard title="Konversi" value={totalConversions.toFixed(0)} />
          <KpiCard title="Conv Rate" value={formatPercent(totalConversions, totalClicks)} />
          <KpiCard title="CPA" value={cpa > 0 ? formatRupiah(Math.round(cpa)) : "—"} subtitle="cost ÷ total orders" />
          <KpiCard title="ROAS" value={roas > 0 ? roas.toFixed(2) + "x" : "—"} accent subtitle="gross sales ÷ spend" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:hidden">
          <KpiCard title="Total Spend" value={formatRupiah(Math.round(totalSpend))} accent />
          <KpiCard title="Total Klik" value={formatNumber(totalClicks)} />
          <KpiCard title="Avg CTR" value={avgCtr.toFixed(2) + "%"} />
          <KpiCard title="Konversi" value={totalConversions.toFixed(0)} />
          <KpiCard title="Conv Rate" value={formatPercent(totalConversions, totalClicks)} />
          <KpiCard title="CPA" value={cpa > 0 ? formatRupiah(Math.round(cpa)) : "—"} />
          <KpiCard title="ROAS" value={roas > 0 ? roas.toFixed(2) + "x" : "—"} accent />
        </div>

        {/* Campaign Table */}
        <div>
          <h2 className="text-sm font-semibold text-[#9B9BA8] uppercase tracking-wider mb-3">
            Breakdown per Campaign
          </h2>
          <AdsTable data={filteredAds} totalOrders={totalOrdersCount} />
        </div>
      </main>
    </div>
  );
}

// Inline KPI Card (server-safe, no 3D tilt)
function KpiCard({
  title,
  value,
  subtitle,
  accent,
}: {
  title: string;
  value: string;
  subtitle?: string;
  accent?: boolean;
}) {
  return (
    <div
      className="glass-gold p-5 flex-1"
      style={{ minWidth: 0 }}
    >
      <p className="text-[10px] uppercase tracking-widest font-medium mb-2 text-[#9B9BA8]">{title}</p>
      <p
        className={`font-bold ${
          accent
            ? "bg-gradient-to-r from-[#F5A623] to-[#F0C040] bg-clip-text text-transparent shimmer-gold"
            : "text-[#E8E6E3]"
        }`}
        style={{ fontSize: "clamp(0.85rem, 1.4vw, 1.25rem)" }}
      >
        {value}
      </p>
      {subtitle && <p className="text-xs mt-1.5 text-[#6B6B78]">{subtitle}</p>}
    </div>
  );
}
