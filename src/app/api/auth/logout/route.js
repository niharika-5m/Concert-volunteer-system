import { clearSession } from "@/lib/auth";
import { handler, ok } from "@/lib/http";
export const dynamic = "force-dynamic";

export const POST = handler(async () => {
  clearSession();
  return ok({ ok: true });
});
