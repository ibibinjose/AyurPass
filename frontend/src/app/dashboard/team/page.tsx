"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, formatMoney } from "@/lib/api";
import type { Professional } from "@/lib/types";
import { practitionerPath } from "@/lib/paths";
import { PencilIcon, PlusIcon, TrashIcon, UsersIcon } from "@/components/icons";
import { Button, EmptyState, ErrorNote, Field, Input, Textarea } from "@/components/ui";

type FormMode = "add" | "edit";

interface TeamForm {
  mode: FormMode;
  id?: string;
  email: string;
  title: string;
  specializations: string;
  bio: string;
  yearsExperience: string;
  hourlyRate: string;
}

const blankAdd = (): TeamForm => ({
  mode: "add",
  email: "",
  title: "",
  specializations: "",
  bio: "",
  yearsExperience: "",
  hourlyRate: "",
});

function editForm(m: Professional): TeamForm {
  return {
    mode: "edit",
    id: m.id,
    email: m.user?.email ?? "",
    title: m.title ?? "",
    specializations: (m.specializations ?? []).join(", "),
    bio: m.bio ?? "",
    yearsExperience: m.yearsExperience != null ? String(m.yearsExperience) : "",
    hourlyRate: m.hourlyRate != null ? String(m.hourlyRate) : "",
  };
}

