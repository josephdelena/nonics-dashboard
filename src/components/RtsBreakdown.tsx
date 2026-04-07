"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatRupiah, formatNumber } from "@/lib/utils";
import type { OrderRow } from "@/lib/sheets";

const tooltipStyle = {
  contentStyle: { backgroundColor: "rgba(10,10,15,0.95)", backdropFilter: "blur(20px)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "12px", color: "#E8E6E3", boxShadow: "0 20px 60px rgba(0,0,0,0.8)" },
};

interface ProdukRts { name: string; count: number; value: number; }
interface CsRts { name: string; count: number; value: number; }

export default function RtsBreakdown({ orders }: { orders: OrderRow[] }) {
  const { rtsOrders, totalOrders, produkData, csData, totalRts, totalRtsValue, rtsRate } = useMemo(() => {
    const rts = orders.filter((o) => o.status === "RTS");
    const total = orders.length;

    const produkMap = new Map<string, ProdukRts>();
    const csMap = new Map<string, CsRts>();

    for (const o of rts) {
      const produk = (o.produk || "").trim();
      if (produk) {
        const key = produk.toUpperCase();
        const e = produkMap.get(key) || { name: produk, count: 0, value: 0 };
        e.count++;
        e.value += o.total;
        produkMap.set(key, e);
      }

      const cs = (o.namaCs || "").trim();
      if (cs) {
        const key = cs.toUpperCase();
        const e = csMap.get(key) || { name: cs, count: 0, value: 0 };
        e.count++;
        e.value += o.total;
        csMap.set(key, e);
      }
    }

    return {
      rtsOrders: rts,
      totalOrders: total,
      produkData: [...produkMap.values()].sort((a, b) => b.count - a.count).slice(0, 10),
      csData: [...csMap.values()].sort((a, b) => b.count - a.count),
      totalRts: rts.length,
      totalRtsValue: rts.reduce((s, o) => s + o.total, 0),
      rtsRate: total > 0 ? (rts.length / total) * 100 : 0,
    };
  }, [orders]);

  if (totalRts === 0) return null;

  return (
    <div className="glass-gold p-5">
      <h3 className="bg-gradient-to-r from-[#EF4444] to-[#DC2626] bg-clip-text text-transparent font-semibold text-base mb-4">RTS Breakdown</h3>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass p-4 text-center" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
          <p className="text-[10px] text-[#9B9BA8] uppercase tracking-widest font-medium mb-1">Total RTS</p>
          <p className="text-xl font-bold text-red-400">{formatNumber(totalRts)}</p>
        </div>
        <div className="glass p-4 text-center" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
          <p className="text-[10px] text-[#9B9BA8] uppercase tracking-widest font-medium mb-1">Nilai RTS</p>
          <p className="text-xl font-bold text-red-400">{formatRupiah(totalRtsValue)}</p>
        </div>
        <div className="glass p-4 text-center" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
          <p className="text-[10px] text-[#9B9BA8] uppercase tracking-widest font-medium mb-1">RTS Rate</p>
          <p className="text-xl font-bold text-red-400">{rtsRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* 2 Column: Chart + Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Produk RTS Chart */}
        <div className="glass p-4" style={{ borderColor: "rgba(239,68,68,0.15)" }}>
          <h4 className="text-sm font-semibold text-red-400 mb-3">Produk RTS Tertinggi</h4>
          {produkData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={produkData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <defs>
                  <linearGradient id="rtsBarGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="100%" stopColor="#DC2626" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,166,35,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#6B6B78", fontSize: 11 }} />
                <YAxis
                  type="category" dataKey="name" width={140}
                  tick={{ fill: "#9B9BA8", fontSize: 10 }}
                  tickFormatter={(v: string) => v.length > 20 ? v.slice(0, 20) + "..." : v}
                />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value) => formatNumber(Number(value) || 0)}
                />
                <Bar dataKey="count" name="RTS" radius={[0, 4, 4, 0]} fill="url(#rtsBarGrad)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-[#6B6B78] text-xs text-center py-4">Tidak ada data</p>
          )}
        </div>

        {/* CS RTS Table */}
        <div className="glass p-4" style={{ borderColor: "rgba(239,68,68,0.15)" }}>
          <h4 className="text-sm font-semibold text-red-400 mb-3">CS dengan RTS Tertinggi</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  <th className="text-left py-2 px-2 text-[#6B6B78] font-medium text-xs w-8">#</th>
                  <th className="text-left py-2 px-2 text-[#6B6B78] font-medium text-xs">Nama CS</th>
                  <th className="text-center py-2 px-2 text-[#6B6B78] font-medium text-xs">RTS</th>
                  <th className="text-right py-2 px-2 text-[#6B6B78] font-medium text-xs">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {csData.map((cs, i) => (
                  <tr
                    key={cs.name}
                    className={`border-b border-[rgba(255,255,255,0.06)] ${i % 2 === 0 ? "bg-transparent" : "bg-[rgba(255,255,255,0.02)]"} hover:bg-[rgba(255,255,255,0.04)] transition-colors`}
                  >
                    <td className="py-2 px-2 text-xs text-[#6B6B78]">{i + 1}</td>
                    <td className="py-2 px-2 text-xs font-medium text-[#E8E6E3]">{cs.name}</td>
                    <td className="py-2 px-2 text-xs text-center">
                      <span className="bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {cs.count}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-xs text-right text-red-400 font-medium">{formatRupiah(cs.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {csData.length === 0 && (
              <p className="text-[#6B6B78] text-xs text-center py-4">Tidak ada data RTS</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
