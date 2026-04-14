import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const ADMIN_EMAIL = "defikame@gmail.com";

function supaFetch(path: string, options?: RequestInit) {
  return fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options?.headers || {}),
    },
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || session.user.email.toLowerCase() !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await supaFetch("/nonics_config?select=key,value");
  const rows: { key: string; value: string }[] = await res.json();
  const config: Record<string, string> = {};
  for (const row of rows) config[row.key] = row.value;
  return NextResponse.json(config);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || session.user.email.toLowerCase() !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const entries = Object.entries(body) as [string, string][];

  for (const [key, value] of entries) {
    await supaFetch("/nonics_config", {
      method: "POST",
      body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    });
  }

  return NextResponse.json({ ok: true });
}
