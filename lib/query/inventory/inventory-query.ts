import { db } from "@/lib/db";
import { getGlobalFilters} from "../filters/filters-query";


export async function getInventoryTable(
  page = 1,
  limit = 10,
  search = "",
  filters: Record<string, string> = {},
  sortKey?: string,
  sortDirection?: string
) {
  const offset = (page - 1) * limit;

  let whereClauses: string[] = [];
  let values: any[] = [];

  // Search by asset_name
  if (search) {
    whereClauses.push(`CONCAT(v.vendor_name, ' ', am.model_name) LIKE ?`);
    values.push(`%${search}%`);
  }

  // Dynamic filters
  Object.entries(filters).forEach(([key, value]) => {
    if (!value || value === "all") return;

    // Computed column: asset_name
    if (key === "asset_name") {
      whereClauses.push(`CONCAT(v.vendor_name, ' ', am.model_name) LIKE ?`);
      values.push(`%${value}%`);
    }

    // Date filters
    else if (key.endsWith("_date")){
      whereClauses.push(`DATE_FORMAT(${key}, '%Y-%m-%d') LIKE ?`);
      values.push(`%${value}%`);
    }

    // Assigned_to partial match
    else if (key === "assigned_to") {
      whereClauses.push(`CONCAT(u.firstname, ' ', u.lastname) LIKE ?`);
      values.push(`%${value}%`);
    }

    // Exact match columns
    else {
  const columnMap: Record<string, string> = {
    status: "s.status",
    disposition_status: "ds.status",
    location_name: "l.location_name",
    department_name: "d.department_name",
    type_name: "at.type_name",
  };
  const column = columnMap[key] || key;

  if (["status", "disposition_status", "location_name", "department_name", "type_name"].includes(key)) {
    whereClauses.push(`${column} LIKE ?`);
    values.push(`%${value}%`);
  } else {
    whereClauses.push(`${column} = ?`);
    values.push(value);
  }
}
  });

  const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const orderSQL = sortKey && sortDirection
    ? `ORDER BY ${sortKey} ${sortDirection.toUpperCase()}`
    : "";

  // Fetch paginated data
  const [rows] = await db.query(
    `
    SELECT
      ha.serial_number,
      CONCAT(v.vendor_name, ' ', am.model_name) AS asset_name,
      at.type_name,
      CONCAT(u.firstname, ' ', u.lastname) AS assigned_to,
      d.department_name,
      l.location_name,
      ha.purchase_date,
      ha.warranty_expiry_date,
      ha.lifecycle_review_date,
      s.status,
      ds.status AS disposition_status
    FROM hardware_asset ha
    LEFT JOIN asset_model am ON ha.model_id = am.model_id
    LEFT JOIN vendor v ON am.vendor_id = v.vendor_id
    LEFT JOIN asset_type at ON am.asset_type_id = at.asset_type_id
    LEFT JOIN user u ON ha.assigned_to = u.user_id
    LEFT JOIN department d ON ha.department_id = d.department_id
    LEFT JOIN location l ON ha.location_id = l.location_id
    LEFT JOIN asset_status s ON ha.status_id = s.asset_status_id
    LEFT JOIN disposition_status ds ON ha.disposition_status_id = ds.disposition_status_id
    ${whereSQL}
    ${orderSQL}
    LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );

  // Fetch total count for pagination
  const [countResult]: any = await db.query(
    `
    SELECT COUNT(*) as total
    FROM hardware_asset ha
    LEFT JOIN asset_model am ON ha.model_id = am.model_id
    LEFT JOIN vendor v ON am.vendor_id = v.vendor_id
    LEFT JOIN asset_type at ON am.asset_type_id = at.asset_type_id
    LEFT JOIN user u ON ha.assigned_to = u.user_id
    LEFT JOIN department d ON ha.department_id = d.department_id
    LEFT JOIN location l ON ha.location_id = l.location_id
    LEFT JOIN asset_status s ON ha.status_id = s.asset_status_id
    LEFT JOIN disposition_status ds ON ha.disposition_status_id = ds.disposition_status_id
    ${whereSQL}
  `,
    values
  );

  // Fetch only inventory-relevant filters
  const { tableFilters: filterOptions } = await getGlobalFilters([
    "asset_name",
    "type_name",
    "purchase_date",
    "warranty_expiry_date",
    "lifecycle_review_date",
    "status",
    "disposition_status"
  ]);

  return { data: rows, total: countResult[0].total, filterOptions };
}


 export async function getAssetTypeName(assetTypeId: number): Promise<string> {
  const [result]: any = await db.query(
    "SELECT type_name FROM asset_type WHERE asset_type_id = ?",
    [assetTypeId]
  );
  return result.length > 0 ? result[0].type_name : "Unknown";
}
export async function getFormFields() {
  const [locations] = await db.query("SELECT location_id, location_name FROM location ORDER BY location_name");
  const [assetTypes] = await db.query("SELECT asset_type_id, type_name FROM asset_type ORDER BY type_name");
  const [departments] = await db.query("SELECT department_id, department_name FROM department ORDER BY department_name");
  const [users] = await db.query("SELECT user_id, firstname, lastname, department_id, primary_location_id FROM user ORDER BY firstname");
  const [vendors] = await db.query("SELECT vendor_id, vendor_name FROM vendor ORDER BY vendor_name");

  return {
    locations,
    assetTypes,
    departments,
    users,
    vendors,
  };
}


//Add Asset//

export async function insertAsset({serialNumber, vendorId, assetTypeId, modelName, assignedTo, departmentId,locationId,purchaseDate,warrantyExpiry,lifecycleReview}: {
  serialNumber: string;
  vendorId: number;
  assetTypeId: number;
  modelName: string;
  assignedTo: number | null;
  departmentId: number;
  locationId: number;
  purchaseDate: Date;
  warrantyExpiry: Date;
  lifecycleReview: Date;
}) {
  const [modelResult]: any = await db.query(
    `INSERT INTO asset_model (model_name, asset_type_id, vendor_id)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE model_id = LAST_INSERT_ID(model_id)
    `,
    [modelName, assetTypeId, vendorId]
  );
  const modelId = modelResult.insertId;

   const [assetResult]: any = await db.query(
    `INSERT INTO hardware_asset
    (serial_number, model_id, assigned_to, department_id, location_id, purchase_date, warranty_expiry_date, lifecycle_review_date, status_id, disposition_status_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)`,
    [
      serialNumber,
      modelId,
      assignedTo,
      departmentId,
      locationId,
      purchaseDate,
      warrantyExpiry,
      lifecycleReview,
    ]
);
  return { modelId, assetId: assetResult.insertId };
 
}