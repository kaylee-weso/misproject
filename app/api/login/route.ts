import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth/jwt";
import { findUserByEmail, updateLastLogin } from "@/lib/query/login/login-query";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.email || !body.password) {
      return new Response(JSON.stringify({ error: "Missing email or password" }), { status: 400 });
    }

    const user = await findUserByEmail(body.email);

    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401 });
    }

    const passwordValid = await bcrypt.compare(body.password, user.password_hash);

    if (!passwordValid) {
      return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401 });
    }

    const token = signToken({
      user_id: user.user_id,
      role_id: user.role_id,
      firstname: user.firstname,
      lastname: user.lastname
    });

    await updateLastLogin(user.user_id);

    return new Response(JSON.stringify({ message: "Login successful" }), {
      status: 200,
      headers: {
        "Set-Cookie": `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
      }
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}