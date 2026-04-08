
export interface DashboardData {
  totalAssets: number;
  statusBreakdown: Record<string, number>;
  dispositionBreakdown: Record<string, number>;
}

export async function fetchDashboardData(assetTypeId?: number): Promise<DashboardData> {
  let url = "/api/dashboard";
  if (assetTypeId) url += `?assetTypeId=${assetTypeId}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch dashboard data");

  const data = await res.json();
  return data as DashboardData;
}