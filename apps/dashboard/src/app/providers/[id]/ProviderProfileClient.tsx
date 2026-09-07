"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";
import { trackRecentView } from "@/hooks/useRecentViews";
import { formatAddress, PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import { centerPublicPath, practiceBioPath, practicePath, practitionerPath } from "@/lib/paths";
import { SITE_URL } from "@/lib/seo";
import type {
  Product,
  Professional,
  Provider,
  ProviderProfileBundle,
  Retreat,
  Service,
} from "@/lib/types";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { ServiceCard } from "@/components/ServiceCard";
import { ProductCard } from "@/components/ProductCard";
import { RetreatCard } from "@/components/RetreatCard";
import { EnquireModal } from "@/components/EnquireModal";
import { ClaimBusinessModal } from "@/components/profile/ClaimBusinessModal";
import {
  CheckIcon,
  ExternalLinkIcon,
  MailIcon,
  MapPinIcon,
  ShieldIcon,
} from "@/components/icons";
import {
  AffiliatedPageCard,
  ProfileAboutText,
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
  ProfileShell,
  ProfileSocialStrip,
  ProfileTabs,
  ProfileThemeScope,
  ProfileAaaBadge,
  ProfileVerifiedMark,
  type ProfileLinkItem,
} from "@/components/profile/ProfilePrimitives";
import { TagAuthorityRow } from "@/components/AuthorityBadge";
import { QualityPanel } from "@/components/QualityControls";
import { authoritiesForProvider } from "@/lib/credentials";
import { hasAaaAttribution, publicContactEmail } from "@/lib/aaaDirectory";
import { brandSocialToDisplay } from "@/lib/social";

function buildPracticeLinks(brand?: Provider["brandProfile"]): ProfileLinkItem[] {
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
  const email = publicContactEmail(brand?.contactEmail);
  if (email) {
    items.push({
      kind: "email",
      label: "Email",
      sublabel: email,
      href: `mailto:${email}`,
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
  for (const s of brandSocialToDisplay(brand?.socialLinks)) {
    items.push({
      kind: "social",
      platform: s.platform,
      label: s.label,
      handle: s.handle,
      sublabel: s.handle,
      href: s.href,
    });
  }
  return items;
}

function mapsUrl(provider: Provider): string | null {
  const a = provider.address;
  const parts = [provider.businessName, a?.street, a?.city, a?.state, a?.country]
    .map((p) => p?.trim())
    .filter(Boolean);
  // Need more than just the business name for a useful map query.
  if (parts.length <= 1) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(", "))}`;
}

function hasAddress(provider: Provider): boolean {
  const a = provider.address;
  return Boolean(
    a?.street?.trim() || a?.city?.trim() || a?.state?.trim() || a?.country?.trim() || a?.postcode?.trim(),
  );
}

export default function ProviderProfilePage({
  initialProfile,
  vanityHandle,
}: {
  /** Server-loaded provider page bundle shared by /providers, /practice and vanity URLs. */
  initialProfile?: ProviderProfileBundle | null;
  /** When set, load by admin-approved root vanity handle. */
  vanityHandle?: string;
} = {}) {
  const params = useParams<{ id?: string; slug?: string; handle?: string }>();
  const slug = params.slug;
  const id = params.id;
  const rootHandle = vanityHandle || params.handle;
  const [provider, setProvider] = useState<Provider | null | undefined>(
    initialProfile?.provider ?? undefined,
  );
  const [services, setServices] = useState<Service[] | null>(
    initialProfile ? initialProfile.services : null,
  );
  const [products, setProducts] = useState<Product[] | null>(
    initialProfile ? initialProfile.products : null,
  );
  const [retreats, setRetreats] = useState<Retreat[]>(initialProfile?.retreats ?? []);
  const [team, setTeam] = useState<Professional[]>(initialProfile?.team ?? []);
  const [enquireOpen, setEnquireOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [tab, setTab] = useState("about");
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (!active) return;
      if (initialProfile) {
        setProvider(initialProfile.provider);
        setServices(initialProfile.services);
        setProducts(initialProfile.products);
        setRetreats(initialProfile.retreats);
        setTeam(initialProfile.team);
        return;
      }
      if (rootHandle && vanityHandle) {
        api
          .providerProfileByVanity(rootHandle)
          .then((profile) => {
            if (!active) return;
            setProvider(profile.provider);
            setServices(profile.services);
            setProducts(profile.products);
            setRetreats(profile.retreats);
            setTeam(profile.team);
          })
          .catch(() => {
            if (active) setProvider(null);
          });
        return;
      }
      if (!slug && !id) return;
      const loadProvider = slug ? api.providerProfileBySlug(slug) : api.providerProfile(id!);
      loadProvider
        .then((profile) => {
          if (!active) return;
          setProvider(profile.provider);
          setServices(profile.services);
          setProducts(profile.products);
          setRetreats(profile.retreats);
          setTeam(profile.team);
        })
        .catch(() => {
          if (active) setProvider(null);
        });
    };
    run();
    return () => {
      active = false;
    };
  }, [slug, id, rootHandle, vanityHandle, initialProfile]);

  useEffect(() => {
    if (!provider?.id) return;
    const providerId = provider.id;
    if (!initialProfile || initialProfile.provider.id !== providerId) {
      api.servicesByProvider(providerId).then(setServices).catch(() => setServices([]));
      api.productsByProvider(providerId).then(setProducts).catch(() => setProducts([]));
      api.retreatsByProvider(providerId).then(setRetreats).catch(() => setRetreats([]));
      api.publicProfessionalsByProvider(providerId).then(setTeam).catch(() => setTeam([]));
    }
    trackRecentView({
      kind: "provider",
      id: provider.id,
      title: provider.businessName,
      href: practicePath(provider),
      subtitle: PROVIDER_TYPE_LABEL[provider.type] ?? provider.type,
    });
  }, [provider, initialProfile]);

  // All hooks must run before any early return (stable hook order).
  const brand = provider?.brandProfile;
  // Logo/avatar only — never promote a square logo into the wide hero cover.
  const logo = resolveMediaUrl(brand?.logoUrl) ?? null;
  // Cover banner is optional; missing → designed gradient fallback in ProfileCoverBand.
  const coverUrl = resolveMediaUrl(brand?.coverImageUrl) ?? null;
  const gallery = useMemo(() => brand?.gallery?.filter(Boolean) ?? [], [brand?.gallery]);
  const linkItems = useMemo(() => buildPracticeLinks(brand), [brand]);
  const hasBookableServices = (services?.length ?? 0) > 0;
  const serviceCount = services?.length ?? 0;

  const mediaImages = useMemo(() => {
    const g: string[] = [];
    if (coverUrl) g.push(coverUrl);
    for (const img of gallery) {
      if (img && !g.includes(img)) g.push(img);
    }
    // Do not pad Media with the avatar/logo — that caused portrait stretch in the gallery.
    return g;
  }, [gallery, coverUrl]);

  const tabs = useMemo(() => {
    // Fixed order: story → media → links → catalogue → team → reviews
    const t: { id: string; label: string }[] = [{ id: "about", label: "About" }];
    if (mediaImages.length) t.push({ id: "media", label: "Media" });
    if (linkItems.length) t.push({ id: "links", label: "Links" });
    // Always surface Services & Shop once catalogue has loaded (empty state if none)
    if (services !== null) t.push({ id: "services", label: "Services" });
    if (products !== null) t.push({ id: "products", label: "Shop" });
    if (retreats.length) t.push({ id: "retreats", label: "Retreats" });
    if (team.length) t.push({ id: "team", label: "Team" });
    t.push({ id: "reviews", label: "Reviews" });
    return t;
  }, [
    mediaImages.length,
    linkItems.length,
    services,
    products,
    retreats.length,
    team.length,
  ]);

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

  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(null);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

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

  const location = hasAddress(provider) ? formatAddress(provider.address) : "";
  const mapHref = mapsUrl(provider);
  const authorities = authoritiesForProvider(provider);
  // AyurPass verified only — AAA is directory attribution, not a verified checkmark
  const verified = provider.verificationStatus === "verified";
  const aaaListed = hasAaaAttribution(authorities);
  const aaaMembership =
    authorities.find((a) => a.code.toUpperCase() === "AAA")?.registrationNumber ?? null;
  const visibleLinkItems =
    aaaListed && !verified
      ? linkItems.filter((i) => i.kind !== "book")
      : linkItems;
  const tags = brand?.tags?.filter(Boolean) ?? [];
  const amenities = brand?.amenities?.filter(Boolean) ?? [];
  const typeLabel = PROVIDER_TYPE_LABEL[provider.type] ?? provider.type;
  const memberSinceYear = provider.createdAt
    ? new Date(provider.createdAt).getFullYear()
    : null;
  const sharePath = practicePath(provider);
  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}${sharePath}` : `${SITE_URL}${sharePath}`;
  const teamCount = team.length;
  // Unclaimed AAA imports are not bookable (0 services; no external booking CTA)
  const bookHref =
    aaaListed && !verified ? null : brand?.externalBookingUrl || null;
  const handleChooseSession = () => setTab("services");
  const hours = brand?.openingHours?.trim() || null;
  const socialOnly = visibleLinkItems.filter((i) => i.kind === "social");
  const ratingValue = Number(provider.rating ?? 0);
  const reviewCount = Number(provider.reviewCount ?? 0);

  const aboutEmpty =
    !brand?.about?.trim() && tags.length === 0 && amenities.length === 0 && !hours;

  const handleSaveToPhone = () => {
    if (!provider) return;
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${provider.businessName}
TEL:${brand?.contactPhone || ""}
EMAIL:${publicContactEmail(brand?.contactEmail) || ""}
URL:${shareUrl}
END:VCARD`;
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${provider.businessName.replace(/\s+/g, "_")}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <PageWrap stickyCta={
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
    }>
      <ProfilePageFrame coverUrl={coverUrl}>
        <ProfileHeroShell>
          <ProfileAvatar
            name={provider.businessName}
            imageUrl={logo}
            size={120}
            status={verified ? "online" : "none"}
          />

          <ProfileHeroInfo>
            <div className="flex w-full min-w-0 flex-col items-center gap-2 md:items-start">
              <h1 className="flex w-full min-w-0 flex-wrap items-center justify-center gap-x-2.5 gap-y-2 text-center font-display text-[1.85rem] font-semibold leading-[1.12] tracking-tight text-forest md:justify-start md:text-left sm:text-[2.25rem]">
                <span className="min-w-0 break-words">{provider.businessName}</span>
                {verified ? <ProfileVerifiedMark size="lg" /> : null}
              </h1>
              {!verified ? (
                <button
                  type="button"
                  onClick={() => setClaimOpen(true)}
                  aria-label="Claim this Business"
                  className="inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  <ShieldIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="sm:hidden">Claim</span>
                  <span className="hidden sm:inline">Claim this Business</span>
                </button>
              ) : null}
            </div>

            <ProfileMetaLine
              parts={[
                typeLabel,
                brand?.priceBand,
                location || null,
                ratingValue > 0
                  ? `${ratingValue.toFixed(1)} ★${reviewCount ? ` · ${reviewCount}` : ""}`
                  : null,
              ]}
            />

            {tags.length > 0 || authorities.length > 0 ? (
              <div className="mt-2.5 w-full min-w-0">
                <TagAuthorityRow
                  tags={tags}
                  authorities={authorities}
                  size="md"
                  maxTags={4}
                  maxAuthorities={3}
                  linkable
                  className="justify-center md:justify-start"
                />
              </div>
            ) : null}

            {aaaListed ? (
              <div className="mt-2.5 flex w-full min-w-0 flex-wrap justify-center md:justify-start">
                <ProfileAaaBadge membership={aaaMembership} />
              </div>
            ) : null}

            {/* Social logos only in hero — full contact lives under Links */}
            {visibleLinkItems.length > 0 ? (
              <div className="mt-3">
                <ProfileSocialStrip items={visibleLinkItems} size="sm" compact />
              </div>
            ) : null}

            <ProfileActionBar
              target={{ kind: "provider", id: provider.id }}
              shareUrl={shareUrl}
              shareTitle={provider.businessName}
              shareText={`${provider.businessName} — ${typeLabel}`}
              onEnquire={() => setEnquireOpen(true)}
              bookHref={bookHref}
              onBook={hasBookableServices && !bookHref ? handleChooseSession : undefined}
              bookLabel={bookHref ? "Book online" : "Choose a session"}
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
                  {brand?.about ? (
                    <ProfileSection label="About">
                      <ProfileAboutText>{brand.about}</ProfileAboutText>
                    </ProfileSection>
                  ) : (
                    <ProfileSection label="About">
                      <div className="rounded-3xl border border-dashed border-hairline bg-clay/15 px-5 py-10 text-center sm:px-8">
                        <p className="font-display text-xl text-forest">
                          {provider.businessName}
                        </p>
                        <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-ink-secondary">
                          A {typeLabel.toLowerCase()} on AyurPass. Send an enquiry to learn more
                          about sessions and availability.
                        </p>
                        <button
                          type="button"
                          onClick={() => setEnquireOpen(true)}
                          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-deep"
                        >
                          <MailIcon className="h-4 w-4" />
                          Enquire
                        </button>
                      </div>
                    </ProfileSection>
                  )}

                  {tags.length > 0 || authorities.length > 0 ? (
                    <ProfileSection label="Focus & credentials">
                      <TagAuthorityRow
                        tags={tags}
                        authorities={authorities}
                        size="md"
                        maxTags={12}
                        maxAuthorities={6}
                        linkable
                      />
                    </ProfileSection>
                  ) : null}

                  {amenities.length > 0 ? (
                    <ProfileSection label="Amenities">
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {amenities.map((a) => (
                          <li
                            key={a}
                            className="inline-flex items-center gap-2.5 rounded-2xl border border-hairline/80 bg-surface px-3.5 py-2.5 text-sm font-medium text-ink-secondary"
                          >
                            <CheckIcon className="h-4 w-4 shrink-0 text-leaf" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </ProfileSection>
                  ) : null}

                  {(hours ||
                    provider.registrationNumber ||
                    provider.licenceNumber ||
                    memberSinceYear) && (
                    <ProfileSection label="Details">
                      <ProfileBackgroundCard>
                        {hours ? (
                          <ProfileBackgroundRow label="Hours">
                            <p className="text-sm leading-relaxed text-ink-secondary whitespace-pre-line">
                              {hours}
                            </p>
                          </ProfileBackgroundRow>
                        ) : null}
                        {provider.registrationNumber ? (
                          <ProfileBackgroundRow label="Registration">
                            <p className="font-mono text-sm text-ink-secondary">
                              {provider.registrationNumber}
                            </p>
                          </ProfileBackgroundRow>
                        ) : null}
                        {provider.licenceNumber ? (
                          <ProfileBackgroundRow label="Licence">
                            <p className="font-mono text-sm text-ink-secondary">
                              {provider.licenceNumber}
                            </p>
                          </ProfileBackgroundRow>
                        ) : null}
                        {memberSinceYear ? (
                          <ProfileBackgroundRow label="Member since">
                            <p className="text-sm text-ink-secondary">{memberSinceYear}</p>
                          </ProfileBackgroundRow>
                        ) : null}
                      </ProfileBackgroundCard>
                    </ProfileSection>
                  )}

                  {aboutEmpty ? (
                    <div className="space-y-4">
                      <ProfileEmptyState
                        title="This profile is still being completed"
                        body="This practice has not published its full details yet. Continue exploring verified wellness options, or claim this listing if you manage it."
                      />
                      <div className="flex flex-wrap justify-center gap-3">
                        <Link
                          href="/discover"
                          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-forest px-5 text-sm font-bold text-white shadow-[0_10px_20px_-14px_rgba(11,46,35,0.84)] transition-colors hover:bg-forest-deep"
                        >
                          Explore nearby care
                          <ExternalLinkIcon className="h-4 w-4" />
                        </Link>
                        {!verified ? (
                          <button
                            type="button"
                            onClick={() => setClaimOpen(true)}
                            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-forest/25 bg-surface px-5 text-sm font-bold text-forest transition-colors hover:border-leaf hover:bg-clay/50"
                          >
                            <ShieldIcon className="h-4 w-4" />
                            Claim this business
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}

              {tab === "media" ? (
                <ProfileSection label="Gallery">
                  {mediaImages.length ? (
                    <div className="profile-masonry columns-2 gap-3 sm:columns-3 sm:gap-4">
                      {mediaImages.map((src, i) => (
                        <button
                          key={`${src}-${i}`}
                          type="button"
                          onClick={() => setLightbox(src)}
                          className="mb-3 block w-full break-inside-avoid sm:mb-4"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt=""
                            loading="lazy"
                            className={`w-full rounded-2xl object-cover shadow-[0_4px_24px_rgba(0,0,0,0.07)] transition-all duration-300 hover:opacity-95 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] ${
                              i % 3 === 0
                                ? "aspect-[3/4]"
                                : i % 3 === 1
                                  ? "aspect-square"
                                  : "aspect-[4/5]"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <ProfileEmptyState
                      title="No gallery photos yet"
                      body="When this practice adds a cover or gallery, photos will appear here."
                    />
                  )}
                </ProfileSection>
              ) : null}

              {tab === "links" ? (
                <ProfileSection label="Links & social">
                  {visibleLinkItems.length ? (
                    <ProfileLinkButtons items={visibleLinkItems} />
                  ) : (
                    <ProfileEmptyState
                      title="No links yet"
                      body="Website, contact and social links will show here."
                    />
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
                    <div className="rounded-3xl border border-dashed border-hairline bg-clay/20 px-5 py-10 text-center">
                      <p className="font-display text-lg text-forest">No sessions listed yet</p>
                      <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-ink-secondary">
                        {verified
                          ? "This practice may book offline or via enquiry. Reach out to ask about availability."
                          : "This listing has not published bookable sessions yet. Send an enquiry, or claim the business if you manage it."}
                      </p>
                      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setEnquireOpen(true)}
                          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-forest px-5 text-sm font-semibold text-white"
                        >
                          Enquire about sessions
                        </button>
                        {!verified ? (
                          <button
                            type="button"
                            onClick={() => setClaimOpen(true)}
                            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-emerald-600/35 bg-emerald-50/80 px-5 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
                          >
                            <ShieldIcon className="h-4 w-4" />
                            Claim this Business
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )}
                </ProfileSection>
              ) : null}

              {tab === "products" ? (
                <ProfileSection label="Shop">
                  {products && products.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                      {products.map((p) => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                    </div>
                  ) : (
                    <ProfileEmptyState title="No products" body="Shop items will appear here." />
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

              {tab === "team" ? (
                <ProfileSection label="Practitioners">
                  {team.length ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {team.map((pro) => (
                        <AffiliatedPageCard
                          key={pro.id}
                          href={practitionerPath(pro)}
                          name={pro.user?.fullName || pro.title || "Practitioner"}
                          imageUrl={pro.user?.avatarUrl}
                          subtitle={
                            [pro.title, pro.specializations?.slice(0, 2).join(" · ")]
                              .filter(Boolean)
                              .join(" — ") || undefined
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <ProfileEmptyState title="No team listed" body="Practitioners will appear here." />
                  )}
                </ProfileSection>
              ) : null}

              {tab === "reviews" ? (
                <ProfileSection label="Quality & reviews">
                  <QualityPanel
                    target={{ type: "provider", id: provider.id }}
                    title="Practice ratings"
                    targetLabel={provider.businessName}
                  />
                </ProfileSection>
              ) : null}
            </>
          }
          sidebar={
            <>
              {/* Primary CTA — contact details live only under Links */}
              <div className="overflow-hidden rounded-[1.35rem] border border-hairline bg-surface shadow-[0_12px_40px_rgba(36,56,46,0.07)]">
                <div className="bg-[linear-gradient(145deg,var(--color-forest),var(--color-leaf))] px-5 py-5 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
                    Visit
                  </p>
                  <p className="mt-1 font-display text-xl font-semibold leading-snug">
                    {provider.businessName}
                  </p>
                  {location ? (
                    <p className="mt-2 flex items-start gap-1.5 text-sm font-medium text-white/85">
                      <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-80" />
                      <span>{location}</span>
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2 p-4">
                  <button
                    type="button"
                    onClick={() => setEnquireOpen(true)}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-forest text-sm font-semibold text-white shadow-[0_4px_16px_rgba(36,56,46,0.18)] hover:bg-forest-deep"
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

              {/* Quick stats — only when useful, no repeat of hero type/location */}
              {(teamCount > 0 || serviceCount > 0 || ratingValue > 0) && (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    teamCount > 0
                      ? { label: "Team", value: String(teamCount) }
                      : null,
                    serviceCount > 0
                      ? { label: "Sessions", value: String(serviceCount) }
                      : null,
                    ratingValue > 0
                      ? { label: "Rating", value: ratingValue.toFixed(1) }
                      : { label: "Status", value: "New" },
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
              )}

              {socialOnly.length > 0 && tab !== "links" ? (
                <div>
                  <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                    Follow
                  </p>
                  <ProfileSocialStrip items={socialOnly} size="sm" compact />
                </div>
              ) : null}

              <div className="rounded-2xl border border-hairline bg-surface px-4 py-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                    Permanent Center Link
                  </p>
                  <span className="text-[10px] font-bold uppercase text-forest bg-forest/10 px-1.5 py-0.5 rounded">
                    SEO Canonical
                  </span>
                </div>
                <p className="mt-1 text-xs font-mono text-forest font-semibold truncate">
                  {centerPublicPath(provider)}
                </p>
                <div className="mt-2.5 flex items-center gap-3">
                  <Link
                    href={centerPublicPath(provider)}
                    className="text-xs font-bold text-forest hover:underline"
                  >
                    View Center Page →
                  </Link>
                  <span className="text-ink-muted text-xs">·</span>
                  <Link
                    href={practiceBioPath(provider)}
                    className="text-xs font-medium text-ink-secondary hover:text-forest"
                  >
                    Link-in-bio
                  </Link>
                </div>
              </div>

              {!verified ? (
                <div className="rounded-2xl border border-emerald-600/30 bg-emerald-50/70 dark:bg-emerald-950/30 px-4 py-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                    <ShieldIcon className="h-4 w-4 shrink-0" />
                    <p className="text-xs font-bold uppercase tracking-wider">
                      Is this your business?
                    </p>
                  </div>
                  <p className="text-xs font-medium leading-relaxed text-ink-secondary">
                    Claim this listing to verify ownership, manage profile details, and respond to enquiries.
                  </p>
                  <button
                    type="button"
                    onClick={() => setClaimOpen(true)}
                    className="mt-2 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-full bg-emerald-700 px-4 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800 transition-colors"
                  >
                    Claim this Business
                  </button>
                </div>
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

      <ClaimBusinessModal
        open={claimOpen}
        onClose={() => setClaimOpen(false)}
        provider={provider}
      />

      {lightbox ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-forest/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Photo"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt=""
            className="max-h-[90vh] max-w-full rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 rounded-full bg-surface px-4 py-2 text-sm font-semibold text-forest"
          >
            Close
          </button>
        </div>
      ) : null}
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
      {/* Spacer so sticky CTA + bottom tabs don't cover content */}
      {stickyCta ? (
        <div className="h-16 md:hidden" aria-hidden />
      ) : null}
    </LayoutWrapper>
  );
}
