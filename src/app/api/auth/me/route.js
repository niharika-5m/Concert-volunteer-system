import { handler, ok, ANY_ROLE } from "@/lib/http";
export const dynamic = "force-dynamic";

export const GET = handler(async ({ session }) => ok(session), { roles: ANY_ROLE });
