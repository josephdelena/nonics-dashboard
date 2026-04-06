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

const COLORS = ["#F5A623", "#F0C040", "#22C55E", "#4A90D9", "#8B5CF6", "#06B6D4", "#EC4899", "#FF6E4A", "#2EA88A", "#D73211"];
const tooltipStyle = {
  contentStyle: { backgroundColor: "rgba(10,10,15,0.95)", backdropFilter: "blur(20px)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "12px", color: "#E8E6E3", boxShadow: "0 20px 60px rgba(0,0,0,0.8)" },
};

interface CsRow {
  name: string;
  cod: number;
  tf: number;
  total: number;
  revenue: number;
}

function getInitials(name: string): string {
  return name.split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);
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

function PodiumCard({ cs, rank }: { cs: CsRow; rank: 1 | 2 | 3 }) {
  const isChamp = rank === 1;
  const borderColor = rank === 1
    ? "rgba(245,166,35,0.5)"
    : rank === 2
      ? "rgba(192,192,192,0.3)"
      : "rgba(205,127,50,0.3)";
  const avatarBg = rank === 1
    ? "linear-gradient(135deg, #F5A623, #F0C040)"
    : rank === 2
      ? "linear-gradient(135deg, #C0C0C0, #A0A0A0)"
      : "linear-gradient(135deg, #CD7F32, #B8860B)";
  const glowShadow = rank === 1
    ? "0 0 40px rgba(245,166,35,0.15)"
    : "none";

  return (
    <div
      className={`${isChamp ? "glass-gold" : "glass"} p-4 flex flex-col items-center text-center relative`}
      style={{
        borderColor,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), ${glowShadow}`,
        marginTop: isChamp ? 0 : 24,
      }}
    >
      {isChamp && (
        <span className="absolute -top-4 text-2xl">&#x1F451;</span>
      )}
      {!isChamp && (
        <span
          className="absolute -top-2.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{
            background: rank === 2 ? "linear-gradient(135deg, #C0C0C0, #A0A0A0)" : "linear-gradient(135deg, #CD7F32, #B8860B)",
            color: "#0A0A0F",
          }}
        >
          {rank}
        </span>
      )}
      <div
        className={`${isChamp ? "w-14 h-14 text-lg" : "w-11 h-11 text-sm"} rounded-full flex items-center justify-center font-bold text-[#0A0A0F] mb-2 shrink-0`}
        style={{ background: avatarBg }}
      >
        {getInitials(cs.name)}
      </div>
      <p className={`font-semibold text-[#E8E6E3] truncate w-full ${isChamp ? "text-sm" : "text-xs"}`}>{cs.name}</p>
      <p className={`font-bold text-[#F5A623] mt-1 ${isChamp ? "text-lg" : "text-sm"}`}>{formatNumber(cs.total)}</p>
      <p className="text-[10px] text-[#6B6B78] uppercase tracking-widest">orders</p>
      <p className="text-[#9B9BA8] text-[11px] mt-1">{formatRupiah(cs.revenue)}</p>
    </div>
  );
}

export default function RekapCs({ orders }: { orders: OrderRow[] }) {
  const [period, setPeriod] = useState<Period>("today");

  const csData = useMemo(() => {
    const filtered = filterByPeriod(orders, period);
    return aggregateCs(filtered);
  }, [orders, period]);

  const totalOrders = csData.reduce((s, c) => s + c.total, 0);
  const totalRevenue = csData.reduce((s, c) => s + c.revenue, 0);
  const top3 = csData.slice(0, 3);
  const rest = csData.slice(3);

  return (
    <div className="glass-gold p-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div>
          <h3 className="bg-gradient-to-r from-[#F5A623] to-[#F0C040] bg-clip-text text-transparent font-semibold text-base">Rekap CS</h3>
          <p className="text-[#6B6B78] text-xs mt-0.5">
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
                  ? "bg-gradient-to-r from-[#F5A623] to-[#F0C040] text-[#0A0A0F]"
                  : "text-[#6B6B78] border border-[rgba(255,255,255,0.08)] hover:border-[#F5A623]/30"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Podium Leaderboard */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-6 max-w-md mx-auto items-end">
          <PodiumCard cs={top3[1]} rank={2} />
          <PodiumCard cs={top3[0]} rank={1} />
          <PodiumCard cs={top3[2]} rank={3} />
        </div>
      )}
      {top3.length > 0 && top3.length < 3 && (
        <div className="flex justify-center gap-3 mb-6">
          {top3.map((cs, i) => (
            <div key={cs.name} className="w-40">
              <PodiumCard cs={cs} rank={(i + 1) as 1 | 2 | 3} />
            </div>
          ))}
        </div>
      )}

      {csData.length > 0 && (
        <div className="mb-5">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={csData.slice(0, 15)} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,166,35,0.04)" />
              <XAxis dataKey="name" tick={{ fill: "#6B6B78", fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: "#6B6B78", fontSize: 11 }} />
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

      {rest.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                <th className="text-left py-2 px-2 text-[#6B6B78] font-medium text-xs w-8">#</th>
                <th className="text-left py-2 px-2 text-[#6B6B78] font-medium text-xs">Nama CS</th>
                <th className="text-center py-2 px-2 text-[#6B6B78] font-medium text-xs">COD</th>
                <th className="text-center py-2 px-2 text-[#6B6B78] font-medium text-xs">TF</th>
                <th className="text-center py-2 px-2 text-[#6B6B78] font-medium text-xs">Total Order</th>
                <th className="text-right py-2 px-2 text-[#6B6B78] font-medium text-xs">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((cs, i) => (
                <tr
                  key={cs.name}
                  className={`border-b border-[rgba(255,255,255,0.06)] ${
                    i % 2 === 0 ? "bg-transparent" : "bg-[rgba(255,255,255,0.02)]"
                  } hover:bg-[rgba(255,255,255,0.04)] transition-colors`}
                >
                  <td className="py-2 px-2 text-xs text-[#6B6B78]">{i + 4}</td>
                  <td className="py-2 px-2 text-xs font-medium text-[#E8E6E3]">{cs.name}</td>
                  <td className="py-2 px-2 text-xs text-center">
                    <span className="bg-[#F5A623]/15 text-[#F5A623] px-2 py-0.5 rounded-full text-[10px] font-medium">
                      {cs.cod}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-xs text-center">
                    <span className="bg-[#22C55E]/15 text-[#22C55E] px-2 py-0.5 rounded-full text-[10px] font-medium">
                      {cs.tf}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-xs text-center font-bold text-[#E8E6E3]">{cs.total}</td>
                  <td className="py-2 px-2 text-xs text-right text-[#F5A623] font-medium">{formatRupiah(cs.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {csData.length === 0 && (
        <p className="text-[#6B6B78] text-xs text-center py-4">Tidak ada data CS untuk periode ini</p>
      )}
    </div>
  );
}
