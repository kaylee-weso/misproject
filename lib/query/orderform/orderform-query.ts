import { db } from "@/lib/db";
import { getGlobalFilters} from "../filters/filters-query";

export async function getOrderFormTable(
  page =1, 
  limit = 10,
  filters: Record<string, string> = {},
  sortKey?: string,
  sortDirection?: string
) {
  const offset = (page -1)* limit;

  let whereClauses: string[] = [];
  let values: any[] = [];
  

  Object.entries(filters).forEach(([key, value]) => {
    if (!value || value === "all") return;

    if (key === "asset_name") {
      whereClauses.push(`CONCAT(v.vendor_name, ' ', am.model_name) LIKE ?`);
      values.push(`%${value}%`);
    }

    else if (key.endsWith("_date")){
      whereClauses.push(`DATE_FORMAT(${key}, '%Y-%m-%d') LIKE ?`);
      values.push(`%${value}%`);
    }

    else {
      const columnMap: Record<string, string> = {
        disposition_status: "ds.status",
        location_name: "l.location_name",
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

    // Fetch paginated data
  const [rows] = await db.query(
    `SELECT
        do.disposal_order_id AS order_id,
        do.created_date,
        do.scheduled_pickup_date,
        do.completed_date,
        l.location_name,
        ds.status,
        CONCAT(v.vendor_name, ' ', am.model_name) AS asset_name,
        at.type_name,
        ha.serial_number
        
    FROM disposal_order do

    LEFT JOIN disposal_order_item doi ON do.disposal_order_id = doi.disposal_order_id
    LEFT JOIN hardware_asset ha ON doi.asset_id = ha.asset_id
    LEFT JOIN disposition_status ds ON ha.disposition_status_id = ds.disposition_status_id
    LEFT JOIN location l ON ha.location_id = l.location_id
    LEFT JOIN asset_model am ON ha.model_id = am.model_id
    LEFT JOIN vendor v ON am.vendor_id = v.vendor_id
    LEFT JOIN asset_type at ON am.asset_type_id = at.asset_type_id
    ${whereSQL}
    ${orderSQL}
    LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );
  

  const [countResult]: any = await db.query(
    `SELECT COUNT(*) as total 
    FROM disposal_order do
    LEFT JOIN disposal_order_item doi ON do.disposal_order_id = doi.disposal_order_id
    LEFT JOIN hardware_asset ha ON doi.asset_id = ha.asset_id
    LEFT JOIN disposition_status ds ON ha.disposition_status_id = ds.disposition_status_id
    LEFT JOIN location l ON ha.location_id = l.location_id
    LEFT JOIN asset_model am ON ha.model_id = am.model_id
    LEFT JOIN vendor v ON am.vendor_id = v.vendor_id
    LEFT JOIN asset_type at ON am.asset_type_id = at.asset_type_id
    ${whereSQL}
  `,
    values
  );

  const { tableFilters: filterOptions } = await getGlobalFilters([
    "created_date",
    "scheduled_pickup_date",
    "completed_date",
    "location_name",
    "disposition_status"
  ]);

  return { data: rows, total: countResult[0].total, filterOptions };
}


export async function getRetiredAssets(
  location: string,
  filters: Record<string, string> = {},
  sortKey?: string,
  sortDirection?: string
) {
  let whereClauses: string[] = [
    "ha.status_id = 2", // Retired
    "ha.disposition_status_id = 1", //Not yet ordered for disposal
    "l.location_name = ?" 
  ];

  let values: any[] = [location]; 
  

  Object.entries(filters).forEach(([key, value]) => {
    if (!value || value === "all" || key === "location_name") return; 

    const columnMap: Record<string, string> = {
      asset_name: "CONCAT(v.vendor_name, ' ', am.model_name)",
      type_name: "at.type_name",
      status: "s.status",
      disposition_status: "ds.status"
    };

    const column = columnMap[key] || key;
    whereClauses.push(`${column} = ?`);
    values.push(value);
  }
)

const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
const orderSQL = sortKey && sortDirection
  ? `ORDER BY ${sortKey} ${sortDirection.toUpperCase()}`
  : "";

const [rows] = await db.query(
   `SELECT
        ha.asset_id,
        ha.serial_number,
        CONCAT(v.vendor_name, ' ', am.model_name) AS asset_name,
        at.type_name,
        s.status as status,
        ds.status as disposition_status,
        l.location_name
      
    FROM hardware_asset ha

    LEFT JOIN asset_model am ON ha.model_id = am.model_id
    LEFT JOIN vendor v ON am.vendor_id = v.vendor_id
    LEFT JOIN asset_type at ON am.asset_type_id = at.asset_type_id
    LEFT JOIN asset_status s ON ha.status_id = s.asset_status_id
    LEFT JOIN disposition_status ds ON ha.disposition_status_id = ds.disposition_status_id
    LEFT JOIN location l ON ha.location_id = l.location_id

    ${whereSQL}
    ${orderSQL}
  `,
  values
);  
      
  const { tableFilters: filterOptions } = await getGlobalFilters([
    "asset_name",
    "type_name",
  ]);

  return { data: rows, filterOptions };
}


export async function getLocations() {const [rows] = await db.query("SELECT location_id, location_name FROM location ORDER BY location_name");return rows}


export async function createRecyclingOrder(
  assets: any[],
  userId: number
) {
  if (!assets || assets.length === 0) {
    throw new Error("No assets provided");
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [orderResult]: any = await connection.query(
      `INSERT INTO disposal_order (created_by, created_date, facility_id, scheduled_pickup_date,completed_date, certificate_received,  notes)
       VALUES (?, NOW(), NULL, NULL, NULL, NULL, NULL)`,
      [userId]
    );

    const orderId = orderResult?.insertId;

    if (!orderId) {
      throw new Error("Failed to create disposal order");
    }

    for (const asset of assets) {
      await connection.query(
        `UPDATE hardware_asset 
         SET disposition_status_id = 2
         WHERE asset_id = ?`,
        [asset.asset_id]
      );

      await connection.query(
        `INSERT INTO disposition_status_history 
         (asset_id, disposition_status_id, changed_by, changed_at)
         VALUES (?, 2, ?, NOW())`,
        [asset.asset_id, userId]
      );

      await connection.query(
        `INSERT INTO disposal_order_item 
         (disposal_order_id, asset_id)
         VALUES (?, ?)`,
        [orderId, asset.asset_id]
      );
    }

    await connection.commit();

    return {
      success: true,
      orderId,
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}


// ---------------- GET ORDER ASSETS ----------------
export async function getOrderAssets(
  orderId: number,
  filters: Record<string, string> = {},
  sortKey?: string,
  sortDirection?: string
) {
  // Base WHERE clause: only assets for this order
  let whereClauses: string[] = ["doi.disposal_order_id = ?"];
  let values: any[] = [orderId];

  // Apply additional filters dynamically
  Object.entries(filters).forEach(([key, value]) => {
    if (!value || value === "all") return;

    const columnMap: Record<string, string> = {
      asset_name: "CONCAT(v.vendor_name, ' ', am.model_name)",
      type_name: "at.type_name",
      status: "s.status",
      disposition_status: "ds.status",
    };

    const column = columnMap[key] || key;
    whereClauses.push(`${column} = ?`);
    values.push(value);
  });

  const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
  const orderSQL = sortKey && sortDirection
    ? `ORDER BY ${sortKey} ${sortDirection.toUpperCase()}`
    : "";

  const [rows] = await db.query(
    `
    SELECT
      ha.asset_id,
      ha.serial_number,
      CONCAT(v.vendor_name, ' ', am.model_name) AS asset_name,
      at.type_name,
      s.status AS status,
      ds.status AS disposition_status,
      l.location_name
    FROM disposal_order_item doi
    JOIN hardware_asset ha ON doi.asset_id = ha.asset_id
    JOIN asset_model am ON ha.model_id = am.model_id
    JOIN vendor v ON am.vendor_id = v.vendor_id
    JOIN asset_type at ON am.asset_type_id = at.asset_type_id
    LEFT JOIN asset_status s ON ha.status_id = s.asset_status_id
    LEFT JOIN disposition_status ds ON ha.disposition_status_id = ds.disposition_status_id
    LEFT JOIN location l ON ha.location_id = l.location_id
    ${whereSQL}
    ${orderSQL}
    `,
    values
  );

  const { tableFilters: filterOptions } = await getGlobalFilters([
    "asset_name",
    "type_name",
  ]);

  return { data: rows, filterOptions };
}

// ---------------- ORDER WORKFLOW FORM FIELDS ----------------

export async function getOrderWorkflowFields(){
  const [facilities] = await db.query ("SELECT facility_id, Company, Full_Address FROM facilities ORDER BY Company, Full_Address");
  return {facilities};
}


// ---------------- SCHEDULE ORDER ----------------
export async function ScheduleOrder(
  orderIdnum: number,
  assets: any[],
  userId: number,
  scheduledPickupDate: string,
  facilityId: number,
) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Update asset disposition
    await connection.query(
      `UPDATE hardware_asset ha
       JOIN disposal_order_item doi 
         ON ha.asset_id = doi.asset_id
       SET ha.disposition_status_id = 5
       WHERE doi.disposal_order_id = ?`,
      [orderIdnum]
    );

    // Insert history for each asset
    for (const asset of assets) {
      await connection.query(
        `INSERT INTO disposition_status_history (asset_id, disposition_status_id, changed_by, changed_at)
         VALUES (?, 5, ?, NOW())`,
        [asset.asset_id, userId]
      );
    }

    // Update the disposal order with scheduled pickup date and facility
    await connection.query(
      `UPDATE disposal_order
       SET scheduled_pickup_date = ?, facility_id = ?
       WHERE disposal_order_id = ?`,
      [scheduledPickupDate, facilityId, orderIdnum]
    );

    await connection.commit();
    return { success: true };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}


// ---------------- CONFIRM ASSET TRANSFER ----------------

export async function confirmAssetTransfer (
  orderIdnum: number,
  assets: any[],
  userId: number,
  actualPickupDate: string,
  vendorOrderId: number,
  pickupContact: string,
  notes: string
) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Update asset disposition
    await connection.query(
      `UPDATE hardware_asset ha
       JOIN disposal_order_item doi 
         ON ha.asset_id = doi.asset_id
       SET ha.disposition_status_id = 3
       WHERE doi.disposal_order_id = ?`,
      [orderIdnum]
    );

    // Insert history for each asset
    for (const asset of assets) {
      await connection.query(
        `INSERT INTO disposition_status_history (asset_id, disposition_status_id, changed_by, changed_at)
         VALUES (?, 3, ?, NOW())`,
        [asset.asset_id, userId]
      );
    }

    // Update the disposal order with actual pickup date, vendor order id, pickup contact
    await connection.query(
      `UPDATE disposal_order
       SET 
        actual_pickup_date = ?, 
        vendor_order_id = ?, 
        pickup_contact = ?,
        notes = ?
       WHERE disposal_order_id = ?`,
      [actualPickupDate, vendorOrderId, pickupContact, notes, orderIdnum]
    );

    await connection.commit();
    return { success: true };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();

  }
}

// ---------------- COMPLETE ORDER ----------------
export async function completeOrder(
  orderIdnum: number,
  assets: any[],
  userId: number,
  completedDate: string,
  certificateReceived: boolean
) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE hardware_asset ha
      JOIN disposal_order_item doi 
        ON ha.asset_id = doi.asset_id
      SET 
        ha.status_id = 3,
        ha.disposition_status_id = 4
      WHERE doi.disposal_order_id = ?
      `,
        [orderIdnum]
      );
    
    for (const asset of assets) {
      await connection.query(
        `INSERT INTO disposition_status_history 
         (asset_id, disposition_status_id, changed_by, changed_at)
         VALUES (?, 4, ?, NOW())`,
        [asset.asset_id, userId]
      );
    

      await connection.query(
        `INSERT INTO asset_status_history 
         (asset_id, asset_status_id, changed_by, changed_at)
         VALUES (?, 3, ?, NOW())`,
        [asset.asset_id, userId]
      );
    }

    await connection.query(
      `UPDATE disposal_order
        SET 
        completed_date = NOW(),
        certificate_received = 1
        WHERE disposal_order_id = ?`,
      [orderIdnum, completedDate, certificateReceived]
    );


    await connection.commit();

    return { success: true };

  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// ---------------- GET ORDER FOR WORKFLOW STEPS ----------------

export async function getOrder(orderId: number) {
  console.log("Running DB query for orderId:", orderId);
  const [rows]: any = await db.query(
    `
    SELECT
      do.disposal_order_id AS order_id,
      do.created_date,
      do.scheduled_pickup_date,
      do.actual_pickup_date,
      do.vendor_order_id,
      do.pickup_contact,
      do.completed_date,
      do.facility_id,
      do.notes,
      do.certificate_received,
      f.Company AS company,
      f.Full_Address AS address
    FROM disposal_order do
    LEFT JOIN facilities f ON do.facility_id = f.facility_id
    WHERE do.disposal_order_id = ?
    `,
    [orderId]
  );

  console.log("Raw DB rows:", rows);

  return rows[0];
}