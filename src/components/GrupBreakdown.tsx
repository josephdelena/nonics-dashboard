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
    <div className="bg-white border border-[#E8E8E8] rounded-xl p-5 shadow-sm">
      <h3 className="text-[#EE4D2D] font-semibold text-sm mb-4">Breakdown per Grup</h3>
      <div className="space-y-3">
        {data.sort((a, b) => b.orders - a.orders).map((g) => (
          <div key={g.name} className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold min-w-[36px] text-center ${
              g.tipe === "COD" ? "bg-[#EE4D2D]/10 text-[#EE4D2D]" : "bg-[#2EA88A]/10 text-[#2EA88A]"
            }`}>
              {g.tipe}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-[#333333] truncate">{g.name}</span>
                <span className="text-xs text-[#999999] ml-2 shrink-0">
                  {g.orders} orders &middot; {formatRupiah(g.revenue)}
                </span>
              </div>
              <div className="h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    g.tipe === "COD" ? "bg-[#EE4D2D]" : "bg-[#2EA88A]"
                  }`}
                  style={{ width: `${Math.max(g.pctOrders, 2)}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-medium text-[#EE4D2D] min-w-[40px] text-right">
              {g.pctOrders.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
