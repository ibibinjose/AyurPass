"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, formatMoney } from "@/lib/api";
import { formatAddress, PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import { practicePath } from "@/lib/paths";
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
  ProfileLocationMeta,
  ProfileMemberSince,
  ProfileMetaBadge,
  ProfileMetaRow,
  ProfilePageFrame,
  ProfileSection,
  ProfileSharePreview,
  ProfileShell,
  ProfileStat,
  ProfileStatSep,
  ProfileStatsLine,
  ProfileVerifiedMark,
  type ProfileLinkItem,
} from "@/components/profile/ProfilePrimitives";

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
  if (social) {
    for (const [name, url] of Object.entries(social)) {
      if (url) {
        items.push({
          kind: "social",
          label: name.charAt(0).toUpperCase() + name.slice(1),
          sublabel: url.replace(/^https?:\/\//, "").split("/")[0],
          href: url,
        });
      }
    }
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

export default function PractitionerProfileClient() {
  const { slug } = useParams<{ slug: string }>();
  const [professional, setProfessional] = useState<ProfessionalDetail | null | undefined>(
    undefined,
  );
  const [enquireOpen, setEnquireOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api
      .professionalBySlug(slug)
      .then(setProfessional)
      .catch(() => setProfessional(null));
  }, [slug]);

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

  const provider = professional.provider;
  const user = professional.user;
  const brand = provider?.brandProfile;
  const displayName = user?.fullName || professional.title || "Practitioner";
  const title = professional.title || "Wellness practitioner";
  const verified = provider?.verificationStatus === "verified";
  const aaaListed = professional.verificationDocuments?.source === "aaa";
  const membership = professional.verificationDocuments?.membership;
  const location = provider ? formatAddress(provider.address) : "";
  const map = provider ? mapsUrl(provider) : null;
  const avatar = user?.avatarUrl ?? brand?.logoUrl;
  const practiceLogo = brand?.logoUrl;
  const coverUrl = brand?.coverImageUrl;
  const about = professional.bio || brand?.about;
  const aboutBrief = about?.replace(/\s+/g, " ").trim().slice(0, 140);
  const services = professional.services ?? [];
  const hasBookableServices = services.length > 0;
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

  const linkItems = buildLinkItems(professional, provider, brand);
  const hasMainContent =
    !!about || linkItems.length > 0 || professional.specializations.length > 0;
  const hasBackground =
    !!membership ||
    professional.yearsExperience != null ||
    !!hourlyRate ||
    professional.reviewCount > 0 ||
    aaaListed;

  const hasStats =
    professional.reviewCount > 0 ||
    (professional.yearsExperience != null && professional.yearsExperience > 0);

  return (
    <PageWrap>
      <Link
        href="/discover"
        className="mb-5 inline-flex text-sm text-ink-muted transition-colors hover:text-forest"
      >
        ← Back to discovery
      </Link>

      <ProfilePageFrame coverUrl={coverUrl ?? avatar}>
        <ProfileHeroShell>
          <ProfileAvatar
            name={displayName}
            imageUrl={avatar}
            hubLogoUrl={practiceLogo && practiceLogo !== avatar ? practiceLogo : null}
          />

          <ProfileHeroInfo>
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <h1 className="font-display text-[1.75rem] leading-tight text-foreground sm:text-[2rem]">
                {displayName}
              </h1>
              {(verified || aaaListed) && <ProfileVerifiedMark />}
            </div>

            {professional.slug ? (
              <p className="font-mono text-sm tracking-tight text-ink-muted">@{professional.slug}</p>
            ) : null}

            <p className="mt-0.5 text-lg leading-snug text-ink-secondary">{title}</p>

            <ProfileMetaRow>
              {professional.specializations[0] ? (
                <ProfileMetaBadge label={professional.specializations[0]} />
              ) : aaaListed ? (
                <ProfileAaaBadge />
              ) : null}
              {location ? <ProfileLocationMeta location={location} mapUrl={map} /> : null}
              {memberSinceYear ? <ProfileMemberSince year={memberSinceYear} /> : null}
            </ProfileMetaRow>

            {provider ? (
              <ProfileAffiliationPill
                href={practicePath(provider)}
                name={provider.businessName}
                imageUrl={practiceLogo}
              />
            ) : null}

            {hasStats ? (
              <ProfileStatsLine>
                {professional.reviewCount > 0 ? (
                  <>
                    <span>
                      <span className="font-semibold text-foreground">
                        {Number(professional.rating).toFixed(1)} ★
                      </span>{" "}
                      · {professional.reviewCount}{" "}
                      {professional.reviewCount === 1 ? "review" : "reviews"}
                    </span>
                    {professional.yearsExperience != null && professional.yearsExperience > 0 ? (
                      <ProfileStatSep />
                    ) : null}
                  </>
                ) : null}
                {professional.yearsExperience != null && professional.yearsExperience > 0 ? (
                  <ProfileStat value={professional.yearsExperience} label="years experience" />
                ) : null}
              </ProfileStatsLine>
            ) : null}

            <ProfileActionBar
              target={{ kind: "professional", id: professional.id }}
              shareUrl={shareUrl}
              shareTitle={displayName}
              shareText={`${displayName} — ${title}`}
              onEnquire={() => setEnquireOpen(true)}
              bookHref={hasBookableServices ? "/explore" : null}
              enquireDisabled={!provider}
            />
          </ProfileHeroInfo>
        </ProfileHeroShell>

        <ProfileBodyGrid
          main={
            <>
              {about ? (
                <ProfileSection label="About">
                  <ProfileAboutText>{about}</ProfileAboutText>
                </ProfileSection>
              ) : null}

              {linkItems.length > 0 ? (
                <ProfileSection label="Links & social">
                  <ProfileLinkButtons items={linkItems} />
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

              {hasBookableServices ? (
                <ProfileSection label="Services & sessions">
                  <div className="grid gap-5 sm:grid-cols-2">
                    {services.map((s) => (
                      <ServiceCard key={s.id} service={s} />
                    ))}
                  </div>
                </ProfileSection>
              ) : null}

              {!hasMainContent && !hasBookableServices ? (
                <ProfileEmptyState
                  title="Nothing here yet"
                  body="This practitioner hasn't added their full story yet. Check back soon."
                />
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
      <div className="px-4 py-6 sm:px-5 sm:py-8">
        <ProfileShell>{children}</ProfileShell>
      </div>
    </LayoutWrapper>
  );
}