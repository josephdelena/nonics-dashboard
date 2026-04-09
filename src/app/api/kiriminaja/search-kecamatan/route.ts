import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.KIRIMINAJA_BASE_URL || "https://tdev.kiriminaja.com";
const API_KEY = process.env.KIRIMINAJA_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { search } = await req.json();
    if (!search || search.length < 3) {
      return NextResponse.json({ error: "Min 3 characters" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${BASE}/api/mitra/v2/get_address_by_name`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
      body: JSON.stringify({ search }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    const msg = e.name === "AbortError" ? "Timeout 10s — KiriminAja tidak merespons" : e.message;
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
