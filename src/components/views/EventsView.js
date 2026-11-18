"use client";
import { useState } from "react";
import { getEvents, getLookups, createEvent } from "@/lib/api";
import { useLoad } from "@/lib/hooks";
import { fmtDate } from "@/lib/format";
import { Async, Badge, Button, Empty, Field, Input, Notice, Panel, Select, statusTone } from "@/components/ui";

export default function EventsView({ user }) {
  const organizer = user.role === "Organizer";
  const events = useLoad(getEvents, []);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      {organizer && (
        <>
          <div><Button onClick={() => setOpen((v) => !v)}>{open ? "Close form" : "New event"}</Button></div>
          {open && <EventForm onCreated={() => { setOpen(false); events.reload(); }} />}
        </>
      )}
      <Async state={events}>
        {(rows) =>
          rows.length === 0 ? (
            <Empty title="No events yet.">{organizer ? "Create the first event to start planning shifts." : "Events appear here once an organizer adds them."}</Empty>
          ) : (
            <Panel>
              <div className="-mx-4 overflow-x-auto sm:-mx-5">
                <table className="w-full min-w-[34rem] text-left text-sm">
                  <thead className="text-ink-soft">
                    <tr>
                      <th className="px-4 py-2 font-medium sm:px-5">Event</th>
                      <th className="px-3 py-2 font-medium">Date</th>
                      <th className="px-3 py-2 font-medium">Venue</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">Shifts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mist">
                    {rows.map((e) => (
                      <tr key={e.Event_ID}>
                        <td className="px-4 py-3 font-medium sm:px-5">{e.Event_Name}</td>
                        <td className="px-3 py-3">{fmtDate(e.Event_Date)}</td>
                        <td className="px-3 py-3">{e.Venue_Name}, {e.City}</td>
                        <td className="px-3 py-3"><Badge tone={statusTone[e.Status] || "neutral"}>{e.Status}</Badge></td>
                        <td className="px-3 py-3">{e.Shift_Count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )
        }
      </Async>
    </div>
  );
}

function EventForm({ onCreated }) {
  const lookups = useLoad(getLookups, []);
  const [form, setForm] = useState({ Event_Name: "", Event_Date: "", Venue_ID: "", Status: "Upcoming" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await createEvent({ ...form, Venue_ID: Number(form.Venue_ID) });
      onCreated();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <Panel title="New event">
      <Async state={lookups}>
        {(l) => (
          <form onSubmit={submit} className="space-y-4">
            <Notice>{error}</Notice>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Event name"><Input required maxLength={150} value={form.Event_Name} onChange={(e) => setForm({ ...form, Event_Name: e.target.value })} /></Field>
              <Field label="Date"><Input type="date" required value={form.Event_Date} onChange={(e) => setForm({ ...form, Event_Date: e.target.value })} /></Field>
              <Field label="Venue">
                <Select required value={form.Venue_ID} onChange={(e) => setForm({ ...form, Venue_ID: e.target.value })}>
                  <option value="">Choose a venue</option>
                  {l.venues.map((v) => <option key={v.Venue_ID} value={v.Venue_ID}>{v.Venue_Name}, {v.City}</option>)}
                </Select>
              </Field>
              <Field label="Status">
                <Select value={form.Status} onChange={(e) => setForm({ ...form, Status: e.target.value })}>
                  {["Upcoming", "Ongoing", "Completed", "Cancelled"].map((s) => <option key={s}>{s}</option>)}
                </Select>
              </Field>
            </div>
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Create event"}</Button>
          </form>
        )}
      </Async>
    </Panel>
  );
}
