"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api, formatMoney } from "@/lib/api";
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
  ProfileChip,
  ProfileEmptyState,
  ProfileHeroInfo,
  ProfileHeroShell,
  ProfileLinkButtons,
  ProfileMetaLine,
  ProfilePageFrame,
  ProfileSection,
  ProfileSharePreview,
  ProfileMediaMasonry,
  ProfileShell,
  ProfileTabs,
  ProfileThemeScope,
  ProfileVerifiedMark,
  type ProfileLinkItem,
} from "@/components/profile/ProfilePrimitives";
import { AuthorityBadgeRow, CredentialLines } from "@/components/AuthorityBadge";
import { QualityPanel } from "@/components/QualityControls";
import { authoritiesForProfessional } from "@/lib/credentials";
import { brandSocialToDisplay } from "@/lib/social";

function buildLinkItems(
  professional: ProfessionalDetail,
  provider: ProfessionalDetail["provider"],
  brand?: BrandProfile | null,
): ProfileLinkItem[] {
  const aaaProfileUrl = professional.verificationDocuments?.profileUrl;
  const contactEmail = brand?.contactEmail || professional.user?.email;
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
  }, [professional?.id]);

  // All hooks must run before any early return (stable hook order).
  const provider = professional?.provider;
  const brand = provider?.brandProfile;
  const avatar = professional?.user?.avatarUrl ?? brand?.logoUrl ?? null;
  const coverUrl = brand?.coverImageUrl ?? null;
  const services = professional?.services ?? [];
  const hasBookableServices = services.length > 0;

  const linkItems = useMemo(
    () => (professional ? buildLinkItems(professional, provider, brand) : []),
    [professional, provider, brand],
  );

  const gallery = useMemo(() => {
    const g = brand?.gallery?.filter(Boolean) ?? [];
    if (coverUrl && !g.includes(coverUrl)) return [coverUrl, ...g];
    if (avatar && !g.includes(avatar)) return [...g, avatar];
    return g;
  }, [brand?.gallery, coverUrl, avatar]);

  const tabs = useMemo(() => {
    const t: { id: string; label: string; count?: number }[] = [{ id: "about", label: "About" }];
    if (gallery.length) t.push({ id: "media", label: "Media", count: gallery.length });
    if (linkItems.length) t.push({ id: "links", label: "Links", count: linkItems.length });
    if (hasBookableServices) t.push({ id: "services", label: "Services", count: services.length });
    t.push({ id: "reviews", label: "Reviews" });
    return t;
  }, [gallery.length, linkItems.length, hasBookableServices, services.length]);

  useEffect(() => {
    if (!tabs.some((t) => t.id === tab)) setTab(tabs[0]?.id ?? "about");
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
  const practiceLogo = brand?.logoUrl;
  const about = professional.bio || brand?.about;
  const aboutBrief = about?.replace(/\s+/g, " ").trim().slice(0, 140);
  const hourlyRate =
    professional.hourlyRate != null && Number(professional.hourlyRate) > 0
      ? formatMoney(professional.hourlyRate)
      : null;
  const memberSinceYear = professional.createdAt
    ? new Date(professional.createdAt).getFullYear()
    : null;
  const sharePath = professional.slug ? `/me/${professional.slug}` : "";
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${sharePath}`
      : `${SITE_URL}${sharePath}`;

  const hasBackground =
    !!membership ||
    professional.yearsExperience != null ||
    !!hourlyRate ||
    professional.reviewCount > 0 ||
    aaaListed;

  return (
    <PageWrap>
      <Link
        href="/discover"
        className="profile-spring mb-4 inline-flex min-h-10 items-center rounded-full px-1 text-sm font-semibold text-ink-muted transition-colors hover:text-forest"
      >
        ← Back to discovery
      </Link>

      <ProfilePageFrame coverUrl={coverUrl ?? avatar}>
        <ProfileHeroShell>
          <ProfileAvatar
            name={displayName}
            imageUrl={avatar}
            hubLogoUrl={practiceLogo && practiceLogo !== avatar ? practiceLogo : null}
            size={128}
            status={verified || aaaListed ? "online" : "offline"}
          />

          <ProfileHeroInfo>
            <h1 className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center font-display text-[1.75rem] font-semibold leading-[1.15] tracking-tight text-forest md:justify-start md:text-left sm:text-[2.125rem]">
              <span>{displayName}</span>
              {verified || aaaListed ? <ProfileVerifiedMark size="lg" /> : null}
            </h1>

            {professional.slug ? (
              <p className="font-mono text-sm font-medium tracking-tight text-ink-muted">
                @{professional.slug}
              </p>
            ) : null}

            <ProfileMetaLine
              parts={[
                title,
                professional.specializations[0],
                provider?.address?.country ||
                  provider?.address?.city ||
                  location ||
                  null,
                memberSinceYear ? `Member since ${memberSinceYear}` : null,
                professional.yearsExperience != null && professional.yearsExperience > 0
                  ? `${professional.yearsExperience} years experience`
                  : null,
                professional.reviewCount > 0
                  ? `${Number(professional.rating).toFixed(1)} ★ · ${professional.reviewCount} ${
                      professional.reviewCount === 1 ? "review" : "reviews"
                    }`
                  : null,
              ]}
            />

            {authorities.length > 0 ? (
              <div className="mt-2 flex justify-center md:justify-start">
                <AuthorityBadgeRow authorities={authorities} />
              </div>
            ) : null}

            <CredentialLines
              registrationNumber={professional.registrationNumber}
              licenceNumber={professional.licenceNumber}
              className="mt-2 justify-items-center md:justify-items-start"
            />

            {provider ? (
              <ProfileAffiliationPill
                href={practicePath(provider)}
                name={provider.businessName}
                imageUrl={practiceLogo}
              />
            ) : null}

            <ProfileActionBar
              target={{ kind: "professional", id: professional.id }}
              shareUrl={shareUrl}
              shareTitle={displayName}
              shareText={`${displayName} — ${title}`}
              onEnquire={() => setEnquireOpen(true)}
              bookHref={hasBookableServices ? "/explore" : null}
              enquireDisabled={!provider}
              onOpenReviews={() => setTab("reviews")}
            />
          </ProfileHeroInfo>
        </ProfileHeroShell>

        <div className="relative z-[1] border-t border-[var(--separator)] px-5 pt-5 sm:px-8">
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
                  ) : null}
                  {professional.specializations.length > 0 ? (
                    <ProfileSection label="Specializations">
                      <div className="flex flex-wrap gap-2.5">
                        {professional.specializations.map((spec) => (
                          <ProfileChip key={spec} label={spec} />
                        ))}
                      </div>
                    </ProfileSection>
                  ) : null}
                  {!about && professional.specializations.length === 0 ? (
                    <ProfileEmptyState
                      title="Nothing here yet"
                      body="This practitioner hasn't added their full story yet. Check back soon."
                    />
                  ) : null}
                </>
              ) : null}

              {tab === "media" ? (
                <ProfileSection label="Media">
                  {gallery.length ? (
                    <ProfileMediaMasonry images={gallery} />
                  ) : (
                    <ProfileEmptyState title="No media yet" body="Photos will appear here when added." />
                  )}
                </ProfileSection>
              ) : null}

              {tab === "links" ? (
                <ProfileSection label="Links & social">
                  {linkItems.length ? (
                    <ProfileLinkButtons items={linkItems} />
                  ) : (
                    <ProfileEmptyState title="No links yet" body="Website and contact links will show here." />
                  )}
                </ProfileSection>
              ) : null}

              {tab === "services" ? (
                <ProfileSection label="Services & sessions">
                  {hasBookableServices ? (
                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                      {services.map((s) => (
                        <ServiceCard key={s.id} service={s} />
                      ))}
                    </div>
                  ) : (
                    <ProfileEmptyState title="No sessions listed" body="Bookable services will appear here." />
                  )}
                </ProfileSection>
              ) : null}

              {tab === "reviews" ? (
                <ProfileSection label="Quality & reviews">
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
              <ProfileSection label="Share preview">
                <p className="-mt-1 text-xs leading-relaxed text-ink-muted">
                  How this profile looks when the link is shared.
                </p>
                <ProfileSharePreview
                  title={displayName}
                  description={aboutBrief ?? title}
                  path={sharePath}
                  imageUrl={avatar ?? coverUrl}
                />
              </ProfileSection>

              {hasBackground ? (
                <ProfileSection label="Background">
                  <ProfileBackgroundCard>
                    {membership ? (
                      <ProfileBackgroundRow label="Membership">
                        <p className="text-sm leading-relaxed text-ink-secondary">{membership}</p>
                      </ProfileBackgroundRow>
                    ) : null}
                    {provider ? (
                      <ProfileBackgroundRow label="Practice type">
                        <ProfileChip label={PROVIDER_TYPE_LABEL[provider.type] ?? provider.type} />
                      </ProfileBackgroundRow>
                    ) : null}
                    {hourlyRate ? (
                      <ProfileBackgroundRow label="Session rate">
                        <p className="text-sm text-ink-secondary">From {hourlyRate} / hr</p>
                      </ProfileBackgroundRow>
                    ) : null}
                    {aaaListed ? (
                      <ProfileBackgroundRow label="Directory">
                        <ProfileAaaBadge />
                      </ProfileBackgroundRow>
                    ) : null}
                  </ProfileBackgroundCard>
                </ProfileSection>
              ) : null}

              {provider ? (
                <ProfileSection label="Affiliated pages">
                  <AffiliatedPageCard
                    href={practicePath(provider)}
                    name={provider.businessName}
                    imageUrl={practiceLogo}
                    subtitle={PROVIDER_TYPE_LABEL[provider.type]}
                  />
                </ProfileSection>
              ) : null}

              {brand?.openingHours ? (
                <ProfileSection label="Availability">
                  <ProfileBackgroundCard>
                    <p className="text-sm leading-relaxed text-ink-secondary">{brand.openingHours}</p>
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

function PageWrap({ children }: { children: React.ReactNode }) {
  return (
    <LayoutWrapper>
      <div className="px-3 py-4 sm:px-5 sm:py-8">
        <ProfileShell>
          <ProfileThemeScope>{children}</ProfileThemeScope>
        </ProfileShell>
      </div>
    </LayoutWrapper>
  );
}