"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { formatAddress, PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import { practicePath, practitionerPath } from "@/lib/paths";
import { SITE_URL } from "@/lib/seo";
import type { Product, Professional, Provider, Retreat, Service } from "@/lib/types";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { ServiceCard } from "@/components/ServiceCard";
import { ProductCard } from "@/components/ProductCard";
import { RetreatCard } from "@/components/RetreatCard";
import { EnquireModal } from "@/components/EnquireModal";
import { CheckIcon } from "@/components/icons";
import {
  AffiliatedPageCard,
  ProfileAboutText,
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
  ProfileMediaMasonry,
  ProfileShell,
  ProfileStat,
  ProfileStatSep,
  ProfileStatsLine,
  ProfileTabs,
  ProfileThemeScope,
  ProfileVerifiedMark,
  type ProfileLinkItem,
} from "@/components/profile/ProfilePrimitives";
import { AuthorityBadgeRow, CredentialLines } from "@/components/AuthorityBadge";
import { authoritiesForProvider } from "@/lib/credentials";

function buildPracticeLinks(brand?: Provider["brandProfile"]): ProfileLinkItem[] {
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
  if (brand?.externalBookingUrl) {
    items.push({
      kind: "book",
      label: "Book online",
      sublabel: "External booking",
      href: brand.externalBookingUrl,
    });
  }
  if (brand?.contactEmail) {
    items.push({
      kind: "email",
      label: "Email",
      sublabel: brand.contactEmail,
      href: `mailto:${brand.contactEmail}`,
    });
  }
  if (brand?.contactPhone) {
    items.push({
      kind: "phone",
      label: "Call",
      sublabel: brand.contactPhone,
      href: `tel:${brand.contactPhone}`,
    });
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
  return items;
}

function mapsUrl(provider: Provider): string | null {
  const a = provider.address;
  const parts = [provider.businessName, a?.street, a?.city, a?.state, a?.country]
    .map((p) => p?.trim())
    .filter(Boolean);
  if (parts.length <= 1) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(", "))}`;
}

export default function ProviderProfilePage() {
  const params = useParams<{ id?: string; slug?: string }>();
  const slug = params.slug;
  const id = params.id;
  const [provider, setProvider] = useState<Provider | null | undefined>(undefined);
  const [services, setServices] = useState<Service[] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [team, setTeam] = useState<Professional[]>([]);
  const [enquireOpen, setEnquireOpen] = useState(false);
  const [tab, setTab] = useState("about");

  useEffect(() => {
    if (!slug && !id) return;
    const loadProvider = slug ? api.providerBySlug(slug) : api.provider(id!);
    loadProvider
      .then((p) => setProvider(p ?? null))
      .catch(() => setProvider(null));
  }, [slug, id]);

  useEffect(() => {
    if (!provider?.id) return;
    const providerId = provider.id;
    api.servicesByProvider(providerId).then(setServices).catch(() => setServices([]));
    api.productsByProvider(providerId).then(setProducts).catch(() => setProducts([]));
    api.retreatsByProvider(providerId).then(setRetreats).catch(() => setRetreats([]));
    api.publicProfessionalsByProvider(providerId).then(setTeam).catch(() => setTeam([]));
  }, [provider?.id]);

  if (provider === null) {
    return (
      <PageWrap>
        <ProfileEmptyState title="Practice not found" body="This listing may have been removed." />
        <div className="mt-6 text-center">
          <Link href="/discover" className="text-sm font-medium text-forest hover:underline">
            ← Back to discovery
          </Link>
        </div>
      </PageWrap>
    );
  }

  if (provider === undefined) {
    return (
      <PageWrap>
        <div className="flex flex-col items-center gap-7 border-b border-hairline/70 pb-9 md:flex-row md:items-start">
          <div className="h-28 w-28 animate-pulse rounded-full bg-clay/70" />
          <div className="flex w-full max-w-md flex-col items-center gap-3 md:items-start">
            <div className="h-9 w-56 animate-pulse rounded-lg bg-clay/70" />
            <div className="h-4 w-28 animate-pulse rounded bg-clay/60" />
            <div className="mt-3 flex gap-3">
              <div className="h-10 w-28 animate-pulse rounded-xl bg-clay/70" />
            </div>
          </div>
        </div>
      </PageWrap>
    );
  }

  const location = formatAddress(provider.address);
  const verified = provider.verificationStatus === "verified";
  const authorities = authoritiesForProvider(provider);
  const brand = provider.brandProfile;
  const logo = brand?.logoUrl ?? brand?.coverImageUrl;
  const coverUrl = brand?.coverImageUrl;
  const hasBookableServices = (services?.length ?? 0) > 0;
  const gallery = brand?.gallery?.filter(Boolean) ?? [];
  const tags = brand?.tags?.filter(Boolean) ?? [];
  const amenities = brand?.amenities?.filter(Boolean) ?? [];
  const map = mapsUrl(provider);
  const typeLabel = PROVIDER_TYPE_LABEL[provider.type] ?? provider.type;
  const memberSinceYear = provider.createdAt
    ? new Date(provider.createdAt).getFullYear()
    : null;
  const sharePath = practicePath(provider);
  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}${sharePath}` : `${SITE_URL}${sharePath}`;
  const aboutBrief = brand?.about?.replace(/\s+/g, " ").trim().slice(0, 140);

  const linkItems = buildPracticeLinks(brand);
  const serviceCount = services?.length ?? 0;
  const teamCount = team.length;
  const mediaImages = useMemo(() => {
    const g = [...gallery];
    if (coverUrl && !g.includes(coverUrl)) g.unshift(coverUrl);
    if (logo && !g.includes(logo)) g.push(logo);
    return g;
  }, [gallery, coverUrl, logo]);

  const tabs = useMemo(() => {
    const t: { id: string; label: string; count?: number }[] = [{ id: "about", label: "About" }];
    if (mediaImages.length) t.push({ id: "media", label: "Media", count: mediaImages.length });
    if (linkItems.length) t.push({ id: "links", label: "Links", count: linkItems.length });
    if (hasBookableServices) t.push({ id: "services", label: "Services", count: serviceCount });
    if (retreats.length) t.push({ id: "retreats", label: "Retreats", count: retreats.length });
    return t;
  }, [mediaImages.length, linkItems.length, hasBookableServices, serviceCount, retreats.length]);

  useEffect(() => {
    if (!tabs.some((t) => t.id === tab)) setTab(tabs[0]?.id ?? "about");
  }, [tabs, tab]);

  return (
    <PageWrap>
      <Link
        href="/discover"
        className="profile-spring mb-4 inline-flex min-h-10 items-center rounded-full px-1 text-sm font-semibold text-ink-muted transition-colors hover:text-forest"
      >
        ← Back to discovery
      </Link>

      <ProfilePageFrame coverUrl={coverUrl ?? logo}>
        <ProfileHeroShell>
          <ProfileAvatar
            name={provider.businessName}
            imageUrl={logo}
            size={128}
            status={verified ? "online" : "offline"}
          />

          <ProfileHeroInfo>
            <div className="flex flex-wrap items-center justify-center gap-1.5 md:justify-start">
              <h1 className="font-display text-[1.75rem] font-semibold leading-[1.15] tracking-tight text-forest sm:text-[2.125rem]">
                {provider.businessName}
              </h1>
              {verified ? <ProfileVerifiedMark /> : null}
            </div>

            {provider.slug ? (
              <p className="font-mono text-sm font-medium tracking-tight text-ink-muted">
                @{provider.slug}
              </p>
            ) : null}

            <p className="mt-0.5 text-base font-semibold leading-snug text-ink-secondary sm:text-lg">
              {typeLabel}
            </p>

            {authorities.length > 0 ? (
              <div className="mt-2 flex justify-center md:justify-start">
                <AuthorityBadgeRow authorities={authorities} />
              </div>
            ) : null}

            <CredentialLines
              registrationNumber={provider.registrationNumber}
              licenceNumber={provider.licenceNumber}
              className="mt-2 justify-items-center md:justify-items-start"
            />

            <ProfileMetaRow>
              <ProfileMetaBadge label={typeLabel} />
              {brand?.priceBand ? (
                <span className="text-sm font-medium text-ink-muted">{brand.priceBand}</span>
              ) : null}
              {location ? <ProfileLocationMeta location={location} mapUrl={map} /> : null}
              {memberSinceYear ? <ProfileMemberSince year={memberSinceYear} /> : null}
            </ProfileMetaRow>

            {provider.listingTier === "FREE_LISTING" ? (
              <span className="mt-2 inline-flex rounded-full border border-hairline bg-clay/40 px-3 py-1 text-xs font-medium text-ink-secondary">
                Directory listing
              </span>
            ) : null}

            {(serviceCount > 0 || teamCount > 0) && (
              <ProfileStatsLine>
                {serviceCount > 0 ? (
                  <ProfileStat
                    value={serviceCount}
                    label={serviceCount === 1 ? "service" : "services"}
                  />
                ) : null}
                {serviceCount > 0 && teamCount > 0 ? <ProfileStatSep /> : null}
                {teamCount > 0 ? (
                  <ProfileStat
                    value={teamCount}
                    label={teamCount === 1 ? "practitioner" : "practitioners"}
                  />
                ) : null}
              </ProfileStatsLine>
            )}

            <ProfileActionBar
              target={{ kind: "provider", id: provider.id }}
              shareUrl={shareUrl}
              shareTitle={provider.businessName}
              shareText={`${provider.businessName} — ${typeLabel}`}
              onEnquire={() => setEnquireOpen(true)}
              bookHref={hasBookableServices ? "/explore" : null}
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
                  {brand?.about ? (
                    <ProfileSection label="About">
                      <ProfileAboutText>{brand.about}</ProfileAboutText>
                    </ProfileSection>
                  ) : null}
                  {tags.length > 0 ? (
                    <ProfileSection label="Focus areas">
                      <div className="flex flex-wrap gap-2.5">
                        {tags.map((t) => (
                          <ProfileChip key={t} label={t} />
                        ))}
                      </div>
                    </ProfileSection>
                  ) : null}
                  {products && products.length > 0 ? (
                    <ProfileSection label="Products">
                      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                        {products.map((p) => (
                          <ProductCard key={p.id} product={p} />
                        ))}
                      </div>
                    </ProfileSection>
                  ) : null}
                  {!brand?.about && tags.length === 0 && !(products && products.length) ? (
                    <ProfileEmptyState
                      title="Nothing here yet"
                      body="This practice hasn't added their full story yet. Send an enquiry to get in touch."
                    />
                  ) : null}
                </>
              ) : null}

              {tab === "media" ? (
                <ProfileSection label="Media">
                  {mediaImages.length ? (
                    <ProfileMediaMasonry images={mediaImages} />
                  ) : (
                    <ProfileEmptyState title="No media yet" body="Gallery images will appear here." />
                  )}
                </ProfileSection>
              ) : null}

              {tab === "links" ? (
                <ProfileSection label="Links & social">
                  {linkItems.length ? (
                    <ProfileLinkButtons items={linkItems} />
                  ) : (
                    <ProfileEmptyState title="No links yet" body="Website and social links will show here." />
                  )}
                </ProfileSection>
              ) : null}

              {tab === "services" ? (
                <ProfileSection label="Services & sessions">
                  {services === null ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="h-52 animate-pulse rounded-2xl bg-clay/70" />
                      ))}
                    </div>
                  ) : hasBookableServices ? (
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

              {tab === "retreats" ? (
                <ProfileSection label="Retreats & trainings">
                  {retreats.length ? (
                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                      {retreats.map((r) => (
                        <RetreatCard key={r.id} retreat={r} />
                      ))}
                    </div>
                  ) : (
                    <ProfileEmptyState title="No retreats yet" body="Retreat listings will appear here." />
                  )}
                </ProfileSection>
              ) : null}
            </>
          }
          sidebar={
            <>
              <ProfileSection label="Share preview">
                <p className="-mt-1 text-xs leading-relaxed text-ink-muted">
                  How this practice looks when the link is shared.
                </p>
                <ProfileSharePreview
                  title={provider.businessName}
                  description={aboutBrief ?? typeLabel}
                  path={sharePath}
                  imageUrl={logo ?? coverUrl}
                />
              </ProfileSection>

              {amenities.length > 0 || brand?.openingHours ? (
                <ProfileSection label="Background">
                  <ProfileBackgroundCard>
                    {brand?.openingHours ? (
                      <ProfileBackgroundRow label="Opening hours">
                        <p className="text-sm leading-relaxed text-ink-secondary">{brand.openingHours}</p>
                      </ProfileBackgroundRow>
                    ) : null}
                    {amenities.length > 0 ? (
                      <ProfileBackgroundRow label="Amenities">
                        <ul className="flex flex-col gap-2 text-sm text-ink-secondary">
                          {amenities.map((a) => (
                            <li key={a} className="inline-flex items-center gap-2">
                              <CheckIcon className="h-4 w-4 shrink-0 text-leaf" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </ProfileBackgroundRow>
                    ) : null}
                  </ProfileBackgroundCard>
                </ProfileSection>
              ) : null}

              {team.length > 0 ? (
                <ProfileSection label="Practitioners">
                  <div className="flex flex-col gap-3">
                    {team.map((pro) => (
                      <AffiliatedPageCard
                        key={pro.id}
                        href={practitionerPath(pro)}
                        name={pro.user?.fullName || pro.title || "Practitioner"}
                        imageUrl={pro.user?.avatarUrl}
                        subtitle={pro.title ?? undefined}
                      />
                    ))}
                  </div>
                </ProfileSection>
              ) : null}
            </>
          }
        />
      </ProfilePageFrame>

      <EnquireModal
        open={enquireOpen}
        onClose={() => setEnquireOpen(false)}
        providerId={provider.id}
        businessName={provider.businessName}
      />
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