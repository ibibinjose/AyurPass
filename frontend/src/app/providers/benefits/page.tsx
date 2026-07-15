import type { Metadata } from "next";
import Link from "next/link";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { PageHero } from "@/components/content";
import {
  CompassIcon,
  CalendarIcon,
  ShieldIcon,
  SparkleIcon,
  UsersIcon,
  TrophyIcon,
  CheckIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Benefits & Pricing for Providers | AyurPass",
  description:
    "Why clinics, studios and spas grow with AyurPass — plus transparent plans for solo practitioners through multi-location brands.",
  alternates: { canonical: "https://www.ayurpass.com/providers/benefits" },
};

const BENEFITS = [
  {
    icon: CompassIcon,
    title: "Matched clients",
    body: "Reach a global audience recommended to you by dosha profile, goals and location — not just search.",
  },
  {
    icon: CalendarIcon,
    title: "Scheduling built in",
    body: "Manage availability, staff and rooms, with automatic reminders and no-show protection.",
  },
  {
    icon: TrophyIcon,
    title: "Payments & payouts",
    body: "Integrated checkout, gift cards and reward points, with commission only on completed bookings.",
  },
  {
    icon: SparkleIcon,
    title: "Analytics & insights",
    body: "Understand revenue, retention and demand across every discipline you offer.",
  },
  {
    icon: ShieldIcon,
    title: "Verified trust",
    body: "A verification badge that reassures new clients before they ever book.",
  },
  {
    icon: UsersIcon,
    title: "Team management",
    body: "Add practitioners, assign services and manage multiple locations from one place.",
  },
];

const TIERS = [
  {
    name: "Starter",
    price: "$149",
    cadence: "/month",
    blurb: "For solo practitioners finding their footing.",
    features: ["Bookings & scheduling", "Verified profile & listings", "Client messaging", "Standard commission"],
    cta: "Start with Starter",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$349",
    cadence: "/month",
    blurb: "For growing clinics & multi-practitioner studios.",
    features: [
      "Everything in Starter",
      "Staff & multi-practitioner management",
      "Analytics & revenue insights",
      "Marketing automation",
    ],
    cta: "Choose Growth",
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    blurb: "For multi-location brands & franchises.",
    features: ["Multi-location brands", "White-label options", "Dedicated success manager", "Custom integrations"],
    cta: "Talk to sales",
    highlight: false,
  },
];

export default function ProviderBenefitsPage() {
  return (
    <LayoutWrapper>
      <PageHero
        eyebrow="For Providers"
        title="Benefits & pricing"
        subtitle="Everything you need to grow a practice worthy of your craft — with pricing that scales as you do."
      />

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-2xl border border-hairline bg-surface p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-gold-soft">
                <b.icon className="h-5.5 w-5.5" />
              </span>
              <h2 className="mt-4 font-display text-xl text-forest">{b.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-hairline bg-surface/60">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:py-16">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl text-forest">Simple, transparent plans</h2>
            <p className="mt-2 text-ink-secondary">
              No setup fees, a 14-day free trial, and commission only on completed bookings. Cancel
              anytime.
            </p>
          </div>

          <div className="mt-10 grid items-stretch gap-5 lg:grid-cols-3">
            {TIERS.map((t) => (
              <div
                key={t.name}
                className={`relative flex flex-col rounded-2xl p-7 ${
                  t.highlight
                    ? "bg-surface shadow-[0_18px_50px_rgba(24,39,32,0.12)] ring-1 ring-gold/40"
                    : "border border-hairline bg-surface"
                }`}
              >
                {t.badge ? (
                  <span className="absolute -top-3 left-7 inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-forest-deep">
                    <SparkleIcon className="h-3.5 w-3.5" />
                    {t.badge}
                  </span>
                ) : null}
                <h3 className="font-display text-lg text-forest">{t.name}</h3>
                <p className="mt-1 text-sm text-ink-muted">{t.blurb}</p>
                <p className="mt-4">
                  <span className="text-3xl font-semibold text-foreground">{t.price}</span>
                  <span className="text-ink-muted">{t.cadence}</span>
                </p>
                <ul className="mt-5 flex-1 space-y-2.5 text-sm text-ink-secondary">
                  {t.features.map((f) => (
                    <li key={f} className="flex gap-2.5">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register?as=provider"
                  className={`mt-7 inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                    t.highlight
                      ? "bg-forest text-white hover:bg-forest-deep"
                      : "border border-hairline bg-surface text-forest hover:border-leaf"
                  }`}
                >
                  {t.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm text-ink-muted">
            Have questions about the right plan?{" "}
            <Link href="/contact" className="font-medium text-forest hover:underline">
              Talk to our team
            </Link>
            .
          </p>
        </div>
      </section>
    </LayoutWrapper>
  );
}
