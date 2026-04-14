import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const ADMIN_EMAIL = "defikame@gmail.com";
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || session.user.email.toLowerCase() !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ambil config dari Supabase
  const res = await fetch(`${SUPABASE_URL}/rest/v1/nonics_config?select=key,value`, {
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
  });
  const rows: { key: string; value: string }[] = await res.json();
  const config: Record<string, string> = {};
  for (const row of rows) config[row.key] = row.value;

  const baseUrl = config["kiriminaja_base_url"] || "https://tdev.kiriminaja.com";
  const apiKey = config["kiriminaja_api_key"] || "";

  if (!apiKey) return NextResponse.json({ ok: false, error: "API Key belum diset" });

  try {
    const r = await fetch(`${baseUrl}/api/mitra/v2/get_address_by_name`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ search: "Jakarta" }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await r.json();
    if (r.ok) return NextResponse.json({ ok: true, status: r.status, sample: data });
    return NextResponse.json({ ok: false, status: r.status, error: JSON.stringify(data) });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message });
  }
}
