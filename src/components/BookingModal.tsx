"use client";

import { useState } from "react";
import type { OrderRow } from "@/lib/sheets";

interface Props {
  orders: OrderRow[];
  onClose: () => void;
  onBooked: () => void;
}

const KURIR_MAP: Record<string, { service: string; service_type: string }> = {
  "lion parcel_Regpack": { service: "lion", service_type: "REGPACK" },
  "id express_idlite": { service: "idx", service_type: "00" },
};

async function fetchWithTimeout(url: string, body: any): Promise<any> {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 10000);
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: c.signal });
    clearTimeout(t);
    return await res.json();
  } catch (e: any) {
    clearTimeout(t);
    return { error: e.name === "AbortError" ? "Timeout" : e.message };
  }
}

export default function BookingModal({ orders, onClose, onBooked }: Props) {
  const [name, setName] = useState("Nonics");
  const [phone, setPhone] = useState("085272127441");
  const [address, setAddress] = useState("Jl. Perintis Kemerdekaan KM 12, Makassar");
  const [zipcode] = useState("90244");
  const [senderKecId] = useState(3596); // Tamalanrea, Makassar

  const [weight, setWeight] = useState(1000);
  const [panjang, setPanjang] = useState(15);
  const [width, setWidth] = useState(15);
  const [height, setHeight] = useState(10);

  const [booking, setBooking] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const cls = "bg-[#0d0d14] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-[#E8E6E3] focus:outline-none focus:border-[#F5A623]/50 w-full";

  const handleBook = async () => {
    setBooking(true);
    setError("");

    // 1. Lookup kecamatan
    setStatus(`Mencari kecamatan (0/${orders.length})...`);
    const kecCache = new Map<string, number>();
    const destMap = new Map<number, number>();

    for (let i = 0; i < orders.length; i++) {
      const kec = orders[i].kecamatan;
      if (!kec || kec.length < 3) continue;
      const k = kec.toLowerCase();
      if (kecCache.has(k)) { destMap.set(orders[i].exRow, kecCache.get(k)!); continue; }
      setStatus(`Mencari kecamatan (${i + 1}/${orders.length})...`);
      const d = await fetchWithTimeout("/api/kiriminaja/search-kecamatan", { search: kec });
      if (d.data?.[0]?.id) { kecCache.set(k, d.data[0].id); destMap.set(orders[i].exRow, d.data[0].id); }
      await new Promise((r) => setTimeout(r, 200));
    }

    // 2. Pricing
    setStatus("Mengambil ongkir...");
    const priceCache = new Map<string, number>();
    const packages = [];

    for (let i = 0; i < orders.length; i++) {
      const o = orders[i];
      const ki = KURIR_MAP[o.kurir || "id express_idlite"] || KURIR_MAP["id express_idlite"];
      const destId = destMap.get(o.exRow) || 0;
      let cost = 0;

      if (destId) {
        const ck = `${destId}`;
        if (priceCache.has(ck)) { cost = priceCache.get(ck)!; }
        else {
          const p = await fetchWithTimeout("/api/kiriminaja/pricing", { origin: senderKecId, destination: destId, weight, item_value: o.total || 1000 });
          if (p.results) { const m = p.results.find((r: any) => r.service === ki.service && r.service_type === ki.service_type); cost = m?.cost || p.results[0]?.cost || 0; }
          priceCache.set(ck, cost);
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      packages.push({
        order_id: `NNC-${String(i + 1).padStart(6, "0")}`,
        destination_name: o.namaCustomer, destination_phone: o.noWa.startsWith("0") ? o.noWa : `0${o.noWa}`,
        destination_address: o.alamat || "Alamat tidak tersedia", destination_kecamatan_id: destId, destination_zipcode: o.kodepos || "",
        weight, width, length: panjang, height, item_value: o.total || 1000, shipping_cost: cost,
        service: ki.service, service_type: ki.service_type, cod: o.total || 0,
        item_name: o.produk || "Paket", package_type_id: 7, note: "HUBUNGI CUST SEBELUM KIRIM",
      });
    }

    // 3. Book
    setStatus("Booking...");
    const data = await fetchWithTimeout("/api/kiriminaja/book", {
      sender: { name, phone, address, kecamatan_id: senderKecId, zipcode },
      packages,
      resiTargets: orders.map((o) => ({ grup: o.grup, sheetRow: o.sheetRow, exRow: o.exRow })),
    });

    if (data.success) { setResult(data); } else { setError(data.error || "Booking gagal"); }
    setBooking(false);
  };

  // Success screen
  if (result) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="glass w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-emerald-400 font-semibold text-sm mb-3">Booking Berhasil</h3>
          <p className="text-xs text-[#9B9BA8] mb-1">Pickup: {result.pickup_number}</p>
          <p className="text-xs text-[#9B9BA8] mb-3">Payment: {result.payment_status}</p>
          <div className="space-y-1 max-h-48 overflow-auto">
            {result.details?.map((d: any, i: number) => (
              <div key={i} className="flex justify-between text-xs px-3 py-2 rounded bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
                <span className="text-[#E8E6E3]">{d.order_id}</span>
                <span className="text-[#F5A623] font-medium">{d.awb || d.kj_order_id || "—"}</span>
              </div>
            ))}
          </div>
          <button onClick={() => { onBooked(); onClose(); }}
            className="mt-4 w-full py-2 rounded-lg text-xs font-semibold text-[#0A0A0F] bg-gradient-to-r from-[#F5A623] to-[#F0C040]">Tutup</button>
        </div>
      </div>
    );
  }

  // Main form
  const totalCOD = orders.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[#F5A623] font-semibold text-sm">Kirim via KiriminAja</h3>
            <button onClick={onClose} className="text-[#6B6B78] hover:text-white text-lg">&times;</button>
          </div>

          {/* Summary */}
          <div className="flex gap-4 px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-[#F5A623]">{orders.length}</p>
              <p className="text-[10px] text-[#6B6B78] uppercase">Order</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-sm font-semibold text-[#E8E6E3]">Rp{totalCOD.toLocaleString()}</p>
              <p className="text-[10px] text-[#6B6B78] uppercase">Total COD</p>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}

          {/* Pengirim */}
          <div>
            <p className="text-[#6B6B78] text-[10px] font-medium mb-1.5 uppercase tracking-wider">Pengirim</p>
            <div className="grid grid-cols-2 gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama" className={cls} />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="HP" className={cls} />
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Alamat" className={`${cls} col-span-2`} />
            </div>
          </div>

          {/* Dimensi */}
          <div>
            <p className="text-[#6B6B78] text-[10px] font-medium mb-1.5 uppercase tracking-wider">Dimensi Paket</p>
            <div className="grid grid-cols-4 gap-2">
              <div><label className="text-[#6B6B78] text-[10px]">Berat (g)</label><input type="number" value={weight} onChange={(e) => setWeight(+e.target.value)} className={cls} /></div>
              <div><label className="text-[#6B6B78] text-[10px]">P (cm)</label><input type="number" value={panjang} onChange={(e) => setPanjang(+e.target.value)} className={cls} /></div>
              <div><label className="text-[#6B6B78] text-[10px]">L (cm)</label><input type="number" value={width} onChange={(e) => setWidth(+e.target.value)} className={cls} /></div>
              <div><label className="text-[#6B6B78] text-[10px]">T (cm)</label><input type="number" value={height} onChange={(e) => setHeight(+e.target.value)} className={cls} /></div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button onClick={handleBook} disabled={booking}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-[#0A0A0F] bg-gradient-to-r from-[#F5A623] to-[#F0C040] hover:brightness-110 disabled:opacity-50 transition-all">
              {booking ? status : `Kirim ${orders.length} Order`}
            </button>
            <button onClick={onClose} disabled={booking}
              className="px-4 py-2.5 rounded-lg text-sm text-[#6B6B78] border border-[rgba(255,255,255,0.08)] hover:border-[#F5A623]/30 disabled:opacity-30">Batal</button>
          </div>
        </div>
      </div>
    </div>
  );
}
