import { NextResponse } from "next/server";
import { 
  getTotalAssets,
  getAssetStatusBreakdown,
  getDispositionStatusBreakdown,
  getAllAssetTypes,
  getLifecycleReviewCounts
} from "@/lib/query/dashboard/dashboard-query";


export async function GET(request: Request) {
  const url = new URL(request.url);
  const typeId = url.searchParams.get("assetTypeId"); 
  const assetTypeId = typeId ? Number(typeId) : undefined;

  try {
    const totalAssets = await getTotalAssets(assetTypeId);
    const statusBreakdown = await getAssetStatusBreakdown(assetTypeId);
    const dispositionBreakdown = await getDispositionStatusBreakdown(assetTypeId);
    const allAssetTypes = await getAllAssetTypes();
    const lifecycleCounts = await getLifecycleReviewCounts(assetTypeId); // new line

    return NextResponse.json({
      totalAssets,
      statusBreakdown,
      dispositionBreakdown,
      allAssetTypes,
      lifecycleCounts, // include counts in response
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}