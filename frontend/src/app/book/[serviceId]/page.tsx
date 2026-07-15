"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, formatMoney } from "@/lib/api";
import { downloadBookingIcs } from "@/lib/ics";
import { CATEGORY_LABEL, formatDuration, PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import { nextDays, slotsForDay, type SlotOption } from "@/lib/slots";
import type { Booking, Service } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { CalendarIcon, ShieldIcon } from "@/components/icons";
import { RedeemPanel, type Redemption } from "@/components/RedeemPanel";
import { Button, EmptyState, ErrorNote, Textarea } from "@/components/ui";

export default function BookServicePage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [service, setService] = useState<Service | null | undefined>(undefined);
  const days = useMemo(() => nextDays(14), []);
  const [dayIso, setDayIso] = useState(days[0].iso);
  const [slot, setSlot] = useState<SlotOption | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const [redemption, setRedemption] = useState<Redemption>({ discount: 0 });

  useEffect(() => {
    if (!serviceId) return;
    api
      .service(serviceId)
      .then((s) => setService(s ?? null))
      .catch(() => setService(null));
  }, [serviceId]);

  const selectedDay = days.find((d) => d.iso === dayIso) ?? days[0];
  const slots = useMemo(
    () => (service ? slotsForDay(selectedDay.date, service.durationMinutes) : []),
    [service, selectedDay],
  );

  useEffect(() => setSlot(null), [dayIso]);

  async function confirmBooking() {
    if (!user || !service || !slot) return;
    setBusy(true);
    setError(null);
    const end = new Date(slot.start.getTime() + service.durationMinutes * 60_000);
    try {
      const booking = await api.createBooking({
        consumerId: user.id,
        serviceId: service.id,
        providerId: service.providerId,
        professionalId: service.professionalId ?? undefined,
        startTime: slot.start.toISOString(),
        endTime: end.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notes: notes.trim() || undefined,
      });
      setConfirmed(booking);
      window.scrollTo({ top: 0 });
    } catch {
      setError("The booking couldn't be completed. Please pick another time and try again.");
    } finally {
      setBusy(false);
    }
  }

  // ----- render states -----

  if (service === null) {
    return (
      <Shell>
        <EmptyState
          title="Session not found"
          body="This session may have been removed by the provider."
        />
        <div className="mt-6 text-center">
          <Link href="/explore" className="font-medium text-forest hover:underline">
            ← Back to the catalog
          </Link>
        </div>
      </Shell>
    );
  }

  if (service === undefined) {
    return (
      <Shell>
        <div className="h-72 animate-pulse rounded-2xl bg-clay/70" />
      </Shell>
    );
  }

  if (confirmed) {
    return (
      <Shell>
        <div className="mx-auto max-w-lg rounded-3xl border border-hairline bg-surface p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest text-gold-soft">
            <CalendarIcon className="h-6 w-6" />
          </span>
          <h1 className="mt-5 font-display text-3xl text-forest">Booking requested</h1>
          <p className="mt-3 leading-relaxed text-ink-secondary">
            <strong className="text-foreground">{service.name}</strong>
            {service.provider ? ` at ${service.provider.businessName}` : ""} on{" "}
            <strong className="text-foreground">
              {new Date(confirmed.startTime).toLocaleString(undefined, {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </strong>
            .
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            The provider will confirm shortly — track it in your bookings.
          </p>

          {confirmed.paymentStatus === "paid" ? (
            <div className="mt-5 space-y-1.5">
              <p className="mx-auto w-fit rounded-full bg-forest px-4 py-1.5 text-sm font-medium text-white">
                Paid {formatMoney(confirmed.totalAmount ?? service.price)} ✓
              </p>
              {(confirmed.pointsEarned ?? 0) > 0 && (
                <p className="text-sm text-gold">
                  You earned {confirmed.pointsEarned} reward points 🌿
                </p>
              )}
            </div>
          ) : (
            <div className="mt-6 space-y-4 text-left">
              <p className="text-center text-sm text-ink-secondary">
                Secure your spot now, or pay at the venue.
              </p>
              <RedeemPanel
                amountDue={Number(confirmed.totalAmount ?? service.price)}
                onChange={setRedemption}
              />
              <div className="rounded-2xl border border-hairline bg-clay/40 p-4">
                <Button
                  className="w-full"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    setError(null);
                    try {
                      setConfirmed(
                        await api.payBooking(confirmed.id, {
                          giftCardCode: redemption.giftCardCode,
                          redeemPoints: redemption.redeemPoints,
                        }),
                      );
                    } catch {
                      setError("Payment couldn't be completed — please recheck your rewards.");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {busy
                    ? "Processing…"
                    : `Pay ${formatMoney(Math.max(0, Number(confirmed.totalAmount ?? service.price) - redemption.discount))} with Stripe (test mode)`}
                </Button>
                <p className="mt-2 text-xs text-ink-muted">Test mode — no real card is charged.</p>
                <ErrorNote message={error} />
              </div>
            </div>
          )}

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button onClick={() => router.push("/dashboard/bookings")}>View my bookings</Button>
            <Button variant="ghost" onClick={() => downloadBookingIcs(confirmed)}>
              Add to calendar
            </Button>
            <Button variant="ghost" onClick={() => router.push("/explore")}>
              Book another
            </Button>
          </div>
        </div>
      </Shell>
    );
  }

  const practitioner = service.professional?.user?.fullName;

  return (
    <Shell>
      <Link href="/explore" className="text-sm text-ink-muted hover:text-forest">
        ← Back to the catalog
      </Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Left: schedule picker */}
        <div>
          <h1 className="font-display text-3xl text-forest">{service.name}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {CATEGORY_LABEL[service.category]}
            {service.provider &&
              ` · ${service.provider.businessName} (${PROVIDER_TYPE_LABEL[service.provider.type] ?? service.provider.type})`}
            {practitioner && ` · with ${practitioner}`}
          </p>
          {service.description && (
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-secondary">
              {service.description}
            </p>
          )}

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-ink-muted">
            Choose a day
          </h2>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {days.map((d) => (
              <button
                key={d.iso}
                onClick={() => setDayIso(d.iso)}
                className={`flex w-16 shrink-0 flex-col items-center rounded-2xl border px-2 py-3 transition-colors ${
                  d.iso === dayIso
                    ? "border-forest bg-forest text-white"
                    : "border-hairline bg-surface text-ink-secondary hover:border-leaf"
                }`}
              >
                <span className="text-[11px] font-medium uppercase">{d.weekday}</span>
                <span className="mt-1 text-lg font-semibold">{d.dayOfMonth}</span>
                <span className="text-[11px]">{d.month}</span>
              </button>
            ))}
          </div>

          <h2 className="mt-6 text-sm font-semibold uppercase tracking-wider text-ink-muted">
            Choose a time
          </h2>
          {slots.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">
              No remaining times {selectedDay.isToday ? "today" : "on this day"} — try the next day.
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {slots.map((s) => {
                const active = slot?.start.getTime() === s.start.getTime();
                return (
                  <button
                    key={s.start.toISOString()}
                    onClick={() => setSlot(s)}
                    className={`rounded-xl border px-2 py-2.5 text-sm font-medium tabular-nums transition-colors ${
                      active
                        ? "border-forest bg-forest text-white"
                        : "border-hairline bg-surface text-foreground hover:border-leaf"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          )}

          <h2 className="mt-6 text-sm font-semibold uppercase tracking-wider text-ink-muted">
            Anything the practitioner should know?
          </h2>
          <Textarea
            rows={3}
            className="mt-3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Health notes, preferences, first visit… (optional)"
          />
        </div>

        {/* Right: summary */}
        <aside className="h-fit rounded-2xl border border-hairline bg-surface p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-lg text-forest">Summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Session</dt>
              <dd className="text-right font-medium text-foreground">{service.name}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Duration</dt>
              <dd className="font-medium text-foreground">
                {formatDuration(service.durationMinutes)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">When</dt>
              <dd className="text-right font-medium text-foreground">
                {slot
                  ? slot.start.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
                  : "Select a time"}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-hairline pt-3">
              <dt className="text-ink-muted">Total</dt>
              <dd className="text-lg font-semibold text-foreground">
                {formatMoney(service.price, service.currency)}
              </dd>
            </div>
          </dl>

          {!loading && !user ? (
            <div className="mt-5">
              <p className="text-sm text-ink-secondary">Sign in to complete your booking.</p>
              <Link
                href="/login"
                className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white hover:bg-forest-deep"
              >
                Sign in to book
              </Link>
            </div>
          ) : user && user.role !== "CONSUMER" ? (
            <p className="mt-5 rounded-xl bg-clay/60 px-3.5 py-2.5 text-sm text-ink-secondary">
              You&apos;re signed in as a provider — bookings are made from a wellness-seeker
              account.
            </p>
          ) : (
            <>
              <ErrorNote message={error} />
              <Button
                className="mt-5 w-full"
                disabled={!slot || busy}
                onClick={confirmBooking}
              >
                {busy ? "Booking…" : slot ? "Confirm booking" : "Select a time to book"}
              </Button>
            </>
          )}

          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
            <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0" />
            Free cancellation until 24 hours before your session. You pay at the venue — no charge
            today.
          </p>
        </aside>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <LayoutWrapper>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">{children}</main>
    </LayoutWrapper>
  );
}
