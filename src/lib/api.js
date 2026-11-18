// All client-side calls to the backend live here (GET + POST/PATCH).
// Same-origin by default (Next.js Route Handlers). Set NEXT_PUBLIC_API_BASE_URL
// only if your API runs elsewhere (it must then allow credentialed CORS).
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body, query } = {}) {
  const qs = query
    ? new URLSearchParams(Object.entries(query).filter(([, v]) => v !== "" && v != null)).toString()
    : "";
  const res = await fetch(`${BASE}${path}${qs ? `?${qs}` : ""}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: BASE ? "include" : "same-origin",
    cache: "no-store",
  });
  let data = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith("/api/auth/") && typeof window !== "undefined") {
      window.location.assign("/login");
    }
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status);
  }
  return data;
}

// ---- Auth ----
export const login = (username, password) => request("/api/auth/login", { method: "POST", body: { username, password } });
export const logout = () => request("/api/auth/logout", { method: "POST" });
export const getMe = () => request("/api/auth/me");

// ---- Read (GET) ----
export const getSummary = () => request("/api/summary");
export const getLookups = () => request("/api/lookups");
export const getEvents = () => request("/api/events");
export const getShifts = (eventId) => request("/api/shifts", { query: { eventId } });
export const getCandidates = (shiftId) => request(`/api/shifts/${shiftId}/candidates`);
export const getStaff = () => request("/api/staff");
export const getAssignments = () => request("/api/assignments");
export const getAvailability = () => request("/api/availability");
export const getHistory = () => request("/api/history");
export const getActivity = () => request("/api/activity");

// ---- Create / update (POST, PATCH) ----
export const createEvent = (body) => request("/api/events", { method: "POST", body });
export const createShift = (body) => request("/api/shifts", { method: "POST", body });
export const createStaff = (body) => request("/api/staff", { method: "POST", body });
export const createAssignment = (staffId, shiftId) =>
  request("/api/assignments", { method: "POST", body: { Staff_ID: staffId, Shift_ID: shiftId } });
export const updateAssignmentStatus = (id, status) =>
  request(`/api/assignments/${id}`, { method: "PATCH", body: { status } });
export const setAvailability = (date, status) =>
  request("/api/availability", { method: "POST", body: { Available_Date: date, Status: status } });
export const recordAttendance = (assignmentId, action) =>
  request("/api/attendance", { method: "POST", body: { Assignment_ID: assignmentId, action } });
