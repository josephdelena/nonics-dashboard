import { NextResponse } from "next/server";

const BASE = process.env.KIRIMINAJA_BASE_URL || "https://tdev.kiriminaja.com";
const API_KEY = process.env.KIRIMINAJA_API_KEY!;

export const dynamic = "force-dynamic";

export async function GET() {
  const results: Record<string, any> = {};

  // Step 1: Test search kecamatan
  console.log("[KJ_TEST] Step 1: Search kecamatan 'Tamalanrea'");
  try {
    const controller1 = new AbortController();
    setTimeout(() => controller1.abort(), 10000);
    const r1 = await fetch(`${BASE}/api/mitra/v2/get_address_by_name`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
      body: JSON.stringify({ search: "Tamalanrea" }),
      signal: controller1.signal,
    });
    const d1 = await r1.json();
    results.search = { status: r1.status, data: d1 };
    console.log("[KJ_TEST] Search result:", JSON.stringify(d1).slice(0, 500));
  } catch (e: any) {
    results.search = { error: e.name === "AbortError" ? "Timeout" : e.message };
    console.error("[KJ_TEST] Search error:", e.message);
  }

  // Step 2: Test booking 1 dummy order
  console.log("[KJ_TEST] Step 2: Book dummy order");
  const dummyBody = {
    address: "Jl. Perintis Kemerdekaan KM 12, Makassar",
    phone: "085272127441",
    name: "Nonics Test",
    kecamatan_id: 548, // fallback dummy
    zipcode: "90245",
    packages: [{
      order_id: "NNC-TEST001",
      destination_name: "Test Customer",
      destination_phone: "081234567890",
      destination_address: "Jl. Test Alamat No 123, Kecamatan Test",
      destination_kecamatan_id: 548,
      destination_zipcode: "55598",
      weight: 1000,
      width: 10,
      length: 10,
      height: 10,
      item_value: 50000,
      service: "idexpress",
      service_type: "idlite",
      cod: 50000,
      item_name: "Test Paket",
      package_type_id: 7,
      note: "TEST ORDER",
    }],
  };

  try {
    const controller2 = new AbortController();
    setTimeout(() => controller2.abort(), 10000);
    console.log("[KJ_TEST] Booking body:", JSON.stringify(dummyBody).slice(0, 500));
    const r2 = await fetch(`${BASE}/api/mitra/v6.1/request_pickup`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
      body: JSON.stringify(dummyBody),
      signal: controller2.signal,
    });
    const text = await r2.text();
    console.log("[KJ_TEST] Book response status:", r2.status);
    console.log("[KJ_TEST] Book response body:", text.slice(0, 1000));
    try {
      results.book = { status: r2.status, data: JSON.parse(text) };
    } catch {
      results.book = { status: r2.status, raw: text.slice(0, 500) };
    }
  } catch (e: any) {
    results.book = { error: e.name === "AbortError" ? "Timeout" : e.message };
    console.error("[KJ_TEST] Book error:", e.message);
  }

  return NextResponse.json(results);
}
