import Link from "next/link";
import { LayoutWrapper } from "@/components/LayoutWrapper";
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

const PATHWAYS = [
  {
    href: "/discover",
    icon: CompassIcon,
    title: "Discover places",
    body: "Clinics, studios, spas and retreats near you — free profiles included.",
    cta: "Browse directory",
  },
  {
    href: "/explore",
    icon: CalendarIcon,
    title: "Book a session",
    body: "Ayurvedic treatments, yoga, spa and consultations you can book online.",
    cta: "Find sessions",
  },
  {
    href: "/retreats",
    icon: MoonIcon,
    title: "Retreats",
    body: "Immersive programs and trainings worldwide, handpicked for seekers.",
    cta: "Explore retreats",
  },
  {
    href: "/offers",
    icon: GiftIcon,
    title: "Offers",
    body: "Seasonal deals and featured promotions from trusted practices.",
    cta: "See offers",
  },
] as const;

const PILLARS = [
  {
    href: "/discover?group=Ayurveda",
    icon: LeafIcon,
    Art: AyurvedaArt,
    name: "Ayurveda",
    body: "Vaidyas, Panchakarma and herbal therapies rooted in classical practice.",
  },
  {
    href: "/discover?group=Yoga",
    icon: LotusIcon,
    Art: YogaArt,
    name: "Yoga",
    body: "Studios, private sessions and retreats matched to your constitution.",
  },
  {
    href: "/discover?group=Spa",
    icon: FlameIcon,
    Art: SpaArt,
    name: "Luxury spa",
    body: "Signature treatments from vetted spas, tagged for dosha fit.",
  },
  {
    href: "/discover?group=Meditation",
    icon: MoonIcon,
    Art: MeditationArt,
    name: "Meditation",
    body: "Guided sessions, breathwork and residential programs — in person or virtual.",
  },
  {
    href: "/discover?group=Health%20Club",
    icon: DumbbellIcon,
    Art: HealthClubArt,
    name: "Health club",
    body: "Training, recovery and group classes tuned to your energy.",
  },
] as const;

const STEPS = [
  {
    icon: CompassIcon,
    title: "Discover your constitution",
    body: "A guided Prakriti assessment maps Vata, Pitta and Kapha — the lens for every match.",
  },
  {
    icon: SparkleIcon,
    title: "Find the right places",
    body: "Browse verified practices, retreats and sessions filtered by city, discipline and goals.",
  },
  {
    icon: ShieldIcon,
    title: "Book with confidence",
    body: "Health data stays private. Credentials and authority marks help you choose wisely.",
  },
] as const;

const TRUST = [
  { label: "Disciplines", value: "5+" },
  { label: "Free listings", value: "Open" },
  { label: "Privacy-first", value: "Consent" },
  { label: "Credentials", value: "Verified" },
] as const;

const PROVIDER_PERKS = [
  "Free public directory page",
  "Enquiries in one inbox",
  "Upgrade to bookings when ready",
] as const;

const TIERS: {
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: string[];
  cta: string;
  href: string;
  highlight?: boolean;
  badge?: string;
}[] = [
  {
    name: "Free listing",
    price: "$0",
    cadence: "",
    blurb: "Get discovered — no card required.",
    features: [
      "Public practice profile",
      "Discover & search visibility",
      "Enquiry inbox",
      "Logo, cover & gallery",
    ],
    cta: "List for free",
    href: "/list-your-business",
  },
  {
    name: "Growth",
    price: "$349",
    cadence: "/month",
    highlight: true,
    badge: "Most popular",
    blurb: "For clinics & multi-practitioner studios.",
    features: [
      "Everything in Free",
      "Bookable sessions & calendar",
      "Team & rooms",
      "Payments & analytics",
    ],
    cta: "Start free, upgrade later",
    href: "/list-your-business",
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    blurb: "Multi-location brands & franchises.",
    features: [
      "Multi-location brands",
      "White-label options",
      "Dedicated success",
      "Custom integrations",
    ],
    cta: "Talk to us",
    href: "/contact",
  },
];

function SearchDiscoverForm() {
  return (
    <form
      action="/discover"
      method="get"
      className="flex w-full max-w-xl flex-col gap-2 sm:flex-row sm:items-stretch"
      role="search"
    >
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search wellness places</span>
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          name="q"
          type="search"
          placeholder="City, practice, or treatment…"
          className="min-h-12 w-full rounded-full border border-hairline bg-surface py-3 pl-10 pr-4 text-sm font-medium text-foreground shadow-[0_2px_12px_rgba(36,56,46,0.06)] placeholder:font-normal placeholder:text-ink-muted/80 focus:border-leaf focus:outline-none focus:ring-2 focus:ring-leaf/20"
          autoComplete="off"
        />
      </label>
      <button
        type="submit"
        className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-forest px-6 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(36,56,46,0.2)] transition-colors hover:bg-forest-deep"
      >
        Search
        <ArrowRightIcon className="h-4 w-4" />
      </button>
    </form>
  );
}

