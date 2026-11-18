import { query, pool } from "@/lib/db";
import { logActivity } from "@/lib/mongo";
import { handler, ok, readJson, needStr, needDate, needInt, needEnum, ANY_ROLE, ORGANIZER } from "@/lib/http";
export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  const rows = await query(`
    SELECT e.Event_ID, e.Event_Name, e.Event_Date, e.Status, e.Venue_ID, v.Venue_Name, v.City,
           (SELECT COUNT(*) FROM shift s WHERE s.Event_ID = e.Event_ID) AS Shift_Count
      FROM event e JOIN venue v ON v.Venue_ID = e.Venue_ID
     ORDER BY e.Event_Date, e.Event_Name`);
  return ok(rows);
}, { roles: ANY_ROLE });

export const POST = handler(async ({ req, session }) => {
  const b = await readJson(req);
  const name = needStr(b, "Event_Name", "Event name", 150);
  const date = needDate(b, "Event_Date", "Event date");
  const status = needEnum(b, "Status", "Status", ["Upcoming", "Ongoing", "Completed", "Cancelled"]);
  const venueId = needInt(b, "Venue_ID", "Venue");
  const [r] = await pool.query(
    "INSERT INTO event (Event_Name, Event_Date, Status, Venue_ID) VALUES (?, ?, ?, ?)",
    [name, date, status, venueId]
  );
  logActivity(session, "event.created", "event", r.insertId, { name, date, status });
  return ok({ Event_ID: r.insertId }, 201);
}, { roles: ORGANIZER });
