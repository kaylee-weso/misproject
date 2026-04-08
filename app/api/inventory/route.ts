import { NextResponse } from "next/server";
import { getInventoryTable} from "@/lib/query/inventory/inventory-query";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";
  const filters = JSON.parse(searchParams.get("filters") || "{}");
  const sortKey = searchParams.get("sortKey") || undefined;
  const sortDirection = searchParams.get("sortDirection") || undefined;

  const result = await getInventoryTable(
    page,
    limit,
    search,
    filters,
    sortKey,
    sortDirection
  );

  return NextResponse.json(result);
}