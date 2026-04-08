import { getUserFromJWT } from "@/lib/auth/jwt";

export function getUserFromRequest(req: Request) {
  const cookieHeader = req.headers.get("cookie");

  const token = cookieHeader
    ?.split("; ")
    .find(row => row.startsWith("token="))
    ?.split("=")[1];

  if (!token) return null;

  return getUserFromJWT(token);
}