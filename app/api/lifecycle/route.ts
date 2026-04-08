import { NextResponse } from "next/server";
import {getLifecycleReviewTable, updateAssetStatus} from "@/lib/query/lifecycle/lifecycle-query";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";
  const filters = JSON.parse(searchParams.get("filters") || "{}");
  const sortKey = searchParams.get("sortKey") || undefined;
  const sortDirection = searchParams.get("sortDirection") || undefined;
  const categoryParam = searchParams.get("category");
  const category =
    categoryParam === "upcoming" ||
    categoryParam === "today" ||
    categoryParam === "past"
      ? categoryParam
      : undefined;
    
  const result = await getLifecycleReviewTable(
    page,
    limit,
    search,
    filters,
    sortKey,
    sortDirection,
    category
  );

  return NextResponse.json(result);
}


export async function POST(req: Request) {
  try {
    const { assetId, statusId, userId} = await req.json();

    if (!assetId || !statusId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await updateAssetStatus(assetId, statusId, userId);

    return NextResponse.json({ message: "Status updated successfully" });
  } catch (error: any) {
    console.error("Error updating status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}