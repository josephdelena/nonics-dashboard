import { NextResponse } from "next/server";
import { fetchAllOrders } from "@/lib/sheets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const orders = await fetchAllOrders();
    return NextResponse.json({ orders, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
