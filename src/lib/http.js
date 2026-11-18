import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const ORGANIZER = ["Organizer"];
export const ANY_ROLE = ["Organizer", "Staff"];
export const ok = (data, status = 200) => NextResponse.json(data, { status });
export const num = (v) => Number(v ?? 0);

// Wraps a route: checks the session + role, converts errors to clean JSON.
// `roles` omitted = public route.
export function handler(fn, { roles } = {}) {
  return async (req, ctx) => {
    try {
      const session = await getSession();
      if (roles) {
        if (!session) throw new HttpError(401, "Please sign in to continue.");
        if (!roles.includes(session.role)) throw new HttpError(403, "Your role can't do this.");
      }
      return await fn({ req, ctx, session });
    } catch (err) {
      return fail(err);
    }
  };
}

function fail(err) {
  if (err instanceof HttpError) return NextResponse.json({ error: err.message }, { status: err.status });
  // Translate MySQL integrity errors into messages a person can act on.
  if (err?.code === "ER_DUP_ENTRY") return NextResponse.json({ error: "That already exists (duplicate value)." }, { status: 409 });
  if (err?.code === "ER_NO_REFERENCED_ROW_2") return NextResponse.json({ error: "A linked record doesn't exist." }, { status: 400 });
  if (err?.code === "ER_ROW_IS_REFERENCED_2") return NextResponse.json({ error: "This record is still in use elsewhere." }, { status: 409 });
  if (err?.errno === 3819 || err?.code === "ER_CHECK_CONSTRAINT_VIOLATED") {
    const rule = err.sqlMessage?.match(/'([^']+)'/)?.[1] || "constraint";
    return NextResponse.json({ error: `The database rejected this value (rule: ${rule}).` }, { status: 400 });
  }
  console.error(err);
  return NextResponse.json({ error: "Something went wrong on the server." }, { status: 500 });
}

export async function readJson(req) {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, "Request body must be valid JSON.");
  }
}

// ---- Input validation (the DB re-checks everything with its own constraints) ----
const bad = (msg) => new HttpError(400, msg);

export function needStr(b, k, label, max = 100) {
  const v = typeof b?.[k] === "string" ? b[k].trim() : "";
  if (!v) throw bad(`${label} is required.`);
  if (v.length > max) throw bad(`${label} must be ${max} characters or fewer.`);
  return v;
}
export function optPhone(b, k) {
  const v = typeof b?.[k] === "string" ? b[k].trim() : "";
  if (!v) return null;
  if (!/^[0-9+\-\s()]{7,20}$/.test(v)) throw bad("Phone number can only contain digits, spaces, + - ( ).");
  return v;
}
export function needInt(b, k, label) {
  const n = Number(b?.[k]);
  if (!Number.isInteger(n) || n <= 0) throw bad(`${label} is required.`);
  return n;
}
export function needEnum(b, k, label, options) {
  const v = b?.[k];
  if (!options.includes(v)) throw bad(`${label} must be one of: ${options.join(", ")}.`);
  return v;
}
export function needDate(b, k, label) {
  const v = b?.[k];
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(v))) throw bad(`${label} must be a valid date.`);
  return v;
}
export function needDateTime(b, k, label) {
  const m = typeof b?.[k] === "string" && b[k].match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(?::(\d{2}))?$/);
  if (!m || Number.isNaN(Date.parse(`${m[1]}T${m[2]}`))) throw bad(`${label} must be a valid date and time.`);
  return `${m[1]} ${m[2]}:${m[3] || "00"}`;
}
