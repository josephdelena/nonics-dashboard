"use client";

import { formatRupiah } from "@/lib/utils";

interface GrupData { name: string; tipe: "COD" | "TF"; orders: number; revenue: number; pctOrders: number; pctRevenue: number; }

export default function GrupBreakdown({ data }: { data: GrupData[] }) {
  return (
    <div className="glass p-5">
      <h3 className="bg-gradient-to-r from-[#F5A623] to-[#F0C040] bg-clip-text text-transparent font-semibold text-sm mb-4">Breakdown per Grup</h3>
      <div className="space-y-3">
        {data.sort((a, b) => b.orders - a.orders).map((g) => (
          <div key={g.name} className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold min-w-[36px] text-center ${
              g.tipe === "COD" ? "bg-[#F5A623]/15 text-[#F5A623]" : "bg-[#22C55E]/15 text-[#22C55E]"
            }`}>{g.tipe}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-[#E8E6E3] truncate">{g.name}</span>
                <span className="text-xs text-[#6B6B78] ml-2 shrink-0">{g.orders} &middot; {formatRupiah(g.revenue)}</span>
              </div>
              <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${g.tipe === "COD" ? "bg-gradient-to-r from-[#F5A623] to-[#F0C040]" : "bg-gradient-to-r from-[#22C55E] to-[#4ADE80]"}`} style={{ width: `${Math.max(g.pctOrders, 2)}%` }} />
              </div>
            </div>
            <span className="text-xs font-medium text-[#F5A623] min-w-[40px] text-right">{g.pctOrders.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
