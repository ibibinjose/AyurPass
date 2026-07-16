import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { RETREAT_CATEGORIES, RETREAT_CATEGORY_LABEL } from "@/lib/catalog";
import type { RetreatCategory } from "@/lib/types";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { RetreatCard } from "@/components/RetreatCard";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return RETREAT_CATEGORIES.map((c) => ({ category: c.toLowerCase() }));
}

function resolve(param: string): RetreatCategory | null {
  return RETREAT_CATEGORIES.find((c) => c.toLowerCase() === param.toLowerCase()) ?? null;
}

const INTRO: Partial<Record<RetreatCategory, string>> = {
  YOGA_RETREAT: "Reconnect with body and breath at yoga retreats led by experienced teachers in the world's most restorative settings.",
  YOGA_TEACHER_TRAINING: "Become a certified teacher with immersive 200- and 300-hour yoga teacher trainings around the globe.",
  MEDITATION_RETREAT: "Find stillness on guided meditation retreats — from gentle mindfulness to deep contemplative practice.",
  AYURVEDA_PANCHAKARMA: "Restore balance with authentic Ayurveda and Panchakarma programs rooted in millennia of healing tradition.",
  DETOX_CLEANSE: "Reset body and mind on structured detox and cleanse retreats with expert guidance and nourishing food.",
  SPA_WELLNESS: "Unwind at luxury spa and wellness retreats designed around rest, renewal and deep relaxation.",
  FITNESS_ADVENTURE: "Move, sweat and explore on fitness and adventure retreats that challenge and energise.",
  SILENT_RETREAT: "Step into quiet on silent retreats that create space for clarity, insight and calm.",
  WOMENS_RETREAT: "Gather, restore and grow on women's retreats built around community and self-care.",
  HEALING_RETREAT: "Support recovery and renewal on holistic healing retreats for body, mind and spirit.",
  NUTRITION_DETOX: "Reset your relationship with food on nutrition and detox retreats led by qualified nutritionists and Ayurvedic experts.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = resolve(category);
  if (!cat) return { title: "Retreats", robots: { index: false, follow: false } };
  const label = RETREAT_CATEGORY_LABEL[cat];
  const retreats = await api.retreats({ category: cat }).catch(() => []);
  return pageMetadata({
    title: `${label}s — Handpicked Worldwide`,
    description:
      INTRO[cat] ?? `Discover the best ${label.toLowerCase()} retreats and trainings on AyurPass.`,
    path: `/retreats/collection/${cat.toLowerCase()}`,
    keywords: [label, `${label} retreat`, "wellness retreat", "retreat finder"],
    // Avoid indexing a genuinely empty page.
    noindex: retreats.length === 0,
  });
}

export default async function RetreatCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = resolve(category);
  if (!cat) notFound();

  const label = RETREAT_CATEGORY_LABEL[cat];
  const retreats = await api.retreats({ category: cat }).catch(() => []);

  return (
    <LayoutWrapper>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12">
        <JsonLd
          data={[
            itemListJsonLd(retreats),
            breadcrumbJsonLd([
              { name: "Retreats", path: "/retreats" },
              { name: label, path: `/retreats/collection/${cat.toLowerCase()}` },
            ]),
          ]}
        />

        <nav className="text-sm text-ink-muted">
          <Link href="/retreats" className="hover:text-forest">
            Retreats
          </Link>{" "}
          / <span className="text-ink-secondary">{label}</span>
        </nav>

        <h1 className="mt-3 font-display text-3xl text-forest sm:text-4xl">
          {label} retreats &amp; trainings
        </h1>
        <p className="mt-2 max-w-2xl text-ink-secondary">{INTRO[cat]}</p>

        <div className="mt-8">
          {retreats.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {retreats.map((r) => (
                <RetreatCard key={r.id} retreat={r} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-hairline bg-surface/60 px-6 py-12 text-center">
              <p className="font-display text-lg text-forest">
                No {label.toLowerCase()} retreats listed yet
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
                New retreats are added regularly.{" "}
                <Link href="/retreats" className="font-medium text-forest hover:underline">
                  Browse all retreats
                </Link>
                .
              </p>
            </div>
          )}
        </div>

        {/* Internal linking to sibling collections — spreads crawl equity. */}
        <section className="mt-12 border-t border-hairline pt-8">
          <h2 className="font-display text-xl text-forest">Explore by discipline</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {RETREAT_CATEGORIES.filter((c) => c !== cat).map((c) => (
              <Link
                key={c}
                href={`/retreats/collection/${c.toLowerCase()}`}
                className="rounded-full border border-hairline bg-surface px-4 py-2 text-sm font-medium text-ink-secondary hover:border-leaf hover:text-forest"
              >
                {RETREAT_CATEGORY_LABEL[c]}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </LayoutWrapper>
  );
}
