
"use client";

import { useState } from "react";
import { Search, Plus, ArrowLeft, Music2 } from "lucide-react";
import Link from "next/link";

const content: Record<string, { columns: string[]; rows: string[][] }> = {
  Events: {
    columns: ["Event Name", "Date", "Venue", "Status"],
    rows: [
      ["Summer Beats Festival", "15 Nov 2026", "Phoenix Arena", "Upcoming"],
      ["Echoes Live", "22 Nov 2026", "Palace Grounds", "Planning"],
      ["Rhythm Nights", "28 Nov 2026", "Open Air Theatre", "Ready"]
    ]
  },
  "Venues & Zones": {
    columns: ["Venue", "City", "Zone", "Zone Type"],
    rows: [
      ["Phoenix Arena", "Bengaluru", "Main Stage", "Performance"],
      ["Phoenix Arena", "Bengaluru", "Food Court", "Service"],
      ["Palace Grounds", "Bengaluru", "Entry Gate", "Access"]
    ]
  },
  Volunteers: {
    columns: ["Volunteer", "Phone", "Skill", "Status"],
    rows: [
      ["Aarav Sharma", "9876543210", "Stage Management", "Active"],
      ["Diya Mehta", "9876543211", "First Aid", "Active"],
      ["Rohan Kapoor", "9876543212", "Crowd Management", "Active"]
    ]
  },
  Skills: {
    columns: ["Skill ID", "Skill Name", "Proficiency"],
    rows: [
      ["SK001", "First Aid", "Advanced"],
      ["SK002", "Security", "Intermediate"],
      ["SK003", "Stage Management", "Expert"]
    ]
  },
  Availability: {
    columns: ["Volunteer", "Date", "Time", "Status"],
    rows: [
      ["Aarav Sharma", "15 Nov", "09:00–14:00", "Available"],
      ["Diya Mehta", "15 Nov", "14:00–20:00", "Available"],
      ["Rohan Kapoor", "22 Nov", "10:00–18:00", "Unavailable"]
    ]
  },
  Shifts: {
    columns: ["Shift ID", "Event", "Zone", "Required Staff"],
    rows: [
      ["SH001", "Summer Beats", "Main Stage", "12"],
      ["SH002", "Summer Beats", "Entry Gate", "8"],
      ["SH003", "Echoes Live", "Food Court", "6"]
    ]
  },
  Deployments: {
    columns: ["Assignment ID", "Volunteer", "Shift", "Status"],
    rows: [
      ["AS001", "Aarav Sharma", "SH001", "Assigned"],
      ["AS002", "Diya Mehta", "SH002", "Confirmed"],
      ["AS003", "Rohan Kapoor", "SH003", "Completed"]
    ]
  },
  Attendance: {
    columns: ["Volunteer", "Check In", "Check Out", "Status"],
    rows: [
      ["Aarav Sharma", "09:00 AM", "02:00 PM", "Present"],
      ["Diya Mehta", "09:15 AM", "02:00 PM", "Present"],
      ["Rohan Kapoor", "--", "--", "Pending"]
    ]
  }
};

export default function ModulePage({ title }: { title: string }) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [rows, setRows] = useState(content[title]?.rows ?? []);

  const columns = content[title]?.columns ?? [];
  const filtered = rows.filter(row =>
    row.join(" ").toLowerCase().includes(search.toLowerCase())
  );

  function addRecord(e: React.FormEvent) {
    e.preventDefault();
    setRows([[newName, ...Array(columns.length - 1).fill("To be updated")], ...rows]);
    setNewName("");
    setShowForm(false);
  }

  return (
    <main className="min-h-screen bg-[#f7f7fb]">
      <header className="bg-[#17152c] px-6 py-5 text-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Music2 className="text-violet-400" size={30}/>
          <div>
            <h1 className="text-2xl font-bold">Encore</h1>
            <p className="text-xs tracking-widest text-violet-300">EVENT MANAGEMENT</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl p-6 md:p-10">
        <Link href="/modules" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-violet-600">
          <ArrowLeft size={17}/> All Modules
        </Link>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-violet-600">Encore / Management</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm text-slate-500">
              Manage and monitor {title.toLowerCase()} for your concerts.
            </p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700">
            <Plus size={18}/> Add New
          </button>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3 rounded-xl border p-3">
            <Search size={18} className="text-slate-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${title}...`} className="w-full outline-none"/>
          </div>

          <div className="mb-5 rounded-xl bg-violet-50 p-4">
            <p className="text-sm text-violet-600">Total records</p>
            <p className="text-2xl font-bold text-violet-900">{rows.length}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                  {columns.map(col => <th key={col} className="whitespace-nowrap p-4">{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={i} className="border-b hover:bg-violet-50/40">
                    {row.map((cell, j) => (
                      <td key={j} className="whitespace-nowrap p-4 text-slate-700">
                        {j === row.length - 1
                          ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{cell}</span>
                          : cell}
                      </td>
                    ))}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={columns.length} className="p-8 text-center text-slate-400">No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={addRecord} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold">Add {title}</h3>
            <input required autoFocus value={newName} onChange={e => setNewName(e.target.value)} placeholder={columns[0]} className="w-full rounded-xl border p-3 outline-violet-500"/>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border p-3">Cancel</button>
              <button className="flex-1 rounded-xl bg-violet-600 p-3 font-semibold text-white">Save</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
