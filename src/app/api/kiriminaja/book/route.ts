import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const BASE = process.env.KIRIMINAJA_BASE_URL || "https://tdev.kiriminaja.com";
const API_KEY = process.env.KIRIMINAJA_API_KEY!;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID!;

function getAuth() {
  const credentials = JSON.parse(
    Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64!, "base64").toString()
  );
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function POST(req: NextRequest) {
  try {
    console.log("[KJ_BOOK] Starting booking...");
    console.log("[KJ_BOOK] BASE:", BASE);
    console.log("[KJ_BOOK] API_KEY present:", !!API_KEY, "length:", API_KEY?.length);

    const body = await req.json();
    const { sender, packages, resiTargets } = body as {
      sender: {
        name: string;
        phone: string;
        address: string;
        kecamatan_id: number;
        zipcode?: string;
      };
      packages: {
        order_id: string;
        destination_name: string;
        destination_phone: string;
        destination_address: string;
        destination_kecamatan_id: number;
        destination_zipcode?: string;
        weight: number;
        width: number;
        length: number;
        height: number;
        item_value: number;
        shipping_cost?: number;
        service: string;
        service_type: string;
        cod: number;
        item_name: string;
        package_type_id: number;
        note?: string;
      }[];
      resiTargets?: { grup: string; sheetRow: number; exRow: number }[];
    };

    console.log("[KJ_BOOK] Sender:", JSON.stringify(sender));
    console.log("[KJ_BOOK] Packages count:", packages.length);
    console.log("[KJ_BOOK] First package:", JSON.stringify(packages[0]));

    const kjBody = {
      address: sender.address,
      phone: sender.phone,
      name: sender.name,
      kecamatan_id: sender.kecamatan_id,
      zipcode: sender.zipcode || "",
      packages,
    };

    console.log("[KJ_BOOK] Calling KiriminAja:", `${BASE}/api/mitra/v6.1/request_pickup`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${BASE}/api/mitra/v6.1/request_pickup`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": API_KEY },
      body: JSON.stringify(kjBody),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    console.log("[KJ_BOOK] Response status:", res.status);
    const kjText = await res.text();
    console.log("[KJ_BOOK] Response body:", kjText.slice(0, 1000));

    let kjData: any;
    try {
      kjData = JSON.parse(kjText);
    } catch {
      console.log("[KJ_BOOK] Failed to parse response as JSON");
      return NextResponse.json({ error: "Invalid JSON from KiriminAja", raw: kjText.slice(0, 500) }, { status: 502 });
    }

    if (!kjData.status) {
      console.log("[KJ_BOOK] Booking failed:", kjData.text, JSON.stringify(kjData).slice(0, 500));
      return NextResponse.json({ error: kjData.text || "Booking failed", kjData }, { status: 400 });
    }

    console.log("[KJ_BOOK] Booking success! Pickup:", kjData.pickup_number);
    console.log("[KJ_BOOK] Details:", JSON.stringify(kjData.details).slice(0, 500));

    // Save resi (AWB) to EXCEL NONICS col N
    if (resiTargets && kjData.details) {
      console.log("[KJ_BOOK] Saving resi to EXCEL NONICS...");
      const auth = getAuth();
      const sheets = google.sheets({ version: "v4", auth });
      const batchData: { range: string; values: string[][] }[] = [];

      for (let i = 0; i < kjData.details.length; i++) {
        const detail = kjData.details[i];
        const target = resiTargets[i];
        const awb = detail.awb || detail.kj_order_id || "";
        console.log(`[KJ_BOOK] Resi ${i}: awb=${awb}, exRow=${target?.exRow}`);

        if (target?.exRow > 0) {
          batchData.push({ range: `'EXCEL NONICS'!N${target.exRow}`, values: [[awb]] });
        }
      }

      if (batchData.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: { valueInputOption: "USER_ENTERED", data: batchData },
        });
        console.log("[KJ_BOOK] Resi saved to sheets:", batchData.length, "cells");
      }
    }

    return NextResponse.json({
      success: true,
      pickup_number: kjData.pickup_number,
      payment_status: kjData.payment_status,
      details: kjData.details,
    });
  } catch (e: any) {
    const msg = e.name === "AbortError" ? "Timeout 10s — KiriminAja tidak merespons" : e.message;
    console.error("[KJ_BOOK] Error:", msg, e.stack?.slice(0, 300));
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
