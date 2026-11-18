"use client";
import { useState } from "react";
import { getAvailability, setAvailability } from "@/lib/api";
import { useLoad } from "@/lib/hooks";
import { fmtDate } from "@/lib/format";
import { Async, Badge, Button, Empty, Field, Input, Notice, Panel, Select, statusTone } from "@/components/ui";

export default function AvailabilityView({ user }) {
  const state = useLoad(getAvailability, []);
  const [form, setForm] = useState({ date: "", status: "Available" });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSaved("");
    try {
      await setAvailability(form.date, form.status);
      setSaved(`Saved: you're ${form.status.toLowerCase()} on ${fmtDate(form.date)}.`);
      await state.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!user.staffId) return <Notice>Only crew members have availability. Sign in as a crew member to set it.</Notice>;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Panel title="Set availability" className="lg:col-span-2">
        <form onSubmit={submit} className="space-y-4">
          <Notice>{error}</Notice>
          <Notice tone="go">{saved}</Notice>
          <Field label="Date" hint="Choosing a date you've already set updates it.">
            <Input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option>Available</option>
              <option>Unavailable</option>
            </Select>
          </Field>
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save availability"}</Button>
        </form>
      </Panel>
      <Panel title="Your dates" className="lg:col-span-3">
        <Async state={state}>
          {(rows) =>
            rows.length === 0 ? (
              <Empty title="No dates set yet.">Organizers can only plan around days you've shared.</Empty>
            ) : (
              <ul className="divide-y divide-mist">
                {rows.map((r) => (
                  <li key={r.Availability_ID} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <span>{fmtDate(r.Available_Date)}</span>
                    <Badge tone={statusTone[r.Status]}>{r.Status}</Badge>
                  </li>
                ))}
              </ul>
            )
          }
        </Async>
      </Panel>
    </div>
  );
}
