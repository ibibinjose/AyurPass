"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError, formatMoney } from "@/lib/api";
import { downloadBookingIcs } from "@/lib/ics";
import { practicePath } from "@/lib/paths";
import type { Booking, PaymentCheckout } from "@/lib/types";
import { BookingStatusBadge } from "@/components/BookingStatusBadge";
import { PaymentBadge } from "@/components/PaymentBadge";
import { PayWithStripe } from "@/components/PayWithStripe";
import { DashHeader, DashTabs } from "@/components/dashboard/DashboardKit";
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

type TabId = "upcoming" | "past" | "unpaid" | "all";

const CATEGORY_LEGEND = [
  { id: "AYURVEDA", label: "Ayurveda" },
  { id: "YOGA", label: "Yoga" },
  { id: "SPA", label: "Spa" },
  { id: "MEDITATION", label: "Meditation" },
  { id: "FITNESS", label: "Fitness" },
  { id: "CONSULTATION", label: "Consult" },
] as const;

function isCancellable(b: Booking) {
  return (
    (b.status === "PENDING" || b.status === "CONFIRMED") && new Date(b.startTime) > new Date()
  );
}

function friendlyPayError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("stripe onboarding") || m.includes("payment setup")) {
    return message;
  }
  if (m.includes("cancelled")) return "This booking was cancelled and cannot be paid.";
  if (m.includes("already paid")) return "This booking is already paid.";
  return message || "Payment could not be completed. Please try again.";
}

