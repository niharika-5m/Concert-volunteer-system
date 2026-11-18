"use client";
import { getHistory, getActivity } from "@/lib/api";
import { useLoad } from "@/lib/hooks";
import { fmtStamp } from "@/lib/format";
import { Async, Empty, Panel } from "@/components/ui";

export default function ActivityView() {
  const history = useLoad(getHistory, []);
  const feed = useLoad(getActivity, []);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Deployment history (MySQL)">
        <Async state={history}>
          {(rows) =>
            rows.length === 0 ? (
              <Empty title="No deployment changes yet." />
            ) : (
              <ul className="divide-y divide-mist">
                {rows.map((h) => (
                  <li key={h.History_ID} className="py-2.5 first:pt-0 last:pb-0">
                    <p className="text-sm font-medium">{h.Action_Type}: {h.Full_Name}</p>
                    <p className="text-xs text-ink-soft">{h.Event_Name}, {h.Zone_Name} · {fmtStamp(h.Action_Timestamp)}</p>
                  </li>
                ))}
              </ul>
            )
          }
        </Async>
      </Panel>

      <Panel title="Activity feed (MongoDB)">
        <Async state={feed}>
          {({ configured, items }) =>
            !configured ? (
              <Empty title="MongoDB isn't connected.">Set MONGODB_URI in .env.local to see who did what.</Empty>
            ) : items.length === 0 ? (
              <Empty title="No activity logged yet.">Create or update something and it will show up here.</Empty>
            ) : (
              <ul className="divide-y divide-mist">
                {items.map((d) => {
                  // Reads defensively so it still renders if your collection uses other field names.
                  const when = d.at || d.timestamp || d.createdAt;
                  const who = d.actor?.username || d.actor || d.user || "";
                  const { _id, at, timestamp, createdAt, actor, user, action, ...rest } = d;
                  return (
                    <li key={d._id} className="py-2.5 first:pt-0 last:pb-0">
                      <p className="text-sm font-medium">{action || d.type || d.event || "activity"}{who && ` by ${typeof who === "string" ? who : JSON.stringify(who)}`}</p>
                      <p className="break-words text-xs text-ink-soft">
                        {when ? `${fmtStamp(when)} · ` : ""}{JSON.stringify(rest)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )
          }
        </Async>
      </Panel>
    </div>
  );
}
