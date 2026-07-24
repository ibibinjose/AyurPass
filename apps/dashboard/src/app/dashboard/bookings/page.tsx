"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError, formatMoney } from "@/lib/api";
import { downloadBookingIcs } from "@/lib/ics";
import { practicePath } from "@/lib/paths";
import type { Booking, EventTicket, PaymentCheckout, ServiceCategory } from "@/lib/types";
import { BookingStatusBadge } from "@/components/BookingStatusBadge";
import { PaymentBadge } from "@/components/PaymentBadge";
import { PayWithStripe } from "@/components/PayWithStripe";
import { DashHeader } from "@/components/dashboard/DashboardKit";
import { Button, EmptyState, ErrorNote } from "@/components/ui";
import {
  useConsumerBookings,
  useInvalidateConsumerBookings,
} from "@/hooks/useConsumerBookings";
import {
  colorForServiceCategory,
  softColorForServiceCategory,
  serviceCategoryColor,
} from "@ayurpass/shared";
import { CATEGORY_LABEL, EVENT_CATEGORY_LABEL } from "@/lib/catalog";

type ViewMode = "month" | "list";
type KindFilter = "all" | "appointments" | "events";

const CATEGORY_FILTERS: { id: ServiceCategory | "ALL" | "EVENT"; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "AYURVEDA", label: "Ayurveda" },
  { id: "YOGA", label: "Yoga" },
  { id: "SPA", label: "Spa" },
  { id: "MEDITATION", label: "Meditation" },
  { id: "FITNESS", label: "Fitness" },
  { id: "CONSULTATION", label: "Consult" },
  { id: "COOKING", label: "Cooking" },
  { id: "NUTRITION", label: "Nutrition" },
  { id: "EVENT", label: "Events" },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
function isCancellable(b: Booking) {
  return (
    (b.status === "PENDING" || b.status === "CONFIRMED") && new Date(b.startTime) > new Date()
  );
}
function friendlyPayError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("stripe onboarding") || m.includes("payment setup")) return message;
  if (m.includes("cancelled")) return "This booking was cancelled and cannot be paid.";
  if (m.includes("already paid")) return "This booking is already paid.";
  return message || "Payment could not be completed. Please try again.";
}

type CalendarItem =
  | { kind: "booking"; at: Date; booking: Booking }
  | { kind: "event"; at: Date; ticket: EventTicket };

