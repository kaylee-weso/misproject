import { insertAsset, getAssetTypeName } from "../query/inventory/inventory-query";

export async function createAsset(data: {
  serialNumber: string;
  vendorId: number;
  assetTypeId: number;
  modelName: string;
  assignedTo: number | null;
  departmentId: number;
  locationId: number;
  purchaseDate: Date;
}) {
  
  const assetType = await getAssetTypeName(data.assetTypeId);

  
  const warrantyLifecycleMap: Record<string, [number, number]> = {
    "Laptop": [36, 48],
    "Desktop": [36, 60],
    "Monitor": [36,72],
    "Server": [60, 60],
    "Printer": [24, 60],
    "Tablet": [12,36],
    "Mobile Phone": [12,36],
    "Router": [36,84],
    "Switch": [36,84],
    "Docking Station": [12,48],
    "Scanner": [24,60],
    "Keyboard": [12,36],
    "Mouse": [12,36],
    "Desk Phone": [12,36],
    "Camera": [12,36],
    "External Drive": [12,36]
  };

  const [warrantyMonths, lifecycleMonths] =
    warrantyLifecycleMap[assetType] || [36, 48];

  const purchase = new Date(data.purchaseDate);

  const warrantyExpiry = new Date(purchase);
  warrantyExpiry.setDate(
    warrantyExpiry.getDate() + warrantyMonths * 30
  );

  const lifecycleReview = new Date(purchase);
  lifecycleReview.setDate(
    lifecycleReview.getDate() + lifecycleMonths * 30
  );

  await insertAsset({
    ...data,
    warrantyExpiry,
    lifecycleReview,
  });
}