import { query, withTransaction } from "@/lib/db";
import { logActivity } from "@/lib/mongo";
import { handler, ok, num, readJson, needInt, needDateTime, HttpError, ORGANIZER } from "@/lib/http";
export const dynamic = "force-dynamic";

export const GET = handler(async ({ req }) => {
  const eventId = Number(new URL(req.url).searchParams.get("eventId")) || null;
  const shifts = await query(
    `SELECT v.Shift_ID, v.Event_Name, v.Zone_Name, v.Shift_Start, v.Shift_End,
            v.Assigned_Staff, v.Required_Staff, s.Event_ID, s.Zone_ID
       FROM shift_staffing_status v JOIN shift s ON s.Shift_ID = v.Shift_ID
       ${eventId ? "WHERE s.Event_ID = ?" : ""}
      ORDER BY v.Shift_Start, v.Shift_ID`,
    eventId ? [eventId] : []
  );
  const ids = shifts.map((s) => s.Shift_ID);
  let reqs = [], crew = [];
  if (ids.length) {
    reqs = await query(
      `SELECT sr.Shift_ID, sr.Skill_ID, sk.Skill_Name, sr.Required_Count
         FROM shift_requirement sr JOIN skill sk ON sk.Skill_ID = sr.Skill_ID
        WHERE sr.Shift_ID IN (?) ORDER BY sk.Skill_Name`, [ids]);
    crew = await query(
      `SELECT a.Shift_ID, a.Assignment_ID, a.Assignment_Status, st.Staff_ID, st.Full_Name
         FROM assignment a JOIN staff st ON st.Staff_ID = a.Staff_ID
        WHERE a.Shift_ID IN (?) AND a.Assignment_Status <> 'Cancelled' ORDER BY st.Full_Name`, [ids]);
  }
  return ok(shifts.map((s) => ({
    ...s,
    Assigned_Staff: num(s.Assigned_Staff),
    Required_Staff: num(s.Required_Staff),
    requirements: reqs.filter((r) => r.Shift_ID === s.Shift_ID),
    crew: crew.filter((c) => c.Shift_ID === s.Shift_ID),
  })));
}, { roles: ORGANIZER });

export const POST = handler(async ({ req, session }) => {
  const b = await readJson(req);
  const eventId = needInt(b, "Event_ID", "Event");
  const zoneId = needInt(b, "Zone_ID", "Zone");
  const start = needDateTime(b, "Shift_Start", "Shift start");
  const end = needDateTime(b, "Shift_End", "Shift end");
  if (end <= start) throw new HttpError(400, "Shift end must be after shift start.");

  const reqs = Array.isArray(b.requirements) ? b.requirements : [];
  if (!reqs.length) throw new HttpError(400, "Add at least one skill requirement.");
  const seen = new Set();
  const clean = reqs.map((r) => {
    const skill = needInt(r, "Skill_ID", "Skill");
    const count = needInt(r, "Required_Count", "Required count");
    if (count > 50) throw new HttpError(400, "Required count can't exceed 50.");
    if (seen.has(skill)) throw new HttpError(400, "Each skill can only be listed once.");
    seen.add(skill);
    return [skill, count];
  });

  const shiftId = await withTransaction(async (c) => {
    const [[ev]] = await c.query("SELECT Status FROM event WHERE Event_ID = ?", [eventId]);
    if (!ev) throw new HttpError(404, "That event doesn't exist.");
    if (["Cancelled", "Completed"].includes(ev.Status)) throw new HttpError(409, `You can't add shifts to a ${ev.Status.toLowerCase()} event.`);
    // Integrity rule: the zone must belong to the event's venue.
    const [[ok1]] = await c.query(
      "SELECT 1 AS x FROM event e JOIN zone z ON z.Venue_ID = e.Venue_ID WHERE e.Event_ID = ? AND z.Zone_ID = ?", [eventId, zoneId]);
    if (!ok1) throw new HttpError(400, "That zone isn't part of the event's venue.");

    const [r] = await c.query("INSERT INTO shift (Shift_Start, Shift_End, Event_ID, Zone_ID) VALUES (?, ?, ?, ?)", [start, end, eventId, zoneId]);
    await c.query("INSERT INTO shift_requirement (Shift_ID, Skill_ID, Required_Count) VALUES ?", [clean.map(([s, n]) => [r.insertId, s, n])]);
    return r.insertId;
  });
  logActivity(session, "shift.created", "shift", shiftId, { eventId, zoneId, start, end });
  return ok({ Shift_ID: shiftId }, 201);
}, { roles: ORGANIZER });
