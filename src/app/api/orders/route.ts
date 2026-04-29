import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { fetchAllOrders } from "@/lib/sheets";

const getCachedOrders = unstable_cache(
  async () => {
    const orders = await fetchAllOrders();
    return { orders, updatedAt: new Date().toISOString() };
  },
  ["orders-cache"],
  { revalidate: 300 }
);

// In-memory rate limit: 20 requests per minute per IP
const hits = new Map<string, { count: number; resetAt: number }>();
const MAX_REQ = 20;
const WINDOW_MS = 60 * 1000;

function getIP(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (entry && now < entry.resetAt) {
    if (entry.count >= MAX_REQ) return false;
    entry.count++;
  } else {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  }
  return true;
}

export async function GET(req: NextRequest) {
  const ip = getIP(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  try {
    const data = await getCachedOrders();
    const full = req.nextUrl.searchParams.get("full") === "true";
    if (full) return NextResponse.json(data);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const orders = data.orders.filter((o) => !o.tanggal || o.tanggal >= cutoffStr);
    return NextResponse.json({ orders, updatedAt: data.updatedAt });
  } catch (error) {
    console.error("[ORDERS_API] Error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
