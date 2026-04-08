import { NextResponse } from "next/server";
import { confirmAssetTransfer } from "@/lib/query/orderform/orderform-query";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, actualPickupDate, vendorOrderId, pickupContact, userId, assets, notes } = body;

    if (!orderId || !actualPickupDate || !vendorOrderId || !userId || !pickupContact || !assets) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await confirmAssetTransfer(orderId, assets, userId, actualPickupDate, vendorOrderId, pickupContact, notes);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to schedule order" }, { status: 500 });
  }
}