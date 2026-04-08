import { NextResponse } from "next/server";
import { getOrder } from "@/lib/query/orderform/orderform-query";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  const numericId = Number(orderId);

  console.log("API HIT - orderId:", numericId);

  if (!numericId) {
    console.log("Invalid orderId");
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  try {
    const order = await getOrder(numericId);

    console.log("DB RESULT:", order);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ data: order });
  } catch (err: any) {
    console.error("GetOrder API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch order" }, { status: 500 });
  }
}