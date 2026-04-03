"use client";

import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatRupiah, formatNumber } from "@/lib/utils";
import type { OrderRow } from "@/lib/sheets";

const COLORS = ["#F5A623", "#F0C040", "#22C55E", "#4A90D9", "#8B5CF6", "#06B6D4", "#EC4899", "#FF6E4A", "#2EA88A", "#D73211"];
const tooltipStyle = {
  contentStyle: { backgroundColor: "#1A1A25", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#E8E6E3", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" },
};

interface CsData {
  name: string;
  cod: number;
  tf: number;
  total: number;
  revenue: number;
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

  return (
    <div className="glass p-5">
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

      {chartData.length > 0 && (
        <div className="mb-5">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
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
            {csData.map((cs, i) => (
              <tr
                key={cs.name}
                className={`border-b border-[rgba(255,255,255,0.06)] ${i % 2 === 0 ? "bg-transparent" : "bg-[rgba(255,255,255,0.02)]"} hover:bg-[rgba(255,255,255,0.04)] transition-colors`}
              >
                <td className="py-2 px-2 text-xs text-[#6B6B78]">
                  {i === 0 ? "\uD83E\uDD47" : i === 1 ? "\uD83E\uDD48" : i === 2 ? "\uD83E\uDD49" : i + 1}
                </td>
                <td className="py-2 px-2 text-xs font-medium text-[#E8E6E3]">
                  {cs.name}
                </td>
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
        {csData.length === 0 && (
          <p className="text-[#6B6B78] text-xs text-center py-4">Tidak ada data CS</p>
        )}
      </div>
    </div>
  );
}
