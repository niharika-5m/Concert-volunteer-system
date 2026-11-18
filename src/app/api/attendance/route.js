import { withTransaction } from "@/lib/db";
import { logActivity } from "@/lib/mongo";
import { handler, ok, readJson, needInt, needEnum, HttpError, ANY_ROLE } from "@/lib/http";
export const dynamic = "force-dynamic";

export const POST = handler(async ({ req, session }) => {
  const b = await readJson(req);
  const assignmentId = needInt(b, "Assignment_ID", "Assignment");
  const action = needEnum(b, "action", "Action", ["check-in", "check-out"]);

  await withTransaction(async (c) => {
    const [[a]] = await c.query(
      `SELECT a.Staff_ID, a.Assignment_Status, s.Event_ID, s.Shift_Start, s.Shift_End
         FROM assignment a JOIN shift s ON s.Shift_ID = a.Shift_ID
        WHERE a.Assignment_ID = ? FOR UPDATE`, [assignmentId]);
    if (!a) throw new HttpError(404, "That assignment no longer exists.");
    if (session.role === "Staff" && a.Staff_ID !== session.staffId) throw new HttpError(403, "That isn't your assignment.");
    const [[att]] = await c.query("SELECT Attendance_ID, Check_in_Time, Check_out_Time FROM attendance WHERE Assignment_ID = ? FOR UPDATE", [assignmentId]);

    if (action === "check-in") {
      if (a.Assignment_Status !== "Confirmed") throw new HttpError(409, "Confirm the assignment before checking in.");
      if (att?.Check_in_Time) throw new HttpError(409, "Already checked in.");
      if (process.env.ENFORCE_CHECKIN_WINDOW === "true") {
        const [[w]] = await c.query("SELECT (NOW() BETWEEN DATE_SUB(?, INTERVAL 60 MINUTE) AND ?) AS inside_window", [a.Shift_Start, a.Shift_End]);
        if (!w.inside_window) throw new HttpError(409, "Check-in opens 60 minutes before the shift starts and closes when it ends.");
      }
      if (att) await c.query("UPDATE attendance SET Check_in_Time = NOW() WHERE Attendance_ID = ?", [att.Attendance_ID]);
      else await c.query("INSERT INTO attendance (Check_in_Time, Event_ID, Assignment_ID) VALUES (NOW(), ?, ?)", [a.Event_ID, assignmentId]);
    } else {
      if (!att?.Check_in_Time) throw new HttpError(409, "Check in first.");
      if (att.Check_out_Time) throw new HttpError(409, "Already checked out.");
      // GREATEST keeps check-out strictly after check-in (the table has a CHECK for that).
      await c.query("UPDATE attendance SET Check_out_Time = GREATEST(NOW(), Check_in_Time + INTERVAL 1 SECOND) WHERE Attendance_ID = ?", [att.Attendance_ID]);
      await c.query("UPDATE assignment SET Assignment_Status = 'Completed' WHERE Assignment_ID = ?", [assignmentId]);
      await c.query("INSERT INTO deployment_history (Action_Type, Assignment_ID) VALUES ('Assignment Completed', ?)", [assignmentId]);
    }
  });
  logActivity(session, `attendance.${action}`, "assignment", assignmentId);
  return ok({ ok: true }, 201);
}, { roles: ANY_ROLE });
