
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  MapPin,
  Users,
  Award,
  Clock,
  ClipboardList,
  CheckCircle2,
  Search,
  Bell,
  Plus,
  ArrowUpRight,
  Music2,
  Menu,
  X,
  ChevronRight,
  UserCheck,
  Activity,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Events", href: "/events", icon: CalendarDays },
  { name: "Venues & Zones", href: "/venues-zones", icon: MapPin },
  { name: "Volunteers", href: "/volunteers", icon: Users },
  { name: "Skills", href: "/skills", icon: Award },
  { name: "Availability", href: "/availability", icon: Clock },
  { name: "Shifts", href: "/shifts", icon: ClipboardList },
  { name: "Deployments", href: "/deployments", icon: UserCheck },
  { name: "Attendance", href: "/attendance", icon: CheckCircle2 },
];

const events = [
  {
    name: "Summer Beats Festival",
    location: "Phoenix Arena, Bengaluru",
    date: "15 Nov 2026",
    volunteers: 42,
    assigned: 36,
    status: "Upcoming",
    color: "purple",
  },
  {
    name: "Echoes Live",
    location: "Palace Grounds, Bengaluru",
    date: "22 Nov 2026",
    volunteers: 30,
    assigned: 24,
    status: "Planning",
    color: "blue",
  },
  {
    name: "Rhythm Nights",
    location: "Open Air Theatre, Bengaluru",
    date: "28 Nov 2026",
    volunteers: 25,
    assigned: 25,
    status: "Ready",
    color: "green",
  },
];

const activities = [
  {
    title: "New volunteer registered",
    description: "Aarav Sharma joined the volunteer team",
    time: "10 minutes ago",
    icon: Users,
  },
  {
    title: "Deployment confirmed",
    description: "12 volunteers assigned to Stage Management",
    time: "35 minutes ago",
    icon: CheckCircle2,
  },
  {
    title: "New shift created",
    description: "Security shift added for Summer Beats",
    time: "1 hour ago",
    icon: CalendarDays,
  },
  {
    title: "Availability updated",
    description: "8 volunteers updated their availability",
    time: "2 hours ago",
    icon: Clock,
  },
];

