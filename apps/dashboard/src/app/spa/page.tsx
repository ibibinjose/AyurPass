import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Ayurvedic Wellness Spa — Luxury Therapies & Rejuvenation | AyurPass",
  description:
    "Discover luxury Ayurvedic wellness spas, Abhyangam massages, herbal body scrubs, Mukha Lepanam facials, and book spa treatments near you.",
};

const SPA_TREATMENTS = [
  {
    title: "Abhyangam & Steam Bath",
    subtitle: "Warm Herbal Massage & Detox Steam",
    desc: "A synchronized full-body massage using warm organic oils followed by a traditional Swedana herbal steam bath to open pores and flush metabolic toxins.",
    image: "https://picsum.photos/seed/ayur21/1200/800",
  },
  {
    title: "Udwarthanam",
    subtitle: "Herbal Powder Body Scrub",
    desc: "A vigorous dry powder massage using herbal pastes that exfoliates dead skin cells, stimulates subcutaneous fat breakdown, and improves skin tone.",
    image: "https://picsum.photos/seed/ayur22/1200/800",
  },
  {
    title: "Mukha Lepanam & Saundarya",
    subtitle: "Ayurvedic Herbal Facial",
    desc: "Nutrient-rich facials using saffron, sandalwood, aloe vera, and fresh botanicals to restore natural radiance, elasticity, and youthfulness.",
    image: "https://picsum.photos/seed/ayur23/1200/800",
  },
  {
    title: "Padabhyanga",
    subtitle: "Reflexology Foot Therapy",
    desc: "Soothing foot and leg massage using brass Kansa bowls and medicated ghees to activate vital Marma points, relieve fatigue, and ground nervous tension.",
    image: "https://picsum.photos/seed/ayur24/1200/800",
  },
];

export default function SpaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[480px] overflow-hidden bg-surface">
          <img
            src="/images/heroes/spa.png"
            alt="Ayurvedic Wellness Spa"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/30 to-transparent" />

          <div className="relative mx-auto flex max-w-6xl flex-col justify-center px-[var(--space-page-x)] py-20 sm:py-28">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-forest/20 bg-white/80 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-forest" style={{  boxShadow: "0 0 10px rgba(255,255,255,0.8)"  }}>
              💆 Luxury Ayurvedic Spa
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-forest sm:text-6xl sm:leading-tight" style={{ textShadow: "0 0 20px rgba(255,255,255,1), 0 0 10px rgba(255,255,255,0.8)" }}>
              Ayurvedic Wellness Spa & Body Therapies
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-relaxed text-ink-secondary sm:text-lg" style={{ textShadow: "0 0 15px rgba(255,255,255,1), 0 0 5px rgba(255,255,255,0.8)" }}>
              Indulge in botanical bodywork, warm herbal oils, facial therapies, and restorative
              hydrotherapy designed to nourish skin and calm the spirit.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/discover?group=Spa"
                className="inline-flex min-h-12 items-center rounded-full bg-gold px-7 py-3 text-sm font-semibold text-forest-deep transition-colors hover:bg-goldSoft"
              >
                Find Wellness Spas
              </Link>
            </div>
          </div>
        </section>

        {/* Spa Treatments Grid */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-[var(--space-page-x)]">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-leaf">
                BOTANICAL REJUVENATION
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold text-forest sm:text-4xl">
                Signature Spa Treatments
              </h2>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {SPA_TREATMENTS.map((t) => (
                <div
                  key={t.title}
                  className="group overflow-hidden rounded-3xl border border-hairline bg-surface transition-all hover:border-leaf hover:shadow-md"
                >
                  <div className="relative h-56 w-full overflow-hidden">
                    <img
                      src={t.image}
                      alt={t.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-forest">{t.title}</h3>
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-gold">
                      {t.subtitle}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-ink-secondary">{t.desc}</p>
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
              Treat Yourself to Natural Luxury
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-goldSoft">
              Book accredited Ayurvedic spa packages, massage therapies, and botanical facials.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/discover?group=Spa"
                className="inline-flex min-h-12 items-center rounded-full bg-gold px-7 py-3 text-sm font-semibold text-forest-deep transition-colors hover:bg-goldSoft"
              >
                Browse Ayurvedic Spas
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
