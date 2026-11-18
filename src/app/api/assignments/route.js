import { query, withTransaction } from "@/lib/db";
import { logActivity } from "@/lib/mongo";
import { handler, ok, readJson, needInt, HttpError, ANY_ROLE, ORGANIZER } from "@/lib/http";
export const dynamic = "force-dynamic";

// Organizers see everything; crew only ever see their own rows.
export const GET = handler(async ({ session }) => {
  const mine = session.role === "Staff";
  const rows = await query(
    `SELECT a.Assignment_ID, a.Assignment_Status, st.Staff_ID, st.Full_Name,
            s.Shift_ID, s.Shift_Start, s.Shift_End, e.Event_ID, e.Event_Name,
            z.Zone_Name, v.Venue_Name, att.Check_in_Time, att.Check_out_Time
       FROM assignment a
       JOIN staff st ON st.Staff_ID = a.Staff_ID
       JOIN shift s ON s.Shift_ID = a.Shift_ID
       JOIN event e ON e.Event_ID = s.Event_ID
       JOIN zone z ON z.Zone_ID = s.Zone_ID
       JOIN venue v ON v.Venue_ID = e.Venue_ID
       LEFT JOIN attendance att ON att.Assignment_ID = a.Assignment_ID
      ${mine ? "WHERE a.Staff_ID = ?" : ""}
      ORDER BY s.Shift_Start, st.Full_Name`,
    mine ? [session.staffId ?? 0] : []
  );
  return ok(rows);
}, { roles: ANY_ROLE });

// Deploy a crew member to a shift. Rules are checked inside one transaction.
export const POST = handler(async ({ req, session }) => {
  const b = await readJson(req);
  const staffId = needInt(b, "Staff_ID", "Crew member");
  const shiftId = needInt(b, "Shift_ID", "Shift");

  const id = await withTransaction(async (c) => {
    // Lock the shift row so two organizers can't double-book at the same moment.
    const [[shift]] = await c.query("SELECT Shift_ID, Shift_Start, Shift_End FROM shift WHERE Shift_ID = ? FOR UPDATE", [shiftId]);
    if (!shift) throw new HttpError(404, "That shift no longer exists.");
    const [[person]] = await c.query("SELECT Full_Name FROM staff WHERE Staff_ID = ?", [staffId]);
    if (!person) throw new HttpError(404, "That crew member no longer exists.");

    const [[off]] = await c.query(
      `SELECT 1 AS x FROM staff_availability sa JOIN availability av ON av.Availability_ID = sa.Availability_ID
        WHERE sa.Staff_ID = ? AND av.Available_Date = DATE(?) AND av.Status = 'Unavailable' LIMIT 1`,
      [staffId, shift.Shift_Start]);
    if (off) throw new HttpError(409, `${person.Full_Name} marked themselves unavailable on that date.`);

    const [[clash]] = await c.query(
      `SELECT e.Event_Name, z.Zone_Name FROM assignment a
         JOIN shift s ON s.Shift_ID = a.Shift_ID JOIN event e ON e.Event_ID = s.Event_ID JOIN zone z ON z.Zone_ID = s.Zone_ID
        WHERE a.Staff_ID = ? AND a.Assignment_Status <> 'Cancelled' AND a.Shift_ID <> ?
          AND s.Shift_Start < ? AND s.Shift_End > ? LIMIT 1`,
      [staffId, shiftId, shift.Shift_End, shift.Shift_Start]);
    if (clash) throw new HttpError(409, `${person.Full_Name} is already on ${clash.Event_Name} (${clash.Zone_Name}) at that time.`);

    const [[existing]] = await c.query("SELECT Assignment_ID, Assignment_Status FROM assignment WHERE Staff_ID = ? AND Shift_ID = ? FOR UPDATE", [staffId, shiftId]);
    if (existing && existing.Assignment_Status !== "Cancelled") throw new HttpError(409, `${person.Full_Name} is already on this shift.`);

    if (existing) {
      // (Staff_ID, Shift_ID) is UNIQUE, so a cancelled row is re-opened instead of duplicated.
      await c.query("UPDATE assignment SET Assignment_Status = 'Assigned' WHERE Assignment_ID = ?", [existing.Assignment_ID]);
      await c.query("INSERT INTO deployment_history (Action_Type, Assignment_ID) VALUES ('Assignment Reassigned', ?)", [existing.Assignment_ID]);
      return existing.Assignment_ID;
    }
    // The after_assignment_insert trigger writes the 'Assignment Created' history row.
    const [r] = await c.query("INSERT INTO assignment (Assignment_Status, Staff_ID, Shift_ID) VALUES ('Assigned', ?, ?)", [staffId, shiftId]);
    return r.insertId;
  });
  logActivity(session, "assignment.created", "assignment", id, { staffId, shiftId });
  return ok({ Assignment_ID: id }, 201);
}, { roles: ORGANIZER });
