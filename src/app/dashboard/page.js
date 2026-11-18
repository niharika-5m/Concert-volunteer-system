"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, logout } from "@/lib/api";
import { Button, Loading } from "@/components/ui";
import OverviewView from "@/components/views/OverviewView";
import ShiftsView from "@/components/views/ShiftsView";
import EventsView from "@/components/views/EventsView";
import CrewView from "@/components/views/CrewView";
import AssignmentsView from "@/components/views/AssignmentsView";
import AvailabilityView from "@/components/views/AvailabilityView";
import ActivityView from "@/components/views/ActivityView";

// Which screens each role can open. The API enforces the same rules server-side.
const NAV = {
  Organizer: [
    { id: "overview", label: "Overview" },
    { id: "shifts", label: "Shifts and staffing" },
    { id: "events", label: "Events" },
    { id: "crew", label: "Crew" },
    { id: "assignments", label: "Assignments" },
    { id: "activity", label: "Activity" },
  ],
  Staff: [
    { id: "overview", label: "Overview" },
    { id: "assignments", label: "My shifts" },
    { id: "availability", label: "My availability" },
    { id: "events", label: "Events" },
  ],
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [view, setView] = useState("overview");

  useEffect(() => {
    getMe().then(setUser).catch(() => router.replace("/login"));
  }, [router]);

  if (!user) return <main className="p-8"><Loading /></main>;

  const nav = NAV[user.role] || NAV.Staff;
  const current = nav.find((n) => n.id === view) || nav[0];
  const props = { user, go: setView };

  async function signOut() {
    await logout().catch(() => {});
    router.replace("/login");
  }

  return (
    <div className="md:flex md:min-h-screen">
      <aside className="bg-ink text-white md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-4 md:block md:px-5 md:py-6">
          <p className="text-xl font-semibold">Stagehand</p>
          <div className="text-right md:mt-6 md:text-left">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-white/60">{user.role === "Organizer" ? "Organizer" : "Crew member"}</p>
          </div>
        </div>
        <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-2 pb-3 md:block md:space-y-1 md:px-3">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              aria-current={current.id === n.id ? "page" : undefined}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition-colors md:block md:w-full ${
                current.id === n.id ? "bg-white text-ink" : "text-white/80 hover:bg-white/10"
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>
        <div className="hidden px-3 py-4 md:block">
          <Button variant="secondary" small className="w-full" onClick={signOut}>Sign out</Button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold">{current.label}</h1>
            <Button variant="secondary" small className="md:hidden" onClick={signOut}>Sign out</Button>
          </div>
          {current.id === "overview" && <OverviewView {...props} />}
          {current.id === "shifts" && <ShiftsView {...props} />}
          {current.id === "events" && <EventsView {...props} />}
          {current.id === "crew" && <CrewView {...props} />}
          {current.id === "assignments" && <AssignmentsView {...props} />}
          {current.id === "availability" && <AvailabilityView {...props} />}
          {current.id === "activity" && <ActivityView {...props} />}
        </div>
      </main>
    </div>
  );
}
