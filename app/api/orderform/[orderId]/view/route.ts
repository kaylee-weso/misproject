import { NextResponse } from "next/server";
import { getOrder, getOrderAssets } from "@/lib/query/orderform/orderform-query";

export async function GET(request: Request, { params }: { params: any }) {
  // Unwrap params (Next.js App Router)
  const resolvedParams = await params;
  const { orderId } = resolvedParams;

  const orderIdNum = Number(orderId);
  if (isNaN(orderIdNum)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  try {
    // Fetch the main order info
    const order = await getOrder(orderIdNum);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Fetch the assets for this order (no filters for now)
    const assetsResult = await getOrderAssets(orderIdNum);
    const assets = assetsResult.data;

    return NextResponse.json({ order, assets });
  } catch (err) {
    console.error("Error fetching order details:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}