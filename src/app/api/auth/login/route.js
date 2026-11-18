import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { handler, ok, readJson, needStr, HttpError } from "@/lib/http";
export const dynamic = "force-dynamic";

export const POST = handler(async ({ req }) => {
  const body = await readJson(req);
  const username = needStr(body, "username", "Username", 50);
  const password = needStr(body, "password", "Password", 72);

  const [user] = await query(
    `SELECT u.User_ID, u.Username, u.Role, u.Password_Hash, st.Staff_ID, st.Full_Name
       FROM users u LEFT JOIN staff st ON st.User_ID = u.User_ID
      WHERE u.Username = ?`,
    [username]
  );
  const valid = user?.Password_Hash && (await bcrypt.compare(password, user.Password_Hash));
  if (!valid) throw new HttpError(401, "Wrong username or password.");

  const session = {
    uid: user.User_ID,
    username: user.Username,
    role: user.Role,
    staffId: user.Staff_ID ?? null,
    name: user.Full_Name || user.Username,
  };
  await createSession(session);
  return ok(session);
});