export default function BookingsPage() {
  const { user } = useAuth();
  const { data: bookingsData, isLoading } = useConsumerBookings(user?.id);
  const invalidateBookings = useInvalidateConsumerBookings(user?.id);
  const bookings = bookingsData ?? null;

  const [tickets, setTickets] = useState<EventTicket[]>([]);
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [category, setCategory] = useState<(typeof CATEGORY_FILTERS)[number]["id"]>("ALL");
  const [kind, setKind] = useState<KindFilter>("all");
  const [view, setView] = useState<ViewMode>("month");
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [paying, setPaying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [payModal, setPayModal] = useState<{
    booking: Booking;
    payment: PaymentCheckout | null;
  } | null>(null);
  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    api
      .myEventTickets()
      .then(setTickets)
      .catch(() => setTickets([]));
  }, [user]);

  const reload = () => {
    void invalidateBookings();
    if (user) {
      api.myEventTickets().then(setTickets).catch(() => {});
    }
  };

  const items = useMemo(() => {
    const out: CalendarItem[] = [];
    for (const b of bookings ?? []) {
      if (b.status === "CANCELLED") continue;
      out.push({ kind: "booking", at: new Date(b.startTime), booking: b });
    }
    for (const t of tickets) {
      if (!t.event?.startTime) continue;
      if (["CANCELLED", "REFUNDED"].includes(t.status)) continue;
      out.push({ kind: "event", at: new Date(t.event.startTime), ticket: t });
    }
    out.sort((a, b) => +a.at - +b.at);
    return out;
  }, [bookings, tickets]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (kind === "appointments" && item.kind !== "booking") return false;
      if (kind === "events" && item.kind !== "event") return false;
      if (category === "ALL") return true;
      if (category === "EVENT") return item.kind === "event";
      if (item.kind === "booking") {
        return item.booking.service?.category === category;
      }
      // map event categories to filter chips
      const ec = item.ticket.event?.category ?? "";
      if (category === "COOKING") return ec === "COOKING_CLASS";
      if (category === "CONSULTATION") return ec === "COACHING" || ec === "WORKSHOP";
      return ec === category || ec.startsWith(category);
    });
  }, [items, kind, category]);

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const item of filtered) {
      const k = dayKey(item.at);
      const list = map.get(k) ?? [];
      list.push(item);
      map.set(k, list);
    }
    return map;
  }, [filtered]);

  const monthCells = useMemo(() => {
    const first = startOfMonth(monthCursor);
    const startPad = first.getDay();
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(first.getFullYear(), first.getMonth(), d));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [monthCursor]);

  const selectedItems = useMemo(() => {
    return byDay.get(dayKey(selectedDay)) ?? [];
  }, [byDay, selectedDay]);

  const upcomingList = useMemo(() => {
    const now = new Date();
    return filtered.filter((i) => i.at >= now || sameDay(i.at, now)).slice(0, 40);
  }, [filtered]);

  async function cancel(b: Booking) {
    if (!window.confirm(`Cancel “${b.service?.name ?? "this session"}”?`)) return;
    setCancelling(b.id);
    setError(null);
    try {
      await api.updateBooking(b.id, { status: "CANCELLED" });
      if (b.paymentStatus === "paid") await api.refundBooking(b.id).catch(() => {});
      reload();
    } catch (e) {
      setError(
        e instanceof ApiError || e instanceof Error
          ? e.message
          : "Could not cancel this booking.",
      );
    } finally {
      setCancelling(null);
    }
  }

  async function startPay(b: Booking) {
    setPaying(b.id);
    setError(null);
    setPayError(null);
    try {
      const result = await api.payBooking(b.id);
      if (result.payment?.clientSecret && !result.payment.mock) {
        setPayModal({ booking: { ...b, ...result }, payment: result.payment });
      } else if (result.paymentStatus === "paid" || result.payment?.mock) {
        reload();
      } else if (result.payment?.clientSecret) {
        setPayModal({ booking: { ...b, ...result }, payment: result.payment });
      } else {
        reload();
      }
    } catch (e) {
      const msg =
        e instanceof ApiError || e instanceof Error
          ? friendlyPayError(e.message)
          : "Payment could not be started.";
      setError(msg);
      if (msg.toLowerCase().includes("payment setup") || msg.toLowerCase().includes("onboarding")) {
        setPayModal({ booking: b, payment: null });
        setPayError(msg);
      }
    } finally {
      setPaying(null);
    }
  }

  async function confirmStripePay() {
    if (!payModal) return;
    setPayBusy(true);
    setPayError(null);
    try {
      await api.confirmBookingPayment(payModal.booking.id);
      setPayModal(null);
      reload();
    } catch (e) {
      setPayError(
        e instanceof ApiError || e instanceof Error
          ? e.message
          : "Payment succeeded but confirmation failed — contact support if charged.",
      );
    } finally {
      setPayBusy(false);
    }
  }

  const monthLabel = monthCursor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-5">
      <DashHeader
        eyebrow="My wellness"
        title="Calendar"
        description="Month view of appointments and wellness events — colour-coded by discipline."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/events"
              className="inline-flex min-h-10 items-center rounded-full border border-hairline bg-surface px-4 text-sm font-semibold text-forest hover:border-leaf"
            >
              Events
            </Link>
            <Link
              href="/explore"
              className="inline-flex min-h-10 items-center rounded-full bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-deep"
            >
              Book a session
            </Link>
          </div>
        }
      />

      {/* View + kind toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-hairline bg-surface p-0.5">
          {(
            [
              ["all", "Everything"],
              ["appointments", "Appointments"],
              ["events", "Events"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setKind(id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${
                kind === id ? "bg-forest text-white" : "text-ink-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-full border border-hairline bg-surface p-0.5">
          {(
            [
              ["month", "Month"],
              ["list", "List"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${
                view === id ? "bg-forest text-white" : "text-ink-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORY_FILTERS.map((c) => {
          const active = category === c.id;
          const color =
            c.id === "ALL" || c.id === "EVENT"
              ? undefined
              : serviceCategoryColor[c.id] ?? colorForServiceCategory(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                active
                  ? "border-transparent text-white shadow-sm"
                  : "border-hairline bg-surface text-ink-secondary hover:border-leaf/40"
              }`}
              style={active && color ? { backgroundColor: color } : active ? { backgroundColor: "#1e3228" } : undefined}
            >
              {color && !active ? (
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              ) : null}
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Colour legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-hairline bg-surface/90 px-4 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">Colours</p>
        {CATEGORY_FILTERS.filter((c) => c.id !== "ALL" && c.id !== "EVENT").map((c) => (
          <span key={c.id} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-secondary">
            <span
              className="h-2.5 w-2.5 rounded-full ring-1 ring-black/5"
              style={{ backgroundColor: serviceCategoryColor[c.id] ?? "#1e3228" }}
            />
            {c.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-secondary">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--system-blue)] ring-1 ring-black/5" />
          Events
        </span>
      </div>

      <ErrorNote message={error} />

      {view === "month" ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,1fr)]">
          {/* Month grid */}
          <div className="rounded-2xl border border-hairline bg-surface p-3 shadow-sm sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setMonthCursor((m) => addMonths(m, -1))}
                className="rounded-full border border-hairline px-3 py-1.5 text-xs font-bold text-forest hover:bg-clay/40"
              >
                ← Prev
              </button>
              <p className="font-display text-lg font-semibold text-forest">{monthLabel}</p>
              <button
                type="button"
                onClick={() => setMonthCursor((m) => addMonths(m, 1))}
                className="rounded-full border border-hairline px-3 py-1.5 text-xs font-bold text-forest hover:bg-clay/40"
              >
                Next →
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wide text-ink-muted">
              {WEEKDAYS.map((w) => (
                <div key={w} className="py-1">
                  {w}
                </div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {monthCells.map((d, i) => {
                if (!d) {
                  return <div key={`e-${i}`} className="min-h-[3.25rem] rounded-lg bg-clay/20 sm:min-h-[4.25rem]" />;
                }
                const key = dayKey(d);
                const dayItems = byDay.get(key) ?? [];
                const isSel = sameDay(d, selectedDay);
                const isToday = sameDay(d, new Date());
                const dots = [
                  ...new Set(
                    dayItems.map((it) =>
                      it.kind === "booking"
                        ? colorForServiceCategory(it.booking.service?.category)
                        : "#007aff",
                    ),
                  ),
                ].slice(0, 4);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDay(d)}
                    className={`relative flex min-h-[3.25rem] flex-col items-center rounded-lg border p-1 transition-colors sm:min-h-[4.25rem] ${
                      isSel
                        ? "border-forest bg-forest text-white shadow-sm"
                        : isToday
                          ? "border-leaf/40 bg-leaf/10 text-forest"
                          : "border-transparent bg-clay/15 text-foreground hover:bg-clay/40"
                    }`}
                  >
                    <span className={`text-xs font-bold sm:text-sm ${isSel ? "text-white" : ""}`}>
                      {d.getDate()}
                    </span>
                    <div className="mt-auto flex flex-wrap justify-center gap-0.5 pb-0.5">
                      {dots.map((c, di) => (
                        <span
                          key={di}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor: isSel ? "rgba(255,255,255,0.9)" : c,
                          }}
                        />
                      ))}
                    </div>
                    {dayItems.length > 0 ? (
                      <span
                        className={`absolute right-0.5 top-0.5 text-[9px] font-bold tabular-nums ${
                          isSel ? "text-white/80" : "text-ink-muted"
                        }`}
                      >
                        {dayItems.length}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => {
                const t = new Date();
                setMonthCursor(startOfMonth(t));
                setSelectedDay(t);
              }}
              className="mt-3 w-full text-center text-xs font-bold text-[var(--system-blue)] hover:underline"
            >
              Jump to today
            </button>
          </div>

          {/* Selected day detail */}
          <div className="rounded-2xl border border-hairline bg-surface p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">
              {selectedDay.toLocaleDateString(undefined, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-forest">
              {selectedItems.length === 0
                ? "Nothing scheduled"
                : `${selectedItems.length} item${selectedItems.length === 1 ? "" : "s"}`}
            </p>
            <div className="mt-3 max-h-[28rem] space-y-2.5 overflow-y-auto">
              {isLoading && !bookings ? (
                <div className="h-20 animate-pulse rounded-xl bg-clay/60" />
              ) : selectedItems.length === 0 ? (
                <p className="text-sm text-ink-muted">
                  Free day —{" "}
                  <Link href="/explore" className="font-semibold text-[var(--system-blue)]">
                    book a session
                  </Link>{" "}
                  or{" "}
                  <Link href="/events" className="font-semibold text-[var(--system-blue)]">
                    join an event
                  </Link>
                  .
                </p>
              ) : (
                selectedItems.map((item) =>
                  item.kind === "booking" ? (
                    <BookingCard
                      key={item.booking.id}
                      b={item.booking}
                      paying={paying}
                      cancelling={cancelling}
                      onPay={() => void startPay(item.booking)}
                      onCancel={() => void cancel(item.booking)}
                    />
                  ) : (
                    <EventCard key={item.ticket.id} t={item.ticket} />
                  ),
                )
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* List below (or full list view) */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold text-forest">
            {view === "list" ? "All upcoming" : "Upcoming appointments & events"}
          </h2>
          <span className="text-xs font-semibold text-ink-muted">
            {upcomingList.length} shown
          </span>
        </div>
        {isLoading && !bookings ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-clay/70" />
            ))}
          </div>
        ) : upcomingList.length === 0 ? (
          <EmptyState
            title="Nothing coming up"
            body="Book a consultation or join a wellness event — colour-coded here by discipline."
            action={
              <Link
                href="/explore"
                className="inline-flex min-h-10 items-center rounded-full bg-forest px-4 text-sm font-semibold text-white"
              >
                Explore sessions
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3">
            {upcomingList.map((item) =>
              item.kind === "booking" ? (
                <li key={item.booking.id}>
                  <BookingCard
                    b={item.booking}
                    paying={paying}
                    cancelling={cancelling}
                    onPay={() => void startPay(item.booking)}
                    onCancel={() => void cancel(item.booking)}
                  />
                </li>
              ) : (
                <li key={item.ticket.id}>
                  <EventCard t={item.ticket} />
                </li>
              ),
            )}
          </ul>
        )}
      </section>

      {payModal ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-surface p-5 shadow-xl">
            <h3 className="font-display text-lg font-semibold text-forest">
              Pay for {payModal.booking.service?.name ?? "session"}
            </h3>
            {payModal.payment?.clientSecret ? (
              <div className="mt-4">
                <PayWithStripe
                  mock={Boolean(payModal.payment.mock)}
                  clientSecret={payModal.payment.clientSecret}
                  publishableKey={payModal.payment.publishableKey}
                  amountLabel={
                    payModal.booking.totalAmount != null
                      ? formatMoney(payModal.booking.totalAmount)
                      : "now"
                  }
                  busy={payBusy}
                  error={payError}
                  onMockPay={async () => {
                    await confirmStripePay();
                  }}
                  onStripeSuccess={async () => {
                    await confirmStripePay();
                  }}
                  onError={(message) => setPayError(message)}
                />
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink-secondary">{payError || "Payment unavailable."}</p>
            )}
            <ErrorNote message={payError} />
            <button
              type="button"
              className="mt-4 text-sm font-semibold text-ink-muted hover:text-forest"
              onClick={() => setPayModal(null)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BookingCard({
  b,
  paying,
  cancelling,
  onPay,
  onCancel,
}: {
  b: Booking;
  paying: string | null;
  cancelling: string | null;
  onPay: () => void;
  onCancel: () => void;
}) {
  const cat = b.service?.category;
  const bar = colorForServiceCategory(cat);
  const soft = softColorForServiceCategory(cat);
  return (
    <div
      className="rounded-2xl border border-hairline px-4 py-3.5 shadow-[0_1px_0_rgba(36,56,46,0.04)]"
      style={{ borderLeftWidth: 4, borderLeftColor: bar, backgroundColor: soft }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {cat ? (
              <span
                className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                style={{ backgroundColor: bar }}
              >
                {CATEGORY_LABEL[cat as ServiceCategory] ?? cat.replace(/_/g, " ")}
              </span>
            ) : null}
            <span className="rounded-full bg-surface/80 px-2 py-0.5 text-[10px] font-bold uppercase text-ink-muted">
              Appointment
            </span>
          </div>
          <p className="mt-1 font-semibold text-foreground">{b.service?.name ?? "Session"}</p>
          <p className="mt-0.5 text-sm text-ink-muted">
            {b.provider?.businessName ? (
              <>
                <Link
                  href={practicePath({ id: b.provider.id })}
                  className="font-semibold text-forest hover:underline"
                >
                  {b.provider.businessName}
                </Link>
                {" · "}
              </>
            ) : null}
            {new Date(b.startTime).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {b.totalAmount != null ? (
            <span className="text-sm font-semibold tabular-nums">{formatMoney(b.totalAmount)}</span>
          ) : null}
          <BookingStatusBadge status={b.status} />
          <PaymentBadge status={b.paymentStatus} />
          {b.paymentStatus === "unpaid" && b.status !== "CANCELLED" ? (
            <button
              type="button"
              onClick={onPay}
              disabled={paying === b.id}
              className="rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-white hover:bg-forest-deep disabled:opacity-50"
            >
              {paying === b.id ? "…" : "Pay"}
            </button>
          ) : null}
          {isCancellable(b) ? (
            <button
              type="button"
              onClick={onCancel}
              disabled={cancelling === b.id}
              className="rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs font-semibold text-ink-secondary"
            >
              Cancel
            </button>
          ) : null}
          {b.status !== "CANCELLED" ? (
            <button
              type="button"
              onClick={() => downloadBookingIcs(b)}
              className="rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs font-semibold text-ink-secondary"
            >
              .ics
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EventCard({ t }: { t: EventTicket }) {
  const cat = t.event?.category;
  return (
    <Link
      href={t.event?.slug ? `/events/${t.event.slug}` : "/events"}
      className="block rounded-2xl border border-hairline bg-[var(--system-blue)]/5 px-4 py-3.5 shadow-sm transition-shadow hover:shadow-md"
      style={{ borderLeftWidth: 4, borderLeftColor: "#007aff" }}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-[var(--system-blue)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Event
        </span>
        {cat ? (
          <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-bold uppercase text-ink-secondary">
            {EVENT_CATEGORY_LABEL[cat] ?? cat.replace(/_/g, " ")}
          </span>
        ) : null}
        <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-bold text-ink-muted">
          {t.status.replace(/_/g, " ")}
        </span>
      </div>
      <p className="mt-1 font-semibold text-forest">{t.event?.title ?? "Event"}</p>
      <p className="mt-0.5 text-sm text-ink-muted">
        {t.event?.startTime
          ? new Date(t.event.startTime).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : ""}
        {t.event?.provider?.businessName ? ` · ${t.event.provider.businessName}` : ""}
      </p>
    </Link>
  );
}
