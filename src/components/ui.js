// Small shared building blocks so every view looks and behaves the same.
const field =
  "w-full rounded-lg border border-mist bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/15 disabled:bg-haze";

export const Input = ({ className = "", ...props }) => <input className={`${field} ${className}`} {...props} />;
export const Select = ({ className = "", children, ...props }) => (
  <select className={`${field} ${className}`} {...props}>{children}</select>
);

export function Field({ label, hint, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-soft">{hint}</span>}
    </label>
  );
}

const buttons = {
  primary: "bg-ink text-white hover:bg-ink/90",
  secondary: "border border-mist bg-white text-ink hover:bg-haze",
  danger: "border border-alarm/40 bg-white text-alarm hover:bg-alarm/5",
  go: "bg-go text-white hover:bg-go/90",
};
export function Button({ variant = "primary", small, className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
      } ${buttons[variant]} ${className}`}
      {...props}
    />
  );
}

export function Panel({ title, action, children, className = "" }) {
  return (
    <section className={`rounded-xl border border-mist bg-white ${className}`}>
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-mist px-4 py-3 sm:px-5">
          <h2 className="text-base font-semibold">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

const tones = {
  neutral: "bg-haze text-ink-soft",
  go: "bg-go/10 text-go",
  beam: "bg-beam/20 text-[#7A5600]",
  alarm: "bg-alarm/10 text-alarm",
  ink: "bg-ink text-white",
};
export const Badge = ({ tone = "neutral", children }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>
);

export const statusTone = {
  Assigned: "beam", Confirmed: "go", Completed: "ink", Cancelled: "alarm",
  Upcoming: "beam", Ongoing: "go", Available: "go", Unavailable: "alarm",
};

export function Notice({ tone = "alarm", children }) {
  if (!children) return null;
  const cls = tone === "go" ? "border-go/30 bg-go/10 text-go" : "border-alarm/30 bg-alarm/5 text-alarm";
  return <p role={tone === "go" ? "status" : "alert"} className={`rounded-lg border px-3 py-2 text-sm ${cls}`}>{children}</p>;
}

export function Stat({ label, value, note }) {
  return (
    <div className="rounded-xl border border-mist bg-white px-4 py-4">
      <p className="text-3xl font-semibold leading-none">{value}</p>
      <p className="mt-2 text-sm text-ink-soft">{label}</p>
      {note && <p className="mt-1 text-xs text-ink-soft">{note}</p>}
    </div>
  );
}

export const Empty = ({ title, children }) => (
  <div className="rounded-lg border border-dashed border-mist px-4 py-8 text-center">
    <p className="font-medium">{title}</p>
    {children && <p className="mt-1 text-sm text-ink-soft">{children}</p>}
  </div>
);

export const Loading = () => <p className="py-6 text-sm text-ink-soft">Loading…</p>;

// Wraps any useLoad() result: shows loading / error / content.
export function Async({ state, children }) {
  if (state.loading && !state.data) return <Loading />;
  if (state.error) {
    return (
      <div className="space-y-2">
        <Notice>{state.error}</Notice>
        <Button variant="secondary" small onClick={state.reload}>Try again</Button>
      </div>
    );
  }
  return children(state.data);
}
