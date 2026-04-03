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
import OrderTable from "@/components/OrderTable";
import { formatRupiah, formatNumber, parseDate } from "@/lib/utils";
import type { OrderRow } from "@/lib/sheets";

export default function Home() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState("");
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

    if (dateRange === "today") {
      from = startOfDay(now);
    } else if (dateRange === "yesterday") {
      const yesterday = subDays(now, 1);
      from = startOfDay(yesterday);
      to = endOfDay(yesterday);
    } else if (dateRange === "week") {
      from = startOfWeek(now, { weekStartsOn: 1 });
    } else if (dateRange === "month") {
      from = startOfMonth(now);
    } else {
      from = customFrom ? parseISO(customFrom) : new Date(0);
      to = customTo ? parseISO(customTo + "T23:59:59") : now;
    }

    return orders.filter((o) => {
      const d = parseDate(o.tanggal);
      if (!d) return false;
      return !isBefore(d, from) && !isAfter(d, to);
    });
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

  const pieData = [
    { name: "COD", value: codOrders.length },
    { name: "TF", value: tfOrders.length },
  ];

  const grupMap = new Map<string, { orders: number; revenue: number; tipe: "COD" | "TF" }>();
  for (const o of filtered) {
    const existing = grupMap.get(o.grup) || { orders: 0, revenue: 0, tipe: o.tipe };
    existing.orders++;
    existing.revenue += o.total;
    grupMap.set(o.grup, existing);
  }
  const barData = [...grupMap.entries()]
    .map(([name, d]) => ({ name, orders: d.orders }))
    .sort((a, b) => b.orders - a.orders);

  const grupBreakdown = [...grupMap.entries()].map(([name, d]) => ({
    name,
    tipe: d.tipe,
    orders: d.orders,
    revenue: d.revenue,
    pctOrders: totalOrders ? (d.orders / totalOrders) * 100 : 0,
    pctRevenue: grossRevenue ? (d.revenue / grossRevenue) * 100 : 0,
  }));

  const trendMap = new Map<string, { cod: number; tf: number }>();
  for (const o of filtered) {
    if (!o.tanggal) continue;
    const existing = trendMap.get(o.tanggal) || { cod: 0, tf: 0 };
    if (o.tipe === "COD") existing.cod++;
    else existing.tf++;
    trendMap.set(o.tanggal, existing);
  }
  const trendData = [...trendMap.entries()]
    .map(([date, d]) => ({ date, ...d }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#d9a84e] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#8892a8] text-sm">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-[#1a2547] border-b border-[#2a3a5c] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#d9a84e] tracking-wide">NONICS MANTAP</h1>
            <p className="text-[#8892a8] text-xs">
              Sales Dashboard
              {updatedAt && ` · Updated ${new Date(updatedAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}`}
            </p>
          </div>
          {session?.user && (
            <div className="flex items-center gap-3">
              <span className="text-[#8892a8] text-xs hidden sm:inline">{session.user.email}</span>
              <button
                onClick={() => signOut()}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1a2547] text-[#8892a8] border border-[#2a3a5c] hover:border-red-500/50 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
          <DateFilter
            range={dateRange}
            customFrom={customFrom}
            customTo={customTo}
            onRangeChange={setDateRange}
            onCustomFromChange={setCustomFrom}
            onCustomToChange={setCustomTo}
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <KpiCard title="Total Orders" value={formatNumber(totalOrders)} accent />
          <KpiCard title="Gross Sales" value={formatRupiah(grossRevenue)} accent />
          <KpiCard title="RTS" value={formatNumber(rtsOrders.length)} subtitle={formatRupiah(rtsRevenue)} />
          <KpiCard title="Duplikat" value={formatNumber(dupOrders.length)} warning={dupOrders.length > 0} onClick={dupOrders.length > 0 ? () => setShowDupModal(true) : undefined} />
          <KpiCard title="Net Sales" value={formatRupiah(netRevenue)} accent />
          <KpiCard title="COD" value={formatNumber(codOrders.length)} subtitle={formatRupiah(codRevenue)} />
          <KpiCard title="TF" value={formatNumber(tfOrders.length)} subtitle={formatRupiah(tfRevenue)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CodTfPie data={pieData} />
          <OrdersBarChart data={barData} />
          <TrendLineChart data={trendData} />
        </div>

        <GrupBreakdown data={grupBreakdown} />
        <RekapCs orders={orders} />
        <CsPerformance orders={filtered} />
        <OrderTable orders={filtered} />
      </main>

      <footer className="border-t border-[#2a3a5c] py-4 mt-8">
        <p className="text-center text-[#8892a8] text-xs">NONICS MANTAP Dashboard — Powered by Sheetgram</p>
      </footer>

      {showDupModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowDupModal(false)}>
          <div className="bg-[#141e38] border border-[#2a3a5c] rounded-xl w-full max-w-3xl max-h-[80vh] overflow-hidden mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-5 py-4 border-b border-[#2a3a5c]">
              <h3 className="text-red-400 font-semibold text-sm">Order Duplikat ({dupOrders.length})</h3>
              <button onClick={() => setShowDupModal(false)} className="text-[#8892a8] hover:text-white text-lg leading-none">&times;</button>
            </div>
            <div className="overflow-auto max-h-[calc(80vh-60px)]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[#1a2547]">
                  <tr className="border-b border-[#2a3a5c]">
                    <th className="text-left py-2 px-3 text-[#8892a8] font-medium text-xs">Tanggal</th>
                    <th className="text-left py-2 px-3 text-[#8892a8] font-medium text-xs">Grup</th>
                    <th className="text-left py-2 px-3 text-[#8892a8] font-medium text-xs">CS</th>
                    <th className="text-left py-2 px-3 text-[#8892a8] font-medium text-xs">Customer</th>
                    <th className="text-left py-2 px-3 text-[#8892a8] font-medium text-xs">No HP</th>
                    <th className="text-left py-2 px-3 text-[#8892a8] font-medium text-xs">Produk</th>
                    <th className="text-right py-2 px-3 text-[#8892a8] font-medium text-xs">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dupOrders.map((o, i) => (
                    <tr key={`dup-${i}`} className={`border-b border-[#2a3a5c]/50 ${i % 2 === 0 ? "bg-[#141e38]" : "bg-[#1a2547]/30"}`}>
                      <td className="py-2 px-3 text-xs whitespace-nowrap">{o.tanggal}</td>
                      <td className="py-2 px-3 text-xs">{o.grup}</td>
                      <td className="py-2 px-3 text-xs">{o.namaCs}</td>
                      <td className="py-2 px-3 text-xs font-medium text-amber-400">{o.namaCustomer}</td>
                      <td className="py-2 px-3 text-xs">{o.noWa}</td>
                      <td className="py-2 px-3 text-xs">{o.produk}</td>
                      <td className="py-2 px-3 text-xs text-right text-[#d9a84e]">{formatRupiah(o.total)}</td>
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
