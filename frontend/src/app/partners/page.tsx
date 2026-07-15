import type { Metadata } from "next";
import Link from "next/link";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { PageHero } from "@/components/content";
import {
  LeafIcon,
  UsersIcon,
  SparkleIcon,
  ShieldIcon,
  CompassIcon,
  ArrowRightIcon,
  CheckIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Partner Programs | AyurPass",
  description:
    "Partner with AyurPass — for wellness brands, corporate wellness, retreats and affiliates. Grow with a platform built for authentic care.",
  alternates: { canonical: "https://www.ayurpass.com/partners" },
};

const PROGRAMS = [
  {
    icon: LeafIcon,
    title: "Wellness brands",
    body: "List treatments, packages and products, reach clients matched to your specialty, and manage everything from one dashboard.",
  },
  {
    icon: UsersIcon,
    title: "Corporate wellness",
    body: "Offer your team access to verified Ayurveda, yoga, meditation and fitness partners, with consolidated billing and reporting.",
  },
  {
    icon: SparkleIcon,
    title: "Retreats & resorts",
    body: "Fill programs with guests seeking authentic, constitution-aware experiences, and cross-sell across disciplines.",
  },
  {
    icon: CompassIcon,
    title: "Affiliates & creators",
    body: "Introduce your audience to personalized wellness and earn on the bookings you refer.",
  },
];

const BENEFITS = [
  "A global audience matched to your specialty by dosha and goals",
  "Built-in scheduling, payments and no-show protection",
  "Analytics and revenue insights across every discipline",
  "Verification that builds trust with new clients",
];

export default function PartnersPage() {
  return (
    <LayoutWrapper>
      <PageHero
        eyebrow="For Partners"
        title="Grow with AyurPass"
        subtitle="Whether you run a clinic, a retreat, a corporate wellness program or an audience, there's a way to partner with us."
      />

      <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <div className="grid gap-5 sm:grid-cols-2">
          {PROGRAMS.map((p) => (
            <div key={p.title} className="rounded-2xl border border-hairline bg-surface p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-gold-soft">
                <p.icon className="h-5.5 w-5.5" />
              </span>
              <h2 className="mt-4 font-display text-xl text-forest">{p.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-hairline bg-surface/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl text-forest">Why partners choose us</h2>
            <p className="mt-3 max-w-lg leading-relaxed text-ink-secondary">
              AyurPass is built around authentic, personalized care — so the clients we send you are
              already a fit for what you do best.
            </p>
            <ul className="mt-6 space-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-ink-secondary">
                  <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-leaf" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-hairline bg-forest p-8 text-white sm:p-10">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-gold-soft">
              <ShieldIcon className="h-6 w-6" />
            </span>
            <h3 className="mt-5 font-display text-2xl">Let&apos;s build something together</h3>
            <p className="mt-3 leading-relaxed text-white/70">
              Tell us about your organization and goals, and our partnerships team will design the
              right program with you.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-forest-deep transition-colors hover:bg-gold-soft"
              >
                Talk to partnerships
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/register?as=provider"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                List your practice
              </Link>
            </div>
          </div>
        </div>
      </section>
    </LayoutWrapper>
  );
}
