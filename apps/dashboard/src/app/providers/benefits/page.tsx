import type { Metadata } from "next";
import Link from "next/link";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { PageHero } from "@/components/content";
import {
  CalendarIcon,
  CheckIcon,
  CompassIcon,
  CreditCardIcon,
  GlobeIcon,
  MailIcon,
  ShieldIcon,
  SmartphoneIcon,
  SparkleIcon,
  TrophyIcon,
  UsersIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Benefits & Pricing for Providers | AyurPass",
  description:
    "Why clinics, studios and spas grow with AyurPass — unlimited appointments, payments, branded booking pages, mobile apps, email automation, and team tools.",
  alternates: { canonical: "https://www.ayurpass.com/providers/benefits" },
};

const BENEFITS = [
  {
    icon: CalendarIcon,
    title: "Unlimited appointments",
    body: "Accept unlimited client bookings without booking caps, monthly quotas, or per-appointment platform penalties.",
  },
  {
    icon: CreditCardIcon,
    title: "Accept payments & deposits",
    body: "Integrated credit/debit card checkout, Apple Pay, deposits, and gift cards with direct bank payouts via Stripe Connect.",
  },
  {
    icon: GlobeIcon,
    title: "Branded Booking Page",
    body: "Your own dedicated booking URL (ayurpass.com/@yourpractice) featuring your logo, photo gallery, practitioner bios, and service menu.",
  },
  {
    icon: SmartphoneIcon,
    title: "iOS & Android apps",
    body: "Native mobile apps on Apple App Store & Google Play so clients can discover, book, and reschedule on the go.",
  },
  {
    icon: MailIcon,
    title: "Email reminders & confirmations",
    body: "Automated instant confirmations with .ics calendar invites, plus 24h & 2h email reminders that dramatically cut no-shows.",
  },
  {
    icon: SparkleIcon,
    title: "Integrations with leading apps",
    body: "Two-way Google Calendar sync, Apple iCal, Square POS inventory, Stripe Payments, and Mailchimp CRM connectivity.",
  },
  {
    icon: CalendarIcon,
    title: "Recurring appointments",
    body: "Schedule recurring weekly, bi-weekly, or monthly treatment series for multi-session Panchakarma, therapy plans, and classes.",
  },
  {
    icon: SparkleIcon,
    title: "2-Way Calendar Sync",
    body: "Two-way live sync with Google Calendar, Apple Calendar, and Outlook to ensure external personal events block availability.",
  },
  {
    icon: ShieldIcon,
    title: "Block disruptive customers",
    body: "Protect your practice, rooms, and therapists against repeat no-shows, fraudulent orders, or harassment with one-click customer blocking.",
  },
  {
    icon: GlobeIcon,
    title: "Embeddable Website Widget",
    body: "Embed your live AyurPass booking calendar on your existing WordPress, Squarespace, Wix, or Shopify website with clean iFrames.",
  },
  {
    icon: CompassIcon,
    title: "Printable Front-Desk QR Kit",
    body: "Download and print tabletop QR counter cards for clinic reception desks and treatment rooms so clients can scan and rebook instantly.",
  },
  {
    icon: UsersIcon,
    title: "Class & Workshop Bookings",
    body: "Host yoga classes, sound baths, and meditation circles with capacity limits, real-time remaining spots, and attendee rosters.",
  },
  {
    icon: SparkleIcon,
    title: "Smart Treatment Buffers",
    body: "Automatic 15–30 minute cleanup and herbal oil preparation windows between sessions to prevent room turnaround delays.",
  },
  {
    icon: CalendarIcon,
    title: "Self-Service Rescheduling",
    body: "Empower clients to reschedule or cancel online up to 24 hours prior without endless phone tag, while enforcing clinic policy cutoffs.",
  },
  {
    icon: GlobeIcon,
    title: "Telehealth & Virtual Video Calls",
    body: "Automatic encrypted video room links for remote Ayurvedic consultations, dietary coaching, and breathwork sessions.",
  },
  {
    icon: SparkleIcon,
    title: "Always-On Desktop App",
    body: "Run AyurPass in a standalone Mac and Windows window with audio alerts, launch on startup, and offline cache protection.",
  },
  {
    icon: TrophyIcon,
    title: "Branded Mobile App (Enterprise)",
    body: "Deploy your very own standalone white-label mobile app with custom app icon and dedicated app store presence.",
  },
  {
    icon: ShieldIcon,
    title: "Verified clinical trust",
    body: "Showcase verified practitioner credentials, dosha-aligned wellness matching, and authentic client reviews.",
  },
];

