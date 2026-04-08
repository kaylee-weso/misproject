import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";


//----TOTAL ASSETS CARD----

export async function getTotalAssets(assetTypeId?: number) {
  let sql = `
    SELECT COUNT(*) AS total
    FROM hardware_asset ha
    LEFT JOIN asset_model am ON ha.model_id = am.model_id
    LEFT JOIN asset_type at ON am.asset_type_id = at.asset_type_id
    ${assetTypeId ? "WHERE at.asset_type_id = ?" : ""}
  `;

  const params = assetTypeId ? [assetTypeId] : [];
  const [rows] = await db.query<RowDataPacket[]>(sql, params);
  return rows[0].total;
}

//----TOTAL ASSETS PER STATUS CARD----


export async function getAssetStatusBreakdown(assetTypeId?: number) {
  const sql = `
    SELECT ha.status_id, COUNT(*) AS total
    FROM hardware_asset ha
    LEFT JOIN asset_model am ON ha.model_id = am.model_id
    LEFT JOIN asset_type at ON am.asset_type_id = at.asset_type_id
    ${assetTypeId ? "WHERE at.asset_type_id = ?" : ""}
    GROUP BY ha.status_id
  `;

  const params = assetTypeId ? [assetTypeId] : [];
  const [rows] = await db.query<RowDataPacket[]>(sql, params);

  const result = { inUse: 0, retired: 0, disposed: 0 };
  rows.forEach((row: any) => {
    if (row.status_id === 1) result.inUse = row.total;
    else if (row.status_id === 2) result.retired = row.total;
    else if (row.status_id === 3) result.disposed = row.total;
  });

  return result;
}


//----TOTAL ASSETS PER DISPOSITION STATUS CARD----

export async function getDispositionStatusBreakdown(assetTypeId?: number) {
  const sql = `
    SELECT ha.disposition_status_id, COUNT(*) AS total
    FROM hardware_asset ha
    LEFT JOIN asset_model am ON ha.model_id = am.model_id
    LEFT JOIN asset_type at ON am.asset_type_id = at.asset_type_id
    ${assetTypeId ? "WHERE at.asset_type_id = ?" : ""}
    GROUP BY ha.disposition_status_id
  `;

  const params = assetTypeId ? [assetTypeId] : [];
  const [rows] = await db.query<RowDataPacket[]>(sql, params);

  const result = {
    none: 0,
    approved_for_disposal: 0,
    in_transit: 0,
    complete: 0,
    scheduled_for_pickup: 0,
  };

  rows.forEach((row: any) => {
    if (row.disposition_status_id === 1) result.none = row.total;
    else if (row.disposition_status_id === 2) result.approved_for_disposal = row.total;
    else if (row.disposition_status_id === 3) result.in_transit = row.total;
    else if (row.disposition_status_id === 4) result.complete = row.total;
    else if (row.disposition_status_id === 5) result.scheduled_for_pickup = row.total;
  });

  return result;
}

//----ALL ASSET TYPES FOR FILTER----
export async function getAllAssetTypes() {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT asset_type_id, type_name 
     FROM asset_type 
     ORDER BY type_name`
  );
  return rows;
}


  //----TOTAL LIFECYCLE REVIEW ASSETS PER CATEGORY----

export async function getLifecycleReviewCounts(assetTypeId?: number) {
  const categories: ("upcoming" | "today" | "past")[] = ["upcoming", "today", "past"];
  const counts: Record<string, number> = { upcoming: 0, today: 0, past: 0 };

  for (const category of categories) {
    let whereClause = `ha.reviewed = FALSE`;
    let params: any[] = [];

    if (assetTypeId) {
      whereClause += ` AND am.asset_type_id = ?`;
      params.push(assetTypeId);
    }

    switch (category) {
      case "upcoming":
        whereClause += ` AND ha.lifecycle_review_date IS NOT NULL 
                         AND DATE(ha.lifecycle_review_date) > CURDATE() 
                         AND DATE(ha.lifecycle_review_date) <= DATE_ADD(CURDATE(), INTERVAL 10 DAY)`;
        break;
      case "today":
        whereClause += ` AND ha.lifecycle_review_date IS NOT NULL 
                         AND DATE(ha.lifecycle_review_date) = CURDATE()`;
        break;
      case "past":
        whereClause += ` AND ha.lifecycle_review_date IS NOT NULL 
                         AND DATE(ha.lifecycle_review_date) < CURDATE()`;
        break;
    }

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total
       FROM hardware_asset ha
       LEFT JOIN asset_model am ON ha.model_id = am.model_id
       WHERE ${whereClause}`,
      params
    );
    counts[category] = rows[0].total;
  }

  return counts;
}