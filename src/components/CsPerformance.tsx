"use client";

import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatRupiah, formatNumber } from "@/lib/utils";
import type { OrderRow } from "@/lib/sheets";

const COLORS = ["#F5A623", "#F0C040", "#22C55E", "#4A90D9", "#8B5CF6", "#06B6D4", "#EC4899", "#FF6E4A", "#2EA88A", "#D73211"];
const tooltipStyle = {
  contentStyle: { backgroundColor: "rgba(10,10,15,0.95)", backdropFilter: "blur(20px)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "12px", color: "#E8E6E3", boxShadow: "0 20px 60px rgba(0,0,0,0.8)" },
};

interface CsData {
  name: string;
  cod: number;
  tf: number;
  total: number;
  revenue: number;
}

function getInitials(name: string): string {
  return name.split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function PodiumCard({ cs, rank, metric }: { cs: CsData; rank: 1 | 2 | 3; metric: "total" | "revenue" }) {
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
      <p className={`font-bold text-[#F5A623] mt-1 ${isChamp ? "text-lg" : "text-sm"}`}>
        {metric === "revenue" ? formatRupiah(cs.revenue) : formatNumber(cs.total)}
      </p>
      <p className="text-[10px] text-[#6B6B78] uppercase tracking-widest">
        {metric === "revenue" ? "revenue" : "orders"}
      </p>
      <p className="text-[#9B9BA8] text-[11px] mt-1">
        {metric === "revenue" ? `${formatNumber(cs.total)} orders` : formatRupiah(cs.revenue)}
      </p>
    </div>
  );
}

export default function CsPerformance({ orders }: { orders: OrderRow[] }) {
  const [sortBy, setSortBy] = useState<"total" | "revenue">("total");

  const csData = useMemo(() => {
    const map = new Map<string, CsData>();
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
    return [...map.values()].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [orders, sortBy]);

  const chartData = csData.slice(0, 15);
  const top3 = csData.slice(0, 3);
  const rest = csData.slice(3);

  return (
    <div className="glass-gold p-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h3 className="bg-gradient-to-r from-[#F5A623] to-[#F0C040] bg-clip-text text-transparent font-semibold text-sm">Performance CS</h3>
        <div className="flex gap-1.5">
          <button
            onClick={() => setSortBy("total")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              sortBy === "total"
                ? "bg-gradient-to-r from-[#F5A623] to-[#F0C040] text-[#0A0A0F]"
                : "text-[#6B6B78] border border-[rgba(255,255,255,0.08)] hover:border-[#F5A623]/30"
            }`}
          >
            By Orders
          </button>
          <button
            onClick={() => setSortBy("revenue")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              sortBy === "revenue"
                ? "bg-gradient-to-r from-[#F5A623] to-[#F0C040] text-[#0A0A0F]"
                : "text-[#6B6B78] border border-[rgba(255,255,255,0.08)] hover:border-[#F5A623]/30"
            }`}
          >
            By Revenue
          </button>
        </div>
      </div>

      {/* Podium Leaderboard */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-6 max-w-md mx-auto items-end">
          <PodiumCard cs={top3[1]} rank={2} metric={sortBy} />
          <PodiumCard cs={top3[0]} rank={1} metric={sortBy} />
          <PodiumCard cs={top3[2]} rank={3} metric={sortBy} />
        </div>
      )}
      {top3.length > 0 && top3.length < 3 && (
        <div className="flex justify-center gap-3 mb-6">
          {top3.map((cs, i) => (
            <div key={cs.name} className="w-40">
              <PodiumCard cs={cs} rank={(i + 1) as 1 | 2 | 3} metric={sortBy} />
            </div>
          ))}
        </div>
      )}

      {chartData.length > 0 && (
        <div className="mb-5">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,166,35,0.04)" />
              <XAxis dataKey="name" tick={{ fill: "#6B6B78", fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: "#6B6B78", fontSize: 11 }} />
              <Tooltip
                {...tooltipStyle}
                formatter={(value) => {
                  const v = Number(value) || 0;
                  return sortBy === "revenue" ? formatRupiah(v) : formatNumber(v);
                }}
              />
              <Bar dataKey={sortBy} radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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
                <th className="text-center py-2 px-2 text-[#6B6B78] font-medium text-xs">Total</th>
                <th className="text-right py-2 px-2 text-[#6B6B78] font-medium text-xs">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((cs, i) => (
                <tr
                  key={cs.name}
                  className={`border-b border-[rgba(255,255,255,0.06)] ${i % 2 === 0 ? "bg-transparent" : "bg-[rgba(255,255,255,0.02)]"} hover:bg-[rgba(255,255,255,0.04)] transition-colors`}
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
        <p className="text-[#6B6B78] text-xs text-center py-4">Tidak ada data CS</p>
      )}
    </div>
  );
}
