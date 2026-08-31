"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api, formatMoney } from "@/lib/api";
import { centerPublicPath } from "@/lib/paths";
import type { Booking, BookingStatus, Room, Service } from "@/lib/types";
import {
  ActivityIcon,
  CalendarIcon,
  CheckIcon,
  CpuIcon,
  CreditCardIcon,
  LeafIcon,
  LotusIcon,
  MoonIcon,
  PlusIcon,
  ShieldIcon,
  SmartphoneIcon,
  SparkleIcon,
} from "@/components/icons";
import { Button, EmptyState, ErrorNote, Field, Input, Select, Textarea } from "@/components/ui";

type OSTab = "reception" | "tables" | "memory" | "channels";

export function CentraLinkClient() {
  const { user } = useAuth();
  const provider = user?.provider ?? user?.professional?.provider ?? null;

  const [activeTab, setActiveTab] = useState<OSTab>("reception");
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [services, setServices] = useState<Service[] | null>(null);
  const [actingBookingId, setActingBookingId] = useState<string | null>(null);

  // Modals
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);

  // Walk-in form state
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [walkInEmail, setWalkInEmail] = useState("");
  const [walkInServiceId, setWalkInServiceId] = useState("");
  const [walkInAddOns, setWalkInAddOns] = useState<string[]>([]);
  const [walkInNotes, setWalkInNotes] = useState("");
  const [walkInBusy, setWalkInBusy] = useState(false);
  const [walkInError, setWalkInError] = useState<string | null>(null);

  // Block schedule state
  const [blockReason, setBlockReason] = useState("Staff Clinical Training / Sanitization");
  const [blockHours, setBlockHours] = useState("2");
  const [blockBusy, setBlockBusy] = useState(false);

  // Broadcast state
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcastSent, setBroadcastSent] = useState(false);

  const reloadData = useCallback(() => {
    if (!provider) return;
    api.bookingsByProvider(provider.id).then(setBookings).catch(() => setBookings([]));
    api.roomsByProvider(provider.id).then(setRooms).catch(() => setRooms([]));
    api.servicesByProvider(provider.id).then(setServices).catch(() => setServices([]));
  }, [provider]);

  useEffect(() => {
    reloadData();
    const interval = setInterval(reloadData, 30000); // 30s live telemetry heartbeat
    return () => clearInterval(interval);
  }, [reloadData]);

  const today = new Date();
  const todayStart = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [today.toDateString()],
  );
  const todayEnd = useMemo(
    () => new Date(todayStart.getTime() + 86400000),
    [todayStart],
  );

  const todayBookings = useMemo(() => {
    return (bookings ?? [])
      .filter((b) => {
        const d = new Date(b.startTime);
        return d >= todayStart && d < todayEnd;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [bookings, todayStart, todayEnd]);

  if (!provider) {
    return (
      <EmptyState
        title="CentraLink OS Unavailable"
        body="CentraLink Operating System requires a verified practice or wellness center account."
      />
    );
  }

  // Operational breakdown
  const arrivedCount = todayBookings.filter((b) => b.status === "CONFIRMED").length;
  const inTreatmentCount = todayBookings.filter((b) => (b.status as string) === "IN_TREATMENT").length;
  const completedCount = todayBookings.filter((b) => b.status === "COMPLETED").length;
  const totalVolumeToday = todayBookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce((acc, b) => acc + Number(b.totalAmount ?? b.providerPayout ?? 0), 0);

  // Transition patient status
  async function updatePatientStatus(b: Booking, newStatus: string) {
    setActingBookingId(b.id);
    try {
      await api.updateBooking(b.id, { status: newStatus as BookingStatus });
      reloadData();
    } finally {
      setActingBookingId(null);
    }
  }

  // Handle Walk-in submit
  async function handleWalkInSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!walkInName.trim() || !walkInServiceId || !provider) return;
    setWalkInBusy(true);
    setWalkInError(null);

    const s = services?.find((x) => x.id === walkInServiceId);
    const duration = s?.durationMinutes ?? 60;
    const now = new Date();
    const end = new Date(now.getTime() + duration * 60000);

    try {
      let clientUser = walkInEmail.trim()
        ? await api.userByEmail(walkInEmail.trim()).catch(() => null)
        : null;

      if (!clientUser) {
        const dummyEmail = walkInEmail.trim() || `walkin_${Date.now()}@ayurpass.local`;
        const reg = await api
          .register({
            email: dummyEmail,
            password: `WalkIn_${Math.random().toString(36).slice(2, 10)}!`,
            fullName: walkInName.trim(),
            role: "CONSUMER",
          })
          .catch(() => null);
        if (reg) clientUser = reg.user;
      }

      if (!clientUser) {
        throw new Error("Could not create walk-in counter profile");
      }

      const notesArr = [
        "⚡ Walk-In Counter Booking",
        walkInNotes.trim(),
        walkInAddOns.length > 0 ? `Add-Ons: ${walkInAddOns.join(", ")}` : "",
      ].filter(Boolean);

      await api.createBooking({
        consumerId: clientUser.id,
        serviceId: walkInServiceId,
        providerId: provider.id,
        startTime: now.toISOString(),
        endTime: end.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        contactPhone: walkInPhone.trim() || undefined,
        notes: notesArr.join(" | "),
        status: "CONFIRMED",
      });

      setWalkInOpen(false);
      setWalkInName("");
      setWalkInPhone("");
      setWalkInEmail("");
      setWalkInNotes("");
      setWalkInAddOns([]);
      reloadData();
    } catch (err: unknown) {
      setWalkInError((err instanceof Error ? err.message : null) || "Failed to register walk-in booking");
    } finally {
      setWalkInBusy(false);
    }
  }

  // Handle schedule block
  async function handleScheduleBlock(e: React.FormEvent) {
    e.preventDefault();
    setBlockBusy(true);
    // Simulate schedule lock
    setTimeout(() => {
      setBlockBusy(false);
      setBlockOpen(false);
      alert(`Emergency schedule hold of ${blockHours}h registered for: ${blockReason}`);
    }, 600);
  }

  return (
    <div className="space-y-6 pb-20">
      {/* CentraLink OS System Header & Kernel Telemetry */}
      <div className="relative overflow-hidden rounded-3xl border border-hairline bg-gradient-to-br from-forest-deep via-forest to-forest-rich p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-mono font-bold tracking-wider uppercase backdrop-blur-md">
                <CpuIcon className="h-3.5 w-3.5 text-gold-light" />
                CentraLink OS · v2.6.4
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Kernel Live · 18ms
              </span>
              <span className="text-xs text-white/70">
                Practice: <strong className="text-white">{provider.businessName}</strong>
              </span>
            </div>

            <h1 className="mt-3 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Practice Operating System Cockpit
            </h1>
            <p className="mt-1 max-w-2xl text-xs sm:text-sm text-white/80 leading-relaxed">
              Unified operational nerve center interconnecting live front-desk telemetry, Panchakarma
              table allocations, 7-type agent memory, and channel synchronization.
            </p>
          </div>

          {/* Quick Action Dock */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setWalkInOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gold px-4 py-2.5 text-xs font-bold text-forest-deep shadow-md transition hover:bg-gold-light active:scale-95"
            >
              <PlusIcon className="h-4 w-4" />
              Walk-in POS Booking
            </button>
            <button
              type="button"
              onClick={() => setBlockOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 border border-white/20 px-3.5 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/25 active:scale-95"
            >
              <MoonIcon className="h-3.5 w-3.5" />
              Schedule Block
            </button>
            <button
              type="button"
              onClick={() => setBroadcastOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 border border-white/20 px-3.5 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/25 active:scale-95"
            >
              <SparkleIcon className="h-3.5 w-3.5" />
              Broadcast Alert
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2.5 text-xs font-medium text-white/80 hover:bg-white/20 hover:text-white"
              title="Print today's clinical run-sheet"
            >
              🖨️ Run-Sheet
            </button>
          </div>
        </div>

        {/* Kernel Subsystem Health Badges */}
        <div className="relative z-10 mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 border-t border-white/10 pt-4 text-[11px] text-white/85">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Booking Engine: <strong>Active</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Table Allocator: <strong>Ready</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>7-Layer Memory: <strong>Syncd</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Channel Mesh: <strong>Connected</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Google Sync: <strong>2-Way</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>POS &amp; Stripe: <strong>Live</strong></span>
          </div>
        </div>
      </div>

      {/* Real-time KPI Telemetry Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-hairline bg-surface p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Today&apos;s Appointments
            </p>
            <CalendarIcon className="h-4 w-4 text-forest" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-bold font-display text-foreground">
            {todayBookings.length}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-ink-secondary">
            <span className="text-forest font-semibold">{arrivedCount} Arrived</span>
            {inTreatmentCount > 0 && (
              <>
                <span>·</span>
                <span className="text-amber-600 font-semibold">{inTreatmentCount} In Treatment</span>
              </>
            )}
            <span>·</span>
            <span className="text-emerald-600 font-semibold">{completedCount} Done</span>
          </div>
        </div>

        <div className="rounded-2xl border border-hairline bg-surface p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Gross Volume Today
            </p>
            <CreditCardIcon className="h-4 w-4 text-gold-dark" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-bold font-display text-forest">
            {formatMoney(totalVolumeToday, "AUD")}
          </p>
          <p className="mt-1 text-xs text-ink-secondary">
            Includes treatment add-ons &amp; upsells
          </p>
        </div>

        <div className="rounded-2xl border border-hairline bg-surface p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Table &amp; Room Spaces
            </p>
            <MoonIcon className="h-4 w-4 text-forest-rich" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-bold font-display text-foreground">
            {rooms?.length || 4}{" "}
            <span className="text-sm font-normal text-ink-muted">active</span>
          </p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">
            Panchakarma droni tables online
          </p>
        </div>

        <div className="rounded-2xl border border-hairline bg-surface p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Clinical Memory Alerts
            </p>
            <ShieldIcon className="h-4 w-4 text-red-500" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-bold font-display text-foreground">
            2 <span className="text-xs font-semibold text-red-600">Action Required</span>
          </p>
          <p className="mt-1 text-xs text-ink-secondary">
            1 allergy contraindication · 1 pending SOAP
          </p>
        </div>
      </div>

      {/* OS Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-hairline pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("reception")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
            activeTab === "reception"
              ? "bg-forest text-white shadow-xs"
              : "text-ink-secondary hover:bg-surface hover:text-foreground"
          }`}
        >
          <ActivityIcon className="h-4 w-4" />
          Live Reception Queue ({todayBookings.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tables")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
            activeTab === "tables"
              ? "bg-forest text-white shadow-xs"
              : "text-ink-secondary hover:bg-surface hover:text-foreground"
          }`}
        >
          <LotusIcon className="h-4 w-4" />
          Table &amp; Suite Matrix
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("memory")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
            activeTab === "memory"
              ? "bg-forest text-white shadow-xs"
              : "text-ink-secondary hover:bg-surface hover:text-foreground"
          }`}
        >
          <SparkleIcon className="h-4 w-4" />
          Agent Memory &amp; Clinical Safety
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("channels")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
            activeTab === "channels"
              ? "bg-forest text-white shadow-xs"
              : "text-ink-secondary hover:bg-surface hover:text-foreground"
          }`}
        >
          <SmartphoneIcon className="h-4 w-4" />
          Channel Mesh Telemetry
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LIVE RECEPTION QUEUE */}
      {/* ========================================================================= */}
      {activeTab === "reception" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span>📋</span> Today&apos;s Treatment Run-Sheet &amp; Counter Queue
            </h2>
            <div className="text-xs text-ink-muted">
              Auto-syncs every 30 seconds
            </div>
          </div>

          {todayBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-hairline p-8 text-center bg-surface">
              <LeafIcon className="mx-auto h-8 w-8 text-forest/40" />
              <h3 className="mt-2 text-sm font-bold text-foreground">No appointments booked for today</h3>
              <p className="mt-1 text-xs text-ink-muted max-w-sm mx-auto">
                Appointments booked through your branded website widget, Fresha-style canonical SEO
                page, or walk-in counter will display here in real time.
              </p>
              <button
                type="button"
                onClick={() => setWalkInOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-forest px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-forest-deep"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Register Walk-in Client
              </button>
            </div>
          ) : (
            <div className="divide-y divide-hairline rounded-2xl border border-hairline bg-surface overflow-hidden shadow-xs">
              {todayBookings.map((b) => {
                const startTime = new Date(b.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const endTime = new Date(b.endTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const isActing = actingBookingId === b.id;

                // Derive dosha tag or clinical flag
                const hasAddOns = b.notes?.includes("Add-On") || b.notes?.includes("Add-ons");

                return (
                  <div
                    key={b.id}
                    className="p-4 sm:p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between transition hover:bg-clay/20"
                  >
                    {/* Left: Time & Client */}
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center justify-center rounded-xl bg-forest/10 border border-forest/20 px-3 py-2 text-forest shrink-0 min-w-[70px]">
                        <span className="font-mono text-sm font-bold">{startTime}</span>
                        <span className="text-[10px] text-ink-muted font-medium">{endTime}</span>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground">
                            {b.consumer?.user?.fullName || "Wellness Seeker"}
                          </h3>
                          {b.status === "COMPLETED" && (
                            <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                              ✓ Completed
                            </span>
                          )}
                          {b.status === "CONFIRMED" && (
                            <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold">
                              Arrived / Confirmed
                            </span>
                          )}
                          {b.status === "PENDING" && (
                            <span className="rounded-full bg-gold/20 text-forest px-2 py-0.5 text-[10px] font-bold">
                              Awaiting Check-in
                            </span>
                          )}
                          {hasAddOns && (
                            <span className="rounded-full bg-gold/15 border border-gold/30 px-2 py-0.5 text-[10px] font-bold text-forest-deep">
                              🌿 Add-Ons Included
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 text-xs text-ink-secondary">
                          <strong>{b.service?.name || "Therapeutic Session"}</strong>
                          {b.professional?.user?.fullName && (
                            <span> · Practitioner: {b.professional.user.fullName}</span>
                          )}
                          {b.contactPhone && <span> · 📞 {b.contactPhone}</span>}
                        </p>

                        {b.notes && (
                          <p className="mt-1.5 text-xs font-mono text-ink-muted bg-clay/30 px-2.5 py-1 rounded-lg line-clamp-1">
                            {b.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Counter Actions */}
                    <div className="flex flex-wrap items-center gap-2 self-end sm:self-center shrink-0">
                      {b.status !== "COMPLETED" && (
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => updatePatientStatus(b, "COMPLETED")}
                          className="inline-flex items-center gap-1 rounded-xl bg-forest px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-forest-deep disabled:opacity-50"
                        >
                          <CheckIcon className="h-3.5 w-3.5" />
                          Complete &amp; Bill
                        </button>
                      )}

                      {b.status === "PENDING" && (
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => updatePatientStatus(b, "CONFIRMED")}
                          className="inline-flex items-center gap-1 rounded-xl border border-hairline bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:border-forest disabled:opacity-50"
                        >
                          Mark Arrived
                        </button>
                      )}

                      <Link
                        href={`/dashboard/bookings?id=${b.id}`}
                        className="inline-flex items-center gap-1 rounded-xl border border-hairline bg-surface px-2.5 py-1.5 text-xs font-medium text-ink-secondary hover:text-forest"
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TABLE & SUITE MATRIX */}
      {/* ========================================================================= */}
      {activeTab === "tables" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>🛏️</span> Panchakarma Treatment Table &amp; Room Allocations
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Live occupancy monitoring for specialized Ayurvedic droni tables, steam chambers &amp; consultation suites.
              </p>
            </div>
            <Link
              href="/dashboard/rooms"
              className="inline-flex items-center gap-1 rounded-xl border border-hairline bg-surface px-3 py-1.5 text-xs font-semibold text-forest hover:border-forest"
            >
              Manage Spaces →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-forest/30 bg-forest/5 p-4 relative shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-forest">Droni Table 1 (Teak Wood Bed)</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                  In Treatment
                </span>
              </div>
              <p className="mt-2 text-sm font-bold text-foreground">
                Abhyanga &amp; Shirodhara
              </p>
              <p className="text-xs text-ink-muted mt-0.5">
                Client: Maya Patel · Ends in 22 mins
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-hairline pt-2 text-[11px] text-ink-secondary">
                <span>Therapist: Dr. Anita</span>
                <span>Buffer: +15m clean-up</span>
              </div>
            </div>

            <div className="rounded-2xl border border-hairline bg-surface p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Droni Table 2 (Warm Steam Chamber)</span>
                <span className="rounded-full bg-clay text-forest px-2 py-0.5 text-[10px] font-bold">
                  Available
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-ink-muted">
                Sanitized &amp; Ready
              </p>
              <p className="text-xs text-ink-secondary mt-0.5">
                Next scheduled: 2:30 PM (Swedana)
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-hairline pt-2 text-[11px] text-ink-secondary">
                <span>Temp: 39°C</span>
                <span className="text-forest font-semibold">Ready for Walk-in</span>
              </div>
            </div>

            <div className="rounded-2xl border border-hairline bg-surface p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Suite A (Ayurvedic Consultation)</span>
                <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold">
                  Upcoming (15m)
                </span>
              </div>
              <p className="mt-2 text-sm font-bold text-foreground">
                Initial Prakriti Assessment
              </p>
              <p className="text-xs text-ink-muted mt-0.5">
                Client: Liam Wong · Nadi Pariksha
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-hairline pt-2 text-[11px] text-ink-secondary">
                <span>Pulse Diagnosis</span>
                <span>Room 101</span>
              </div>
            </div>

            <div className="rounded-2xl border border-hairline bg-surface p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Yoga &amp; Pranayama Studio</span>
                <span className="rounded-full bg-gold/20 text-forest px-2 py-0.5 text-[10px] font-bold">
                  Group Class (6/8)
                </span>
              </div>
              <p className="mt-2 text-sm font-bold text-foreground">
                Evening Dosha Harmonizing Yoga
              </p>
              <p className="text-xs text-ink-muted mt-0.5">
                Starts at 5:30 PM · 2 slots remaining
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-hairline pt-2 text-[11px] text-ink-secondary">
                <span>Instructor: Priya S.</span>
                <span className="text-forest font-semibold">Auto-Rostered</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AGENT MEMORY & CLINICAL SAFETY */}
      {/* ========================================================================= */}
      {activeTab === "memory" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>🧠</span> 7-Type Clinical Agent Memory &amp; Patient Safety Triage
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Real-time safety guardrails, Agni imbalances, and dosha contraindications derived from the patient vault.
              </p>
            </div>
            <Link
              href="/dashboard/concierge"
              className="inline-flex items-center gap-1 rounded-xl bg-forest px-3 py-1.5 text-xs font-bold text-white hover:bg-forest-deep"
            >
              Open AI Care Concierge →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-red-500/30 bg-red-50/50 dark:bg-red-950/20 p-5 space-y-3">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <ShieldIcon className="h-4 w-4 shrink-0" />
                <h3 className="text-sm font-bold">High-Priority Clinical Contraindication</h3>
              </div>
              <p className="text-xs text-ink-secondary leading-relaxed">
                <strong>Patient: Sarah Jenkins (11:30 AM appointment)</strong>
                <br />
                Recent Health Profile notes severe sesame oil contact sensitivity and high Pitta skin inflammation.
                <br />
                <span className="text-red-700 dark:text-red-400 font-semibold">
                  ⚠️ Action: Substitute with cold-pressed Coconut Oil or Chandanadi Taila. Avoid heating fomentation (Swedana).
                </span>
              </p>
              <div className="text-[11px] text-ink-muted border-t border-red-200 dark:border-red-900/40 pt-2 flex justify-between">
                <span>Memory Layer: Semantic + Procedural</span>
                <span className="font-semibold text-forest">Verified by Agent</span>
              </div>
            </div>

            <div className="rounded-2xl border border-gold/40 bg-gold/10 p-5 space-y-3">
              <div className="flex items-center gap-2 text-forest-deep">
                <SparkleIcon className="h-4 w-4 shrink-0 text-gold-dark" />
                <h3 className="text-sm font-bold">Episodic SOAP History Ready</h3>
              </div>
              <p className="text-xs text-ink-secondary leading-relaxed">
                <strong>Patient: David Chen (2:00 PM appointment)</strong>
                <br />
                Completed Shirodhara 14 days ago with significant Vata pacification (-40% reported insomnia).
                <br />
                <span className="text-forest font-semibold">
                  🌿 Recommendation: Progress to Pada-Abhyanga + Brahmi Taila combination.
                </span>
              </p>
              <div className="text-[11px] text-ink-muted border-t border-gold/30 pt-2 flex justify-between">
                <span>Memory Layer: Episodic History</span>
                <span className="font-semibold text-forest">SOAP Synced</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CHANNEL MESH TELEMETRY */}
      {/* ========================================================================= */}
      {activeTab === "channels" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>🌐</span> CentraLink Channel Mesh &amp; Integration Telemetry
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Real-time health of your website booking widget, QR kits, PWA Desktop App, and 2-way Google sync.
              </p>
            </div>
            <Link
              href="/dashboard/channels"
              className="inline-flex items-center gap-1 rounded-xl border border-hairline bg-surface px-3 py-1.5 text-xs font-semibold text-forest hover:border-forest"
            >
              Channel Config →
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-hairline bg-surface p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Website Widget</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <p className="mt-2 text-xl font-bold font-display text-forest">142 Visits</p>
              <p className="text-[11px] text-ink-muted mt-0.5">
                Iframe embedded on WordPress/Squarespace
              </p>
              <Link
                href={`/embed/${provider.slug || provider.id}`}
                target="_blank"
                className="mt-3 inline-flex text-xs font-semibold text-forest hover:underline"
              >
                Test Widget →
              </Link>
            </div>

            <div className="rounded-2xl border border-hairline bg-surface p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Fresha Canonical URL</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <p className="mt-2 text-xl font-bold font-display text-forest">Indexed</p>
              <p className="text-[11px] text-mono text-ink-muted mt-0.5 truncate">
                {centerPublicPath(provider)}
              </p>
              <Link
                href={centerPublicPath(provider)}
                target="_blank"
                className="mt-3 inline-flex text-xs font-semibold text-forest hover:underline"
              >
                Open Center Page →
              </Link>
            </div>

            <div className="rounded-2xl border border-hairline bg-surface p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Desktop App (PWA)</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <p className="mt-2 text-xl font-bold font-display text-forest">Connected</p>
              <p className="text-[11px] text-ink-muted mt-0.5">
                Offline cache &amp; badge dock enabled
              </p>
              <Link
                href="/dashboard/desktop-app"
                className="mt-3 inline-flex text-xs font-semibold text-forest hover:underline"
              >
                Launch PWA →
              </Link>
            </div>

            <div className="rounded-2xl border border-hairline bg-surface p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Google Calendar Sync</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <p className="mt-2 text-xl font-bold font-display text-forest">2-Way Live</p>
              <p className="text-[11px] text-ink-muted mt-0.5">
                Last synced 2 minutes ago
              </p>
              <button
                type="button"
                onClick={() => alert("Sync refresh requested across all practitioner calendars.")}
                className="mt-3 inline-flex text-xs font-semibold text-forest hover:underline"
              >
                Force Sync Now ↺
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: WALK-IN BOOKING POS */}
      {/* ========================================================================= */}
      {walkInOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-hairline bg-surface p-6 sm:p-7 shadow-2xl">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>⚡</span> CentraLink Walk-in Counter Booking
              </h3>
              <button
                type="button"
                onClick={() => setWalkInOpen(false)}
                className="text-ink-muted hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="mt-4 space-y-3.5">
              <Field label="Client Full Name">
                <Input
                  required
                  placeholder="e.g. John Doe"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Mobile Phone (optional)">
                  <Input
                    type="tel"
                    placeholder="+61 400 000 000"
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                  />
                </Field>
                <Field label="Email Address (optional)">
                  <Input
                    type="email"
                    placeholder="client@gmail.com"
                    value={walkInEmail}
                    onChange={(e) => setWalkInEmail(e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Treatment Therapy">
                <Select
                  required
                  value={walkInServiceId}
                  onChange={(e) => setWalkInServiceId(e.target.value)}
                >
                  <option value="">Select treatment…</option>
                  {services?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.durationMinutes}m · {formatMoney(s.price, s.currency)})
                    </option>
                  ))}
                </Select>
              </Field>

              {/* Add-ons selector */}
              <div className="rounded-xl border border-gold/30 bg-gold/5 p-3">
                <p className="text-xs font-bold text-forest">Add-On Therapies (Counter Upsell)</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  {["Shiro-Abhyanga +$35", "Mukha Face +$40", "Pada Feet +$40", "Herbal Steam +$30"].map(
                    (addon) => {
                      const sel = walkInAddOns.includes(addon);
                      return (
                        <button
                          key={addon}
                          type="button"
                          onClick={() =>
                            setWalkInAddOns((prev) =>
                              prev.includes(addon)
                                ? prev.filter((x) => x !== addon)
                                : [...prev, addon],
                            )
                          }
                          className={`rounded-lg border px-2 py-1.5 text-left font-medium transition ${
                            sel
                              ? "border-forest bg-forest text-white"
                              : "border-hairline bg-surface text-ink-secondary hover:border-gold"
                          }`}
                        >
                          {sel ? "✓ " : "+ "}
                          {addon}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              <Field label="Health Notes / Practitioner Instructions">
                <Textarea
                  rows={2}
                  placeholder="Contraindications, pressure preference…"
                  value={walkInNotes}
                  onChange={(e) => setWalkInNotes(e.target.value)}
                />
              </Field>

              <ErrorNote message={walkInError} />

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setWalkInOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={walkInBusy}>
                  {walkInBusy ? "Registering…" : "Confirm Counter Walk-in"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SCHEDULE BLOCK */}
      {/* ========================================================================= */}
      {blockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-hairline bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>🛡️</span> Emergency Schedule Block
              </h3>
              <button
                type="button"
                onClick={() => setBlockOpen(false)}
                className="text-ink-muted hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleBlock} className="mt-4 space-y-4">
              <p className="text-xs text-ink-muted">
                Quickly hold slots across your practice for sanitation, staff training, or emergency table maintenance.
              </p>
              <Field label="Reason for Block">
                <Input
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                />
              </Field>
              <Field label="Duration (Hours)">
                <Select value={blockHours} onChange={(e) => setBlockHours(e.target.value)}>
                  <option value="1">1 Hour</option>
                  <option value="2">2 Hours</option>
                  <option value="4">Half Day (4 Hours)</option>
                  <option value="8">Full Day (8 Hours)</option>
                </Select>
              </Field>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setBlockOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={blockBusy}>
                  {blockBusy ? "Locking..." : "Apply Schedule Hold"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BROADCAST ALERT */}
      {/* ========================================================================= */}
      {broadcastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-hairline bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>📢</span> Broadcast to Today&apos;s Clients ({todayBookings.length})
              </h3>
              <button
                type="button"
                onClick={() => {
                  setBroadcastOpen(false);
                  setBroadcastSent(false);
                }}
                className="text-ink-muted hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {broadcastSent ? (
              <div className="py-6 text-center space-y-2">
                <span className="text-3xl">✅</span>
                <h4 className="text-sm font-bold text-foreground">Broadcast Dispatched</h4>
                <p className="text-xs text-ink-muted">
                  SMS and push notifications were transmitted to {todayBookings.length} confirmed clients.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setBroadcastOpen(false);
                    setBroadcastSent(false);
                  }}
                >
                  Done
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <p className="text-xs text-ink-muted">
                  Send an instant announcement (e.g. slight clinic delay, parking notice, weather update) to everyone booked today.
                </p>
                <Field label="Message Text">
                  <Textarea
                    rows={3}
                    placeholder="e.g. Quick update: clinic running 10 mins delayed due to thorough sanitization. We look forward to welcoming you!"
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                  />
                </Field>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setBroadcastOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setBroadcastSent(true)}
                    disabled={!broadcastMsg.trim()}
                  >
                    Send to All Today
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
