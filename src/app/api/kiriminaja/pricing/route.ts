import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.KIRIMINAJA_BASE_URL || "https://tdev.kiriminaja.com";
const API_KEY = process.env.KIRIMINAJA_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${BASE}/api/mitra/v6.1/shipping_price`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
      body: JSON.stringify({ ...body, insurance: 1 }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    const msg = e.name === "AbortError" ? "Timeout" : e.message;
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
