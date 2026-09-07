"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api, formatMoney } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";
import { trackRecentView } from "@/hooks/useRecentViews";
import { formatAddress, PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import { practicePath, practitionerPath, professionalDisplayTitle } from "@/lib/paths";
import { isValidNamespace } from "@/lib/paths";
import { SITE_URL } from "@/lib/seo";
import type { BrandProfile, ProfessionalDetail } from "@/lib/types";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { ServiceCard } from "@/components/ServiceCard";
import { EnquireModal } from "@/components/EnquireModal";
import {
  AffiliatedPageCard,
  ProfileAaaBadge,
  ProfileAboutText,
  ProfileAffiliationPill,
  ProfileAvatar,
  ProfileBackgroundCard,
  ProfileBackgroundRow,
  ProfileActionBar,
  ProfileBodyGrid,
  ProfileEmptyState,
  ProfileHeroInfo,
  ProfileHeroShell,
  ProfileLinkButtons,
  ProfileMetaLine,
  ProfilePageFrame,
  ProfileSection,
  ProfileMediaMasonry,
  ProfileShell,
  ProfileSocialStrip,
  ProfileTabs,
  ProfileThemeScope,
  ProfileVerifiedMark,
  type ProfileLinkItem,
} from "@/components/profile/ProfilePrimitives";
import { TagAuthorityRow } from "@/components/AuthorityBadge";
import { QualityPanel } from "@/components/QualityControls";
import { authoritiesForProfessional } from "@/lib/credentials";
import { publicContactEmail } from "@/lib/aaaDirectory";
import { brandSocialToDisplay } from "@/lib/social";
import { ExternalLinkIcon, MailIcon, MapPinIcon } from "@/components/icons";

function buildLinkItems(
  professional: ProfessionalDetail,
  provider: ProfessionalDetail["provider"],
  brand?: BrandProfile | null,
): ProfileLinkItem[] {
  const aaaProfileUrl = professional.verificationDocuments?.profileUrl;
  const contactEmail = publicContactEmail(brand?.contactEmail, professional.user?.email);
  const contactPhone = brand?.contactPhone || professional.user?.phone;
  const social = brand?.socialLinks;
  const items: ProfileLinkItem[] = [];
  if (brand?.website) {
    items.push({
      kind: "website",
      label: "Website",
      sublabel: brand.website.replace(/^https?:\/\//, ""),
      href: brand.website,
    });
  }
  if (aaaProfileUrl) {
    items.push({
      kind: "website",
      label: "AAA directory profile",
      sublabel: "Australian Association of Ayurveda",
      href: aaaProfileUrl,
    });
  }
  if (brand?.externalBookingUrl && brand.externalBookingUrl !== aaaProfileUrl) {
    items.push({
      kind: "book",
      label: "Book online",
      sublabel: "External booking",
      href: brand.externalBookingUrl,
    });
  }
  if (contactEmail) {
    items.push({ kind: "email", label: "Email", sublabel: contactEmail, href: `mailto:${contactEmail}` });
  }
  if (contactPhone) {
    items.push({ kind: "phone", label: "Call", sublabel: contactPhone, href: `tel:${contactPhone}` });
  }
  for (const s of brandSocialToDisplay(social)) {
    items.push({
      kind: "social",
      platform: s.platform,
      label: s.label,
      handle: s.handle,
      sublabel: s.handle,
      href: s.href,
    });
  }
  if (provider) {
    items.push({
      kind: "internal",
      label: "View practice",
      sublabel: provider.businessName,
      href: practicePath(provider),
      external: false,
    });
  }
  return items;
}

function mapsUrl(provider: NonNullable<ProfessionalDetail["provider"]>): string | null {
  const a = provider.address;
  const parts = [provider.businessName, a?.street, a?.city, a?.state, a?.country]
    .map((p) => p?.trim())
    .filter(Boolean);
  if (parts.length <= 1) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(", "))}`;
}

/**
 * Resolves practitioners from:
 *  - /me/:slug
 *  - /pro|ayur|yoga|spa|…/:handle
 *  - /:vanity (root — admin-approved only; loaded via vanity routes)
 */
export default function PractitionerProfileClient({
  mode = "auto",
  namespace,
  vanity,
}: {
  mode?: "auto" | "slug" | "handle" | "vanity";
  namespace?: string;
  vanity?: boolean;
} = {}) {
  const params = useParams<{ slug?: string; handle?: string }>();
  const slug = params.slug;
  const handle = params.handle;
  const [professional, setProfessional] = useState<ProfessionalDetail | null | undefined>(
    undefined,
  );
  const [enquireOpen, setEnquireOpen] = useState(false);
  const [tab, setTab] = useState("about");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        let pro: ProfessionalDetail | null = null;
        if (vanity || mode === "vanity") {
          const h = handle || slug;
          if (!h) return;
          pro = await api.professionalByVanity(h);
        } else if (mode === "handle" || (namespace && handle)) {
          const ns = namespace || "pro";
          if (!handle || !isValidNamespace(ns)) {
            if (!cancelled) setProfessional(null);
            return;
          }
          pro = await api.professionalByHandle(ns, handle);
        } else if (handle && namespace) {
          pro = await api.professionalByHandle(namespace, handle);
        } else if (slug) {
          pro = await api.professionalBySlug(slug);
        } else if (handle) {
          // /pro/:handle style when parent passes nothing but URL has handle under known folder
          pro = await api.professionalByHandle("pro", handle);
        } else {
          if (!cancelled) setProfessional(null);
          return;
        }
        if (!cancelled) setProfessional(pro);
      } catch {
        if (!cancelled) setProfessional(null);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug, handle, mode, namespace, vanity]);

  useEffect(() => {
    if (!professional) return;
    const name = professional.user?.fullName || professional.title || "Practitioner";
    trackRecentView({
      kind: "professional",
      id: professional.id,
      title: name,
      href: practitionerPath(professional),
      subtitle: professionalDisplayTitle(professional) ?? undefined,
    });
  }, [professional]);

  // All hooks must run before any early return (stable hook order).
  const provider = professional?.provider;
  const brand = provider?.brandProfile;
  const avatar = resolveMediaUrl(professional?.user?.avatarUrl ?? brand?.logoUrl ?? null);
  const coverUrl =
    resolveMediaUrl(professional?.user?.coverImageUrl) ??
    resolveMediaUrl(brand?.coverImageUrl) ??
    resolveMediaUrl(brand?.logoUrl) ??
    avatar;
  const services = professional?.services ?? [];
  const hasBookableServices = services.length > 0;

  const linkItems = useMemo(
    () => (professional ? buildLinkItems(professional, provider, brand) : []),
    [professional, provider, brand],
  );

  const socialOnly = linkItems.filter((i) => i.kind === "social");

  const gallery = useMemo(() => {
    const g = brand?.gallery?.filter(Boolean) ?? [];
    if (coverUrl && !g.includes(coverUrl)) return [coverUrl, ...g];
    if (avatar && !g.includes(avatar)) return [...g, avatar];
    return g;
  }, [brand?.gallery, coverUrl, avatar]);

  const tabs = useMemo(() => {
    const t: { id: string; label: string }[] = [{ id: "about", label: "About" }];
    if (gallery.length) t.push({ id: "media", label: "Media" });
    if (linkItems.length) t.push({ id: "links", label: "Links" });
    if (hasBookableServices) t.push({ id: "services", label: "Services" });
    t.push({ id: "reviews", label: "Reviews" });
    return t;
  }, [gallery.length, linkItems.length, hasBookableServices]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (!active) return;
      if (!tabs.some((t) => t.id === tab)) setTab(tabs[0]?.id ?? "about");
    };
    run();
    return () => {
      active = false;
    };
  }, [tabs, tab]);

  if (professional === null) {
    return (
      <PageWrap>
        <ProfileEmptyState
          title="Practitioner not found"
          body="This profile may have been removed or the link is incorrect."
        />
        <div className="mt-6 text-center">
          <Link href="/discover" className="text-sm font-medium text-forest hover:underline">
            ← Back to discovery
          </Link>
        </div>
      </PageWrap>
    );
  }

  if (professional === undefined) {
    return (
      <PageWrap>
        <div className="flex flex-col items-center gap-7 border-b border-hairline/70 pb-9 md:flex-row md:items-start">
          <div className="h-28 w-28 animate-pulse rounded-full bg-clay/70" />
          <div className="flex w-full max-w-md flex-col items-center gap-3 md:items-start">
            <div className="h-9 w-56 animate-pulse rounded-lg bg-clay/70" />
            <div className="h-4 w-28 animate-pulse rounded bg-clay/60" />
            <div className="h-5 w-40 animate-pulse rounded bg-clay/60" />
            <div className="mt-3 flex gap-3">
              <div className="h-10 w-28 animate-pulse rounded-xl bg-clay/70" />
              <div className="h-10 w-24 animate-pulse rounded-xl bg-clay/70" />
            </div>
          </div>
        </div>
      </PageWrap>
    );
  }

  const user = professional.user;
  const displayName = user?.fullName || professional.title || "Practitioner";
  const title =
    professionalDisplayTitle(professional) || professional.title || "Wellness practitioner";
  const verified = provider?.verificationStatus === "verified";
  const authorities = authoritiesForProfessional(professional);
  const aaaListed = professional.verificationDocuments?.source === "aaa";
  const membership = professional.verificationDocuments?.membership;
  const location = provider ? formatAddress(provider.address) : "";
  const mapHref = provider ? mapsUrl(provider) : null;
  const practiceLogo = resolveMediaUrl(brand?.logoUrl);
  const about = professional.bio || brand?.about;
  const hourlyRate =
    professional.hourlyRate != null && Number(professional.hourlyRate) > 0
      ? formatMoney(professional.hourlyRate)
      : null;
  const memberSinceYear = professional.createdAt
    ? new Date(professional.createdAt).getFullYear()
    : null;
  const sharePath = practitionerPath(professional);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${sharePath}`
      : `${SITE_URL}${sharePath}`;

  const handleSaveToPhone = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${displayName}
TEL:${brand?.contactPhone || ""}
EMAIL:${publicContactEmail(brand?.contactEmail, professional.user?.email) || ""}
URL:${shareUrl}
END:VCARD`;
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${displayName.replace(/\s+/g, "_")}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const reviewCount = professional.reviewCount ?? 0;
  const rating = Number(professional.rating ?? 0);
  const years = professional.yearsExperience;

  const bookHref =
    aaaListed && !verified ? null : brand?.externalBookingUrl || null;
  const handleChooseSession = () => setTab("services");

  return (
    <PageWrap
      stickyCta={
        provider ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEnquireOpen(true)}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-forest px-4 text-sm font-semibold text-white shadow-lg"
            >
              <MailIcon className="h-4 w-4" />
              Enquire
            </button>
            {bookHref ? (
              bookHref.startsWith("http") ? (
                <a
                  href={bookHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-hairline bg-surface px-4 text-sm font-semibold text-forest"
                >
                  Book online
                </a>
              ) : (
                <Link
                  href={bookHref}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-hairline bg-surface px-4 text-sm font-semibold text-forest"
                >
                  Book online
                </Link>
              )
            ) : hasBookableServices && !(aaaListed && !verified) ? (
              <button
                type="button"
                onClick={handleChooseSession}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-hairline bg-surface px-4 text-sm font-semibold text-forest"
              >
                Choose a session
              </button>
            ) : null}
          </div>
        ) : undefined
      }
    >
      <ProfilePageFrame
        coverUrl={coverUrl ?? avatar}
      >
        <ProfileHeroShell>
          <ProfileAvatar
            name={displayName}
            imageUrl={avatar}
            hubLogoUrl={practiceLogo && practiceLogo !== avatar ? practiceLogo : null}
            size={128}
            status={verified ? "online" : "offline"}
          />

          <ProfileHeroInfo>
            <h1 className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center font-display text-[1.85rem] font-semibold leading-[1.12] tracking-tight text-forest md:justify-start md:text-left sm:text-[2.25rem]">
              <span>{displayName}</span>
              {verified ? <ProfileVerifiedMark size="lg" /> : null}
            </h1>
            {aaaListed ? (
              <div className="mt-2 flex justify-center md:justify-start">
                <ProfileAaaBadge membership={membership} />
              </div>
            ) : null}

            <p className="text-base font-semibold text-ink-secondary md:text-lg">{title}</p>

            <ProfileMetaLine
              parts={[
                professional.specializations[0] || null,
                location || null,
                years != null && years > 0 ? `${years} years experience` : null,
                rating > 0
                  ? `${rating.toFixed(1)} ★${reviewCount ? ` · ${reviewCount}` : ""}`
                  : null,
                hourlyRate ? `From ${hourlyRate}/hr` : null,
              ]}
            />

            {(professional.specializations.length > 0 || authorities.length > 0) && (
              <div className="mt-2.5 flex justify-center md:justify-start">
                <TagAuthorityRow
                  tags={professional.specializations}
                  authorities={authorities}
                  size="md"
                  maxTags={4}
                  maxAuthorities={3}
                  linkable
                />
              </div>
            )}

            {/* Languages Spoken */}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 md:justify-start">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gold">Languages:</span>
              {(professional.languagesSpoken && professional.languagesSpoken.length > 0
                ? professional.languagesSpoken
                : ["English", "Malayalam", "Hindi"]
              ).map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1 rounded-full bg-clay/60 px-2.5 py-0.5 text-xs font-semibold text-forest border border-hairline/60"
                >
                  🗣️ {lang}
                </span>
              ))}
            </div>

            {provider ? (
              <div className="mt-3">
                <ProfileAffiliationPill
                  href={practicePath(provider)}
                  name={provider.businessName}
                  imageUrl={practiceLogo}
                />
              </div>
            ) : null}

            {linkItems.length > 0 ? (
              <div className="mt-3">
                <ProfileSocialStrip items={linkItems} size="sm" compact />
              </div>
            ) : null}

            <ProfileActionBar
              target={{ kind: "professional", id: professional.id }}
              shareUrl={shareUrl}
              shareTitle={displayName}
              shareText={`${displayName} — ${title}`}
              onEnquire={() => setEnquireOpen(true)}
              bookHref={bookHref}
              onBook={hasBookableServices && !bookHref ? handleChooseSession : undefined}
              bookLabel={bookHref ? "Book online" : "Choose a session"}
              enquireDisabled={!provider}
              onOpenReviews={() => setTab("reviews")}
              onSaveToPhone={handleSaveToPhone}
            />
          </ProfileHeroInfo>
        </ProfileHeroShell>

        <div className="relative z-[1] border-t border-[var(--separator)] px-5 pt-4 sm:px-8 sm:pt-5">
          <ProfileTabs tabs={tabs} active={tab} onChange={setTab} />
        </div>

        <ProfileBodyGrid
          main={
            <>
              {tab === "about" ? (
                <>
                  {about ? (
                    <ProfileSection label="About">
                      <ProfileAboutText>{about}</ProfileAboutText>
                    </ProfileSection>
                  ) : (
                    <ProfileSection label="About">
                      <div className="rounded-3xl border border-dashed border-hairline bg-clay/15 px-5 py-10 text-center sm:px-8">
                        <p className="font-display text-xl text-forest">{displayName}</p>
                        <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-ink-secondary">
                          {title}
                          {location ? ` · ${location}` : ""}. Send an enquiry to learn more about
                          sessions and availability.
                        </p>
                        {provider ? (
                          <button
                            type="button"
                            onClick={() => setEnquireOpen(true)}
                            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-deep"
                          >
                            <MailIcon className="h-4 w-4" />
                            Enquire
                          </button>
                        ) : null}
                      </div>
                    </ProfileSection>
                  )}

                  {professional.specializations.length > 0 || authorities.length > 0 ? (
                    <ProfileSection label="Focus & credentials">
                      <TagAuthorityRow
                        tags={professional.specializations}
                        authorities={authorities}
                        size="md"
                        maxTags={8}
                        maxAuthorities={6}
                        linkable
                      />
                    </ProfileSection>
                  ) : null}

                  {(membership ||
                    professional.registrationNumber ||
                    professional.licenceNumber ||
                    hourlyRate ||
                    memberSinceYear ||
                    aaaListed) && (
                    <ProfileSection label="Credentials">
                      <ProfileBackgroundCard>
                        {membership ? (
                          <ProfileBackgroundRow label="Membership">
                            <p className="text-sm leading-relaxed text-ink-secondary">
                              {membership}
                            </p>
                          </ProfileBackgroundRow>
                        ) : null}
                        {professional.registrationNumber ? (
                          <ProfileBackgroundRow label="Registration">
                            <p className="font-mono text-sm text-ink-secondary">
                              {professional.registrationNumber}
                            </p>
                          </ProfileBackgroundRow>
                        ) : null}
                        {professional.licenceNumber ? (
                          <ProfileBackgroundRow label="Licence">
                            <p className="font-mono text-sm text-ink-secondary">
                              {professional.licenceNumber}
                            </p>
                          </ProfileBackgroundRow>
                        ) : null}
                        {hourlyRate ? (
                          <ProfileBackgroundRow label="Session rate">
                            <p className="text-sm text-ink-secondary">From {hourlyRate} / hr</p>
                          </ProfileBackgroundRow>
                        ) : null}
                        {memberSinceYear ? (
                          <ProfileBackgroundRow label="Member since">
                            <p className="text-sm text-ink-secondary">{memberSinceYear}</p>
                          </ProfileBackgroundRow>
                        ) : null}
                        {aaaListed ? (
                          <ProfileBackgroundRow label="Directory">
                            <ProfileAaaBadge membership={membership} />
                          </ProfileBackgroundRow>
                        ) : null}
                      </ProfileBackgroundCard>
                    </ProfileSection>
                  )}
                </>
              ) : null}

              {tab === "media" ? (
                <ProfileSection label="Gallery">
                  {gallery.length ? (
                    <ProfileMediaMasonry images={gallery} />
                  ) : (
                    <ProfileEmptyState
                      title="No media yet"
                      body="Photos will appear here when added."
                    />
                  )}
                </ProfileSection>
              ) : null}

              {tab === "links" ? (
                <ProfileSection label="Links & social">
                  {linkItems.length ? (
                    <ProfileLinkButtons items={linkItems} />
                  ) : (
                    <ProfileEmptyState
                      title="No links yet"
                      body="Website and contact links will show here."
                    />
                  )}
                </ProfileSection>
              ) : null}

              {tab === "services" ? (
                <ProfileSection label="Sessions">
                  {hasBookableServices ? (
                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                      {services.map((s) => (
                        <ServiceCard key={s.id} service={s} />
                      ))}
                    </div>
                  ) : (
                    <ProfileEmptyState
                      title="No sessions listed"
                      body="Bookable services will appear here."
                    />
                  )}
                </ProfileSection>
              ) : null}

              {tab === "reviews" ? (
                <ProfileSection label="Reviews">
                  <QualityPanel
                    target={{ type: "professional", id: professional.id }}
                    title="Practitioner ratings"
                    targetLabel={displayName}
                  />
                </ProfileSection>
              ) : null}
            </>
          }
          sidebar={
            <>
              <div className="overflow-hidden rounded-[1.35rem] border border-hairline bg-surface shadow-[0_12px_40px_rgba(36,56,46,0.07)]">
                <div className="bg-[linear-gradient(145deg,var(--color-forest),var(--color-leaf))] px-5 py-5 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
                    Book with
                  </p>
                  <p className="mt-1 font-display text-xl font-semibold leading-snug">
                    {displayName}
                  </p>
                  <p className="mt-1 text-sm font-medium text-white/85">{title}</p>
                  {location ? (
                    <p className="mt-2 flex items-start gap-1.5 text-sm font-medium text-white/80">
                      <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-80" />
                      <span>{location}</span>
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2 p-4">
                  {provider ? (
                    <button
                      type="button"
                      onClick={() => setEnquireOpen(true)}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-forest text-sm font-semibold text-white shadow-[0_4px_16px_rgba(36,56,46,0.18)] hover:bg-forest-deep"
                    >
                      <MailIcon className="h-4 w-4" />
                      Enquire
                    </button>
                  ) : null}
                  {bookHref ? (
                    bookHref.startsWith("http") ? (
                      <a
                        href={bookHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-hairline bg-surface text-sm font-semibold text-forest hover:border-leaf"
                      >
                        Book online
                        <ExternalLinkIcon className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <Link
                        href={bookHref}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-hairline bg-surface text-sm font-semibold text-forest hover:border-leaf"
                      >
                        Book online
                      </Link>
                    )
                  ) : hasBookableServices ? (
                    <button
                      type="button"
                      onClick={handleChooseSession}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-hairline bg-surface text-sm font-semibold text-forest hover:border-leaf"
                    >
                      Choose a session
                    </button>
                  ) : null}
                  {linkItems.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setTab("links")}
                      className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-muted transition-colors hover:text-forest"
                    >
                      Contact & social
                      <ExternalLinkIcon className="h-3 w-3" />
                    </button>
                  ) : null}
                  {mapHref ? (
                    <a
                      href={mapHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-muted transition-colors hover:text-forest"
                    >
                      <MapPinIcon className="h-3.5 w-3.5" />
                      Open in Maps
                    </a>
                  ) : null}
                </div>
              </div>

              {(years != null && years > 0) || rating > 0 || hasBookableServices ? (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    years != null && years > 0
                      ? { label: "Years", value: `${years}+` }
                      : null,
                    rating > 0
                      ? { label: "Rating", value: rating.toFixed(1) }
                      : { label: "Status", value: "New" },
                    hasBookableServices
                      ? { label: "Sessions", value: String(services.length) }
                      : null,
                  ]
                    .filter(Boolean)
                    .slice(0, 3)
                    .map((stat) => (
                      <div
                        key={stat!.label}
                        className="rounded-2xl border border-hairline/70 bg-clay/20 px-2 py-3 text-center"
                      >
                        <p className="font-display text-lg font-semibold tabular-nums text-forest">
                          {stat!.value}
                        </p>
                        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-muted">
                          {stat!.label}
                        </p>
                      </div>
                    ))}
                </div>
              ) : null}

              {provider ? (
                <div>
                  <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                    Practice
                  </p>
                  <AffiliatedPageCard
                    href={practicePath(provider)}
                    name={provider.businessName}
                    imageUrl={practiceLogo}
                    subtitle={PROVIDER_TYPE_LABEL[provider.type]}
                  />
                </div>
              ) : null}

              {socialOnly.length > 0 && tab !== "links" ? (
                <div>
                  <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                    Follow
                  </p>
                  <ProfileSocialStrip items={socialOnly} size="sm" compact />
                </div>
              ) : null}

              {brand?.openingHours ? (
                <ProfileSection label="Hours">
                  <ProfileBackgroundCard>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-ink-secondary">
                      {brand.openingHours}
                    </p>
                  </ProfileBackgroundCard>
                </ProfileSection>
              ) : null}
            </>
          }
        />
      </ProfilePageFrame>

      {provider && (
        <EnquireModal
          open={enquireOpen}
          onClose={() => setEnquireOpen(false)}
          providerId={provider.id}
          businessName={displayName}
        />
      )}
    </PageWrap>
  );
}

function PageWrap({
  children,
  stickyCta,
}: {
  children: React.ReactNode;
  stickyCta?: React.ReactNode;
}) {
  return (
    <LayoutWrapper>
      <div className="px-3 py-4 sm:px-5 sm:py-8">
        <ProfileShell>
          <ProfileThemeScope>{children}</ProfileThemeScope>
        </ProfileShell>
      </div>
      {stickyCta ? (
        <div className="fixed inset-x-0 z-40 border-t border-hairline bg-surface/95 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md md:hidden" style={{ bottom: "var(--mobile-tab-bar-offset)" }}>
          {stickyCta}
        </div>
      ) : null}
      {stickyCta ? <div className="h-16 md:hidden" aria-hidden /> : null}
    </LayoutWrapper>
  );
}
