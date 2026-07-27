"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";
import { PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import { practiceBioPath, practicePath } from "@/lib/paths";
import { SITE_URL } from "@/lib/seo";
import type { BrandProfile, HealthAuthorityBadge, Provider, ProviderType } from "@/lib/types";
import { HEALTH_AUTHORITY_PRESETS, normalizeAuthorities } from "@/lib/credentials";
import {
  isReservedRootHandle,
  isValidHandle,
  normalizeHandle,
} from "@ayurpass/shared";
import {
  composeSocialUrl,
  emptySocialRow,
  extractSocialHandle,
  platformPrefixLabel,
  platformUsesHandle,
  rowsToSocialLinks,
  SOCIAL_PLATFORM_OPTIONS,
  socialLinksToRows,
  type SocialLinkRow,
} from "@/lib/social";
import {
  DashCard,
  DashFormActions,
  DashHeader,
  DashNavDot,
  DashQuickLinks,
  DashStickySave,
} from "@/components/dashboard/DashboardKit";
import { BusinessLivePreview } from "@/components/dashboard/DashboardPreview";
import { MediaField, MediaGalleryField } from "@/components/MediaField";
import { PlusIcon, TrashIcon } from "@/components/icons";
import {
  Button,
  EmptyState,
  ErrorNote,
  Field,
  Input,
  Select,
  Textarea,
  SuccessNote,
  InlineSpinner,
} from "@/components/ui";

const PROVIDER_TYPES = Object.keys(PROVIDER_TYPE_LABEL) as ProviderType[];
const PRICE_BANDS = ["$", "$$", "$$$", "$$$$"] as const;

type SectionId =
  | "identity"
  | "url"
  | "credentials"
  | "contact"
  | "location"
  | "media"
  | "social";

const SECTIONS: { id: SectionId; label: string; short: string }[] = [
  { id: "identity", label: "Identity", short: "Name, mark & cover" },
  { id: "url", label: "Public URL", short: "Custom handle" },
  { id: "credentials", label: "Credentials", short: "Licence & authorities" },
  { id: "contact", label: "Contact", short: "Reach you" },
  { id: "location", label: "Location", short: "Discover filters" },
  { id: "media", label: "Media", short: "Gallery & tags" },
  { id: "social", label: "Social", short: "Web links" },
];

const VANITY_STATUS_STYLE: Record<string, string> = {
  none: "bg-clay text-ink-muted",
  pending: "bg-gold-soft text-forest",
  approved: "bg-emerald-600 text-white",
  rejected: "bg-red-50 text-red-700",
};

function splitList(value: string): string[] {
  return Array.from(new Set(value.split(",").map((v) => v.trim()).filter(Boolean))).slice(0, 20);
}
function splitLines(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function isHttpUrl(v: string): boolean {
  if (!v.trim()) return true;
  if (v.trim().startsWith("/")) return true;
  try {
    new URL(v.trim());
    return true;
  } catch {
    return false;
  }
}

/** Comma / Enter chip list for tags & amenities. */
function ChipListField({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const items = splitList(value);

  function commit(raw: string) {
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;
    const next = Array.from(new Set([...items, ...parts])).slice(0, 20);
    onChange(next.join(", "));
    setDraft("");
  }

  return (
    <div>
      <Field label={label} optional hint={hint}>
        <div className="rounded-xl border border-hairline bg-surface px-2.5 py-2 focus-within:border-leaf focus-within:ring-2 focus-within:ring-leaf/20">
          {items.length > 0 ? (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {items.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 rounded-full bg-clay px-2.5 py-1 text-xs font-semibold text-forest"
                >
                  {item}
                  <button
                    type="button"
                    className="rounded-full text-ink-muted hover:text-red-700"
                    aria-label={`Remove ${item}`}
                    onClick={() => onChange(items.filter((t) => t !== item).join(", "))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : null}
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                commit(draft);
              } else if (e.key === "Backspace" && !draft && items.length) {
                onChange(items.slice(0, -1).join(", "));
              }
            }}
            onBlur={() => {
              if (draft.trim()) commit(draft);
            }}
            placeholder={items.length ? "Add another…" : placeholder}
            className="w-full border-0 bg-transparent px-1 py-1 text-sm font-medium text-foreground outline-none placeholder:font-normal placeholder:text-ink-muted/80"
          />
        </div>
      </Field>
    </div>
  );
}

export default function BusinessProfilePage() {
  const { user, refreshProfile } = useAuth();
  const sessionProvider = user?.provider ?? user?.professional?.provider ?? null;

  const [loaded, setLoaded] = useState<Provider | null | undefined>(undefined);
  const [section, setSection] = useState<SectionId>("identity");

  const [businessName, setBusinessName] = useState("");
  const [type, setType] = useState<ProviderType>("AYURVEDA_CLINIC");
  const [about, setAbout] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");

  const [logoUrl, setLogoUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [gallery, setGallery] = useState("");
  const [tags, setTags] = useState("");
  const [amenities, setAmenities] = useState("");
  const [externalBookingUrl, setExternalBookingUrl] = useState("");
  const [priceBand, setPriceBand] = useState("");
  const [socialRows, setSocialRows] = useState<SocialLinkRow[]>([]);

  const [registrationNumber, setRegistrationNumber] = useState("");
  const [licenceNumber, setLicenceNumber] = useState("");
  const [authorityCodes, setAuthorityCodes] = useState<string[]>([]);
  const [customAuthority, setCustomAuthority] = useState("");

  /** Root vanity handle draft (ayurpass.com/:handle) — admin must approve. */
  const [vanityHandle, setVanityHandle] = useState("");
  const [vanityStatus, setVanityStatus] = useState<string>("none");
  const [vanityReviewNote, setVanityReviewNote] = useState<string | null>(null);
  const [vanityRequestedAt, setVanityRequestedAt] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const hydrate = useCallback((p: Provider) => {
    setLoaded(p);
    setBusinessName(p.businessName);
    setType(p.type);
    setAbout(p.brandProfile?.about ?? "");
    setContactEmail(p.brandProfile?.contactEmail ?? "");
    setContactPhone(p.brandProfile?.contactPhone ?? "");
    setWebsite(p.brandProfile?.website ?? "");
    setOpeningHours(p.brandProfile?.openingHours ?? "");
    setStreet(p.address?.street ?? "");
    setCity(p.address?.city ?? "");
    setState(p.address?.state ?? "");
    setPostcode(p.address?.postcode ?? "");
    setCountry(p.address?.country ?? "");
    setTimezone(p.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "");
    setLogoUrl(resolveMediaUrl(p.brandProfile?.logoUrl) ?? p.brandProfile?.logoUrl ?? "");
    setCoverImageUrl(
      resolveMediaUrl(p.brandProfile?.coverImageUrl) ?? p.brandProfile?.coverImageUrl ?? "",
    );
    setGallery((p.brandProfile?.gallery ?? []).join("\n"));
    setTags((p.brandProfile?.tags ?? []).join(", "));
    setAmenities((p.brandProfile?.amenities ?? []).join(", "));
    setExternalBookingUrl(p.brandProfile?.externalBookingUrl ?? "");
    setPriceBand(p.brandProfile?.priceBand ?? "");
    setSocialRows(socialLinksToRows(p.brandProfile?.socialLinks));
    setRegistrationNumber(p.registrationNumber ?? "");
    setLicenceNumber(p.licenceNumber ?? "");
    setAuthorityCodes(normalizeAuthorities(p.healthAuthorities).map((a) => a.code));
    setCustomAuthority("");
    setVanityHandle(p.vanityHandle ?? "");
    setVanityStatus(p.vanityStatus ?? "none");
    setVanityReviewNote(p.vanityReviewNote ?? null);
    setVanityRequestedAt(p.vanityRequestedAt ?? null);
    setDirty(false);
  }, []);

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (!active) return;
      if (!sessionProvider) {
        setLoaded(null);
        return;
      }
      setLoaded(undefined);
      api
        .provider(sessionProvider.id)
        .then((p) => {
          if (active) hydrate(p);
        })
        .catch(() => {
          if (active) setLoaded(null);
        });
    };
    run();
    return () => {
      active = false;
    };
  }, [sessionProvider, hydrate]);

  function markDirty<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setDirty(true);
      setSaved(false);
    };
  }

  const sectionDone = useMemo(() => {
    return {
      identity: Boolean(
        businessName.trim() &&
          about.trim().length >= 40 &&
          logoUrl.trim() &&
          coverImageUrl.trim(),
      ),
      credentials: Boolean(
        registrationNumber.trim() || licenceNumber.trim() || authorityCodes.length,
      ),
      contact: Boolean(contactEmail.trim() || contactPhone.trim()),
      location: Boolean(city.trim() && country.trim()),
      url: Boolean(vanityStatus === "approved" && vanityHandle.trim()),
      media: Boolean(splitLines(gallery).length > 0 || tags.trim() || amenities.trim()),
      social: Boolean(
        website.trim() ||
          externalBookingUrl.trim() ||
          socialRows.some((r) => r.url.trim()),
      ),
    } satisfies Record<SectionId, boolean>;
  }, [
    businessName,
    about,
    registrationNumber,
    licenceNumber,
    authorityCodes,
    contactEmail,
    contactPhone,
    city,
    country,
    coverImageUrl,
    logoUrl,
    gallery,
    tags,
    amenities,
    website,
    externalBookingUrl,
    socialRows,
    vanityHandle,
    vanityStatus,
  ]);

  const completion = useMemo(() => {
    const checks = [
      Boolean(businessName.trim()),
      Boolean(about.trim().length >= 40),
      Boolean(city.trim() && country.trim()),
      Boolean(contactEmail.trim() || contactPhone.trim()),
      Boolean(logoUrl.trim()),
      Boolean(coverImageUrl.trim()),
      Boolean(registrationNumber.trim() || licenceNumber.trim() || authorityCodes.length),
      Boolean(tags.trim() || amenities.trim()),
      Boolean(website.trim() || externalBookingUrl.trim() || socialRows.some((r) => r.url.trim())),
    ];
    const done = checks.filter(Boolean).length;
    return { done, total: checks.length, pct: Math.round((done / checks.length) * 100) };
  }, [
    businessName,
    about,
    city,
    country,
    contactEmail,
    contactPhone,
    coverImageUrl,
    logoUrl,
    registrationNumber,
    licenceNumber,
    authorityCodes,
    tags,
    amenities,
    website,
    externalBookingUrl,
    socialRows,
  ]);

  const aboutLen = about.trim().length;
  const aboutHint =
    aboutLen === 0
      ? "Aim for 2–4 sentences (40+ characters)."
      : aboutLen < 40
        ? `${aboutLen}/40 characters — add a little more for Discover.`
        : `${aboutLen} characters · looks good`;

  if (!sessionProvider) {
    return (
      <EmptyState title="No practice linked" body="Business settings are for provider accounts." />
    );
  }

  if (loaded === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <InlineSpinner label="Loading business profile…" />
      </div>
    );
  }

  if (loaded === null) {
    return (
      <EmptyState
        title="Couldn't load practice"
        body="Refresh the page or try again shortly."
      />
    );
  }

  const publicHref = practicePath(loaded);
  const bioHref = practiceBioPath(loaded);
  const sectionIndex = SECTIONS.findIndex((s) => s.id === section);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionProvider) return;
    setError(null);

    const urlFields = [
      ["Website", website],
      ["Brand mark", logoUrl],
      ["Cover image", coverImageUrl],
      ["Booking link", externalBookingUrl],
      ...socialRows.map((r, i) => [`Social link ${i + 1}`, r.url] as const),
    ] as const;
    for (const [label, val] of urlFields) {
      if (!isHttpUrl(val)) {
        setError(`${label} must be a valid URL (or leave blank).`);
        if (label.startsWith("Social") || label === "Website" || label === "Booking link") {
          setSection(label === "Website" || label === "Booking link" ? "contact" : "social");
        } else if (label === "Brand mark" || label === "Cover image") {
          setSection("identity");
        } else {
          setSection("media");
        }
        return;
      }
    }
    if (!businessName.trim()) {
      setError("Business name is required.");
      setSection("identity");
      return;
    }

    const vanityNorm = vanityHandle.trim() ? normalizeHandle(vanityHandle) : "";
    if (vanityHandle.trim()) {
      if (!isValidHandle(vanityNorm)) {
        setError(
          "Custom handle must be 3–32 characters: letters, numbers, dots, underscores or hyphens.",
        );
        setSection("url");
        return;
      }
      if (isReservedRootHandle(vanityNorm)) {
        setError("That handle is reserved for AyurPass platform use. Choose another.");
        setSection("url");
        return;
      }
    }

    setBusy(true);
    setSaved(false);
    try {
      const brandProfile: BrandProfile = {
        about: about.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        website: website.trim() || undefined,
        openingHours: openingHours.trim() || undefined,
        // null clears a previously saved mark/cover on the server
        logoUrl: resolveMediaUrl(logoUrl.trim()) || logoUrl.trim() || null,
        coverImageUrl:
          resolveMediaUrl(coverImageUrl.trim()) || coverImageUrl.trim() || null,
        gallery: splitLines(gallery),
        tags: splitList(tags),
        amenities: splitList(amenities),
        externalBookingUrl: externalBookingUrl.trim() || undefined,
        priceBand: (priceBand || undefined) as BrandProfile["priceBand"],
        socialLinks: rowsToSocialLinks(socialRows),
      };
      const presetByCode = new Map(HEALTH_AUTHORITY_PRESETS.map((p) => [p.code, p]));
      const healthAuthorities: HealthAuthorityBadge[] = authorityCodes.map((code) => {
        const preset = presetByCode.get(code);
        return {
          code,
          name: preset?.name ?? code,
          region: preset?.region,
          verified: true,
        };
      });
      if (customAuthority.trim()) {
        healthAuthorities.push({
          code: customAuthority.trim().slice(0, 24),
          name: customAuthority.trim(),
          verified: false,
        });
      }

      const previousHandle = (loaded?.vanityHandle ?? "").toLowerCase();
      const handleChanged = vanityNorm !== previousHandle;
      const shouldRequestVanity =
        Boolean(vanityNorm) &&
        (handleChanged ||
          vanityStatus === "none" ||
          vanityStatus === "rejected" ||
          vanityStatus === "pending");

      const updated = await api.updateProvider(sessionProvider.id, {
        businessName: businessName.trim(),
        type,
        timezone: timezone.trim() || undefined,
        brandProfile,
        address: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          postcode: postcode.trim(),
          country: country.trim(),
        },
        registrationNumber: registrationNumber.trim() || null,
        licenceNumber: licenceNumber.trim() || null,
        healthAuthorities,
        vanityHandle: vanityNorm || null,
        requestVanity: shouldRequestVanity && Boolean(vanityNorm),
      });
      hydrate(updated);
      await refreshProfile();
      setSaved(true);
      setCustomAuthority("");
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Your business details couldn't be saved right now.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <DashHeader
        eyebrow="Practice"
        title="Business profile"
        description="Shapes your public page across Discover, search, and enquiries. Completer profiles convert more leads."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href={publicHref}
              className="inline-flex min-h-10 items-center rounded-full border border-hairline bg-surface px-4 text-sm font-semibold text-forest hover:border-leaf"
            >
              View public page
            </Link>
            <Button type="submit" form="business-form" disabled={busy || !dirty}>
              {busy ? "Saving…" : dirty ? "Save changes" : "Saved"}
            </Button>
          </div>
        }
      />

      {/* Strength + badges */}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-stretch">
        <div className="rounded-2xl border border-hairline bg-surface p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-forest">Profile strength</p>
              <p className="mt-0.5 text-xs font-medium text-ink-muted">
                {completion.pct >= 100
                  ? "Looking strong — keep media and hours fresh."
                  : "Complete each section to improve Discover ranking."}
              </p>
            </div>
            <p className="text-sm font-semibold tabular-nums text-ink-secondary">
              {completion.done}/{completion.total} · {completion.pct}%
            </p>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-clay">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                completion.pct >= 100 ? "bg-leaf" : "bg-forest"
              }`}
              style={{ width: `${completion.pct}%` }}
            />
          </div>
          {completion.pct < 100 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {SECTIONS.filter((s) => !sectionDone[s.id]).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSection(s.id)}
                  className="rounded-full border border-dashed border-hairline px-2.5 py-1 text-[11px] font-semibold text-ink-secondary hover:border-leaf hover:text-forest"
                >
                  + {s.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap content-center gap-2 rounded-2xl border border-hairline bg-surface p-4 lg:max-w-xs">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
              loaded.listingTier === "FREE_LISTING"
                ? "bg-clay text-ink-secondary"
                : "bg-forest text-white"
            }`}
          >
            {loaded.listingTier === "FREE_LISTING" ? "Discover profile" : "Bookings enabled"}
          </span>
          {loaded.verificationStatus === "verified" ? (
            <span className="inline-flex items-center rounded-full bg-[var(--system-blue)] px-3 py-1.5 text-xs font-bold text-white">
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-hairline px-3 py-1.5 text-xs font-bold text-ink-muted">
              Verification pending
            </span>
          )}
          {loaded.slug ? (
            <span className="inline-flex max-w-full items-center truncate rounded-full border border-hairline px-3 py-1.5 font-mono text-xs font-semibold text-ink-secondary">
              /practice/{loaded.slug}
            </span>
          ) : null}
        </div>
      </div>

      <DashQuickLinks
        items={[
          {
            href: "/dashboard/services",
            title: "Sessions",
            body: "Add bookable treatments",
          },
          {
            href: "/dashboard/team",
            title: "Team",
            body: "Practitioners on your roster",
          },
          {
            href: "/dashboard/settings",
            title: "Your photo",
            body: "Personal avatar & credentials",
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[13.5rem_minmax(0,1fr)_minmax(0,15.5rem)] lg:items-start">
        {/* Section nav */}
        <nav
          className="chip-scroll flex gap-1 overflow-x-auto pb-1 lg:sticky lg:top-24 lg:flex-col lg:overflow-visible lg:pb-0"
          aria-label="Profile sections"
        >
          {SECTIONS.map((s) => {
            const active = section === s.id;
            const done = sectionDone[s.id];
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2.5 text-left transition-colors lg:w-full lg:rounded-xl ${
                  active
                    ? "bg-forest text-white shadow-sm"
                    : "text-ink-secondary hover:bg-clay/70 hover:text-forest"
                }`}
              >
                <DashNavDot done={done} />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{s.label}</span>
                  <span
                    className={`hidden text-[11px] font-medium lg:block ${
                      active ? "text-white/75" : "text-ink-muted"
                    }`}
                  >
                    {s.short}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* Form */}
        <form id="business-form" onSubmit={onSubmit} className="min-w-0 space-y-4">
          {section === "identity" ? (
            <div className="space-y-4">
              <DashCard
                title="Brand mark & cover"
                description="These images define your practice on Discover cards, your public page and share previews."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <MediaField
                    label="Brand mark"
                    shape="brand"
                    value={logoUrl}
                    onChange={(url) => markDirty(setLogoUrl)(url)}
                    recommended="square · 512×512+"
                    hint="Logo or mark on cards, the profile header and directory listings. Square works best."
                  />
                  <MediaField
                    label="Cover image"
                    shape="cover"
                    value={coverImageUrl}
                    onChange={(url) => markDirty(setCoverImageUrl)(url)}
                    recommended="wide · 1600×900"
                    hint="Hero banner on your public practice page. Landscape photos look best."
                  />
                </div>
                {!logoUrl.trim() || !coverImageUrl.trim() ? (
                  <p className="mt-4 rounded-xl border border-dashed border-hairline bg-clay/25 px-3 py-2.5 text-xs font-medium leading-relaxed text-ink-muted">
                    {!logoUrl.trim() && !coverImageUrl.trim()
                      ? "Add both a brand mark and cover so seekers recognise you at a glance."
                      : !logoUrl.trim()
                        ? "Cover is set — add a brand mark for cards and the header badge."
                        : "Brand mark is set — add a cover image for a stronger public page."}
                  </p>
                ) : (
                  <p className="mt-4 text-xs font-semibold text-forest">
                    Brand visuals ready — check the live preview.
                  </p>
                )}
              </DashCard>
              <DashCard
                title="Identity"
                description="Name, type and story for your public page."
              >
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Business name" required hint="Appears on cards and search results.">
                      <Input
                        required
                        value={businessName}
                        onChange={(e) => markDirty(setBusinessName)(e.target.value)}
                        placeholder="Lotus Ayurveda Clinic"
                        autoComplete="organization"
                      />
                    </Field>
                    <Field label="Business type" required>
                      <Select
                        value={type}
                        onChange={(e) => markDirty(setType)(e.target.value as ProviderType)}
                      >
                        {PROVIDER_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {PROVIDER_TYPE_LABEL[t]}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  <Field
                    label="About"
                    required
                    hint={aboutHint}
                    error={
                      aboutLen > 0 && aboutLen < 40
                        ? "Add a few more words for a complete listing."
                        : null
                    }
                  >
                    <Textarea
                      rows={5}
                      value={about}
                      onChange={(e) => markDirty(setAbout)(e.target.value)}
                      placeholder="A serene Ayurvedic clinic offering classical Panchakarma, herbal medicine and lifestyle guidance…"
                    />
                  </Field>
                  <Field
                    label="Timezone"
                    optional
                    hint="Used for booking times on your public schedule."
                  >
                    <Input
                      value={timezone}
                      onChange={(e) => markDirty(setTimezone)(e.target.value)}
                      placeholder="Australia/Sydney"
                    />
                  </Field>
                </div>
              </DashCard>
            </div>
          ) : null}

          {section === "url" ? (
            <DashCard
              title="Public URL & custom handle"
              description="Every practice has a standard page. You can also request a short brand URL — only platform admins can approve it."
            >
              <div className="space-y-5">
                <div className="rounded-2xl border border-hairline bg-clay/25 px-4 py-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                    Your standard page (always live)
                  </p>
                  <Link
                    href={publicHref}
                    className="mt-1 block break-all font-mono text-sm font-semibold text-forest hover:underline"
                  >
                    {SITE_URL.replace(/\/$/, "")}
                    {publicHref}
                  </Link>
                  <p className="mt-1.5 text-xs font-medium text-ink-muted">
                    Uses your practice slug or ID until a custom root handle is approved.
                  </p>
                </div>

                <div className="rounded-2xl border border-leaf/25 bg-leaf/10 px-4 py-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-forest">
                    Link-in-bio (for Instagram / TikTok / etc.)
                  </p>
                  <Link
                    href={bioHref}
                    className="mt-1 block break-all font-mono text-sm font-semibold text-forest hover:underline"
                  >
                    {SITE_URL.replace(/\/$/, "")}
                    {bioHref}
                  </Link>
                  <p className="mt-1.5 text-xs font-medium leading-relaxed text-ink-muted">
                    Put this URL in your social bio — avatar, enquire, book, links, sessions and
                    products in one tall share page.
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <Link
                      href={bioHref}
                      className="inline-flex min-h-9 items-center rounded-full bg-forest px-3.5 text-xs font-bold text-white hover:bg-forest-deep"
                    >
                      Preview link-in-bio
                    </Link>
                    <button
                      type="button"
                      className="inline-flex min-h-9 items-center rounded-full border border-hairline bg-surface px-3.5 text-xs font-bold text-forest hover:border-leaf"
                      onClick={() => {
                        const url = `${SITE_URL.replace(/\/$/, "")}${bioHref}`;
                        void navigator.clipboard?.writeText(url);
                      }}
                    >
                      Copy URL
                    </button>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">Custom root handle</p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        VANITY_STATUS_STYLE[vanityStatus] ?? VANITY_STATUS_STYLE.none
                      }`}
                    >
                      {vanityStatus === "none" || !vanityStatus
                        ? "Not requested"
                        : vanityStatus}
                    </span>
                  </div>
                  <p className="mb-3 text-xs font-medium leading-relaxed text-ink-muted">
                    Request{" "}
                    <span className="font-mono text-ink-secondary">
                      {SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "")}/yourhandle
                    </span>
                    . Example:{" "}
                    <span className="font-mono text-ink-secondary">ayurpass.com/ayurholi</span>.
                    Handles are lowercase; a platform admin must approve or deny before it goes live.
                  </p>

                  <Field
                    label="Handle"
                    optional
                    hint="3–32 characters · letters, numbers, . _ -"
                  >
                    <div className="flex min-h-11 overflow-hidden rounded-xl border border-[var(--separator)] bg-surface focus-within:border-[var(--system-blue)] focus-within:ring-2 focus-within:ring-[var(--system-blue)]/20">
                      <span className="flex shrink-0 items-center border-r border-[var(--separator)] bg-clay/40 px-2.5 font-mono text-[11px] font-semibold text-ink-muted sm:px-3 sm:text-xs">
                        {SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "")}/
                      </span>
                      <input
                        type="text"
                        inputMode="text"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        value={vanityHandle}
                        onChange={(e) => {
                          // Allow typing mixed case; we normalise on save / preview.
                          markDirty(setVanityHandle)(e.target.value.replace(/\s+/g, ""));
                        }}
                        placeholder="ayurholi"
                        className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm font-medium text-foreground outline-none placeholder:text-ink-muted/70"
                        aria-label="Custom root handle"
                      />
                    </div>
                  </Field>

                  {vanityHandle.trim() ? (
                    <p className="mt-2 text-xs font-medium text-ink-muted">
                      Will request{" "}
                      <span className="font-mono font-semibold text-forest">
                        {SITE_URL.replace(/\/$/, "")}/{normalizeHandle(vanityHandle) || "…"}
                      </span>
                      {normalizeHandle(vanityHandle) &&
                      isReservedRootHandle(normalizeHandle(vanityHandle)) ? (
                        <span className="mt-1 block font-semibold text-red-700">
                          Reserved for AyurPass (ayurveda, yoga, spa, meditation, events…). Choose a
                          unique brand name instead.
                        </span>
                      ) : null}
                      {normalizeHandle(vanityHandle) &&
                      !isValidHandle(normalizeHandle(vanityHandle)) ? (
                        <span className="mt-1 block font-semibold text-red-700">
                          Handle must be 3–32 valid characters.
                        </span>
                      ) : null}
                    </p>
                  ) : null}

                  {vanityStatus === "pending" ? (
                    <p className="mt-3 rounded-xl border border-gold/30 bg-gold-soft/40 px-3 py-2.5 text-xs font-medium leading-relaxed text-forest">
                      Request submitted
                      {vanityRequestedAt
                        ? ` on ${new Date(vanityRequestedAt).toLocaleDateString()}`
                        : ""}
                      . A platform admin will approve or deny this handle. Your standard practice
                      page stays live in the meantime.
                    </p>
                  ) : null}

                  {vanityStatus === "approved" && loaded.vanityHandle ? (
                    <p className="mt-3 rounded-xl border border-emerald-600/20 bg-emerald-50 px-3 py-2.5 text-xs font-medium leading-relaxed text-emerald-900">
                      Live at{" "}
                      <Link
                        href={`/${loaded.vanityHandle}`}
                        className="font-mono font-bold underline"
                      >
                        {SITE_URL.replace(/\/$/, "")}/{loaded.vanityHandle}
                      </Link>
                      . Changing the handle sends a new request for admin approval.
                    </p>
                  ) : null}

                  {vanityStatus === "rejected" ? (
                    <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium leading-relaxed text-red-800">
                      This handle was denied
                      {vanityReviewNote ? `: ${vanityReviewNote}` : "."} Choose another handle and
                      save to re-submit.
                    </p>
                  ) : null}

                  <p className="mt-4 text-xs font-medium leading-relaxed text-ink-muted">
                    Root usernames are moderated to protect trademarks, brands and public figures.
                    See our{" "}
                    <Link href="/terms#public-profiles" className="font-semibold text-forest hover:underline">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/providers/guidelines"
                      className="font-semibold text-forest hover:underline"
                    >
                      Provider Guidelines
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </DashCard>
          ) : null}

          {section === "credentials" ? (
            <DashCard
              title="Credentials & authorities"
              description="Registration, licence and local health-authority marks show on your public profile."
            >
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Business registration number" optional>
                    <Input
                      value={registrationNumber}
                      onChange={(e) => markDirty(setRegistrationNumber)(e.target.value)}
                      placeholder="e.g. ACN or local business ID"
                    />
                  </Field>
                  <Field label="Licence number" optional>
                    <Input
                      value={licenceNumber}
                      onChange={(e) => markDirty(setLicenceNumber)(e.target.value)}
                      placeholder="e.g. council / state licence"
                    />
                  </Field>
                </div>
                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      Health authority approvals
                    </p>
                    <span className="text-xs font-medium text-ink-muted">
                      {authorityCodes.length} selected
                    </span>
                  </div>
                  <p className="mb-3 text-xs font-medium leading-relaxed text-ink-muted">
                    Tap to toggle. Hover a chip for the full authority name.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {HEALTH_AUTHORITY_PRESETS.map((preset) => {
                      const active = authorityCodes.includes(preset.code);
                      return (
                        <button
                          key={preset.code}
                          type="button"
                          title={preset.name}
                          onClick={() => {
                            setDirty(true);
                            setSaved(false);
                            setAuthorityCodes((prev) =>
                              active
                                ? prev.filter((c) => c !== preset.code)
                                : [...prev, preset.code],
                            );
                          }}
                          aria-pressed={active}
                          className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                            active
                              ? "bg-[var(--system-blue)] text-white shadow-sm"
                              : "border border-hairline bg-surface text-ink-secondary hover:border-leaf hover:text-forest"
                          }`}
                        >
                          {preset.code}
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wide ${
                              active ? "text-white/80" : "text-ink-muted"
                            }`}
                          >
                            {preset.region}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {authorityCodes.length > 0 ? (
                    <ul className="mt-3 space-y-1 rounded-xl bg-clay/40 px-3 py-2.5">
                      {authorityCodes.map((code) => {
                        const preset = HEALTH_AUTHORITY_PRESETS.find((p) => p.code === code);
                        return (
                          <li key={code} className="text-xs font-medium text-ink-secondary">
                            <span className="font-bold text-forest">{code}</span>
                            {preset ? ` — ${preset.name}` : null}
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                  <Field
                    className="mt-4"
                    label="Custom authority"
                    optional
                    hint="Body not listed above."
                  >
                    <Input
                      value={customAuthority}
                      onChange={(e) => markDirty(setCustomAuthority)(e.target.value)}
                      placeholder="e.g. State Ayurveda Council"
                    />
                  </Field>
                </div>
              </div>
            </DashCard>
          ) : null}

          {section === "contact" ? (
            <DashCard
              title="Contact"
              description="How seekers reach you from your public page."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Public email" optional hint="Shown on your listing (can differ from login).">
                  <Input
                    type="email"
                    autoComplete="email"
                    value={contactEmail}
                    onChange={(e) => markDirty(setContactEmail)(e.target.value)}
                    placeholder="hello@practice.com"
                  />
                </Field>
                <Field label="Phone" optional>
                  <Input
                    type="tel"
                    autoComplete="tel"
                    value={contactPhone}
                    onChange={(e) => markDirty(setContactPhone)(e.target.value)}
                    placeholder="+61 2 0000 0000"
                  />
                </Field>
                <Field label="Website" optional>
                  <Input
                    type="url"
                    value={website}
                    onChange={(e) => markDirty(setWebsite)(e.target.value)}
                    placeholder="https://…"
                  />
                </Field>
                <Field label="Opening hours" optional hint="Free text is fine.">
                  <Input
                    value={openingHours}
                    onChange={(e) => markDirty(setOpeningHours)(e.target.value)}
                    placeholder="Mon–Sat, 8am–7pm"
                  />
                </Field>
                <Field
                  className="sm:col-span-2"
                  label="External booking link"
                  optional
                  hint="Your own booking page if not using AyurPass checkout."
                >
                  <Input
                    type="url"
                    value={externalBookingUrl}
                    onChange={(e) => markDirty(setExternalBookingUrl)(e.target.value)}
                    placeholder="https://…"
                  />
                </Field>
              </div>
            </DashCard>
          ) : null}

          {section === "location" ? (
            <DashCard title="Location" description="Powers Discover filters and map links.">
              <div className="space-y-4">
                <Field label="Street address" optional>
                  <Input
                    autoComplete="street-address"
                    value={street}
                    onChange={(e) => markDirty(setStreet)(e.target.value)}
                    placeholder="12 Wellness Lane"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="City" required>
                    <Input
                      autoComplete="address-level2"
                      value={city}
                      onChange={(e) => markDirty(setCity)(e.target.value)}
                      placeholder="Byron Bay"
                    />
                  </Field>
                  <Field label="State / region" optional>
                    <Input
                      autoComplete="address-level1"
                      value={state}
                      onChange={(e) => markDirty(setState)(e.target.value)}
                      placeholder="NSW"
                    />
                  </Field>
                  <Field label="Postcode" optional>
                    <Input
                      autoComplete="postal-code"
                      value={postcode}
                      onChange={(e) => markDirty(setPostcode)(e.target.value)}
                      placeholder="2481"
                    />
                  </Field>
                  <Field label="Country" required>
                    <Input
                      autoComplete="country-name"
                      value={country}
                      onChange={(e) => markDirty(setCountry)(e.target.value)}
                      placeholder="Australia"
                    />
                  </Field>
                </div>
              </div>
            </DashCard>
          ) : null}

          {section === "media" ? (
            <div className="space-y-4">
              <DashCard
                title="Brand visuals"
                description="Same brand mark and cover as Identity — edit either place."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <MediaField
                    label="Brand mark"
                    shape="brand"
                    value={logoUrl}
                    onChange={(url) => markDirty(setLogoUrl)(url)}
                    recommended="square · 512×512+"
                    hint="Square logo on cards and profile header."
                  />
                  <MediaField
                    label="Cover image"
                    shape="cover"
                    value={coverImageUrl}
                    onChange={(url) => markDirty(setCoverImageUrl)(url)}
                    recommended="wide · 1600×900"
                    hint="Hero banner on your public practice page."
                  />
                </div>
                <p className="mt-3 text-xs font-medium text-ink-muted">
                  Tip: keep the brand mark high-contrast and uncluttered — it scales down on Discover.
                </p>
              </DashCard>
              <DashCard
                title="Gallery"
                description="Extra photos for treatment rooms, grounds and products."
              >
                <MediaGalleryField
                  label="Gallery photos"
                  values={splitLines(gallery)}
                  onChange={(urls) => markDirty(setGallery)(urls.join("\n"))}
                  hint="Up to 12 photos. Shown on your public page."
                  max={12}
                />
              </DashCard>
              <DashCard
                title="Discovery labels"
                description="Help seekers filter and scan your listing."
              >
                <div className="space-y-4">
                  <Field label="Price band" optional hint="Relative to local market, not exact rates.">
                    <Select
                      value={priceBand}
                      onChange={(e) => markDirty(setPriceBand)(e.target.value)}
                    >
                      <option value="">Not specified</option>
                      {PRICE_BANDS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <ChipListField
                    label="Tags"
                    hint="Press Enter or comma after each tag."
                    value={tags}
                    onChange={(v) => markDirty(setTags)(v)}
                    placeholder="Panchakarma, Vegan meals…"
                  />
                  <ChipListField
                    label="Amenities"
                    hint="Facilities seekers care about."
                    value={amenities}
                    onChange={(v) => markDirty(setAmenities)(v)}
                    placeholder="Sauna, Parking, Wi-Fi…"
                  />
                </div>
              </DashCard>
            </div>
          ) : null}

          {section === "social" ? (
            <DashCard
              title="Social & web links"
              description="Pick a platform — the site prefix is filled in. You only add your handle."
            >
              <div className="space-y-3">
                {socialRows.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-hairline bg-clay/30 px-4 py-6 text-center text-sm font-medium text-ink-muted">
                    No social links yet. Add Instagram, X, WhatsApp, or any other profile.
                  </p>
                ) : null}
                {socialRows.map((row, index) => {
                  const opt = SOCIAL_PLATFORM_OPTIONS.find((p) => p.id === row.platform);
                  const usesHandle = platformUsesHandle(row.platform);
                  const prefix = usesHandle ? platformPrefixLabel(row.platform) : "";
                  const handleValue = usesHandle
                    ? extractSocialHandle(row.platform, row.url)
                    : row.url;
                  return (
                    <div
                      key={row.key}
                      className="grid gap-2 rounded-xl border border-hairline bg-clay/15 p-3 sm:grid-cols-[minmax(0,9.5rem)_minmax(0,1fr)_auto] sm:items-end"
                    >
                      <Field label={index === 0 ? "Platform" : "\u00a0"}>
                        <Select
                          value={row.platform}
                          onChange={(e) => {
                            const platform = e.target.value as SocialLinkRow["platform"];
                            const next = SOCIAL_PLATFORM_OPTIONS.find((p) => p.id === platform);
                            setDirty(true);
                            setSaved(false);
                            setSocialRows((rows) =>
                              rows.map((r) => {
                                if (r.key !== row.key) return r;
                                // Keep handle when switching between handle-based platforms
                                const prevHandle = platformUsesHandle(r.platform)
                                  ? extractSocialHandle(r.platform, r.url)
                                  : "";
                                const nextUsesHandle = platformUsesHandle(platform);
                                const url = nextUsesHandle
                                  ? composeSocialUrl(platform, prevHandle)
                                  : r.url;
                                return {
                                  ...r,
                                  platform,
                                  label:
                                    platform === "other"
                                      ? r.label || "Link"
                                      : next?.label || r.label,
                                  url,
                                };
                              }),
                            );
                          }}
                        >
                          {SOCIAL_PLATFORM_OPTIONS.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.label}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      <div className="space-y-2">
                        {row.platform === "other" ? (
                          <Field label={index === 0 ? "Label" : "\u00a0"}>
                            <Input
                              value={row.label}
                              onChange={(e) => {
                                setDirty(true);
                                setSaved(false);
                                setSocialRows((rows) =>
                                  rows.map((r) =>
                                    r.key === row.key ? { ...r, label: e.target.value } : r,
                                  ),
                                );
                              }}
                              placeholder="e.g. WeChat, Blog, Booking widget"
                            />
                          </Field>
                        ) : null}
                        <Field
                          label={
                            index === 0 || row.platform === "other"
                              ? usesHandle
                                ? "Handle"
                                : "URL"
                              : "\u00a0"
                          }
                        >
                          {usesHandle ? (
                            <div className="flex min-h-11 overflow-hidden rounded-xl border border-[var(--separator)] bg-surface focus-within:border-[var(--system-blue)] focus-within:ring-2 focus-within:ring-[var(--system-blue)]/20">
                              <span
                                className="flex shrink-0 items-center border-r border-[var(--separator)] bg-clay/40 px-2.5 font-mono text-[11px] font-semibold text-ink-muted sm:px-3 sm:text-xs"
                                title={opt?.baseUrl}
                              >
                                {prefix}
                              </span>
                              <input
                                type="text"
                                inputMode="text"
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                                value={handleValue}
                                onChange={(e) => {
                                  setDirty(true);
                                  setSaved(false);
                                  const nextUrl = composeSocialUrl(row.platform, e.target.value);
                                  setSocialRows((rows) =>
                                    rows.map((r) =>
                                      r.key === row.key ? { ...r, url: nextUrl } : r,
                                    ),
                                  );
                                }}
                                placeholder={opt?.handlePlaceholder ?? "handle"}
                                className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm font-medium text-foreground outline-none placeholder:text-ink-muted/70"
                                aria-label={`${opt?.label ?? "Social"} handle`}
                              />
                            </div>
                          ) : (
                            <Input
                              type="url"
                              value={row.url}
                              onChange={(e) => {
                                setDirty(true);
                                setSaved(false);
                                setSocialRows((rows) =>
                                  rows.map((r) =>
                                    r.key === row.key ? { ...r, url: e.target.value } : r,
                                  ),
                                );
                              }}
                              placeholder={opt?.placeholder ?? "https://…"}
                            />
                          )}
                        </Field>
                        {usesHandle && row.url ? (
                          <p className="truncate text-[11px] font-medium text-ink-muted">
                            Saves as{" "}
                            <span className="font-mono text-ink-secondary">{row.url}</span>
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-end justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          className="!min-h-10 !px-3"
                          onClick={() => {
                            setDirty(true);
                            setSaved(false);
                            setSocialRows((rows) => rows.filter((r) => r.key !== row.key));
                          }}
                          aria-label="Remove link"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    type="button"
                    variant="soft"
                    onClick={() => {
                      setDirty(true);
                      setSaved(false);
                      setSocialRows((rows) => [...rows, emptySocialRow("instagram")]);
                    }}
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add link
                  </Button>
                  {SOCIAL_PLATFORM_OPTIONS.filter((p) => p.id !== "other")
                    .filter((p) => !socialRows.some((r) => r.platform === p.id))
                    .slice(0, 5)
                    .map((p) => (
                      <Button
                        key={p.id}
                        type="button"
                        variant="ghost"
                        className="!text-xs"
                        onClick={() => {
                          setDirty(true);
                          setSaved(false);
                          setSocialRows((rows) => [...rows, emptySocialRow(p.id)]);
                        }}
                      >
                        + {p.label}
                      </Button>
                    ))}
                </div>
                <p className="text-xs font-medium leading-relaxed text-ink-muted">
                  Instagram, X, Facebook, TikTok, LinkedIn, WhatsApp and more show the site prefix —
                  type only your handle. Use “Other” (or Google / Tripadvisor / Yelp) for a full URL.
                </p>
              </div>
            </DashCard>
          ) : null}

          <ErrorNote message={error} />
          <SuccessNote message={saved && !dirty ? "Business profile saved." : null} />

          <DashFormActions>
            <Button type="submit" disabled={busy || !dirty} className="min-h-11">
              {busy ? "Saving…" : dirty ? "Save business profile" : "All changes saved"}
            </Button>
            {dirty ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => hydrate(loaded)}
                disabled={busy}
              >
                Discard
              </Button>
            ) : null}
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-ink-muted">
                Section {sectionIndex + 1} of {SECTIONS.length}
              </span>
              {sectionIndex > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="!text-xs"
                  onClick={() => setSection(SECTIONS[sectionIndex - 1].id)}
                >
                  Back
                </Button>
              ) : null}
              {sectionIndex < SECTIONS.length - 1 ? (
                <Button
                  type="button"
                  variant="soft"
                  onClick={() => setSection(SECTIONS[sectionIndex + 1].id)}
                >
                  Next section
                </Button>
              ) : null}
            </div>
          </DashFormActions>
        </form>

        {/* Live preview */}
        <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
          <BusinessLivePreview
            businessName={businessName}
            type={type}
            about={about}
            city={city}
            country={country}
            logoUrl={logoUrl}
            coverImageUrl={coverImageUrl}
            gallery={splitLines(gallery)}
            tags={splitList(tags)}
            amenities={splitList(amenities)}
            priceBand={priceBand}
            contactEmail={contactEmail}
            contactPhone={contactPhone}
            website={website}
            openingHours={openingHours}
            authorityCodes={
              customAuthority.trim()
                ? [...authorityCodes, customAuthority.trim().slice(0, 24)]
                : authorityCodes
            }
            socialRows={socialRows}
            verified={
              loaded.verificationStatus === "verified" ||
              authorityCodes.some((c) => c.toUpperCase() === "AAA")
            }
            slug={loaded.slug}
            publicHref={publicHref}
            registrationNumber={registrationNumber}
            licenceNumber={licenceNumber}
          />
        </aside>
      </div>

      {/* Mobile preview (below form) */}
      <div className="lg:hidden">
        <BusinessLivePreview
          businessName={businessName}
          type={type}
          about={about}
          city={city}
          country={country}
          logoUrl={logoUrl}
          coverImageUrl={coverImageUrl}
          gallery={splitLines(gallery)}
          tags={splitList(tags)}
          amenities={splitList(amenities)}
          priceBand={priceBand}
          contactEmail={contactEmail}
          contactPhone={contactPhone}
          website={website}
          openingHours={openingHours}
          authorityCodes={
            customAuthority.trim()
              ? [...authorityCodes, customAuthority.trim().slice(0, 24)]
              : authorityCodes
          }
          socialRows={socialRows}
          verified={
            loaded.verificationStatus === "verified" ||
            authorityCodes.some((c) => c.toUpperCase() === "AAA")
          }
          slug={loaded.slug}
          publicHref={publicHref}
          registrationNumber={registrationNumber}
          licenceNumber={licenceNumber}
        />
      </div>

      <DashStickySave
        dirty={dirty}
        busy={busy}
        formId="business-form"
        onDiscard={() => hydrate(loaded)}
        label="Save profile"
        message="Unsaved business changes"
      />
    </div>
  );
}
