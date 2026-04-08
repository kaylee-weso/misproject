import { NextResponse } from "next/server";
import { getOrderAssets} from "@/lib/query/orderform/orderform-query";
import { getUserFromRequest } from "@/lib/auth/get-user-from-request";

export async function GET(
  req: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await context.params;

     const orderIdNum = Number(orderId);
    if (isNaN(orderIdNum)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const url = new URL(req.url);
    const filters = JSON.parse(url.searchParams.get("filters") || "{}"); // optional filters
    const sortKey = url.searchParams.get("sortKey") || undefined;
    const sortDirection = url.searchParams.get("sortDirection") || undefined;

    const assets = await getOrderAssets(orderIdNum, filters, sortKey, sortDirection);

    return NextResponse.json(assets);

  } catch (err: any) {
    console.error("API ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}
