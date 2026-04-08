import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}


type JWTPayload = {
  user_id: number;
  role_id: number;
  firstname: string;
  lastname: string;
};

export function getUserFromJWT(token: string) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not set");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

    return {
      user_id: payload.user_id,
      role_id: payload.role_id,
      firstname: payload.firstname,
      lastname: payload.lastname,
      initials: (payload.firstname[0] + payload.lastname[0]).toUpperCase(),
    };
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}