export default function Home() {
  return (
    <LayoutWrapper>
      <main>
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(70rem_36rem_at_90%_-15%,rgba(185,137,47,0.16),transparent),radial-gradient(55rem_32rem_at_-12%_100%,rgba(61,102,80,0.14),transparent)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 top-20 hidden h-72 w-72 rounded-full border border-gold/15 lg:block"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-4 top-36 hidden h-48 w-48 rounded-full border border-leaf/10 lg:block"
          />

          <div className="relative mx-auto max-w-6xl px-[var(--space-page-x)] pb-16 pt-12 sm:pb-24 sm:pt-20">
            <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10">
              <div>
                <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/90 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-ink-secondary shadow-sm backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
                  Find &amp; book · Ayurveda · Yoga · Wellness
                </p>

                <h1 className="max-w-2xl font-display text-[2.35rem] font-semibold leading-[1.08] tracking-tight text-forest sm:text-5xl lg:text-[3.25rem]">
                  Wellness, tuned to your{" "}
                  <em className="not-italic text-gold">constitution</em>.
                </h1>

                <p className="mt-5 max-w-xl text-base font-medium leading-relaxed text-ink-secondary sm:text-lg">
                  Find &amp; book verified Ayurveda, Yoga &amp; Wellness — clinics, studios, spas
                  and retreats personalised by a guided Prakriti assessment.
                </p>

                <div className="mt-8">
                  <SearchDiscoverForm />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link
                    href="/register"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-deep"
                  >
                    Take the dosha assessment
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/list-your-business"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline bg-surface px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:border-leaf"
                  >
                    List your practice free
                  </Link>
                </div>

                <p className="mt-4 text-xs font-medium text-ink-muted">
                  No account needed to browse · Free for seekers · Free to list a practice
                </p>
              </div>

              {/* Hero visual card */}
              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                <div className="overflow-hidden rounded-[1.75rem] border border-hairline bg-surface shadow-[0_24px_60px_rgba(36,56,46,0.12)]">
                  <div className="relative h-44 overflow-hidden sm:h-52">
                    <AyurvedaArt className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full bg-surface/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-forest backdrop-blur-sm">
                      Featured path
                    </span>
                  </div>
                  <div className="space-y-4 px-5 pb-5 pt-1">
                    <div>
                      <p className="font-display text-xl font-semibold text-forest">
                        Start with Discover
                      </p>
                      <p className="mt-1 text-sm font-medium leading-relaxed text-ink-muted">
                        Browse practices by city and discipline — then book, enquire or save for later.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { href: "/discover", label: "Directory" },
                        { href: "/explore", label: "Sessions" },
                        { href: "/retreats", label: "Retreats" },
                        { href: "/shop", label: "Shop" },
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="profile-spring rounded-xl border border-hairline bg-clay/40 px-3 py-2.5 text-center text-xs font-bold text-forest transition-colors hover:border-leaf hover:bg-clay/70"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-forest/5 px-3 py-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-gold-soft">
                        <ShieldIcon className="h-4 w-4" />
                      </span>
                      <p className="text-xs font-medium leading-snug text-ink-secondary">
                        Verified credentials & authority marks on public profiles
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust strip */}
            <ul className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {TRUST.map((t) => (
                <li
                  key={t.label}
                  className="rounded-2xl border border-hairline bg-surface/80 px-4 py-3.5 text-center backdrop-blur-sm"
                >
                  <p className="font-display text-lg font-semibold text-forest sm:text-xl">
                    {t.value}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                    {t.label}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Pathways ─────────────────────────────────────── */}
        <section className="border-y border-hairline bg-surface/70" aria-labelledby="pathways-heading">
          <div className="mx-auto max-w-6xl px-[var(--space-page-x)] py-14 sm:py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
                  Where to begin
                </p>
                <h2 id="pathways-heading" className="mt-1 font-display text-3xl text-forest sm:text-[2rem]">
                  Four doors into AyurPass
                </h2>
              </div>
              <Link
                href="/packages"
                className="text-sm font-semibold text-forest hover:underline"
              >
                Browse packages →
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PATHWAYS.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="card-surface group flex flex-col p-5"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest text-gold-soft transition-transform group-hover:scale-105">
                    <p.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-forest">{p.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm font-medium leading-relaxed text-ink-secondary">
                    {p.body}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-forest">
                    {p.cta}
                    <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pillars ──────────────────────────────────────── */}
        <section id="pillars" className="scroll-mt-20" aria-labelledby="pillars-heading">
          <div className="mx-auto max-w-6xl px-[var(--space-page-x)] py-14 sm:py-20">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
                Disciplines
              </p>
              <h2 id="pillars-heading" className="mt-1 font-display text-3xl text-forest sm:text-[2rem]">
                Five paths, one journey
              </h2>
              <p className="mt-2 text-sm font-medium leading-relaxed text-ink-secondary sm:text-base">
                Every offering is listed for authenticity and discovery — many tagged for dosha
                compatibility.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {PILLARS.map((p) => (
                <Link
                  key={p.name}
                  href={p.href}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface shadow-[0_2px_12px_rgba(36,56,46,0.04)] transition-shadow hover:shadow-[0_12px_32px_rgba(36,56,46,0.1)]"
                >
                  <div className="relative h-28 overflow-hidden bg-clay">
                    <p.Art className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-gold-soft">
                        <p.icon className="h-4 w-4" />
                      </span>
                      <h3 className="font-display text-base font-semibold text-forest">{p.name}</h3>
                    </div>
                    <p className="mt-2 flex-1 text-xs font-medium leading-relaxed text-ink-secondary">
                      {p.body}
                    </p>
                    <span className="mt-3 text-xs font-bold text-forest opacity-80 group-hover:opacity-100">
                      Explore →
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/wellness"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline bg-surface px-5 py-2.5 text-sm font-semibold text-forest hover:border-leaf"
              >
                Wellness guide
              </Link>
              <Link
                href="/discover"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-deep"
              >
                Open Discover
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────── */}
        <section className="border-t border-hairline bg-clay/35" aria-labelledby="how-heading">
          <div className="mx-auto max-w-6xl px-[var(--space-page-x)] py-14 sm:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
                  Simple path
                </p>
                <h2 id="how-heading" className="mt-1 font-display text-3xl text-forest sm:text-[2rem]">
                  How AyurPass works
                </h2>
              </div>
            </div>

            <ol className="mt-10 grid gap-6 sm:grid-cols-3">
              {STEPS.map((s, i) => (
                <li
                  key={s.title}
                  className="relative rounded-2xl border border-hairline bg-surface p-6 shadow-[0_2px_10px_rgba(36,56,46,0.04)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold-soft bg-clay text-forest">
                      <s.icon className="h-5 w-5" />
                    </span>
                    <span className="font-display text-sm font-semibold tabular-nums text-gold">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-ink-secondary">
                    {s.body}
                  </p>
                </li>
              ))}
            </ol>

            {/* Dosha CTA band */}
            <div className="mt-10 overflow-hidden rounded-3xl border border-hairline bg-surface shadow-[0_8px_28px_rgba(36,56,46,0.06)] sm:flex">
              <div className="flex flex-1 flex-col justify-center p-6 sm:p-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
                  Prakriti
                </p>
                <h3 className="mt-1 font-display text-2xl text-forest">
                  Know your dosha before you book
                </h3>
                <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-ink-secondary">
                  A short assessment maps Vata, Pitta and Kapha so recommendations and listings feel
                  personal — not generic.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/register"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-deep"
                  >
                    Start assessment
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/dashboard/assessment"
                    className="inline-flex min-h-11 items-center rounded-full border border-hairline px-5 py-2.5 text-sm font-semibold text-forest hover:border-leaf"
                  >
                    Already signed in?
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-px border-t border-hairline bg-hairline sm:w-64 sm:border-l sm:border-t-0">
                {[
                  { name: "Vata", color: "bg-[var(--vata)]", tone: "Air · space" },
                  { name: "Pitta", color: "bg-[var(--pitta)]", tone: "Fire · water" },
                  { name: "Kapha", color: "bg-[var(--kapha)]", tone: "Earth · water" },
                ].map((d) => (
                  <div
                    key={d.name}
                    className="flex flex-col items-center justify-center bg-surface px-3 py-6 text-center sm:py-8"
                  >
                    <span className={`mb-2 h-3 w-3 rounded-full ${d.color}`} aria-hidden />
                    <p className="text-sm font-bold text-forest">{d.name}</p>
                    <p className="mt-0.5 text-[10px] font-medium text-ink-muted">{d.tone}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Provider CTA + pricing ───────────────────────── */}
        <section
          id="providers"
          className="relative scroll-mt-20 overflow-hidden border-t border-hairline bg-forest"
          aria-labelledby="providers-heading"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(45rem_26rem_at_92%_-8%,rgba(185,137,47,0.2),transparent),radial-gradient(40rem_24rem_at_-8%_108%,rgba(61,102,80,0.4),transparent)]"
          />
          <div className="relative mx-auto max-w-6xl px-[var(--space-page-x)] py-14 sm:py-20">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-soft">
                  For clinics, studios & spas
                </p>
                <h2
                  id="providers-heading"
                  className="mt-3 font-display text-3xl text-white sm:text-4xl"
                >
                  Get discovered. Grow when you&apos;re ready.
                </h2>
                <p className="mt-4 leading-relaxed text-white/75">
                  Start with a free public page in the AyurPass directory. Add bookable sessions,
                  team calendars and payments when your practice needs them.
                </p>
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                  {PROVIDER_PERKS.map((perk) => (
                    <span
                      key={perk}
                      className="inline-flex items-center gap-2 text-sm font-medium text-white/85"
                    >
                      <CheckIcon
                        filled
                        className="h-4.5 w-4.5 shrink-0 text-gold-soft"
                      />
                      {perk}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                href="/list-your-business"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-forest-deep shadow-lg transition-colors hover:bg-gold-soft"
              >
                <UsersIcon className="h-4 w-4" />
                List your practice free
              </Link>
            </div>

            <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-3">
              {TIERS.map((t) => (
                <div
                  key={t.name}
                  className={`relative flex flex-col rounded-2xl p-6 sm:p-7 ${
                    t.highlight
                      ? "bg-surface shadow-[0_18px_50px_rgba(0,0,0,0.28)] ring-1 ring-gold/40"
                      : "border border-white/15 bg-white/5"
                  }`}
                >
                  {t.badge ? (
                    <span className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-forest-deep">
                      <SparkleIcon className="h-3.5 w-3.5" />
                      {t.badge}
                    </span>
                  ) : null}
                  <h3
                    className={`font-display text-lg font-semibold ${t.highlight ? "text-forest" : "text-white"}`}
                  >
                    {t.name}
                  </h3>
                  <p className={`mt-1 text-sm ${t.highlight ? "text-ink-muted" : "text-white/55"}`}>
                    {t.blurb}
                  </p>
                  <p className="mt-4">
                    <span
                      className={`text-3xl font-semibold tabular-nums ${t.highlight ? "text-foreground" : "text-white"}`}
                    >
                      {t.price}
                    </span>
                    <span className={t.highlight ? "text-ink-muted" : "text-white/60"}>
                      {t.cadence}
                    </span>
                  </p>
                  <ul
                    className={`mt-5 flex-1 space-y-2.5 text-sm ${t.highlight ? "text-ink-secondary" : "text-white/75"}`}
                  >
                    {t.features.map((f) => (
                      <li key={f} className="flex gap-2.5">
                        <CheckIcon
                          filled
                          className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${t.highlight ? "text-gold" : "text-gold-soft"}`}
                        />
                        <span className="font-medium">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={t.href}
                    className={`mt-7 inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                      t.highlight
                        ? "bg-forest text-white hover:bg-forest-deep"
                        : "border border-white/25 text-white hover:bg-white/10"
                    }`}
                  >
                    {t.cta}
                  </Link>
                </div>
              ))}
            </div>
            <p className="mt-10 text-center text-xs font-medium text-white/55">
              Free listing forever · Paid plans only when you need bookings · Cancel anytime
            </p>
            <p className="mt-3 text-center text-xs text-white/45">
              <Link href="/partners" className="underline-offset-2 hover:text-white/70 hover:underline">
                Partner benefits
              </Link>
              {" · "}
              <Link
                href="/providers/guidelines"
                className="underline-offset-2 hover:text-white/70 hover:underline"
              >
                Provider guidelines
              </Link>
            </p>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────── */}
        <section className="border-t border-hairline bg-background">
          <div className="mx-auto max-w-6xl px-[var(--space-page-x)] py-14 text-center sm:py-16">
            <h2 className="font-display text-2xl text-forest sm:text-3xl">
              Ready when you are
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm font-medium text-ink-secondary">
              Browse the directory, take the dosha assessment, or list your practice in minutes.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/discover"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-white hover:bg-forest-deep"
              >
                <CompassIcon className="h-4 w-4" />
                Discover places
              </Link>
              <Link
                href="/register"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline bg-surface px-6 py-2.5 text-sm font-semibold text-forest hover:border-leaf"
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
