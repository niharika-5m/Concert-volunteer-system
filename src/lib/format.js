// MySQL gives "2027-01-15 08:00:00" / "2027-01-15"; Mongo gives ISO strings.
export function parse(s) {
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T00:00:00`);
  if (/^\d{4}-\d{2}-\d{2} /.test(s)) return new Date(s.replace(" ", "T"));
  return new Date(s);
}
const dateFmt = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
export const fmtDate = (s) => (s ? dateFmt.format(parse(s)) : "");
export const fmtTime = (s) => (s ? timeFmt.format(parse(s)).toLowerCase() : "");
export const fmtStamp = (s) => (s ? `${fmtDate(s)}, ${fmtTime(s)}` : "");
export function fmtRange(start, end) {
  const sameDay = start?.slice(0, 10) === end?.slice(0, 10);
  return sameDay ? `${fmtDate(start)}, ${fmtTime(start)} to ${fmtTime(end)}` : `${fmtStamp(start)} to ${fmtStamp(end)}`;
}
