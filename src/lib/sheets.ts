import { google } from "googleapis";

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

export interface OrderRow {
  no: number;
  tanggal: string;
  namaCs: string;
  produk: string;
  ongkir: number;
  hargaJual: number;
  diskon: number;
  total: number;
  namaCustomer: string;
  noWa: string;
  alamat: string;
  status: string;
  grup: string;
  tipe: "COD" | "TF";
  sheetRow: number; // 1-indexed row number in the sheet
}

function parseNumber(val: string): number {
  if (!val) return 0;
  const cleaned = val.replace(/[^0-9.-]/g, "");
  return parseInt(cleaned) || 0;
}

export interface MetaKodepos {
  totalOrders: number;
  kosongCount: number;
  kosongOrders: string[];
  lastUpdated: string;
}

export async function fetchMetaKodepos(): Promise<MetaKodepos | null> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "'Meta'!A1:B100",
    });

    const rows = res.data.values || [];
    // Row 0: [title], 1: [Last updated, time], 2: [Total orders, N], 3: [Kodepos OK, N], 4: [Kodepos kosong, N], 5: [], 6: [header], 7+: [Order #N]
    const lastUpdated = String(rows[1]?.[1] || "");
    const totalOrders = parseInt(String(rows[2]?.[1] || "0")) || 0;
    const kosongCount = parseInt(String(rows[4]?.[1] || "0")) || 0;

    const kosongOrders: string[] = [];
    for (let i = 7; i < rows.length; i++) {
      const val = rows[i]?.[0] || "";
      if (val && val !== "(semua terisi)") {
        kosongOrders.push(val);
      }
    }

    return { totalOrders, kosongCount, kosongOrders, lastUpdated };
  } catch {
    return null;
  }
}

export async function fetchAllOrders(): Promise<OrderRow[]> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  // Get all sheet names
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheetNames = (meta.data.sheets || [])
    .map((s) => s.properties?.title || "")
    .filter((name) => !["Dashboard", "Rekap CS", "Top Produk", "EXCEL NONICS", "Meta", "RTS Blacklist", ""].includes(name));

  const orders: OrderRow[] = [];

  for (const sheetName of sheetNames) {
    const tipe = sheetName.includes("COD") ? "COD" : "TF";
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${sheetName}'!A2:L1000`,
    });

    const rows = res.data.values || [];
    for (let ri = 0; ri < rows.length; ri++) {
      const row = rows[ri];
      if (!row[0] || String(row[0]).startsWith("\u{1F4C5}") || row[0] === "No") continue;
      orders.push({
        no: parseInt(row[0]) || 0,
        tanggal: row[1] || "",
        namaCs: row[2] || "",
        produk: row[3] || "",
        ongkir: parseNumber(row[4] || ""),
        hargaJual: parseNumber(row[5] || ""),
        diskon: parseNumber(row[6] || ""),
        total: parseNumber(row[7] || ""),
        namaCustomer: row[8] || "",
        noWa: row[9] || "",
        alamat: row[10] || "",
        status: row[11] || "Sukses",
        grup: sheetName,
        tipe: tipe as "COD" | "TF",
        sheetRow: ri + 2, // +2 because range starts at A2 (row 2) and ri is 0-indexed
      });
    }
  }

  return orders;
}

export async function updateOrderStatuses(
  updates: { grup: string; sheetRow: number; status: string }[]
): Promise<number> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const data = updates.map((u) => ({
    range: `'${u.grup}'!L${u.sheetRow}`,
    values: [[u.status]],
  }));

  const res = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data,
    },
  });

  return res.data.totalUpdatedCells || 0;
}
