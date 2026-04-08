import { db } from "@/lib/db";


export async function findUserByEmail(email: string) {
  const [rows]: any = await db.query(
    "SELECT * FROM user WHERE email = ?",
    [email]
  );
  return rows[0];
}

export async function updateLastLogin(userId: number) {
  await db.query(
    "UPDATE user SET last_log_in = NOW() WHERE user_id = ?",
    [userId]
  );
}