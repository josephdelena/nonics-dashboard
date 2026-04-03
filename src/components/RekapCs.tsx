"use client";

import { useMemo, useState } from "react";
import { startOfDay, endOfDay, startOfWeek, startOfMonth, subDays, isAfter, isBefore } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatRupiah, formatNumber, parseDate } from "@/lib/utils";
import type { OrderRow } from "@/lib/sheets";

type Period = "today" | "yesterday" | "week" | "month" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  today: "Hari Ini",
  yesterday: "Kemarin",
  week: "Minggu Ini",
  month: "Bulan Ini",
  all: "Semua",
};

const COLORS = ["#d9a84e", "#e8c47a", "#b8872e", "#e07040", "#2ea88a", "#4a90d9", "#8b5cf6", "#ef4444", "#06b6d4", "#f59e0b"];
const tooltipStyle = {
  contentStyle: { backgroundColor: "#1a2547", border: "1px solid #2a3a5c", borderRadius: "8px", color: "#e8eaf0" },
};

interface CsRow {
  name: string;
  cod: number;
  tf: number;
  total: number;
  revenue: number;
}

function filterByPeriod(orders: OrderRow[], period: Period): OrderRow[] {
  if (period === "all") return orders;
  const now = new Date();
  let from: Date;
  let to: Date = now;

  if (period === "today") {
    from = startOfDay(now);
  } else if (period === "yesterday") {
    const y = subDays(now, 1);
    from = startOfDay(y);
    to = endOfDay(y);
  } else if (period === "week") {
    from = startOfWeek(now, { weekStartsOn: 1 });
  } else {
    from = startOfMonth(now);
  }

  return orders.filter((o) => {
    const d = parseDate(o.tanggal);
    if (!d) return false;
    return !isBefore(d, from) && !isAfter(d, to);
  });
}

function aggregateCs(orders: OrderRow[]): CsRow[] {
  const map = new Map<string, CsRow>();
  for (const o of orders) {
    const name = (o.namaCs || "").trim();
    if (!name) continue;
    const key = name.toUpperCase();
    const existing = map.get(key) || { name, cod: 0, tf: 0, total: 0, revenue: 0 };
    if (o.tipe === "COD") existing.cod++;
    else existing.tf++;
    existing.total = existing.cod + existing.tf;
    existing.revenue += o.total;
    map.set(key, existing);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export default function RekapCs({ orders }: { orders: OrderRow[] }) {
  const [period, setPeriod] = useState<Period>("today");

  const csData = useMemo(() => {
    const filtered = filterByPeriod(orders, period);
    return aggregateCs(filtered);
  }, [orders, period]);

  const totalOrders = csData.reduce((s, c) => s + c.total, 0);
  const totalRevenue = csData.reduce((s, c) => s + c.revenue, 0);

  return (
    <div className="bg-[#141e38] border border-[#2a3a5c] rounded-xl p-5">
      {/* Header + filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div>
          <h3 className="text-[#d9a84e] font-semibold text-base">Rekap CS</h3>
          <p className="text-[#8892a8] text-xs mt-0.5">
            {formatNumber(totalOrders)} orders &middot; {formatRupiah(totalRevenue)}
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                period === p
                  ? "bg-[#d9a84e] text-[#0f1a33]"
                  : "bg-[#1a2547] text-[#8892a8] border border-[#2a3a5c] hover:border-[#d9a84e]/50"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      {csData.length > 0 && (
        <div className="mb-5">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={csData.slice(0, 15)} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5c" />
              <XAxis dataKey="name" tick={{ fill: "#8892a8", fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: "#8892a8", fontSize: 11 }} />
              <Tooltip
                {...tooltipStyle}
                formatter={(value) => formatNumber(Number(value) || 0)}
              />
              <Bar dataKey="total" name="Total Order" radius={[4, 4, 0, 0]}>
                {csData.slice(0, 15).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a3a5c]">
              <th className="text-left py-2 px-2 text-[#8892a8] font-medium text-xs w-8">#</th>
              <th className="text-left py-2 px-2 text-[#8892a8] font-medium text-xs">Nama CS</th>
              <th className="text-center py-2 px-2 text-[#8892a8] font-medium text-xs">COD</th>
              <th className="text-center py-2 px-2 text-[#8892a8] font-medium text-xs">TF</th>
              <th className="text-center py-2 px-2 text-[#8892a8] font-medium text-xs">Total Order</th>
              <th className="text-right py-2 px-2 text-[#8892a8] font-medium text-xs">Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {csData.map((cs, i) => (
              <tr
                key={cs.name}
                className={`border-b border-[#2a3a5c]/50 ${
                  i % 2 === 0 ? "bg-[#141e38]" : "bg-[#1a2547]/30"
                } hover:bg-[#243360]/50 transition-colors`}
              >
                <td className="py-2 px-2 text-xs text-[#8892a8]">{i + 1}</td>
                <td className="py-2 px-2 text-xs font-medium">
                  {i === 0 && csData.length > 1 && <span className="text-[#d9a84e] mr-1">&#9733;</span>}
                  {cs.name}
                </td>
                <td className="py-2 px-2 text-xs text-center">
                  <span className="bg-[#e07040]/20 text-[#e07040] px-2 py-0.5 rounded-full text-[10px] font-medium">
                    {cs.cod}
                  </span>
                </td>
                <td className="py-2 px-2 text-xs text-center">
                  <span className="bg-[#2ea88a]/20 text-[#2ea88a] px-2 py-0.5 rounded-full text-[10px] font-medium">
                    {cs.tf}
                  </span>
                </td>
                <td className="py-2 px-2 text-xs text-center font-bold">{cs.total}</td>
                <td className="py-2 px-2 text-xs text-right text-[#d9a84e] font-medium">{formatRupiah(cs.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {csData.length === 0 && (
          <p className="text-[#8892a8] text-xs text-center py-4">Tidak ada data CS untuk periode ini</p>
        )}
      </div>
    </div>
  );
}
