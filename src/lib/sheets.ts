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
  kodepos: string;
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
        sheetRow: ri + 2,
        kodepos: "",
      });
    }
  }

  // Fetch kodepos from EXCEL NONICS tab and merge
  try {
    const exRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "'EXCEL NONICS'!C2:H5000", // C=Nama, D=Telepon, H=Kode Pos
    });
    const kpMap = new Map<string, string>(); // phone|name → kodepos
    for (const row of exRes.data.values || []) {
      const nama = (row[0] || "").toString().trim().toLowerCase();
      const phone = (row[1] || "").toString().replace(/\D/g, "");
      const kodepos = (row[5] || "").toString().trim(); // col H = index 5 from C
      if (kodepos) {
        if (phone) kpMap.set(`p:${phone}`, kodepos);
        if (nama) kpMap.set(`n:${nama}`, kodepos);
      }
    }
    for (const o of orders) {
      const phone = o.noWa.replace(/\D/g, "");
      const nama = o.namaCustomer.trim().toLowerCase();
      o.kodepos = (phone && kpMap.get(`p:${phone}`)) || kpMap.get(`n:${nama}`) || "";
    }
  } catch { /* EXCEL NONICS tab might not exist yet */ }

  return orders;
}

// Column map: field name → sheet column letter
const COL_MAP: Record<string, string> = {
  status: "L",
  alamat: "K",
};

export async function updateOrderFields(
  updates: { grup: string; sheetRow: number; fields: Record<string, string> }[]
): Promise<number> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const data: { range: string; values: string[][] }[] = [];
  for (const u of updates) {
    for (const [field, value] of Object.entries(u.fields)) {
      const col = COL_MAP[field];
      if (!col) continue;
      data.push({ range: `'${u.grup}'!${col}${u.sheetRow}`, values: [[value]] });
    }
  }

  if (data.length === 0) return 0;

  const res = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: { valueInputOption: "USER_ENTERED", data },
  });

  return res.data.totalUpdatedCells || 0;
}
