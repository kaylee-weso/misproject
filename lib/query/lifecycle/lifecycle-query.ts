import { db } from "@/lib/db";
import { getGlobalFilters } from "../filters/filters-query";

export async function getLifecycleReviewTable(
  page = 1,
  limit = 10,
  search = "",
  filters: Record<string, string> = {},
  sortKey?: string,
  sortDirection?: string,
  category?: "upcoming" | "today" | "past"
) {
  const offset = (page - 1) * limit;

  // --- START WHERE CLAUSES ---
  let whereClauses: string[] = [];
  let values: any[] = [];


  // --- CATEGORY FILTER ---
  if (category) {
    switch (category) {
      case "upcoming":
        whereClauses.push(`
          ha.lifecycle_review_date IS NOT NULL
          AND DATE(ha.lifecycle_review_date)> CURDATE()
          AND DATE(ha.lifecycle_review_date) <= DATE_ADD(CURDATE(), INTERVAL 10 DAY)
        `);
        break;

      case "today":
        whereClauses.push(`
          ha.lifecycle_review_date IS NOT NULL
          AND DATE(ha.lifecycle_review_date) = CURDATE()
        `);
        break;

      case "past":
        whereClauses.push(`
          ha.lifecycle_review_date IS NOT NULL
          AND DATE(ha.lifecycle_review_date) < CURDATE()
        `);
        break;
    }
  }

  whereClauses.push("ha.reviewed = FALSE")

  // --- SEARCH FILTER ---
  if (search) {
    whereClauses.push(`CONCAT(v.vendor_name, ' ', am.model_name) LIKE ?`);
    values.push(`%${search}%`);
  }

  // --- OTHER DYNAMIC FILTERS ---
  Object.entries(filters).forEach(([key, value]) => {
    if (!value || value === "all") return;

    if (key === "asset_name") {
      whereClauses.push(`CONCAT(v.vendor_name, ' ', am.model_name) LIKE ?`);
      values.push(`%${value}%`);
    } else if (key.endsWith("_date")) {
      whereClauses.push(`DATE_FORMAT(${key}, '%Y-%m-%d') LIKE ?`);
      values.push(`%${value}%`);
    } else if (key === "assigned_to") {
      whereClauses.push(`CONCAT(u.firstname, ' ', u.lastname) LIKE ?`);
      values.push(`%${value}%`);
    } else {
      const columnMap: Record<string, string> = {
        status: "s.status",
        disposition_status: "ds.status",
        location_name: "l.location_name",
        department_name: "d.department_name",
        type_name: "at.type_name",
      };
      const column = columnMap[key] || key;
      whereClauses.push(`${column} = ?`);
      values.push(value);
    }
  });

  const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
  

  const orderSQL = sortKey && sortDirection
    ? `ORDER BY ${sortKey} ${sortDirection.toUpperCase()}`
    : "";

  // --- DEBUG LOGGING ---
  console.log("WHERE CLAUSES:", whereClauses);
  console.log("VALUES:", values);
  console.log("FULL WHERE SQL:", whereSQL);

  // --- DATA QUERY ---
  const [rows] = await db.query(
    `
    SELECT
      ha.asset_id,
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
    LIMIT ? OFFSET ?
    `,
    [...values, limit, offset]
  );

  // --- TOTAL COUNT ---
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

  // --- FILTER OPTIONS (unchanged) ---
  const { tableFilters: filterOptions } = await getGlobalFilters([
    "asset_name",
    "type_name",
    "purchase_date",
    "warranty_expiry_date",
    "lifecycle_review_date",
  ]);

  return { data: rows, total: countResult[0].total, filterOptions };
}

//--- UPDATE ASSET STATUS ---

export async function updateAssetStatus(
  assetId: number,
  statusId: number,
  userId: number,
  
) {

  // Start a transaction to ensure both updates happen together
  const conn = await db.getConnection(); // if using mysql2
  try {
    await conn.beginTransaction();

    // Update hardware_asset table
    await conn.query(
      `UPDATE hardware_asset 
      SET 
        status_id = ?,
        reviewed = TRUE 
      WHERE asset_id = ?`,
      [statusId, assetId]
    );

    // Insert into asset_status_history
    await conn.query(
      `INSERT INTO asset_status_history 
        (asset_id, asset_status_id, changed_by, changed_at)
       VALUES (?, ?, ?, NOW())`,
      [assetId, statusId, userId]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}


  