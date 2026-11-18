import bcrypt from "bcryptjs";
import { query, withTransaction } from "@/lib/db";
import { logActivity } from "@/lib/mongo";
import { handler, ok, num, readJson, needStr, optPhone, needInt, needEnum, HttpError, ORGANIZER } from "@/lib/http";
export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  const rows = await query(`
    SELECT st.Staff_ID, st.Full_Name, st.Staff_Phone, u.Username, w.Total_Assignments,
           (SELECT GROUP_CONCAT(CONCAT(sk.Skill_Name, ' (', ss.Proficiency_Level, ')') ORDER BY sk.Skill_Name SEPARATOR '|')
              FROM staff_skill ss JOIN skill sk ON sk.Skill_ID = ss.Skill_ID
             WHERE ss.Staff_ID = st.Staff_ID) AS Skills
      FROM staff st
      JOIN users u ON u.User_ID = st.User_ID
      JOIN staff_workload w ON w.Staff_ID = st.Staff_ID
     ORDER BY st.Full_Name`);
  return ok(rows.map((r) => ({ ...r, Total_Assignments: num(r.Total_Assignments), Skills: r.Skills ? r.Skills.split("|") : [] })));
}, { roles: ORGANIZER });

// Creates the login (users) and the crew profile (staff) together, or neither.
export const POST = handler(async ({ req, session }) => {
  const b = await readJson(req);
  const fullName = needStr(b, "Full_Name", "Full name");
  const username = needStr(b, "Username", "Username", 50);
  const password = needStr(b, "Password", "Temporary password", 72);
  if (password.length < 8) throw new HttpError(400, "Password must be at least 8 characters.");
  const phone = optPhone(b, "Staff_Phone");
  const skills = (Array.isArray(b.skills) ? b.skills : []).map((s) => [
    needInt(s, "Skill_ID", "Skill"),
    needEnum(s, "Proficiency_Level", "Proficiency", ["Beginner", "Intermediate", "Advanced", "Expert"]),
  ]);
  const hash = await bcrypt.hash(password, 10);

  const staffId = await withTransaction(async (c) => {
    const [u] = await c.query("INSERT INTO users (Username, Role, Password_Hash) VALUES (?, 'Staff', ?)", [username, hash]);
    const [s] = await c.query("INSERT INTO staff (Full_Name, Staff_Phone, User_ID) VALUES (?, ?, ?)", [fullName, phone, u.insertId]);
    if (skills.length) await c.query("INSERT INTO staff_skill (Staff_ID, Skill_ID, Proficiency_Level) VALUES ?", [skills.map(([k, p]) => [s.insertId, k, p])]);
    return s.insertId;
  });
  logActivity(session, "staff.created", "staff", staffId, { fullName, username });
  return ok({ Staff_ID: staffId }, 201);
}, { roles: ORGANIZER });
