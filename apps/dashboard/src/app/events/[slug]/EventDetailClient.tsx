"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { EVENT_CATEGORY_LABEL, formatAddress } from "@/lib/catalog";
import type { EventTicket, WellnessEvent } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { Button, EmptyState, ErrorNote } from "@/components/ui";
import { loginUrl } from "@/lib/auth-redirect";

export default function EventDetailClient() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<WellnessEvent | null | undefined>(undefined);
  const [ticket, setTicket] = useState<EventTicket | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!slug) return;
    api
      .eventBySlug(slug)
      .then(setEvent)
      .catch(() => setEvent(null));
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user) return;
    api
      .myEventTickets()
      .then((tickets) => {
        const hit = tickets.find((t) => t.event?.slug === slug);
        setTicket(hit ?? null);
      })
      .catch(() => setTicket(null));
  }, [user, slug]);

  async function register() {
    if (!event) return;
    if (!user) {
      router.push(loginUrl(`/events/${slug}`));
      return;
    }
    setBusy(true);
    setError(null);
    setOkMsg(null);
    try {
      const t = await api.registerForEvent(event.id);
      setTicket(t);
      setOkMsg(
        t.status === "WAITLISTED"
          ? "You’re on the waitlist — we’ll hold a seat if one opens."
          : "You’re in! Ticket linked to your Wellness Pass.",
      );
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register.");
    } finally {
      setBusy(false);
    }
  }

  if (event === undefined) {
    return (
      <LayoutWrapper>
        <div className="page-shell py-16">
          <div className="h-64 animate-pulse rounded-3xl bg-clay/70" />
        </div>
      </LayoutWrapper>
    );
  }

  if (!event) {
    return (
      <LayoutWrapper>
        <div className="page-shell py-16">
          <EmptyState title="Event not found" body="It may have been cancelled or unpublished." />
          <div className="mt-4 text-center">
            <Link href="/events" className="font-bold text-[var(--system-blue)]">
              ← All events
            </Link>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  const place =
    event.venueName ||
    formatAddress(event.address) ||
    formatAddress(event.provider?.address) ||
    (event.isVirtual ? "Online" : "Venue TBA");
  const free = event.isFree || Number(event.price) <= 0;
  const taken = event._count?.tickets ?? 0;
  const full = event.capacity != null && taken >= event.capacity;

  return (
    <LayoutWrapper>
      <article className="page-shell !max-w-3xl pb-20 pt-8">
        <Link href="/events" className="text-sm font-semibold text-ink-muted hover:text-forest">
          ← All events
        </Link>

        <div className="mt-4 overflow-hidden rounded-3xl border border-hairline bg-surface shadow-sm">
          <div className="relative aspect-[21/9] bg-gradient-to-br from-forest to-leaf">
            {event.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={event.coverImageUrl} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="p-6 sm:p-8">
            <span className="inline-flex rounded-full bg-clay px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-forest">
              {EVENT_CATEGORY_LABEL[event.category] ?? event.category}
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold text-forest">{event.title}</h1>
            {event.summary ? (
              <p className="mt-2 text-base font-medium text-ink-secondary">{event.summary}</p>
            ) : null}

            <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">When</dt>
                <dd className="mt-0.5 font-semibold text-forest">
                  {new Date(event.startTime).toLocaleString(undefined, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {" – "}
                  {new Date(event.endTime).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Where</dt>
                <dd className="mt-0.5 font-semibold text-forest">{place}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Host</dt>
                <dd className="mt-0.5 font-semibold text-forest">
                  {event.provider?.businessName ?? "Practice"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Price</dt>
                <dd className="mt-0.5 font-semibold text-forest">
                  {free
                    ? "Free"
                    : new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: event.currency || "AUD",
                      }).format(Number(event.price))}
                  {event.capacity != null ? (
                    <span className="ml-2 font-medium text-ink-muted">
                      · {Math.max(0, event.capacity - taken)} / {event.capacity} seats
                    </span>
                  ) : null}
                </dd>
              </div>
            </dl>

            {event.description ? (
              <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-ink-secondary">
                {event.description}
              </div>
            ) : null}

            {Array.isArray(event.whatToBring) && event.whatToBring.length > 0 ? (
              <div className="mt-6">
                <h2 className="text-sm font-bold text-forest">What to bring</h2>
                <ul className="mt-2 list-inside list-disc text-sm text-ink-secondary">
                  {(event.whatToBring as string[]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-8 rounded-2xl border border-leaf/25 bg-leaf/5 p-4">
              <p className="text-sm font-medium text-forest">
                Your ticket is linked to your <strong>permanent Wellness Pass</strong>. After booking,
                open the Pass in the app or dashboard and present the QR at the door.
              </p>
            </div>

            <ErrorNote message={error} />
            {okMsg ? (
              <p className="mt-3 rounded-xl border border-leaf/30 bg-leaf/10 px-3 py-2 text-sm font-medium text-forest">
                {okMsg}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              {ticket && !["CANCELLED", "REFUNDED"].includes(ticket.status) ? (
                <>
                  <span className="inline-flex min-h-11 items-center rounded-full bg-leaf/15 px-4 text-sm font-bold text-forest">
                    {ticket.status === "WAITLISTED"
                      ? "On waitlist"
                      : ticket.status === "CHECKED_IN"
                        ? "Checked in"
                        : "Registered"}{" "}
                    · #{ticket.code}
                  </span>
                  <Link
                    href="/dashboard/pass"
                    className="inline-flex min-h-11 items-center rounded-full bg-forest px-5 text-sm font-bold text-white"
                  >
                    Open Wellness Pass
                  </Link>
                </>
              ) : (
                <Button type="button" onClick={register} disabled={busy} className="min-h-11 px-6">
                  {busy
                    ? "Booking…"
                    : full
                      ? event.waitlistEnabled
                        ? "Join waitlist"
                        : "Sold out"
                      : free
                        ? "Reserve free spot"
                        : "Get ticket"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </article>
    </LayoutWrapper>
  );
}
