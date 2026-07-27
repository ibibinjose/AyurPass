"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import { SOCIAL_LABEL, type SocialLinkRow } from "@/lib/social";
import type { ProviderType } from "@/lib/types";
import { VerifiedTick } from "@/components/VerifiedTick";
import { MapPinIcon, GlobeIcon, MailIcon, PhoneIcon } from "@/components/icons";

type PreviewMode = "card" | "profile";

function DeviceChrome({
  children,
  label = "Live preview",
  right,
}: {
  children: ReactNode;
  label?: string;
  right?: ReactNode;
}) {
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">{label}</p>
        {right}
      </div>
      <div className="overflow-hidden rounded-[1.35rem] border border-hairline bg-surface shadow-[0_16px_48px_rgba(36,56,46,0.12)] ring-1 ring-black/[0.03]">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 border-b border-hairline bg-clay/40 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" aria-hidden />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" aria-hidden />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" aria-hidden />
          <span className="ml-2 flex-1 truncate rounded-md bg-surface/80 px-2 py-0.5 text-center font-mono text-[9px] font-medium text-ink-muted">
            ayurpass · discover
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: PreviewMode;
  onChange: (m: PreviewMode) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-hairline bg-surface p-0.5">
      {(
        [
          { id: "card" as const, label: "Card" },
          { id: "profile" as const, label: "Page" },
        ] as const
      ).map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors ${
            mode === opt.id ? "bg-forest text-white" : "text-ink-muted hover:text-forest"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function PlaceholderCover({ tall = false }: { tall?: boolean }) {
  return (
    <div
      className={`relative flex w-full items-end justify-center overflow-hidden bg-[linear-gradient(145deg,#1e3228_0%,#3d6650_55%,#e9d9b8_140%)] ${
        tall ? "h-36" : "h-28"
      }`}
    >
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.25), transparent 50%)" }} />
      <p className="relative mb-3 rounded-full bg-black/25 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white/90 backdrop-blur-sm">
        Add a cover photo
      </p>
    </div>
  );
}

function AvatarMark({
  name,
  imageUrl,
  size = 56,
  rounded = "xl",
  ring = true,
}: {
  name: string;
  imageUrl?: string;
  size?: number;
  rounded?: "full" | "xl";
  ring?: boolean;
}) {
  const initial = (name || "P").trim().slice(0, 1).toUpperCase() || "P";
  const radius = rounded === "full" ? "rounded-full" : "rounded-xl";
  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-clay text-center font-display font-semibold text-forest ${radius} ${
        ring ? "ring-2 ring-surface shadow-md" : "border border-hairline"
      }`}
      style={{ width: size, height: size, fontSize: size * 0.36, lineHeight: `${size}px` }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
}

export function BusinessLivePreview({
  businessName,
  type,
  about,
  city,
  country,
  logoUrl,
  coverImageUrl,
  gallery = [],
  tags = [],
  amenities = [],
  priceBand,
  contactEmail,
  contactPhone,
  website,
  openingHours,
  authorityCodes = [],
  socialRows = [],
  verified = false,
  slug,
  publicHref,
  registrationNumber,
  licenceNumber,
}: {
  businessName: string;
  type: ProviderType;
  about: string;
  city: string;
  country: string;
  logoUrl: string;
  coverImageUrl: string;
  gallery?: string[];
  tags?: string[];
  amenities?: string[];
  priceBand: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  openingHours: string;
  authorityCodes?: string[];
  socialRows?: SocialLinkRow[];
  verified?: boolean;
  slug?: string | null;
  publicHref: string;
  registrationNumber?: string;
  licenceNumber?: string;
}) {
  const [mode, setMode] = useState<PreviewMode>("card");
  const name = businessName.trim() || "Your practice";
  const typeLabel = PROVIDER_TYPE_LABEL[type] ?? type;
  const location = [city, country].filter(Boolean).join(", ");
  const tagList = tags.filter(Boolean).slice(0, 5);
  const amenityList = amenities.filter(Boolean).slice(0, 4);
  const galleryThumbs = gallery.filter(Boolean).slice(0, 4);
  const socials = socialRows.filter((r) => r.url.trim()).slice(0, 5);
  const aboutText = about.trim();

  return (
    <DeviceChrome
      label="Public preview"
      right={<ModeToggle mode={mode} onChange={setMode} />}
    >
      {mode === "card" ? (
        /* Discover-style card */
        <div className="bg-surface">
          <div className="relative">
            {coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImageUrl}
                alt=""
                className="h-[6.5rem] w-full object-cover"
              />
            ) : (
              <PlaceholderCover />
            )}
            {!logoUrl && !coverImageUrl ? null : null}
          </div>
          <div className="px-3.5 pb-4 pt-0">
            <div className="-mt-8 flex items-end justify-between gap-2">
              <AvatarMark name={name} imageUrl={logoUrl || undefined} size={56} rounded="xl" />
              {priceBand ? (
                <span className="mb-1 rounded-full bg-clay px-2 py-0.5 text-[10px] font-bold text-forest">
                  {priceBand}
                </span>
              ) : null}
            </div>

            <h3 className="mt-2.5 flex min-w-0 items-center gap-1 font-display text-[1.05rem] font-semibold leading-snug text-forest">
              <span className="min-w-0 truncate">{name}</span>
              {verified ? <VerifiedTick size="sm" /> : null}
            </h3>

            {authorityCodes.length > 0 ? (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {authorityCodes.slice(0, 3).map((code) => (
                  <span
                    key={code}
                    className="rounded-full bg-[var(--system-blue)]/10 px-1.5 py-0.5 text-[9px] font-bold text-[var(--system-blue)]"
                  >
                    {code}
                  </span>
                ))}
              </div>
            ) : null}

            <p className="mt-1 text-[11px] font-medium text-ink-secondary">
              {typeLabel}
              {priceBand ? (
                <span className="font-semibold text-foreground"> · {priceBand}</span>
              ) : null}
            </p>

            {location ? (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-ink-muted">
                <MapPinIcon className="h-3 w-3 shrink-0" />
                <span className="truncate">{location}</span>
              </p>
            ) : (
              <p className="mt-1 text-[11px] italic text-ink-muted">Add city & country…</p>
            )}

            {aboutText ? (
              <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-ink-secondary">
                {aboutText}
              </p>
            ) : (
              <p className="mt-2 text-[11px] italic text-ink-muted">About text appears here…</p>
            )}

            {tagList.length > 0 ? (
              <div className="mt-2.5 flex flex-wrap gap-1">
                {tagList.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-clay px-2 py-0.5 text-[9px] font-semibold text-ink-secondary"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-3 flex items-center justify-between border-t border-hairline pt-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">
                View practice
              </span>
              <span className="text-[11px] font-bold text-forest">→</span>
            </div>
          </div>
        </div>
      ) : (
        /* Public profile hero mini */
        <div className="bg-surface">
          <div className="relative">
            {coverImageUrl ? (
              <div className="relative h-32 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImageUrl}
                  alt=""
                  className="h-full w-full scale-105 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-surface" />
              </div>
            ) : (
              <PlaceholderCover tall />
            )}
          </div>

          <div className="relative px-3.5 pb-4">
            <div className="-mt-10 flex flex-col items-center text-center">
              <AvatarMark
                name={name}
                imageUrl={logoUrl || undefined}
                size={72}
                rounded="full"
              />
              {verified ? (
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[var(--system-blue)]/10 px-2 py-0.5 text-[9px] font-bold text-[var(--system-blue)]">
                  <VerifiedTick size="sm" /> Verified
                </span>
              ) : (
                <span className="mt-1.5 text-[9px] font-medium text-ink-muted">
                  Verification pending
                </span>
              )}

              <h3 className="mt-2 flex flex-wrap items-center justify-center gap-1 font-display text-lg font-semibold leading-tight text-forest">
                {name}
                {verified ? <VerifiedTick size="md" /> : null}
              </h3>
              {slug ? (
                <p className="mt-0.5 font-mono text-[11px] font-medium text-ink-muted">@{slug}</p>
              ) : null}
              <p className="mt-1 text-[11px] font-medium text-ink-secondary">
                {[typeLabel, priceBand, location].filter(Boolean).join(" · ") || typeLabel}
              </p>
            </div>

            {(registrationNumber || licenceNumber) && (
              <p className="mt-2 text-center text-[10px] font-medium text-ink-muted">
                {registrationNumber ? `Reg ${registrationNumber}` : null}
                {registrationNumber && licenceNumber ? " · " : null}
                {licenceNumber ? `Lic ${licenceNumber}` : null}
              </p>
            )}

            {authorityCodes.length > 0 ? (
              <div className="mt-2 flex flex-wrap justify-center gap-1">
                {authorityCodes.slice(0, 4).map((code) => (
                  <span
                    key={code}
                    className="rounded-full border border-[var(--system-blue)]/25 bg-[var(--system-blue)]/8 px-2 py-0.5 text-[9px] font-bold text-[var(--system-blue)]"
                  >
                    {code}
                  </span>
                ))}
              </div>
            ) : null}

            {aboutText ? (
              <p className="mt-3 line-clamp-3 text-center text-[11px] leading-relaxed text-ink-secondary">
                {aboutText}
              </p>
            ) : (
              <p className="mt-3 text-center text-[11px] italic text-ink-muted">
                Your about story shows here…
              </p>
            )}

            {/* Contact row */}
            {(contactEmail || contactPhone || website || openingHours) && (
              <div className="mt-3 space-y-1.5 rounded-xl bg-clay/40 px-3 py-2.5">
                {contactEmail ? (
                  <p className="flex items-center gap-1.5 truncate text-[10px] font-medium text-ink-secondary">
                    <MailIcon className="h-3 w-3 shrink-0 text-ink-muted" />
                    {contactEmail}
                  </p>
                ) : null}
                {contactPhone ? (
                  <p className="flex items-center gap-1.5 truncate text-[10px] font-medium text-ink-secondary">
                    <PhoneIcon className="h-3 w-3 shrink-0 text-ink-muted" />
                    {contactPhone}
                  </p>
                ) : null}
                {website ? (
                  <p className="flex items-center gap-1.5 truncate text-[10px] font-medium text-ink-secondary">
                    <GlobeIcon className="h-3 w-3 shrink-0 text-ink-muted" />
                    {website.replace(/^https?:\/\//, "")}
                  </p>
                ) : null}
                {openingHours ? (
                  <p className="truncate text-[10px] font-medium text-ink-muted">
                    Hours · {openingHours}
                  </p>
                ) : null}
              </div>
            )}

            {amenityList.length > 0 ? (
              <div className="mt-2.5 flex flex-wrap justify-center gap-1">
                {amenityList.map((a) => (
                  <span
                    key={a}
                    className="rounded-full border border-hairline px-2 py-0.5 text-[9px] font-semibold text-ink-secondary"
                  >
                    {a}
                  </span>
                ))}
              </div>
            ) : null}

            {tagList.length > 0 ? (
              <div className="mt-2 flex flex-wrap justify-center gap-1">
                {tagList.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-forest px-2 py-0.5 text-[9px] font-bold text-white shadow-2xs"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}

            {galleryThumbs.length > 0 ? (
              <div className="mt-3 grid grid-cols-4 gap-1">
                {galleryThumbs.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`${src}-${i}`}
                    src={src}
                    alt=""
                    className="aspect-square rounded-lg object-cover"
                  />
                ))}
              </div>
            ) : null}

            {socials.length > 0 ? (
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {socials.map((s) => (
                  <span
                    key={s.key}
                    className="rounded-full bg-forest px-2 py-0.5 text-[9px] font-bold text-white shadow-2xs"
                  >
                    {s.platform === "other"
                      ? s.label || "Link"
                      : SOCIAL_LABEL[s.platform] ?? s.platform}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-3 flex gap-2">
              <span className="flex-1 rounded-full bg-forest py-2 text-center text-[11px] font-bold text-white">
                Enquire
              </span>
              <span className="flex-1 rounded-full border border-hairline py-2 text-center text-[11px] font-bold text-forest">
                Book
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-hairline bg-clay/25 px-3 py-2.5">
        <Link
          href={publicHref}
          className="block text-center text-[11px] font-bold text-[var(--system-blue)] hover:underline"
        >
          Open full public page →
        </Link>
        <p className="mt-1 text-center text-[9px] font-medium text-ink-muted">
          Updates live after you save
        </p>
      </div>
    </DeviceChrome>
  );
}

export function SettingsLivePreview({
  fullName,
  title,
  phone,
  email,
  avatarUrl,
  authorityCodes = [],
  registrationNumber,
  licenceNumber,
  isProfessional,
}: {
  fullName: string;
  title: string;
  phone: string;
  email?: string;
  avatarUrl: string;
  authorityCodes?: string[];
  registrationNumber?: string;
  licenceNumber?: string;
  isProfessional?: boolean;
}) {
  const name = fullName.trim() || "Your name";
  const initials =
    fullName
      .split(/\s+/)
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AP";

  return (
    <DeviceChrome label="Profile preview">
      <div className="relative bg-surface">
        {/* Cover band like public practitioner page */}
        <div className="relative h-28 overflow-hidden">
          <div
            className="absolute inset-0 scale-110"
            style={{
              background:
                "var(--profile-gradient, linear-gradient(145deg,#1e3228,#3d6650,#e9d9b8))",
            }}
          />
          {avatarUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt=""
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-md"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-surface" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-surface" />
          )}
        </div>

        <div className="relative -mt-12 px-4 pb-4 text-center">
          <div className="relative mx-auto h-[5.5rem] w-[5.5rem]">
            <div className="h-full w-full overflow-hidden rounded-full border-[3px] border-surface bg-clay shadow-lg ring-2 ring-leaf/30">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-display text-2xl font-semibold text-forest">
                  {initials}
                </span>
              )}
            </div>
            <span
              className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-surface bg-leaf"
              title="Active"
              aria-hidden
            />
          </div>

          {!avatarUrl ? (
            <p className="mt-2 text-[10px] font-medium text-ink-muted">Upload a photo to complete this</p>
          ) : null}

          <h3 className="mt-2.5 font-display text-lg font-semibold leading-tight text-forest">
            {name}
          </h3>
          {title ? (
            <p className="mt-0.5 text-xs font-medium text-ink-muted">{title}</p>
          ) : isProfessional ? (
            <p className="mt-0.5 text-xs italic text-ink-muted">Add a professional title…</p>
          ) : (
            <p className="mt-0.5 text-xs font-medium text-ink-muted">AyurPass member</p>
          )}

          {email ? (
            <p className="mt-1 truncate text-[11px] font-medium text-ink-secondary">{email}</p>
          ) : null}
          {phone ? (
            <p className="mt-0.5 flex items-center justify-center gap-1 text-[11px] font-medium text-ink-secondary">
              <PhoneIcon className="h-3 w-3" />
              {phone}
            </p>
          ) : null}

          {(registrationNumber || licenceNumber) && (
            <p className="mt-2 text-[10px] font-medium text-ink-muted">
              {registrationNumber ? `Reg ${registrationNumber}` : null}
              {registrationNumber && licenceNumber ? " · " : null}
              {licenceNumber ? `Lic ${licenceNumber}` : null}
            </p>
          )}

          {authorityCodes.length > 0 ? (
            <div className="mt-3 flex flex-wrap justify-center gap-1">
              {authorityCodes.slice(0, 5).map((code) => (
                <span
                  key={code}
                  className="rounded-full bg-[var(--system-blue)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--system-blue)]"
                >
                  {code}
                </span>
              ))}
            </div>
          ) : isProfessional ? (
            <p className="mt-3 text-[10px] italic text-ink-muted">
              Authority marks appear next to your name
            </p>
          ) : null}

          <div className="mt-4 grid grid-cols-3 gap-1.5">
            {["About", "Sessions", "Reviews"].map((tab, i) => (
              <span
                key={tab}
                className={`rounded-full py-1.5 text-center text-[10px] font-bold ${
                  i === 0
                    ? "bg-forest text-white"
                    : "border border-hairline text-ink-muted"
                }`}
              >
                {tab}
              </span>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-dashed border-hairline bg-clay/30 px-3 py-3 text-left">
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">Bio</p>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-secondary">
              {title
                ? `${name} is listed as ${title} on AyurPass.`
                : "Your public bio and credentials will show on the practitioner page."}
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-hairline bg-clay/25 px-3 py-2">
        <p className="text-center text-[9px] font-medium text-ink-muted">
          How you appear on bookings & public profiles
        </p>
      </div>
    </DeviceChrome>
  );
}
