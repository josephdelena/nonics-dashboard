"use client";

import { formatRupiah } from "@/lib/utils";

interface GrupData {
  name: string;
  tipe: "COD" | "TF";
  orders: number;
  revenue: number;
  pctOrders: number;
  pctRevenue: number;
}

export default function GrupBreakdown({ data }: { data: GrupData[] }) {
  return (
    <div className="bg-[#141e38] border border-[#2a3a5c] rounded-xl p-5">
      <h3 className="text-[#d9a84e] font-semibold text-sm mb-4">Breakdown per Grup</h3>
      <div className="space-y-3">
        {data.sort((a, b) => b.orders - a.orders).map((g) => (
          <div key={g.name} className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold min-w-[36px] text-center ${
              g.tipe === "COD" ? "bg-[#e07040]/20 text-[#e07040]" : "bg-[#2ea88a]/20 text-[#2ea88a]"
            }`}>
              {g.tipe}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-[#e8eaf0] truncate">{g.name}</span>
                <span className="text-xs text-[#8892a8] ml-2 shrink-0">
                  {g.orders} orders · {formatRupiah(g.revenue)}
                </span>
              </div>
              <div className="h-2 bg-[#1a2547] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    g.tipe === "COD" ? "bg-[#e07040]" : "bg-[#2ea88a]"
                  }`}
                  style={{ width: `${Math.max(g.pctOrders, 2)}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-medium text-[#d9a84e] min-w-[40px] text-right">
              {g.pctOrders.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
