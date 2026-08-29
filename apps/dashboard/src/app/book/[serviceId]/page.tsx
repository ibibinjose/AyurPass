"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { loginUrl } from "@/lib/auth-redirect";
import { STICKY_BELOW_NAV } from "@/components/DirectoryLayout";
import { api, formatMoney } from "@/lib/api";
import { downloadBookingIcs, getGoogleCalendarUrl } from "@/lib/ics";
import { CATEGORY_LABEL, formatDuration, PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import { nextDays, slotsForDay, type SlotOption } from "@/lib/slots";
import type { Booking, PaymentCheckout, Service } from "@/lib/types";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { PayWithStripe } from "@/components/PayWithStripe";
import { CalendarIcon, CheckIcon, ShieldIcon } from "@/components/icons";
import { RedeemPanel, type Redemption } from "@/components/RedeemPanel";
import { Button, EmptyState, ErrorNote, Field, Input, Select, Textarea } from "@/components/ui";
import {
  COUNTRIES_WITH_DIAL,
  dialForCountryCode,
  formatInternationalPhone,
  isValidPhone,
} from "@/lib/countries";
import { useLocation } from "@/context/LocationContext";

export default function BookServicePage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { user, loading, refreshProfile } = useAuth();
  const { countryCode: regionCode } = useLocation();
  const router = useRouter();

  const [service, setService] = useState<Service | null | undefined>(undefined);
  const days = useMemo(() => nextDays(14), []);
  const [dayIso, setDayIso] = useState(days[0].iso);
  const [slot, setSlot] = useState<SlotOption | null>(null);
  const [notes, setNotes] = useState("");
  const [phoneDial, setPhoneDial] = useState(() => dialForCountryCode(regionCode || "AU"));
  const [phoneNational, setPhoneNational] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const [stripePay, setStripePay] = useState<PaymentCheckout | null>(null);
  const [redemption, setRedemption] = useState<Redemption>({ discount: 0 });

  useEffect(() => {
    queueMicrotask(() => {
      setPhoneDial(dialForCountryCode(regionCode || "AU"));
    });
  }, [regionCode]);

  useEffect(() => {
    if (!user?.phone) return;
    // Prefill national digits if user already has a phone on file
    const raw = user.phone.trim();
    const match = COUNTRIES_WITH_DIAL.find((c) => raw.startsWith(c.dial));
    queueMicrotask(() => {
      if (match) {
        setPhoneDial(match.dial);
        setPhoneNational(raw.slice(match.dial.length).replace(/\D/g, ""));
      } else {
        setPhoneNational(raw.replace(/\D/g, ""));
      }
    });
  }, [user?.phone]);

  useEffect(() => {
    if (!serviceId) return;
    api
      .service(serviceId)
      .then((s) => setService(s ?? null))
      .catch(() => setService(null));
  }, [serviceId]);

  const selectedDay = days.find((d) => d.iso === dayIso) ?? days[0];
  const bufferMinutes = Number((service?.doshaCompatibility as any)?.bufferMinutes) || 0;
  const slots = useMemo(
    () => (service ? slotsForDay(selectedDay.date, service.durationMinutes, bufferMinutes) : []),
    [service, selectedDay, bufferMinutes],
  );

  const [prevDayIso, setPrevDayIso] = useState(dayIso);
  if (dayIso !== prevDayIso) {
    setPrevDayIso(dayIso);
    setSlot(null);
  }

  async function confirmBooking() {
    if (!user || !service || !slot) return;
    if (!isValidPhone(phoneDial, phoneNational)) {
      setError("Please enter a valid mobile number with country code so the practice can reach you.");
      return;
    }
    setBusy(true);
    setError(null);
    const contactPhone = formatInternationalPhone(phoneDial, phoneNational);
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
        contactPhone,
      });
      void refreshProfile?.();
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
              <p className="mx-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-forest px-4 py-1.5 text-sm font-medium text-white">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/20">
                  <CheckIcon className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
                Paid {formatMoney(confirmed.totalAmount ?? service.price, service.currency)}
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

              {confirmed.taxAmount && Number(confirmed.taxAmount) > 0 && (
                <div className="rounded-xl bg-clay/35 p-3.5 space-y-2 border border-clay/60 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink-secondary">Subtotal</span>
                    <span className="font-medium text-ink">
                      {formatMoney(
                        Number(confirmed.totalAmount ?? 0) - Number(confirmed.taxAmount ?? 0),
                        service.currency,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-secondary">
                      {confirmed.taxName ?? "Tax"} ({Number(confirmed.taxRate ?? 0) * 100}%)
                    </span>
                    <span className="font-medium text-ink">
                      {formatMoney(confirmed.taxAmount, service.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-clay/60 pt-2 font-semibold">
                    <span className="text-ink">Total</span>
                    <span className="text-ink">
                      {formatMoney(confirmed.totalAmount, service.currency)}
                    </span>
                  </div>
                </div>
              )}

              <PayWithStripe
                mock={stripePay?.mock ?? false}
                clientSecret={stripePay?.clientSecret}
                publishableKey={stripePay?.publishableKey}
                amountLabel={formatMoney(
                  Math.max(0, Number(confirmed.totalAmount ?? service.price) - redemption.discount),
                  service.currency,
                )}
                busy={busy}
                error={error}
                onMockPay={async () => {
                  setBusy(true);
                  setError(null);
                  try {
                    const result = await api.payBooking(confirmed.id, {
                      giftCardCode: redemption.giftCardCode,
                      redeemPoints: redemption.redeemPoints,
                    });
                    if (result.payment?.clientSecret) {
                      setConfirmed(result);
                      setStripePay(result.payment);
                    } else {
                      setConfirmed(result);
                      setStripePay(null);
                    }
                  } catch {
                    setError("Payment couldn't be completed — please recheck your rewards.");
                  } finally {
                    setBusy(false);
                  }
                }}
                onStripeSuccess={async () => {
                  const paid = await api.confirmBookingPayment(confirmed.id);
                  setConfirmed(paid);
                  setStripePay(null);
                }}
                onError={setError}
              />
            </div>
          )}

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button onClick={() => router.push("/dashboard/bookings")}>View my bookings</Button>
            <a
              href={getGoogleCalendarUrl(confirmed)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-4 py-2 text-sm font-medium text-forest transition-colors hover:border-leaf hover:bg-clay/40"
            >
              Add to Google Calendar ↗
            </a>
            <Button variant="ghost" onClick={() => downloadBookingIcs(confirmed)}>
              Download .ics file
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
            Mobile number
          </h2>
          <p className="mt-1 text-xs text-ink-muted">
            Required — the practice uses this for confirmations and day-of contact.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
            <Field label="Country code" className="sm:w-44">
              <Select
                value={phoneDial}
                onChange={(e) => setPhoneDial(e.target.value)}
                aria-label="Phone country code"
              >
                {COUNTRIES_WITH_DIAL.map((c) => (
                  <option key={c.code} value={c.dial}>
                    {c.flag} {c.dial} · {c.code}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Phone number" className="min-w-0 flex-1">
              <Input
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                required
                value={phoneNational}
                onChange={(e) => setPhoneNational(e.target.value)}
                placeholder="412 345 678"
              />
            </Field>
          </div>
          {phoneNational.trim() ? (
            <p className="mt-1.5 text-xs font-medium text-ink-muted">
              Will send as{" "}
              <span className="font-mono text-forest">
                {formatInternationalPhone(phoneDial, phoneNational)}
              </span>
            </p>
          ) : null}

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
        <aside
          className={`h-fit rounded-2xl border border-hairline bg-surface p-6 lg:sticky lg:self-start ${STICKY_BELOW_NAV}`}
        >
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
                href={loginUrl(`/book/${serviceId}`)}
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
                disabled={!slot || busy || !phoneNational.trim()}
                onClick={confirmBooking}
              >
                {busy
                  ? "Booking…"
                  : !slot
                    ? "Select a time to book"
                    : !phoneNational.trim()
                      ? "Add your mobile number"
                      : "Confirm booking"}
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
