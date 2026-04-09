import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.KIRIMINAJA_BASE_URL || "https://tdev.kiriminaja.com";
const API_KEY = process.env.KIRIMINAJA_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { search } = await req.json();
    if (!search || search.length < 3) {
      return NextResponse.json({ error: "Min 3 characters" }, { status: 400 });
    }

    const res = await fetch(`${BASE}/api/mitra/v2/get_address_by_name`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": API_KEY },
      body: JSON.stringify({ search }),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
