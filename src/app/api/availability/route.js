import { query, withTransaction } from "@/lib/db";
import { logActivity } from "@/lib/mongo";
import { handler, ok, readJson, needDate, needEnum, HttpError, ANY_ROLE } from "@/lib/http";
export const dynamic = "force-dynamic";

export const GET = handler(async ({ session }) => {
  const mine = session.role === "Staff";
  const rows = await query(
    `SELECT av.Availability_ID, av.Available_Date, av.Status, st.Staff_ID, st.Full_Name
       FROM staff_availability sa
       JOIN availability av ON av.Availability_ID = sa.Availability_ID
       JOIN staff st ON st.Staff_ID = sa.Staff_ID
      ${mine ? "WHERE sa.Staff_ID = ?" : ""}
      ORDER BY av.Available_Date DESC, st.Full_Name`,
    mine ? [session.staffId ?? 0] : []
  );
  return ok(rows);
}, { roles: ANY_ROLE });

// Staff set their own availability for a date. Posting the same date again updates it.
export const POST = handler(async ({ req, session }) => {
  if (!session.staffId) throw new HttpError(403, "Only crew members can set availability.");
  const b = await readJson(req);
  const date = needDate(b, "Available_Date", "Date");
  const status = needEnum(b, "Status", "Status", ["Available", "Unavailable"]);

  await withTransaction(async (c) => {
    const [[ex]] = await c.query(
      `SELECT av.Availability_ID FROM staff_availability sa JOIN availability av ON av.Availability_ID = sa.Availability_ID
        WHERE sa.Staff_ID = ? AND av.Available_Date = ? LIMIT 1 FOR UPDATE`,
      [session.staffId, date]);
    if (ex) {
      await c.query("UPDATE availability SET Status = ? WHERE Availability_ID = ?", [status, ex.Availability_ID]);
    } else {
      const [r] = await c.query("INSERT INTO availability (Available_Date, Status) VALUES (?, ?)", [date, status]);
      await c.query("INSERT INTO staff_availability (Staff_ID, Availability_ID) VALUES (?, ?)", [session.staffId, r.insertId]);
    }
  });
  logActivity(session, "availability.set", "availability", session.staffId, { date, status });
  return ok({ ok: true }, 201);
}, { roles: ANY_ROLE });
