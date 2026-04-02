"use client";

import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatRupiah, formatNumber } from "@/lib/utils";
import type { OrderRow } from "@/lib/sheets";

const COLORS = ["#d9a84e", "#e8c47a", "#b8872e", "#e07040", "#2ea88a", "#4a90d9", "#8b5cf6", "#ef4444", "#06b6d4", "#f59e0b"];
const tooltipStyle = {
  contentStyle: { backgroundColor: "#1a2547", border: "1px solid #2a3a5c", borderRadius: "8px", color: "#e8eaf0" },
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
    <div className="bg-[#141e38] border border-[#2a3a5c] rounded-xl p-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h3 className="text-[#d9a84e] font-semibold text-sm">Performance CS</h3>
        <div className="flex gap-1.5">
          <button
            onClick={() => setSortBy("total")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              sortBy === "total" ? "bg-[#d9a84e] text-[#0f1a33]" : "bg-[#1a2547] text-[#8892a8] border border-[#2a3a5c]"
            }`}
          >
            By Orders
          </button>
          <button
            onClick={() => setSortBy("revenue")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              sortBy === "revenue" ? "bg-[#d9a84e] text-[#0f1a33]" : "bg-[#1a2547] text-[#8892a8] border border-[#2a3a5c]"
            }`}
          >
            By Revenue
          </button>
        </div>
      </div>

      {/* Bar Chart */}
      {chartData.length > 0 && (
        <div className="mb-5">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5c" />
              <XAxis dataKey="name" tick={{ fill: "#8892a8", fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: "#8892a8", fontSize: 11 }} />
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a3a5c]">
              <th className="text-left py-2 px-2 text-[#8892a8] font-medium text-xs w-8">#</th>
              <th className="text-left py-2 px-2 text-[#8892a8] font-medium text-xs">Nama CS</th>
              <th className="text-center py-2 px-2 text-[#8892a8] font-medium text-xs">COD</th>
              <th className="text-center py-2 px-2 text-[#8892a8] font-medium text-xs">TF</th>
              <th className="text-center py-2 px-2 text-[#8892a8] font-medium text-xs">Total</th>
              <th className="text-right py-2 px-2 text-[#8892a8] font-medium text-xs">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {csData.map((cs, i) => (
              <tr
                key={cs.name}
                className={`border-b border-[#2a3a5c]/50 ${i % 2 === 0 ? "bg-[#141e38]" : "bg-[#1a2547]/30"} hover:bg-[#243360]/50 transition-colors`}
              >
                <td className="py-2 px-2 text-xs text-[#8892a8]">{i + 1}</td>
                <td className="py-2 px-2 text-xs font-medium">
                  {i === 0 && <span className="text-[#d9a84e] mr-1">&#9733;</span>}
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
          <p className="text-[#8892a8] text-xs text-center py-4">Tidak ada data CS</p>
        )}
      </div>
    </div>
  );
}
