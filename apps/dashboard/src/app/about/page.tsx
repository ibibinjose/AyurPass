import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BRAND_LOGO } from "@/lib/brand";

export const metadata: Metadata = {
  title: "About Us — Mission & Vision | AyurPass",
  description:
    "Learn about AyurPass — our mission to harmonise ancient holistic wisdom with modern wellbeing, connecting you with verified Ayurveda, Yoga, Spa & Wellness care.",
};

const PILLARS = [
  {
    title: "Ayurveda",
    icon: "🌿",
    desc: "Classical consultations, Panchakarma therapies, and constitutional herbal guidance tailored to your Prakriti.",
  },
  {
    title: "Yoga & Movement",
    icon: "🧘",
    desc: "Hatha, Vinyasa, Pranayama, and immersive retreats led by certified teachers and traditional lineages.",
  },
  {
    title: "Meditation & Mind",
    icon: "🍃",
    desc: "Mindfulness, sound healing, and breathwork to cultivate inner peace, mental clarity, and stress resilience.",
  },
  {
    title: "Spa & Bodywork",
    icon: "💆",
    desc: "Restorative massages, hydrotherapy, and holistic treatments designed to rejuvenate your physical body.",
  },
  {
    title: "Nutrition & Lifestyle",
    icon: "🥑",
    desc: "Personalised dietary plans, seasonal routines (Dinacharya), and longevity practices for holistic vitality.",
  },
];

const VALUES = [
  {
    title: "Authenticity & Heritage",
    desc: "We honour classical Eastern wellness traditions while maintaining the highest modern quality standards.",
  },
  {
    title: "Personalised Care",
    desc: "No two individuals are identical. We champion care tailored to your unique mind-body constitution.",
  },
  {
    title: "Trust & Transparency",
    desc: "Verified practitioner badges, clear upfront pricing, and honest community reviews you can depend on.",
  },
  {
    title: "Empowering Providers",
    desc: "We equip independent practitioners and clinics with intuitive tools to manage bookings and expand their reach.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-hairline bg-[linear-gradient(180deg,rgba(30,50,40,0.06),transparent)] py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-[var(--space-page-x)]">
            <div className="grid items-center gap-12 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-goldSoft/30 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-gold">
                  About AyurPass
                </span>
                <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-forest sm:text-5xl sm:leading-tight">
                  Harmonising ancient wisdom with modern wellbeing.
                </h1>
                <p className="mt-5 text-base font-medium leading-relaxed text-ink-secondary sm:text-lg">
                  AyurPass is the premier global ecosystem connecting individuals with verified
                  Ayurveda clinics, Yoga studios, Meditation sanctuaries, luxury Spas, and holistic
                  practitioners — tailored to your unique constitution.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/discover"
                    className="inline-flex min-h-11 items-center rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-deep"
                  >
                    Discover places
                  </Link>
                  <Link
                    href="/dashboard/assessment"
                    className="inline-flex min-h-11 items-center rounded-full border border-hairline bg-surface px-6 py-2.5 text-sm font-semibold text-forest transition-colors hover:border-leaf"
                  >
                    Take Dosha Assessment
                  </Link>
                </div>
              </div>

              {/* Logo / Brand Card */}
              <div className="flex justify-center lg:col-span-5 lg:justify-end">
                <div className="relative flex flex-col items-center rounded-3xl border border-hairline bg-surface p-8 shadow-[0_16px_48px_rgba(30,50,40,0.08)] sm:p-10">
                  <div className="relative h-32 w-32 overflow-hidden rounded-2xl border border-hairline bg-surface p-2 shadow-sm sm:h-40 sm:w-40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={BRAND_LOGO}
                      alt="AyurPass Brand Logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="mt-6 font-display text-2xl font-semibold text-forest">AyurPass</p>
                  <p className="mt-1 text-center text-xs font-medium uppercase tracking-widest text-ink-muted">
                    Constitutional Wellness Pass
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-[var(--space-page-x)]">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Mission Card */}
              <div className="rounded-3xl border border-hairline bg-surface p-8 shadow-xs sm:p-10">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-forest/10 text-2xl">
                  🎯
                </div>
                <h2 className="mt-5 font-display text-2xl font-bold text-forest sm:text-3xl">
                  Our Mission
                </h2>
                <p className="mt-4 text-base leading-relaxed text-ink-secondary">
                  To empower every individual to discover, understand, and experience authentic
                  holistic care tuned to their unique mind-body constitution.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                  We believe true wellness is not one-size-fits-all. By bridging classical Eastern
                  traditions with modern digital convenience, AyurPass makes authentic holistic
                  care accessible, personal, and seamless.
                </p>
              </div>

              {/* Vision Card */}
              <div className="rounded-3xl border border-hairline bg-surface p-8 shadow-xs sm:p-10">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-goldSoft/40 text-2xl">
                  🌟
                </div>
                <h2 className="mt-5 font-display text-2xl font-bold text-forest sm:text-3xl">
                  Our Vision
                </h2>
                <p className="mt-4 text-base leading-relaxed text-ink-secondary">
                  To build a global world where integrative healthcare is verified, transparent,
                  and accessible to everyone, everywhere.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                  We envision a future where individuals actively balance their health through
                  preventative wisdom, constitutional insight, and direct access to trusted
                  wellness practitioners worldwide.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Pillars */}
        <section className="border-t border-hairline bg-surface py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-[var(--space-page-x)]">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-leaf">
                THE AYURPASS ECOSYSTEM
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold text-forest sm:text-4xl">
                Five Pillars of Wellness
              </h2>
              <p className="mt-3 text-sm font-medium text-ink-muted sm:text-base">
                Discover accredited specialists and sanctuaries across every discipline of holistic health.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {PILLARS.map((p) => (
                <div
                  key={p.title}
                  className="rounded-2xl border border-hairline bg-background p-6 transition-all hover:border-leaf hover:shadow-sm"
                >
                  <span className="text-3xl">{p.icon}</span>
                  <h3 className="mt-4 font-display text-xl font-semibold text-forest">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-[var(--space-page-x)]">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-gold">
                GUIDING PRINCIPLES
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold text-forest sm:text-4xl">
                Our Core Values
              </h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((v) => (
                <div
                  key={v.title}
                  className="rounded-2xl border border-hairline bg-surface p-6 shadow-xs"
                >
                  <h3 className="font-display text-lg font-semibold text-forest">{v.title}</h3>
                  <p className="mt-2.5 text-xs font-medium leading-relaxed text-ink-secondary">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="border-t border-hairline bg-forest py-16 text-white sm:py-20">
          <div className="mx-auto max-w-4xl px-[var(--space-page-x)] text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Ready to explore your personal wellness journey?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-goldSoft">
              Join thousands of seekers and verified practitioners on AyurPass today.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex min-h-12 items-center rounded-full bg-gold px-7 py-3 text-sm font-semibold text-forestDeep transition-colors hover:bg-goldSoft"
              >
                Create your free account
              </Link>
              <Link
                href="/list-your-business"
                className="inline-flex min-h-12 items-center rounded-full border border-white/30 bg-white/10 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                List your business free
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
