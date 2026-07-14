"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button, ErrorNote, Field, Input } from "@/components/ui";

export default function SettingsPage() {
  const { user, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setSaved(false);
    setError(null);
    try {
      await api.updateUser(user.id, { fullName, phone: phone || undefined });
      await refreshProfile();
      setSaved(true);
    } catch {
      setError("Your details couldn't be saved right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl text-forest">Settings</h1>
      <p className="mt-1 text-ink-muted">Your account details.</p>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 rounded-2xl border border-hairline bg-surface p-6"
      >
        <Field label="Email">
          <Input value={user?.email ?? ""} disabled className="opacity-60" />
        </Field>
        <Field label="Full name">
          <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
        <Field label="Phone" hint="Optional — used for booking reminders.">
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 000 1234"
          />
        </Field>
        <ErrorNote message={error} />
        {saved && (
          <p className="rounded-xl border border-hairline bg-clay/60 px-3.5 py-2.5 text-sm text-forest">
            Saved.
          </p>
        )}
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
