import { query } from "@/lib/db";
import { handler, ok, num, HttpError, ORGANIZER } from "@/lib/http";
export const dynamic = "force-dynamic";

// Ranks crew for one shift: skill match, availability that day, clashes with other shifts.
export const GET = handler(async ({ ctx }) => {
  const { id } = await ctx.params;
  const shiftId = Number(id);
  if (!Number.isInteger(shiftId)) throw new HttpError(400, "Invalid shift.");
  const rows = await query(
    `SELECT st.Staff_ID, st.Full_Name,
        (SELECT COUNT(DISTINCT ss.Skill_ID) FROM staff_skill ss
           JOIN shift_requirement sr ON sr.Skill_ID = ss.Skill_ID AND sr.Shift_ID = sh.Shift_ID
          WHERE ss.Staff_ID = st.Staff_ID) AS Skill_Matches,
        (SELECT GROUP_CONCAT(CONCAT(sk.Skill_Name, ' (', ss.Proficiency_Level, ')') SEPARATOR '|')
           FROM staff_skill ss JOIN skill sk ON sk.Skill_ID = ss.Skill_ID
          WHERE ss.Staff_ID = st.Staff_ID) AS Skills,
        (SELECT av.Status FROM staff_availability sa JOIN availability av ON av.Availability_ID = sa.Availability_ID
          WHERE sa.Staff_ID = st.Staff_ID AND av.Available_Date = DATE(sh.Shift_Start)
          ORDER BY av.Availability_ID DESC LIMIT 1) AS Availability,
        EXISTS (SELECT 1 FROM assignment a2 JOIN shift s2 ON s2.Shift_ID = a2.Shift_ID
                 WHERE a2.Staff_ID = st.Staff_ID AND a2.Assignment_Status <> 'Cancelled'
                   AND a2.Shift_ID <> sh.Shift_ID
                   AND s2.Shift_Start < sh.Shift_End AND s2.Shift_End > sh.Shift_Start) AS Has_Clash,
        EXISTS (SELECT 1 FROM assignment a3 WHERE a3.Staff_ID = st.Staff_ID
                   AND a3.Shift_ID = sh.Shift_ID AND a3.Assignment_Status <> 'Cancelled') AS Already_On_Shift
       FROM staff st CROSS JOIN shift sh
      WHERE sh.Shift_ID = ?
      ORDER BY Skill_Matches DESC, st.Full_Name`,
    [shiftId]
  );
  return ok(rows.map((r) => ({
    Staff_ID: r.Staff_ID,
    Full_Name: r.Full_Name,
    Skill_Matches: num(r.Skill_Matches),
    Skills: r.Skills ? r.Skills.split("|") : [],
    Availability: r.Availability, // 'Available' | 'Unavailable' | null (not declared)
    Has_Clash: !!r.Has_Clash,
    Already_On_Shift: !!r.Already_On_Shift,
  })));
}, { roles: ORGANIZER });