const TIERS = [
  {
    name: "Free listing",
    price: "$0",
    cadence: " forever",
    blurb: "For solo practitioners & boutique spaces getting discovered.",
    features: [
      "Branded public practice profile",
      "Presence in AyurPass iOS & Android directory",
      "Client enquiry inbox",
      "Custom handle (ayurpass.com/@yourbrand)",
      "Photo gallery, logo & practitioner bio",
    ],
    cta: "List for free",
    href: "/list-your-business",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$29",
    cadence: "/month",
    blurb: "Complete booking, payment & operations stack for clinics and studios.",
    features: [
      "Unlimited 1-on-1 & recurring appointments",
      "Always-on Desktop App for Mac & Windows",
      "Telehealth & virtual video consultations",
      "Self-service rescheduling & cancellation policy (24h)",
      "Group class & workshop booking (capacity caps)",
      "Smart treatment buffer times (oil prep & cleanup)",
      "Embeddable Website Widget (WordPress/Wix)",
      "Printable Front-Desk QR Counter Kit",
      "2-Way Calendar Sync (Google & Apple iCal)",
      "Accept payments & deposits via Stripe Connect",
      "Branded Booking Page with live availability",
      "Automated 24h & 2h email reminders",
      "Block disruptive customers & CRM protection",
      "iOS & Android mobile app access for clients & staff",
      "Team collaboration tools: multi-staff & rooms",
    ],
    cta: "Choose Growth",
    href: "/register?as=provider",
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    blurb: "For luxury retreats, multi-location clinics & wellness franchise chains.",
    features: [
      "Everything in Growth across all locations",
      "Dedicated Branded Mobile App (custom app store listing)",
      "Custom domain & white-label booking widgets",
      "Advanced team collaboration & custom permission tiers",
      "Custom integrations, webhooks & dedicated partner",
      "Priority payouts & custom billing agreements",
    ],
    cta: "Talk to sales",
    href: "/contact",
    highlight: false,
  },
];

const COMPARISON_ROWS = [
  {
    feature: "Unlimited appointments",
    free: "Enquiries only",
    growth: "Unlimited (no booking caps)",
    enterprise: "Unlimited (all branches)",
  },
  {
    feature: "Always-on Desktop App",
    free: "Web browser only",
    growth: "Installable PWA for Mac & Windows",
    enterprise: "Full desktop client + Multi-screen setup",
  },
  {
    feature: "Telehealth & virtual video calls",
    free: "—",
    growth: "Included (auto-generated video rooms)",
    enterprise: "Custom video integration & HIPAA/GDPR rooms",
  },
  {
    feature: "Self-service client rescheduling",
    free: "—",
    growth: "Online 24h self-service rescheduling",
    enterprise: "Custom notice windows & policy waivers",
  },
  {
    feature: "Group class & workshop booking",
    free: "—",
    growth: "Included (capacity caps & rosters)",
    enterprise: "Unlimited classes across branches",
  },
  {
    feature: "Smart treatment buffers",
    free: "—",
    growth: "Configurable prep & cleanup windows",
    enterprise: "Advanced room turnaround scheduling",
  },
  {
    feature: "Embeddable Website Widget",
    free: "—",
    growth: "WordPress, Squarespace & Wix iFrame",
    enterprise: "White-label embed + Custom domain",
  },
  {
    feature: "Printable Front-Desk QR Kit",
    free: "Profile link",
    growth: "High-res QR & printable counter sign",
    enterprise: "Custom branded collateral kit",
  },
  {
    feature: "Recurring appointments",
    free: "—",
    growth: "Weekly, bi-weekly & monthly series",
    enterprise: "Custom recurring treatment plans",
  },
  {
    feature: "2-Way Calendar Sync",
    free: "—",
    growth: "Google Calendar & Apple iCal live sync",
    enterprise: "Full 2-way sync across staff & branches",
  },
  {
    feature: "Block customers",
    free: "—",
    growth: "Included (CRM one-click blocking)",
    enterprise: "Included + Global blacklist rules",
  },
  {
    feature: "Accept payments & deposits",
    free: "—",
    growth: "Stripe Connect + Apple Pay",
    enterprise: "Stripe Connect + Custom Payouts",
  },
  {
    feature: "Branded Booking Page",
    free: "Public directory profile",
    growth: "Custom URL + Live checkout",
    enterprise: "Custom URL + White-label embed",
  },
  {
    feature: "Branded Mobile App",
    free: "Listed in AyurPass App",
    growth: "AyurPass App with Brand Profile",
    enterprise: "Dedicated App (Custom App Icon & Listing)",
  },
  {
    feature: "Email reminders",
    free: "—",
    growth: "Automated 24h & 2h reminders",
    enterprise: "Automated + Custom schedules",
  },
  {
    feature: "Email confirmations",
    free: "Enquiry alerts",
    growth: "Instant + .ics calendar invites",
    enterprise: "Instant + Branded templates",
  },
  {
    feature: "Integrations with leading apps",
    free: "—",
    growth: "Google Cal, Square POS, Stripe, Mailchimp",
    enterprise: "All apps + Custom Webhooks & API",
  },
  {
    feature: "iOS & Android apps",
    free: "Directory listing",
    growth: "Client & staff mobile app",
    enterprise: "Full staff app + White-label app",
  },
  {
    feature: "Team collaboration tools",
    free: "Solo profile",
    growth: "Multi-staff calendars, rooms & roles",
    enterprise: "Multi-location team hierarchy",
  },
];

