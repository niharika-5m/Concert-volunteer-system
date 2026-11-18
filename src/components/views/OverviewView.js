"use client";
import { getSummary, getAssignments } from "@/lib/api";
import { useLoad } from "@/lib/hooks";
import { fmtRange, parse } from "@/lib/format";
import { Async, Badge, Button, Empty, Panel, Stat, statusTone } from "@/components/ui";
import StaffingBar from "@/components/StaffingBar";

export default function OverviewView({ user, go }) {
  const state = useLoad(async () => {
    const summary = await getSummary();
    const mine = user.role === "Staff" ? await getAssignments() : [];
    return { summary, mine };
  }, [user.role]);

  return (
    <Async state={state}>
      {({ summary, mine }) =>
        summary.role === "Organizer" ? <Organizer s={summary} go={go} /> : <Crew s={summary} mine={mine} go={go} />
      }
    </Async>
  );
}

function Organizer({ s, go }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Active events" value={s.stats.activeEvents} />
        <Stat label="Crew members" value={s.stats.crew} />
        <Stat label="Shifts short of crew" value={s.stats.shiftsNeedingPeople} />
        <Stat label="Open crew seats" value={s.stats.openSlots} />
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <Panel
          title="Shifts that still need people"
          className="lg:col-span-3"
          action={<Button small variant="secondary" onClick={() => go("shifts")}>Open staffing</Button>}
        >
          {s.needing.length === 0 ? (
            <Empty title="Every upcoming shift is fully staffed.">New shifts that need crew will show up here.</Empty>
          ) : (
            <ul className="divide-y divide-mist">
              {s.needing.map((r) => (
                <li key={r.Shift_ID} className="py-3 first:pt-0 last:pb-0">
                  <p className="font-medium">{r.Event_Name}: {r.Zone_Name}</p>
                  <p className="mb-2 text-sm text-ink-soft">{fmtRange(r.Shift_Start, r.Shift_End)}</p>
                  <StaffingBar assigned={r.Assigned_Staff} required={r.Required_Staff} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Crew workload" className="lg:col-span-2">
          {s.workload.length === 0 ? (
            <Empty title="No crew yet.">Add crew members on the Crew screen.</Empty>
          ) : (
            <ul className="space-y-3">
              {s.workload.map((w) => {
                const max = Math.max(...s.workload.map((x) => x.Total_Assignments), 1);
                return (
                  <li key={w.Staff_ID}>
                    <div className="flex justify-between text-sm">
                      <span>{w.Full_Name}</span>
                      <span className="text-ink-soft">{w.Total_Assignments} shift{w.Total_Assignments === 1 ? "" : "s"}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-haze">
                      <div className="h-2 rounded-full bg-ink" style={{ width: `${(w.Total_Assignments / max) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Crew({ s, mine, go }) {
  const upcoming = mine
    .filter((a) => ["Assigned", "Confirmed"].includes(a.Assignment_Status) && parse(a.Shift_End) >= new Date())
    .slice(0, 4);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Upcoming shifts" value={s.stats.upcoming} />
        <Stat label="Waiting for your confirmation" value={s.stats.toConfirm} />
        <Stat label="Shifts completed" value={s.stats.completed} />
      </div>
      <Panel title="Your next shifts" action={<Button small variant="secondary" onClick={() => go("assignments")}>See all</Button>}>
        {upcoming.length === 0 ? (
          <Empty title="You have no upcoming shifts.">Set your availability so organizers can plan around you.</Empty>
        ) : (
          <ul className="divide-y divide-mist">
            {upcoming.map((a) => (
              <li key={a.Assignment_ID} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium">{a.Event_Name}: {a.Zone_Name}</p>
                  <p className="text-sm text-ink-soft">{fmtRange(a.Shift_Start, a.Shift_End)}</p>
                </div>
                <Badge tone={statusTone[a.Assignment_Status]}>{a.Assignment_Status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
