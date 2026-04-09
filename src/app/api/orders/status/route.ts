import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatuses } from "@/lib/sheets";

const VALID_STATUSES = ["Sukses", "RTS", "DUPLIKAT", "REPEAT RTS"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { updates } = body as {
      updates: { grup: string; sheetRow: number; status: string }[];
    };

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    if (updates.length > 200) {
      return NextResponse.json({ error: "Max 200 updates per request" }, { status: 400 });
    }

    for (const u of updates) {
      if (!u.grup || !u.sheetRow || !VALID_STATUSES.includes(u.status)) {
        return NextResponse.json({ error: `Invalid update: ${JSON.stringify(u)}` }, { status: 400 });
      }
    }

    const count = await updateOrderStatuses(updates);
    return NextResponse.json({ updated: count });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Update failed" }, { status: 500 });
  }
}
