"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, formatMoney } from "@/lib/api";
import type { Booking } from "@/lib/types";
import { BookingStatusBadge } from "@/components/BookingStatusBadge";
import { PaymentBadge } from "@/components/PaymentBadge";
import { EmptyState } from "@/components/ui";

export default function AdminBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  useEffect(() => {
    api
      .adminBookings()
      .then(setBookings)
      .catch(() => setBookings([]));
  }, []);

  if (user && user.role !== "PLATFORM_ADMIN") {
    return <EmptyState title="Admin only" body="This area is for platform administrators." />;
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-forest">All bookings</h1>
      <p className="mt-1 text-ink-muted">Every booking across the platform, newest first.</p>

      <div className="mt-8">
        {bookings === null ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-clay/70" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState title="No bookings yet" body="Bookings will appear here as they're made." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-hairline bg-surface">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-hairline text-left text-xs uppercase tracking-wider text-ink-muted">
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Session</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Provider</th>
                  <th className="px-4 py-3 font-medium">Total / commission</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-hairline/60 last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 text-ink-secondary">
                      {new Date(b.startTime).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {b.service?.name ?? "—"}
                      {b.room?.name && (
                        <span className="block text-xs font-normal text-ink-muted">
                          {b.room.name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">
                      {b.consumer?.user?.fullName ?? b.consumer?.user?.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">
                      {b.provider?.businessName ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-secondary tabular-nums">
                      {formatMoney(b.totalAmount ?? 0)} / {formatMoney(b.platformCommission ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      <BookingStatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PaymentBadge status={b.paymentStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
