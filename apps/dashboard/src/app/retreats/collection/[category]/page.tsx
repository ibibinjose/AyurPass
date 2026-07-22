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
      <div className="flex-1 pb-8">
        <JsonLd
          data={[
            itemListJsonLd(retreats),
            breadcrumbJsonLd([
              { name: "Retreats", path: "/retreats" },
              { name: label, path: `/retreats/collection/${cat.toLowerCase()}` },
            ]),
          ]}
        />

        <section className="relative overflow-hidden border-b border-[var(--separator)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(47,90,68,0.12),_transparent_55%),linear-gradient(180deg,var(--clay)_0%,var(--background)_72%)]"
          />
          <div className="page-shell relative !pb-8 !pt-8 sm:!pt-10">
            <nav className="text-sm font-semibold text-ink-muted">
              <Link href="/retreats" className="hover:text-forest">
                Retreats
              </Link>
              <span className="mx-1.5 text-ink-muted/60">/</span>
              <span className="text-ink-secondary">{label}</span>
            </nav>
            <h1 className="type-display mt-3 max-w-2xl">{label} retreats &amp; trainings</h1>
            <p className="type-body mt-2.5 max-w-xl font-medium">{INTRO[cat]}</p>
            <p className="mt-4 text-sm font-semibold text-ink-muted">
              {retreats.length} {retreats.length === 1 ? "retreat" : "retreats"} in this collection
            </p>
          </div>
        </section>

        <div className="page-shell !pt-6">
          {retreats.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {retreats.map((r) => (
                <RetreatCard key={r.id} retreat={r} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.25rem] border border-dashed border-[var(--separator)] bg-surface/70 px-6 py-14 text-center">
              <p className="font-display text-xl text-forest">
                No {label.toLowerCase()} retreats listed yet
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm font-medium text-ink-muted">
                New retreats are added regularly.{" "}
                <Link href="/retreats" className="font-bold text-[var(--system-blue)] hover:underline">
                  Browse all retreats
                </Link>
                .
              </p>
            </div>
          )}

          <section className="mt-12 border-t border-[var(--separator)] pt-8">
            <h2 className="type-title text-xl">Explore by discipline</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {RETREAT_CATEGORIES.filter((c) => c !== cat).map((c) => (
                <Link
                  key={c}
                  href={`/retreats/collection/${c.toLowerCase()}`}
                  className="profile-spring inline-flex min-h-10 items-center rounded-full border border-[var(--separator)] bg-surface px-4 py-2 text-sm font-semibold text-ink-secondary transition-colors hover:border-[var(--system-blue)]/40 hover:text-foreground"
                >
                  {RETREAT_CATEGORY_LABEL[c]}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </LayoutWrapper>
  );
}
