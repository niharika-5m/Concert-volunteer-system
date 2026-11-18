"use client";
import { useState } from "react";
import { getShifts, getLookups, getCandidates, createShift, createAssignment } from "@/lib/api";
import { useLoad } from "@/lib/hooks";
import { fmtRange } from "@/lib/format";
import { Async, Badge, Button, Empty, Field, Input, Notice, Panel, Select, statusTone } from "@/components/ui";
import StaffingBar from "@/components/StaffingBar";

export default function ShiftsView() {
  const [eventId, setEventId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [openShift, setOpenShift] = useState(null);
  const lookups = useLoad(getLookups, []);
  const shifts = useLoad(() => getShifts(eventId), [eventId]);

  return (
    <div className="space-y-6">
      <Async state={lookups}>
        {(l) => (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <Field label="Show shifts for" className="w-full sm:w-72">
                <Select value={eventId} onChange={(e) => setEventId(e.target.value)}>
                  <option value="">All events</option>
                  {l.events.map((ev) => <option key={ev.Event_ID} value={ev.Event_ID}>{ev.Event_Name}</option>)}
                </Select>
              </Field>
              <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Close form" : "New shift"}</Button>
            </div>
            {showForm && (
              <ShiftForm
                lookups={l}
                defaultEventId={eventId}
                onCreated={() => { setShowForm(false); shifts.reload(); }}
              />
            )}
          </>
        )}
      </Async>

      <Async state={shifts}>
        {(rows) =>
          rows.length === 0 ? (
            <Empty title="No shifts yet.">Create a shift and list the skills it needs.</Empty>
          ) : (
            <div className="space-y-4">
              {rows.map((s) => (
                <Panel key={s.Shift_ID}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{s.Event_Name}: {s.Zone_Name}</h3>
                      <p className="text-sm text-ink-soft">{fmtRange(s.Shift_Start, s.Shift_End)}</p>
                    </div>
                    <Button
                      small
                      variant={openShift === s.Shift_ID ? "secondary" : "primary"}
                      onClick={() => setOpenShift(openShift === s.Shift_ID ? null : s.Shift_ID)}
                    >
                      {openShift === s.Shift_ID ? "Hide crew options" : "Assign crew"}
                    </Button>
                  </div>
                  <div className="mt-4"><StaffingBar assigned={s.Assigned_Staff} required={s.Required_Staff} /></div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-1.5 text-sm font-medium">Skills needed</p>
                      <div className="flex flex-wrap gap-1.5">
                        {s.requirements.map((r) => <Badge key={r.Skill_ID}>{r.Skill_Name} × {r.Required_Count}</Badge>)}
                      </div>
                    </div>
                    <div>
                      <p className="mb-1.5 text-sm font-medium">On this shift</p>
                      {s.crew.length === 0 ? (
                        <p className="text-sm text-ink-soft">Nobody assigned yet.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {s.crew.map((c) => (
                            <span key={c.Assignment_ID} className="inline-flex items-center gap-1.5 rounded-full border border-mist px-2.5 py-0.5 text-xs">
                              {c.Full_Name} <Badge tone={statusTone[c.Assignment_Status]}>{c.Assignment_Status}</Badge>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {openShift === s.Shift_ID && (
                    <CandidatePanel shift={s} onChanged={shifts.reload} />
                  )}
                </Panel>
              ))}
            </div>
          )
        }
      </Async>
    </div>
  );
}

function ShiftForm({ lookups, defaultEventId, onCreated }) {
  const [form, setForm] = useState({ Event_ID: defaultEventId || "", Zone_ID: "", Shift_Start: "", Shift_End: "" });
  const [reqs, setReqs] = useState([{ Skill_ID: "", Required_Count: 1 }]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const event = lookups.events.find((e) => String(e.Event_ID) === String(form.Event_ID));
  const zones = event ? lookups.zones.filter((z) => z.Venue_ID === event.Venue_ID) : [];
  const setReq = (i, patch) => setReqs(reqs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await createShift({
        ...form,
        Event_ID: Number(form.Event_ID),
        Zone_ID: Number(form.Zone_ID),
        requirements: reqs.filter((r) => r.Skill_ID).map((r) => ({ Skill_ID: Number(r.Skill_ID), Required_Count: Number(r.Required_Count) })),
      });
      onCreated();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <Panel title="New shift">
      <form onSubmit={submit} className="space-y-4">
        <Notice>{error}</Notice>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Event">
            <Select required value={form.Event_ID} onChange={(e) => setForm({ ...form, Event_ID: e.target.value, Zone_ID: "" })}>
              <option value="">Choose an event</option>
              {lookups.events.filter((e) => !["Cancelled", "Completed"].includes(e.Status)).map((e) => (
                <option key={e.Event_ID} value={e.Event_ID}>{e.Event_Name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Zone" hint={event ? "Only zones at this event's venue are listed." : "Pick an event first."}>
            <Select required value={form.Zone_ID} onChange={(e) => setForm({ ...form, Zone_ID: e.target.value })} disabled={!event}>
              <option value="">Choose a zone</option>
              {zones.map((z) => <option key={z.Zone_ID} value={z.Zone_ID}>{z.Zone_Name} ({z.Zone_Type})</option>)}
            </Select>
          </Field>
          <Field label="Starts">
            <Input type="datetime-local" required value={form.Shift_Start} onChange={(e) => setForm({ ...form, Shift_Start: e.target.value })} />
          </Field>
          <Field label="Ends">
            <Input type="datetime-local" required min={form.Shift_Start} value={form.Shift_End} onChange={(e) => setForm({ ...form, Shift_End: e.target.value })} />
          </Field>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Skills needed</p>
          <div className="space-y-2">
            {reqs.map((r, i) => (
              <div key={i} className="flex gap-2">
                <Select aria-label="Skill" value={r.Skill_ID} onChange={(e) => setReq(i, { Skill_ID: e.target.value })}>
                  <option value="">Choose a skill</option>
                  {lookups.skills.map((s) => <option key={s.Skill_ID} value={s.Skill_ID}>{s.Skill_Name}</option>)}
                </Select>
                <Input aria-label="How many" type="number" min="1" max="50" className="!w-24" value={r.Required_Count} onChange={(e) => setReq(i, { Required_Count: e.target.value })} />
                {reqs.length > 1 && <Button type="button" variant="secondary" small onClick={() => setReqs(reqs.filter((_, j) => j !== i))}>Remove</Button>}
              </div>
            ))}
          </div>
          <Button type="button" variant="secondary" small className="mt-2" onClick={() => setReqs([...reqs, { Skill_ID: "", Required_Count: 1 }])}>Add another skill</Button>
        </div>
        <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Create shift"}</Button>
      </form>
    </Panel>
  );
}

function CandidatePanel({ shift, onChanged }) {
  const state = useLoad(() => getCandidates(shift.Shift_ID), [shift.Shift_ID]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function assign(staffId) {
    setBusyId(staffId);
    setError("");
    try {
      await createAssignment(staffId, shift.Shift_ID);
      await Promise.all([state.reload(), onChanged()]);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-5 rounded-lg bg-haze p-3 sm:p-4">
      <p className="mb-3 text-sm font-medium">Best fit first: ranked by matching skills, then availability that day.</p>
      <Notice>{error}</Notice>
      <Async state={state}>
        {(rows) => (
          <ul className="mt-2 divide-y divide-mist">
            {rows.map((c) => {
              const blocked = c.Already_On_Shift ? "Already on this shift" : c.Availability === "Unavailable" ? "Unavailable that day" : c.Has_Clash ? "Clashes with another shift" : "";
              return (
                <li key={c.Staff_ID} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-medium">{c.Full_Name}</p>
                    <p className="text-xs text-ink-soft">{c.Skills.length ? c.Skills.join(", ") : "No skills recorded"}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <Badge tone={c.Skill_Matches ? "go" : "neutral"}>Matches {c.Skill_Matches} of {shift.requirements.length} skills</Badge>
                      <Badge tone={c.Availability === "Available" ? "go" : c.Availability === "Unavailable" ? "alarm" : "neutral"}>
                        {c.Availability ?? "Availability not shared"}
                      </Badge>
                      {c.Has_Clash && <Badge tone="alarm">Time clash</Badge>}
                    </div>
                  </div>
                  <Button small disabled={!!blocked || busyId === c.Staff_ID} onClick={() => assign(c.Staff_ID)} title={blocked}>
                    {blocked || (busyId === c.Staff_ID ? "Assigning…" : "Assign")}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </Async>
    </div>
  );
}