export default function BookingsPage() {
  const { user } = useAuth();
  const { data: bookingsData, isLoading } = useConsumerBookings(user?.id);
  const invalidateBookings = useInvalidateConsumerBookings(user?.id);
  const bookings = bookingsData ?? null;
  const [tab, setTab] = useState<TabId>("upcoming");
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [paying, setPaying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [payModal, setPayModal] = useState<{
    booking: Booking;
    payment: PaymentCheckout | null;
  } | null>(null);
  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const reload = () => {
    void invalidateBookings();
  };

  const now = useMemo(() => new Date(), [bookings]);

  const filtered = useMemo(() => {
    const list = bookings ?? [];
    const sorted = [...list].sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime));
    if (tab === "all") {
      return [...list].sort((a, b) => +new Date(b.startTime) - +new Date(a.startTime));
    }
    if (tab === "unpaid") {
      return sorted.filter((b) => b.paymentStatus === "unpaid" && b.status !== "CANCELLED");
    }
    if (tab === "upcoming") {
      return sorted.filter((b) => new Date(b.startTime) >= now && b.status !== "CANCELLED");
    }
    // past
    return [...list]
      .filter((b) => new Date(b.startTime) < now || b.status === "CANCELLED" || b.status === "COMPLETED")
      .sort((a, b) => +new Date(b.startTime) - +new Date(a.startTime));
  }, [bookings, tab, now]);

  const counts = useMemo(() => {
    const list = bookings ?? [];
    return {
      upcoming: list.filter((b) => new Date(b.startTime) >= now && b.status !== "CANCELLED").length,
      unpaid: list.filter((b) => b.paymentStatus === "unpaid" && b.status !== "CANCELLED").length,
      past: list.filter(
        (b) =>
          new Date(b.startTime) < now || b.status === "CANCELLED" || b.status === "COMPLETED",
      ).length,
      all: list.length,
    };
  }, [bookings, now]);

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
      if (
        msg.toLowerCase().includes("payment setup") ||
        msg.toLowerCase().includes("onboarding")
      ) {
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

  return (
    <div className="space-y-6">
      <DashHeader
        eyebrow="My wellness"
        title="Calendar"
        description="Your sessions colour-coded by discipline (Ayurveda, Yoga, Spa…). Pay, cancel or add to your device calendar."
        action={
          <Link
            href="/explore"
            className="inline-flex min-h-10 items-center rounded-full bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-deep"
          >
            Book a session
          </Link>
        }
      />

      <DashTabs
        tabs={[
          { id: "upcoming", label: "Upcoming", count: counts.upcoming },
          { id: "unpaid", label: "Unpaid", count: counts.unpaid },
          { id: "past", label: "Past", count: counts.past },
          { id: "all", label: "All", count: counts.all },
        ]}
        value={tab}
        onChange={(id) => setTab(id as TabId)}
      />

      <ErrorNote message={error} />

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-hairline bg-surface/80 px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Colour key</p>
        {CATEGORY_LEGEND.map((c) => (
          <span key={c.id} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-secondary">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: serviceCategoryColor[c.id] }}
              aria-hidden
            />
            {c.label}
          </span>
        ))}
      </div>

      <div>
        {isLoading && bookings === null ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-clay/70" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={
              tab === "unpaid"
                ? "Nothing unpaid"
                : tab === "upcoming"
                  ? "No upcoming sessions"
                  : tab === "past"
                    ? "No past bookings"
                    : "No bookings yet"
            }
            body={
              tab === "upcoming" || tab === "all"
                ? "Browse the catalog and book a consultation, class or treatment — it will appear here with status and payment."
                : "When you have activity in this filter, it will show here."
            }
            action={
              tab === "upcoming" || tab === "all" ? (
                <Link
                  href="/explore"
                  className="inline-flex min-h-10 items-center rounded-full bg-forest px-4 text-sm font-semibold text-white"
                >
                  Explore sessions
                </Link>
              ) : undefined
            }
          />
        ) : (
          <ul className="space-y-3">
            {filtered.map((b) => {
              const cat = b.service?.category;
              const bar = colorForServiceCategory(cat);
              const soft = softColorForServiceCategory(cat);
              return (
              <li
                key={b.id}
                className="rounded-2xl border border-hairline bg-surface px-5 py-4 shadow-[0_1px_0_rgba(36,56,46,0.04)]"
                style={{ borderLeftWidth: 4, borderLeftColor: bar, backgroundColor: soft }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    {cat ? (
                      <span
                        className="mb-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                        style={{ backgroundColor: bar }}
                      >
                        {cat.replace(/_/g, " ")}
                      </span>
                    ) : null}
                    <p className="font-medium text-foreground">
                      {b.service?.name ?? "Session"}
                    </p>
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
                      {b.professional?.user?.fullName &&
                        ` · with ${b.professional.user.fullName}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {b.totalAmount != null && (
                      <span className="text-sm font-semibold tabular-nums text-foreground">
                        {formatMoney(b.totalAmount)}
                      </span>
                    )}
                    <BookingStatusBadge status={b.status} />
                    <PaymentBadge status={b.paymentStatus} />
                    {b.paymentStatus === "unpaid" && b.status !== "CANCELLED" && (
                      <button
                        type="button"
                        onClick={() => void startPay(b)}
                        disabled={paying === b.id}
                        className="rounded-full bg-forest px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-forest-deep disabled:opacity-50"
                      >
                        {paying === b.id ? "Starting…" : "Pay now"}
                      </button>
                    )}
                    {b.status !== "CANCELLED" && (
                      <button
                        type="button"
                        onClick={() => downloadBookingIcs(b)}
                        className="text-sm font-medium text-ink-muted underline-offset-2 hover:text-forest hover:underline"
                      >
                        Add to calendar
                      </button>
                    )}
                    {isCancellable(b) && (
                      <button
                        type="button"
                        onClick={() => void cancel(b)}
                        disabled={cancelling === b.id}
                        className="text-sm font-medium text-ink-muted underline-offset-2 hover:text-red-700 hover:underline disabled:opacity-50"
                      >
                        {cancelling === b.id ? "Cancelling…" : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
                {(b.room?.name || b.notes) && (
                  <p className="mt-3 text-sm text-ink-secondary">
                    {b.room?.name && <span className="mr-3">Room: {b.room.name}</span>}
                    {b.notes}
                  </p>
                )}
              </li>
              );
            })}
          </ul>
        )}
      </div>

      {payModal ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Pay for booking"
        >
          <button
            type="button"
            className="absolute inset-0 bg-forest/45 backdrop-blur-[2px]"
            aria-label="Close"
            onClick={() => {
              if (!payBusy) {
                setPayModal(null);
                setPayError(null);
              }
            }}
          />
          <div className="relative z-[1] w-full max-w-md rounded-3xl border border-hairline bg-surface p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-gold">Payment</p>
                <h2 className="mt-0.5 font-display text-xl text-forest">
                  {payModal.booking.service?.name ?? "Session"}
                </h2>
                <p className="mt-1 text-sm font-medium text-ink-muted">
                  {payModal.booking.provider?.businessName}
                  {payModal.booking.totalAmount != null
                    ? ` · ${formatMoney(payModal.booking.totalAmount)}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                disabled={payBusy}
                onClick={() => {
                  setPayModal(null);
                  setPayError(null);
                }}
                className="rounded-full px-3 py-1.5 text-sm font-semibold text-ink-muted hover:bg-clay/60"
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {payModal.payment ? (
                <PayWithStripe
                  mock={Boolean(payModal.payment.mock)}
                  clientSecret={payModal.payment.clientSecret}
                  publishableKey={payModal.payment.publishableKey}
                  amountLabel={formatMoney(payModal.booking.totalAmount ?? 0)}
                  busy={payBusy}
                  error={payError}
                  onMockPay={async () => {
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
                          : "Payment confirmation failed.",
                      );
                    } finally {
                      setPayBusy(false);
                    }
                  }}
                  onStripeSuccess={async () => {
                    await confirmStripePay();
                  }}
                  onError={setPayError}
                />
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium leading-relaxed text-ink-secondary">
                    {payError ||
                      "This practice hasn’t finished payment setup yet. You can try again later or contact them to pay offline."}
                  </p>
                  <Button type="button" variant="ghost" onClick={() => setPayModal(null)}>
                    Close
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
