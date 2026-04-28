import { NextResponse } from "next/server";
import { fetchMetaKodepos } from "@/lib/sheets";

export const revalidate = 300;

export async function GET() {
  const meta = await fetchMetaKodepos();
  if (!meta) {
    return NextResponse.json({ kosongCount: 0, kosongOrders: [] });
  }
  return NextResponse.json(meta);
}
