import { NextResponse } from "next/server";
import {getLocations,getRetiredAssets,createRecyclingOrder} from "@/lib/query/orderform/orderform-query";
import { getUserFromRequest } from "@/lib/auth/get-user-from-request";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filters = JSON.parse(searchParams.get("filters") || "{}");
  const sortKey = searchParams.get("sortKey") || undefined;
  const sortDirection = searchParams.get("sortDirection") || undefined;
  const type = searchParams.get("type") || undefined;
  const location = searchParams.get("location") || "";

  try {
    if (type === "options") {
      const options = await getLocations();
      return NextResponse.json(options);
    }

    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!location) {
      return NextResponse.json({ error: "Location required" }, { status: 400 });
    }

    const result = await getRetiredAssets(
      location,
      filters,
      sortKey,
      sortDirection
    );
      return NextResponse.json(result);

  } catch (err: any) {
    console.error("API ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await createRecyclingOrder(body.assets, user.user_id);
    return NextResponse.json(result);

  } catch (err: any) {
    console.error("API ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}