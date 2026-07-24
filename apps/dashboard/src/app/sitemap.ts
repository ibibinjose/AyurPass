import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import { RETREAT_CATEGORIES } from "@/lib/catalog";
import { practicePath } from "@/lib/paths";
import { abs } from "@/lib/seo";

// Re-generate at most hourly — keeps the sitemap fresh without hammering the API.
export const revalidate = 3600;

const STATIC_ROUTES: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, freq: "daily" },
  { path: "/about", priority: 0.8, freq: "monthly" },
  { path: "/discover", priority: 0.9, freq: "daily" },
  { path: "/retreats", priority: 0.9, freq: "daily" },
  { path: "/offers", priority: 0.8, freq: "weekly" },
  { path: "/wellness", priority: 0.7, freq: "monthly" },
  { path: "/explore", priority: 0.7, freq: "weekly" },
  { path: "/shop", priority: 0.6, freq: "weekly" },
  { path: "/packages", priority: 0.6, freq: "weekly" },
  { path: "/partners", priority: 0.6, freq: "monthly" },
  { path: "/list-your-business", priority: 0.7, freq: "monthly" },
  { path: "/faq", priority: 0.4, freq: "monthly" },
  { path: "/help", priority: 0.4, freq: "monthly" },
  { path: "/contact", priority: 0.4, freq: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: abs(r.path),
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  // Retreat category hubs.
  for (const c of RETREAT_CATEGORIES) {
    entries.push({
      url: abs(`/retreats/collection/${c.toLowerCase()}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Dynamic entities — degrade gracefully if the API is unreachable at build.
  const [providers, retreats, professionals] = await Promise.all([
    api.providers().catch(() => []),
    api.retreats().catch(() => []),
    api.professionals().catch(() => []),
  ]);

  for (const p of providers) {
    if (!p.slug) continue;
    entries.push({
      url: abs(practicePath(p)),
      lastModified: p.createdAt ? new Date(p.createdAt) : now,
      changeFrequency: "weekly",
      priority: 0.85,
    });
  }
  for (const r of retreats) {
    entries.push({
      url: abs(`/retreats/${r.slug}`),
      lastModified: r.updatedAt ? new Date(r.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }
  for (const pro of professionals) {
    if (!pro.slug) continue;
    entries.push({
      url: abs(`/me/${pro.slug}`),
      lastModified: pro.createdAt ? new Date(pro.createdAt) : now,
      changeFrequency: "weekly",
      priority: 0.85,
    });
  }

  return entries;
}
