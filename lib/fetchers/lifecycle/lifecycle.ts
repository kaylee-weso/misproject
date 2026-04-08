export const getLifecycle = async ({
  page = 1,
  limit = 10,
  searchTerm = "",
  filters = {},
  sortKey,
  sortDirection,
  category
}: any) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search: searchTerm,
    filters: JSON.stringify(filters),
    sortKey: sortKey || "",
    sortDirection: sortDirection || "",
    category
  });

  const res = await fetch(`/api/lifecycle?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch assets for lifecycle review");

  return res.json();
};


export async function updateAssetStatusRequest(assetId: number, statusId: number, userId: number) {
  const res = await fetch("/api/lifecycle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assetId, statusId, userId}),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}