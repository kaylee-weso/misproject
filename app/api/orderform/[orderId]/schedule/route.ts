import { NextResponse } from "next/server";
import { ScheduleOrder } from "@/lib/query/orderform/orderform-query";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, scheduledPickupDate, facilityId, userId, assets } = body;

    if (!orderId || !scheduledPickupDate || !facilityId || !userId || !assets) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await ScheduleOrder(orderId, assets, userId, scheduledPickupDate, facilityId);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to schedule order" }, { status: 500 });
  }
}