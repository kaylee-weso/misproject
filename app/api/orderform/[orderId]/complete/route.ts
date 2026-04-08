import { NextResponse } from "next/server";
import { completeOrder } from "@/lib/query/orderform/orderform-query";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, assets, userId,completedDate, certificateReceived} = body;

    if (!orderId || !completedDate ||  !userId ||  !assets) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await completeOrder(orderId, assets, userId, completedDate, certificateReceived);

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
  console.error("COMPLETE ORDER ERROR:", err);

  return NextResponse.json(
    { error: err.message || "Failed to complete order" },
    { status: 500 }
  );
}
}