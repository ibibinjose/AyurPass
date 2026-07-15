import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  ArrowRightIcon,
  CheckIcon,
  CompassIcon,
  DumbbellIcon,
  FlameIcon,
  LeafIcon,
  LotusIcon,
  MoonIcon,
  ShieldIcon,
  SparkleIcon,
} from "@/components/icons";

const PILLARS = [
  {
    icon: LeafIcon,
    name: "Ayurveda",
    body: "Consultations with verified Vaidyas, Panchakarma programs and herbal therapies rooted in classical practice.",
  },
  {
    icon: LotusIcon,
    name: "Yoga",
    body: "Studio classes, private sessions and retreats — matched to your constitution and experience level.",
  },
  {
    icon: FlameIcon,
    name: "Luxury Spa",
    body: "Signature treatments and wellness packages from vetted premium spas, tagged for dosha compatibility.",
  },
  {
    icon: MoonIcon,
    name: "Meditation",
    body: "Guided sessions, breathwork and residential retreats — in person, virtual or hybrid.",
  },
  {
    icon: DumbbellIcon,
    name: "Health Club",
    body: "Luxury gyms and health clubs — personal training, sculpted group classes and contrast recovery, tuned to your constitution.",
  },
];

const STEPS = [
  {
    icon: CompassIcon,
    title: "Discover your constitution",
    body: "A guided Prakriti assessment maps your Vata, Pitta and Kapha balance — the lens through which everything is personalised.",
  },
  {
    icon: SparkleIcon,
    title: "Receive intelligent matches",
    body: "Practitioners, treatments and packages are recommended for your dosha profile, goals and location.",
  },
  {
    icon: ShieldIcon,
    title: "Book with confidence",
    body: "Every professional is verified. Your health data stays private, shared only with your explicit consent.",
  },
];

const PROVIDER_PERKS = [
  "Verified profile & global client reach",
  "Integrated payments & scheduling",
  "No-show protection built in",
];

const TIERS = [
  {
    name: "Starter",
    price: "$149",
    cadence: "/month",
    blurb: "For solo practitioners finding their footing.",
    features: ["Bookings & scheduling", "Verified profile & listings", "Client messaging", "Standard commission"],
    cta: "Start with Starter",
  },
  {
    name: "Growth",
    price: "$349",
    cadence: "/month",
    highlight: true,
    badge: "Most popular",
    blurb: "For growing clinics & multi-practitioner studios.",
    features: [
      "Everything in Starter",
      "Staff & multi-practitioner management",
      "Analytics & revenue insights",
      "Marketing automation",
    ],
    cta: "Choose Growth",
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    blurb: "For multi-location brands & franchises.",
    features: ["Multi-location brands", "White-label options", "Dedicated success manager", "Custom integrations"],
    cta: "Talk to sales",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_85%_-10%,rgba(185,137,47,0.14),transparent),radial-gradient(50rem_28rem_at_-10%_110%,rgba(61,102,80,0.12),transparent)]"
          />
          <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 sm:pb-28 sm:pt-24">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3.5 py-1.5 text-xs font-medium tracking-wide text-ink-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              Ayurveda · Yoga · Spa · Meditation · Health Club
            </p>
            <h1 className="max-w-3xl font-display text-4xl leading-[1.08] text-forest sm:text-6xl">
              Wellness, tuned to your <em className="text-gold not-italic">constitution</em>.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-secondary">
              AyurPass unites the world&apos;s finest Ayurvedic clinics, yoga studios, luxury spas
              and meditation centers — personalised to your dosha by a guided Prakriti assessment.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-medium text-white hover:bg-forest-deep"
              >
                Take the dosha assessment
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-6 py-3 text-sm font-medium text-forest hover:border-leaf"
              >
                Book a session
              </Link>
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section id="pillars" className="border-y border-hairline bg-surface/60">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
            <h2 className="font-display text-3xl text-forest">Five disciplines, one journey</h2>
            <p className="mt-2 max-w-xl text-ink-secondary">
              Every offering is verified for authenticity and tagged for dosha compatibility.
            </p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {PILLARS.map((p) => (
                <div key={p.name} className="rounded-2xl border border-hairline bg-surface p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-gold-soft">
                    <p.icon className="h-5.5 w-5.5" />
                  </span>
                  <h3 className="mt-4 font-display text-xl text-forest">{p.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <h2 className="font-display text-3xl text-forest">How AyurPass works</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-soft bg-clay text-forest">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-sm text-gold">0{i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Provider CTA + pricing */}
        <section
          id="providers"
          className="relative scroll-mt-20 overflow-hidden border-t border-hairline bg-forest"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(45rem_26rem_at_92%_-8%,rgba(185,137,47,0.18),transparent),radial-gradient(40rem_24rem_at_-8%_108%,rgba(61,102,80,0.35),transparent)]"
          />
          <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-20">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-soft">
                For clinics, studios & spas
              </p>
              <h2 className="mt-3 font-display text-3xl text-white sm:text-4xl">
                Grow a practice worthy of your craft
              </h2>
              <p className="mt-4 leading-relaxed text-white/70">
                Scheduling, staff management, analytics and marketing automation — plus a global
                audience of clients matched to what you do best.
              </p>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {PROVIDER_PERKS.map((perk) => (
                  <span
                    key={perk}
                    className="inline-flex items-center gap-2 text-sm text-white/80"
                  >
                    <CheckIcon className="h-4 w-4 shrink-0 text-gold-soft" />
                    {perk}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-3">
              {TIERS.map((t) => (
                <div
                  key={t.name}
                  className={`relative flex flex-col rounded-2xl p-7 ${
                    t.highlight
                      ? "bg-surface shadow-[0_18px_50px_rgba(0,0,0,0.28)] ring-1 ring-gold/40"
                      : "border border-white/15 bg-white/5"
                  }`}
                >
                  {t.badge ? (
                    <span className="absolute -top-3 left-7 inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-forest-deep">
                      <SparkleIcon className="h-3.5 w-3.5" />
                      {t.badge}
                    </span>
                  ) : null}
                  <h3
                    className={`font-display text-lg ${t.highlight ? "text-forest" : "text-white"}`}
                  >
                    {t.name}
                  </h3>
                  <p className={`mt-1 text-sm ${t.highlight ? "text-ink-muted" : "text-white/55"}`}>
                    {t.blurb}
                  </p>
                  <p className="mt-4">
                    <span
                      className={`text-3xl font-semibold ${t.highlight ? "text-foreground" : "text-white"}`}
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
                          className={`mt-0.5 h-4 w-4 shrink-0 ${t.highlight ? "text-gold" : "text-gold-soft"}`}
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register?as=provider"
                    className={`mt-7 inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium ${
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
            <p className="mt-10 text-center text-xs text-white/55">
              No setup fees · 14-day free trial · Cancel anytime · Commission only on completed
              bookings
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
