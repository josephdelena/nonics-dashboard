import { getAdsData } from "@/lib/ads-sheets";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const adsId = process.env.ADS_SHEET_ID;
  const hasCreds = !!process.env.GOOGLE_CREDENTIALS_BASE64;
  console.log("[debug-ads] ADS_SHEET_ID=", adsId, "hasCreds=", hasCreds);

  let rows: Awaited<ReturnType<typeof getAdsData>> = [];
  let error: string | null = null;
  try {
    rows = await getAdsData();
  } catch (e) {
    error = String(e);
    console.error("[debug-ads] caught:", e);
  }

  return NextResponse.json({
    count: rows.length,
    first: rows[0] ?? null,
    env: { adsId: adsId ? adsId.slice(0, 8) + "..." : "MISSING", hasCreds },
    error,
  }, { headers: { "Cache-Control": "no-store" } });
}
