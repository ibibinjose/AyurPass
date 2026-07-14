"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, formatMoney } from "@/lib/api";
import { downloadBookingIcs } from "@/lib/ics";
import type { Booking } from "@/lib/types";
import { BookingStatusBadge } from "@/components/BookingStatusBadge";
import { PaymentBadge } from "@/components/PaymentBadge";
import { EmptyState } from "@/components/ui";

function isCancellable(b: Booking) {
  return (
    (b.status === "PENDING" || b.status === "CONFIRMED") && new Date(b.startTime) > new Date()
  );
}

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [paying, setPaying] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!user) return;
    api
      .bookingsByConsumer(user.id)
      .then(setBookings)
      .catch(() => setBookings([]));
  }, [user]);

  useEffect(reload, [reload]);

  async function cancel(b: Booking) {
    if (!window.confirm(`Cancel “${b.service?.name ?? "this session"}”?`)) return;
    setCancelling(b.id);
    try {
      await api.updateBooking(b.id, { status: "CANCELLED" });
      if (b.paymentStatus === "paid") await api.refundBooking(b.id).catch(() => {});
      reload();
    } finally {
      setCancelling(null);
    }
  }

  async function pay(b: Booking) {
    setPaying(b.id);
    try {
      await api.payBooking(b.id);
      reload();
    } finally {
      setPaying(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-forest">Bookings</h1>
          <p className="mt-1 text-ink-muted">Your sessions across the AyurPass network.</p>
        </div>
        <Link
          href="/explore"
          className="rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white hover:bg-forest-deep"
        >
          Book a session
        </Link>
      </div>

      <div className="mt-8">
        {bookings === null ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-clay/70" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            body="Browse the catalog and book a consultation, class or treatment — it will appear here with its status."
          />
        ) : (
          <ul className="space-y-3">
            {bookings.map((b) => (
              <li key={b.id} className="rounded-2xl border border-hairline bg-surface px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{b.service?.name ?? "Session"}</p>
                    <p className="mt-0.5 text-sm text-ink-muted">
                      {b.provider?.businessName && `${b.provider.businessName} · `}
                      {new Date(b.startTime).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                      {b.professional?.user?.fullName && ` · with ${b.professional.user.fullName}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {b.totalAmount != null && (
                      <span className="text-sm font-medium text-foreground">
                        {formatMoney(b.totalAmount)}
                      </span>
                    )}
                    <BookingStatusBadge status={b.status} />
                    <PaymentBadge status={b.paymentStatus} />
                    {b.paymentStatus === "unpaid" && b.status !== "CANCELLED" && (
                      <button
                        onClick={() => pay(b)}
                        disabled={paying === b.id}
                        className="rounded-full bg-forest px-3.5 py-1.5 text-xs font-medium text-white hover:bg-forest-deep disabled:opacity-50"
                      >
                        {paying === b.id ? "Paying…" : "Pay now (test)"}
                      </button>
                    )}
                    <button
                      onClick={() => downloadBookingIcs(b)}
                      className="text-sm text-ink-muted underline-offset-2 hover:text-forest hover:underline"
                    >
                      Add to calendar
                    </button>
                    {isCancellable(b) && (
                      <button
                        onClick={() => cancel(b)}
                        disabled={cancelling === b.id}
                        className="text-sm text-ink-muted underline-offset-2 hover:text-red-700 hover:underline disabled:opacity-50"
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
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
