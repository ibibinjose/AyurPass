"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api, formatMoney } from "@/lib/api";
import { formatAddress, PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import { practiceBioPath, practicePath } from "@/lib/paths";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import type { Product, Provider, ProviderProfileBundle, Service } from "@/lib/types";
import { brandSocialToDisplay } from "@/lib/social";
import { Logo } from "@/components/Logo";
import { SocialBrandBadge } from "@/components/SocialBrandIcon";
import {
  CalendarIcon,
  ExternalLinkIcon,
  GlobeIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ShareIcon,
  ShieldIcon,
} from "@/components/icons";
import { ProfileVerifiedMark } from "@/components/profile/ProfilePrimitives";
import { EnquireModal } from "@/components/EnquireModal";
import { ClaimBusinessModal } from "@/components/profile/ClaimBusinessModal";

/**
 * Link-in-bio landing page for social sharing (Instagram / TikTok / X bio).
 * Tall single column: avatar · name · CTAs · stacked links · sessions · products · social.
 */
export default function PracticeLinkBioClient({
  initialProfile,
  slug,
  providerId,
}: {
  initialProfile?: ProviderProfileBundle | null;
  slug?: string;
  providerId?: string;
}) {
  const [provider, setProvider] = useState<Provider | null | undefined>(
    initialProfile?.provider ?? undefined,
  );
  const [services, setServices] = useState<Service[]>(initialProfile?.services ?? []);
  const [products, setProducts] = useState<Product[]>(initialProfile?.products ?? []);
  const [enquireOpen, setEnquireOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (!active) return;
      if (initialProfile) {
        setProvider(initialProfile.provider);
        setServices(initialProfile.services);
        setProducts(initialProfile.products);
        return;
      }
      const load = slug
        ? api.providerProfileBySlug(slug)
        : providerId
          ? api.providerProfile(providerId)
          : null;
      if (!load) {
        setProvider(null);
        return;
      }
      load
        .then((profile) => {
          if (!active) return;
          setProvider(profile.provider);
          setServices(profile.services);
          setProducts(profile.products);
        })
        .catch(() => {
          if (active) setProvider(null);
        });
    };
    run();
    return () => {
      active = false;
    };
  }, [slug, providerId, initialProfile]);

  useEffect(() => {
    if (!provider?.id) return;
    if (initialProfile?.provider.id === provider.id) return;
    api.servicesByProvider(provider.id).then(setServices).catch(() => setServices([]));
    api.productsByProvider(provider.id).then(setProducts).catch(() => setProducts([]));
  }, [provider?.id, initialProfile]);

  const brand = provider?.brandProfile;
  const logo = brand?.logoUrl ?? brand?.coverImageUrl ?? null;
  const cover = brand?.coverImageUrl ?? logo;
  const verified = provider?.verificationStatus === "verified";
  const typeLabel = provider
    ? PROVIDER_TYPE_LABEL[provider.type] ?? provider.type
    : "";
  const location = useMemo(() => {
    if (!provider?.address) return "";
    return formatAddress(provider.address);
  }, [provider]);
  const social = useMemo(
    () => brandSocialToDisplay(brand?.socialLinks),
    [brand?.socialLinks],
  );
  const aboutOne = brand?.about?.replace(/\s+/g, " ").trim().slice(0, 120) ?? "";
  const fullPath = provider ? practicePath(provider) : "/";
  const bioPath = provider ? practiceBioPath(provider) : "/";
  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}${bioPath}` : `${SITE_URL}${bioPath}`;

  const bookHref = brand?.externalBookingUrl?.trim() || null;
  const website = brand?.website?.trim() || null;
  const email = brand?.contactEmail?.trim() || null;
  const phone = brand?.contactPhone?.trim() || null;

  async function shareOrCopy() {
    const payload = {
      title: provider?.businessName ?? SITE_NAME,
      text: aboutOne || typeLabel,
      url: shareUrl,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        /* cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  if (provider === undefined) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-clay/30">
        <div className="h-12 w-12 animate-pulse rounded-full bg-clay" />
      </div>
    );
  }

  if (provider === null) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-clay/20 px-6 text-center">
        <p className="font-display text-2xl text-forest">Practice not found</p>
        <Link href="/discover" className="text-sm font-semibold text-forest hover:underline">
          Browse Discover
        </Link>
      </div>
    );
  }

  const linkRows: {
    key: string;
    href: string;
    label: string;
    sub?: string;
    external?: boolean;
    icon?: React.ReactNode;
    primary?: boolean;
  }[] = [];

  if (bookHref) {
    linkRows.push({
      key: "book",
      href: bookHref,
      label: "Book a session",
      sub: "Online booking",
      external: true,
      primary: true,
      icon: <CalendarIcon className="h-5 w-5" />,
    });
  }
  if (website) {
    linkRows.push({
      key: "web",
      href: website,
      label: "Website",
      sub: website.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      external: true,
      icon: <GlobeIcon className="h-5 w-5" />,
    });
  }
  if (email) {
    linkRows.push({
      key: "email",
      href: `mailto:${email}`,
      label: "Email",
      sub: email,
      icon: <MailIcon className="h-5 w-5" />,
    });
  }
  if (phone) {
    linkRows.push({
      key: "phone",
      href: `tel:${phone}`,
      label: "Call",
      sub: phone,
      icon: <PhoneIcon className="h-5 w-5" />,
    });
  }
  for (const s of social) {
    linkRows.push({
      key: `soc-${s.platform}-${s.href}`,
      href: s.href,
      label: s.label,
      sub: s.handle,
      external: true,
      icon: <SocialBrandBadge platform={s.platform} size="sm" className="!h-8 !w-8 !rounded-xl !text-[14px]" />,
    });
  }

  const featuredServices = services.slice(0, 4);
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Ambient cover */}
      <div aria-hidden className="pointer-events-none fixed inset-0">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="h-full w-full scale-110 object-cover opacity-40 blur-2xl" />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(160deg,#1e3228_0%,#3d6650_45%,#e9d9b8_100%)] opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/90 to-background" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-12 pt-8 sm:px-6 sm:pt-12">
        <div className="mb-6 flex items-center justify-between">
          <Logo className="scale-90 origin-left opacity-90" />
          <button
            type="button"
            onClick={() => void shareOrCopy()}
            className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface/90 px-3 py-1.5 text-xs font-bold text-forest shadow-sm backdrop-blur-sm"
          >
            <ShareIcon className="h-3.5 w-3.5" />
            {copied ? "Copied" : "Share"}
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-surface shadow-[0_12px_40px_rgba(0,0,0,0.15)] ring-1 ring-black/5 sm:h-32 sm:w-32">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,var(--color-forest),var(--color-leaf))] font-display text-3xl font-semibold text-white">
                  {provider.businessName.slice(0, 1)}
                </div>
              )}
            </div>
            {verified ? (
              <span className="absolute -bottom-1 -right-1 rounded-full bg-surface p-0.5 shadow">
                <ProfileVerifiedMark size="md" />
              </span>
            ) : null}
          </div>

          <h1 className="mt-5 font-display text-[1.75rem] font-semibold leading-tight tracking-tight text-forest sm:text-[2rem]">
            {provider.businessName}
          </h1>
          <p className="mt-1.5 text-sm font-semibold text-ink-muted">
            {[typeLabel, location].filter(Boolean).join(" · ")}
          </p>
          {aboutOne ? (
            <p className="mt-3 max-w-sm text-sm font-medium leading-relaxed text-ink-secondary">
              {aboutOne}
              {(brand?.about?.length ?? 0) > 120 ? "…" : ""}
            </p>
          ) : null}
        </div>

        {/* Primary CTAs */}
        <div className="mt-7 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => setEnquireOpen(true)}
            className="profile-spring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-forest text-sm font-bold text-white shadow-[0_8px_28px_rgba(36,56,46,0.28)] hover:bg-forest-deep"
          >
            <MailIcon className="h-4 w-4" />
            Enquire
          </button>
          {bookHref ? (
            <a
              href={bookHref}
              target="_blank"
              rel="noreferrer"
              className="profile-spring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-hairline bg-surface/95 text-sm font-bold text-forest shadow-sm backdrop-blur-sm hover:border-leaf"
            >
              <CalendarIcon className="h-4 w-4" />
              Book now
            </a>
          ) : null}
          {!verified ? (
            <button
              type="button"
              onClick={() => setClaimOpen(true)}
              className="profile-spring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-emerald-600/35 bg-emerald-50/90 text-sm font-bold text-emerald-900 shadow-sm hover:bg-emerald-100"
            >
              <ShieldIcon className="h-4 w-4" />
              Claim your profile
            </button>
          ) : null}
        </div>

        {/* Stacked link-in-bio rows */}
        {linkRows.length > 0 ? (
          <div className="mt-6 flex flex-col gap-2.5">
            {linkRows.map((row) => (
              <a
                key={row.key}
                href={row.href}
                target={row.external ? "_blank" : undefined}
                rel={row.external ? "noreferrer" : undefined}
                className={`profile-spring group flex items-center gap-3.5 rounded-2xl border px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)] ${
                  row.primary
                    ? "border-forest/20 bg-forest text-white"
                    : "border-hairline bg-surface/95 text-foreground backdrop-blur-sm"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    row.primary ? "bg-white/15 text-white" : "bg-clay/60 text-forest"
                  }`}
                >
                  {row.icon}
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-sm font-bold">{row.label}</span>
                  {row.sub ? (
                    <span
                      className={`mt-0.5 block truncate text-xs font-medium ${
                        row.primary ? "text-white/75" : "text-ink-muted"
                      }`}
                    >
                      {row.sub}
                    </span>
                  ) : null}
                </span>
                <ExternalLinkIcon
                  className={`h-4 w-4 shrink-0 opacity-40 group-hover:opacity-80 ${
                    row.primary ? "text-white" : "text-ink-muted"
                  }`}
                />
              </a>
            ))}
          </div>
        ) : null}

        {/* Sessions */}
        {featuredServices.length > 0 ? (
          <section className="mt-8">
            <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">
              Sessions
            </p>
            <div className="flex flex-col gap-2">
              {featuredServices.map((s) => (
                <Link
                  key={s.id}
                  href={`/book/${s.id}`}
                  className="profile-spring flex items-center gap-3 rounded-2xl border border-hairline bg-surface/95 px-3.5 py-3 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-leaf/40"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-clay">
                    {s.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-forest/10 text-forest">
                        <CalendarIcon className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block truncate text-sm font-bold text-forest">{s.name}</span>
                    <span className="mt-0.5 block text-xs font-medium text-ink-muted">
                      {s.durationMinutes ? `${s.durationMinutes} min · ` : ""}
                      {formatMoney(s.price, s.currency)}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* Products */}
        {featuredProducts.length > 0 ? (
          <section className="mt-7">
            <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">
              Shop
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {featuredProducts.map((p) => {
                const img = p.images?.find(Boolean) ?? null;
                return (
                  <Link
                    key={p.id}
                    href={`/shop/${p.id}`}
                    className="profile-spring overflow-hidden rounded-2xl border border-hairline bg-surface/95 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-leaf/40"
                  >
                    <div className="aspect-square bg-clay">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="px-2.5 py-2">
                      <p className="line-clamp-2 text-xs font-bold leading-snug text-forest">
                        {p.name}
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold tabular-nums text-ink-muted">
                        {formatMoney(p.price)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* Social logo row */}
        {social.length > 0 ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {social.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="profile-spring rounded-full shadow-md ring-2 ring-white transition-transform hover:scale-105"
                aria-label={s.label}
                title={`${s.label} ${s.handle}`}
              >
                <SocialBrandBadge platform={s.platform} size="md" className="!rounded-full" />
              </a>
            ))}
          </div>
        ) : null}

        {location ? (
          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-ink-muted">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
            {location}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col items-center gap-3 border-t border-hairline/60 pt-6">
          <Link
            href={fullPath}
            className="text-sm font-bold text-forest hover:underline"
          >
            View full profile →
          </Link>
          <p className="text-[11px] font-medium text-ink-muted">
            Powered by {SITE_NAME}
          </p>
        </div>
      </div>

      <EnquireModal
        open={enquireOpen}
        onClose={() => setEnquireOpen(false)}
        providerId={provider.id}
        businessName={provider.businessName}
      />

      <ClaimBusinessModal
        open={claimOpen}
        onClose={() => setClaimOpen(false)}
        provider={provider}
      />
    </div>
  );
}