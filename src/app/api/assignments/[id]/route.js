import { withTransaction } from "@/lib/db";
import { logActivity } from "@/lib/mongo";
import { handler, ok, readJson, needEnum, HttpError, ANY_ROLE } from "@/lib/http";
export const dynamic = "force-dynamic";

// Allowed status moves per role.
const ORGANIZER_FLOW = { Assigned: ["Confirmed", "Cancelled"], Confirmed: ["Completed", "Cancelled"] };
const STAFF_FLOW = { Assigned: ["Confirmed", "Cancelled"] }; // confirm or decline their own

export const PATCH = handler(async ({ req, ctx, session }) => {
  const { id } = await ctx.params;
  const assignmentId = Number(id);
  if (!Number.isInteger(assignmentId)) throw new HttpError(400, "Invalid assignment.");
  const next = needEnum(await readJson(req), "status", "Status", ["Confirmed", "Completed", "Cancelled"]);

  await withTransaction(async (c) => {
    const [[a]] = await c.query("SELECT Staff_ID, Assignment_Status FROM assignment WHERE Assignment_ID = ? FOR UPDATE", [assignmentId]);
    if (!a) throw new HttpError(404, "That assignment no longer exists.");
    const organizer = session.role === "Organizer";
    if (!organizer && a.Staff_ID !== session.staffId) throw new HttpError(403, "That isn't your assignment.");
    const flow = organizer ? ORGANIZER_FLOW : STAFF_FLOW;
    if (!flow[a.Assignment_Status]?.includes(next)) {
      throw new HttpError(409, `An assignment that is ${a.Assignment_Status.toLowerCase()} can't be marked ${next.toLowerCase()}.`);
    }
    await c.query("UPDATE assignment SET Assignment_Status = ? WHERE Assignment_ID = ?", [next, assignmentId]);
    await c.query("INSERT INTO deployment_history (Action_Type, Assignment_ID) VALUES (?, ?)", [`Assignment ${next}`, assignmentId]);
  });
  logActivity(session, `assignment.${next.toLowerCase()}`, "assignment", assignmentId);
  return ok({ ok: true });
}, { roles: ANY_ROLE });
