"use client";

import { useState, useEffect } from "react";
import type { OrderRow } from "@/lib/sheets";

interface Props {
  orders: OrderRow[];
  onClose: () => void;
  onBooked: () => void;
}

const SENDER_DEFAULTS = {
  name: "Nonics",
  phone: "085272127441",
  address: "Jl. Perintis Kemerdekaan KM 12, Makassar",
  zipcode: "90245",
};

const KURIR_MAP: Record<string, { service: string; service_type: string }> = {
  "lion parcel_Regpack": { service: "lion", service_type: "REGPACK" },
  "id express_idlite": { service: "idexpress", service_type: "idlite" },
};

export default function BookingModal({ orders, onClose, onBooked }: Props) {
  const [sender, setSender] = useState(SENDER_DEFAULTS);
  const [senderKecId, setSenderKecId] = useState(0);
  const [senderKecSearch, setSenderKecSearch] = useState("Tamalanrea");
  const [senderKecResults, setSenderKecResults] = useState<{ id: number; text: string }[]>([]);

  const [weight, setWeight] = useState(1000);
  const [length, setLength] = useState(15);
  const [width, setWidth] = useState(15);
  const [height, setHeight] = useState(10);

  const [booking, setBooking] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [destKecIds, setDestKecIds] = useState<Map<number, number>>(new Map());
  const [lookingUp, setLookingUp] = useState(false);

  const inputCls = "bg-[#0d0d14] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-[#E8E6E3] focus:outline-none focus:border-[#F5A623]/50 w-full";

  // Lookup sender kecamatan
  // Fetch with 10s timeout helper
  const fetchWithTimeout = async (url: string, body: any): Promise<any> => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(t);
      return await res.json();
    } catch (e: any) {
      clearTimeout(t);
      return { error: e.name === "AbortError" ? "Timeout" : e.message };
    }
  };

  const searchSenderKec = async () => {
    if (senderKecSearch.length < 3) return;
    const data = await fetchWithTimeout("/api/kiriminaja/search-kecamatan", { search: senderKecSearch });
    if (data.data) setSenderKecResults(data.data);
    else if (data.error) setError(`Lookup pengirim gagal: ${data.error}`);
  };

  // Lookup all destination kecamatan IDs — skip failures, don't block
  const lookupDestinations = async () => {
    setLookingUp(true);
    const map = new Map<number, number>();
    const seen = new Map<string, number>();
    let failed = 0;

    for (const o of orders) {
      const kec = o.kecamatan;
      if (!kec || kec.length < 3) continue;
      if (seen.has(kec.toLowerCase())) {
        map.set(o.exRow, seen.get(kec.toLowerCase())!);
        continue;
      }
      const data = await fetchWithTimeout("/api/kiriminaja/search-kecamatan", { search: kec });
      if (data.data?.[0]?.id) {
        seen.set(kec.toLowerCase(), data.data[0].id);
        map.set(o.exRow, data.data[0].id);
      } else {
        failed++;
      }
      await new Promise((r) => setTimeout(r, 300));
    }
    setDestKecIds(map);
    setLookingUp(false);
    if (failed > 0) setError(`${failed} kecamatan tidak ditemukan — order tetap bisa dikirim tanpa kecamatan_id`);
  };

  useEffect(() => { lookupDestinations(); }, []);

  const handleBook = async () => {
    if (!senderKecId) { setError("Pilih kecamatan pengirim dulu"); return; }
    setBooking(true);
    setError("");

    const packages = orders.map((o, i) => {
      const kurirKey = o.kurir || "id express_idlite";
      const kurirInfo = KURIR_MAP[kurirKey] || KURIR_MAP["id express_idlite"];
      const destKecId = destKecIds.get(o.exRow) || 0;

      return {
        order_id: `NNS-${String(i + 1).padStart(6, "0")}`,
        destination_name: o.namaCustomer,
        destination_phone: o.noWa.startsWith("0") ? o.noWa : `0${o.noWa}`,
        destination_address: o.alamat || "Alamat tidak tersedia",
        destination_kecamatan_id: destKecId,
        destination_zipcode: o.kodepos || "",
        weight,
        width,
        length,
        height,
        item_value: o.total || 1000,
        service: kurirInfo.service,
        service_type: kurirInfo.service_type,
        cod: o.total || 0,
        item_name: o.produk || "Paket",
        package_type_id: 7,
        note: "HUBUNGI CUST SEBELUM KIRIM",
      };
    });

    const missingKec = packages.filter((p) => !p.destination_kecamatan_id);
    if (missingKec.length > 0) {
      setError(`${missingKec.length} order tanpa kecamatan_id — akan tetap dikirim, mungkin ditolak oleh KiriminAja`);
    }

    try {
      const data = await fetchWithTimeout("/api/kiriminaja/book", {
        sender: { ...sender, kecamatan_id: senderKecId },
        packages,
        resiTargets: orders.map((o) => ({ grup: o.grup, sheetRow: o.sheetRow, exRow: o.exRow })),
      });
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "Booking gagal");
      }
    } catch {
      setError("Network error");
    } finally {
      setBooking(false);
    }
  };

  if (result) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="glass w-full max-w-lg mx-4 p-6" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-emerald-400 font-semibold text-sm mb-4">Booking Berhasil</h3>
          <p className="text-xs text-[#9B9BA8] mb-2">Pickup: {result.pickup_number}</p>
          <p className="text-xs text-[#9B9BA8] mb-4">Payment: {result.payment_status}</p>
          <div className="space-y-2 max-h-60 overflow-auto">
            {result.details?.map((d: any, i: number) => (
              <div key={i} className="flex justify-between text-xs px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
                <span className="text-[#E8E6E3]">{d.order_id}</span>
                <span className="text-[#F5A623] font-medium">{d.awb || d.kj_order_id || "—"}</span>
              </div>
            ))}
          </div>
          <button onClick={() => { onBooked(); onClose(); }}
            className="mt-4 w-full px-4 py-2 rounded-lg text-xs font-semibold text-[#0A0A0F] bg-gradient-to-r from-[#F5A623] to-[#F0C040]">
            Tutup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-[#F5A623] font-semibold text-sm">Kirim via KiriminAja — {orders.length} order</h3>
            <button onClick={onClose} className="text-[#6B6B78] hover:text-white text-lg">&times;</button>
          </div>

          {error && <p className="text-red-400 text-xs bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}

          {/* Sender */}
          <div>
            <p className="text-[#6B6B78] text-xs font-medium mb-2 uppercase tracking-wider">Pengirim</p>
            <div className="grid grid-cols-2 gap-3">
              <input value={sender.name} onChange={(e) => setSender({ ...sender, name: e.target.value })} placeholder="Nama" className={inputCls} />
              <input value={sender.phone} onChange={(e) => setSender({ ...sender, phone: e.target.value })} placeholder="HP" className={inputCls} />
              <input value={sender.address} onChange={(e) => setSender({ ...sender, address: e.target.value })} placeholder="Alamat" className={`${inputCls} col-span-2`} />
              <div className="col-span-2">
                <div className="flex gap-2">
                  <input value={senderKecSearch} onChange={(e) => setSenderKecSearch(e.target.value)}
                    placeholder="Cari kecamatan pengirim..." className={`flex-1 ${inputCls}`} />
                  <button onClick={searchSenderKec}
                    className="px-3 py-2 rounded-lg text-xs text-[#F5A623] border border-[#F5A623]/30 hover:bg-[#F5A623]/10">Cari</button>
                </div>
                {senderKecResults.length > 0 && (
                  <div className="mt-2 max-h-32 overflow-auto space-y-1">
                    {senderKecResults.map((r) => (
                      <button key={r.id} onClick={() => { setSenderKecId(r.id); setSenderKecResults([]); setSenderKecSearch(r.text); }}
                        className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${senderKecId === r.id ? "bg-[#F5A623]/20 text-[#F5A623]" : "text-[#E8E6E3] hover:bg-[rgba(255,255,255,0.05)]"}`}>
                        {r.text} <span className="text-[#6B6B78]">(ID: {r.id})</span>
                      </button>
                    ))}
                  </div>
                )}
                {senderKecId > 0 && <p className="text-xs text-emerald-400 mt-1">Kecamatan ID: {senderKecId}</p>}
              </div>
            </div>
          </div>

          {/* Package defaults */}
          <div>
            <p className="text-[#6B6B78] text-xs font-medium mb-2 uppercase tracking-wider">Dimensi Paket (semua order)</p>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-[#6B6B78] text-[10px]">Berat (g)</label>
                <input type="number" value={weight} onChange={(e) => setWeight(+e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-[#6B6B78] text-[10px]">Panjang (cm)</label>
                <input type="number" value={length} onChange={(e) => setLength(+e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-[#6B6B78] text-[10px]">Lebar (cm)</label>
                <input type="number" value={width} onChange={(e) => setWidth(+e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-[#6B6B78] text-[10px]">Tinggi (cm)</label>
                <input type="number" value={height} onChange={(e) => setHeight(+e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>

          {/* Order preview */}
          <div>
            <p className="text-[#6B6B78] text-xs font-medium mb-2 uppercase tracking-wider">
              Orders {lookingUp && <span className="text-amber-400">(mencari kecamatan...)</span>}
            </p>
            <div className="max-h-48 overflow-auto space-y-1">
              {orders.map((o, i) => {
                const kecId = destKecIds.get(o.exRow);
                return (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-xs">
                    <span className="text-[#E8E6E3] flex-1 truncate">{o.namaCustomer}</span>
                    <span className="text-[#9B9BA8] truncate max-w-[120px]">{o.kecamatan || "—"}</span>
                    <span className={`${kecId ? "text-emerald-400" : "text-red-400"}`}>{kecId ? `ID:${kecId}` : "?"}</span>
                    <span className="text-[#6B6B78]">{o.kurir || "idx"}</span>
                    <span className="text-[#F5A623] font-medium">Rp{(o.total || 0).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={handleBook} disabled={booking || lookingUp}
              className="flex-1 px-4 py-3 rounded-lg text-sm font-semibold text-[#0A0A0F] bg-gradient-to-r from-[#F5A623] to-[#F0C040] hover:brightness-110 disabled:opacity-50 transition-all">
              {booking ? "Booking..." : `Kirim ${orders.length} Order`}
            </button>
            <button onClick={onClose}
              className="px-4 py-3 rounded-lg text-sm text-[#6B6B78] border border-[rgba(255,255,255,0.08)] hover:border-[#F5A623]/30">
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
