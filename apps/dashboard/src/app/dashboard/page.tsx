"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, formatMoney } from "@/lib/api";
import { useAdminOverview } from "@/hooks/useAdminOverview";
import type {
  Booking,
  Enquiry,
  HealthProfile,
  LoyaltySummary,
  Order,
  Professional,
  Provider,
  Service,
  TreatmentPlan,
} from "@/lib/types";
import type { Dosha } from "@/lib/dosha";
import { DOSHA_INFO } from "@/lib/dosha";
import {
  followCount,
  hydrateFollows,
  listFollows,
  subscribeEngagement,
  type EngagementTarget,
} from "@/lib/engagement";
import { practicePath, practitionerPath } from "@/lib/paths";
import { BookingStatusBadge } from "@/components/BookingStatusBadge";
import { DoshaMeterGroup } from "@/components/DoshaMeter";
import { PaymentBadge } from "@/components/PaymentBadge";
import { StatTile } from "@/components/StatTile";
import {
  DashCard,
  DashHeader,
  DashQuickLinks,
} from "@/components/dashboard/DashboardKit";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  CompassIcon,
  GiftIcon,
  HeartIcon,
  LotusIcon,
  SparkleIcon,
  TrophyIcon,
} from "@/components/icons";
import { EmptyState, InlineSpinner } from "@/components/ui";
import { InstallAppButton } from "@/components/InstallPrompt";

function firstName(full?: string | null) {
  return full?.split(" ")[0] ?? "there";
}

