import Link from "next/link";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import {
  LeafIcon,
  LotusIcon,
  MoonIcon,
  DumbbellIcon,
  FlameIcon,
  ArrowRightIcon,
} from "@/components/icons";
import {
  AyurvedaArt,
  YogaArt,
  MeditationArt,
  HealthClubArt,
  SpaArt,
} from "@/components/WellnessArt";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ayurveda, Yoga, Meditation, Health Club & Spa | AyurPass Wellness Guide",
  description:
    "Comprehensive guide to Ayurveda, Yoga, Meditation, Health Club, and Spa wellness practices. Learn about ancient wisdom and modern applications for holistic health and personalized wellness journeys.",
  keywords: [
    "Ayurveda",
    "Yoga",
    "Meditation",
    "Health Club",
    "Spa",
    "Wellness",
    "Holistic Health",
    "Personalized Wellness",
    "Traditional Medicine",
    "Mindfulness",
    "Fitness",
    "Luxury Spa",
    "Ayurvedic Treatments",
    "Yoga Practices",
    "Meditation Techniques",
    "Wellness Disciplines",
    "Dosha",
    "Prakriti",
    "Panchakarma",
    "Wellness Platform",
  ],
  openGraph: {
    title: "Ayurveda, Yoga, Meditation, Health Club & Spa | AyurPass Wellness Guide",
    description:
      "Comprehensive guide to Ayurveda, Yoga, Meditation, Health Club, and Spa wellness practices. Learn about ancient wisdom and modern applications for holistic health.",
    url: "https://www.ayurpass.com/wellness",
    siteName: "AyurPass",
    images: [
      {
        url: "/og-wellness.jpg",
        width: 1200,
        height: 630,
        alt: "AyurPass Wellness Disciplines: Ayurveda, Yoga, Meditation, Health Club, and Spa",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ayurveda, Yoga, Meditation, Health Club & Spa | AyurPass Wellness Guide",
    description:
      "Comprehensive guide to wellness practices for holistic health and personalized wellness journeys.",
  },
  alternates: {
    canonical: "https://www.ayurpass.com/wellness",
  },
};

type IconType = (props: { className?: string }) => React.ReactElement;
type ArtType = (props: { className?: string }) => React.ReactElement;

interface WellnessSection {
  id: string;
  title: string;
  subtitle: string;
  icon: IconType;
  art: ArtType;
  /** Static Tailwind classes — never interpolated, so the v4 scanner keeps them. */
  theme: { iconWrap: string; subtitle: string; bullet: string };
  description: string;
  benefits: string[];
  practices: string[];
  alt: string;
}

const wellnessSections: WellnessSection[] = [
  {
    id: "ayurveda",
    title: "Ayurveda",
    subtitle: "The Science of Life",
    icon: LeafIcon,
    art: AyurvedaArt,
    theme: { iconWrap: "bg-forest text-gold-soft", subtitle: "text-leaf-bright font-bold", bullet: "bg-leaf-bright" },
    description:
      "Ayurveda, meaning 'science of life,' is a traditional system of medicine that originated in India over 3,000 years ago. It emphasizes balance in the body's three doshas (Vata, Pitta, and Kapha) to promote optimal health and prevent illness.",
    benefits: [
      "Personalized wellness plans based on your unique constitution",
      "Natural remedies using herbs and plant-based medicines",
      "Holistic approach addressing physical, mental, and spiritual well-being",
      "Preventive care focusing on maintaining balance rather than treating symptoms",
      "Detoxification and rejuvenation therapies like Panchakarma",
    ],
    practices: [
      "Abhyanga (therapeutic oil massage)",
      "Shirodhara (warm oil poured on forehead)",
      "Panchakarma (detoxification program)",
      "Herbal consultations and treatments",
      "Dietary and lifestyle recommendations",
    ],
    alt: "Illustration of an Ayurvedic apothecary: mortar and pestle, fresh herbs, and a remedy bottle",
  },
  {
    id: "yoga",
    title: "Yoga",
    subtitle: "Union of Body, Mind, and Spirit",
    icon: LotusIcon,
    art: YogaArt,
    theme: { iconWrap: "bg-leaf text-white", subtitle: "text-leaf", bullet: "bg-leaf" },
    description:
      "Yoga is an ancient practice that combines physical postures, breathing exercises, and meditation to promote holistic well-being. It encompasses various styles and traditions, each offering unique benefits for different constitutions and goals.",
    benefits: [
      "Improved flexibility, strength, and balance",
      "Stress reduction and mental clarity",
      "Enhanced mindfulness and self-awareness",
      "Better sleep quality and energy levels",
      "Emotional regulation and resilience",
    ],
    practices: [
      "Hatha Yoga (physical postures and breathing)",
      "Vinyasa Flow (movement synchronized with breath)",
      "Restorative Yoga (gentle, therapeutic poses)",
      "Meditation and mindfulness practices",
      "Breathing techniques (Pranayama)",
    ],
    alt: "Illustration of a figure seated in a yoga pose reaching toward a rising sun",
  },
  {
    id: "meditation",
    title: "Meditation",
    subtitle: "Cultivating Inner Peace",
    icon: MoonIcon,
    art: MeditationArt,
    theme: { iconWrap: "bg-gold text-white", subtitle: "text-gold", bullet: "bg-gold" },
    description:
      "Meditation is a practice where an individual uses techniques like mindfulness, focusing the mind on a particular object, thought, or activity to achieve mental clarity and emotional stability. It's a cornerstone of many wellness traditions.",
    benefits: [
      "Reduced anxiety and depression",
      "Improved focus and concentration",
      "Enhanced emotional regulation",
      "Lower blood pressure and stress hormones",
      "Increased self-awareness and compassion",
    ],
    practices: [
      "Mindfulness meditation",
      "Transcendental meditation",
      "Body scan meditation",
      "Walking meditation",
      "Loving-kindness meditation",
    ],
    alt: "Illustration of a person meditating beneath a crescent moon, surrounded by glowing aura rings",
  },
  {
    id: "health-club",
    title: "Health Club",
    subtitle: "Modern Fitness with Ancient Wisdom",
    icon: DumbbellIcon,
    art: HealthClubArt,
    theme: { iconWrap: "bg-forest-deep text-gold-soft", subtitle: "text-leaf", bullet: "bg-leaf" },
    description:
      "Health clubs offer modern fitness facilities and programs designed to support physical wellness. At AyurPass, we integrate traditional wisdom with contemporary fitness science to create balanced exercise regimens tailored to your dosha constitution.",
    benefits: [
      "Personalized fitness programs based on your constitution",
      "Access to state-of-the-art equipment and facilities",
      "Expert guidance from certified trainers",
      "Community support and motivation",
      "Integration with other wellness modalities",
    ],
    practices: [
      "Strength training and conditioning",
      "Cardiovascular fitness programs",
      "Functional movement training",
      "Group fitness classes",
      "Personal training sessions",
    ],
    alt: "Illustration of a dumbbell and kettlebell with an energy pulse line, evoking strength and motion",
  },
  {
    id: "spa",
    title: "Luxury Spa",
    subtitle: "Sensory Healing and Relaxation",
    icon: FlameIcon,
    art: SpaArt,
    theme: { iconWrap: "bg-gold text-white", subtitle: "text-gold", bullet: "bg-gold" },
    description:
      "Luxury spas offer therapeutic treatments that combine relaxation with healing. Our spa offerings integrate traditional Ayurvedic and wellness practices with modern luxury amenities for ultimate rejuvenation.",
    benefits: [
      "Deep relaxation and stress relief",
      "Improved circulation and lymphatic drainage",
      "Enhanced skin health and vitality",
      "Pain relief and muscle tension release",
      "Detoxification and cellular renewal",
    ],
    practices: [
      "Aromatherapy and essential oil treatments",
      "Hot stone therapy",
      "Hydrotherapy and thermal experiences",
      "Facials and skin care treatments",
      "Therapeutic body wraps and scrubs",
    ],
    alt: "Illustration of a lotus flower on still water with stacked stones, a candle, and rising steam",
  },
];

function WellnessContent() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-forest to-leaf">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_85%_-10%,rgba(233,217,184,0.18),transparent),radial-gradient(50rem_28rem_at_-10%_110%,rgba(255,255,255,0.1),transparent)]"
        />
        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white/90">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-soft" />
              Ayurveda · Yoga · Meditation · Health Club · Spa
            </p>
            <h1 className="font-display text-4xl leading-[1.08] text-white sm:text-5xl">
              Wellness Disciplines
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80">
              Discover the ancient wisdom and modern practices that form the foundation of holistic
              wellness at AyurPass.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction + quick nav */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <p className="max-w-3xl text-lg leading-relaxed text-ink-secondary">
          At AyurPass, we believe in a holistic approach to wellness that integrates ancient wisdom
          with modern science. Our platform brings together five fundamental wellness disciplines,
          each contributing to a comprehensive understanding of health and well-being. These
          practices are personalized to your unique constitution (Prakriti) and health goals,
          creating a truly customized wellness journey.
        </p>

        <nav aria-label="Wellness disciplines" className="mt-10 flex flex-wrap gap-3">
          {wellnessSections.map((section) => {
            const Icon = section.icon;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="group inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-4 py-2 text-sm font-medium text-forest transition-colors hover:border-leaf hover:bg-clay"
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${section.theme.iconWrap}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {section.title}
              </a>
            );
          })}
        </nav>
      </section>

      {/* Wellness Sections */}
      {wellnessSections.map((section, index) => {
        const IconComponent = section.icon;
        const Art = section.art;
        const isEven = index % 2 === 0;

        return (
          <section
            key={section.id}
            id={section.id}
            className={`scroll-mt-24 border-y border-hairline py-16 sm:py-20 ${
              isEven ? "bg-surface" : "bg-background"
            }`}
          >
            <div className="mx-auto max-w-6xl px-5">
              <div
                className={`flex flex-col ${
                  isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                } gap-12 items-center`}
              >
                {/* Content Column */}
                <div className="flex-1">
                  <div className="inline-flex items-center gap-3 mb-6">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${section.theme.iconWrap}`}
                    >
                      <IconComponent className="h-6 w-6" />
                    </span>
                    <h2 className="font-display text-3xl text-forest">{section.title}</h2>
                  </div>

                  <h3 className={`text-lg font-medium ${section.theme.subtitle} mb-4`}>
                    {section.subtitle}
                  </h3>

                  <p className="text-ink-secondary mb-6 leading-relaxed">{section.description}</p>

                  <div className="mb-8">
                    <h4 className="font-medium text-forest mb-3">Key Benefits</h4>
                    <ul className="space-y-2">
                      {section.benefits.map((benefit) => (
                        <li
                          key={benefit}
                          className="flex items-start gap-2.5 text-ink-secondary"
                        >
                          <span
                            className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${section.theme.bullet}`}
                          />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-forest mb-3">Common Practices</h4>
                    <ul className="space-y-2">
                      {section.practices.map((practice) => (
                        <li
                          key={practice}
                          className="flex items-start gap-2.5 text-ink-secondary"
                        >
                          <span
                            className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${section.theme.bullet}`}
                          />
                          <span>{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Illustration Column */}
                <div className="w-full flex-1">
                  <figure className="relative overflow-hidden rounded-3xl border border-hairline bg-surface shadow-[0_18px_50px_rgba(24,39,32,0.08)]">
                    <div
                      role="img"
                      aria-label={section.alt}
                      className="aspect-[16/11] w-full"
                    >
                      <Art className="h-full w-full" />
                    </div>
                    <figcaption
                      className={`absolute left-4 top-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-sm ${section.theme.iconWrap}`}
                    >
                      <IconComponent className="h-3.5 w-3.5" />
                      {section.title}
                    </figcaption>
                  </figure>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Integration Section */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl border border-hairline bg-surface p-8 sm:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_20rem_at_100%_0%,rgba(185,137,47,0.08),transparent)]"
          />
          <div className="relative">
            <h2 className="font-display text-3xl text-forest text-center mb-6">
              Integrating Wellness Disciplines
            </h2>
            <p className="mx-auto max-w-3xl text-center leading-relaxed text-ink-secondary">
              At AyurPass, we don&apos;t treat these disciplines as separate entities but as
              interconnected aspects of a holistic wellness ecosystem. Our platform intelligently
              matches you with practitioners, treatments, and programs that integrate multiple
              disciplines for optimal results. Whether you&apos;re seeking stress relief, physical
              fitness, spiritual growth, or healing, our personalized approach ensures you receive
              the most beneficial combination of practices tailored to your unique constitution and
              goals.
            </p>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden border-t border-hairline bg-forest">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(45rem_26rem_at_92%_-8%,rgba(185,137,47,0.18),transparent),radial-gradient(40rem_24rem_at_-8%_108%,rgba(61,102,80,0.35),transparent)]"
        />
        <div className="relative mx-auto max-w-6xl px-5 py-16 text-center sm:py-20">
          <h2 className="font-display text-3xl text-white sm:text-4xl">
            Begin your personalized wellness journey
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-white/70">
            Take a guided Prakriti assessment to discover your constitution, then get matched with
            verified practitioners and treatments across every discipline.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-forest-deep hover:bg-gold-soft"
            >
              Take the dosha assessment
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
            >
              Explore practitioners
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function WellnessPage() {
  return (
    <LayoutWrapper>
      <WellnessContent />
    </LayoutWrapper>
  );
}
