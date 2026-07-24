import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Yoga & Movement — Asana, Pranayama & Lineage Studios | AyurPass",
  description:
    "Explore traditional Yoga lineages, Asana alignment, Pranayama breath control, and find accredited Yoga studios, retreats, and teacher training near you.",
};

const STYLES = [
  {
    title: "Hatha Yoga",
    desc: "Classical slow-paced practice focusing on static postures, alignment, breath awareness, and balancing solar (Ha) and lunar (Tha) energies.",
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80",
    tags: ["Alignment", "Breathwork", "Mindful Pace"],
  },
  {
    title: "Vinyasa Flow",
    desc: "Dynamic, fluid sequences connecting continuous breath with movement. Builds cardiovascular endurance, flexibility, and internal heat.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    tags: ["Dynamic", "Stamina", "Fluid Flow"],
  },
  {
    title: "Yin & Restorative",
    desc: "Gentle, long-held passive floor postures supported by props. Targets deep connective tissues, fascia, and calms the parasympathetic nervous system.",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
    tags: ["Fascia Release", "Deep Calm", "Nervous System"],
  },
  {
    title: "Ashtanga Yoga",
    desc: "A rigorous, structured classical sequence of postures paired with Ujjayi breathing, bandhas (energy locks), and drishti (gaze points).",
    image: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=1200&q=80",
    tags: ["Traditional Sequence", "Strength", "Discipline"],
  },
  {
    title: "Pranayama & Kriya",
    desc: "Specialized yogic breath control exercises (Nadi Shodhana, Kapalabhati, Bhastrika) designed to cleanse energy channels and elevate vital prana.",
    image: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=1200&q=80",
    tags: ["Vital Energy", "Lungs & Mind", "Channel Cleansing"],
  },
  {
    title: "Yoga Retreats & YTT",
    desc: "Immersive residential programs in serene natural settings. 200hr/500hr teacher training and restorative weekend wellness retreats.",
    image: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=1200&q=80",
    tags: ["Immersion", "RYS Certification", "Nature Retreat"],
  },
];

export default function YogaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[480px] overflow-hidden bg-forestDeep text-white">
          <img
            src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=2000&q=80"
            alt="Yoga Practice"
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-forestDeep via-forestDeep/80 to-transparent" />

          <div className="relative mx-auto flex max-w-6xl flex-col justify-center px-[var(--space-page-x)] py-20 sm:py-28">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-leaf/40 bg-leaf/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-goldSoft">
              🧘 Union of Body & Breath
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-6xl sm:leading-tight">
              Yoga — Movement, Alignment & Inner Stillness
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-goldSoft/90 sm:text-lg">
              More than physical exercise, Yoga is a sacred science of self-realisation. Discover
              accredited studios, master teachers, and immersive retreats tailored to your flow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/discover?group=Yoga"
                className="inline-flex min-h-12 items-center rounded-full bg-gold px-7 py-3 text-sm font-semibold text-forestDeep transition-colors hover:bg-goldSoft"
              >
                Find Yoga Studios
              </Link>
              <Link
                href="/retreats"
                className="inline-flex min-h-12 items-center rounded-full border border-white/30 bg-white/10 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                Explore Yoga Retreats
              </Link>
            </div>
          </div>
        </section>

        {/* Styles & Disciplines */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-[var(--space-page-x)]">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-leaf">
                DISCIPLINE & LINEAGE
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold text-forest sm:text-4xl">
                Explore Yoga Lineages
              </h2>
              <p className="mt-3 text-sm font-medium leading-relaxed text-ink-secondary sm:text-base">
                Whether you seek dynamic strength, restorative release, or meditative breathwork,
                find the style that aligns with your practice.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {STYLES.map((s) => (
                <div
                  key={s.title}
                  className="group overflow-hidden rounded-3xl border border-hairline bg-surface transition-all hover:border-leaf hover:shadow-md"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={s.image}
                      alt={s.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-forest">{s.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-secondary">{s.desc}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5 border-t border-hairline pt-3">
                      {s.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-clay px-2.5 py-0.5 text-[11px] font-semibold text-forest"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="border-t border-hairline bg-forest py-16 text-white sm:py-20">
          <div className="mx-auto max-w-4xl px-[var(--space-page-x)] text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Step Onto the Mat
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-goldSoft">
              Book single sessions, class passes, or join transformative yoga teacher training retreats with AyurPass.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/discover?group=Yoga"
                className="inline-flex min-h-12 items-center rounded-full bg-gold px-7 py-3 text-sm font-semibold text-forestDeep transition-colors hover:bg-goldSoft"
              >
                Browse Yoga Studios
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
