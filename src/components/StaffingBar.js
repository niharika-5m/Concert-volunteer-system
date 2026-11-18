// One segment per required crew seat: dark = filled, dashed amber = still open.
export default function StaffingBar({ assigned, required }) {
  if (!required) return <p className="text-sm text-ink-soft">No requirements set</p>;
  const open = Math.max(required - assigned, 0);
  const full = assigned >= required;
  const seats = Math.min(required, 24);
  const filledSeats = Math.min(assigned, seats);
  return (
    <div>
      <div className="flex gap-1" role="img" aria-label={`${assigned} of ${required} crew seats filled`}>
        {Array.from({ length: seats }, (_, i) => (
          <span
            key={i}
            className={`h-3 flex-1 rounded-sm ${
              i < filledSeats ? (full ? "bg-go" : "bg-ink") : "border border-dashed border-beam bg-beam/15"
            }`}
          />
        ))}
      </div>
      <p className={`mt-1.5 text-xs ${full ? "text-go" : "text-ink-soft"}`}>
        {full ? `Fully staffed (${assigned} of ${required})` : `${assigned} of ${required} filled, ${open} open`}
      </p>
    </div>
  );
}
