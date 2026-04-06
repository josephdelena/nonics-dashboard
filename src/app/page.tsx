"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { startOfDay, endOfDay, startOfWeek, startOfMonth, subDays, isAfter, isBefore, parseISO } from "date-fns";
import KpiCard from "@/components/KpiCard";
import { CodTfPie, OrdersBarChart, TrendLineChart } from "@/components/Charts";
import DateFilter, { type DateRange } from "@/components/DateFilter";
import GrupBreakdown from "@/components/GrupBreakdown";
import CsPerformance from "@/components/CsPerformance";
import RekapCs from "@/components/RekapCs";
import TopProduk from "@/components/TopProduk";
import OrderTable from "@/components/OrderTable";
import { formatRupiah, formatNumber, parseDate } from "@/lib/utils";
import type { OrderRow } from "@/lib/sheets";

type Tab = "overview" | "cs" | "produk" | "orders";
const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "overview", label: "Overview", icon: "\u26A1" },
  { key: "cs", label: "Performa CS", icon: "\uD83D\uDC65" },
  { key: "produk", label: "Produk Terlaku", icon: "\uD83D\uDCE6" },
  { key: "orders", label: "Detail Orders", icon: "\uD83D\uDCCB" },
];

export default function Home() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [showDupModal, setShowDupModal] = useState(false);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setUpdatedAt(data.updatedAt || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (dateRange === "all") return orders;
    const now = new Date();
    let from: Date;
    let to: Date = now;
    if (dateRange === "today") from = startOfDay(now);
    else if (dateRange === "yesterday") { from = startOfDay(subDays(now, 1)); to = endOfDay(subDays(now, 1)); }
    else if (dateRange === "week") from = startOfWeek(now, { weekStartsOn: 1 });
    else if (dateRange === "month") from = startOfMonth(now);
    else { from = customFrom ? parseISO(customFrom) : new Date(0); to = customTo ? parseISO(customTo + "T23:59:59") : now; }
    return orders.filter((o) => { const d = parseDate(o.tanggal); if (!d) return false; return !isBefore(d, from) && !isAfter(d, to); });
  }, [orders, dateRange, customFrom, customTo]);

  const totalOrders = filtered.length;
  const grossRevenue = filtered.reduce((s, o) => s + o.total, 0);
  const rtsOrders = filtered.filter((o) => o.status === "RTS");
  const rtsRevenue = rtsOrders.reduce((s, o) => s + o.total, 0);
  const dupOrders = filtered.filter((o) => o.status === "DUPLIKAT");
  const netRevenue = grossRevenue - rtsRevenue;
  const codOrders = filtered.filter((o) => o.tipe === "COD");
  const tfOrders = filtered.filter((o) => o.tipe === "TF");
  const codRevenue = codOrders.reduce((s, o) => s + o.total, 0);
  const tfRevenue = tfOrders.reduce((s, o) => s + o.total, 0);

  const pieData = [{ name: "COD", value: codOrders.length }, { name: "TF", value: tfOrders.length }];

  const grupMap = new Map<string, { orders: number; revenue: number; cod: number; tf: number; tipe: "COD" | "TF" }>();
  for (const o of filtered) { const e = grupMap.get(o.grup) || { orders: 0, revenue: 0, cod: 0, tf: 0, tipe: o.tipe }; e.orders++; e.revenue += o.total; if (o.tipe === "COD") e.cod++; else e.tf++; grupMap.set(o.grup, e); }
  const barData = [...grupMap.entries()].map(([name, d]) => ({ name, cod: d.cod, tf: d.tf, total: d.orders })).sort((a, b) => b.total - a.total);
  const grupBreakdown = [...grupMap.entries()].map(([name, d]) => ({ name, tipe: d.tipe, orders: d.orders, revenue: d.revenue, pctOrders: totalOrders ? (d.orders / totalOrders) * 100 : 0, pctRevenue: grossRevenue ? (d.revenue / grossRevenue) * 100 : 0 }));

  const trendMap = new Map<string, { sales: number; orders: number }>();
  for (const o of filtered) {
    if (!o.tanggal) continue;
    const d = parseDate(o.tanggal);
    if (!d) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const e = trendMap.get(key) || { sales: 0, orders: 0 };
    e.sales += o.total; e.orders++;
    trendMap.set(key, e);
  }
  const allTrend = [...trendMap.entries()].map(([date, d]) => ({ date, ...d })).sort((a, b) => a.date.localeCompare(b.date));
  const trendData = allTrend.slice(-30);
  const totalSalesMonth = trendData.reduce((s, d) => s + d.sales, 0);
  const totalOrdersMonth = trendData.reduce((s, d) => s + d.orders, 0);
  const avgOrderValue = totalOrdersMonth > 0 ? Math.round(totalSalesMonth / totalOrdersMonth) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)", backgroundImage: "radial-gradient(ellipse at 50% 50%, rgba(245,166,35,0.04) 0%, transparent 60%)" }}>
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-widest mb-6 shimmer-gold">NONICS MANTAP</h1>
          <div className="spinner-gold mx-auto mb-4" />
          <p className="text-[#6B6B78] text-xs tracking-[0.15em]">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <header className="border-b border-[rgba(255,255,255,0.06)] px-6 py-4 flex items-center justify-between" style={{ background: "var(--bg2)" }}>
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-bold tracking-wider flex items-center gap-2">
              <div className="w-3 h-3 rotate-45 bg-gradient-to-br from-[#F5A623] to-[#F0C040] shrink-0" />
              <span className="text-[#E8E6E3]">NONICS</span>{" "}
              <span className="shimmer-gold">MANTAP</span>
            </h1>
            <p className="text-[10px] text-[#6B6B78] tracking-[0.2em] uppercase ml-5">Sales Intelligence Dashboard</p>
          </div>
          <span className="text-[#6B6B78] text-xs hidden sm:inline">
            {updatedAt && `Updated ${new Date(updatedAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <DateFilter range={dateRange} customFrom={customFrom} customTo={customTo} onRangeChange={setDateRange} onCustomFromChange={setCustomFrom} onCustomToChange={setCustomTo} />
          {session?.user && (
            <>
              <span className="text-[#6B6B78] text-xs hidden md:inline">{session.user.email}</span>
              <button onClick={() => signOut()} className="px-3 py-1.5 rounded-lg text-xs text-[#6B6B78] border border-[rgba(255,255,255,0.1)] hover:border-[#F5A623]/40 hover:text-[#F5A623] transition-all">
                Logout
              </button>
            </>
          )}
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b border-[rgba(255,255,255,0.06)] px-6 py-2 flex gap-2" style={{ background: "var(--bg2)" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
              activeTab === t.key
                ? "text-[#F5A623] border border-[rgba(245,166,35,0.3)]"
                : "text-[#6B6B78] border border-transparent hover:bg-[rgba(255,255,255,0.05)]"
            }`}
            style={activeTab === t.key ? { background: "linear-gradient(135deg, rgba(245,166,35,0.2), rgba(240,192,64,0.1))" } : undefined}
          >
            <span className="mr-1.5">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-6">
        {activeTab === "overview" && (
          <div className="tab-fade-in space-y-6">
            <div className="hidden lg:flex gap-3">
              <KpiCard title="Total Orders" value={formatNumber(totalOrders)} accent flex={1} />
              <KpiCard title="Gross Sales" value={formatRupiah(grossRevenue)} accent flex={2} />
              <KpiCard title="RTS" value={formatNumber(rtsOrders.length)} subtitle={formatRupiah(rtsRevenue)} flex={0.6} />
              <KpiCard title="Duplikat" value={formatNumber(dupOrders.length)} warning={dupOrders.length > 0} onClick={dupOrders.length > 0 ? () => setShowDupModal(true) : undefined} flex={0.6} />
              <KpiCard title="Net Sales" value={formatRupiah(netRevenue)} accent flex={2} />
              <KpiCard title="COD" value={formatNumber(codOrders.length)} subtitle={formatRupiah(codRevenue)} flex={1} />
              <KpiCard title="TF" value={formatNumber(tfOrders.length)} subtitle={formatRupiah(tfRevenue)} flex={1} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:hidden">
              <KpiCard title="Total Orders" value={formatNumber(totalOrders)} accent />
              <KpiCard title="Gross Sales" value={formatRupiah(grossRevenue)} accent />
              <KpiCard title="RTS" value={formatNumber(rtsOrders.length)} subtitle={formatRupiah(rtsRevenue)} />
              <KpiCard title="Duplikat" value={formatNumber(dupOrders.length)} warning={dupOrders.length > 0} onClick={dupOrders.length > 0 ? () => setShowDupModal(true) : undefined} />
              <KpiCard title="Net Sales" value={formatRupiah(netRevenue)} accent />
              <KpiCard title="COD" value={formatNumber(codOrders.length)} subtitle={formatRupiah(codRevenue)} />
              <KpiCard title="TF" value={formatNumber(tfOrders.length)} subtitle={formatRupiah(tfRevenue)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CodTfPie data={pieData} />
              <OrdersBarChart data={barData} />
            </div>
            <TrendLineChart data={trendData} totalSales={totalSalesMonth} totalOrders={totalOrdersMonth} avgOrderValue={avgOrderValue} />
            <GrupBreakdown data={grupBreakdown} />
          </div>
        )}

        {activeTab === "cs" && (
          <div className="tab-fade-in space-y-6">
            <RekapCs orders={orders} />
            <CsPerformance orders={filtered} />
          </div>
        )}

        {activeTab === "produk" && (
          <div className="tab-fade-in">
            <TopProduk orders={orders} />
          </div>
        )}

        {activeTab === "orders" && (
          <div className="tab-fade-in">
            <OrderTable orders={filtered} />
          </div>
        )}
      </main>

      {/* Duplikat Modal */}
      {showDupModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowDupModal(false)}>
          <div className="glass w-full max-w-3xl max-h-[80vh] overflow-hidden mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-5 py-4 border-b border-[rgba(255,255,255,0.08)]">
              <h3 className="text-red-400 font-semibold text-sm">Order Duplikat ({dupOrders.length})</h3>
              <button onClick={() => setShowDupModal(false)} className="text-[#6B6B78] hover:text-white text-lg">&times;</button>
            </div>
            <div className="overflow-auto max-h-[calc(80vh-60px)]">
              <table className="w-full text-sm">
                <thead className="sticky top-0" style={{ background: "var(--bg3)" }}>
                  <tr className="border-b border-[rgba(255,255,255,0.08)]">
                    <th className="text-left py-2 px-3 text-[#6B6B78] font-medium text-xs">Tanggal</th>
                    <th className="text-left py-2 px-3 text-[#6B6B78] font-medium text-xs">Grup</th>
                    <th className="text-left py-2 px-3 text-[#6B6B78] font-medium text-xs">CS</th>
                    <th className="text-left py-2 px-3 text-[#6B6B78] font-medium text-xs">Customer</th>
                    <th className="text-left py-2 px-3 text-[#6B6B78] font-medium text-xs">No HP</th>
                    <th className="text-left py-2 px-3 text-[#6B6B78] font-medium text-xs">Produk</th>
                    <th className="text-right py-2 px-3 text-[#6B6B78] font-medium text-xs">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dupOrders.map((o, i) => (
                    <tr key={`dup-${i}`} className={`border-b border-[rgba(255,255,255,0.04)] ${i % 2 === 0 ? "" : "bg-[rgba(255,255,255,0.02)]"}`}>
                      <td className="py-2 px-3 text-xs whitespace-nowrap">{o.tanggal}</td>
                      <td className="py-2 px-3 text-xs">{o.grup}</td>
                      <td className="py-2 px-3 text-xs">{o.namaCs}</td>
                      <td className="py-2 px-3 text-xs font-medium text-amber-400">{o.namaCustomer}</td>
                      <td className="py-2 px-3 text-xs">{o.noWa}</td>
                      <td className="py-2 px-3 text-xs">{o.produk}</td>
                      <td className="py-2 px-3 text-xs text-right text-[#F5A623]">{formatRupiah(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
