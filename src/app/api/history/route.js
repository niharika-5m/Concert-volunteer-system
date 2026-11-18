import { query } from "@/lib/db";
import { handler, ok, ORGANIZER } from "@/lib/http";
export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  const rows = await query(`
    SELECT h.History_ID, h.Action_Type, h.Action_Timestamp, h.Assignment_ID,
           st.Full_Name, e.Event_Name, z.Zone_Name
      FROM deployment_history h
      JOIN assignment a ON a.Assignment_ID = h.Assignment_ID
      JOIN staff st ON st.Staff_ID = a.Staff_ID
      JOIN shift s ON s.Shift_ID = a.Shift_ID
      JOIN event e ON e.Event_ID = s.Event_ID
      JOIN zone z ON z.Zone_ID = s.Zone_ID
     ORDER BY h.Action_Timestamp DESC, h.History_ID DESC LIMIT 100`);
  return ok(rows);
}, { roles: ORGANIZER });
