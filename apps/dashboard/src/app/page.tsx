import Link from "next/link";
import type { Metadata } from "next";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { DEFAULT_SOCIAL_IMAGE, SITE_TAGLINE, SITE_TITLE_DEFAULT } from "@/lib/seo";
import {
  AyurvedaArt,
  HealthClubArt,
  MeditationArt,
  SpaArt,
  YogaArt,
} from "@/components/WellnessArt";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  CompassIcon,
  DumbbellIcon,
  FlameIcon,
  GiftIcon,
  LeafIcon,
  LotusIcon,
  MoonIcon,
  SearchIcon,
  ShieldIcon,
  SparkleIcon,
  UsersIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE_DEFAULT },
  description: SITE_TAGLINE,
  alternates: { canonical: "/" },
  openGraph: {
    title: SITE_TITLE_DEFAULT,
    description: SITE_TAGLINE,
    url: "/",
    images: [
      {
        url: DEFAULT_SOCIAL_IMAGE,
        width: 1200,
        height: 630,
        alt: "AyurPass — Find and book Ayurveda, Yoga and Wellness",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE_DEFAULT,
    description: SITE_TAGLINE,
    images: [{ url: DEFAULT_SOCIAL_IMAGE, alt: "AyurPass — Find and book Ayurveda, Yoga and Wellness" }],
  },
};

const POPULAR_SEARCHES = [
  { label: "Panchakarma", href: "/discover?q=Panchakarma" },
  { label: "Abhyanga Massage", href: "/discover?q=Abhyanga" },
  { label: "Yoga Retreats", href: "/retreats" },
  { label: "Vaidya Consult", href: "/discover?group=Ayurveda" },
  { label: "Day Spas", href: "/discover?group=Spa" },
];

const PATHWAYS = [
  {
    href: "/discover",
    icon: CompassIcon,
    title: "Discover places",
    body: "Vetted clinics, studios, spas and retreats near you with transparent pricing.",
    cta: "Browse directory",
  },
  {
    href: "/explore",
    icon: CalendarIcon,
    title: "Book a session",
    body: "Browse individual treatments, consultations, and day passes ready to book.",
    cta: "Explore treatments",
  },
  {
    href: "/retreats",
    icon: MoonIcon,
    title: "Immersive retreats",
    body: "Handpicked wellness escapes, Panchakarma centers, and yoga retreats worldwide.",
    cta: "Find retreats",
  },
  {
    href: "/offers",
    icon: GiftIcon,
    title: "Exclusive offers",
    body: "Seasonal passes, introductory specials, and packages from top practitioners.",
    cta: "View offers",
  },
] as const;

const PILLARS = [
  {
    href: "/discover?group=Ayurveda",
    icon: LeafIcon,
    Art: AyurvedaArt,
    name: "Ayurveda",
    body: "Vaidyas, Panchakarma and herbal therapies rooted in classical knowledge.",
  },
  {
    href: "/discover?group=Yoga",
    icon: LotusIcon,
    Art: YogaArt,
    name: "Yoga",
    body: "Studios, private sessions and retreats filtered by discipline and skill level.",
  },
  {
    href: "/discover?group=Spa",
    icon: FlameIcon,
    Art: SpaArt,
    name: "Luxury spa",
    body: "Restorative hydrotherapy, body rituals, and holistic day spa sanctuaries.",
  },
  {
    href: "/discover?group=Meditation",
    icon: MoonIcon,
    Art: MeditationArt,
    name: "Meditation",
    body: "Guided mindfulness, breathwork (Pranayama) and residential retreats.",
  },
  {
    href: "/discover?group=Health%20Club",
    icon: DumbbellIcon,
    Art: HealthClubArt,
    name: "Health club",
    body: "Mindful movement, recovery zones, and personalized vitality training.",
  },
] as const;

const STEPS = [
  {
    icon: CompassIcon,
    title: "1. Discover your constitution",
    body: "A quick 2-minute quiz reveals your Prakriti (Vata, Pitta, Kapha) — your unique blueprint for diet, treatments, and daily rhythm.",
  },
  {
    icon: SparkleIcon,
    title: "2. Explore matched practices",
    body: "Filter clinics and retreat centers by location, treatment type, and energetic compatibility — jargon-free and transparent.",
  },
  {
    icon: ShieldIcon,
    title: "3. Book with peace of mind",
    body: "Schedule directly with verified Vaidyas and accredited practitioners. Your private health notes remain confidential and secure.",
  },
] as const;

const PROVIDER_PERKS = [
  "Verified public profile & SEO listing",
  "Real-time calendar & appointment booking",
  "Secure payments & instant deposits via Stripe",
  "Automated SMS & email reminders",
  "Multi-therapist and room management",
  "iOS & Android practitioner access",
] as const;

const TIERS = [
  {
    name: "Free Listing",
    price: "$0",
    cadence: " forever",
    blurb: "Get a public profile in the AyurPass directory.",
    features: [
      "Branded public practice profile",
      "Listing in global wellness directory",
      "Direct client enquiry inbox",
      "Verified practitioner badge",
      "Photos, service menu & location map",
    ],
    cta: "List your practice free",
    href: "/list-your-business",
  },
  {
    name: "Growth Ops",
    price: "$29",
    cadence: "/month",
    highlight: true,
    badge: "Most popular",
    blurb: "Complete booking, client CRM & payment infrastructure.",
    features: [
      "Everything in Free Listing",
      "Direct online booking & calendar sync",
      "Credit card & Apple Pay checkout (Stripe)",
      "Automated appointment reminders",
      "Staff scheduling & room assignment",
      "Client treatment notes & history",
    ],
    cta: "Start 14-day free trial",
    href: "/list-your-business",
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    blurb: "Multi-location clinics, resorts & luxury retreat centers.",
    features: [
      "Everything in Growth across all locations",
      "Dedicated account manager & concierge",
      "Custom branded booking widgets",
      "White-label mobile app integration",
      "Custom analytics & reporting",
      "Priority SLA & onboarding support",
    ],
    cta: "Contact our team",
    href: "/contact",
  },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getMarketplaceStats(): Promise<{
  practices: number;
  practitioners: number;
}> {
  try {
    const [providersRes, prosRes] = await Promise.all([
      fetch(`${API_URL}/providers`, { next: { revalidate: 300 } }),
      fetch(`${API_URL}/professionals`, { next: { revalidate: 300 } }),
    ]);
    const providers = providersRes.ok ? await providersRes.json() : [];
    const pros = prosRes.ok ? await prosRes.json() : [];
    return {
      practices: Array.isArray(providers) ? providers.length : 0,
      practitioners: Array.isArray(pros) ? pros.length : 0,
    };
  } catch {
    return { practices: 0, practitioners: 0 };
  }
}

function SearchDiscoverForm() {
  return (
    <form
      action="/discover"
      method="get"
      className="flex w-full max-w-xl flex-col gap-2 rounded-2xl border border-hairline bg-surface p-2 shadow-md sm:flex-row sm:items-center"
      role="search"
    >
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search wellness places</span>
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-sage" />
        <input
          name="q"
          type="search"
          placeholder="Search by city, treatment or clinic…"
          className="min-h-12 w-full rounded-xl border-0 bg-transparent py-3 pl-11 pr-4 text-sm font-medium text-foreground placeholder:text-ink-muted/70 focus:outline-none"
          autoComplete="off"
        />
      </label>
      <button
        type="submit"
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-sage px-6 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-sage-dark active:scale-[0.98]"
      >
        Search
        <ArrowRightIcon className="h-4 w-4" />
      </button>
    </form>
  );
}

export default async function Home() {
  const stats = await getMarketplaceStats();

  const trustStrip = [
    { label: "Practices listed", value: String(stats.practices) },
    { label: "Specialists listed", value: String(stats.practitioners) },
    { label: "Holistic disciplines", value: "5" },
    { label: "Seeker access", value: "100% Free" },
  ] as const;

  return (
    <LayoutWrapper>
      <main>
        {/* ── Hero Section ─────────────────────────────────── */}
        <section className="relative overflow-hidden pt-8 pb-14 sm:pt-14 sm:pb-20">
          <div className="relative mx-auto max-w-6xl px-[var(--space-page-x)]">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
              <div>
                {/* Badge */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3.5 py-1.5 text-xs font-semibold text-ink-secondary shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-leaf animate-pulse" aria-hidden />
                  <span>Verified Ayurveda · Yoga · Spas · Retreats</span>
                </div>

                {/* Main Heading */}
                <h1 className="max-w-2xl font-display text-3xl font-bold leading-[1.08] tracking-tight text-forest sm:text-5xl lg:text-[3.25rem]">
                  Discover the wellness{" "}
                  <span className="text-terracotta">your body</span>{" "}
                  has been asking for.
                </h1>

                {/* Subtitle */}
                <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-ink-secondary sm:text-lg">
                  Clinics, studios, spas, and retreats curated around your unique constitution.
                  Take a quick quiz to find practices that feel like they were made just for you.
                </p>

                <p className="mt-2 text-xs font-medium text-ink-muted">
                  Ayurveda calls your energetic pattern your{" "}
                  <span className="font-bold text-forest">Prakriti</span> (Vata · Pitta · Kapha).
                  Browse freely anytime — no quiz required.
                </p>

                {/* Search Box */}
                <div className="mt-6">
                  <SearchDiscoverForm />
                </div>

                {/* Quick Searches */}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-ink-muted">Popular:</span>
                  {POPULAR_SEARCHES.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="rounded-full border border-hairline bg-surface px-3 py-1 font-medium text-ink-secondary transition-colors hover:border-sage hover:text-forest"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Provider links */}
                <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-ink-muted">
                  <Link
                    href="/account-type?role=CONSUMER"
                    className="inline-flex items-center gap-1 text-sage hover:underline"
                  >
                    <span>Take the Prakriti Quiz</span>
                    <ArrowRightIcon className="h-3 w-3" />
                  </Link>
                  <span>·</span>
                  <Link
                    href="/list-your-business"
                    className="text-terracotta hover:underline"
                  >
                    Are you a practitioner? List your practice →
                  </Link>
                </div>
              </div>

              {/* Hero Visual Card: honest directory, no demo clinic */}
              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                <div className="overflow-hidden rounded-3xl border border-hairline bg-surface p-6 shadow-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-sage/10 px-2.5 py-0.5 text-[11px] font-bold text-sage">
                        <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                        Live directory
                      </div>
                      <h3 className="mt-2 font-display text-xl font-bold text-forest">
                        Real practices, as they join
                      </h3>
                      <p className="text-xs text-ink-muted">
                        Profiles here are live listings — not placeholder sanctuaries.
                      </p>
                    </div>
                  </div>

                  <div className="relative mt-4 h-36 w-full overflow-hidden rounded-2xl bg-sand/60">
                    <AyurvedaArt className="h-full w-full object-cover" />
                    <div className="absolute bottom-3 left-3 rounded-full bg-surface/90 px-3 py-1 text-[11px] font-bold text-forest backdrop-blur-md shadow-xs">
                      Browse what is actually listed
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <span className="rounded-md border border-hairline bg-sand/40 px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
                      Ayurveda
                    </span>
                    <span className="rounded-md border border-hairline bg-sand/40 px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
                      Yoga
                    </span>
                    <span className="rounded-md border border-hairline bg-sand/40 px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
                      Wellness
                    </span>
                  </div>

                  <div className="mt-5 rounded-2xl border border-hairline bg-sand/30 p-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-ink-muted">
                        Directory
                      </p>
                      <p className="text-xs font-bold text-forest">
                        See live practices on AyurPass
                      </p>
                    </div>
                    <Link
                      href="/discover"
                      className="rounded-xl bg-sage px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-sage-dark transition-all"
                    >
                      Browse
                    </Link>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-ink-muted pt-2 border-t border-hairline">
                    <span className="flex items-center gap-1 text-sage">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                      No demo clinics
                    </span>
                    <Link href="/list-your-business" className="hover:text-forest">
                      List your practice
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Metric Strip */}
            <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {trustStrip.map((t) => (
                <div
                  key={t.label}
                  className="rounded-2xl border border-hairline bg-surface/90 px-4 py-3.5 text-center shadow-xs"
                >
                  <p className="font-display text-xl font-bold text-forest sm:text-2xl">
                    {t.value}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-ink-muted">
                    {t.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pathways: Quick Access ─────────────────────────── */}
        <section className="border-y border-hairline bg-surface/60 py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-[var(--space-page-x)]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-sage">
                  Quick access
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-forest sm:text-3xl">
                  Where would you like to start?
                </h2>
              </div>
              <Link
                href="/discover"
                className="text-xs font-bold text-sage hover:underline"
              >
                Browse all practices →
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PATHWAYS.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="group flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-sage/40 hover:shadow-md"
                >
                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage/10 text-sage transition-colors group-hover:bg-sage group-hover:text-white">
                      <p.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-bold text-forest">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-secondary">
                      {p.body}
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-sage group-hover:text-sage-dark">
                    {p.cta}
                    <ArrowRightIcon className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pillars: The 5 Disciplines ────────────────────── */}
        <section id="pillars" className="py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-[var(--space-page-x)]">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-sage">
                Disciplines
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-forest sm:text-3xl">
                Five healing paths, one platform
              </h2>
              <p className="mt-2 text-sm text-ink-secondary">
                Explore trusted holistic traditions and modern restorative care — each searchable by treatment, goal, and energetic fit.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {PILLARS.map((p) => (
                <Link
                  key={p.name}
                  href={p.href}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-sage/40 hover:shadow-md"
                >
                  <div className="relative h-28 overflow-hidden bg-sand/50">
                    <p.Art className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sage/10 text-sage">
                        <p.icon className="h-3.5 w-3.5" />
                      </span>
                      <h3 className="font-display text-sm font-bold text-forest">
                        {p.name}
                      </h3>
                    </div>
                    <p className="mt-2 flex-1 text-xs leading-relaxed text-ink-secondary">
                      {p.body}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-sage opacity-85 group-hover:opacity-100">
                      Explore {p.name} →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────── */}
        <section className="border-t border-hairline bg-surface/50 py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-[var(--space-page-x)]">
            <div className="text-center max-w-xl mx-auto">
              <p className="text-xs font-bold uppercase tracking-wider text-sage">
                Simple journey
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-forest sm:text-3xl">
                How AyurPass works
              </h2>
              <p className="mt-2 text-sm text-ink-secondary">
                Designed to make authentic, holistic care easy to understand, search, and book.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {STEPS.map((s, i) => (
                <div
                  key={s.title}
                  className="rounded-2xl border border-hairline bg-surface p-6 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/10 text-sage">
                      <s.icon className="h-5 w-5" />
                    </span>
                    <span className="font-display text-sm font-bold text-ink-muted">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-forest">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Dosha Quiz Promo Card */}
            <div className="mt-10 overflow-hidden rounded-3xl border border-hairline bg-surface p-6 sm:p-8 shadow-md">
              <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/10 px-3 py-1 text-xs font-bold text-sage">
                    <SparkleIcon className="h-3.5 w-3.5" />
                    Interactive Prakriti Assessment
                  </span>
                  <h3 className="mt-3 font-display text-2xl font-bold text-forest">
                    What is your Ayurvedic mind-body type?
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-secondary">
                    In Ayurveda, your unique constitution is composed of three biological energies:{" "}
                    <span className="font-semibold text-[#0073e5]">Vata</span> (air &amp; ether),{" "}
                    <span className="font-semibold text-[#f4971e]">Pitta</span> (fire &amp; water), and{" "}
                    <span className="font-semibold text-[#25d366]">Kapha</span> (earth &amp; water).
                    Learn which treatments and foods bring you into natural harmony.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      href="/account-type?role=CONSUMER"
                      className="inline-flex items-center gap-2 rounded-xl bg-sage px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-sage-dark transition-all"
                    >
                      Start free quiz
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </Link>
                    <span className="text-xs text-ink-muted">Takes 2 minutes · No obligation</span>
                  </div>
                </div>

                {/* 3 Dosha Swatches */}
                <div className="grid grid-cols-3 gap-2.5 text-center sm:w-72">
                  <div className="rounded-2xl border border-hairline bg-sand/30 p-3.5">
                    <span className="mx-auto block h-3 w-3 rounded-full bg-[#0073e5]" />
                    <p className="mt-2 text-xs font-bold text-forest">Vata</p>
                    <p className="text-[10px] text-ink-muted">Air &amp; Space</p>
                  </div>
                  <div className="rounded-2xl border border-hairline bg-sand/30 p-3.5">
                    <span className="mx-auto block h-3 w-3 rounded-full bg-[#f4971e]" />
                    <p className="mt-2 text-xs font-bold text-forest">Pitta</p>
                    <p className="text-[10px] text-ink-muted">Fire &amp; Water</p>
                  </div>
                  <div className="rounded-2xl border border-hairline bg-sand/30 p-3.5">
                    <span className="mx-auto block h-3 w-3 rounded-full bg-[#25d366]" />
                    <p className="mt-2 text-xs font-bold text-forest">Kapha</p>
                    <p className="text-[10px] text-ink-muted">Earth &amp; Water</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── For Providers & Pricing ───────────────────────── */}
        <section id="providers" className="py-14 sm:py-20 border-t border-hairline bg-background">
          <div className="mx-auto max-w-6xl px-[var(--space-page-x)]">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/10 px-3 py-1 text-xs font-bold text-sage">
                  <UsersIcon className="h-3.5 w-3.5" />
                  For Practitioners &amp; Clinics
                </span>
                <h2 className="mt-3 font-display text-3xl font-bold text-forest sm:text-4xl">
                  Grow your holistic wellness practice
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-secondary sm:text-base">
                  Get listed in the world’s dedicated directory for Ayurveda, Yoga, Spas, and Retreats.
                  Manage client bookings, take payments, and run your business without the tech headache.
                </p>
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                  {PROVIDER_PERKS.map((perk) => (
                    <span
                      key={perk}
                      className="inline-flex items-center gap-2 text-xs font-medium text-ink-secondary"
                    >
                      <CheckIcon className="h-3.5 w-3.5 text-sage stroke-[3]" />
                      {perk}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                href="/list-your-business"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sage px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-sage-dark transition-all"
              >
                List your practice free
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            {/* Pricing Tiers Grid */}
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {TIERS.map((t) => (
                <div
                  key={t.name}
                  className={`flex flex-col justify-between rounded-3xl p-7 border transition-all ${
                    t.highlight
                      ? "border-sage bg-surface shadow-lg ring-2 ring-sage/15"
                      : "border-hairline bg-surface/80"
                  }`}
                >
                  <div>
                    {t.badge && (
                      <span className="mb-3 inline-block rounded-full bg-sage/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sage">
                        {t.badge}
                      </span>
                    )}
                    <h3 className="font-display text-xl font-bold text-forest">
                      {t.name}
                    </h3>
                    <p className="mt-1 text-xs text-ink-muted">
                      {t.blurb}
                    </p>

                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-3xl font-bold tracking-tight text-forest">
                        {t.price}
                      </span>
                      <span className="text-xs font-medium text-ink-muted">
                        {t.cadence}
                      </span>
                    </div>

                    <ul className="mt-6 space-y-2.5 border-t border-hairline pt-6 text-xs text-ink-secondary">
                      {t.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage stroke-[2.5]" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={t.href}
                    className={`mt-8 inline-flex w-full items-center justify-center rounded-xl py-3 text-xs font-bold transition-all ${
                      t.highlight
                        ? "bg-sage text-white shadow-xs hover:bg-sage-dark"
                        : "border border-hairline bg-sand/30 text-forest hover:bg-sand/60"
                    }`}
                  >
                    {t.cta}
                  </Link>
                </div>
              ))}
            </div>

            <p className="mt-8 text-center text-xs text-ink-muted">
              Free listing forever · Cancel paid plans anytime with no lock-in contract ·{" "}
              <Link href="/partners" className="text-sage hover:underline">
                Partner benefits
              </Link>
            </p>
          </div>
        </section>

        {/* ── Ready When You Are CTA ───────────────────────── */}
        <section className="border-t border-hairline bg-surface py-14 text-center sm:py-16">
          <div className="mx-auto max-w-4xl px-[var(--space-page-x)]">
            <h2 className="font-display text-2xl font-bold text-forest sm:text-3xl">
              Ready to explore your personal wellness path?
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-ink-secondary">
              Browse vetted practices, find appointments near you, or discover your Prakriti in minutes.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/discover"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-sage px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-sage-dark transition-all"
              >
                <CompassIcon className="h-4 w-4" />
                Discover places
              </Link>
              <Link
                href="/register?role=CONSUMER"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-hairline bg-surface px-6 py-2.5 text-xs font-bold text-forest hover:border-sage transition-all"
              >
                Create free account
              </Link>
            </div>
          </div>
        </section>
      </main>
    </LayoutWrapper>
  );
}
