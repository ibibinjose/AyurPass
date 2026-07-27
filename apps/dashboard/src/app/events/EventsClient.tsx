"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { EVENT_CATEGORIES, EVENT_CATEGORY_LABEL, formatAddress } from "@/lib/catalog";
import type { WellnessEvent } from "@/lib/types";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { Button, EmptyState, Input } from "@/components/ui";
import { useNearMe } from "@/hooks/useNearMe";
import { MapPinIcon, SearchIcon, SparkleIcon } from "@/components/icons";

function formatWhen(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const date = s.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const t0 = s.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const t1 = e.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${date} · ${t0}–${t1}`;
}

function priceLabel(ev: WellnessEvent) {
  if (ev.isFree || Number(ev.price) <= 0) return "Free";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: ev.currency || "AUD",
      maximumFractionDigits: 0,
    }).format(Number(ev.price));
  } catch {
    return `${ev.currency} ${ev.price}`;
  }
}

export default function EventsClient() {
  const [events, setEvents] = useState<WellnessEvent[] | null>(null);
  const [error, setError] = useState(false);
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("");
  const [category, setCategory] = useState<string>("");
  const [freeOnly, setFreeOnly] = useState(false);

  const nearMe = useNearMe((r) => setLoc(r.label));

  const load = useCallback(() => {
    setError(false);
    setEvents(null);
    const city = loc.split(",")[0]?.trim();
    api
      .events({
        q: q.trim() || undefined,
        category: category || undefined,
        city: city || undefined,
        free: freeOnly || undefined,
      })
      .then(setEvents)
      .catch(() => {
        setError(true);
        setEvents([]);
      });
  }, [q, loc, category, freeOnly]);

  useEffect(() => {
    const t = window.setTimeout(load, 250);
    return () => window.clearTimeout(t);
  }, [load]);

  const list = useMemo(() => events ?? [], [events]);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of EVENT_CATEGORIES) m.set(c, 0);
    for (const e of list) m.set(e.category, (m.get(e.category) ?? 0) + 1);
    return m;
  }, [list]);

  return (
    <LayoutWrapper>
      <div className="page-shell !max-w-[88rem] pb-16 pt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--system-blue)]">
              Community calendar
            </p>
            <h1 className="type-display mt-1">Wellness events</h1>
            <p className="type-body mt-2 max-w-xl text-[0.9375rem]">
              Workshops, cooking classes, sound baths, open days and more — book with your permanent
              AyurPass and check in with a scan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/pass"
              className="inline-flex min-h-10 items-center rounded-full border border-hairline bg-surface px-4 text-sm font-semibold text-forest hover:border-leaf"
            >
              My Wellness Pass
            </Link>
            <Link
              href="/dashboard/events"
              className="inline-flex min-h-10 items-center rounded-full bg-forest px-4 text-sm font-semibold text-white hover:bg-forest-deep"
            >
              Host an event
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex min-h-11 flex-1 items-center gap-2 rounded-full border border-hairline bg-surface px-4">
              <SearchIcon className="h-4 w-4 text-ink-muted" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search events, cooking class, yoga…"
                className="border-0 bg-transparent px-0 shadow-none focus:ring-0"
                aria-label="Search events"
              />
            </label>
            <label className="flex min-h-11 flex-1 items-center gap-2 rounded-full border border-hairline bg-surface px-4">
              <MapPinIcon className="h-4 w-4 text-ink-muted" />
              <Input
                value={loc}
                onChange={(e) => setLoc(e.target.value)}
                placeholder="City"
                className="border-0 bg-transparent px-0 shadow-none focus:ring-0"
                aria-label="Location"
              />
            </label>
            <Button type="button" variant="ghost" onClick={nearMe.locate} disabled={nearMe.busy}>
              {nearMe.busy ? "Locating…" : "Near me"}
            </Button>
          </div>
          <button
            type="button"
            onClick={() => setFreeOnly((v) => !v)}
            className={`inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-bold ${
              freeOnly ? "bg-leaf text-white" : "border border-hairline bg-surface text-forest"
            }`}
          >
            Free only
          </button>
        </div>
        {nearMe.error ? (
          <p className="mt-2 text-xs font-medium text-red-700">{nearMe.error}</p>
        ) : null}

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategory("")}
            className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold ${
              !category ? "bg-forest text-white" : "border border-hairline bg-surface text-ink-secondary"
            }`}
          >
            All
          </button>
          {EVENT_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c === category ? "" : c)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold ${
                category === c
                  ? "bg-forest text-white"
                  : "border border-hairline bg-surface text-ink-secondary"
              }`}
            >
              {EVENT_CATEGORY_LABEL[c]}
              {counts.get(c) ? (
                <span className="ml-1 opacity-70">{counts.get(c)}</span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {error ? (
            <EmptyState
              title="Couldn’t load events"
              body="Please try again in a moment."
              action={
                <Button type="button" variant="ghost" onClick={load}>
                  Retry
                </Button>
              }
            />
          ) : events === null ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 animate-pulse rounded-2xl bg-clay/70" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <EmptyState
              title="No events match"
              body="Try another category, clear location, or host the first one for your community."
              action={
                <Link href="/dashboard/events" className="font-bold text-[var(--system-blue)]">
                  Host an event →
                </Link>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((ev) => {
                const seats = ev.capacity
                  ? Math.max(0, ev.capacity - (ev._count?.tickets ?? 0))
                  : null;
                const place =
                  ev.venueName ||
                  formatAddress(ev.address) ||
                  formatAddress(ev.provider?.address) ||
                  (ev.isVirtual ? "Online" : "");
                return (
                  <Link
                    key={ev.id}
                    href={`/events/${ev.slug}`}
                    className="card-surface group flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
                  >
                    <div className="relative aspect-[16/9] bg-gradient-to-br from-forest to-leaf">
                      {ev.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ev.coverImageUrl}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-end p-4">
                          <SparkleIcon className="h-8 w-8 text-gold-soft/80" />
                        </div>
                      )}
                      <span className="absolute left-3 top-3 rounded-full bg-surface/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-forest shadow-sm">
                        {EVENT_CATEGORY_LABEL[ev.category] ?? ev.category}
                      </span>
                      <span className="absolute bottom-3 right-3 rounded-full bg-forest/90 px-2.5 py-1 text-xs font-bold text-white">
                        {priceLabel(ev)}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-xs font-semibold text-ink-muted">
                        {formatWhen(ev.startTime, ev.endTime)}
                      </p>
                      <h2 className="mt-1 font-display text-lg font-semibold text-forest line-clamp-2">
                        {ev.title}
                      </h2>
                      {ev.summary ? (
                        <p className="mt-1.5 line-clamp-2 text-sm text-ink-secondary">{ev.summary}</p>
                      ) : null}
                      <p className="mt-2 truncate text-sm font-medium text-ink-muted">
                        {ev.provider?.businessName}
                        {place ? ` · ${place}` : ""}
                      </p>
                      {seats != null ? (
                        <p className="mt-auto pt-3 text-xs font-bold text-leaf">
                          {seats === 0 ? "Waitlist" : `${seats} seats left`}
                        </p>
                      ) : (
                        <p className="mt-auto pt-3 text-xs font-medium text-ink-muted">
                          #{ev.code}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </LayoutWrapper>
  );
}
