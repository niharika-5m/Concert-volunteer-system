
"use client";

import { useState } from "react";
import {
  CalendarDays, MapPin, Users, Award, Clock,
  ClipboardList, UserCheck, CheckCircle2, Search, Plus, Music2
} from "lucide-react";

const data = {
  "Events": {
    icon: CalendarDays,
    columns: ["Event Name", "Date", "Venue", "Status"],
    rows: [
      ["Summer Beats Festival", "15 Nov 2026", "Phoenix Arena", "Upcoming"],
      ["Echoes Live", "22 Nov 2026", "Palace Grounds", "Planning"],
      ["Rhythm Nights", "28 Nov 2026", "Open Air Theatre", "Ready"]
    ]
  },
  "Venues & Zones": {
    icon: MapPin,
    columns: ["Venue", "City", "Zone", "Zone Type"],
    rows: [
      ["Phoenix Arena", "Bengaluru", "Main Stage", "Performance"],
      ["Phoenix Arena", "Bengaluru", "Food Court", "Service"],
      ["Palace Grounds", "Bengaluru", "Entry Gate", "Access"]
    ]
  },
  "Volunteers": {
    icon: Users,
    columns: ["Full Name", "Phone", "Skill", "Status"],
    rows: [
      ["Aarav Sharma", "9876543210", "Stage Management", "Active"],
      ["Diya Mehta", "9876543211", "First Aid", "Active"],
      ["Rohan Kapoor", "9876543212", "Crowd Management", "Active"]
    ]
  },
  "Skills": {
    icon: Award,
    columns: ["Skill ID", "Skill Name", "Proficiency"],
    rows: [
      ["SK001", "First Aid", "Advanced"],
      ["SK002", "Security", "Intermediate"],
      ["SK003", "Stage Management", "Expert"]
    ]
  },
  "Availability": {
    icon: Clock,
    columns: ["Volunteer", "Date", "Time", "Status"],
    rows: [
      ["Aarav Sharma", "15 Nov", "09:00–14:00", "Available"],
      ["Diya Mehta", "15 Nov", "14:00–20:00", "Available"],
      ["Rohan Kapoor", "22 Nov", "10:00–18:00", "Unavailable"]
    ]
  },
  "Shifts": {
    icon: ClipboardList,
    columns: ["Shift ID", "Event", "Zone", "Required Staff"],
    rows: [
      ["SH001", "Summer Beats", "Main Stage", "12"],
      ["SH002", "Summer Beats", "Entry Gate", "8"],
      ["SH003", "Echoes Live", "Food Court", "6"]
    ]
  },
  "Deployments": {
    icon: UserCheck,
    columns: ["Assignment ID", "Volunteer", "Shift", "Status"],
    rows: [
      ["AS001", "Aarav Sharma", "SH001", "Assigned"],
      ["AS002", "Diya Mehta", "SH002", "Confirmed"],
      ["AS003", "Rohan Kapoor", "SH003", "Completed"]
    ]
  },
  "Attendance": {
    icon: CheckCircle2,
    columns: ["Volunteer", "Check In", "Check Out", "Status"],
    rows: [
      ["Aarav Sharma", "09:00 AM", "02:00 PM", "Present"],
      ["Diya Mehta", "09:15 AM", "02:00 PM", "Present"],
      ["Rohan Kapoor", "--", "--", "Pending"]
    ]
  }
};

type ModuleName = keyof typeof data;

export default function ModulesPage() {
  const [active, setActive] = useState<ModuleName>("Events");
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState(
    Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, value.rows])
    ) as Record<ModuleName, string[][]>
  );
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");

  const current = data[active];
  const Icon = current.icon;

  const rows = records[active].filter(row =>
    row.join(" ").toLowerCase().includes(search.toLowerCase())
  );

  function addRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    setRecords(prev => ({
      ...prev,
      [active]: [
        [newName, ...Array(current.columns.length - 1).fill("To be updated")],
        ...prev[active]
      ]
    }));

    setNewName("");
    setShowForm(false);
  }

  return (
    <div className="min-h-screen bg-[#f7f7fb]">
      <header className="bg-[#17152c] p-5 text-white">
        <div className="flex items-center gap-3">
          <Music2 size={30} className="text-violet-400"/>
          <div>
            <h1 className="text-2xl font-bold">Encore</h1>
            <p className="text-xs tracking-widest text-violet-300">
              CONCERT VOLUNTEER MANAGEMENT
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-5 md:p-8">
        <div className="mb-7">
          <p className="text-sm text-violet-600">Workspace / Management</p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            Operations Centre
          </h2>
          <p className="mt-2 text-slate-500">
            Manage all your concert operations in one place.
          </p>
        </div>

        <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.keys(data) as ModuleName[]).map(name => {
            const ModuleIcon = data[name].icon;
            return (
              <button
                key={name}
                onClick={() => {
                  setActive(name);
                  setSearch("");
                }}
                className={`flex items-center gap-2 rounded-xl border p-4 text-left text-sm font-semibold transition ${
                  active === name
                    ? "border-violet-500 bg-violet-100 text-violet-800"
                    : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"
                }`}
              >
                <ModuleIcon size={19}/>
                {name}
              </button>
            );
          })}
        </div>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
                <Icon size={24}/>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{active}</h3>
                <p className="text-sm text-slate-400">
                  {records[active].length} records
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"
            >
              <Plus size={18}/> Add New
            </button>
          </div>

          <div className="mb-5 flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3">
            <Search size={18} className="text-slate-400"/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${active}...`}
              className="w-full text-sm outline-none"
            />
          </div>

          <div className="mb-4 flex flex-wrap gap-3">
            <div className="rounded-lg bg-violet-50 px-4 py-3">
              <p className="text-xs text-violet-600">Total Records</p>
              <p className="text-xl font-bold text-violet-900">
                {records[active].length}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">Filtered Results</p>
              <p className="text-xl font-bold">{rows.length}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                  {current.columns.map(col => (
                    <th key={col} className="whitespace-nowrap p-4">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-violet-50/40">
                    {row.map((cell, j) => (
                      <td key={j} className="whitespace-nowrap p-4 text-slate-700">
                        {j === row.length - 1 && (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {cell}
                          </span>
                        )}
                        {j !== row.length - 1 && cell}
                      </td>
                    ))}
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={current.columns.length} className="p-8 text-center text-slate-400">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <form onSubmit={addRecord} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="mb-2 text-xl font-bold">Add {active}</h3>
              <p className="mb-4 text-sm text-slate-500">
                Enter {current.columns[0].toLowerCase()}.
              </p>
              <input
                autoFocus
                required
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder={current.columns[0]}
                className="w-full rounded-xl border p-3 outline-violet-500"
              />
              <div className="mt-5 flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border p-3">
                  Cancel
                </button>
                <button type="submit" className="flex-1 rounded-xl bg-violet-600 p-3 font-semibold text-white">
                  Save Record
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <footer className="border-t bg-white p-5 text-center text-xs text-slate-400">
        © 2026 Encore · Concert Volunteer and Deployment System
      </footer>
    </div>
  );
}
