export const getOrderFormTable = async ({
  page = 1, 
  limit = 10,
  searchTerm = "",
  filters = {},
  sortKey,
  sortDirection,
}: any) => {
  const params = new URLSearchParams ({
    page: String(page),
    limit: String(limit),
    search: searchTerm,
    filters: JSON.stringify(filters),
    sortKey: sortKey || "",
    sortDirection: sortDirection || "",
  });

  const res = await fetch(`/api/orderform?${params.toString()}`);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("API Error:", errorText);
     throw new Error("Failed to fetch order form table");
  }
  return res.json();
};

export async function fetchOrderFormOptions() {
  const res = await fetch("/api/create-order-form?type=options");
  return res.json();
}

export const fetchAssets = async ({ location, filters = {}, sortKey, sortDirection }: { location: string; filters?: Record<string, string>; sortKey?: string; sortDirection?: string }) => {
  if (!location) return { data: [], filterOptions: {} };

  const params = new URLSearchParams({
    location,
    filters: JSON.stringify(filters),
    sortKey: sortKey || "",
    sortDirection: sortDirection || "",
  });

  const res = await fetch(`/api/create-order-form?${params.toString()}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch retired assets");
  const data = await res.json();

  return {
    data: data.data || data, // keep backward compatible
    filterOptions: data.filterOptions || {},
  };
};

export async function createOrder(assets: any[]) {
  const res = await fetch("/api/create-order-form", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ assets }),
    credentials: "include"
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Create order error:", data);
    throw new Error(data.error || "Failed to create order");
  }

  return data;
}

// ---------------- GET ORDER ASSETS ----------------
export const fetchOrderAssets = async ({orderId, filters = {}, sortKey, sortDirection}: { orderId: number; filters?: Record<string, string>; sortKey?: string; sortDirection?: string }) => {
  if (!orderId) return { data: [], filterOptions: {} };

  const params = new URLSearchParams({
    filters: JSON.stringify(filters),
    sortKey: sortKey || "",
    sortDirection: sortDirection || "",
  });

  const res = await fetch(`/api/orderform/${orderId}?${params.toString()}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch order assets");
  const data = await res.json();

  return {
    data: data.data || data, // keep backward compatible
    filterOptions: data.filterOptions || {},
  };
};

// ---------------- ORDER WORKFLOW FIELDS ----------------
export async function fetchOrderWorkflowFields(orderId: number) {
  const res = await fetch(`/api/orderform/${orderId}/workflow`, { credentials: "include" });

  if (!res.ok) {
    const text = await res.text();
    console.error("API ERROR:", res.status, text);
    throw new Error(`Failed to fetch workflow fields: ${res.status}`);
  }

  return res.json();
}


// ---------------- SCHEDULE ORDER ----------------
export async function scheduleOrderRequest(
  orderId: number,
  assets: any[],
  userId: number,
  scheduledPickupDate: string,
  facilityId: number
) {
  const res = await fetch(`/api/orderform/${orderId}/schedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, assets, userId, scheduledPickupDate, facilityId }),
  });

  if (!res.ok) throw new Error("Failed to schedule order");
  return res.json();
}


// ---------------- CONFIRM ASSET TRANSER ----------------
export async function confirmAssetTransferRequest(
  orderId: number,
  assets: any[],
  userId: number,
  actualPickupDate: string,
  vendorOrderId: number,
  pickupContact: string,
  notes: string
) {
  const res = await fetch(`/api/orderform/${orderId}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, assets, userId, actualPickupDate, vendorOrderId, pickupContact, notes }),
  });

  if (!res.ok) throw new Error("Failed to confirm asset transfer");
  return res.json();
}


// ---------------- COMPLETE ORDER ----------------
export async function completeOrderRequest(
  orderId: number,
  assets: any[],
  userId: number,
  completedDate: string,
  certificateReceived: boolean

  ) {
  const res = await fetch(`/api/orderform/${orderId}/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ orderId, assets, userId, completedDate, certificateReceived }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to complete order");
  }

  return data;
}

// ---------------- FETCH ORDER FORM DURING RE-ENTRY ---------------

export async function fetchOrderForm(orderId: number) {
  const res = await fetch(`/api/orderform/${orderId}/steps`);
  if (!res.ok) throw new Error("Failed to fetch order form");
  return res.json(); // should return the same shape as OrderFormData
}

// ---------------- FETCH ORDER DETAILS ---------------

export async function fetchOrderDetails(orderId: number) {
  try {
    const res = await fetch(`/api/orderform/${orderId}/view`);
    if (!res.ok) {
      const text = await res.text();
      console.error("Failed fetch:", res.status, text);
      throw new Error("Failed to fetch order");
    }
    const data = await res.json();
    return data; // { order, assets }
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
}