"use client";

import { useMemo, useState } from "react";
import { startOfDay, endOfDay, startOfWeek, startOfMonth, startOfYear, subDays, isAfter, isBefore } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatRupiah, formatNumber, parseDate } from "@/lib/utils";
import type { OrderRow } from "@/lib/sheets";

type Period = "today" | "yesterday" | "week" | "month" | "year" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  today: "Hari Ini",
  yesterday: "Kemarin",
  week: "Minggu Ini",
  month: "Bulan Ini",
  year: "Tahun Ini",
  all: "All Time",
};

const COLORS = ["#F5A623", "#F0C040", "#22C55E", "#4A90D9", "#8B5CF6", "#06B6D4", "#EC4899", "#FF6E4A", "#2EA88A", "#D73211"];
const RANK_BADGES = ["", "\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];
const tooltipStyle = {
  contentStyle: { backgroundColor: "#1A1A25", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#E8E6E3", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" },
};

interface ProdukRow {
  name: string;
  orders: number;
  revenue: number;
  pct: number;
}

function filterByPeriod(orders: OrderRow[], period: Period): OrderRow[] {
  if (period === "all") return orders;
  const now = new Date();
  let from: Date;
  let to: Date = now;

  if (period === "today") from = startOfDay(now);
  else if (period === "yesterday") { from = startOfDay(subDays(now, 1)); to = endOfDay(subDays(now, 1)); }
  else if (period === "week") from = startOfWeek(now, { weekStartsOn: 1 });
  else if (period === "month") from = startOfMonth(now);
  else from = startOfYear(now);

  return orders.filter((o) => {
    const d = parseDate(o.tanggal);
    if (!d) return false;
    return !isBefore(d, from) && !isAfter(d, to);
  });
}

function aggregateProduk(orders: OrderRow[]): ProdukRow[] {
  const map = new Map<string, ProdukRow>();
  for (const o of orders) {
    const name = (o.produk || "").trim();
    if (!name) continue;
    const key = name.toUpperCase();
    const existing = map.get(key) || { name, orders: 0, revenue: 0, pct: 0 };
    existing.orders++;
    existing.revenue += o.total;
    map.set(key, existing);
  }
  const list = [...map.values()].sort((a, b) => b.orders - a.orders);
  const totalOrders = list.reduce((s, p) => s + p.orders, 0);
  for (const p of list) p.pct = totalOrders ? (p.orders / totalOrders) * 100 : 0;
  return list;
}

export default function TopProduk({ orders }: { orders: OrderRow[] }) {
  const [period, setPeriod] = useState<Period>("all");

  const produkData = useMemo(() => {
    const filtered = filterByPeriod(orders, period);
    return aggregateProduk(filtered);
  }, [orders, period]);

  const totalOrders = produkData.reduce((s, p) => s + p.orders, 0);
  const totalRevenue = produkData.reduce((s, p) => s + p.revenue, 0);

  return (
    <div className="glass p-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div>
          <h3 className="bg-gradient-to-r from-[#F5A623] to-[#F0C040] bg-clip-text text-transparent font-semibold text-base">Produk Terlaku</h3>
          <p className="text-[#6B6B78] text-xs mt-0.5">
            {produkData.length} produk &middot; {formatNumber(totalOrders)} orders &middot; {formatRupiah(totalRevenue)}
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                period === p
                  ? "bg-gradient-to-r from-[#F5A623] to-[#F0C040] text-[#0A0A0F]"
                  : "text-[#6B6B78] border border-[rgba(255,255,255,0.08)] hover:border-[#F5A623]/30"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {produkData.length > 0 && (
        <div className="mb-5">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={produkData.slice(0, 10)} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#6B6B78", fontSize: 11 }} />
              <YAxis
                type="category" dataKey="name" width={160}
                tick={{ fill: "#9B9BA8", fontSize: 11 }}
                tickFormatter={(v: string) => v.length > 22 ? v.slice(0, 22) + "..." : v}
              />
              <Tooltip
                {...tooltipStyle}
                formatter={(value) => formatNumber(Number(value) || 0)}
              />
              <Bar dataKey="orders" name="Orders" radius={[0, 4, 4, 0]}>
                {produkData.slice(0, 10).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.06)]">
              <th className="text-left py-2 px-2 text-[#6B6B78] font-medium text-xs w-12">#</th>
              <th className="text-left py-2 px-2 text-[#6B6B78] font-medium text-xs">Produk</th>
              <th className="text-center py-2 px-2 text-[#6B6B78] font-medium text-xs">Orders</th>
              <th className="text-right py-2 px-2 text-[#6B6B78] font-medium text-xs">Revenue</th>
              <th className="text-right py-2 px-2 text-[#6B6B78] font-medium text-xs">%</th>
            </tr>
          </thead>
          <tbody>
            {produkData.slice(0, 20).map((p, i) => (
              <tr
                key={p.name}
                className={`border-b border-[rgba(255,255,255,0.06)] ${
                  i % 2 === 0 ? "bg-transparent" : "bg-[rgba(255,255,255,0.02)]"
                } hover:bg-[rgba(255,255,255,0.04)] transition-colors`}
              >
                <td className="py-2 px-2 text-sm">
                  {i < 3 ? RANK_BADGES[i + 1] : <span className="text-[#6B6B78] text-xs">{i + 1}</span>}
                </td>
                <td className="py-2 px-2 text-xs font-medium text-[#E8E6E3]">{p.name}</td>
                <td className="py-2 px-2 text-xs text-center font-bold text-[#E8E6E3]">{p.orders}</td>
                <td className="py-2 px-2 text-xs text-right text-[#F5A623] font-medium">{formatRupiah(p.revenue)}</td>
                <td className="py-2 px-2 text-xs text-right text-[#9B9BA8]">{p.pct.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        {produkData.length === 0 && (
          <p className="text-[#6B6B78] text-xs text-center py-4">Tidak ada data produk untuk periode ini</p>
        )}
      </div>
    </div>
  );
}
