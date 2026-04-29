import { google } from "googleapis";
import { unstable_cache } from "next/cache";

function getAuth() {
  const credentials = JSON.parse(
    Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64!, "base64").toString()
  );
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export interface AdsRow {
  date: string;
  account_id: string;
  account_name: string;
  campaign_id: string;
  campaign_name: string;
  ad_group_id: string;
  ad_group_name: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  conversions_value: number;
}

export async function getAdsData(): Promise<AdsRow[]> {
  const ADS_SPREADSHEET_ID = process.env.ADS_SHEET_ID?.trim();
  if (!ADS_SPREADSHEET_ID) return [];

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: ADS_SPREADSHEET_ID,
      range: "'ads_daily'!A2:L50000",
    });

    const rows = res.data.values || [];
    return rows
      .filter((row) => row[0] && row[1])
      .map((row) => ({
        date: String(row[0] || ""),
        account_id: String(row[1] || ""),
        account_name: String(row[2] || ""),
        campaign_id: String(row[3] || ""),
        campaign_name: String(row[4] || ""),
        ad_group_id: String(row[5] || ""),
        ad_group_name: String(row[6] || ""),
        impressions: parseInt(String(row[7] || "0")) || 0,
        clicks: parseInt(String(row[8] || "0")) || 0,
        cost: parseFloat(String(row[9] || "0")) || 0,
        conversions: parseFloat(String(row[10] || "0")) || 0,
        conversions_value: parseFloat(String(row[11] || "0")) || 0,
      }));
  } catch (e) {
    console.error("[getAdsData]", e);
    return [];
  }
}

export const getCachedAdsData = unstable_cache(getAdsData, ["ads-data"], { revalidate: 3600, tags: ["ads"] });
