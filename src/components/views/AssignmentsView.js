"use client";
import { useState } from "react";
import { getAssignments, updateAssignmentStatus, recordAttendance } from "@/lib/api";
import { useLoad } from "@/lib/hooks";
import { fmtRange, fmtTime } from "@/lib/format";
import { Async, Badge, Button, Empty, Field, Notice, Panel, Select, statusTone } from "@/components/ui";

export default function AssignmentsView({ user }) {
  const organizer = user.role === "Organizer";
  const state = useLoad(getAssignments, []);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);

  async function run(key, fn) {
    setBusy(key);
    setError("");
    try {
      await fn();
      await state.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }
  const setStatus = (a, status) => run(`${a.Assignment_ID}:${status}`, () => updateAssignmentStatus(a.Assignment_ID, status));
  const attend = (a, action) => run(`${a.Assignment_ID}:${action}`, () => recordAttendance(a.Assignment_ID, action));

  return (
    <div className="space-y-4">
      <Field label="Filter by status" className="w-full sm:w-60">
        <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          {["Assigned", "Confirmed", "Completed", "Cancelled"].map((s) => <option key={s}>{s}</option>)}
        </Select>
      </Field>
      <Notice>{error}</Notice>
      <Async state={state}>
        {(all) => {
          const rows = filter ? all.filter((a) => a.Assignment_Status === filter) : all;
          if (rows.length === 0) {
            return <Empty title="Nothing here.">{organizer ? "Assign crew from the Shifts and staffing screen." : "When an organizer assigns you to a shift it will appear here."}</Empty>;
          }
          return (
            <Panel>
              <div className="-mx-4 overflow-x-auto sm:-mx-5">
                <table className="w-full min-w-[48rem] text-left text-sm">
                  <thead className="text-ink-soft">
                    <tr>
                      {organizer && <th className="px-4 py-2 font-medium sm:px-5">Crew member</th>}
                      <th className={`py-2 font-medium ${organizer ? "px-3" : "px-4 sm:px-5"}`}>Shift</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">Attendance</th>
                      <th className="px-3 py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mist align-top">
                    {rows.map((a) => {
                      const id = a.Assignment_ID;
                      const b = (k) => busy === `${id}:${k}`;
                      return (
                        <tr key={id}>
                          {organizer && <td className="px-4 py-3 font-medium sm:px-5">{a.Full_Name}</td>}
                          <td className={`py-3 ${organizer ? "px-3" : "px-4 sm:px-5"}`}>
                            <p className="font-medium">{a.Event_Name}: {a.Zone_Name}</p>
                            <p className="text-xs text-ink-soft">{fmtRange(a.Shift_Start, a.Shift_End)}</p>
                          </td>
                          <td className="px-3 py-3"><Badge tone={statusTone[a.Assignment_Status]}>{a.Assignment_Status}</Badge></td>
                          <td className="px-3 py-3 text-xs">
                            {a.Check_in_Time ? <>In {fmtTime(a.Check_in_Time)}{a.Check_out_Time && <>, out {fmtTime(a.Check_out_Time)}</>}</> : <span className="text-ink-soft">Not checked in</span>}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-1.5">
                              {a.Assignment_Status === "Assigned" && (
                                <>
                                  <Button small variant="go" disabled={!!busy} onClick={() => setStatus(a, "Confirmed")}>{b("Confirmed") ? "Saving…" : "Confirm"}</Button>
                                  <Button small variant="danger" disabled={!!busy} onClick={() => setStatus(a, "Cancelled")}>{organizer ? "Cancel" : "Decline"}</Button>
                                </>
                              )}
                              {a.Assignment_Status === "Confirmed" && !a.Check_in_Time && (
                                <Button small disabled={!!busy} onClick={() => attend(a, "check-in")}>{b("check-in") ? "Saving…" : "Check in"}</Button>
                              )}
                              {a.Assignment_Status === "Confirmed" && a.Check_in_Time && !a.Check_out_Time && (
                                <Button small disabled={!!busy} onClick={() => attend(a, "check-out")}>{b("check-out") ? "Saving…" : "Check out"}</Button>
                              )}
                              {organizer && a.Assignment_Status === "Confirmed" && (
                                <>
                                  <Button small variant="secondary" disabled={!!busy} onClick={() => setStatus(a, "Completed")}>Mark completed</Button>
                                  <Button small variant="danger" disabled={!!busy} onClick={() => setStatus(a, "Cancelled")}>Cancel</Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
          );
        }}
      </Async>
    </div>
  );
}
