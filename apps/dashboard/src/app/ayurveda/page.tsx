import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Ayurveda — Science of Life, Panchakarma & Rejuvenation | AyurPass",
  description:
    "Explore the ancient science of Ayurveda, Panchakarma rejuvenation therapies, Tridosha philosophy (Vata, Pitta, Kapha), and find accredited Ayurveda clinics near you.",
};

const THERAPIES = [
  {
    title: "Shirodhara",
    subtitle: "Mind Calm & Neurological Restorative",
    desc: "A continuous, gentle stream of warm medicated herbal oil or buttermilk poured rhythmically onto the third eye (forehead). Relieves anxiety, insomnia, hypertension, and mental fatigue.",
    image: "https://picsum.photos/seed/ayur1/1200/800",
    benefits: ["Relieves stress & insomnia", "Enhances mental clarity", "Nourishes the nervous system"],
  },
  {
    title: "Abhyangam",
    subtitle: "Full Body Medicated Oil Massage",
    desc: "Synchronised full-body massage using warm, custom-blended Dosha-specific herbs and oils. Stimulates lymphatic circulation, tones muscles, and flushes deep-seated toxins.",
    image: "https://picsum.photos/seed/ayur2/1200/800",
    benefits: ["Flushes tissue toxins", "Improves skin elasticity", "Improves joint lubrication"],
  },
  {
    title: "Njavarakizhi",
    subtitle: "Njavara Rice Poultice Therapy",
    desc: "Rejuvenating massage using boluses of special Njavara rice cooked in milk and herbal decoctions. Deeply nourishes tissues, ideal for neuromuscular conditions.",
    image: "https://picsum.photos/seed/ayur3/1200/800",
    benefits: ["Restores muscular strength", "Improves skin luster", "Relieves stiffness"],
  },
  {
    title: "Pizhichil",
    subtitle: "Royal Medicated Oil Bath",
    desc: "Warm medicated oils are rhythmically squeezed over the body while being gently massaged by twin therapists. Known as the king of Ayurvedic rejuvenation.",
    image: "https://picsum.photos/seed/ayur4/1200/800",
    benefits: ["Combats premature aging", "Relieves arthritic pain", "Strengthens immunity"],
  },
  {
    title: "Nasyam",
    subtitle: "Nasal Herbal Cleansing",
    desc: "Administration of purified herbal oils or powders through the nasal passages to clear head congestion, improve sinus health, and sharpen sensory perception.",
    image: "https://picsum.photos/seed/ayur5/1200/800",
    benefits: ["Clears sinus passages", "Relieves chronic headaches", "Improves voice & sensory clarity"],
  },
  {
    title: "Kashayadhara",
    subtitle: "Herbal Decoction Bath",
    desc: "Pouring of warm, potent herbal extracts across the body in a steady flow to soothe severe skin conditions, inflammation, and chronic fatigue.",
    image: "https://picsum.photos/seed/ayur6/1200/800",
    benefits: ["Soothes eczema & psoriasis", "Purifies blood tissue", "Cools inflammatory Pitta"],
  },
];

const DOSHAS = [
  {
    name: "Vata",
    elements: "Air & Ether",
    traits: "Governance of movement, respiration, nerve impulses, and creativity.",
    imbalance: "Dryness, anxiety, insomnia, joint stiffness, bloating.",
    color: "bg-vata/10 border-vata/30 text-vata",
  },
  {
    name: "Pitta",
    elements: "Fire & Water",
    traits: "Governance of digestion, metabolism, body temperature, and intellect.",
    imbalance: "Acidity, skin inflammation, irritability, heat sensitivity.",
    color: "bg-pitta/10 border-pitta/30 text-pitta",
  },
  {
    name: "Kapha",
    elements: "Earth & Water",
    traits: "Governance of physical structure, stamina, lubrication, and emotional calm.",
    imbalance: "Weight gain, sluggishness, congestion, fluid retention.",
    color: "bg-kapha/10 border-kapha/30 text-kapha",
  },
];

