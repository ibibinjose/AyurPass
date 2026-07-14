"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Professional } from "@/lib/types";
import { PlusIcon, UsersIcon } from "@/components/icons";
import { Button, EmptyState, ErrorNote, Field, Input } from "@/components/ui";

export default function TeamPage() {
  const { user } = useAuth();
  const provider = user?.provider ?? user?.professional?.provider ?? null;

  const [team, setTeam] = useState<Professional[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [specializations, setSpecializations] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!provider) return;
    api
      .professionalsByProvider(provider.id)
      .then(setTeam)
      .catch(() => setTeam([]));
  }, [provider]);

  useEffect(reload, [reload]);

  if (!provider) {
    return (
      <EmptyState
        title="No practice linked"
        body="Team management is available for provider accounts."
      />
    );
  }

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    if (!provider) return;
    setBusy(true);
    setError(null);
    try {
      const existing = await api.userByEmail(email.trim());
      if (!existing) {
        setError(
          "No AyurPass account exists for that email. Ask your practitioner to register first (as a wellness seeker is fine), then add them here.",
        );
        return;
      }
      await api.createProfessional({
        userId: existing.id,
        providerId: provider.id,
        title: title || undefined,
        specializations: specializations
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setEmail("");
      setTitle("");
      setSpecializations("");
      setShowForm(false);
      reload();
    } catch {
      setError("That practitioner couldn't be added — they may already belong to a practice.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-forest">Team</h1>
          <p className="mt-1 text-ink-muted">The practitioners of {provider.businessName}.</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <PlusIcon className="h-4 w-4" />
            Add practitioner
          </Button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={addMember}
          className="mt-8 space-y-4 rounded-2xl border border-hairline bg-surface p-6"
        >
          <h2 className="font-display text-xl text-forest">Add a practitioner</h2>
          <Field
            label="Their AyurPass email"
            hint="They need an AyurPass account first — any account type works."
          >
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="practitioner@example.com"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Senior Vaidya"
              />
            </Field>
            <Field label="Specialisations" hint="Comma-separated">
              <Input
                value={specializations}
                onChange={(e) => setSpecializations(e.target.value)}
                placeholder="Panchakarma, Pulse diagnosis"
              />
            </Field>
          </div>
          <ErrorNote message={error} />
          <div className="flex gap-3">
            <Button type="submit" disabled={busy}>
              {busy ? "Adding…" : "Add to team"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="mt-8">
        {team === null ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-clay/70" />
            ))}
          </div>
        ) : team.length === 0 && !showForm ? (
          <EmptyState
            title="Just you so far"
            body="Add practitioners to your practice so clients can discover and book the right expert."
          />
        ) : (
          <ul className="space-y-3">
            {team?.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-4 rounded-2xl border border-hairline bg-surface px-5 py-4"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-clay text-forest">
                  <UsersIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {m.user?.fullName ?? m.user?.email ?? "Practitioner"}
                  </p>
                  <p className="truncate text-sm text-ink-muted">
                    {[m.title, m.specializations?.join(" · ")].filter(Boolean).join(" — ") ||
                      "Practitioner"}
                  </p>
                </div>
                {Number(m.reviewCount) > 0 && (
                  <span className="ml-auto shrink-0 text-sm text-ink-secondary">
                    ★ {Number(m.rating).toFixed(1)} ({m.reviewCount})
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
