"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { Button, Field, Input, Notice } from "@/components/ui";
import StaffingBar from "@/components/StaffingBar";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(form.username.trim(), form.password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen md:grid-cols-2">
      <section className="flex flex-col justify-between bg-ink p-8 text-white md:p-12">
        <p className="text-xl font-semibold">Stagehand</p>
        <div className="my-12 max-w-md">
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Every gate, zone and stage covered before doors open.</h1>
          <div className="mt-8 rounded-xl bg-white p-4 text-ink">
            <p className="font-medium">Main Gate</p>
            <p className="mb-3 text-sm text-ink-soft">Rock Night, 8:00 am to 2:00 pm</p>
            <StaffingBar assigned={2} required={3} />
          </div>
        </div>
        <p className="text-sm text-white/60">Concert volunteer and crew deployment</p>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-12">
        <form onSubmit={submit} className="w-full max-w-sm space-y-4">
          <h2 className="text-2xl font-semibold">Sign in</h2>
          <Notice>{error}</Notice>
          <Field label="Username">
            <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="username" required autoFocus />
          </Field>
          <Field label="Password">
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" required />
          </Field>
          <Button type="submit" disabled={busy} className="w-full">{busy ? "Signing in…" : "Sign in"}</Button>
        </form>
      </section>
    </main>
  );
}
