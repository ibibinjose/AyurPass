import type { Metadata } from "next";
import Link from "next/link";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { PageHero } from "@/components/content";
import {
  CompassIcon,
  CalendarIcon,
  GiftIcon,
  ShieldIcon,
  UsersIcon,
  SparkleIcon,
  ArrowRightIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Help Center | AyurPass",
  description:
    "Guides and answers for getting started, booking, gift cards, privacy and providers on AyurPass.",
  alternates: { canonical: "https://www.ayurpass.com/help" },
};

const TOPICS = [
  {
    icon: CompassIcon,
    title: "Getting started",
    body: "Create your account, take the dosha assessment and get personalized recommendations.",
    href: "/register",
    cta: "Take the assessment",
  },
  {
    icon: CalendarIcon,
    title: "Bookings & scheduling",
    body: "Find services, book a time, and manage or reschedule appointments from your dashboard.",
    href: "/explore",
    cta: "Browse services",
  },
  {
    icon: GiftIcon,
    title: "Gift cards & rewards",
    body: "Buy and send gift cards, and apply reward points toward future bookings.",
    href: "/dashboard/gift-cards",
    cta: "Manage gift cards",
  },
  {
    icon: ShieldIcon,
    title: "Privacy & data",
    body: "Understand how your health data is protected and how to exercise your rights.",
    href: "/privacy",
    cta: "Read privacy policy",
  },
  {
    icon: UsersIcon,
    title: "For providers",
    body: "List your practice, complete verification and manage clients, staff and payments.",
    href: "/register?as=provider",
    cta: "List your practice",
  },
  {
    icon: SparkleIcon,
    title: "Wellness guide",
    body: "Learn about Ayurveda, yoga, meditation, health clubs and spa, and how they fit together.",
    href: "/wellness",
    cta: "Explore disciplines",
  },
];

export default function HelpPage() {
  return (
    <LayoutWrapper>
      <PageHero
        eyebrow="Support"
        title="How can we help?"
        subtitle="Browse a topic below, or reach our team directly."
      />

      <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((t) => (
            <Link
              key={t.title}
              href={t.href}
              className="group flex flex-col rounded-2xl border border-hairline bg-surface p-6 transition-colors hover:border-leaf"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-gold-soft">
                <t.icon className="h-5.5 w-5.5" />
              </span>
              <h2 className="mt-4 font-display text-xl text-forest">{t.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-secondary">{t.body}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest">
                {t.cta}
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-hairline bg-clay/60 p-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="font-display text-lg text-forest">Can&apos;t find what you need?</p>
            <p className="mt-1 text-sm text-ink-secondary">
              Check the FAQ or send us a message — we reply within one business day.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Link
              href="/faq"
              className="inline-flex items-center rounded-full border border-hairline bg-surface px-5 py-2.5 text-sm font-medium text-forest transition-colors hover:border-leaf"
            >
              Read FAQ
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-forest-deep"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </LayoutWrapper>
  );
}
