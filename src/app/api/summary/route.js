import { query } from "@/lib/db";
import { handler, ok, num, ANY_ROLE } from "@/lib/http";
export const dynamic = "force-dynamic";

export const GET = handler(async ({ session }) => {
  if (session.role === "Organizer") {
    const [s] = await query(`
      SELECT
        (SELECT COUNT(*) FROM event WHERE Status IN ('Upcoming','Ongoing')) AS activeEvents,
        (SELECT COUNT(*) FROM staff) AS crew,
        (SELECT COUNT(*) FROM shift_staffing_status
          WHERE Shift_End >= NOW() AND Assigned_Staff < Required_Staff) AS shiftsNeedingPeople,
        (SELECT COALESCE(SUM(Required_Staff - Assigned_Staff), 0) FROM shift_staffing_status
          WHERE Shift_End >= NOW() AND Assigned_Staff < Required_Staff) AS openSlots`);
    const needing = await query(`
      SELECT Shift_ID, Event_Name, Zone_Name, Shift_Start, Shift_End, Assigned_Staff, Required_Staff
        FROM shift_staffing_status
       WHERE Shift_End >= NOW() AND Assigned_Staff < Required_Staff
       ORDER BY Shift_Start LIMIT 6`);
    const workload = await query(
      "SELECT Staff_ID, Full_Name, Total_Assignments FROM staff_workload ORDER BY Total_Assignments DESC, Full_Name LIMIT 8"
    );
    return ok({
      role: "Organizer",
      stats: { activeEvents: num(s.activeEvents), crew: num(s.crew), shiftsNeedingPeople: num(s.shiftsNeedingPeople), openSlots: num(s.openSlots) },
      needing: needing.map((r) => ({ ...r, Assigned_Staff: num(r.Assigned_Staff), Required_Staff: num(r.Required_Staff) })),
      workload: workload.map((r) => ({ ...r, Total_Assignments: num(r.Total_Assignments) })),
    });
  }

  const [s] = await query(
    `SELECT
        SUM(a.Assignment_Status IN ('Assigned','Confirmed') AND sh.Shift_End >= NOW()) AS upcoming,
        SUM(a.Assignment_Status = 'Assigned' AND sh.Shift_End >= NOW()) AS toConfirm,
        SUM(a.Assignment_Status = 'Completed') AS completed
       FROM assignment a JOIN shift sh ON sh.Shift_ID = a.Shift_ID
      WHERE a.Staff_ID = ?`,
    [session.staffId ?? 0]
  );
  return ok({ role: "Staff", stats: { upcoming: num(s?.upcoming), toConfirm: num(s?.toConfirm), completed: num(s?.completed) } });
}, { roles: ANY_ROLE });
