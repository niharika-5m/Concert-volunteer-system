import { query } from "@/lib/db";
import { handler, ok, ORGANIZER } from "@/lib/http";
export const dynamic = "force-dynamic";

// Dropdown data for the organizer's forms.
export const GET = handler(async () => {
  const [venues, zones, skills, events] = await Promise.all([
    query("SELECT Venue_ID, Venue_Name, City FROM venue ORDER BY Venue_Name"),
    query("SELECT Zone_ID, Zone_Name, Zone_Type, Venue_ID FROM zone ORDER BY Zone_Name"),
    query("SELECT Skill_ID, Skill_Name FROM skill ORDER BY Skill_Name"),
    query("SELECT Event_ID, Event_Name, Event_Date, Status, Venue_ID FROM event ORDER BY Event_Date"),
  ]);
  return ok({ venues, zones, skills, events });
}, { roles: ORGANIZER });
