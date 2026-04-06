"use client";

import { formatRupiah } from "@/lib/utils";

interface GrupData { name: string; tipe: "COD" | "TF"; orders: number; revenue: number; pctOrders: number; pctRevenue: number; }

export default function GrupBreakdown({ data }: { data: GrupData[] }) {
  return (
    <div className="glass-gold p-5">
      <h3 className="bg-gradient-to-r from-[#F5A623] to-[#F0C040] bg-clip-text text-transparent font-semibold text-sm mb-4">Breakdown per Grup</h3>
      <div className="space-y-3">
        {data.sort((a, b) => b.orders - a.orders).map((g) => (
          <div key={g.name} className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold min-w-[36px] text-center ${
              g.tipe === "COD" ? "bg-[#F5A623]/15 text-[#F5A623]" : "bg-[#22C55E]/15 text-[#22C55E]"
            }`}>{g.tipe}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-[#E8E6E3] truncate">{g.name}</span>
                <span className="text-xs text-[#6B6B78] ml-2 shrink-0">{g.orders} &middot; {formatRupiah(g.revenue)}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.max(g.pctOrders, 2)}%`,
                    background: g.tipe === "COD" ? "linear-gradient(90deg, #F5A623, #F0C040)" : "linear-gradient(90deg, #22C55E, #16A34A)",
                    boxShadow: g.tipe === "COD" ? "0 0 8px rgba(245,166,35,0.6)" : "0 0 8px rgba(34,197,94,0.6)",
                  }}
                />
              </div>
            </div>
            <span className="text-xs font-medium text-[#F5A623] min-w-[40px] text-right">{g.pctOrders.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
