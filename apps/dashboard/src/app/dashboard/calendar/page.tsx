"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, formatMoney, ApiError } from "@/lib/api";
import { downloadBookingIcs } from "@/lib/ics";
import type { Booking, Professional, Room, Service } from "@/lib/types";
import { BookingStatusBadge } from "@/components/BookingStatusBadge";
import { PaymentBadge } from "@/components/PaymentBadge";
import { PlusIcon } from "@/components/icons";
import { Button, EmptyState, ErrorNote, Field, Input, Select, Textarea } from "@/components/ui";

const OPEN_HOUR = 8;
const CLOSE_HOUR = 19;
const HOUR_PX = 48;
const hours = Array.from({ length: CLOSE_HOUR - OPEN_HOUR }, (_, i) => OPEN_HOUR + i);

type CalView = "week" | "staff" | "rooms";

function startOfWeek(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return date;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function toDateInput(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toTimeInput(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function endOfDay(d: Date): Date {
  const x = startOfDay(d);
  x.setDate(x.getDate() + 1);
  return x;
}

const STATUS_BLOCK: Record<string, string> = {
  PENDING: "border-gold bg-gold-soft text-forest",
  CONFIRMED: "border-forest bg-forest text-white",
  IN_PROGRESS: "border-forest bg-leaf text-white",
  COMPLETED: "border-hairline bg-clay text-ink-secondary",
};

const STAFF_COLORS = [
  "bg-forest text-white border-forest",
  "bg-leaf text-white border-leaf",
  "bg-[var(--system-blue)] text-white border-[var(--system-blue)]",
  "bg-gold-soft text-forest border-gold",
  "bg-clay text-forest border-hairline",
];

interface DraftAppointment {
  email: string;
  serviceId: string;
  date: string;
  time: string;
  roomId: string;
  professionalId: string;
  notes: string;
  recurrence?: "none" | "weekly" | "biweekly" | "monthly";
  recurrenceCount?: number;
}

function proName(p: Professional) {
  return p.user?.fullName ?? p.title ?? "Practitioner";
}

function bookingTop(start: Date) {
  return (start.getHours() + start.getMinutes() / 60 - OPEN_HOUR) * HOUR_PX;
}

function bookingHeight(start: Date, end: Date) {
  return Math.max(22, ((end.getTime() - start.getTime()) / 3_600_000) * HOUR_PX - 2);
}

/** Pack overlapping bookings into horizontal lanes within one column. */
function laneLayout(items: Booking[]): Map<string, { lane: number; lanes: number }> {
  const sorted = [...items].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );
  const out = new Map<string, { lane: number; lanes: number }>();
  type Active = { id: string; end: number; lane: number };
  let active: Active[] = [];
  let group: string[] = [];
  let maxLane = 0;

  function flushGroup() {
    for (const id of group) {
      const cur = out.get(id);
      if (cur) out.set(id, { ...cur, lanes: maxLane + 1 });
    }
    group = [];
    maxLane = 0;
  }

  for (const b of sorted) {
    const start = new Date(b.startTime).getTime();
    const end = new Date(b.endTime).getTime();
    active = active.filter((a) => a.end > start);
    if (active.length === 0 && group.length) flushGroup();
    const used = new Set(active.map((a) => a.lane));
    let lane = 0;
    while (used.has(lane)) lane += 1;
    maxLane = Math.max(maxLane, lane);
    active.push({ id: b.id, end, lane });
    group.push(b.id);
    out.set(b.id, { lane, lanes: 1 });
  }
  flushGroup();
  return out;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const provider = user?.provider ?? user?.professional?.provider ?? null;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [team, setTeam] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [dayFocus, setDayFocus] = useState(() => startOfDay(new Date()));
  const [view, setView] = useState<CalView>("week");
  const [filterPro, setFilterPro] = useState("");
  const [filterRoom, setFilterRoom] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [draft, setDraft] = useState<DraftAppointment | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!provider) return;
    const from =
      view === "week"
        ? weekStart.toISOString()
        : startOfDay(dayFocus).toISOString();
    const to =
      view === "week"
        ? addDays(weekStart, 7).toISOString()
        : endOfDay(dayFocus).toISOString();
    api
      .bookingsByProvider(provider.id, {
        from,
        to,
        professionalId: filterPro || undefined,
        roomId: filterRoom || undefined,
      })
      .then(setBookings)
      .catch(() => setBookings([]));
    api.roomsByProvider(provider.id).then(setRooms).catch(() => {});
    api.professionalsByProvider(provider.id).then(setTeam).catch(() => {});
    api.servicesByProvider(provider.id).then(setServices).catch(() => {});
  }, [provider, view, weekStart, dayFocus, filterPro, filterRoom]);

  useEffect(reload, [reload]);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const visibleBookings = useMemo(
    () =>
      bookings.filter((b) => b.status !== "CANCELLED" && b.status !== "NO_SHOW"),
    [bookings],
  );

  const staffColumns = useMemo(() => {
    const cols: { id: string; label: string; color: string }[] = team.map((p, i) => ({
      id: p.id,
      label: proName(p),
      color: STAFF_COLORS[i % STAFF_COLORS.length],
    }));
    cols.push({ id: "__unassigned__", label: "Unassigned", color: STATUS_BLOCK.COMPLETED });
    return cols;
  }, [team]);

  const roomColumns = useMemo(() => {
    const cols: { id: string; label: string; color: string }[] = rooms.map((r, i) => ({
      id: r.id,
      label: r.name,
      color: STAFF_COLORS[i % STAFF_COLORS.length],
    }));
    cols.push({ id: "__unassigned__", label: "No room", color: STATUS_BLOCK.COMPLETED });
    return cols;
  }, [rooms]);

  if (!provider) {
    return (
      <EmptyState title="No practice linked" body="The calendar is available for provider accounts." />
    );
  }

  async function saveSelected(patch: Parameters<typeof api.updateBooking>[1]) {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await api.updateBooking(selected.id, patch);
      setSelected(updated);
      reload();
    } catch (e) {
      setError(
        e instanceof ApiError || e instanceof Error
          ? e.message
          : "The appointment couldn't be updated.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function payAction(method: "CASH" | "CARD_TERMINAL" | "STRIPE_ONLINE" | "refund") {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      let updated;
      if (method === "refund") {
        updated = await api.refundBooking(selected.id);
      } else if (method === "STRIPE_ONLINE") {
        updated = await api.payBooking(selected.id);
      } else {
        const trxId = `${method}-${Date.now()}`;
        updated = await api.payBookingCounter(selected.id, method, trxId);
      }
      setSelected({ ...selected, ...updated });
      reload();
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : method === "refund"
            ? "Refund failed."
            : "Payment failed.";
      setError(
        msg.toLowerCase().includes("onboarding") || msg.toLowerCase().includes("payment setup")
          ? "This practice has not finished Stripe payment setup yet. Complete Connect onboarding under Payments, or use mock mode in local dev."
          : msg,
      );
    } finally {
      setBusy(false);
    }
  }

  async function createDraft(e: React.FormEvent) {
    e.preventDefault();
    if (!draft || !provider) return;
    setBusy(true);
    setError(null);
    try {
      const client = await api.userByEmail(draft.email.trim());
      if (!client) {
        setError("No AyurPass account exists for that email — the client must register first.");
        return;
      }
      const svc = services.find((s) => s.id === draft.serviceId);
      if (!svc) return;
      const start = new Date(`${draft.date}T${draft.time}:00`);
      const end = new Date(start.getTime() + svc.durationMinutes * 60_000);
      await api.createBooking({
        consumerId: client.id,
        serviceId: svc.id,
        providerId: provider.id,
        professionalId: draft.professionalId || undefined,
        roomId: draft.roomId || undefined,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notes: draft.notes.trim() || undefined,
        status: "CONFIRMED",
        recurrence: draft.recurrence !== "none" ? draft.recurrence : undefined,
        recurrenceCount: draft.recurrence !== "none" ? (draft.recurrenceCount ?? 4) : undefined,
      });
      setDraft(null);
      reload();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The appointment couldn't be created — check therapist/room availability.",
      );
    } finally {
      setBusy(false);
    }
  }

  const selectedService = selected
    ? (selected.service ?? services.find((s) => s.id === selected.serviceId))
    : null;





  return (
    <div className="dash-wide space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--system-blue)]">
              Organiser
            </p>
            <span className="rounded-full bg-leaf/15 px-2.5 py-0.5 text-[10px] font-bold text-forest">
              ✓ Automated Reminders (24h/2h)
            </span>
          </div>
          <h1 className="mt-1 font-display text-3xl text-forest">Calendar &amp; Smart Scheduling</h1>
          <p className="mt-1 max-w-xl text-sm font-medium text-ink-muted">
            Run concurrent sessions — multiple therapists in different rooms at the same time.
            Calendar sync and automated reminders are active.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="soft"
            onClick={() => {
              const url = `${window.location.origin}/api/calendar/ics?providerId=${provider.id}`;
              navigator.clipboard.writeText(url);
              alert("iCal Subscription URL copied to clipboard!\n\n" + url);
            }}
          >
            📋 Copy iCal Feed URL
          </Button>
          <Button
            onClick={() => {
              setSelected(null);
              setDraft({
                email: "",
                serviceId: services[0]?.id ?? "",
                date: toDateInput(view === "week" ? new Date() : dayFocus),
                time: "10:00",
                roomId: "",
                professionalId: "",
                notes: "",
                recurrence: "none",
                recurrenceCount: 4,
              });
            }}
          >
            <PlusIcon className="h-4 w-4" />
            New appointment
          </Button>
        </div>
      </div>

      {/* View switcher + navigation */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-full border border-hairline bg-surface p-0.5">
          {(
            [
              { key: "week" as const, label: "Week" },
              { key: "staff" as const, label: "By therapist" },
              { key: "rooms" as const, label: "By room" },
            ] as const
          ).map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setView(v.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                view === v.key ? "bg-forest text-white" : "text-ink-secondary hover:text-forest"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {view === "week" ? (
          <>
            <Button variant="ghost" onClick={() => setWeekStart(addDays(weekStart, -7))}>
              ‹ Prev
            </Button>
            <Button variant="ghost" onClick={() => setWeekStart(startOfWeek(new Date()))}>
              This week
            </Button>
            <Button variant="ghost" onClick={() => setWeekStart(addDays(weekStart, 7))}>
              Next ›
            </Button>
            <p className="text-sm font-semibold text-ink-secondary">
              {weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })} –{" "}
              {addDays(weekStart, 6).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => setDayFocus(addDays(dayFocus, -1))}>
              ‹ Prev day
            </Button>
            <Button variant="ghost" onClick={() => setDayFocus(startOfDay(new Date()))}>
              Today
            </Button>
            <Button variant="ghost" onClick={() => setDayFocus(addDays(dayFocus, 1))}>
              Next ›
            </Button>
            <p className="text-sm font-semibold text-ink-secondary">
              {dayFocus.toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Select
          value={filterPro}
          onChange={(e) => setFilterPro(e.target.value)}
          className="max-w-[12rem] text-sm"
        >
          <option value="">All therapists</option>
          {team.map((p) => (
            <option key={p.id} value={p.id}>
              {proName(p)}
            </option>
          ))}
        </Select>
        <Select
          value={filterRoom}
          onChange={(e) => setFilterRoom(e.target.value)}
          className="max-w-[12rem] text-sm"
        >
          <option value="">All rooms</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
        <p className="self-center text-xs font-medium text-ink-muted">
          {visibleBookings.length} session{visibleBookings.length === 1 ? "" : "s"} shown
        </p>
      </div>

      <div className="mt-4 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
        {view === "week" ? (
          <div className="overflow-x-auto rounded-2xl border border-hairline bg-surface">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-hairline">
                <div />
                {days.map((d) => {
                  const today = toDateInput(d) === toDateInput(new Date());
                  return (
                    <button
                      key={d.toISOString()}
                      type="button"
                      onClick={() => {
                        setDayFocus(startOfDay(d));
                        setView("staff");
                      }}
                      className="px-2 py-2.5 text-center hover:bg-clay/40"
                      title="Open staff day view"
                    >
                      <p className="text-[11px] font-medium uppercase text-ink-muted">
                        {d.toLocaleDateString(undefined, { weekday: "short" })}
                      </p>
                      <p
                        className={`mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                          today ? "bg-forest text-white" : "text-foreground"
                        }`}
                      >
                        {d.getDate()}
                      </p>
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-[56px_repeat(7,1fr)]">
                <div className="relative" style={{ height: hours.length * HOUR_PX }}>
                  {hours.map((h, i) => (
                    <span
                      key={h}
                      className="absolute right-2 -translate-y-1/2 text-[11px] tabular-nums text-ink-muted"
                      style={{ top: i * HOUR_PX }}
                    >
                      {h}:00
                    </span>
                  ))}
                </div>
                {days.map((d) => {
                  const dayIso = toDateInput(d);
                  const dayBookings = visibleBookings.filter(
                    (b) => toDateInput(new Date(b.startTime)) === dayIso,
                  );
                  const lanes = laneLayout(dayBookings);
                  return (
                    <div
                      key={dayIso}
                      className="relative border-l border-hairline"
                      style={{ height: hours.length * HOUR_PX }}
                    >
                      {hours.map((_, i) => (
                        <div
                          key={i}
                          className="absolute inset-x-0 border-t border-hairline/60"
                          style={{ top: i * HOUR_PX }}
                        />
                      ))}
                      {dayBookings.map((b) => {
                        const s = new Date(b.startTime);
                        const e = new Date(b.endTime);
                        const layout = lanes.get(b.id) ?? { lane: 0, lanes: 1 };
                        const widthPct = 100 / layout.lanes;
                        return (
                          <EventBlock
                            key={b.id}
                            b={b}
                            compact={layout.lanes > 1}
                            selected={selected}
                            setDraft={setDraft}
                            setSelected={setSelected}
                            style={{
                              top: bookingTop(s),
                              height: bookingHeight(s, e),
                              left: `calc(${layout.lane * widthPct}% + 2px)`,
                              width: `calc(${widthPct}% - 4px)`,
                            }}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : view === "staff" ? (
          team.length === 0 && !filterPro ? (
            <EmptyState
              title="Add your team first"
              body="Multi-therapist day view needs practitioners. Add them under Team, then assign rooms when booking."
              action={
                <Button onClick={() => (window.location.href = "/dashboard/team")}>
                  Manage team
                </Button>
              }
            />
          ) : (
            <ResourceDayGrid
              columns={staffColumns}
              kind="staff"
              visibleBookings={visibleBookings}
              dayFocus={dayFocus}
              selected={selected}
              setDraft={setDraft}
              setSelected={setSelected}
            />
          )
        ) : rooms.length === 0 ? (
          <EmptyState
            title="Add treatment rooms"
            body="Room view shows concurrent sessions side-by-side by space. Create rooms, then assign them on each appointment."
            action={
              <Button onClick={() => (window.location.href = "/dashboard/rooms")}>
                Manage rooms
              </Button>
            }
          />
        ) : (
          <ResourceDayGrid
            columns={roomColumns}
            kind="rooms"
            visibleBookings={visibleBookings}
            dayFocus={dayFocus}
            selected={selected}
            setDraft={setDraft}
            setSelected={setSelected}
          />
        )}

        {/* Side panel */}
        <aside className="h-fit rounded-2xl border border-hairline bg-surface p-5 xl:sticky xl:top-24">
          {draft ? (
            <form onSubmit={createDraft} className="space-y-4">
              <h2 className="font-display text-xl text-forest">New appointment</h2>
              <p className="text-xs font-medium text-ink-muted">
                Assign therapist + room so parallel sessions don&apos;t clash.
              </p>
              <Field label="Client email" hint="They need an AyurPass wellness-seeker account.">
                <Input
                  type="email"
                  required
                  value={draft.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                  placeholder="client@example.com"
                />
              </Field>
              <Field label="Session">
                <Select
                  required
                  value={draft.serviceId}
                  onChange={(e) => setDraft({ ...draft, serviceId: e.target.value })}
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.durationMinutes} min)
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date">
                  <Input
                    type="date"
                    required
                    value={draft.date}
                    onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                  />
                </Field>
                <Field label="Time">
                  <Input
                    type="time"
                    required
                    value={draft.time}
                    onChange={(e) => setDraft({ ...draft, time: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Practitioner">
                <Select
                  value={draft.professionalId}
                  onChange={(e) => setDraft({ ...draft, professionalId: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {team.map((p) => (
                    <option key={p.id} value={p.id}>
                      {proName(p)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Room">
                <Select
                  value={draft.roomId}
                  onChange={(e) => setDraft({ ...draft, roomId: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Repeat appointment">
                  <Select
                    value={draft.recurrence ?? "none"}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        recurrence: e.target.value as "none" | "weekly" | "biweekly" | "monthly",
                      })
                    }
                  >
                    <option value="none">Does not repeat</option>
                    <option value="weekly">Repeats weekly</option>
                    <option value="biweekly">Every 2 weeks</option>
                    <option value="monthly">Monthly</option>
                  </Select>
                </Field>
                {draft.recurrence && draft.recurrence !== "none" ? (
                  <Field label="Occurrences">
                    <Select
                      value={String(draft.recurrenceCount ?? 4)}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          recurrenceCount: parseInt(e.target.value, 10),
                        })
                      }
                    >
                      <option value="2">2 sessions</option>
                      <option value="4">4 sessions (1 mo)</option>
                      <option value="6">6 sessions</option>
                      <option value="8">8 sessions (2 mo)</option>
                      <option value="12">12 sessions (3 mo)</option>
                    </Select>
                  </Field>
                ) : (
                  <div className="flex items-end pb-2 text-xs text-ink-muted">
                    Single session
                  </div>
                )}
              </div>
              <Field label="Notes">
                <Textarea
                  rows={2}
                  value={draft.notes}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                />
              </Field>
              <ErrorNote message={error} />
              <div className="flex gap-3">
                <Button type="submit" disabled={busy || services.length === 0}>
                  {busy ? "Creating…" : "Create"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setDraft(null)}>
                  Close
                </Button>
              </div>
            </form>
          ) : selected ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-xl text-forest">
                    {selectedService?.name ?? "Appointment"}
                  </h2>
                  <BookingStatusBadge status={selected.status} />
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  {selected.consumer?.user?.fullName ?? selected.consumer?.user?.email ?? "Client"}
                  {selected.totalAmount != null && ` · ${formatMoney(selected.totalAmount)}`}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <PaymentBadge status={selected.paymentStatus} />
                  {selected.professional?.user?.fullName ? (
                    <span className="rounded-full bg-clay px-2 py-0.5 text-[11px] font-semibold text-forest">
                      {selected.professional.user.fullName}
                    </span>
                  ) : null}
                  {selected.room?.name ? (
                    <span className="rounded-full bg-clay px-2 py-0.5 text-[11px] font-semibold text-forest">
                      {selected.room.name}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Date">
                  <Input
                    type="date"
                    value={toDateInput(new Date(selected.startTime))}
                    onChange={(e) => {
                      const t = toTimeInput(new Date(selected.startTime));
                      const start = new Date(`${e.target.value}T${t}:00`);
                      const mins =
                        (new Date(selected.endTime).getTime() -
                          new Date(selected.startTime).getTime()) /
                        60_000;
                      const end = new Date(start.getTime() + mins * 60_000);
                      void saveSelected({
                        startTime: start.toISOString(),
                        endTime: end.toISOString(),
                      });
                    }}
                  />
                </Field>
                <Field label="Time">
                  <Input
                    type="time"
                    value={toTimeInput(new Date(selected.startTime))}
                    onChange={(e) => {
                      const d = toDateInput(new Date(selected.startTime));
                      const start = new Date(`${d}T${e.target.value}:00`);
                      const mins =
                        (new Date(selected.endTime).getTime() -
                          new Date(selected.startTime).getTime()) /
                        60_000;
                      const end = new Date(start.getTime() + mins * 60_000);
                      void saveSelected({
                        startTime: start.toISOString(),
                        endTime: end.toISOString(),
                      });
                    }}
                  />
                </Field>
              </div>

              <Field label="Practitioner">
                <Select
                  value={selected.professionalId ?? ""}
                  onChange={(e) =>
                    void saveSelected({ professionalId: e.target.value || null })
                  }
                >
                  <option value="">Unassigned</option>
                  {team.map((p) => (
                    <option key={p.id} value={p.id}>
                      {proName(p)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Room">
                <Select
                  value={selected.roomId ?? ""}
                  onChange={(e) => void saveSelected({ roomId: e.target.value || null })}
                >
                  <option value="">Unassigned</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Status">
                <Select
                  value={selected.status}
                  onChange={(e) =>
                    void saveSelected({
                      status: e.target.value as Booking["status"],
                    })
                  }
                >
                  {["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"].map(
                    (s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ),
                  )}
                </Select>
              </Field>

              <ErrorNote message={error} />

              <div className="flex flex-wrap gap-2">
                {selected.paymentStatus !== "paid" && (
                  <>
                    <Button
                      type="button"
                      variant="soft"
                      disabled={busy}
                      onClick={() => void payAction("CASH")}
                    >
                      Paid Cash
                    </Button>
                    <Button
                      type="button"
                      variant="soft"
                      disabled={busy}
                      onClick={() => void payAction("CARD_TERMINAL")}
                    >
                      Paid Card (Counter)
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => void payAction("STRIPE_ONLINE")}
                    >
                      Stripe (Online)
                    </Button>
                  </>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy || selected.paymentStatus !== "paid"}
                  onClick={() => void payAction("refund")}
                >
                  Refund
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => downloadBookingIcs(selected)}
                >
                  .ics
                </Button>
                <Button type="button" variant="ghost" onClick={() => setSelected(null)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-ink-secondary">
              <h2 className="font-display text-xl text-forest">Multi-resource day</h2>
              <p>
                Use <strong className="text-foreground">By therapist</strong> to see everyone
                working in parallel, or <strong className="text-foreground">By room</strong> to
                balance spaces.
              </p>
              <ul className="list-disc space-y-1 pl-4 text-xs font-medium text-ink-muted">
                <li>Same time slot is fine for different therapists and rooms</li>
                <li>Double-booking one therapist or one room is blocked</li>
                <li>Click a session to reassign staff, room, or time</li>
              </ul>
              <Button
                className="mt-2 w-full"
                onClick={() => {
                  setDraft({
                    email: "",
                    serviceId: services[0]?.id ?? "",
                    date: toDateInput(view === "week" ? new Date() : dayFocus),
                    time: "10:00",
                    roomId: rooms[0]?.id ?? "",
                    professionalId: team[0]?.id ?? "",
                    notes: "",
                    recurrence: "none",
                    recurrenceCount: 4,
                  });
                }}
              >
                <PlusIcon className="h-4 w-4" />
                Book concurrent session
              </Button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function dayBookingsForResource(
  bookings: Booking[],
  dayFocus: Date,
  resourceId: string,
  kind: "staff" | "rooms",
): Booking[] {
  const dayIso = toDateInput(dayFocus);
  return bookings.filter((b) => {
    if (toDateInput(new Date(b.startTime)) !== dayIso) return false;
    if (kind === "staff") {
      const pid = b.professionalId ?? "__unassigned__";
      return pid === resourceId;
    }
    const rid = b.roomId ?? "__unassigned__";
    return rid === resourceId;
  });
}

function EventBlock({
  b,
  style,
  compact,
  selected,
  setDraft,
  setSelected,
}: {
  b: Booking;
  style: React.CSSProperties;
  compact?: boolean;
  selected: Booking | null;
  setDraft: (d: DraftAppointment | null) => void;
  setSelected: (b: Booking | null) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        setDraft(null);
        setSelected(b);
      }}
      className={`absolute overflow-hidden rounded-md border px-1 py-0.5 text-left text-[10px] leading-tight transition-shadow hover:shadow-md sm:text-[11px] ${
        STATUS_BLOCK[b.status] ?? STATUS_BLOCK.COMPLETED
      } ${selected?.id === b.id ? "ring-2 ring-gold z-10" : ""}`}
      style={style}
    >
      <span className="block truncate font-semibold">{b.service?.name ?? "Session"}</span>
      {!compact ? (
        <span className="block truncate opacity-85">
          {b.consumer?.user?.fullName ?? "Client"}
          {b.professional?.user?.fullName ? ` · ${b.professional.user.fullName}` : ""}
          {b.room?.name ? ` · ${b.room.name}` : ""}
        </span>
      ) : null}
    </button>
  );
}

function ResourceDayGrid({
  columns,
  kind,
  visibleBookings,
  dayFocus,
  selected,
  setDraft,
  setSelected,
}: {
  columns: { id: string; label: string; color: string }[];
  kind: "staff" | "rooms";
  visibleBookings: Booking[];
  dayFocus: Date;
  selected: Booking | null;
  setDraft: (d: DraftAppointment | null) => void;
  setSelected: (b: Booking | null) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-hairline bg-surface">
      <div
        className="min-w-[640px]"
        style={{
          display: "grid",
          gridTemplateColumns: `56px repeat(${columns.length}, minmax(120px, 1fr))`,
        }}
      >
        <div className="border-b border-hairline" />
        {columns.map((c) => (
          <div
            key={c.id}
            className="border-b border-l border-hairline px-2 py-2.5 text-center"
          >
            <p className="truncate text-xs font-bold text-forest">{c.label}</p>
            <p className="mt-0.5 text-[10px] font-medium text-ink-muted">
              {dayBookingsForResource(visibleBookings, dayFocus, c.id, kind).length} session
              {dayBookingsForResource(visibleBookings, dayFocus, c.id, kind).length === 1 ? "" : "s"}
            </p>
          </div>
        ))}
        <div className="relative" style={{ height: hours.length * HOUR_PX }}>
          {hours.map((h, i) => (
            <span
              key={h}
              className="absolute right-2 -translate-y-1/2 text-[11px] tabular-nums text-ink-muted"
              style={{ top: i * HOUR_PX }}
            >
              {h}:00
            </span>
          ))}
        </div>
        {columns.map((c) => {
          const items = dayBookingsForResource(visibleBookings, dayFocus, c.id, kind);
          const lanes = laneLayout(items);
          return (
            <div
              key={c.id}
              className="relative border-l border-hairline"
              style={{ height: hours.length * HOUR_PX }}
            >
              {hours.map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-x-0 border-t border-hairline/50"
                  style={{ top: i * HOUR_PX }}
                />
              ))}
              {items.map((b) => {
                const s = new Date(b.startTime);
                const e = new Date(b.endTime);
                const layout = lanes.get(b.id) ?? { lane: 0, lanes: 1 };
                const widthPct = 100 / layout.lanes;
                return (
                  <EventBlock
                    key={b.id}
                    b={b}
                    compact={layout.lanes > 1}
                    selected={selected}
                    setDraft={setDraft}
                    setSelected={setSelected}
                    style={{
                      top: bookingTop(s),
                      height: bookingHeight(s, e),
                      left: `calc(${layout.lane * widthPct}% + 2px)`,
                      width: `calc(${widthPct}% - 4px)`,
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
