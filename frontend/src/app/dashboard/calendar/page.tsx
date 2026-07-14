"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, formatMoney } from "@/lib/api";
import { downloadBookingIcs } from "@/lib/ics";
import type { Booking, Professional, Room, Service } from "@/lib/types";
import { BookingStatusBadge } from "@/components/BookingStatusBadge";
import { PaymentBadge } from "@/components/PaymentBadge";
import { PlusIcon } from "@/components/icons";
import { Button, EmptyState, ErrorNote, Field, Input, Select, Textarea } from "@/components/ui";

const OPEN_HOUR = 8;
const CLOSE_HOUR = 19;
const HOUR_PX = 52;

function startOfWeek(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (date.getDay() + 6) % 7; // Monday = 0
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

const STATUS_BLOCK: Record<string, string> = {
  PENDING: "border-gold bg-gold-soft text-forest",
  CONFIRMED: "border-forest bg-forest text-white",
  IN_PROGRESS: "border-forest bg-leaf text-white",
  COMPLETED: "border-hairline bg-clay text-ink-secondary",
};

interface DraftAppointment {
  email: string;
  serviceId: string;
  date: string;
  time: string;
  roomId: string;
  professionalId: string;
  notes: string;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const provider = user?.provider ?? user?.professional?.provider ?? null;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [team, setTeam] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [selected, setSelected] = useState<Booking | null>(null);
  const [draft, setDraft] = useState<DraftAppointment | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!provider) return;
    api.bookingsByProvider(provider.id).then(setBookings).catch(() => {});
    api.roomsByProvider(provider.id).then(setRooms).catch(() => {});
    api.professionalsByProvider(provider.id).then(setTeam).catch(() => {});
    api.servicesByProvider(provider.id).then(setServices).catch(() => {});
  }, [provider]);

  useEffect(reload, [reload]);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const weekBookings = useMemo(() => {
    const end = addDays(weekStart, 7);
    return bookings.filter((b) => {
      const s = new Date(b.startTime);
      return s >= weekStart && s < end && b.status !== "CANCELLED" && b.status !== "NO_SHOW";
    });
  }, [bookings, weekStart]);

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
    } catch {
      setError("The appointment couldn't be updated.");
    } finally {
      setBusy(false);
    }
  }

  async function payAction(kind: "pay" | "refund") {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      const updated =
        kind === "pay" ? await api.payBooking(selected.id) : await api.refundBooking(selected.id);
      setSelected({ ...selected, ...updated });
      reload();
    } catch {
      setError(kind === "pay" ? "Payment failed." : "Refund failed.");
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
      const created = await api.createBooking({
        consumerId: client.id,
        serviceId: svc.id,
        providerId: provider.id,
        professionalId: draft.professionalId || undefined,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notes: draft.notes.trim() || undefined,
      });
      await api.updateBooking(created.id, {
        status: "CONFIRMED",
        ...(draft.roomId ? { roomId: draft.roomId } : {}),
      });
      setDraft(null);
      reload();
    } catch {
      setError(
        "The appointment couldn't be created — the client may not have a wellness-seeker profile.",
      );
    } finally {
      setBusy(false);
    }
  }

  const hours = Array.from({ length: CLOSE_HOUR - OPEN_HOUR }, (_, i) => OPEN_HOUR + i);
  const selectedService = selected
    ? (selected.service ?? services.find((s) => s.id === selected.serviceId))
    : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-forest">Calendar</h1>
          <p className="mt-1 text-ink-muted">
            Manage appointments — click one to edit, assign a room and practitioner, or collect
            payment.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelected(null);
            setDraft({
              email: "",
              serviceId: services[0]?.id ?? "",
              date: toDateInput(new Date()),
              time: "10:00",
              roomId: "",
              professionalId: "",
              notes: "",
            });
          }}
        >
          <PlusIcon className="h-4 w-4" />
          New appointment
        </Button>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="ghost" onClick={() => setWeekStart(addDays(weekStart, -7))}>
          ‹ Prev
        </Button>
        <Button variant="ghost" onClick={() => setWeekStart(startOfWeek(new Date()))}>
          This week
        </Button>
        <Button variant="ghost" onClick={() => setWeekStart(addDays(weekStart, 7))}>
          Next ›
        </Button>
        <p className="ml-2 text-sm font-medium text-ink-secondary">
          {weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })} –{" "}
          {addDays(weekStart, 6).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="mt-4 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Week grid */}
        <div className="overflow-x-auto rounded-2xl border border-hairline bg-surface">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-hairline">
              <div />
              {days.map((d) => {
                const today = toDateInput(d) === toDateInput(new Date());
                return (
                  <div key={d.toISOString()} className="px-2 py-2.5 text-center">
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
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-[56px_repeat(7,1fr)]">
              {/* Hour labels */}
              <div className="relative" style={{ height: hours.length * HOUR_PX }}>
                {hours.map((h, i) => (
                  <span
                    key={h}
                    className="absolute right-2 -translate-y-1/2 text-[11px] text-ink-muted tabular-nums"
                    style={{ top: i * HOUR_PX }}
                  >
                    {h}:00
                  </span>
                ))}
              </div>
              {days.map((d) => {
                const dayIso = toDateInput(d);
                const dayBookings = weekBookings.filter(
                  (b) => toDateInput(new Date(b.startTime)) === dayIso,
                );
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
                      const top =
                        ((s.getHours() + s.getMinutes() / 60 - OPEN_HOUR) * HOUR_PX);
                      const height = Math.max(
                        22,
                        ((e.getTime() - s.getTime()) / 3_600_000) * HOUR_PX - 2,
                      );
                      return (
                        <button
                          key={b.id}
                          onClick={() => {
                            setDraft(null);
                            setSelected(b);
                          }}
                          className={`absolute inset-x-1 overflow-hidden rounded-lg border px-1.5 py-1 text-left text-[11px] leading-tight transition-shadow hover:shadow-md ${
                            STATUS_BLOCK[b.status] ?? STATUS_BLOCK.COMPLETED
                          } ${selected?.id === b.id ? "ring-2 ring-gold" : ""}`}
                          style={{ top, height }}
                        >
                          <span className="block truncate font-semibold">
                            {b.service?.name ?? "Session"}
                          </span>
                          <span className="block truncate opacity-80">
                            {b.consumer?.user?.fullName ?? "Client"}
                            {b.room?.name ? ` · ${b.room.name}` : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Side panel: editor or draft form */}
        <aside className="h-fit rounded-2xl border border-hairline bg-surface p-6 xl:sticky xl:top-24">
          {draft ? (
            <form onSubmit={createDraft} className="space-y-4">
              <h2 className="font-display text-xl text-forest">New appointment</h2>
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
              <Field label="Practitioner">
                <Select
                  value={draft.professionalId}
                  onChange={(e) => setDraft({ ...draft, professionalId: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {team.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user?.fullName ?? p.title ?? "Practitioner"}
                    </option>
                  ))}
                </Select>
              </Field>
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
                  {busy ? "Creating…" : "Create appointment"}
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
                <div className="mt-2 flex items-center gap-2">
                  <PaymentBadge status={selected.paymentStatus} />
                  {selected.providerPayout != null && (
                    <span className="text-xs text-ink-muted">
                      payout {formatMoney(selected.providerPayout)}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Date">
                  <Input
                    type="date"
                    value={toDateInput(new Date(selected.startTime))}
                    onChange={(e) => {
                      const t = new Date(selected.startTime);
                      const [y, m, d] = e.target.value.split("-").map(Number);
                      const start = new Date(y, m - 1, d, t.getHours(), t.getMinutes());
                      const dur =
                        new Date(selected.endTime).getTime() -
                        new Date(selected.startTime).getTime();
                      void saveSelected({
                        startTime: start.toISOString(),
                        endTime: new Date(start.getTime() + dur).toISOString(),
                      });
                    }}
                  />
                </Field>
                <Field label="Time">
                  <Input
                    type="time"
                    value={toTimeInput(new Date(selected.startTime))}
                    onChange={(e) => {
                      const [h, min] = e.target.value.split(":").map(Number);
                      const start = new Date(selected.startTime);
                      start.setHours(h, min, 0, 0);
                      const dur =
                        new Date(selected.endTime).getTime() -
                        new Date(selected.startTime).getTime();
                      void saveSelected({
                        startTime: start.toISOString(),
                        endTime: new Date(start.getTime() + dur).toISOString(),
                      });
                    }}
                  />
                </Field>
              </div>

              <Field label="Room">
                <Select
                  value={selected.roomId ?? ""}
                  onChange={(e) => void saveSelected({ roomId: e.target.value || null })}
                >
                  <option value="">Unassigned</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                      {r.hourlyCost != null ? ` (${formatMoney(r.hourlyCost)}/h)` : ""}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Practitioner">
                <Select
                  value={selected.professionalId ?? ""}
                  onChange={(e) => void saveSelected({ professionalId: e.target.value || null })}
                >
                  <option value="">Unassigned</option>
                  {team.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user?.fullName ?? p.title ?? "Practitioner"}
                    </option>
                  ))}
                </Select>
              </Field>

              {selected.notes && (
                <p className="rounded-xl bg-clay/60 px-3.5 py-2.5 text-sm text-ink-secondary">
                  “{selected.notes}”
                </p>
              )}
              <ErrorNote message={error} />

              <div className="flex flex-wrap gap-2 border-t border-hairline pt-4">
                {selected.status === "PENDING" && (
                  <Button disabled={busy} onClick={() => void saveSelected({ status: "CONFIRMED" })}>
                    Confirm
                  </Button>
                )}
                {(selected.status === "PENDING" || selected.status === "CONFIRMED") && (
                  <Button
                    variant="ghost"
                    disabled={busy}
                    onClick={() => void saveSelected({ status: "COMPLETED" })}
                  >
                    Complete
                  </Button>
                )}
                {selected.paymentStatus === "unpaid" && selected.status !== "CANCELLED" && (
                  <Button disabled={busy} onClick={() => void payAction("pay")}>
                    Collect payment
                  </Button>
                )}
                {selected.paymentStatus === "paid" && (
                  <Button variant="ghost" disabled={busy} onClick={() => void payAction("refund")}>
                    Refund
                  </Button>
                )}
                <Button variant="ghost" onClick={() => downloadBookingIcs(selected)}>
                  Add to calendar (.ics)
                </Button>
                {selected.status !== "CANCELLED" && (
                  <Button
                    variant="danger"
                    disabled={busy}
                    onClick={() => {
                      if (window.confirm("Cancel this appointment?"))
                        void saveSelected({ status: "CANCELLED" }).then(() => setSelected(null));
                    }}
                  >
                    Cancel appointment
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-ink-muted">
              Select an appointment in the grid to edit it — reschedule, assign a room and
              practitioner, confirm, collect payment or export it to your calendar.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
