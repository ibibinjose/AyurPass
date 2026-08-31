"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError, formatMoney } from "@/lib/api";
import { downloadBookingIcs, getBookingVideoUrl } from "@/lib/ics";
import { practicePath } from "@/lib/paths";
import { nextDays, slotsForDay, type SlotOption } from "@/lib/slots";
import type { Booking, EventTicket, PaymentCheckout, ServiceCategory } from "@/lib/types";
import { BookingStatusBadge } from "@/components/BookingStatusBadge";
import { PaymentBadge } from "@/components/PaymentBadge";
import { PayWithStripe } from "@/components/PayWithStripe";
import { EmptyState, ErrorNote } from "@/components/ui";
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
import {
  CalendarIcon,
  SearchIcon,
  CheckCircleIcon,
  XIcon,
  ArrowRightIcon,
  SparkleIcon,
} from "@/components/icons";

type ViewMode = "month" | "week" | "list";
type KindFilter = "all" | "appointments" | "events";
type StatusFilter = "all" | "confirmed" | "pending" | "unpaid";

const CATEGORY_FILTERS: { id: ServiceCategory | "ALL" | "EVENT"; label: string }[] = [
  { id: "ALL", label: "All Disciplines" },
  { id: "AYURVEDA", label: "Ayurveda" },
  { id: "YOGA", label: "Yoga" },
  { id: "SPA", label: "Spa & Body" },
  { id: "MEDITATION", label: "Meditation" },
  { id: "FITNESS", label: "Movement & Fitness" },
  { id: "CONSULTATION", label: "Consultation" },
  { id: "COOKING", label: "Ayurvedic Culinary" },
  { id: "NUTRITION", label: "Diet & Nutrition" },
  { id: "EVENT", label: "Events & Workshops" },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const OPEN_HOUR = 8;
const CLOSE_HOUR = 20;
const HOUR_PX = 56;
const hours = Array.from({ length: CLOSE_HOUR - OPEN_HOUR }, (_, i) => OPEN_HOUR + i);

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function startOfWeekSunday(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  date.setDate(date.getDate() - date.getDay());
  return date;
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
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

function bookingTop(start: Date) {
  return (start.getHours() + start.getMinutes() / 60 - OPEN_HOUR) * HOUR_PX;
}

function bookingHeight(start: Date, end: Date) {
  return Math.max(30, ((end.getTime() - start.getTime()) / 3_600_000) * HOUR_PX - 2);
}

export type CalendarItem =
  | { kind: "booking"; at: Date; booking: Booking }
  | { kind: "event"; at: Date; ticket: EventTicket };

export default function BookingsPage() {
  const { user } = useAuth();
  const { data: bookingsData, isLoading } = useConsumerBookings(user?.id);
  const invalidateBookings = useInvalidateConsumerBookings(user?.id);
  const bookings = bookingsData ?? null;

  const [tickets, setTickets] = useState<EventTicket[]>([]);
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  const [weekCursor, setWeekCursor] = useState(() => startOfWeekSunday(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [category, setCategory] = useState<(typeof CATEGORY_FILTERS)[number]["id"]>("ALL");
  const [kind, setKind] = useState<KindFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<ViewMode>("month");
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [paying, setPaying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inspectedItem, setInspectedItem] = useState<CalendarItem | null>(null);
  const [payModal, setPayModal] = useState<{
    booking: Booking;
    payment: PaymentCheckout | null;
  } | null>(null);
  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const [reschedulingBooking, setReschedulingBooking] = useState<Booking | null>(null);
  const rescheduleDays = useMemo(() => nextDays(14), []);
  const [rescheduleDayIso, setRescheduleDayIso] = useState(rescheduleDays[0].iso);
  const [rescheduleSlot, setRescheduleSlot] = useState<SlotOption | null>(null);
  const [rescheduleBusy, setRescheduleBusy] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const selectedRescheduleDay =
    rescheduleDays.find((d) => d.iso === rescheduleDayIso) ?? rescheduleDays[0];
  const rescheduleDuration = reschedulingBooking?.service?.durationMinutes ?? 60;
  const rescheduleBuffer =
    Number((reschedulingBooking?.service?.doshaCompatibility as Record<string, unknown>)?.bufferMinutes) || 0;
  const rescheduleSlots = useMemo(
    () =>
      reschedulingBooking
        ? slotsForDay(selectedRescheduleDay.date, rescheduleDuration, rescheduleBuffer)
        : [],
    [reschedulingBooking, selectedRescheduleDay, rescheduleDuration, rescheduleBuffer],
  );

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
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (kind === "appointments" && item.kind !== "booking") return false;
      if (kind === "events" && item.kind !== "event") return false;

      if (statusFilter === "confirmed") {
        if (item.kind === "booking" && item.booking.status !== "CONFIRMED") return false;
        if (item.kind === "event" && ["CANCELLED", "REFUNDED"].includes(item.ticket.status)) return false;
      } else if (statusFilter === "pending") {
        if (item.kind === "booking" && item.booking.status !== "PENDING") return false;
      } else if (statusFilter === "unpaid") {
        if (item.kind === "booking" && item.booking.paymentStatus !== "unpaid") return false;
      }

      if (category !== "ALL") {
        if (category === "EVENT" && item.kind !== "event") return false;
        if (item.kind === "booking") {
          if (item.booking.service?.category !== category) return false;
        } else {
          const ec = item.ticket.event?.category ?? "";
          if (category === "COOKING" && ec !== "COOKING_CLASS") return false;
          if (category === "CONSULTATION" && ec !== "COACHING" && ec !== "WORKSHOP") return false;
          if (
            category !== "COOKING" &&
            category !== "CONSULTATION" &&
            category !== "EVENT" &&
            !ec.startsWith(category)
          ) {
            return false;
          }
        }
      }

      if (q) {
        if (item.kind === "booking") {
          const title = (item.booking.service?.name ?? "").toLowerCase();
          const provider = (item.booking.provider?.businessName ?? "").toLowerCase();
          const notes = (item.booking.notes ?? "").toLowerCase();
          if (!title.includes(q) && !provider.includes(q) && !notes.includes(q)) return false;
        } else {
          const title = (item.ticket.event?.title ?? "").toLowerCase();
          const provider = (item.ticket.event?.provider?.businessName ?? "").toLowerCase();
          if (!title.includes(q) && !provider.includes(q)) return false;
        }
      }

      return true;
    });
  }, [items, kind, category, statusFilter, searchQuery]);

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

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekCursor, i));
  }, [weekCursor]);

  const selectedItems = useMemo(() => {
    return byDay.get(dayKey(selectedDay)) ?? [];
  }, [byDay, selectedDay]);

  const upcomingList = useMemo(() => {
    const now = new Date();
    return filtered.filter((i) => i.at >= now || sameDay(i.at, now)).slice(0, 50);
  }, [filtered]);

  async function cancel(b: Booking) {
    const hoursToStart = (new Date(b.startTime).getTime() - Date.now()) / 3_600_000;
    const policyPrompt =
      hoursToStart < 24
        ? `⚠️ Cancellation Policy Notice:\nThis session is in less than 24 hours (${Math.max(1, Math.round(hoursToStart))}h away).\n\nLate cancellations are subject to the clinic's policy and non-refundable deposit terms.\n\nProceed to cancel “${b.service?.name ?? "this session"}”?`
        : `Cancel “${b.service?.name ?? "this session"}”? Free cancellation is available up to 24 hours prior.`;

    if (!window.confirm(policyPrompt)) return;
    setCancelling(b.id);
    setError(null);
    try {
      await api.updateBooking(b.id, { status: "CANCELLED" });
      if (b.paymentStatus === "paid") await api.refundBooking(b.id).catch(() => {});
      if (inspectedItem?.kind === "booking" && inspectedItem.booking.id === b.id) {
        setInspectedItem(null);
      }
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

  function startReschedule(b: Booking) {
    setReschedulingBooking(b);
    setRescheduleDayIso(rescheduleDays[0].iso);
    setRescheduleSlot(null);
    setRescheduleError(null);
  }

  async function submitReschedule() {
    if (!reschedulingBooking || !rescheduleSlot) return;
    setRescheduleBusy(true);
    setRescheduleError(null);
    const durationMs =
      new Date(reschedulingBooking.endTime).getTime() -
        new Date(reschedulingBooking.startTime).getTime() ||
      rescheduleDuration * 60_000;
    const newStart = rescheduleSlot.start;
    const newEnd = new Date(newStart.getTime() + durationMs);
    try {
      await api.updateBooking(reschedulingBooking.id, {
        startTime: newStart.toISOString(),
        endTime: newEnd.toISOString(),
        status: "CONFIRMED",
      });
      reload();
      if (
        inspectedItem?.kind === "booking" &&
        inspectedItem.booking.id === reschedulingBooking.id
      ) {
        setInspectedItem({
          ...inspectedItem,
          booking: {
            ...inspectedItem.booking,
            startTime: newStart.toISOString(),
            endTime: newEnd.toISOString(),
            status: "CONFIRMED",
          },
        });
      }
      setReschedulingBooking(null);
      setRescheduleSlot(null);
    } catch (err) {
      setRescheduleError(
        err instanceof Error ? err.message : "Could not reschedule to this time.",
      );
    } finally {
      setRescheduleBusy(false);
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

  const weekLabel = `${weekCursor.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${addDays(weekCursor, 6).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;

  const unpaidCount = useMemo(() => {
    return items.filter((i) => i.kind === "booking" && i.booking.paymentStatus === "unpaid").length;
  }, [items]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Sleek Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-hairline/80 bg-gradient-to-br from-surface via-surface to-clay/20 p-6 shadow-sm sm:p-8">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-leaf/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-leaf/30 bg-leaf/10 px-3 py-1 text-xs font-bold text-forest">
              <SparkleIcon className="h-3.5 w-3.5" />
              <span>Personal Wellness Hub</span>
            </div>
            <h1 className="mt-2.5 font-display text-3xl font-bold tracking-tight text-forest sm:text-4xl">
              Calendar &amp; Bookings
            </h1>
            <p className="mt-1.5 max-w-xl text-sm font-medium text-ink-muted">
              Manage your upcoming consultations, holistic therapies, and retreat event passes in a unified interactive schedule.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/pass"
              className="profile-spring inline-flex min-h-11 items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 text-xs font-bold text-forest hover:bg-emerald-500/20 active:scale-95"
            >
              <span>View AyurPass</span>
              <SparkleIcon className="h-4 w-4 text-[#128c7e]" />
            </Link>
            <Link
              href="/explore"
              className="profile-spring inline-flex min-h-11 items-center gap-2 rounded-full bg-forest px-5 text-xs font-bold text-white shadow-sm hover:bg-forest-deep active:scale-95"
            >
              <span>Book New Session</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/events"
              className="profile-spring inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline bg-surface/90 px-5 text-xs font-bold text-forest shadow-2xs hover:border-leaf hover:bg-clay/30 active:scale-95"
            >
              <span>Browse Events</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Glassmorphic Metrics Grid */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <div className="group relative overflow-hidden rounded-2xl border border-hairline/80 bg-surface/90 p-4.5 shadow-2xs backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-leaf/40 hover:shadow-xs">
          <div className="flex items-center justify-between text-ink-muted">
            <p className="text-[10px] font-bold uppercase tracking-wider">Scheduled Items</p>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-forest/10 text-forest">
              <CalendarIcon className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-bold tabular-nums text-forest">
            {items.length}
          </p>
          <p className="mt-1 text-[11px] font-medium text-ink-muted">Appointments &amp; event tickets</p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-hairline/80 bg-surface/90 p-4.5 shadow-2xs backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-xs">
          <div className="flex items-center justify-between text-ink-muted">
            <p className="text-[10px] font-bold uppercase tracking-wider">Appointments</p>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-2xs">
              <CheckCircleIcon className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-bold tabular-nums text-forest">
            {items.filter((i) => i.kind === "booking").length}
          </p>
          <p className="mt-1 text-[11px] font-medium text-ink-muted">1-on-1 consultations &amp; treatments</p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-hairline/80 bg-surface/90 p-4.5 shadow-2xs backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-xs">
          <div className="flex items-center justify-between text-ink-muted">
            <p className="text-[10px] font-bold uppercase tracking-wider">Events &amp; Passes</p>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[var(--system-blue)]/10 text-[var(--system-blue)]">
              <SparkleIcon className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-bold tabular-nums text-[var(--system-blue)]">
            {items.filter((i) => i.kind === "event").length}
          </p>
          <p className="mt-1 text-[11px] font-medium text-ink-muted">Group workshops &amp; retreats</p>
        </div>

        <div
          onClick={() => unpaidCount > 0 && setStatusFilter("unpaid")}
          className={`group relative overflow-hidden rounded-2xl border p-4.5 shadow-2xs backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs ${
            unpaidCount > 0
              ? "cursor-pointer border-amber-300 bg-amber-50/60 ring-1 ring-amber-200"
              : "border-hairline/80 bg-surface/90"
          }`}
        >
          <div className="flex items-center justify-between text-ink-muted">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Pending Pay</p>
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                unpaidCount > 0 ? "animate-pulse bg-amber-500 shadow-xs" : "bg-gray-300"
              }`}
            />
          </div>
          <p className="mt-3 font-display text-3xl font-bold tabular-nums text-amber-800">
            {unpaidCount}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-amber-700">
            {unpaidCount > 0 ? "Click to view unpaid →" : "All payments settled"}
          </p>
        </div>
      </div>

      {/* Comprehensive Filter & Control Bar */}
      <div className="space-y-4 rounded-3xl border border-hairline bg-surface/90 p-4 shadow-xs backdrop-blur sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* View Toggles */}
          <div className="inline-flex rounded-full border border-hairline bg-surface p-1 shadow-2xs">
            {(
              [
                ["month", "Month Grid"],
                ["week", "Week Grid"],
                ["list", "List View"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                className={`profile-spring rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  view === id
                    ? "bg-forest text-white shadow-2xs"
                    : "text-ink-muted hover:text-foreground hover:bg-clay/30"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Kind Toggles */}
          <div className="inline-flex rounded-full border border-hairline bg-surface p-1 shadow-2xs">
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
                className={`profile-spring rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  kind === id
                    ? "bg-leaf/20 text-forest border border-leaf/40"
                    : "text-ink-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1">
            <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search session, provider, or notes…"
              className="w-full rounded-full border border-hairline bg-surface/90 pl-10 pr-9 py-2 text-xs font-medium placeholder:text-ink-muted focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-ink-muted hover:text-foreground"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Status Filters & Discipline Chips Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-hairline/60">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mr-1">Status:</span>
            {(
              [
                ["all", "All Statuses"],
                ["confirmed", "Confirmed"],
                ["pending", "Pending"],
                ["unpaid", "Unpaid"],
              ] as const
            ).map(([st, lbl]) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`profile-spring rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
                  statusFilter === st
                    ? "bg-forest text-white shadow-2xs"
                    : "border border-hairline bg-surface text-ink-secondary hover:border-leaf/40"
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>

          <p className="text-xs font-semibold text-ink-muted">
            Showing {filtered.length} of {items.length} items
          </p>
        </div>

        {/* Category discipline chips */}
        <div className="flex gap-2 overflow-x-auto pt-1 pb-0.5">
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
                className={`profile-spring inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all ${
                  active
                    ? "border-transparent text-white shadow-xs"
                    : "border-hairline bg-surface text-ink-secondary hover:border-leaf/40"
                }`}
                style={
                  active && color
                    ? { backgroundColor: color }
                    : active
                      ? { backgroundColor: "#1e3228" }
                      : undefined
                }
              >
                {color && !active ? (
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                ) : null}
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <ErrorNote message={error} />

      {/* MONTH GRID VIEW */}
      {view === "month" ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(20rem,1fr)]">
          {/* Calendar Month Grid */}
          <div className="rounded-3xl border border-hairline bg-surface p-5 shadow-xs">
            {/* Header controls */}
            <div className="mb-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setMonthCursor((m) => addMonths(m, -1))}
                className="profile-spring rounded-full border border-hairline bg-surface px-4 py-2 text-xs font-bold text-forest hover:border-leaf hover:bg-clay/40"
              >
                ← Prev
              </button>
              <div className="text-center">
                <h2 className="font-display text-2xl font-bold tracking-tight text-forest">
                  {monthLabel}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setMonthCursor((m) => addMonths(m, 1))}
                className="profile-spring rounded-full border border-hairline bg-surface px-4 py-2 text-xs font-bold text-forest hover:border-leaf hover:bg-clay/40"
              >
                Next →
              </button>
            </div>

            {/* Grid container */}
            <div className="overflow-hidden rounded-2xl border border-hairline bg-surface shadow-2xs">
              {/* Weekdays header */}
              <div className="grid grid-cols-7 border-b border-hairline bg-clay/20 text-center text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                {WEEKDAYS.map((w) => (
                  <div key={w} className="py-3">
                    {w}
                  </div>
                ))}
              </div>

              {/* Day cells grid */}
              <div className="grid grid-cols-7 divide-x divide-hairline">
                {monthCells.map((d, i) => {
                  if (!d) {
                    return (
                      <div
                        key={`e-${i}`}
                        className="aspect-square bg-clay/10 p-1.5 border-b border-hairline"
                      />
                    );
                  }
                  const key = dayKey(d);
                  const dayItems = byDay.get(key) ?? [];
                  const isSel = sameDay(d, selectedDay);
                  const isToday = sameDay(d, new Date());

                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedDay(d)}
                      className={`group relative flex aspect-square cursor-pointer flex-col p-2 transition-all border-b border-hairline overflow-hidden ${
                        isSel
                          ? "bg-forest/5 ring-2 ring-forest ring-inset"
                          : isToday
                            ? "bg-leaf/10"
                            : "bg-surface hover:bg-clay/30"
                      }`}
                    >
                      {/* Cell top bar */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span
                          className={`flex h-6.5 w-6.5 items-center justify-center rounded-full text-xs font-bold transition-all ${
                            isToday
                              ? "bg-forest text-white shadow-2xs ring-2 ring-forest/30"
                              : isSel
                                ? "bg-forest/20 text-forest"
                                : "text-foreground group-hover:text-forest"
                          }`}
                        >
                          {d.getDate()}
                        </span>
                        {dayItems.length > 0 ? (
                          <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-bold tabular-nums text-forest shadow-2xs">
                            {dayItems.length}
                          </span>
                        ) : null}
                      </div>

                      {/* Mini session pills */}
                      <div className="space-y-1 overflow-hidden">
                        {dayItems.slice(0, 2).map((it, idx) => {
                          const catColor =
                            it.kind === "booking"
                              ? colorForServiceCategory(it.booking.service?.category)
                              : "#007aff";
                          const title =
                            it.kind === "booking"
                              ? it.booking.service?.name ?? "Session"
                              : it.ticket.event?.title ?? "Event";
                          const timeStr = it.at.toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          });
                          return (
                            <div
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDay(d);
                                setInspectedItem(it);
                              }}
                              className="group/pill flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-bold text-foreground transition-all hover:scale-[1.02] hover:shadow-2xs"
                              style={{
                                backgroundColor: softColorForServiceCategory(
                                  it.kind === "booking" ? it.booking.service?.category : undefined,
                                ),
                                borderLeft: `3px solid ${catColor}`,
                              }}
                              title={`${timeStr} - ${title}`}
                            >
                              <span className="truncate">{title}</span>
                            </div>
                          );
                        })}
                        {dayItems.length > 2 ? (
                          <p className="text-[9px] font-bold text-forest/80 pl-1 pt-0.5">
                            +{dayItems.length - 2} more
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const t = new Date();
                setMonthCursor(startOfMonth(t));
                setSelectedDay(t);
              }}
              className="mt-4 w-full text-center text-xs font-bold text-forest hover:underline"
            >
              Jump to today
            </button>
          </div>

          {/* Side Inspector / Selected Day Detail */}
          <div className="h-fit rounded-3xl border border-hairline bg-surface/90 p-5 shadow-xs sticky top-24">
            <div className="border-b border-hairline pb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                {selectedDay.toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <h3 className="mt-1 font-display text-xl font-bold text-forest">
                {selectedItems.length === 0
                  ? "No sessions scheduled"
                  : `${selectedItems.length} item${selectedItems.length === 1 ? "" : "s"} on this date`}
              </h3>
            </div>

            <div className="mt-4 max-h-[32rem] space-y-3.5 overflow-y-auto pr-1">
              {isLoading && !bookings ? (
                <div className="space-y-3">
                  <div className="h-24 animate-pulse rounded-2xl bg-clay/60" />
                  <div className="h-24 animate-pulse rounded-2xl bg-clay/60" />
                </div>
              ) : selectedItems.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-forest/10 text-forest">
                    <CalendarIcon className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-ink-muted">
                    No appointments or events on this date.
                  </p>
                  <div className="pt-2 flex justify-center gap-2">
                    <Link
                      href="/explore"
                      className="profile-spring inline-flex items-center rounded-full bg-forest px-4 py-2 text-xs font-bold text-white shadow-2xs"
                    >
                      Book Session
                    </Link>
                    <Link
                      href="/events"
                      className="profile-spring inline-flex items-center rounded-full border border-hairline bg-surface px-4 py-2 text-xs font-bold text-forest shadow-2xs"
                    >
                      Browse Events
                    </Link>
                  </div>
                </div>
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
                      onReschedule={() => startReschedule(item.booking)}
                      onInspect={() => setInspectedItem(item)}
                    />
                  ) : (
                    <EventCard
                      key={item.ticket.id}
                      t={item.ticket}
                      onInspect={() => setInspectedItem(item)}
                    />
                  ),
                )
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* WEEK GRID VIEW */}
      {view === "week" ? (
        <div className="rounded-3xl border border-hairline bg-surface p-5 shadow-xs">
          {/* Week Nav */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWeekCursor((w) => addDays(w, -7))}
                className="profile-spring rounded-full border border-hairline bg-surface px-4 py-2 text-xs font-bold text-forest hover:bg-clay/40"
              >
                ‹ Prev Week
              </button>
              <button
                type="button"
                onClick={() => setWeekCursor(startOfWeekSunday(new Date()))}
                className="profile-spring rounded-full border border-hairline bg-surface px-4 py-2 text-xs font-bold text-forest hover:bg-clay/40"
              >
                This Week
              </button>
              <button
                type="button"
                onClick={() => setWeekCursor((w) => addDays(w, 7))}
                className="profile-spring rounded-full border border-hairline bg-surface px-4 py-2 text-xs font-bold text-forest hover:bg-clay/40"
              >
                Next Week ›
              </button>
            </div>
            <h2 className="font-display text-xl font-bold text-forest">{weekLabel}</h2>
          </div>

          {/* Time Slot Grid */}
          <div className="overflow-x-auto rounded-2xl border border-hairline bg-surface shadow-2xs">
            <div className="min-w-[800px]">
              {/* Day Headers */}
              <div className="grid grid-cols-[70px_repeat(7,1fr)] border-b border-hairline bg-clay/20">
                <div className="p-3 border-r border-hairline text-center text-[10px] font-bold text-ink-muted uppercase">
                  Time
                </div>
                {weekDays.map((d) => {
                  const today = sameDay(d, new Date());
                  return (
                    <div
                      key={d.toISOString()}
                      className={`p-2.5 border-r border-hairline text-center ${today ? "bg-leaf/20" : ""}`}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                        {d.toLocaleDateString(undefined, { weekday: "short" })}
                      </p>
                      <p
                        className={`mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          today ? "bg-forest text-white shadow-2xs" : "text-foreground"
                        }`}
                      >
                        {d.getDate()}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Time grid body */}
              <div className="grid grid-cols-[70px_repeat(7,1fr)] relative">
                <div
                  className="relative border-r border-hairline bg-clay/10"
                  style={{ height: hours.length * HOUR_PX }}
                >
                  {hours.map((h, i) => (
                    <span
                      key={h}
                      className="absolute right-2 -translate-y-1/2 text-[10px] font-bold tabular-nums text-ink-muted"
                      style={{ top: i * HOUR_PX }}
                    >
                      {h > 12 ? `${h - 12} PM` : h === 12 ? "12 PM" : `${h} AM`}
                    </span>
                  ))}
                </div>

                {weekDays.map((d) => {
                  const dayIso = dayKey(d);
                  const dayItems = byDay.get(dayIso) ?? [];
                  const today = sameDay(d, new Date());
                  return (
                    <div
                      key={dayIso}
                      className={`relative border-r border-hairline ${today ? "bg-leaf/5" : ""}`}
                      style={{ height: hours.length * HOUR_PX }}
                    >
                      {hours.map((_, i) => (
                        <div
                          key={i}
                          className="absolute inset-x-0 border-t border-hairline/40"
                          style={{ top: i * HOUR_PX }}
                        />
                      ))}

                      {dayItems.map((item, idx) => {
                        const start = item.at;
                        const end =
                          item.kind === "booking" && item.booking.endTime
                            ? new Date(item.booking.endTime)
                            : new Date(start.getTime() + 60 * 60_000);
                        const top = bookingTop(start);
                        const height = bookingHeight(start, end);
                        const catColor =
                          item.kind === "booking"
                            ? colorForServiceCategory(item.booking.service?.category)
                            : "#007aff";
                        const title =
                          item.kind === "booking"
                            ? item.booking.service?.name ?? "Session"
                            : item.ticket.event?.title ?? "Event";

                        return (
                          <div
                            key={idx}
                            onClick={() => setInspectedItem(item)}
                            className="absolute left-1 right-1 cursor-pointer rounded-xl p-2 shadow-2xs transition-all hover:scale-[1.02] hover:z-10 hover:shadow-md overflow-hidden"
                            style={{
                              top,
                              height,
                              backgroundColor: softColorForServiceCategory(
                                item.kind === "booking"
                                  ? item.booking.service?.category
                                  : undefined,
                              ),
                              borderLeft: `4px solid ${catColor}`,
                            }}
                          >
                            <p className="text-[11px] font-bold text-forest truncate">{title}</p>
                            <p className="text-[9px] font-semibold text-ink-muted">
                              {start.toLocaleTimeString(undefined, {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* LIST VIEW */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between gap-3 border-b border-hairline pb-3">
          <h2 className="font-display text-2xl font-bold tracking-tight text-forest">
            {view === "list" ? "All Filtered Sessions" : "Upcoming Sessions & Passes"}
          </h2>
          <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-bold tabular-nums text-forest">
            {upcomingList.length} total
          </span>
        </div>

        {isLoading && !bookings ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-clay/60" />
            ))}
          </div>
        ) : upcomingList.length === 0 ? (
          <EmptyState
            title="No matching bookings found"
            body="No sessions match your active filters or search query. Explore sessions or clear filters!"
            action={
              <div className="flex gap-2.5">
                {(searchQuery || category !== "ALL" || statusFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setCategory("ALL");
                      setStatusFilter("all");
                      setKind("all");
                    }}
                    className="profile-spring inline-flex min-h-10 items-center rounded-full border border-hairline bg-surface px-4 text-xs font-bold text-forest shadow-2xs hover:bg-clay/40"
                  >
                    Clear Filters
                  </button>
                )}
                <Link
                  href="/explore"
                  className="profile-spring inline-flex min-h-10 items-center rounded-full bg-forest px-5 text-xs font-bold text-white shadow-2xs"
                >
                  Explore Sessions
                </Link>
              </div>
            }
          />
        ) : (
          <ul className="space-y-3.5">
            {upcomingList.map((item) =>
              item.kind === "booking" ? (
                <li key={item.booking.id}>
                  <BookingCard
                    b={item.booking}
                    paying={paying}
                    cancelling={cancelling}
                    onPay={() => void startPay(item.booking)}
                    onCancel={() => void cancel(item.booking)}
                    onReschedule={() => startReschedule(item.booking)}
                    onInspect={() => setInspectedItem(item)}
                  />
                </li>
              ) : (
                <li key={item.ticket.id}>
                  <EventCard
                    t={item.ticket}
                    onInspect={() => setInspectedItem(item)}
                  />
                </li>
              ),
            )}
          </ul>
        )}
      </section>

      {/* INSPECT DETAIL MODAL */}
      {inspectedItem ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-surface p-6 shadow-2xl space-y-4 border border-hairline">
            <div className="flex items-start justify-between gap-3 border-b border-hairline pb-4">
              <div>
                <span className="rounded-full bg-forest/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-forest">
                  {inspectedItem.kind === "booking" ? "Appointment" : "Event Pass"}
                </span>
                <h3 className="mt-2 font-display text-2xl font-bold text-forest">
                  {inspectedItem.kind === "booking"
                    ? inspectedItem.booking.service?.name ?? "Session Details"
                    : inspectedItem.ticket.event?.title ?? "Event Details"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedItem(null)}
                className="rounded-full p-1.5 text-ink-muted hover:bg-clay/40 hover:text-foreground transition-colors"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {inspectedItem.kind === "booking" ? (
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between border-b border-hairline/50 pb-2.5">
                  <span className="text-ink-muted font-medium">Date &amp; Time</span>
                  <span className="font-bold text-foreground">
                    {new Date(inspectedItem.booking.startTime).toLocaleString(undefined, {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                {inspectedItem.booking.provider?.businessName ? (
                  <div className="flex justify-between border-b border-hairline/50 pb-2.5">
                    <span className="text-ink-muted font-medium">Practitioner / Practice</span>
                    <Link
                      href={practicePath({ id: inspectedItem.booking.provider.id })}
                      className="font-bold text-forest hover:underline"
                    >
                      {inspectedItem.booking.provider.businessName}
                    </Link>
                  </div>
                ) : null}
                <div className="flex justify-between border-b border-hairline/50 pb-2.5">
                  <span className="text-ink-muted font-medium">Booking Status</span>
                  <BookingStatusBadge status={inspectedItem.booking.status} />
                </div>
                <div className="flex justify-between border-b border-hairline/50 pb-2.5">
                  <span className="text-ink-muted font-medium">Payment Status</span>
                  <PaymentBadge status={inspectedItem.booking.paymentStatus} />
                </div>
                {inspectedItem.booking.totalAmount != null ? (
                  <div className="flex justify-between border-b border-hairline/50 pb-2.5">
                    <span className="text-ink-muted font-medium">Total Price</span>
                    <span className="font-display font-bold text-forest text-base">
                      {formatMoney(inspectedItem.booking.totalAmount)}
                    </span>
                  </div>
                ) : null}

                {inspectedItem.booking.service?.isVirtual &&
                inspectedItem.booking.status !== "CANCELLED" ? (
                  <div className="rounded-2xl border border-leaf/30 bg-leaf/10 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-forest">
                        📹 Telehealth Consultation Room
                      </span>
                      <span className="rounded-full bg-forest text-white px-2 py-0.5 text-[10px] font-bold">
                        Virtual Room
                      </span>
                    </div>
                    <p className="text-xs text-ink-secondary">
                      Your session is conducted via private, end-to-end encrypted video. Click below to launch your call.
                    </p>
                    <a
                      href={getBookingVideoUrl(inspectedItem.booking) ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full rounded-xl bg-forest py-2.5 text-xs font-bold text-white shadow-xs hover:bg-forest-deep"
                    >
                      Join Video Consultation →
                    </a>
                  </div>
                ) : null}

                <div className="pt-3 flex flex-wrap gap-2 justify-end">
                  {inspectedItem.booking.paymentStatus === "unpaid" &&
                  inspectedItem.booking.status !== "CANCELLED" ? (
                    <button
                      type="button"
                      onClick={() => void startPay(inspectedItem.booking)}
                      className="profile-spring rounded-full bg-forest px-5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-forest-deep"
                    >
                      Pay Now
                    </button>
                  ) : null}
                  {isCancellable(inspectedItem.booking) ? (
                    <>
                      <button
                        type="button"
                        onClick={() => startReschedule(inspectedItem.booking)}
                        className="profile-spring rounded-full border border-hairline bg-surface px-4 py-2 text-xs font-bold text-forest hover:border-forest hover:bg-forest/5"
                      >
                        Reschedule
                      </button>
                      <button
                        type="button"
                        onClick={() => void cancel(inspectedItem.booking)}
                        className="profile-spring rounded-full border border-hairline bg-surface px-4 py-2 text-xs font-bold text-ink-secondary hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                      >
                        Cancel Booking
                      </button>
                    </>
                  ) : null}
                  {inspectedItem.booking.status !== "CANCELLED" ? (
                    <button
                      type="button"
                      onClick={() => downloadBookingIcs(inspectedItem.booking)}
                      className="profile-spring rounded-full border border-hairline bg-surface px-4 py-2 text-xs font-bold text-forest hover:border-leaf hover:bg-clay/30"
                    >
                      📅 Export (.ics)
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between border-b border-hairline/50 pb-2.5">
                  <span className="text-ink-muted font-medium">Event Date</span>
                  <span className="font-bold text-foreground">
                    {inspectedItem.ticket.event?.startTime
                      ? new Date(inspectedItem.ticket.event.startTime).toLocaleString(
                          undefined,
                          { dateStyle: "full", timeStyle: "short" },
                        )
                      : "TBA"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-hairline/50 pb-2.5">
                  <span className="text-ink-muted font-medium">Pass Status</span>
                  <span className="rounded-full bg-surface border border-hairline px-3 py-0.5 text-xs font-bold text-forest">
                    {inspectedItem.ticket.status}
                  </span>
                </div>
                <div className="pt-3 flex justify-end">
                  <Link
                    href={
                      inspectedItem.ticket.event?.slug
                        ? `/events/${inspectedItem.ticket.event.slug}`
                        : "/events"
                    }
                    className="profile-spring rounded-full bg-forest px-5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-forest-deep"
                  >
                    View Event Page →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* STRIPE PAYMENT MODAL */}
      {payModal ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-surface p-6 shadow-2xl border border-hairline">
            <h3 className="font-display text-xl font-bold text-forest">
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

      {/* RESCHEDULE MODAL */}
      {reschedulingBooking ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-surface p-6 shadow-2xl border border-hairline max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-forest-deep">
                  Self-Service Reschedule
                </span>
                <h3 className="font-display text-xl font-bold text-forest mt-1.5">
                  Reschedule {reschedulingBooking.service?.name ?? "Appointment"}
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Current:{" "}
                  {new Date(reschedulingBooking.startTime).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReschedulingBooking(null)}
                className="rounded-full p-1 text-ink-muted hover:text-foreground"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-gold-soft bg-clay/40 p-3 text-xs text-ink-secondary">
              ℹ️ <strong>Clinic Policy:</strong> Free schedule changes are available up to 24 hours prior to session.
            </div>

            {/* Choose Day */}
            <div className="mt-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                1. Pick a new date
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {rescheduleDays.map((d) => (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => {
                      setRescheduleDayIso(d.iso);
                      setRescheduleSlot(null);
                    }}
                    className={`flex min-w-[58px] flex-col items-center rounded-xl border py-2 px-1 text-xs transition-all ${
                      d.iso === rescheduleDayIso
                        ? "border-forest bg-forest text-white shadow-xs"
                        : "border-hairline bg-surface text-ink-secondary hover:border-forest/50"
                    }`}
                  >
                    <span className="text-[10px] font-medium">{d.weekday}</span>
                    <span className="text-sm font-bold my-0.5">{d.dayOfMonth}</span>
                    <span className="text-[10px] opacity-80">{d.month}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Choose Slot */}
            <div className="mt-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                2. Available time slots
              </label>
              {rescheduleSlots.length === 0 ? (
                <div className="rounded-xl border border-dashed border-hairline p-4 text-center text-xs text-ink-muted">
                  No availability on this day. Please select another date.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {rescheduleSlots.map((s) => {
                    const isSelected = rescheduleSlot?.start.getTime() === s.start.getTime();
                    return (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => setRescheduleSlot(s)}
                        className={`rounded-lg border py-2 text-xs font-medium transition-all ${
                          isSelected
                            ? "border-forest bg-forest text-white font-semibold shadow-xs"
                            : "border-hairline bg-surface text-foreground hover:border-forest/40"
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <ErrorNote message={rescheduleError} />

            <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-hairline">
              <button
                type="button"
                onClick={() => setReschedulingBooking(null)}
                className="rounded-full px-4 py-2 text-xs font-semibold text-ink-muted hover:text-foreground"
              >
                Close
              </button>
              <button
                type="button"
                disabled={rescheduleBusy || !rescheduleSlot}
                onClick={() => void submitReschedule()}
                className="rounded-full bg-forest px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-forest-deep disabled:opacity-50"
              >
                {rescheduleBusy ? "Rescheduling…" : "Confirm Reschedule"}
              </button>
            </div>
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
  onReschedule,
  onInspect,
}: {
  b: Booking;
  paying: string | null;
  cancelling: string | null;
  onPay: () => void;
  onCancel: () => void;
  onReschedule?: () => void;
  onInspect?: () => void;
}) {
  const cat = b.service?.category;
  const bar = colorForServiceCategory(cat);
  const soft = softColorForServiceCategory(cat);
  return (
    <div
      onClick={onInspect}
      className="profile-spring cursor-pointer rounded-3xl border border-hairline p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderLeftWidth: 5, borderLeftColor: bar, backgroundColor: soft }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {cat ? (
              <span
                className="inline-flex rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-2xs"
                style={{ backgroundColor: bar }}
              >
                {CATEGORY_LABEL[cat as ServiceCategory] ?? cat.replace(/_/g, " ")}
              </span>
            ) : null}
            <span className="rounded-full bg-surface/90 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted shadow-2xs border border-hairline/60">
              Appointment
            </span>
          </div>
          <h4 className="font-display text-lg font-bold text-foreground sm:text-xl">
            {b.service?.name ?? "Session"}
          </h4>
          <p className="mt-1 text-xs font-semibold text-ink-muted sm:text-sm">
            {b.provider?.businessName ? (
              <>
                <Link
                  href={practicePath({ id: b.provider.id })}
                  onClick={(e) => e.stopPropagation()}
                  className="font-bold text-forest hover:underline"
                >
                  {b.provider.businessName}
                </Link>
                {" · "}
              </>
            ) : null}
            {new Date(b.startTime).toLocaleString(undefined, {
              weekday: "short",
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
          {b.totalAmount != null ? (
            <span className="font-display text-base font-bold tabular-nums text-forest mr-1">
              {formatMoney(b.totalAmount)}
            </span>
          ) : null}
          <BookingStatusBadge status={b.status} />
          <PaymentBadge status={b.paymentStatus} />
          {b.paymentStatus === "unpaid" && b.status !== "CANCELLED" ? (
            <button
              type="button"
              onClick={onPay}
              disabled={paying === b.id}
              className="profile-spring inline-flex items-center rounded-full bg-forest px-4 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-forest-deep active:scale-95 disabled:opacity-50"
            >
              {paying === b.id ? "Processing…" : "Pay Now"}
            </button>
          ) : null}
          {b.service?.isVirtual && b.status !== "CANCELLED" ? (
            <a
              href={getBookingVideoUrl(b) ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="profile-spring inline-flex items-center gap-1 rounded-full bg-leaf/20 border border-leaf/40 px-3.5 py-1.5 text-xs font-bold text-forest shadow-2xs hover:bg-leaf/30 active:scale-95"
            >
              📹 Join Call
            </a>
          ) : null}
          {isCancellable(b) && onReschedule ? (
            <button
              type="button"
              onClick={onReschedule}
              className="profile-spring inline-flex items-center rounded-full border border-hairline bg-surface px-3.5 py-1.5 text-xs font-bold text-forest shadow-2xs hover:border-forest hover:bg-forest/5 active:scale-95"
            >
              Reschedule
            </button>
          ) : null}
          {isCancellable(b) ? (
            <button
              type="button"
              onClick={onCancel}
              disabled={cancelling === b.id}
              className="profile-spring inline-flex items-center rounded-full border border-hairline bg-surface px-3.5 py-1.5 text-xs font-bold text-ink-secondary shadow-2xs hover:border-red-300 hover:bg-red-50 hover:text-red-700 active:scale-95"
            >
              Cancel
            </button>
          ) : null}
          {b.status !== "CANCELLED" ? (
            <button
              type="button"
              onClick={() => downloadBookingIcs(b)}
              className="profile-spring inline-flex items-center gap-1 rounded-full border border-hairline bg-surface px-3.5 py-1.5 text-xs font-bold text-forest shadow-2xs hover:border-leaf hover:bg-clay/30 active:scale-95"
            >
              📅 Add to Cal (.ics)
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EventCard({
  t,
  onInspect,
}: {
  t: EventTicket;
  onInspect?: () => void;
}) {
  const cat = t.event?.category;
  return (
    <div
      onClick={onInspect}
      className="profile-spring cursor-pointer block rounded-3xl border border-hairline bg-[var(--system-blue)]/5 p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderLeftWidth: 5, borderLeftColor: "#007aff" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--system-blue)] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-2xs">
            Event Pass
          </span>
          {cat ? (
            <span className="rounded-full bg-surface px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-secondary shadow-2xs border border-hairline/60">
              {EVENT_CATEGORY_LABEL[cat] ?? cat.replace(/_/g, " ")}
            </span>
          ) : null}
        </div>
        <span className="rounded-full bg-surface px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted border border-hairline/60">
          {t.status.replace(/_/g, " ")}
        </span>
      </div>
      <h4 className="font-display text-lg font-bold text-forest sm:text-xl">
        {t.event?.title ?? "Event"}
      </h4>
      <p className="mt-1 text-xs font-semibold text-ink-muted sm:text-sm">
        {t.event?.startTime
          ? new Date(t.event.startTime).toLocaleString(undefined, {
              weekday: "short",
              dateStyle: "medium",
              timeStyle: "short",
            })
          : ""}
        {t.event?.provider?.businessName ? ` · ${t.event.provider.businessName}` : ""}
      </p>
    </div>
  );
}