export default function TeamPage() {
  const { user } = useAuth();
  const provider = user?.provider ?? user?.professional?.provider ?? null;
  const canManage = user?.role === "PROVIDER_ADMIN" || user?.role === "PLATFORM_ADMIN";

  const [team, setTeam] = useState<Professional[] | null>(null);
  const [form, setForm] = useState<TeamForm | null>(null);
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !provider) return;
    setBusy(true);
    setError(null);
    const specs = form.specializations
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      if (form.mode === "add") {
        const existing = await api.userByEmail(form.email.trim());
        if (!existing) {
          setError(
            "No AyurPass account exists for that email. Ask them to register first, then add them here.",
          );
          return;
        }
        await api.createProfessional({
          userId: existing.id,
          providerId: provider.id,
          title: form.title || undefined,
          specializations: specs,
          bio: form.bio || undefined,
          yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : undefined,
          hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
        });
      } else if (form.id) {
        await api.updateProfessional(form.id, {
          title: form.title || undefined,
          specializations: specs,
          bio: form.bio || undefined,
          yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : undefined,
          hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
        });
      }
      setForm(null);
      reload();
    } catch {
      setError(
        form.mode === "add"
          ? "Couldn't add them — they may already belong to a practice."
          : "Couldn't save changes. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function removeMember(m: Professional) {
    const name = m.user?.fullName ?? m.user?.email ?? "this practitioner";
    if (
      !window.confirm(
        `Remove ${name} from the team? Their past appointments stay, but they won't appear on future calendars.`,
      )
    )
      return;
    setError(null);
    try {
      await api.removeProfessional(m.id);
      reload();
    } catch {
      setError("Couldn't remove team member.");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--system-blue)]">
            Organiser
          </p>
          <h1 className="mt-1 font-display text-3xl text-forest">Team</h1>
          <p className="mt-1 text-ink-muted">
            Practitioners at {provider.businessName}. Assign them on the calendar so multiple
            therapists can work at the same time in different rooms.
          </p>
        </div>
        {canManage && !form && (
          <Button onClick={() => setForm(blankAdd())}>
            <PlusIcon className="h-4 w-4" />
            Add practitioner
          </Button>
        )}
      </div>

      {/* Quick ops */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Link
          href="/dashboard/calendar"
          className="rounded-2xl border border-hairline bg-surface p-4 transition-colors hover:border-leaf"
        >
          <p className="text-sm font-bold text-forest">Staff calendar</p>
          <p className="mt-1 text-xs font-medium text-ink-muted">
            View concurrent sessions by therapist
          </p>
        </Link>
        <Link
          href="/dashboard/rooms"
          className="rounded-2xl border border-hairline bg-surface p-4 transition-colors hover:border-leaf"
        >
          <p className="text-sm font-bold text-forest">Rooms</p>
          <p className="mt-1 text-xs font-medium text-ink-muted">
            Spaces for parallel treatments
          </p>
        </Link>
        <Link
          href="/dashboard/services"
          className="rounded-2xl border border-hairline bg-surface p-4 transition-colors hover:border-leaf"
        >
          <p className="text-sm font-bold text-forest">Sessions</p>
          <p className="mt-1 text-xs font-medium text-ink-muted">
            Bookable offerings for the team
          </p>
        </Link>
      </div>

      {form && (
        <form
          onSubmit={submit}
          className="mt-8 space-y-4 rounded-2xl border border-hairline bg-surface p-6"
        >
          <h2 className="font-display text-xl text-forest">
            {form.mode === "add" ? "Add a practitioner" : "Edit practitioner"}
          </h2>
          {form.mode === "add" ? (
            <Field
              label="Their AyurPass email"
              hint="They need an AyurPass account first — any account type works."
            >
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="practitioner@example.com"
              />
            </Field>
          ) : (
            <p className="text-sm font-medium text-ink-muted">{form.email}</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Senior Vaidya"
              />
            </Field>
            <Field label="Specialisations" hint="Comma-separated">
              <Input
                value={form.specializations}
                onChange={(e) => setForm({ ...form, specializations: e.target.value })}
                placeholder="Panchakarma, Pulse diagnosis"
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Years experience">
              <Input
                type="number"
                min={0}
                value={form.yearsExperience}
                onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })}
                placeholder="8"
              />
            </Field>
            <Field label="Hourly rate (optional)">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.hourlyRate}
                onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                placeholder="120"
              />
            </Field>
          </div>
          <Field label="Bio (optional)">
            <Textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Training, philosophy, languages…"
            />
          </Field>
          <ErrorNote message={error} />
          <div className="flex gap-3">
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : form.mode === "add" ? "Add to team" : "Save changes"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setForm(null)}>
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
        ) : team.length === 0 && !form ? (
          <EmptyState
            title="Just you so far"
            body="Add practitioners so the calendar can show multiple therapists working in parallel — each with their own room."
          />
        ) : (
          <ul className="space-y-3">
            {team?.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-hairline bg-surface px-5 py-4"
              >
                {m.user?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.user.avatarUrl}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-full border border-hairline object-cover"
                  />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-clay text-forest">
                    <UsersIcon className="h-5 w-5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {m.user?.fullName ?? m.user?.email ?? "Practitioner"}
                  </p>
                  <p className="truncate text-sm text-ink-muted">
                    {[m.title, m.specializations?.join(" · ")].filter(Boolean).join(" — ") ||
                      "Practitioner"}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs font-medium text-ink-muted">
                    {m.yearsExperience != null && m.yearsExperience > 0 ? (
                      <span>{m.yearsExperience} yrs exp.</span>
                    ) : null}
                    {m.hourlyRate != null ? (
                      <span>{formatMoney(m.hourlyRate)}/hr</span>
                    ) : null}
                    {m.slug ? <span className="font-mono">@{m.slug}</span> : null}
                  </div>
                </div>
                {Number(m.reviewCount) > 0 && (
                  <span className="shrink-0 text-sm text-ink-secondary">
                    ★ {Number(m.rating).toFixed(1)} ({m.reviewCount})
                  </span>
                )}
                <div className="flex shrink-0 flex-wrap gap-2">
                  {m.slug ? (
                    <Link
                      href={practitionerPath(m)}
                      className="inline-flex min-h-9 items-center rounded-full border border-hairline px-3 text-xs font-semibold text-forest hover:border-leaf"
                    >
                      Public page
                    </Link>
                  ) : null}
                  <Link
                    href={`/dashboard/calendar?view=staff`}
                    className="inline-flex min-h-9 items-center rounded-full border border-hairline px-3 text-xs font-semibold text-forest hover:border-leaf"
                  >
                    On calendar
                  </Link>
                  {canManage ? (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        className="!min-h-9 !px-3 !text-xs"
                        onClick={() => setForm(editForm(m))}
                      >
                        <PencilIcon className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        className="!min-h-9 !px-3 !text-xs"
                        onClick={() => void removeMember(m)}
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
