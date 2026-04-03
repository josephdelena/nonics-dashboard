"use client";

import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatRupiah, formatNumber } from "@/lib/utils";
import type { OrderRow } from "@/lib/sheets";

const COLORS = ["#EE4D2D", "#FF6E4A", "#FF9A7B", "#D73211", "#2EA88A", "#4A90D9", "#8B5CF6", "#F59E0B", "#06B6D4", "#EC4899"];
const tooltipStyle = {
  contentStyle: { backgroundColor: "#FFFFFF", border: "1px solid #E8E8E8", borderRadius: "8px", color: "#333333", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
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
    <div className="bg-white border border-[#E8E8E8] rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h3 className="text-[#EE4D2D] font-semibold text-sm">Performance CS</h3>
        <div className="flex gap-1.5">
          <button
            onClick={() => setSortBy("total")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              sortBy === "total" ? "bg-[#EE4D2D] text-white" : "bg-white text-[#666666] border border-[#E8E8E8]"
            }`}
          >
            By Orders
          </button>
          <button
            onClick={() => setSortBy("revenue")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              sortBy === "revenue" ? "bg-[#EE4D2D] text-white" : "bg-white text-[#666666] border border-[#E8E8E8]"
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
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
              <XAxis dataKey="name" tick={{ fill: "#999999", fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: "#999999", fontSize: 11 }} />
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
            <tr className="border-b border-[#E8E8E8]">
              <th className="text-left py-2 px-2 text-[#999999] font-medium text-xs w-8">#</th>
              <th className="text-left py-2 px-2 text-[#999999] font-medium text-xs">Nama CS</th>
              <th className="text-center py-2 px-2 text-[#999999] font-medium text-xs">COD</th>
              <th className="text-center py-2 px-2 text-[#999999] font-medium text-xs">TF</th>
              <th className="text-center py-2 px-2 text-[#999999] font-medium text-xs">Total</th>
              <th className="text-right py-2 px-2 text-[#999999] font-medium text-xs">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {csData.map((cs, i) => (
              <tr
                key={cs.name}
                className={`border-b border-[#E8E8E8]/50 ${i % 2 === 0 ? "bg-white" : "bg-[#FFF9F8]"} hover:bg-[#FFF0ED] transition-colors`}
              >
                <td className="py-2 px-2 text-xs text-[#999999]">{i + 1}</td>
                <td className="py-2 px-2 text-xs font-medium text-[#333333]">
                  {i === 0 && <span className="text-[#EE4D2D] mr-1">&#9733;</span>}
                  {cs.name}
                </td>
                <td className="py-2 px-2 text-xs text-center">
                  <span className="bg-[#EE4D2D]/10 text-[#EE4D2D] px-2 py-0.5 rounded-full text-[10px] font-medium">
                    {cs.cod}
                  </span>
                </td>
                <td className="py-2 px-2 text-xs text-center">
                  <span className="bg-[#2EA88A]/10 text-[#2EA88A] px-2 py-0.5 rounded-full text-[10px] font-medium">
                    {cs.tf}
                  </span>
                </td>
                <td className="py-2 px-2 text-xs text-center font-bold text-[#333333]">{cs.total}</td>
                <td className="py-2 px-2 text-xs text-right text-[#EE4D2D] font-medium">{formatRupiah(cs.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {csData.length === 0 && (
          <p className="text-[#999999] text-xs text-center py-4">Tidak ada data CS</p>
        )}
      </div>
    </div>
  );
}
