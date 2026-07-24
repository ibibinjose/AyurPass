import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Ayurvedic Wellness Health Club & Vitality | AyurPass",
  description:
    "Explore Ayurvedic health clubs, Kalari Payattu martial agility, Dosha-tuned strength training, Marma recovery, and health club memberships near you.",
};

const PROGRAMS = [
  {
    title: "Balardha Fitness (Constitutional Training)",
    desc: "Exercising to half your capacity tailored to your Vata, Pitta, or Kapha constitution to build stamina without causing adrenal exhaustion.",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Kalari Payattu Martial Culture",
    desc: "Ancient Indian martial art combining body posture (Vadivu), fluid movement, flexibility, and Marma point coordination for agility.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Spinal Integrity & Posture Realignment",
    desc: "Targeted resistance and core strengthening designed to decompress spinal vertebrae and correct modern sedentary postural imbalances.",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Marma Recovery & Hydro-Sauna",
    desc: "Post-workout contrast hydrotherapy, herbal steam baths, and Marma massage to accelerate muscle recovery and reduce lactic acid.",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function HealthClubPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[480px] overflow-hidden bg-forestDeep text-white">
          <img
            src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=2000&q=80"
            alt="Ayurvedic Wellness Health Club"
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-forestDeep via-forestDeep/80 to-transparent" />

          <div className="relative mx-auto flex max-w-6xl flex-col justify-center px-[var(--space-page-x)] py-20 sm:py-28">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-leaf/40 bg-leaf/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-goldSoft">
              🏋️ Ayurvedic Health Club
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-6xl sm:leading-tight">
              Constitutional Strength & Vitality
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-goldSoft/90 sm:text-lg">
              Fitness that honors your body's energy. Discover Kalari Payattu movement, Dosha-tuned
              conditioning, and Marma muscle recovery sanctuaries.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/discover?group=Health%20Club"
                className="inline-flex min-h-12 items-center rounded-full bg-gold px-7 py-3 text-sm font-semibold text-forestDeep transition-colors hover:bg-goldSoft"
              >
                Find Wellness Health Clubs
              </Link>
            </div>
          </div>
        </section>

        {/* Programs Grid */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-[var(--space-page-x)]">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-leaf">
                VITALITY & CONDITIONING
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold text-forest sm:text-4xl">
                Holistic Health Club Programs
              </h2>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {PROGRAMS.map((p) => (
                <div
                  key={p.title}
                  className="group overflow-hidden rounded-3xl border border-hairline bg-surface transition-all hover:border-leaf hover:shadow-md"
                >
                  <div className="relative h-56 w-full overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-forest">{p.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-secondary">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-hairline bg-forest py-16 text-white sm:py-20">
          <div className="mx-auto max-w-4xl px-[var(--space-page-x)] text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Elevate Your Physical Vitality
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-goldSoft">
              Join accredited health clubs, Kalari studios, and functional recovery centers with AyurPass.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/discover?group=Health%20Club"
                className="inline-flex min-h-12 items-center rounded-full bg-gold px-7 py-3 text-sm font-semibold text-forestDeep transition-colors hover:bg-goldSoft"
              >
                Browse Health Clubs
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