function greetingForHour(h: number) {
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function ConsumerOverview() {
  const { user } = useAuth();
  const [health, setHealth] = useState<HealthProfile | null | undefined>(undefined);
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [plans, setPlans] = useState<TreatmentPlan[] | null>(null);
  const [loyalty, setLoyalty] = useState<LoyaltySummary | null | undefined>(undefined);
  const [giftBalance, setGiftBalance] = useState<number | null>(null);
  const [follows, setFollows] = useState<EngagementTarget[]>([]);
  const [followedProviders, setFollowedProviders] = useState<
    Map<string, Pick<Provider, "id" | "businessName" | "slug" | "type">>
  >(new Map());
  const [followedPros, setFollowedPros] = useState<
    Map<string, { id: string; name: string; href: string }>
  >(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = () => setFollows(listFollows());
    sync();
    if (user?.id) {
      void hydrateFollows(user.id).catch(() => {
        // The wellness dashboard remains available while follow sync retries on a later visit.
      });
    }
    return subscribeEngagement(sync);
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const run = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      Promise.allSettled([
        api.healthProfile(user.id),
        api.bookingsByConsumer(user.id),
        api.ordersByConsumer(user.id),
        api.plansByConsumer(user.id),
        api.loyalty(),
        api.myGiftCards(),
      ]).then((results) => {
        if (cancelled) return;
        const [h, b, o, p, l, g] = results;
        setHealth(h.status === "fulfilled" ? h.value : null);
        setBookings(b.status === "fulfilled" ? b.value : []);
        setOrders(o.status === "fulfilled" ? o.value : []);
        setPlans(p.status === "fulfilled" ? p.value : []);
        setLoyalty(l.status === "fulfilled" ? l.value : null);
        if (g.status === "fulfilled") {
          const sum = g.value
            .filter((c) => c.status === "active")
            .reduce((acc, c) => acc + Number(c.balance || 0), 0);
          setGiftBalance(sum);
        } else {
          setGiftBalance(null);
        }
        setLoading(false);
      });
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    const providers = follows.filter((f) => f.kind === "provider");
    const pros = follows.filter((f) => f.kind === "professional");
    let cancelled = false;

    const run = async () => {
      await Promise.resolve();
      if (cancelled) return;

      if (providers.length) {
        Promise.all(
          providers.slice(0, 8).map((f) =>
            api.provider(f.id).catch(() => null),
          ),
        ).then((rows) => {
          if (cancelled) return;
          const map = new Map<string, Pick<Provider, "id" | "businessName" | "slug" | "type">>();
          for (const row of rows) {
            if (row) map.set(row.id, row);
          }
          setFollowedProviders(map);
        });
      } else {
        setFollowedProviders(new Map());
      }

      if (pros.length) {
        Promise.all(
          pros.slice(0, 8).map((f) =>
            api.professional(f.id).catch(() => null),
          ),
        ).then((rows) => {
          if (cancelled) return;
          const map = new Map<string, { id: string; name: string; href: string }>();
          for (const row of rows) {
            if (!row) continue;
            map.set(row.id, {
              id: row.id,
              name: row.user?.fullName || row.title || "Practitioner",
              href: practitionerPath(row),
            });
          }
          setFollowedPros(map);
        });
      } else {
        setFollowedPros(new Map());
      }
    };
    run();

    return () => {
      cancelled = true;
    };
  }, [follows]);

  const now = useMemo(() => new Date(), []);
  const bookingList = bookings ?? [];
  const orderList = orders ?? [];
  const planList = plans ?? [];

  const upcoming = bookingList
    .filter((b) => new Date(b.startTime) > now && b.status !== "CANCELLED")
    .sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime));
  const unpaidBookings = bookingList.filter(
    (b) => b.paymentStatus === "unpaid" && b.status !== "CANCELLED",
  );
  const unpaidOrders = orderList.filter(
    (o) => o.paymentStatus === "unpaid" && o.status !== "CANCELLED",
  );
  const activePlans = planList.filter((p) => (p.status || "").toLowerCase() === "active");
  const recentOrders = [...orderList]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 3);

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

  const checklist = [
    {
      id: "dosha",
      done: Boolean(health),
      title: "Complete your dosha assessment",
      body: "Personalise Discover and care recommendations.",
      href: "/dashboard/assessment",
      cta: health ? "View result" : "Start",
    },
    {
      id: "book",
      done: bookingList.length > 0,
      title: "Book your first session",
      body: "Consultation, yoga, spa or therapy near you.",
      href: "/explore",
      cta: bookingList.length ? "Book again" : "Explore",
    },
    {
      id: "privacy",
      done: false, // soft nudge — always linkable
      title: "Review privacy & sharing",
      body: "Control who can see your health profile.",
      href: "/dashboard/permissions",
      cta: "Open",
      soft: true,
    },
  ];
  const checklistOpen = checklist.filter((c) => !c.done && !("soft" in c && c.soft));
  const profileStrength = Math.round(
    ([Boolean(health), bookingList.length > 0, Boolean(user?.fullName), Boolean(loyalty)]
      .filter(Boolean).length /
      4) *
      100,
  );

  const hour = new Date().getHours();

  return (
    <div className="space-y-8">
      <DashHeader
        eyebrow="Wellness seeker"
        title={`${greetingForHour(hour)}, ${firstName(user?.fullName)}`}
        description="Your bookings, constitution, rewards and care plans — one sanctuary."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/explore"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-deep"
            >
              <CalendarIcon className="h-4 w-4" />
              Book a session
            </Link>
            <Link
              href="/discover"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-hairline bg-surface px-4 text-sm font-semibold text-forest hover:border-leaf"
            >
              <CompassIcon className="h-4 w-4" />
              Discover
            </Link>
            <InstallAppButton
              compact
              label="Add to Home Screen"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-leaf/30 bg-leaf/10 px-4 text-sm font-semibold text-forest hover:bg-leaf/15"
            />
          </div>
        }
      />

      {loading ? (
        <div className="flex min-h-[12rem] items-center justify-center rounded-2xl border border-hairline bg-surface">
          <InlineSpinner label="Loading your wellness home…" />
        </div>
      ) : null}

      {/* Needs attention */}
      {(unpaidBookings.length > 0 || unpaidOrders.length > 0) && !loading ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-4">
          <p className="text-sm font-bold text-amber-950">Needs attention</p>
          <ul className="mt-2 space-y-1.5 text-sm font-medium text-amber-900/90">
            {unpaidBookings.length > 0 ? (
              <li>
                <Link href="/dashboard/bookings" className="underline-offset-2 hover:underline">
                  {unpaidBookings.length} unpaid booking
                  {unpaidBookings.length === 1 ? "" : "s"} — pay to confirm
                </Link>
              </li>
            ) : null}
            {unpaidOrders.length > 0 ? (
              <li>
                <Link href="/dashboard/purchases" className="underline-offset-2 hover:underline">
                  {unpaidOrders.length} unpaid order
                  {unpaidOrders.length === 1 ? "" : "s"} in the shop
                </Link>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/bookings" className="block transition-opacity hover:opacity-90">
          <StatTile
            label="Upcoming sessions"
            value={upcoming.length}
            hint={
              unpaidBookings.length
                ? `${unpaidBookings.length} unpaid`
                : bookingList.length
                  ? `${bookingList.length} total`
                  : "Book your first"
            }
          />
        </Link>
        <Link href="/dashboard/plans" className="block transition-opacity hover:opacity-90">
          <StatTile
            label="Active plans"
            value={activePlans.length}
            hint={planList.length ? `${planList.length} total plans` : "Shared by your care team"}
          />
        </Link>
        <Link href="/dashboard/rewards" className="block transition-opacity hover:opacity-90">
          <StatTile
            label="Reward points"
            value={loyalty ? loyalty.pointsBalance.toLocaleString() : "—"}
            hint={loyalty ? `${loyalty.tier} · worth ${formatMoney(loyalty.pointsValue)}` : undefined}
          />
        </Link>
        <Link href="/dashboard/gift-cards" className="block transition-opacity hover:opacity-90">
          <StatTile
            label="Gift card balance"
            value={giftBalance != null ? formatMoney(giftBalance) : "—"}
            hint={followCount() ? `Following ${followCount()}` : "Give or redeem wellness"}
          />
        </Link>
      </div>

      {/* Primary CTAs */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/explore"
          className="group relative overflow-hidden rounded-2xl bg-forest p-6 text-white shadow-[0_8px_28px_rgba(36,56,46,0.18)] hover:bg-forest-deep"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-soft/90">
                Book
              </p>
              <h2 className="mt-1 font-display text-xl">Your next session</h2>
              <p className="mt-1.5 text-sm text-white/75">
                Ayurveda, yoga, spa and meditation
                {primary ? ` · suited to ${DOSHA_INFO[primary].name}` : ""}.
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <CalendarIcon className="h-5 w-5" />
            </span>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold-soft">
            Browse sessions
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
        <Link
          href="/shop"
          className="group rounded-2xl border border-hairline bg-surface p-6 shadow-[0_4px_20px_rgba(36,56,46,0.04)] hover:border-leaf"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold">Shop</p>
              <h2 className="mt-1 font-display text-xl text-forest">Wellness shop</h2>
              <p className="mt-1.5 text-sm text-ink-secondary">
                Herbs, oils and goods from verified practices.
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-leaf/15 text-forest">
              <LotusIcon className="h-5 w-5" />
            </span>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-forest">
            Visit shop
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      <DashQuickLinks
        items={[
          {
            href: "/discover",
            title: "Discover practices",
            body: "Clinics, studios, spas & health clubs",
          },
          {
            href: "/retreats",
            title: "Retreats",
            body: "Immersive programmes worldwide",
          },
          {
            href: "/offers",
            title: "Offers",
            body: "Seasonal packages & specials",
          },
          {
            href: "/dashboard/assessment",
            title: scores ? "Your dosha" : "Dosha assessment",
            body: scores && primary ? `${DOSHA_INFO[primary].name} primary` : "Map Vata · Pitta · Kapha",
          },
          {
            href: "/dashboard/rewards",
            title: "Rewards",
            body: loyalty
              ? `${loyalty.pointsBalance.toLocaleString()} pts · ${loyalty.tier}`
              : "Earn on every booking",
          },
          {
            href: "/dashboard/gift-cards",
            title: "Gift cards",
            body: "Give wellness to someone you love",
          },
        ]}
      />

      {/* Getting started */}
      {checklistOpen.length > 0 ? (
        <DashCard
          title="Getting started"
          description={`Profile strength ${profileStrength}% — complete these steps for a personalised experience.`}
        >
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-clay">
            <div
              className="h-full rounded-full bg-forest transition-all"
              style={{ width: `${profileStrength}%` }}
            />
          </div>
          <ul className="space-y-2">
            {checklist.map((item) => (
              <li
                key={item.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                  item.done
                    ? "border-leaf/30 bg-leaf/5"
                    : "border-hairline bg-clay/20"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-forest">
                    {item.done ? (
                      <span className="mr-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-leaf text-white align-[-0.15em]">
                        <CheckIcon className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                    ) : null}
                    {item.title}
                  </p>
                  <p className="text-xs font-medium text-ink-muted">{item.body}</p>
                </div>
                <Link
                  href={item.href}
                  className="shrink-0 rounded-full bg-forest px-3.5 py-1.5 text-xs font-bold text-white hover:bg-forest-deep"
                >
                  {item.cta}
                </Link>
              </li>
            ))}
          </ul>
        </DashCard>
      ) : null}

      {/* Upcoming + constitution */}
      <div className="grid gap-4 lg:grid-cols-5">
        <section className="space-y-3 lg:col-span-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-xl text-forest">Upcoming sessions</h2>
            <Link
              href="/dashboard/bookings"
              className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline"
            >
              All bookings
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
          {bookings === null ? (
            <div className="h-28 animate-pulse rounded-2xl bg-clay/70" />
          ) : upcoming.length === 0 ? (
            <EmptyState
              title="Nothing scheduled"
              body="Book a consultation, class or treatment — it will show here with pay and calendar options."
              action={
                <Link
                  href="/explore"
                  className="inline-flex min-h-10 items-center rounded-full bg-forest px-4 text-sm font-semibold text-white"
                >
                  Explore sessions
                </Link>
              }
            />
          ) : (
            <ul className="space-y-2.5">
              {upcoming.slice(0, 4).map((b) => (
                <li
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3.5 sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">
                      {b.service?.name ?? "Session"}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-muted">
                      {b.provider?.businessName ? `${b.provider.businessName} · ` : ""}
                      {new Date(b.startTime).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <BookingStatusBadge status={b.status} />
                    <PaymentBadge status={b.paymentStatus} />
                    {b.paymentStatus === "unpaid" ? (
                      <Link
                        href="/dashboard/bookings"
                        className="rounded-full bg-forest px-3 py-1 text-xs font-bold text-white"
                      >
                        Pay
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lg:col-span-2">
          <DashCard
            title="Your constitution"
            description={
              primary
                ? `Primary dosha: ${DOSHA_INFO[primary].name}`
                : "Map your prakriti in a few minutes."
            }
            footer={
              <Link
                href="/dashboard/assessment"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:underline"
              >
                {health ? "Retake assessment" : "Take assessment"}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            }
          >
            {health === undefined ? (
              <div className="h-28 animate-pulse rounded-xl bg-clay/70" />
            ) : scores ? (
              <DoshaMeterGroup {...scores} primary={primary ?? undefined} />
            ) : (
              <p className="text-sm font-medium leading-relaxed text-ink-muted">
                Answer twelve gentle questions to map Vata, Pitta and Kapha — then
                recommendations on AyurPass personalise to you.
              </p>
            )}
          </DashCard>
        </section>
      </div>

      {/* Plans + orders */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DashCard
          title="Treatment plans"
          description="Care plans shared with you by practitioners (with your consent)."
          footer={
            <Link
              href="/dashboard/plans"
              className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline"
            >
              View all plans
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {plans === null ? (
            <div className="h-20 animate-pulse rounded-xl bg-clay/70" />
          ) : planList.length === 0 ? (
            <p className="text-sm font-medium text-ink-muted">
              When a practitioner shares a plan and you grant access, it appears here.
            </p>
          ) : (
            <ul className="space-y-2">
              {planList.slice(0, 3).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-hairline px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-forest">
                      {p.name?.trim() || "Personalised plan"}
                    </p>
                    <p className="truncate text-xs text-ink-muted">
                      {p.provider?.businessName ?? "Practice"}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-clay px-2 py-0.5 text-[10px] font-bold uppercase text-ink-muted">
                    {p.status || "draft"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DashCard>

        <DashCard
          title="Recent orders"
          description="Shop purchases from AyurPass providers."
          footer={
            <Link
              href="/dashboard/purchases"
              className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline"
            >
              All orders
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {orders === null ? (
            <div className="h-20 animate-pulse rounded-xl bg-clay/70" />
          ) : recentOrders.length === 0 ? (
            <p className="text-sm font-medium text-ink-muted">
              No shop orders yet.{" "}
              <Link href="/shop" className="font-semibold text-forest hover:underline">
                Browse the shop
              </Link>
            </p>
          ) : (
            <ul className="space-y-2">
              {recentOrders.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-hairline px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {o.items
                        .map((i) => `${i.quantity}× ${i.product?.name ?? "item"}`)
                        .join(", ")}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {formatMoney(o.subtotal)} ·{" "}
                      {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <PaymentBadge status={o.paymentStatus} />
                </li>
              ))}
            </ul>
          )}
        </DashCard>
      </div>

      {/* Following */}
      {follows.length > 0 ? (
        <DashCard
          title="Following"
          description="Practices and practitioners you follow — open their page anytime."
        >
          <ul className="flex flex-wrap gap-2">
            {[...followedProviders.values()].map((p) => (
              <li key={p.id}>
                <Link
                  href={practicePath(p)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-clay/30 px-3 py-1.5 text-xs font-semibold text-forest hover:border-leaf"
                >
                  <HeartIcon className="h-3 w-3" filled />
                  {p.businessName}
                </Link>
              </li>
            ))}
            {[...followedPros.values()].map((p) => (
              <li key={p.id}>
                <Link
                  href={p.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-clay/30 px-3 py-1.5 text-xs font-semibold text-forest hover:border-leaf"
                >
                  <SparkleIcon className="h-3 w-3" />
                  {p.name}
                </Link>
              </li>
            ))}
            {followedProviders.size === 0 && followedPros.size === 0 ? (
              <li className="text-xs font-medium text-ink-muted">Loading names…</li>
            ) : null}
          </ul>
        </DashCard>
      ) : null}

      {/* Rewards strip */}
      {loyalty ? (
        <Link
          href="/dashboard/rewards"
          className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-hairline bg-gradient-to-br from-gold-soft/40 to-surface p-5 hover:border-leaf"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest text-gold-soft">
              <TrophyIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-forest">
                {loyalty.tier} · {loyalty.pointsBalance.toLocaleString()} points
              </p>
              <p className="text-xs font-medium text-ink-muted">
                Worth {formatMoney(loyalty.pointsValue)} at checkout
                {loyalty.nextTier
                  ? ` · ${loyalty.pointsToNextTier.toLocaleString()} to ${loyalty.nextTier}`
                  : ""}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-forest">
            View rewards
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      ) : null}

      <div className="rounded-2xl border border-dashed border-hairline bg-clay/20 px-5 py-4 text-center sm:text-left">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-forest">Own a wellness practice?</p>
            <p className="text-xs font-medium text-ink-muted">
              List free on Discover — enquiries land in your dashboard.
            </p>
          </div>
          <Link
            href="/list-your-business"
            className="inline-flex items-center justify-center gap-1 rounded-full border border-hairline bg-surface px-4 py-2 text-xs font-bold text-forest hover:border-leaf"
          >
            <GiftIcon className="h-3.5 w-3.5" />
            List your business
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProviderOverview() {
  const { user } = useAuth();
  const provider = user?.provider ?? user?.professional?.provider ?? null;
  const [team, setTeam] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);

  useEffect(() => {
    if (!provider) return;
    api.professionalsByProvider(provider.id).then(setTeam).catch(() => {});
    api.servicesByProvider(provider.id).then(setServices).catch(() => {});
    api.bookingsByProvider(provider.id).then(setBookings).catch(() => {});
    api.myEnquiries().then(setEnquiries).catch(() => {});
  }, [provider]);

  const isListing = provider?.listingTier === "FREE_LISTING" || services.length === 0;
  const newLeads = enquiries.filter((e) => e.status === "new").length;
  const bookableSessions = services.filter((s) => s.category !== "PACKAGE").length;

  const now = new Date();
  const upcoming = bookings.filter(
    (b) => new Date(b.startTime) >= now && b.status !== "CANCELLED" && b.status !== "COMPLETED",
  );
  const pending = bookings.filter((b) => b.status === "PENDING");

  const launchSteps = [
    {
      id: "profile",
      done: Boolean(provider?.brandProfile) && Boolean(provider?.address),
      title: "Complete your public profile",
      body: "Add your brand, address, and client-facing practice details.",
      href: "/dashboard/business",
      cta: "Edit profile",
    },
    {
      id: "session",
      done: bookableSessions > 0,
      title: "Publish your first bookable session",
      body: "Turn discovery into an online booking opportunity.",
      href: "/dashboard/services",
      cta: "Add session",
    },
    {
      id: "verification",
      done: provider?.verificationStatus === "verified",
      title: "Submit credentials for verification",
      body: "Build trust with credentials and authority marks on your public page.",
      href: "/dashboard/verification",
      cta: "Open verification",
    },
  ];
  const launchOpen = launchSteps.filter((step) => !step.done);
  const launchProgress = Math.round(((launchSteps.length - launchOpen.length) / launchSteps.length) * 100);

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

      {launchOpen.length > 0 ? (
        <DashCard
          title="Practice launch checklist"
          description={`${launchProgress}% complete — finish these essentials to help the right clients find and book you.`}
        >
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-clay">
            <div
              className="h-full rounded-full bg-forest transition-all"
              style={{ width: `${launchProgress}%` }}
            />
          </div>
          <ul className="space-y-2">
            {launchOpen.map((step) => (
              <li
                key={step.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hairline bg-clay/20 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-forest">{step.title}</p>
                  <p className="text-xs font-medium text-ink-muted">{step.body}</p>
                </div>
                <Link
                  href={step.href}
                  className="shrink-0 rounded-full bg-forest px-3.5 py-1.5 text-xs font-bold text-white hover:bg-forest-deep"
                >
                  {step.cta}
                </Link>
              </li>
            ))}
          </ul>
        </DashCard>
      ) : (
        <div className="rounded-2xl border border-leaf/30 bg-leaf/5 px-5 py-4">
          <p className="text-sm font-bold text-forest">Your practice launch essentials are complete.</p>
          <p className="mt-1 text-xs font-medium text-ink-muted">
            Keep your sessions, availability, and public profile current as your practice grows.
          </p>
        </div>
      )}

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
          value={bookableSessions}
        />
        <StatTile label="Team" value={team.length} hint="Practitioners" />
      </div>

      {isListing && (
        <Link
          href="/dashboard/services"
          className="group flex items-center justify-between rounded-2xl border border-hairline bg-gold-soft/40 p-6 hover:border-leaf"
        >
          <div>
            <h2 className="font-display text-xl text-forest">Start accepting online bookings</h2>
            <p className="mt-1 text-sm text-ink-secondary">
              Add a bookable session to take bookings &amp; payments through AyurPass —
              clients can book you directly.
            </p>
          </div>
          <ArrowRightIcon className="h-5 w-5 shrink-0 text-forest transition-transform group-hover:translate-x-1" />
        </Link>
      )}

      {/* Multi-resource ops */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/dashboard/calendar"
          className="group rounded-2xl border border-hairline bg-surface p-5 hover:border-leaf"
        >
          <h2 className="font-display text-lg text-forest">Staff calendar</h2>
          <p className="mt-1 text-sm text-ink-secondary">
            Multiple therapists · different rooms · same time
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-forest">
            Open calendar
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
        <Link
          href="/dashboard/team"
          className="group rounded-2xl border border-hairline bg-surface p-5 hover:border-leaf"
        >
          <h2 className="font-display text-lg text-forest">Team</h2>
          <p className="mt-1 text-sm text-ink-secondary">
            {team.length
              ? `${team.length} practitioner${team.length === 1 ? "" : "s"} on roster`
              : "Add practitioners for parallel sessions"}
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-forest">
            Manage team
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
        <Link
          href="/dashboard/rooms"
          className="group rounded-2xl border border-hairline bg-surface p-5 hover:border-leaf"
        >
          <h2 className="font-display text-lg text-forest">Rooms</h2>
          <p className="mt-1 text-sm text-ink-secondary">
            Assign spaces so concurrent treatments don&apos;t clash
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-forest">
            Manage rooms
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href={provider ? `/providers/${provider.id}` : "/discover"}
          className="group rounded-2xl border border-hairline bg-surface p-6 hover:border-leaf"
        >
          <h2 className="font-display text-xl text-forest">Your public page</h2>
          <p className="mt-2 text-sm text-ink-secondary">See exactly how visitors discover you.</p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest">
            View practice
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
          <p className="mt-2 text-sm text-ink-secondary">Leads from your public practice page.</p>
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
  const { data: stats, isLoading } = useAdminOverview(true);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-forest">Platform overview</h1>
        <p className="mt-1 text-ink-muted">AyurPass at a glance.</p>
      </div>

      {isLoading || !stats ? (
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
            <StatTile
              label="Active job listings"
              value={stats.jobs ?? 0}
              hint={`${stats.jobApplications ?? 0} total candidate applications`}
            />
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
  const [mode, setMode] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored =
          window.localStorage.getItem("ayurpass.dashboard.workspaceMode") ||
          window.localStorage.getItem("ayurpass.dashboard.viewModeOverride");
        setMode(stored);
      } catch {
        setMode(null);
      }
    });
  }, [user?.id, user?.role]);

  // Workspace switcher can override role: admin ↔ seeker ↔ practice
  if (mode === "admin" || (!mode && user?.role === "PLATFORM_ADMIN")) {
    return <PlatformAdminOverview />;
  }
  if (
    mode === "practice" ||
    mode === "staff" ||
    mode === "provider" ||
    (!mode &&
      (user?.role === "PROVIDER_ADMIN" ||
        user?.role === "PROFESSIONAL" ||
        Boolean(user?.provider)))
  ) {
    return <ProviderOverview />;
  }
  if (mode === "careers") {
    // Careers board lives at /careers — overview still shows seeker home with a link
    return <ConsumerOverview />;
  }
  return <ConsumerOverview />;
}
