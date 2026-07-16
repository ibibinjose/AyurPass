"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/api";
import type {
  AdminOverview,
  Booking,
  Enquiry,
  HealthProfile,
  LoyaltySummary,
  Professional,
  Service,
  TreatmentPlan,
  WellnessPackage,
} from "@/lib/types";
import type { Dosha } from "@/lib/dosha";
import { BookingStatusBadge } from "@/components/BookingStatusBadge";
import { DoshaMeterGroup } from "@/components/DoshaMeter";
import { StatTile } from "@/components/StatTile";
import { ArrowRightIcon } from "@/components/icons";
import { EmptyState } from "@/components/ui";

function firstName(full?: string | null) {
  return full?.split(" ")[0] ?? "there";
}

function ConsumerOverview() {
  const { user } = useAuth();
  const [health, setHealth] = useState<HealthProfile | null | undefined>(undefined);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltySummary | null>(null);

  useEffect(() => {
    if (!user) return;
    api.healthProfile(user.id).then(setHealth).catch(() => setHealth(null));
    api.bookingsByConsumer(user.id).then(setBookings).catch(() => {});
    api.plansByConsumer(user.id).then(setPlans).catch(() => {});
    api.loyalty().then(setLoyalty).catch(() => {});
  }, [user]);

  const upcoming = bookings.filter(
    (b) => new Date(b.startTime) > new Date() && b.status !== "CANCELLED",
  );

  const scores = health
    ? {
        vata: Math.round(Number(health.vataScore ?? 0)),
        pitta: Math.round(Number(health.pittaScore ?? 0)),
        kapha: Math.round(Number(health.kaphaScore ?? 0)),
      }
    : null;
  const primary =
    scores &&
    ((Object.entries(scores) as [Dosha, number][]).sort((a, b) => b[1] - a[1])[0][0] as Dosha);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-forest">
          Namaste, {firstName(user?.fullName)}
        </h1>
        <p className="mt-1 text-ink-muted">Your wellness sanctuary at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Upcoming sessions" value={upcoming.length} />
        <StatTile
          label="Active treatment plans"
          value={plans.filter((p) => p.status === "active").length}
        />
        <StatTile label="Total bookings" value={bookings.length} />
        <StatTile
          label="Reward points"
          value={loyalty ? loyalty.pointsBalance.toLocaleString() : "—"}
          hint={loyalty ? `${loyalty.tier} member` : undefined}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/explore"
          className="group flex items-center justify-between rounded-2xl bg-forest p-6 text-white hover:bg-forest-deep"
        >
          <div>
            <h2 className="font-display text-xl">Book your next session</h2>
            <p className="mt-1 text-sm text-white/70">
              Ayurveda, yoga, spa and meditation, matched to your constitution.
            </p>
          </div>
          <ArrowRightIcon className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/shop"
          className="group flex items-center justify-between rounded-2xl border border-hairline bg-surface p-6 hover:border-leaf"
        >
          <div>
            <h2 className="font-display text-xl text-forest">Visit the wellness shop</h2>
            <p className="mt-1 text-sm text-ink-secondary">
              Herbal formulations, oils and goods for your dosha.
            </p>
          </div>
          <ArrowRightIcon className="h-5 w-5 shrink-0 text-forest transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Everything in one place: find wellness, explore retreats, or become a provider. */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/discover"
          className="group flex items-center justify-between rounded-2xl border border-hairline bg-surface p-6 hover:border-leaf"
        >
          <div>
            <h2 className="font-display text-lg text-forest">Discover places</h2>
            <p className="mt-1 text-sm text-ink-secondary">
              Ayurveda, yoga, spa, meditation & health clubs near you.
            </p>
          </div>
          <ArrowRightIcon className="h-5 w-5 shrink-0 text-forest transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/retreats"
          className="group flex items-center justify-between rounded-2xl border border-hairline bg-surface p-6 hover:border-leaf"
        >
          <div>
            <h2 className="font-display text-lg text-forest">Explore retreats</h2>
            <p className="mt-1 text-sm text-ink-secondary">
              Handpicked retreats & trainings around the world.
            </p>
          </div>
          <ArrowRightIcon className="h-5 w-5 shrink-0 text-forest transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/list-your-business"
          className="group flex items-center justify-between rounded-2xl border border-dashed border-hairline bg-surface p-6 hover:border-leaf"
        >
          <div>
            <h2 className="font-display text-lg text-forest">Own a business?</h2>
            <p className="mt-1 text-sm text-ink-secondary">
              List it free and get discovered — no booking platform required.
            </p>
          </div>
          <ArrowRightIcon className="h-5 w-5 shrink-0 text-forest transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <section className="rounded-2xl border border-hairline bg-surface p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl text-forest">Your constitution</h2>
          <Link
            href="/dashboard/assessment"
            className="flex items-center gap-1.5 text-sm font-medium text-forest hover:underline"
          >
            {health ? "Retake assessment" : "Take assessment"}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-5">
          {health === undefined ? (
            <div className="h-32 animate-pulse rounded-xl bg-clay/70" />
          ) : scores ? (
            <DoshaMeterGroup {...scores} primary={primary ?? undefined} />
          ) : (
            <EmptyState
              title="Your dosha profile awaits"
              body="Answer twelve gentle questions to map your Vata, Pitta and Kapha balance — everything on AyurPass is personalised from it."
            />
          )}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl text-forest">Recent bookings</h2>
        <div className="mt-4">
          {bookings.length === 0 ? (
            <EmptyState
              title="No bookings yet"
              body="When you book a consultation, class or treatment, it will appear here."
            />
          ) : (
            <ul className="space-y-3">
              {bookings.slice(0, 3).map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between rounded-2xl border border-hairline bg-surface px-5 py-4"
                >
                  <div>
                    <p className="font-medium text-foreground">{b.service?.name ?? "Session"}</p>
                    <p className="text-sm text-ink-muted">
                      {new Date(b.startTime).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <BookingStatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function ProviderOverview() {
  const { user } = useAuth();
  const provider = user?.provider ?? user?.professional?.provider ?? null;
  const [packages, setPackages] = useState<WellnessPackage[]>([]);
  const [team, setTeam] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);

  useEffect(() => {
    if (!provider) return;
    api.packagesByProvider(provider.id).then(setPackages).catch(() => {});
    api.professionalsByProvider(provider.id).then(setTeam).catch(() => {});
    api.servicesByProvider(provider.id).then(setServices).catch(() => {});
    api.bookingsByProvider(provider.id).then(setBookings).catch(() => {});
    api.myEnquiries().then(setEnquiries).catch(() => {});
  }, [provider]);

  const isListing = provider?.listingTier === "FREE_LISTING" || services.length === 0;
  const newLeads = enquiries.filter((e) => e.status === "new").length;

  const now = new Date();
  const upcoming = bookings.filter(
    (b) => new Date(b.startTime) >= now && b.status !== "CANCELLED" && b.status !== "COMPLETED",
  );
  const pending = bookings.filter((b) => b.status === "PENDING");

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl text-forest">
            {provider?.businessName ?? `Welcome, ${firstName(user?.fullName)}`}
          </h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              provider?.verificationStatus === "verified"
                ? "bg-forest text-white"
                : "bg-gold-soft text-forest"
            }`}
          >
            {provider?.verificationStatus === "verified" ? "Verified" : "Verification pending"}
          </span>
        </div>
        <p className="mt-1 text-ink-muted">Your practice on AyurPass.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="New enquiries"
          value={newLeads}
          hint={enquiries.length ? `${enquiries.length} total leads` : undefined}
        />
        <StatTile
          label="Upcoming sessions"
          value={upcoming.length}
          hint={pending.length ? `${pending.length} awaiting confirmation` : undefined}
        />
        <StatTile
          label="Bookable sessions"
          value={services.filter((s) => s.category !== "PACKAGE").length}
        />
        <StatTile label="Packages" value={packages.length} />
      </div>

      {/* Listing-only practices: nudge toward the booking upgrade. */}
      {isListing && (
        <Link
          href="/dashboard/services"
          className="group flex items-center justify-between rounded-2xl border border-hairline bg-gold-soft/40 p-6 hover:border-leaf"
        >
          <div>
            <h2 className="font-display text-xl text-forest">Start accepting online bookings</h2>
            <p className="mt-1 text-sm text-ink-secondary">
              You&apos;re on a free listing. Add a bookable session to take bookings &amp; payments
              through AyurPass — clients can book you directly.
            </p>
          </div>
          <ArrowRightIcon className="h-5 w-5 shrink-0 text-forest transition-transform group-hover:translate-x-1" />
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href={provider ? `/providers/${provider.id}` : "/discover"}
          className="group rounded-2xl border border-hairline bg-surface p-6 hover:border-leaf"
        >
          <h2 className="font-display text-xl text-forest">Your public page</h2>
          <p className="mt-2 text-sm text-ink-secondary">See exactly how visitors discover you.</p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest">
            View listing
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
        <Link
          href="/dashboard/enquiries"
          className="group rounded-2xl border border-hairline bg-surface p-6 hover:border-leaf"
        >
          <h2 className="flex items-center gap-2 font-display text-xl text-forest">
            Enquiries
            {newLeads > 0 && (
              <span className="rounded-full bg-forest px-2 py-0.5 text-xs font-semibold text-white">
                {newLeads}
              </span>
            )}
          </h2>
          <p className="mt-2 text-sm text-ink-secondary">Leads sent from your listing page.</p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest">
            View leads
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
        <Link
          href="/dashboard/business"
          className="group rounded-2xl border border-hairline bg-surface p-6 hover:border-leaf"
        >
          <h2 className="font-display text-xl text-forest">Business profile</h2>
          <p className="mt-2 text-sm text-ink-secondary">
            Edit photos, contact details, tags and amenities.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest">
            Edit profile
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      {pending.length > 0 && (
        <Link
          href="/dashboard/schedule"
          className="group flex items-center justify-between rounded-2xl bg-forest p-6 text-white hover:bg-forest-deep"
        >
          <div>
            <h2 className="font-display text-xl">
              {pending.length} booking{pending.length > 1 ? "s" : ""} awaiting your confirmation
            </h2>
            <p className="mt-1 text-sm text-white/70">Review and confirm them in the schedule.</p>
          </div>
          <ArrowRightIcon className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/dashboard/schedule"
          className="group rounded-2xl border border-hairline bg-surface p-6 hover:border-leaf"
        >
          <h2 className="font-display text-xl text-forest">Your schedule</h2>
          <p className="mt-2 text-sm text-ink-secondary">
            Confirm, complete or decline incoming bookings.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest">
            Open schedule
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
        <Link
          href="/dashboard/services"
          className="group rounded-2xl border border-hairline bg-surface p-6 hover:border-leaf"
        >
          <h2 className="font-display text-xl text-forest">Bookable sessions</h2>
          <p className="mt-2 text-sm text-ink-secondary">
            Publish consultations, classes and treatments clients can book.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest">
            Manage sessions
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
        <Link
          href="/dashboard/packages"
          className="group rounded-2xl border border-hairline bg-surface p-6 hover:border-leaf"
        >
          <h2 className="font-display text-xl text-forest">Packages</h2>
          <p className="mt-2 text-sm text-ink-secondary">
            Curate multi-day programs — instantly bookable by clients.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest">
            Manage packages
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}

function PlatformAdminOverview() {
  const [stats, setStats] = useState<AdminOverview | null>(null);

  useEffect(() => {
    api.adminOverview().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-forest">Platform overview</h1>
        <p className="mt-1 text-ink-muted">AyurPass at a glance.</p>
      </div>

      {stats === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-clay/70" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Gross booking volume" value={formatMoney(stats.grossVolume)} />
            <StatTile
              label="Platform revenue"
              value={formatMoney(stats.platformRevenue)}
              hint="18% commission on active bookings."
            />
            <StatTile label="Collected payments" value={formatMoney(stats.paidVolume)} />
            <StatTile label="Total bookings" value={stats.bookings} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Users" value={stats.users} hint={`${stats.consumers} wellness seekers`} />
            <StatTile
              label="Providers"
              value={stats.providers}
              hint={
                stats.pendingVerifications
                  ? `${stats.pendingVerifications} awaiting verification`
                  : "All reviewed"
              }
            />
            <StatTile label="Practitioners" value={stats.professionals} />
            <StatTile
              label="Catalog"
              value={stats.services}
              hint={`${stats.packages} packages · ${stats.products} products`}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Product orders" value={stats.orders} />
            <StatTile label="Products listed" value={stats.products} />
            <StatTile
              label="Gift cards issued"
              value={stats.giftCards}
              hint={`${formatMoney(stats.giftCardOutstanding)} outstanding`}
            />
            <StatTile
              label="Reward points in circulation"
              value={Number(stats.pointsOutstanding).toLocaleString()}
            />
          </div>
          {stats.pendingVerifications > 0 && (
            <Link
              href="/dashboard/admin/providers"
              className="group flex items-center justify-between rounded-2xl bg-forest p-6 text-white hover:bg-forest-deep"
            >
              <div>
                <h2 className="font-display text-xl">
                  {stats.pendingVerifications} practice
                  {stats.pendingVerifications > 1 ? "s" : ""} awaiting verification
                </h2>
                <p className="mt-1 text-sm text-white/70">Review and verify them now.</p>
              </div>
              <ArrowRightIcon className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  if (user?.role === "PLATFORM_ADMIN") return <PlatformAdminOverview />;
  const isProvider = user?.role === "PROVIDER_ADMIN" || user?.role === "PROFESSIONAL";
  return isProvider ? <ProviderOverview /> : <ConsumerOverview />;
}
