import { google } from "googleapis";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const adsId = process.env.ADS_SHEET_ID;
  const credsB64 = process.env.GOOGLE_CREDENTIALS_BASE64;
  const result: Record<string, unknown> = {
    adsId: adsId ? adsId.slice(0, 8) + "..." : "MISSING",
    hasCreds: !!credsB64,
  };

  // Step 1: parse credentials
  let creds: unknown;
  try {
    creds = JSON.parse(Buffer.from(credsB64!, "base64").toString());
    result.credsParsed = true;
  } catch (e) {
    result.credsParsed = false;
    result.credsError = String(e);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  }

  // Step 2: build auth
  let auth: InstanceType<typeof google.auth.GoogleAuth>;
  try {
    auth = new google.auth.GoogleAuth({
      credentials: creds as never,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    result.authBuilt = true;
  } catch (e) {
    result.authBuilt = false;
    result.authError = String(e);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  }

  // Step 3: fetch sheet
  try {
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: adsId!,
      range: "'ads_daily'!A2:L10",
    });
    const rows = res.data.values || [];
    result.fetchOk = true;
    result.rowCount = rows.length;
    result.firstRow = rows[0] ?? null;
  } catch (e) {
    result.fetchOk = false;
    result.fetchError = String(e);
  }

  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
