import { db } from "@/lib/db";

type FilterKey =
  | "asset_name"
  | "type_name"
  | "assigned_to"
  | "department_name"
  | "location_name"
  | "purchase_date"
  | "warranty_expiry_date"
  | "lifecycle_review_date"
  | "status"
  | "disposition_status"
  | "created_date"
  | "scheduled_pickup_date"
  | "completed_date";

export async function getGlobalFilters(filters: FilterKey[] = []) {
  // Map each filter to its SQL query
  const queries: Record<FilterKey, string> = {
    asset_name: `
      SELECT DISTINCT CONCAT(v.vendor_name, ' ', am.model_name) AS asset_name
      FROM hardware_asset ha
      LEFT JOIN asset_model am ON ha.model_id = am.model_id
      LEFT JOIN vendor v ON am.vendor_id = v.vendor_id
    `,
    type_name: `SELECT DISTINCT type_name FROM asset_type`,
    assigned_to: `SELECT DISTINCT CONCAT(firstname,' ',lastname) AS assigned_to FROM user`,
    department_name: `SELECT DISTINCT department_name FROM department`,
    location_name: `SELECT DISTINCT location_name FROM location`,
    purchase_date: `
      SELECT DISTINCT DATE_FORMAT(purchase_date, '%Y-%m-%d') AS purchase_date
      FROM hardware_asset
    `,
    warranty_expiry_date: `
      SELECT DISTINCT DATE_FORMAT(warranty_expiry_date, '%Y-%m-%d') AS warranty_expiry_date
      FROM hardware_asset
    `,
    lifecycle_review_date: `
      SELECT DISTINCT DATE_FORMAT(lifecycle_review_date, '%Y-%m-%d') AS lifecycle_review_date
      FROM hardware_asset
    `,
    status: `SELECT DISTINCT status FROM asset_status`,
    disposition_status: `SELECT DISTINCT status AS disposition_status FROM disposition_status`,
    created_date: `
      SELECT DISTINCT DATE_FORMAT(created_date, '%Y-%m-%d') AS created_date
      FROM disposal_order
    `,
    scheduled_pickup_date: `
      SELECT DISTINCT DATE_FORMAT(scheduled_pickup_date, '%Y-%m-%d') AS scheduled_pickup_date
      FROM disposal_order
    `,
    completed_date: `
      SELECT DISTINCT DATE_FORMAT(completed_date, '%Y-%m-%d') AS completed_date
      FROM disposal_order
    `,
  };

  const tableFilters: Record<string, any[]> = {};

  // Only fetch the filters requested
  for (const key of filters) {
    if (queries[key]) {
      const [rows]: any = await db.query(queries[key]);
      tableFilters[key] = rows.map((r: any) => r[key]);
    }
  }

  return { tableFilters };
}