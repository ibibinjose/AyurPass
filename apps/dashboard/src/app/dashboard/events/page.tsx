"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { EVENT_CATEGORIES, EVENT_CATEGORY_LABEL } from "@/lib/catalog";
import type { EventCategory, WellnessEvent } from "@/lib/types";
import { Button, EmptyState, ErrorNote, Field, Input, Select } from "@/components/ui";

const emptyForm = {
  title: "",
  summary: "",
  description: "",
  category: "COOKING_CLASS" as EventCategory,
  startTime: "",
  endTime: "",
  venueName: "",
  city: "",
  country: "",
  capacity: "",
  price: "0",
  isFree: true,
  isVirtual: false,
  status: "PUBLISHED" as "DRAFT" | "PUBLISHED",
};

export default function ProviderEventsPage() {
  const [events, setEvents] = useState<WellnessEvent[] | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    api
      .myEvents()
      .then(setEvents)
      .catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim() || !form.startTime || !form.endTime) {
      setError("Title and times are required.");
      return;
    }
    setBusy(true);
    try {
      const start = new Date(form.startTime);
      const end = new Date(form.endTime);
      await api.createEvent({
        title: form.title.trim(),
        summary: form.summary.trim() || undefined,
        description: form.description.trim() || undefined,
        category: form.category,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        venueName: form.venueName.trim() || undefined,
        address:
          form.city || form.country
            ? { city: form.city.trim() || undefined, country: form.country.trim() || undefined }
            : undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        price: form.isFree ? 0 : Number(form.price) || 0,
        isFree: form.isFree,
        isVirtual: form.isVirtual,
        status: form.status,
      });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create event.");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish(ev: WellnessEvent) {
    const next = ev.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await api.updateEvent(ev.id, { status: next });
    load();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-forest">Wellness events</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Host workshops, cooking classes, open days and community sessions. Guests check in with
            their permanent AyurPass.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/scan"
            className="inline-flex min-h-10 items-center rounded-full border border-hairline bg-surface px-4 text-sm font-semibold text-forest"
          >
            Scan Pass
          </Link>
          <Button type="button" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Close" : "New event"}
          </Button>
        </div>
      </div>

      {showForm ? (
        <form
          onSubmit={onCreate}
          className="space-y-4 rounded-2xl border border-hairline bg-surface p-5 shadow-sm"
        >
          <Field label="Title">
            <Input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ayurvedic cooking class: evening kitchari"
            />
          </Field>
          <Field label="Category">
            <Select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value as EventCategory }))
              }
            >
              {EVENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {EVENT_CATEGORY_LABEL[c]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Summary">
            <Input
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              placeholder="One-line hook for the card"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Starts">
              <Input
                type="datetime-local"
                required
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              />
            </Field>
            <Field label="Ends">
              <Input
                type="datetime-local"
                required
                value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
              />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Venue name">
              <Input
                value={form.venueName}
                onChange={(e) => setForm((f) => ({ ...f, venueName: e.target.value }))}
                placeholder="Main studio / kitchen"
              />
            </Field>
            <Field label="Capacity">
              <Input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                placeholder="Optional"
              />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="City">
              <Input
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
            </Field>
            <Field label="Country">
              <Input
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              />
            </Field>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.isFree}
                onChange={(e) => setForm((f) => ({ ...f, isFree: e.target.checked }))}
              />
              Free event
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.isVirtual}
                onChange={(e) => setForm((f) => ({ ...f, isVirtual: e.target.checked }))}
              />
              Online / virtual
            </label>
            {!form.isFree ? (
              <Field label="Price">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </Field>
            ) : null}
          </div>
          <Field label="Description">
            <textarea
              className="w-full rounded-xl border border-hairline bg-clay/20 px-3 py-2 text-sm"
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="What guests will experience…"
            />
          </Field>
          <ErrorNote message={error} />
          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>
              {busy ? "Publishing…" : "Publish event"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setForm((f) => ({ ...f, status: "DRAFT" }))}
            >
              Save as draft later via edit
            </Button>
          </div>
        </form>
      ) : null}

      {events === null ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : events.length === 0 ? (
        <EmptyState
          title="No events yet"
          body="Create a cooking class, workshop or open day — seekers discover them on /events."
          action={
            <Button type="button" onClick={() => setShowForm(true)}>
              Create first event
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="flex flex-col gap-3 rounded-2xl border border-hairline bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-clay px-2 py-0.5 text-[10px] font-bold uppercase text-forest">
                    {EVENT_CATEGORY_LABEL[ev.category] ?? ev.category}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      ev.status === "PUBLISHED"
                        ? "bg-leaf/15 text-leaf"
                        : "bg-ink-muted/10 text-ink-muted"
                    }`}
                  >
                    {ev.status}
                  </span>
                  <span className="font-mono text-[10px] text-ink-muted">#{ev.code}</span>
                </div>
                <p className="mt-1 font-display text-lg font-semibold text-forest">{ev.title}</p>
                <p className="text-sm text-ink-muted">
                  {new Date(ev.startTime).toLocaleString()} · {ev._count?.tickets ?? 0} tickets
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/events/${ev.slug}`}
                  className="inline-flex min-h-9 items-center rounded-full border border-hairline px-3 text-xs font-bold text-forest"
                >
                  View
                </Link>
                <button
                  type="button"
                  onClick={() => void togglePublish(ev)}
                  className="inline-flex min-h-9 items-center rounded-full bg-forest px-3 text-xs font-bold text-white"
                >
                  {ev.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
