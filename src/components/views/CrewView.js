"use client";
import { useState } from "react";
import { getStaff, getLookups, createStaff } from "@/lib/api";
import { useLoad } from "@/lib/hooks";
import { Async, Badge, Button, Empty, Field, Input, Notice, Panel, Select } from "@/components/ui";

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

export default function CrewView() {
  const staff = useLoad(getStaff, []);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Field label="Search crew" className="w-full sm:w-72">
          <Input placeholder="Name, username or skill" value={search} onChange={(e) => setSearch(e.target.value)} />
        </Field>
        <Button onClick={() => setOpen((v) => !v)}>{open ? "Close form" : "Add crew member"}</Button>
      </div>
      {open && <CrewForm onCreated={() => { setOpen(false); staff.reload(); }} />}
      <Async state={staff}>
        {(rows) => {
          const q = search.trim().toLowerCase();
          const list = q ? rows.filter((r) => [r.Full_Name, r.Username, ...r.Skills].join(" ").toLowerCase().includes(q)) : rows;
          return list.length === 0 ? (
            <Empty title={rows.length ? "No crew match that search." : "No crew yet."} />
          ) : (
            <Panel>
              <div className="-mx-4 overflow-x-auto sm:-mx-5">
                <table className="w-full min-w-[40rem] text-left text-sm">
                  <thead className="text-ink-soft">
                    <tr>
                      <th className="px-4 py-2 font-medium sm:px-5">Name</th>
                      <th className="px-3 py-2 font-medium">Username</th>
                      <th className="px-3 py-2 font-medium">Phone</th>
                      <th className="px-3 py-2 font-medium">Skills</th>
                      <th className="px-3 py-2 font-medium">Active shifts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mist">
                    {list.map((r) => (
                      <tr key={r.Staff_ID}>
                        <td className="px-4 py-3 font-medium sm:px-5">{r.Full_Name}</td>
                        <td className="px-3 py-3">{r.Username}</td>
                        <td className="px-3 py-3">{r.Staff_Phone || "None"}</td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1.5">{r.Skills.length ? r.Skills.map((s) => <Badge key={s}>{s}</Badge>) : "None"}</div>
                        </td>
                        <td className="px-3 py-3">{r.Total_Assignments}</td>
                      </tr>
                    ))}
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

function CrewForm({ onCreated }) {
  const lookups = useLoad(getLookups, []);
  const [form, setForm] = useState({ Full_Name: "", Username: "", Password: "", Staff_Phone: "" });
  const [levels, setLevels] = useState({}); // { skillId: "Advanced" }
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await createStaff({
        ...form,
        skills: Object.entries(levels).filter(([, l]) => l).map(([id, l]) => ({ Skill_ID: Number(id), Proficiency_Level: l })),
      });
      onCreated();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <Panel title="Add crew member">
      <Async state={lookups}>
        {(l) => (
          <form onSubmit={submit} className="space-y-4">
            <Notice>{error}</Notice>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name"><Input required maxLength={100} value={form.Full_Name} onChange={(e) => setForm({ ...form, Full_Name: e.target.value })} /></Field>
              <Field label="Phone" hint="Optional"><Input type="tel" value={form.Staff_Phone} onChange={(e) => setForm({ ...form, Staff_Phone: e.target.value })} /></Field>
              <Field label="Username"><Input required maxLength={50} autoComplete="off" value={form.Username} onChange={(e) => setForm({ ...form, Username: e.target.value })} /></Field>
              <Field label="Temporary password" hint="At least 8 characters. Stored as a hash, never in plain text.">
                <Input type="password" required minLength={8} maxLength={72} autoComplete="new-password" value={form.Password} onChange={(e) => setForm({ ...form, Password: e.target.value })} />
              </Field>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Skills</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {l.skills.map((s) => (
                  <div key={s.Skill_ID} className="flex items-center justify-between gap-3 rounded-lg border border-mist px-3 py-2">
                    <span className="text-sm">{s.Skill_Name}</span>
                    <Select aria-label={`${s.Skill_Name} level`} className="!w-36" value={levels[s.Skill_ID] || ""} onChange={(e) => setLevels({ ...levels, [s.Skill_ID]: e.target.value })}>
                      <option value="">Not trained</option>
                      {LEVELS.map((lv) => <option key={lv}>{lv}</option>)}
                    </Select>
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Add crew member"}</Button>
          </form>
        )}
      </Async>
    </Panel>
  );
}