const stats = [
  {
    label: "Total Events",
    value: "12",
    change: "+2 this month",
    icon: CalendarDays,
    color: "bg-purple-100 text-purple-700",
  },
  {
    label: "Total Volunteers",
    value: "148",
    change: "+18 this month",
    icon: Users,
    color: "bg-blue-100 text-blue-700",
  },
  {
    label: "Active Shifts",
    value: "24",
    change: "Across 5 events",
    icon: Clock,
    color: "bg-amber-100 text-amber-700",
  },
  {
    label: "Deployments",
    value: "86%",
    change: "Overall completion",
    icon: UserCheck,
    color: "bg-emerald-100 text-emerald-700",
  },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f7f7fb] text-slate-800">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#17152c] text-white transition-transform lg:static lg:translate-x-0 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center gap-3 border-b border-white/10 px-6 py-7">
            <div className="rounded-xl bg-violet-500 p-2.5">
              <Music2 size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">Encore</h1>
              <p className="text-[10px] tracking-[2px] text-violet-300">
                EVENT MANAGEMENT
              </p>
            </div>

            <button
              className="ml-auto lg:hidden"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={21} />
            </button>
          </div>

          <div className="px-4 pt-7">
            <p className="mb-4 px-3 text-[10px] font-semibold tracking-[2px] text-slate-500">
              MAIN MENU
            </p>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = item.name === "Dashboard";

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                      active
                        ? "bg-violet-600 text-white shadow-lg shadow-violet-950/30"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                    {active && (
                      <ChevronRight size={16} className="ml-auto" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Activity size={17} className="text-violet-300" />
                <span className="text-sm font-semibold">
                  Event operations
                </span>
              </div>

              <p className="mb-3 text-xs leading-5 text-slate-400">
                Keep your volunteers and event deployments organized in one
                place.
              </p>

              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[86%] rounded-full bg-violet-400" />
              </div>

              <p className="mt-2 text-xs text-violet-300">
                86% deployment progress
              </p>
            </div>

            <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500 font-bold">
                A
              </div>
              <div>
                <p className="text-sm font-semibold">Admin Organizer</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="min-w-0 flex-1">
          {/* TOP BAR */}
          <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMenuOpen(true)}
                className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>

              <div>
                <p className="text-xs text-slate-400">
                  Workspace / Overview
                </p>
                <h2 className="text-lg font-bold">Dashboard</h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
                <Search size={17} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events..."
                  className="w-32 bg-transparent text-sm outline-none md:w-44"
                />
              </div>

              <button
                className="relative rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50"
                aria-label="Notifications"
              >
                <Bell size={19} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-violet-500" />
              </button>

              <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700 sm:flex">
                A
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] space-y-7 p-5 md:p-8">
            {/* WELCOME */}
            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="mb-1 text-sm font-medium text-violet-600">
                  WEDNESDAY, 4 NOVEMBER 2026
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Welcome back, Organizer!
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Here's what's happening with your events today.
                </p>
              </div>

              <Link
                href="/events"
                className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
              >
                <Plus size={18} />
                Create New Event
              </Link>
            </section>

            {/* STAT CARDS */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-500">
                        {stat.label}
                      </p>
                      <div className={`rounded-xl p-3 ${stat.color}`}>
                        <Icon size={21} />
                      </div>
                    </div>

                    <h3 className="mt-4 text-3xl font-bold text-slate-900">
                      {stat.value}
                    </h3>

                    <p className="mt-2 text-xs font-medium text-slate-400">
                      {stat.change}
                    </p>
                  </div>
                );
              })}
            </section>

            {/* EVENTS AND DEPLOYMENT */}
            <section className="grid gap-6 xl:grid-cols-3">
              {/* EVENT LIST */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm xl:col-span-2">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Upcoming Events
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Manage your upcoming concert operations
                    </p>
                  </div>

                  <Link
                    href="/events"
                    className="flex items-center gap-1 text-sm font-semibold text-violet-600 hover:text-violet-800"
                  >
                    View all <ArrowUpRight size={15} />
                  </Link>
                </div>

                <div className="space-y-3">
                  {filteredEvents.map((event) => (
                    <div
                      key={event.name}
                      className="rounded-xl border border-slate-100 p-4 transition hover:border-violet-200 hover:bg-violet-50/30"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                              event.color === "purple"
                                ? "bg-purple-100 text-purple-700"
                                : event.color === "blue"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            <Music2 size={22} />
                          </div>

                          <div>
                            <h4 className="font-semibold text-slate-800">
                              {event.name}
                            </h4>
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                              <MapPin size={12} />
                              {event.location}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                            event.status === "Upcoming"
                              ? "bg-purple-100 text-purple-700"
                              : event.status === "Ready"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <CalendarDays size={14} />
                            {event.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {event.assigned}/{event.volunteers} assigned
                          </span>
                        </div>

                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-violet-500"
                            style={{
                              width: `${
                                (event.assigned / event.volunteers) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredEvents.length === 0 && (
                    <p className="py-8 text-center text-sm text-slate-400">
                      No matching events found.
                    </p>
                  )}
                </div>
              </div>

              {/* DEPLOYMENT OVERVIEW */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">
                  Deployment Overview
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Volunteer assignment status
                </p>

                <div className="flex flex-col items-center py-7">
                  <div
                    className="relative flex h-40 w-40 items-center justify-center rounded-full"
                    style={{
                      background:
                        "conic-gradient(#8b5cf6 0% 86%, #ede9fe 86% 100%)",
                    }}
                  >
                    <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
                      <span className="text-4xl font-bold text-slate-900">
                        86%
                      </span>
                      <span className="text-xs text-slate-400">
                        Assigned
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    Great progress!
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    127 of 148 volunteers deployed
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                      Assigned
                    </span>
                    <span className="text-sm font-bold">127</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="h-2.5 w-2.5 rounded-full bg-violet-100" />
                      Available
                    </span>
                    <span className="text-sm font-bold">21</span>
                  </div>
                </div>

                <Link
                  href="/deployments"
                  className="mt-6 block w-full rounded-xl border border-violet-200 py-3 text-center text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
                >
                  Manage Deployments
                </Link>
              </div>
            </section>

            {/* RECENT ACTIVITY */}
            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Recent Activity
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Latest updates across your workspace
                  </p>
                </div>
                <Activity size={21} className="text-violet-500" />
              </div>

              <div className="divide-y divide-slate-100">
                {activities.map((activity) => {
                  const Icon = activity.icon;

                  return (
                    <div
                      key={activity.title}
                      className="flex items-center gap-4 py-4"
                    >
                      <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                        <Icon size={19} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-slate-800">
                          {activity.title}
                        </h4>
                        <p className="mt-1 text-xs text-slate-400">
                          {activity.description}
                        </p>
                      </div>

                      <span className="hidden shrink-0 text-xs text-slate-400 sm:block">
                        {activity.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* FOOTER */}
            <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row">
              <p>© 2026 Encore. Concert Volunteer Management System.</p>
              <p>Built for organized event operations.</p>
            </footer>
          </div>
        </main>
      </div>

      {menuOpen && (
        <button
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
    </div>
  );
}
