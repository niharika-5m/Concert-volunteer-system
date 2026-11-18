import { recentActivity } from "@/lib/mongo";
import { handler, ok, ORGANIZER } from "@/lib/http";
export const dynamic = "force-dynamic";

export const GET = handler(async () => ok(await recentActivity(50)), { roles: ORGANIZER });