export default function AyurvedaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[480px] overflow-hidden bg-surface">
          <img
            src="/images/heroes/ayurveda.png"
            alt="Ayurveda Treatment"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/30 to-transparent" />

          <div className="relative mx-auto flex max-w-6xl flex-col justify-center px-[var(--space-page-x)] py-20 sm:py-28">
            <span 
              className="inline-flex w-fit items-center gap-2 rounded-full border border-forest/20 bg-white/80 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-forest"
              style={{ boxShadow: "0 0 10px rgba(255,255,255,0.8)" }}
            >
              🌿 Science of Life
            </span>
            <h1 
              className="mt-4 font-display text-4xl font-bold tracking-tight text-forest sm:text-6xl sm:leading-tight"
              style={{ textShadow: "0 0 20px rgba(255,255,255,1), 0 0 10px rgba(255,255,255,0.8)" }}
            >
              Ayurveda — Harmony of Body, Mind & Soul
            </h1>
            <p 
              className="mt-5 max-w-2xl text-base font-semibold leading-relaxed text-ink-secondary sm:text-lg"
              style={{ textShadow: "0 0 15px rgba(255,255,255,1), 0 0 5px rgba(255,255,255,0.8)" }}
            >
              Originated over 5,000 years ago in ancient India, Ayurveda is the world’s oldest
              holistic healing system. Experience authentic Panchakarma rejuvenation and
              constitutional care.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/discover?group=Ayurveda"
                className="inline-flex min-h-12 items-center rounded-full bg-gold px-7 py-3 text-sm font-semibold text-forest-deep transition-colors hover:bg-goldSoft"
              >
                Find Ayurveda Clinics
              </Link>
              <Link
                href="/dashboard/assessment"
                className="inline-flex min-h-12 items-center rounded-full border border-white/30 bg-white/10 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                Take Prakriti Dosha Quiz
              </Link>
            </div>
          </div>
        </section>

        {/* Philosophy & Tridoshas */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-[var(--space-page-x)]">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-leaf">
                THE FOUNDATIONAL SCIENCE
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold text-forest sm:text-4xl">
                Understanding Tridosha Philosophy
              </h2>
              <p className="mt-3 text-sm font-medium leading-relaxed text-ink-secondary sm:text-base">
                Ayurveda teaches that health is a state of dynamic equilibrium between the three
                biological energies (Doshas) that govern every physiological process in your body.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {DOSHAS.map((d) => (
                <div key={d.name} className={`rounded-3xl border p-8 ${d.color}`}>
                  <h3 className="font-display text-2xl font-bold">{d.name}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider opacity-80">
                    {d.elements}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-ink-secondary">{d.traits}</p>
                  <div className="mt-4 border-t border-current/20 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                      Signs of Imbalance
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-muted">{d.imbalance}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Rejuvenation & Panchakarma Therapies */}
        <section className="border-t border-hairline bg-surface py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-[var(--space-page-x)]">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-gold">
                  RASAYANA CHIKITSA
                </span>
                <h2 className="mt-2 font-display text-3xl font-bold text-forest sm:text-4xl">
                  Classical Panchakarma & Rejuvenation
                </h2>
              </div>
              <Link
                href="/discover?group=Ayurveda"
                className="text-sm font-semibold text-forest underline hover:text-leaf"
              >
                View all accredited Ayurveda centers →
              </Link>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {THERAPIES.map((t) => (
                <div
                  key={t.title}
                  className="group overflow-hidden rounded-3xl border border-hairline bg-background transition-all hover:border-leaf hover:shadow-md"
                >
                  <div className="relative h-48 w-full overflow-hidden">
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

                    <div className="mt-4 border-t border-hairline pt-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                        Key Benefits
                      </p>
                      <ul className="mt-2 space-y-1">
                        {t.benefits.map((b) => (
                          <li key={b} className="flex items-center gap-2 text-xs text-forest">
                            <span className="text-leaf">✓</span> {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Diagnosis & Consultation */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-[var(--space-page-x)]">
            <div className="grid items-center gap-12 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <span className="text-xs font-bold uppercase tracking-widest text-leaf">
                  PRACTITIONER DIAGNOSIS
                </span>
                <h2 className="mt-2 font-display text-3xl font-bold text-forest sm:text-4xl">
                  Nadi Pariksha & Pulse Assessment
                </h2>
                <p className="mt-4 text-base leading-relaxed text-ink-secondary">
                  An authentic Ayurvedic consultation begins with Nadi Pariksha (radial pulse
                  diagnosis). An experienced Vaidya reads the subtle vibratory frequencies of your
                  radial pulse to detect deep-seated imbalances before symptoms manifest physically.
                </p>
                <div className="mt-6 space-y-3">
                  <div className="flex gap-3">
                    <span className="text-lg">🩺</span>
                    <div>
                      <h4 className="font-semibold text-forest">Eightfold Examination (Ashtavidha Pariksha)</h4>
                      <p className="text-xs text-ink-muted">
                        Evaluating Pulse, Tongue, Voice, Skin, Eyes, Appearance, Urine, and Stool.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-lg">🌱</span>
                    <div>
                      <h4 className="font-semibold text-forest">Personalised Herbal Formulations</h4>
                      <p className="text-xs text-ink-muted">
                        Tailored herbal infusions (Kashayams), arishtams, churnams, and medicated ghees.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <Link
                    href="/discover?group=Ayurveda"
                    className="inline-flex min-h-11 items-center rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-deep"
                  >
                    Book a Vaidya Consultation
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative overflow-hidden rounded-3xl border border-hairline shadow-lg">
                  <img
                    src="https://picsum.photos/seed/ayur8/1200/800"
                    alt="Ayurvedic Pulse Diagnosis"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="border-t border-hairline bg-forest py-16 text-white sm:py-20">
          <div className="mx-auto max-w-4xl px-[var(--space-page-x)] text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Experience Authentic Ayurvedic Care
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-goldSoft">
              Discover NABH & AyurPass-verified clinics, Panchakarma resorts, and experienced
              practitioners near you.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/discover?group=Ayurveda"
                className="inline-flex min-h-12 items-center rounded-full bg-gold px-7 py-3 text-sm font-semibold text-forest-deep transition-colors hover:bg-goldSoft"
              >
                Browse Verified Clinics
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
