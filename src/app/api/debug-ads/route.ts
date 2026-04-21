import { getAdsData } from "@/lib/ads-sheets";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await getAdsData();
  return NextResponse.json({ count: rows.length, first: rows[0] ?? null });
}
