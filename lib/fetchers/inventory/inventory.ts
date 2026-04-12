export const getInventory = async ({
  page = 1,
  limit = 10,
  searchTerm = "",
  filters = {},
  sortKey,
  sortDirection,
}: any) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search: searchTerm,
    filters: JSON.stringify(filters),
    sortKey: sortKey || "",
    sortDirection: sortDirection || "",
  });

  const res = await fetch(`/api/inventory?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch inventory");

  return res.json();
};

export async function getFormData() {
  const res = await fetch("/api/add-asset");
  if (!res.ok) throw new Error("Failed to fetch form data");
  return res.json();
}

export async function addAsset(data: any) {
  console.log("SENDING POST TO API", data);

  const res = await fetch("/api/add-asset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Insert into HA table failed");
}