"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { formatRupiah, parseDate } from "@/lib/utils";
import type { OrderRow } from "@/lib/sheets";

interface Props {
  orders: OrderRow[];
}

export default function OrderTable({ orders }: Props) {
  const [search, setSearch] = useState("");
  const [filterTipe, setFilterTipe] = useState<"ALL" | "COD" | "TF">("ALL");
  const [filterGrup, setFilterGrup] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "Sukses" | "RTS">("ALL");

  const grups = useMemo(() => [...new Set(orders.map((o) => o.grup))].sort(), [orders]);

  const filtered = useMemo(() => {
    const result = orders.filter((o) => {
      if (filterTipe !== "ALL" && o.tipe !== filterTipe) return false;
      if (filterGrup !== "ALL" && o.grup !== filterGrup) return false;
      if (filterStatus !== "ALL" && o.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          o.namaCustomer.toLowerCase().includes(q) ||
          o.produk.toLowerCase().includes(q) ||
          o.namaCs.toLowerCase().includes(q) ||
          o.alamat.toLowerCase().includes(q) ||
          o.grup.toLowerCase().includes(q)
        );
      }
      return true;
    });
    return result.sort((a, b) => {
      const da = parseDate(a.tanggal);
      const db = parseDate(b.tanggal);
      if (!da || !db) return 0;
      return db.getTime() - da.getTime();
    });
  }, [orders, search, filterTipe, filterGrup, filterStatus]);

  return (
    <div className="bg-[#141e38] border border-[#2a3a5c] rounded-xl p-5">
      <h3 className="text-[#d9a84e] font-semibold text-sm mb-4">Detail Orders</h3>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Cari nama, produk, CS, alamat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#1a2547] border border-[#2a3a5c] rounded-lg px-3 py-2 text-sm text-[#e8eaf0] placeholder-[#8892a8] focus:outline-none focus:border-[#d9a84e]"
        />
        <select
          value={filterTipe}
          onChange={(e) => setFilterTipe(e.target.value as "ALL" | "COD" | "TF")}
          className="bg-[#1a2547] border border-[#2a3a5c] rounded-lg px-3 py-2 text-sm text-[#e8eaf0] focus:outline-none focus:border-[#d9a84e]"
        >
          <option value="ALL">Semua Tipe</option>
          <option value="COD">COD</option>
          <option value="TF">TF</option>
        </select>
        <select
          value={filterGrup}
          onChange={(e) => setFilterGrup(e.target.value)}
          className="bg-[#1a2547] border border-[#2a3a5c] rounded-lg px-3 py-2 text-sm text-[#e8eaf0] focus:outline-none focus:border-[#d9a84e]"
        >
          <option value="ALL">Semua Grup</option>
          {grups.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "ALL" | "Sukses" | "RTS")}
          className="bg-[#1a2547] border border-[#2a3a5c] rounded-lg px-3 py-2 text-sm text-[#e8eaf0] focus:outline-none focus:border-[#d9a84e]"
        >
          <option value="ALL">Semua Status</option>
          <option value="Sukses">Sukses</option>
          <option value="RTS">RTS</option>
        </select>
      </div>

      <p className="text-[#8892a8] text-xs mb-3">{filtered.length} orders ditampilkan</p>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a3a5c]">
              <th className="text-left py-2 px-2 text-[#8892a8] font-medium text-xs">Tanggal</th>
              <th className="text-left py-2 px-2 text-[#8892a8] font-medium text-xs">Grup</th>
              <th className="text-left py-2 px-2 text-[#8892a8] font-medium text-xs">CS</th>
              <th className="text-left py-2 px-2 text-[#8892a8] font-medium text-xs">Produk</th>
              <th className="text-right py-2 px-2 text-[#8892a8] font-medium text-xs">Harga</th>
              <th className="text-right py-2 px-2 text-[#8892a8] font-medium text-xs">Total</th>
              <th className="text-left py-2 px-2 text-[#8892a8] font-medium text-xs">Customer</th>
              <th className="text-center py-2 px-2 text-[#8892a8] font-medium text-xs">Tipe</th>
              <th className="text-center py-2 px-2 text-[#8892a8] font-medium text-xs">Status</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const sliced = filtered.slice(0, 100);
              let lastDateKey = "";
              const rows: React.ReactNode[] = [];
              sliced.forEach((o, i) => {
                const d = parseDate(o.tanggal);
                const dateKey = d ? format(d, "yyyy-MM-dd") : o.tanggal.split(" ")[0];
                if (dateKey !== lastDateKey) {
                  const label = d ? format(d, "dd MMMM yyyy", { locale: id }) : dateKey;
                  rows.push(
                    <tr key={`date-${dateKey}`} className="bg-[#1e2d50]">
                      <td colSpan={9} className="py-2 px-3 text-xs font-semibold text-[#d9a84e] tracking-wide">
                        {"\uD83D\uDCC5"} {label}
                      </td>
                    </tr>
                  );
                  lastDateKey = dateKey;
                }
                rows.push(
                  <tr key={`${o.grup}-${o.no}-${i}`} className={`border-b border-[#2a3a5c]/50 ${i % 2 === 0 ? "bg-[#141e38]" : "bg-[#1a2547]/30"} hover:bg-[#243360]/50 transition-colors`}>
                    <td className="py-2 px-2 text-xs whitespace-nowrap">{o.tanggal}</td>
                    <td className="py-2 px-2 text-xs">{o.grup}</td>
                    <td className="py-2 px-2 text-xs">{o.namaCs}</td>
                    <td className="py-2 px-2 text-xs">{o.produk}</td>
                    <td className="py-2 px-2 text-xs text-right">{formatRupiah(o.hargaJual)}</td>
                    <td className="py-2 px-2 text-xs text-right font-medium text-[#d9a84e]">{formatRupiah(o.total)}</td>
                    <td className="py-2 px-2 text-xs">{o.namaCustomer}</td>
                    <td className="py-2 px-2 text-xs text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        o.tipe === "COD"
                          ? "bg-[#e07040]/20 text-[#e07040]"
                          : "bg-[#2ea88a]/20 text-[#2ea88a]"
                      }`}>
                        {o.tipe}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-xs text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        o.status === "RTS"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                );
              });
              return rows;
            })()}
          </tbody>
        </table>
        {filtered.length > 100 && (
          <p className="text-[#8892a8] text-xs mt-3 text-center">Menampilkan 100 dari {filtered.length} orders</p>
        )}
      </div>
    </div>
  );
}
