import { NextRequest, NextResponse } from "next/server";
import { updateOrderFields } from "@/lib/sheets";

const VALID_STATUSES = ["Sukses", "RTS", "DUPLIKAT", "REPEAT RTS"];
const ALLOWED_FIELDS = ["status", "alamat"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { updates } = body as {
      updates: { grup: string; sheetRow: number; fields: Record<string, string> }[];
    };

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    if (updates.length > 200) {
      return NextResponse.json({ error: "Max 200 updates per request" }, { status: 400 });
    }

    for (const u of updates) {
      if (!u.grup || !u.sheetRow || !u.fields) {
        return NextResponse.json({ error: `Invalid update: ${JSON.stringify(u)}` }, { status: 400 });
      }
      for (const key of Object.keys(u.fields)) {
        if (!ALLOWED_FIELDS.includes(key)) {
          return NextResponse.json({ error: `Field not allowed: ${key}` }, { status: 400 });
        }
      }
      if (u.fields.status && !VALID_STATUSES.includes(u.fields.status)) {
        return NextResponse.json({ error: `Invalid status: ${u.fields.status}` }, { status: 400 });
      }
    }

    const count = await updateOrderFields(updates);
    return NextResponse.json({ updated: count });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Update failed" }, { status: 500 });
  }
}
