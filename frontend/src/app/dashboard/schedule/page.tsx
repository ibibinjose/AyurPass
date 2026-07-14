"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { api, formatMoney } from "@/lib/api";
import type { Booking, BookingStatus } from "@/lib/types";
import { BookingStatusBadge } from "@/components/BookingStatusBadge";
import { PaymentBadge } from "@/components/PaymentBadge";
import { StatTile } from "@/components/StatTile";
import { Button, EmptyState } from "@/components/ui";

export default function SchedulePage() {
  const { user } = useAuth();
  const provider = user?.provider ?? user?.professional?.provider ?? null;
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!provider) return;
    api
      .bookingsByProvider(provider.id)
      .then(setBookings)
      .catch(() => setBookings([]));
  }, [provider]);

  useEffect(reload, [reload]);

  if (!provider) {
    return (
      <EmptyState title="No practice linked" body="The schedule is available for provider accounts." />
    );
  }

  async function setStatus(b: Booking, status: BookingStatus) {
    setActing(b.id);
    try {
      await api.updateBooking(b.id, { status });
      reload();
    } finally {
      setActing(null);
    }
  }

  const all = bookings ?? [];
  const now = new Date();
  const upcoming = all.filter(
    (b) => new Date(b.startTime) >= now && b.status !== "CANCELLED" && b.status !== "COMPLETED",
  );
  const past = all.filter((b) => !upcoming.includes(b));
  const expectedPayout = all
    .filter((b) => b.status !== "CANCELLED" && b.status !== "NO_SHOW")
    .reduce((sum, b) => sum + Number(b.providerPayout ?? 0), 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-forest">Schedule</h1>
          <p className="mt-1 text-ink-muted">Incoming bookings for {provider.businessName}.</p>
        </div>
        <Link
          href="/dashboard/calendar"
          className="rounded-full border border-hairline bg-surface px-5 py-2.5 text-sm font-medium text-forest hover:border-leaf"
        >
          Open calendar view
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatTile label="Upcoming sessions" value={upcoming.length} />
        <StatTile
          label="Awaiting confirmation"
          value={all.filter((b) => b.status === "PENDING").length}
        />
        <StatTile
          label="Expected payout"
          value={formatMoney(expectedPayout)}
          hint="After the 18% platform commission."
        />
      </div>

      <div className="mt-8 space-y-8">
        <BookingGroup
          title="Upcoming"
          bookings={upcoming}
          empty="No upcoming sessions — bookings made by clients will appear here."
          renderActions={(b) => (
            <>
              {b.status === "PENDING" && (
                <>
                  <Button
                    disabled={acting === b.id}
                    onClick={() => setStatus(b, "CONFIRMED")}
                    className="!px-3.5 !py-1.5"
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="danger"
                    disabled={acting === b.id}
                    onClick={() => setStatus(b, "CANCELLED")}
                    className="!px-3.5 !py-1.5"
                  >
                    Decline
                  </Button>
                </>
              )}
              {b.status === "CONFIRMED" && (
                <>
                  <Button
                    variant="ghost"
                    disabled={acting === b.id}
                    onClick={() => setStatus(b, "COMPLETED")}
                    className="!px-3.5 !py-1.5"
                  >
                    Mark completed
                  </Button>
                  <Button
                    variant="danger"
                    disabled={acting === b.id}
                    onClick={() => setStatus(b, "CANCELLED")}
                    className="!px-3.5 !py-1.5"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </>
          )}
        />

        <BookingGroup
          title="Past & closed"
          bookings={past}
          empty="Completed and cancelled sessions will appear here."
          renderActions={(b) =>
            b.status === "CONFIRMED" ? (
              <Button
                variant="ghost"
                disabled={acting === b.id}
                onClick={() => setStatus(b, "COMPLETED")}
                className="!px-3.5 !py-1.5"
              >
                Mark completed
              </Button>
            ) : null
          }
        />
      </div>
    </div>
  );
}

function BookingGroup({
  title,
  bookings,
  empty,
  renderActions,
}: {
  title: string;
  bookings: Booking[];
  empty: string;
  renderActions: (b: Booking) => React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-xl text-forest">{title}</h2>
      <div className="mt-4">
        {bookings.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-hairline bg-surface/60 px-5 py-6 text-sm text-ink-muted">
            {empty}
          </p>
        ) : (
          <ul className="space-y-3">
            {bookings.map((b) => (
              <li key={b.id} className="rounded-2xl border border-hairline bg-surface px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {b.service?.name ?? "Session"}
                      <span className="text-ink-muted">
                        {" "}
                        · {b.consumer?.user?.fullName ?? b.consumer?.user?.email ?? "Client"}
                      </span>
                    </p>
                    <p className="mt-0.5 text-sm text-ink-muted">
                      {new Date(b.startTime).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                      {" – "}
                      {new Date(b.endTime).toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      {b.room?.name && ` · ${b.room.name}`}
                      {b.professional?.user?.fullName && ` · ${b.professional.user.fullName}`}
                      {b.totalAmount != null &&
                        ` · ${formatMoney(b.totalAmount)} (payout ${formatMoney(b.providerPayout ?? 0)})`}
                    </p>
                    {b.notes && <p className="mt-1.5 text-sm text-ink-secondary">“{b.notes}”</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <BookingStatusBadge status={b.status} />
                    <PaymentBadge status={b.paymentStatus} />
                    {renderActions(b)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
