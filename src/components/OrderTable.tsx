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
  const [filterStatus, setFilterStatus] = useState<"ALL" | "Sukses" | "RTS" | "DUPLIKAT">("ALL");
  const PAGE_SIZE = 50;
  const [page, setPage] = useState(1);

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

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  return (
    <div className="glass p-5">
      <h3 className="bg-gradient-to-r from-[#F5A623] to-[#F0C040] bg-clip-text text-transparent font-semibold text-sm mb-4">Detail Orders</h3>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Cari nama, produk, CS, alamat..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); resetPage(); }}
          className="flex-1 bg-[#12121A] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-sm text-[#E8E6E3] placeholder-[#6B6B78] focus:outline-none focus:border-[#F5A623]/50"
        />
        <select
          value={filterTipe}
          onChange={(e) => { setFilterTipe(e.target.value as "ALL" | "COD" | "TF"); resetPage(); }}
          className="bg-[#12121A] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-sm text-[#E8E6E3] focus:outline-none focus:border-[#F5A623]/50"
        >
          <option value="ALL">Semua Tipe</option>
          <option value="COD">COD</option>
          <option value="TF">TF</option>
        </select>
        <select
          value={filterGrup}
          onChange={(e) => { setFilterGrup(e.target.value); resetPage(); }}
          className="bg-[#12121A] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-sm text-[#E8E6E3] focus:outline-none focus:border-[#F5A623]/50"
        >
          <option value="ALL">Semua Grup</option>
          {grups.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value as "ALL" | "Sukses" | "RTS" | "DUPLIKAT"); resetPage(); }}
          className="bg-[#12121A] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-sm text-[#E8E6E3] focus:outline-none focus:border-[#F5A623]/50"
        >
          <option value="ALL">Semua Status</option>
          <option value="Sukses">Sukses</option>
          <option value="RTS">RTS</option>
          <option value="DUPLIKAT">Duplikat</option>
        </select>
      </div>

      <p className="text-[#6B6B78] text-xs mb-3">{filtered.length} orders ditampilkan</p>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.06)]">
              <th className="text-left py-2 px-2 text-[#6B6B78] font-medium text-xs">Tanggal</th>
              <th className="text-left py-2 px-2 text-[#6B6B78] font-medium text-xs">Grup</th>
              <th className="text-left py-2 px-2 text-[#6B6B78] font-medium text-xs">CS</th>
              <th className="text-left py-2 px-2 text-[#6B6B78] font-medium text-xs">Produk</th>
              <th className="text-right py-2 px-2 text-[#6B6B78] font-medium text-xs">Harga</th>
              <th className="text-right py-2 px-2 text-[#6B6B78] font-medium text-xs">Total</th>
              <th className="text-left py-2 px-2 text-[#6B6B78] font-medium text-xs">Customer</th>
              <th className="text-center py-2 px-2 text-[#6B6B78] font-medium text-xs">Tipe</th>
              <th className="text-center py-2 px-2 text-[#6B6B78] font-medium text-xs">Status</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const sliced = paged;
              let lastDateKey = "";
              const rows: React.ReactNode[] = [];
              sliced.forEach((o, i) => {
                const d = parseDate(o.tanggal);
                const dateKey = d ? format(d, "yyyy-MM-dd") : o.tanggal.split(" ")[0];
                if (dateKey !== lastDateKey) {
                  const label = d ? format(d, "dd MMMM yyyy", { locale: id }) : dateKey;
                  rows.push(
                    <tr key={`date-${dateKey}`} className="bg-[rgba(245,166,35,0.08)]">
                      <td colSpan={9} className="py-2 px-3 text-xs font-semibold text-[#F5A623] tracking-wide">
                        {"\uD83D\uDCC5"} {label}
                      </td>
                    </tr>
                  );
                  lastDateKey = dateKey;
                }
                rows.push(
                  <tr key={`${o.grup}-${o.no}-${i}`} className={`border-b border-[rgba(255,255,255,0.06)] ${i % 2 === 0 ? "bg-transparent" : "bg-[rgba(255,255,255,0.02)]"} hover:bg-[rgba(255,255,255,0.04)] transition-colors`}>
                    <td className="py-2 px-2 text-xs whitespace-nowrap text-[#9B9BA8]">{o.tanggal}</td>
                    <td className="py-2 px-2 text-xs text-[#9B9BA8]">{o.grup}</td>
                    <td className="py-2 px-2 text-xs text-[#E8E6E3]">{o.namaCs}</td>
                    <td className="py-2 px-2 text-xs text-[#E8E6E3]">{o.produk}</td>
                    <td className="py-2 px-2 text-xs text-right text-[#9B9BA8]">{formatRupiah(o.hargaJual)}</td>
                    <td className="py-2 px-2 text-xs text-right font-medium text-[#F5A623]">{formatRupiah(o.total)}</td>
                    <td className="py-2 px-2 text-xs text-[#E8E6E3]">{o.namaCustomer}</td>
                    <td className="py-2 px-2 text-xs text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        o.tipe === "COD"
                          ? "bg-[#F5A623]/15 text-[#F5A623]"
                          : "bg-[#22C55E]/15 text-[#22C55E]"
                      }`}>
                        {o.tipe}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-xs text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        o.status === "RTS"
                          ? "bg-red-500/15 text-red-400"
                          : o.status === "DUPLIKAT"
                            ? "bg-amber-500/15 text-amber-400"
                            : "bg-emerald-500/15 text-emerald-400"
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
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#6B6B78] border border-[rgba(255,255,255,0.08)] disabled:opacity-30 hover:border-[#F5A623]/30 transition-colors"
            >
              &laquo; Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="text-[#6B6B78] text-xs px-1">&hellip;</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      page === p
                        ? "bg-gradient-to-r from-[#F5A623] to-[#F0C040] text-[#0A0A0F]"
                        : "text-[#6B6B78] border border-[rgba(255,255,255,0.08)] hover:border-[#F5A623]/30"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#6B6B78] border border-[rgba(255,255,255,0.08)] disabled:opacity-30 hover:border-[#F5A623]/30 transition-colors"
            >
              Next &raquo;
            </button>
            <span className="text-[#6B6B78] text-xs ml-2">
              {(page - 1) * PAGE_SIZE + 1}&ndash;{Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
