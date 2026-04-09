"use client";

import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { formatRupiah, parseDate } from "@/lib/utils";
import type { OrderRow } from "@/lib/sheets";

type Status = "Sukses" | "RTS" | "DUPLIKAT" | "REPEAT RTS";
const ALL_STATUSES: Status[] = ["Sukses", "RTS", "DUPLIKAT", "REPEAT RTS"];

interface Props {
  orders: OrderRow[];
  onStatusChange?: () => void;
}

function statusBadge(status: string) {
  const cls =
    status === "RTS" ? "bg-red-500/15 text-red-400"
    : status === "DUPLIKAT" ? "bg-amber-500/15 text-amber-400"
    : status === "REPEAT RTS" ? "bg-purple-500/15 text-purple-400"
    : "bg-emerald-500/15 text-emerald-400";
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cls}`}>{status}</span>;
}

export default function OrderTable({ orders, onStatusChange }: Props) {
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterTipe, setFilterTipe] = useState<"ALL" | "COD" | "TF">("ALL");
  const [filterGrup, setFilterGrup] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | Status>("ALL");
  const PAGE_SIZE = 50;
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<Status>("Sukses");
  const [editAlamat, setEditAlamat] = useState("");
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState<"status" | "alamat">("status");

  const grups = useMemo(() => [...new Set(orders.map((o) => o.grup))].sort(), [orders]);

  const filtered = useMemo(() => {
    const result = orders.filter((o) => {
      if (filterDate) {
        const d = parseDate(o.tanggal);
        if (!d) return false;
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        if (dateKey !== filterDate) return false;
      }
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
  }, [orders, search, filterDate, filterTipe, filterGrup, filterStatus]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);
  const orderKey = (o: OrderRow) => `${o.grup}|${o.sheetRow}`;
  const allPageSelected = paged.length > 0 && paged.every((o) => selected.has(orderKey(o)));

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        paged.forEach((o) => next.delete(orderKey(o)));
      } else {
        paged.forEach((o) => next.add(orderKey(o)));
      }
      return next;
    });
  }, [paged, allPageSelected]);

  const toggleOne = useCallback((o: OrderRow) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const key = orderKey(o);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  // When selecting a single order, prefill alamat
  const selectedOrders = useMemo(() => orders.filter((o) => selected.has(orderKey(o))), [orders, selected]);

  const handleBulkUpdate = async () => {
    if (selected.size === 0) return;
    setUpdating(true);

    const fields: Record<string, string> = {};
    if (editMode === "status") {
      fields.status = bulkStatus;
    } else {
      if (!editAlamat.trim()) { setUpdating(false); return; }
      fields.alamat = editAlamat.trim();
    }

    const updates = selectedOrders.map((o) => ({ grup: o.grup, sheetRow: o.sheetRow, fields }));

    try {
      const res = await fetch("/api/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = await res.json();
      if (res.ok) {
        // Update local state for immediate UI feedback
        for (const o of orders) {
          if (selected.has(orderKey(o))) {
            if (fields.status) (o as any).status = fields.status;
            if (fields.alamat) (o as any).alamat = fields.alamat;
          }
        }
        setSelected(new Set());
        setEditAlamat("");
        if (onStatusChange) onStatusChange();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch {
      alert("Gagal update");
    } finally {
      setUpdating(false);
    }
  };

  const inputCls = "bg-[#12121A] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-sm text-[#E8E6E3] focus:outline-none focus:border-[#F5A623]/50";
  const checkboxCls = "w-4 h-4 cursor-pointer accent-[#F5A623]";
  const COL_SPAN = 13;

  return (
    <div className="glass p-5">
      <h3 className="bg-gradient-to-r from-[#F5A623] to-[#F0C040] bg-clip-text text-transparent font-semibold text-sm mb-4">Detail Orders</h3>

      {/* Action Bar */}
      {selected.size > 0 && (
        <div className="mb-4 px-4 py-3 rounded-xl border border-[#F5A623]/30 space-y-3" style={{ background: "linear-gradient(135deg, rgba(245,166,35,0.1), rgba(245,166,35,0.03))" }}>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-[#F5A623] font-semibold">{selected.size} dipilih</span>
            <div className="flex rounded-lg overflow-hidden border border-[rgba(255,255,255,0.08)]">
              <button
                onClick={() => setEditMode("status")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${editMode === "status" ? "bg-[#F5A623]/20 text-[#F5A623]" : "text-[#6B6B78] hover:text-[#E8E6E3]"}`}
              >
                Edit Status
              </button>
              <button
                onClick={() => { setEditMode("alamat"); if (selectedOrders.length === 1) setEditAlamat(selectedOrders[0].alamat); }}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${editMode === "alamat" ? "bg-[#F5A623]/20 text-[#F5A623]" : "text-[#6B6B78] hover:text-[#E8E6E3]"}`}
              >
                Edit Alamat
              </button>
            </div>
            {editMode === "status" ? (
              <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value as Status)} className={inputCls}>
                {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <input
                type="text"
                value={editAlamat}
                onChange={(e) => setEditAlamat(e.target.value)}
                placeholder="Alamat baru..."
                className={`flex-1 min-w-[200px] ${inputCls} placeholder-[#6B6B78]`}
              />
            )}
            <button
              onClick={handleBulkUpdate}
              disabled={updating}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#0A0A0F] bg-gradient-to-r from-[#F5A623] to-[#F0C040] hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {updating ? "Updating..." : "Simpan"}
            </button>
            <button
              onClick={() => { setSelected(new Set()); setEditAlamat(""); }}
              className="px-3 py-2 rounded-lg text-xs text-[#6B6B78] border border-[rgba(255,255,255,0.08)] hover:border-[#F5A623]/30 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input type="text" placeholder="Cari nama, produk, CS, alamat..." value={search}
          onChange={(e) => { setSearch(e.target.value); resetPage(); }}
          className={`flex-1 ${inputCls} placeholder-[#6B6B78]`} />
        <input type="date" value={filterDate}
          onChange={(e) => { setFilterDate(e.target.value); resetPage(); }}
          className={`${inputCls} [&::-webkit-calendar-picker-indicator]:invert`} />
        <select value={filterTipe} onChange={(e) => { setFilterTipe(e.target.value as any); resetPage(); }} className={inputCls}>
          <option value="ALL">Semua Tipe</option>
          <option value="COD">COD</option>
          <option value="TF">TF</option>
        </select>
        <select value={filterGrup} onChange={(e) => { setFilterGrup(e.target.value); resetPage(); }} className={inputCls}>
          <option value="ALL">Semua Grup</option>
          {grups.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value as any); resetPage(); }} className={inputCls}>
          <option value="ALL">Semua Status</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <p className="text-[#6B6B78] text-xs mb-3">{filtered.length} orders ditampilkan</p>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.06)]">
              <th className="py-2 px-2 w-8"><input type="checkbox" checked={allPageSelected} onChange={toggleAll} className={checkboxCls} /></th>
              <th className="text-left py-2 px-2 text-[#6B6B78] font-medium text-xs">Tanggal</th>
              <th className="text-left py-2 px-2 text-[#6B6B78] font-medium text-xs">Grup</th>
              <th className="text-left py-2 px-2 text-[#6B6B78] font-medium text-xs">CS</th>
              <th className="text-left py-2 px-2 text-[#6B6B78] font-medium text-xs">Produk</th>
              <th className="text-right py-2 px-2 text-[#6B6B78] font-medium text-xs">Harga</th>
              <th className="text-right py-2 px-2 text-[#6B6B78] font-medium text-xs">Total</th>
              <th className="text-left py-2 px-2 text-[#6B6B78] font-medium text-xs">Customer</th>
              <th className="text-left py-2 px-2 text-[#6B6B78] font-medium text-xs">Alamat</th>
              <th className="text-center py-2 px-2 text-[#6B6B78] font-medium text-xs">Kode Pos</th>
              <th className="text-center py-2 px-2 text-[#6B6B78] font-medium text-xs">Tipe</th>
              <th className="text-center py-2 px-2 text-[#6B6B78] font-medium text-xs">Status</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let lastDateKey = "";
              const rows: React.ReactNode[] = [];
              paged.forEach((o, i) => {
                const d = parseDate(o.tanggal);
                const dateKey = d ? format(d, "yyyy-MM-dd") : o.tanggal.split(" ")[0];
                if (dateKey !== lastDateKey) {
                  const label = d ? format(d, "dd MMMM yyyy", { locale: id }) : dateKey;
                  rows.push(
                    <tr key={`date-${dateKey}`} className="bg-[rgba(245,166,35,0.08)]">
                      <td colSpan={COL_SPAN} className="py-2 px-3 text-xs font-semibold text-[#F5A623] tracking-wide">{"\uD83D\uDCC5"} {label}</td>
                    </tr>
                  );
                  lastDateKey = dateKey;
                }
                const key = orderKey(o);
                const isChecked = selected.has(key);
                rows.push(
                  <tr key={`${key}-${i}`} className={`border-b border-[rgba(255,255,255,0.06)] ${isChecked ? "bg-[rgba(245,166,35,0.06)]" : i % 2 === 0 ? "bg-transparent" : "bg-[rgba(255,255,255,0.02)]"} hover:bg-[rgba(255,255,255,0.04)] transition-colors`}>
                    <td className="py-2 px-2"><input type="checkbox" checked={isChecked} onChange={() => toggleOne(o)} className={checkboxCls} /></td>
                    <td className="py-2 px-2 text-xs whitespace-nowrap text-[#9B9BA8]">{o.tanggal}</td>
                    <td className="py-2 px-2 text-xs text-[#9B9BA8]">{o.grup}</td>
                    <td className="py-2 px-2 text-xs text-[#E8E6E3]">{o.namaCs}</td>
                    <td className="py-2 px-2 text-xs text-[#E8E6E3]">{o.produk}</td>
                    <td className="py-2 px-2 text-xs text-right text-[#9B9BA8]">{formatRupiah(o.hargaJual)}</td>
                    <td className="py-2 px-2 text-xs text-right font-medium text-[#F5A623]">{formatRupiah(o.total)}</td>
                    <td className="py-2 px-2 text-xs text-[#E8E6E3]">{o.namaCustomer}</td>
                    <td className="py-2 px-2 text-xs text-[#9B9BA8] max-w-[200px] truncate" title={o.alamat}>{o.alamat}</td>
                    <td className="py-2 px-2 text-xs text-center text-[#9B9BA8]">{o.kodepos || <span className="text-[#6B6B78]">—</span>}</td>
                    <td className="py-2 px-2 text-xs text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${o.tipe === "COD" ? "bg-[#F5A623]/15 text-[#F5A623]" : "bg-[#22C55E]/15 text-[#22C55E]"}`}>{o.tipe}</span>
                    </td>
                    <td className="py-2 px-2 text-xs text-center">{statusBadge(o.status)}</td>
                  </tr>
                );
              });
              return rows;
            })()}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#6B6B78] border border-[rgba(255,255,255,0.08)] disabled:opacity-30 hover:border-[#F5A623]/30 transition-colors">&laquo; Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                acc.push(p); return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? <span key={`dots-${i}`} className="text-[#6B6B78] text-xs px-1">&hellip;</span> : (
                  <button key={p} onClick={() => setPage(p as number)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${page === p ? "bg-gradient-to-r from-[#F5A623] to-[#F0C040] text-[#0A0A0F]" : "text-[#6B6B78] border border-[rgba(255,255,255,0.08)] hover:border-[#F5A623]/30"}`}>{p}</button>
                )
              )}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#6B6B78] border border-[rgba(255,255,255,0.08)] disabled:opacity-30 hover:border-[#F5A623]/30 transition-colors">Next &raquo;</button>
            <span className="text-[#6B6B78] text-xs ml-2">{(page - 1) * PAGE_SIZE + 1}&ndash;{Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}