export default function ProviderBenefitsPage() {
  return (
    <LayoutWrapper>
      <PageHero
        eyebrow="For Providers & Practices"
        title="Everything you need to run & grow"
        subtitle="Unlimited appointments, direct payments, branded booking pages, native mobile apps, automated email communication, and team collaboration tools — all in one unified platform."
      />

      {/* 9 Core Benefits Grid */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
            Complete Practice Infrastructure
          </p>
          <h2 className="mt-2 font-display text-3xl text-forest sm:text-4xl">
            Built for modern Ayurvedic clinics, yoga studios & spas
          </h2>
          <p className="mt-3 text-ink-secondary text-sm sm:text-base">
            Replace dozens of disconnected subscriptions with one integrated operating system designed specifically for holistic wellness.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-2xl border border-hairline bg-surface p-6 shadow-sm hover:border-leaf/40 transition-colors">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-gold-soft">
                <b.icon className="h-5.5 w-5.5" />
              </span>
              <h3 className="mt-4 font-display text-lg text-forest">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="border-t border-hairline bg-surface/60">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:py-16">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl text-forest">Simple, transparent plans</h2>
            <p className="mt-2 text-ink-secondary">
              Zero hidden booking surcharges. Start free, upgrade when you need live online scheduling, payments, and team operations.
            </p>
          </div>

          <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-3">
            {TIERS.map((t) => (
              <div
                key={t.name}
                className={`relative flex flex-col rounded-2xl p-7 ${
                  t.highlight
                    ? "bg-surface shadow-[0_18px_50px_rgba(24,39,32,0.14)] ring-2 ring-gold"
                    : "border border-hairline bg-surface"
                }`}
              >
                {t.badge ? (
                  <span className="absolute -top-3 left-7 inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-forest-deep">
                    <SparkleIcon className="h-3.5 w-3.5" />
                    {t.badge}
                  </span>
                ) : null}
                <h3 className="font-display text-xl text-forest">{t.name}</h3>
                <p className="mt-1 text-sm text-ink-muted">{t.blurb}</p>
                <p className="mt-4">
                  <span className="text-4xl font-semibold text-foreground">{t.price}</span>
                  <span className="text-ink-muted">{t.cadence}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-ink-secondary">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" strokeWidth={2.4} />
                      <span className="leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={t.href}
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
                    t.highlight
                      ? "bg-forest text-white hover:bg-forest-deep shadow-md"
                      : "border border-hairline bg-surface text-forest hover:border-forest"
                  }`}
                >
                  {t.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Feature Matrix Table */}
          <div className="mt-16 overflow-hidden rounded-2xl border border-hairline bg-surface shadow-sm">
            <div className="border-b border-hairline bg-surface-raised px-6 py-4">
              <h3 className="font-display text-lg text-forest">Detailed Feature Comparison</h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Every feature compared across our Free, Growth, and Enterprise plans.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-hairline bg-surface/50 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    <th className="px-6 py-3.5">Feature</th>
                    <th className="px-6 py-3.5">Free Listing</th>
                    <th className="px-6 py-3.5 text-forest font-bold">Growth ($29/mo)</th>
                    <th className="px-6 py-3.5">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.feature} className="hover:bg-surface-raised/40 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-forest">{row.feature}</td>
                      <td className="px-6 py-3.5 text-ink-secondary">{row.free}</td>
                      <td className="px-6 py-3.5 font-semibold text-forest-deep bg-forest/5">{row.growth}</td>
                      <td className="px-6 py-3.5 text-ink-secondary">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-hairline bg-forest/5 p-6">
            <div>
              <h4 className="font-display text-base text-forest">Need custom staff limits or enterprise migration?</h4>
              <p className="text-sm text-ink-secondary mt-0.5">
                We migrate your client database, service lists, and past bookings free of charge.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-deep transition-colors"
            >
              Talk with an advisor
            </Link>
          </div>
        </div>
      </section>
    </LayoutWrapper>
  );
}
