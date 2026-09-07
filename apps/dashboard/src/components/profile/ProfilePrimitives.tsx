"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  DislikeIcon,
  ExternalLinkIcon,
  GlobeIcon,
  HeartIcon,
  LinkIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
  ShareIcon,
  ShieldIcon,
  UsersIcon,
} from "@/components/icons";
import { SocialBrandBadge } from "@/components/SocialBrandIcon";
import { useEngagement } from "@/hooks/useEngagement";
import { useQuality } from "@/hooks/useQuality";
import type { EngagementTarget } from "@/lib/engagement";
import {
  PROFILE_ACCENTS,
  accentById,
  getStoredAccentId,
  setStoredAccentId,
  type ProfileAccentId,
} from "@/lib/profile-theme";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const actionBtn =
  "profile-spring inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-all sm:px-5";
const actionPrimary = `${actionBtn} bg-[var(--profile-accent,var(--forest))] text-white shadow-[0_4px_14px_rgba(0,0,0,0.12)] hover:brightness-110 active:scale-[0.97]`;
const actionOutline = `${actionBtn} border border-[var(--separator)] bg-surface/90 text-foreground backdrop-blur-sm hover:bg-[var(--fill-secondary)] active:scale-[0.97]`;
const actionActive = `${actionBtn} border-transparent bg-[var(--profile-accent-soft,var(--fill-secondary))] text-[var(--profile-accent,var(--forest))] active:scale-[0.97]`;
const actionLikeActive = `${actionBtn} border-transparent bg-red-50 text-red-600 active:scale-[0.97]`;

/** Neo-minimal section with accent overline. */
export function ProfileSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5 animate-[profile-enter_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
      <p
        className="text-[11px] font-bold uppercase tracking-[0.16em]"
        style={{ color: "var(--profile-accent, var(--gold))" }}
      >
        {label}
      </p>
      {children}
    </section>
  );
}

export function ProfileChip({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  const className =
    "rounded-full border border-hairline bg-clay/50 px-3.5 py-1.5 text-sm text-ink-secondary transition-colors hover:border-leaf/30 hover:bg-clay";
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {label}
      </button>
    );
  }
  return <span className={className}>{label}</span>;
}

export interface ProfileLinkItem {
  label: string;
  sublabel?: string;
  href: string;
  external?: boolean;
  kind?: "website" | "email" | "phone" | "social" | "book" | "internal";
  /** Social platform id for brand logos (instagram, x, …). */
  platform?: string;
  /** @handle or phone for social links. */
  handle?: string;
}

function LinkRowIcon({ item }: { item: ProfileLinkItem }) {
  const key = `${item.kind ?? ""} ${item.label}`.toLowerCase();
  const box = "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-clay/80 text-forest";
  if (item.kind === "social" || item.platform) {
    return <SocialBrandBadge platform={item.platform || "other"} size="md" />;
  }
  if (key.includes("email") || key.includes("mail")) {
    return (
      <span aria-hidden className={box}>
        <MailIcon className="h-5 w-5" />
      </span>
    );
  }
  if (key.includes("call") || key.includes("phone")) {
    return (
      <span aria-hidden className={box}>
        <PhoneIcon className="h-5 w-5" />
      </span>
    );
  }
  if (key.includes("book")) {
    return (
      <span aria-hidden className={box}>
        <CalendarIcon className="h-5 w-5" />
      </span>
    );
  }
  if (key.includes("website") || key.includes("aaa")) {
    return (
      <span aria-hidden className={`${box} bg-[var(--profile-accent,var(--forest))] text-white`}>
        <GlobeIcon className="h-5 w-5" />
      </span>
    );
  }
  if (item.external !== false && item.href.startsWith("http")) {
    return (
      <span aria-hidden className={box}>
        <ExternalLinkIcon className="h-5 w-5" />
      </span>
    );
  }
  return (
    <span aria-hidden className={box}>
      <LinkIcon className="h-5 w-5" />
    </span>
  );
}

const linkRowClass =
  "profile-spring group flex items-center gap-3.5 rounded-2xl border border-[var(--separator)] bg-surface/95 px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:border-[var(--profile-accent,var(--leaf))]/30 hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)] active:translate-y-0 sm:px-5 sm:py-4";

function hostnameOf(href: string): string | null {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function ContactLinkRow({ item }: { item: ProfileLinkItem }) {
  const host = item.href.startsWith("http") ? hostnameOf(item.href) : null;
  const sub = item.handle || item.sublabel || host;
  const inner = (
    <>
      <LinkRowIcon item={item} />
      <span className="min-w-0 flex-1 text-left">
        <span className="block font-semibold text-foreground transition-colors group-hover:text-[var(--profile-accent,var(--forest))]">
          {item.label}
        </span>
        {sub ? (
          <span className="mt-0.5 block truncate text-sm font-medium text-ink-muted">{sub}</span>
        ) : null}
      </span>
      <ExternalLinkIcon className="h-4 w-4 shrink-0 text-ink-muted opacity-50 transition-opacity group-hover:opacity-100" />
    </>
  );
  if (item.external !== false && item.href.startsWith("http")) {
    return (
      <a href={item.href} target="_blank" rel="noreferrer" className={linkRowClass}>
        {inner}
      </a>
    );
  }
  if (item.href.startsWith("mailto:") || item.href.startsWith("tel:")) {
    return (
      <a href={item.href} className={linkRowClass}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={item.href} className={linkRowClass}>
      {inner}
    </Link>
  );
}

/**
 * Social follow strip — brand logos + handles.
 * `compact`: logo-only circles (hero). Default: logo + handle (Links tab).
 */
export function ProfileSocialStrip({
  items,
  size = "md",
  compact = false,
}: {
  items: ProfileLinkItem[];
  size?: "sm" | "md";
  compact?: boolean;
}) {
  const social = items.filter((i) => i.kind === "social" && i.href);
  if (!social.length) return null;
  const badgeSize = size === "sm" ? "sm" : "md";

  if (compact) {
    return (
      <ul className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
        {social.map((item) => {
          const platform = item.platform || "other";
          const handle = item.handle || item.label;
          return (
            <li key={`${platform}-${item.href}`}>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="profile-spring block rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.08)] ring-2 ring-white transition-transform hover:-translate-y-0.5 hover:scale-105"
                title={`${item.label}${handle ? ` · ${handle}` : ""}`}
                aria-label={`${item.label}${handle ? ` ${handle}` : ""}`}
              >
                <SocialBrandBadge
                  platform={platform}
                  size={badgeSize}
                  className="!rounded-full"
                />
              </a>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
      {social.map((item) => {
        const platform = item.platform || "other";
        const handle = item.handle || item.sublabel || item.label;
        return (
          <li key={`${platform}-${item.href}`}>
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="profile-spring group flex items-center gap-3 rounded-2xl border border-[var(--separator)] bg-surface px-3 py-3 shadow-[0_1px_0_rgba(0,0,0,0.03)] transition-all hover:-translate-y-0.5 hover:border-[var(--profile-accent,var(--leaf))]/35 hover:shadow-[0_10px_28px_rgba(36,56,46,0.08)]"
              title={`${item.label}${handle ? ` · ${handle}` : ""}`}
              aria-label={`${item.label}${handle ? ` ${handle}` : ""}`}
            >
              <SocialBrandBadge
                platform={platform}
                size="md"
                className="shadow-sm ring-2 ring-white/90"
              />
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                  {item.label}
                </span>
                <span className="mt-0.5 block truncate font-mono text-sm font-semibold text-forest">
                  {handle}
                </span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Links & social — contact once as rows; social as brand cards (logo + handle).
 */
export function ProfileLinkButtons({ items }: { items: ProfileLinkItem[] }) {
  if (items.length === 0) return null;
  const social = items.filter((i) => i.kind === "social");
  const rest = items.filter((i) => i.kind !== "social");

  return (
    <div className="space-y-8">
      {rest.length > 0 ? (
        <div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--profile-accent,var(--gold))]">
            Contact
          </p>
          <div className="flex flex-col gap-2.5">
            {rest.map((item) => (
              <ContactLinkRow key={`${item.label}-${item.href}`} item={item} />
            ))}
          </div>
        </div>
      ) : null}

      {social.length > 0 ? (
        <div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--profile-accent,var(--gold))]">
            Social
          </p>
          <ProfileSocialStrip items={social} size="md" />
        </div>
      ) : null}
    </div>
  );
}

/** All hero actions in one row — Enquire · Book · Follow · Like · Dislike · Share. */
export function ProfileActionBar({
  target,
  shareUrl,
  shareTitle,
  shareText,
  onEnquire,
  bookHref,
  onBook,
  bookLabel,
  enquireDisabled,
  onOpenReviews,
  onSaveToPhone,
}: {
  target: EngagementTarget;
  shareUrl: string;
  shareTitle: string;
  shareText?: string;
  onEnquire: () => void;
  bookHref?: string | null;
  /** Opens a local session selector when a profile has bookable services. */
  onBook?: () => void;
  /** Describes the next booking decision, such as "Choose a session". */
  bookLabel?: string;
  enquireDisabled?: boolean;
  /** Jump to reviews / rate panel */
  onOpenReviews?: () => void;
  onSaveToPhone?: () => void;
}) {
  const { following, onFollow, canEngage } = useEngagement(target);
  const qualityTarget = { type: target.kind, id: target.id };
  const { summary, busy: qualityBusy, setReaction } = useQuality(qualityTarget);

  const liked = summary?.myReaction === "like";
  const disliked = summary?.myReaction === "dislike";
  const likeCount = summary?.likeCount ?? 0;
  const dislikeCount = summary?.dislikeCount ?? 0;
  const rating = summary?.rating ?? 0;
  const reviewCount = summary?.reviewCount ?? 0;

  async function share() {
    const payload = { title: shareTitle, text: shareText ?? shareTitle, url: shareUrl };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        /* user cancelled — fall through to clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      /* clipboard unavailable */
    }
  }

  // When there's nothing bookable, surface Enquire as the primary conversion action.
  const enquirePrimary = !bookHref && !onBook;

  return (
    <div className="mt-4 space-y-2.5">
      {(rating > 0 || reviewCount > 0) && (
        <button
          type="button"
          onClick={onOpenReviews}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-secondary hover:text-forest"
        >
          <span className="text-gold">★</span>
          <span className="tabular-nums">{rating > 0 ? Number(rating).toFixed(1) : "—"}</span>
          <span className="font-medium text-ink-muted">
            ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
          </span>
          {onOpenReviews ? (
            <span className="text-xs font-bold text-[var(--system-blue)]">Rate · Review</span>
          ) : null}
        </button>
      )}
      <div className="flex w-full max-w-full gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={onEnquire}
          disabled={enquireDisabled}
          className={`${enquirePrimary ? actionPrimary : actionOutline} disabled:opacity-50`}
        >
          <MailIcon className="h-4 w-4" />
          Enquire
        </button>
        {onBook ? (
          <button type="button" onClick={onBook} className={actionPrimary}>
            <CalendarIcon className="h-4 w-4" />
            {bookLabel ?? "Choose a session"}
          </button>
        ) : bookHref ? (
          bookHref.startsWith("http") ? (
            <a
              href={bookHref}
              target="_blank"
              rel="noreferrer"
              className={actionPrimary}
            >
              <CalendarIcon className="h-4 w-4" />
              {bookLabel ?? "Book"}
            </a>
          ) : (
            <Link href={bookHref} className={actionPrimary}>
              <CalendarIcon className="h-4 w-4" />
              {bookLabel ?? "Book"}
            </Link>
          )
        ) : null}
        <button
          type="button"
          onClick={onFollow}
          className={following ? actionActive : actionOutline}
          aria-pressed={following}
          title={canEngage ? undefined : "Sign in to follow"}
        >
          {following ? <CheckIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
          {following ? "Following" : "Follow"}
        </button>
        <button
          type="button"
          disabled={qualityBusy}
          onClick={() => void setReaction("like")}
          className={liked ? actionLikeActive : actionOutline}
          aria-pressed={liked}
          title={canEngage ? "Like" : "Sign in to like"}
          aria-label={canEngage ? `Like${likeCount ? ` (${likeCount})` : ""}` : "Sign in to like"}
        >
          <HeartIcon className="h-4 w-4" filled={liked} />
          {likeCount > 0 ? (
            <span className="tabular-nums text-xs font-bold">{likeCount}</span>
          ) : null}
        </button>
        <button
          type="button"
          disabled={qualityBusy}
          onClick={() => void setReaction("dislike")}
          className={
            disliked
              ? `${actionBtn} !gap-0 !px-3 border-transparent bg-red-50 text-red-700`
              : `${actionOutline} !gap-0 !px-3`
          }
          aria-pressed={disliked}
          title={canEngage ? "Dislike" : "Sign in to dislike"}
          aria-label={
            canEngage ? `Dislike${dislikeCount ? ` (${dislikeCount})` : ""}` : "Sign in to dislike"
          }
        >
          <DislikeIcon className="h-4 w-4" filled={disliked} />
        </button>
        {onOpenReviews ? (
          <button type="button" onClick={onOpenReviews} className={actionOutline}>
            ★ Rate
          </button>
        ) : null}
        {onSaveToPhone ? (
          <button type="button" onClick={onSaveToPhone} className={actionOutline}>
            <PhoneIcon className="h-4 w-4" />
            Save to Phone
          </button>
        ) : null}
        <button type="button" onClick={() => void share()} className={actionOutline}>
          <ShareIcon className="h-4 w-4" />
          Share
        </button>
      </div>
    </div>
  );
}

/** How the profile looks when shared — CulturePass SharePreview. */
export function ProfileSharePreview({
  title,
  description,
  path,
  imageUrl,
}: {
  title: string;
  description?: string | null;
  path: string;
  imageUrl?: string | null;
}) {
  const urlLabel = path.startsWith("http") ? path.replace(/^https?:\/\//, "") : `${SITE_URL.replace(/^https?:\/\//, "")}${path}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-surface shadow-[0_4px_20px_rgba(36,56,46,0.06)]">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="h-[140px] w-full object-cover" />
      ) : (
        <div className="flex h-[100px] items-center justify-center border-b border-hairline bg-clay/50">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
            {SITE_NAME}
          </span>
        </div>
      )}
      <div className="space-y-1 px-4 py-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
          {SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </p>
        <p className="font-display text-sm font-semibold leading-snug text-foreground">{title}</p>
        {description ? (
          <p className="line-clamp-2 text-xs leading-5 text-ink-secondary">{description}</p>
        ) : null}
        <p className="truncate pt-1 font-mono text-[11px] text-ink-muted">{urlLabel}</p>
      </div>
    </div>
  );
}

export function AffiliatedPageCard({
  href,
  name,
  imageUrl,
  subtitle,
}: {
  href: string;
  name: string;
  imageUrl?: string | null;
  subtitle?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3.5 shadow-[0_1px_0_rgba(36,56,46,0.04)] transition-all hover:-translate-y-px hover:border-leaf/35 hover:shadow-[0_6px_20px_rgba(36,56,46,0.06)]"
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl border border-hairline object-cover" />
      ) : (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-clay text-forest">
          <UsersIcon className="h-5 w-5" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-foreground group-hover:text-forest">{name}</span>
        {subtitle ? (
          <span className="block truncate text-xs text-ink-muted">{subtitle}</span>
        ) : null}
      </span>
      <ArrowRightIcon className="h-4 w-4 shrink-0 text-ink-muted" />
    </Link>
  );
}

export function ProfileAffiliationPill({
  href,
  name,
  imageUrl,
}: {
  href: string;
  name: string;
  imageUrl?: string | null;
}) {
  return (
    <Link
      href={href}
      className="mt-2 inline-flex max-w-full items-center gap-2 rounded-full border border-hairline bg-clay/40 py-1 pl-1 pr-3.5 text-sm text-ink-secondary transition-colors hover:border-leaf/40 hover:bg-clay/70"
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="h-6 w-6 rounded-full border border-hairline/50 object-cover" />
      ) : (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-soft text-[10px] text-forest">
          ✦
        </span>
      )}
      <span className="truncate font-medium">{name}</span>
    </Link>
  );
}

/**
 * Avatar with optional glowing activity ring (neo-vibe status).
 * Ring uses profile accent CSS variables.
 */
export function ProfileAvatar({
  name,
  imageUrl,
  hubLogoUrl,
  size = 120,
  status = "online",
}: {
  name: string;
  imageUrl?: string | null;
  hubLogoUrl?: string | null;
  size?: number;
  status?: "online" | "offline" | "none";
}) {
  const [imgBroken, setImgBroken] = useState(false);
  const [hubBroken, setHubBroken] = useState(false);

  useEffect(() => {
    setImgBroken(false);
  }, [imageUrl]);
  useEffect(() => {
    setHubBroken(false);
  }, [hubLogoUrl]);

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const ringPad = status === "none" ? 0 : 5;
  const outer = size + ringPad * 2;
  const showPhoto = Boolean(imageUrl?.trim()) && !imgBroken;

  return (
    <div
      className="relative shrink-0"
      style={{ width: outer, height: outer }}
    >
      {status !== "none" ? (
        <span
          aria-hidden
          className={`profile-status-ring absolute inset-0 rounded-full ${
            status === "online" ? "profile-status-ring--live" : ""
          }`}
          style={{
            background: `conic-gradient(from 210deg, var(--profile-accent, #22a06b), #ffe08a, var(--profile-accent, #22a06b))`,
            padding: ringPad,
          }}
        >
          <span className="block h-full w-full rounded-full bg-surface" />
        </span>
      ) : null}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.14)] ring-4 ring-surface"
        style={{ width: size, height: size }}
      >
        {showPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl!}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setImgBroken(true)}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center font-display text-2xl text-white"
            style={{ background: "var(--profile-gradient, linear-gradient(145deg,#1e3228,#3d6650))" }}
            aria-hidden
          >
            {initials || <UsersIcon className="h-10 w-10" />}
          </div>
        )}
      </div>
      {hubLogoUrl && !hubBroken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hubLogoUrl}
          alt=""
          className="absolute bottom-0.5 right-0.5 z-[1] h-10 w-10 rounded-full border-[3px] border-surface object-cover shadow-md"
          onError={() => setHubBroken(true)}
        />
      ) : null}
    </div>
  );
}

export function ProfileMetaBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-forest">
      {label}
    </span>
  );
}

export { VerifiedTick as ProfileVerifiedMark } from "@/components/VerifiedTick";

export function ProfileMetaRow({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:justify-start">
      {children}
    </div>
  );
}

/**
 * Single compact meta line — e.g.
 * Ayurveda Clinic · Australia · Member since 2026 · 1 practitioner
 */
export function ProfileMetaLine({ parts }: { parts: (string | null | undefined | false)[] }) {
  const clean = parts.map((p) => (typeof p === "string" ? p.trim() : "")).filter(Boolean);
  if (!clean.length) return null;
  return (
    <p className="mt-1.5 max-w-xl text-sm font-medium leading-relaxed text-ink-secondary md:text-[0.9375rem]">
      {clean.map((part, i) => (
        <span key={`${part}-${i}`}>
          {i > 0 ? <span className="mx-1.5 text-ink-muted/50" aria-hidden>·</span> : null}
          <span className="text-ink-secondary">{part}</span>
        </span>
      ))}
    </p>
  );
}

export function ProfileMetaItem({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
      {icon}
      {children}
    </span>
  );
}

export function ProfileLocationMeta({ location, mapUrl }: { location: string; mapUrl?: string | null }) {
  return (
    <ProfileMetaItem icon={<MapPinIcon className="h-3.5 w-3.5 shrink-0 text-ink-muted" />}>
      {mapUrl ? (
        <a href={mapUrl} target="_blank" rel="noreferrer" className="hover:text-forest hover:underline">
          {location}
        </a>
      ) : (
        location
      )}
    </ProfileMetaItem>
  );
}

export function ProfileMemberSince({ year }: { year: number }) {
  return (
    <ProfileMetaItem icon={<CalendarIcon className="h-3.5 w-3.5 shrink-0 text-ink-muted" />}>
      Member since {year}
    </ProfileMetaItem>
  );
}

export function ProfileAaaBadge(props?: { membership?: string | null }) {
  const tier = props?.membership?.trim();
  return (
    <span
      className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-full border border-leaf/30 bg-leaf/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-forest"
      title="Listed in the Australian Association of Ayurveda (AAA) public directory — not an AyurPass verification mark"
    >
      <ShieldIcon className="h-3.5 w-3.5 shrink-0 text-leaf" />
      <span>Listed in the AAA directory</span>
      {tier ? (
        <span className="font-medium normal-case text-ink-secondary">· {tier}</span>
      ) : null}
    </span>
  );
}

export function ProfileStatsLine({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-ink-muted md:justify-start">
      {children}
    </div>
  );
}

export function ProfileStat({ value, label }: { value: string | number; label: string }) {
  return (
    <>
      <span>
        <span className="font-semibold text-foreground">{value}</span> {label}
      </span>
    </>
  );
}

export function ProfileStatSep() {
  return <span className="text-ink-muted/40">·</span>;
}

export function ProfileShell({ children }: { children: ReactNode }) {
  return (
    <div className="profile-shell mx-auto w-full max-w-[1040px] overflow-hidden rounded-[1.75rem] border border-[var(--separator)] bg-surface/95 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:rounded-[2rem]">
      {children}
    </div>
  );
}

export function ProfileHeroShell({ children }: { children: ReactNode }) {
  return (
    <header className="relative z-[1] flex flex-col items-center gap-6 px-5 pb-8 pt-2 sm:px-8 sm:pb-10 md:flex-row md:items-end md:gap-9 md:pt-0">
      {children}
    </header>
  );
}

export function ProfileHeroInfo({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-col items-center gap-2 text-center md:flex-1 md:items-start md:gap-1.5 md:pb-1 md:text-left">
      {children}
    </div>
  );
}

export function ProfileBodyGrid({ main, sidebar }: { main: ReactNode; sidebar: ReactNode }) {
  return (
    <div className="relative z-[1] flex flex-col gap-10 border-t border-[var(--separator)] px-5 pb-8 pt-8 sm:px-8 sm:pb-10 md:flex-row md:items-start md:gap-12 md:pt-10">
      <div className="flex min-w-0 flex-1 flex-col gap-9">{main}</div>
      <aside className="flex w-full flex-col gap-8 md:sticky md:top-28 md:w-[300px] md:shrink-0">
        {sidebar}
      </aside>
    </div>
  );
}

/** Sliding pill tabs — sticky under the app nav for fluid section switching. */
export function ProfileTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="profile-tabs-sticky sticky top-[calc(3.5rem+var(--safe-top)+0.25rem)] z-30 -mx-1 px-1 py-1 sm:top-[calc(4rem+var(--safe-top)+0.25rem)]">
      <div
        className="chip-scroll flex gap-1 overflow-x-auto rounded-full border border-[var(--separator)] bg-surface/90 p-1 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl"
        role="tablist"
      >
        {tabs.map((t) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(t.id)}
              className={`profile-spring min-h-10 shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                selected
                  ? "bg-[var(--profile-accent,var(--forest))] text-white shadow-[0_2px_10px_rgba(0,0,0,0.12)]"
                  : "text-ink-muted hover:text-foreground"
              }`}
            >
              {t.label}
              {t.count != null ? (
                <span className={`ml-1.5 text-xs ${selected ? "text-white/80" : "opacity-70"}`}>
                  {t.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Tall masonry media grid for gallery immersion. */
export function ProfileMediaMasonry({ images }: { images: string[] }) {
  if (!images.length) return null;
  return (
    <div className="profile-masonry columns-2 gap-3 sm:columns-3 sm:gap-4">
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${src}-${i}`}
          src={src}
          alt=""
          loading="lazy"
          className={`mb-3 w-full break-inside-avoid rounded-2xl object-cover shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:mb-4 ${
            i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/5]"
          }`}
        />
      ))}
    </div>
  );
}

/** Built-in accent theme picker for the profile surface. */
export function ProfileThemePicker({
  value,
  onChange,
}: {
  value: ProfileAccentId;
  onChange: (id: ProfileAccentId) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
        Theme accent
      </p>
      <div className="flex flex-wrap gap-2" role="listbox" aria-label="Profile accent">
        {PROFILE_ACCENTS.map((a) => {
          const selected = a.id === value;
          return (
            <button
              key={a.id}
              type="button"
              role="option"
              aria-selected={selected}
              title={a.label}
              onClick={() => onChange(a.id)}
              className={`profile-spring flex flex-col items-center gap-1 rounded-2xl px-1.5 py-1 transition-transform ${
                selected ? "scale-[1.02]" : "hover:scale-[1.03]"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.12)] ring-offset-2 ring-offset-surface ${
                  selected ? "ring-2 ring-[var(--system-blue)]" : "ring-1 ring-black/5"
                }`}
                style={{ background: a.gradient }}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full shadow-sm ring-2 ring-white/80"
                  style={{ background: a.primary }}
                  aria-hidden
                />
              </span>
              <span
                className={`text-[10px] font-bold ${
                  selected ? "text-foreground" : "text-ink-muted"
                }`}
              >
                {a.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Applies accent CSS vars to a profile tree + persists choice. */
export function ProfileThemeScope({ children }: { children: ReactNode }) {
  const [accentId, setAccentId] = useState<ProfileAccentId>("forest");

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (active) {
        setAccentId(getStoredAccentId());
      }
    };
    run();
    return () => {
      active = false;
    };
  }, []);

  const accent = accentById(accentId);

  return (
    <div
      className="profile-theme-scope"
      style={
        {
          "--profile-accent": accent.primary,
          "--profile-accent-soft": accent.soft,
          "--profile-gradient": accent.gradient,
        } as CSSProperties
      }
    >
      {children}
      <div className="border-t border-[var(--separator)] px-5 py-5 sm:px-8">
        <ProfileThemePicker
          value={accentId}
          onChange={(id) => {
            setAccentId(id);
            setStoredAccentId(id);
          }}
        />
      </div>
    </div>
  );
}

export function ProfileBackgroundCard({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-5 divide-y divide-hairline/70 rounded-2xl border border-hairline bg-surface p-5 shadow-[0_2px_12px_rgba(36,56,46,0.04)]">
      {children}
    </div>
  );
}

export function ProfileBackgroundRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5 first:pt-0 last:pb-0 [&:not(:first-child)]:pt-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">{label}</p>
      {children}
    </div>
  );
}

export function ProfileAboutText({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-prose whitespace-pre-line text-[17px] leading-[1.75] text-ink-secondary">
      {children}
    </p>
  );
}

export function ProfileEmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-hairline bg-clay/25 px-6 py-12">
      <p className="font-display text-xl text-foreground">{title}</p>
      <p className="max-w-sm text-center text-sm leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}

/**
 * Immersive fluid hero cover — blurred photo or accent gradient with soft fade.
 * Optional `parallaxY` (px) for scroll-linked depth.
 */
function GenericCoverGradient({ parallaxY = 0 }: { parallaxY?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-44 overflow-hidden sm:h-56"
    >
      <div
        className="absolute inset-0 scale-110 will-change-transform"
        style={{
          background:
            "var(--profile-gradient, linear-gradient(145deg,#1e3228 0%,#3d6650 48%,#c4a574 120%))",
          transform: `translate3d(0, ${parallaxY * 0.35}px, 0)`,
        }}
      />
      {/* Soft light wash so empty headers never look broken */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 25% 15%, rgba(255,255,255,0.28), transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(233,217,184,0.35), transparent 50%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-surface" />
    </div>
  );
}

export function ProfileCoverBand({
  imageUrl,
  parallaxY = 0,
}: {
  imageUrl?: string | null;
  parallaxY?: number;
}) {
  const [broken, setBroken] = useState(false);
  const resolved = imageUrl?.trim() || null;

  useEffect(() => {
    setBroken(false);
  }, [resolved]);

  if (!resolved || broken) {
    return <GenericCoverGradient parallaxY={parallaxY} />;
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-48 overflow-hidden sm:h-60">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolved}
        alt=""
        className="h-[130%] w-full object-cover opacity-95 will-change-transform"
        style={{ transform: `translate3d(0, ${parallaxY * 0.4}px, 0) scale(1.05)` }}
        onError={() => setBroken(true)}
      />
      <div className="absolute inset-0 backdrop-blur-[1.5px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/5 to-surface" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-surface to-transparent" />
    </div>
  );
}

export function ProfilePageFrame({
  coverUrl,
  children,
  /**
   * Optional breadcrumb / status strip. Renders over the top of the cover band
   * (not under the bottom curve fade) so it stays readable.
   */
  topBar,
}: {
  coverUrl?: string | null;
  children: ReactNode;
  topBar?: ReactNode;
}) {
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    let raf = 0;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setParallaxY(Math.min(120, Math.max(0, window.scrollY)));
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="relative">
      <ProfileCoverBand imageUrl={coverUrl} parallaxY={parallaxY} />
      {topBar ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-4 pt-3 sm:px-6 sm:pt-4">
          <div className="pointer-events-auto max-w-full rounded-2xl bg-black/35 px-3 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.18)] backdrop-blur-md sm:px-3.5 sm:py-2.5">
            {topBar}
          </div>
        </div>
      ) : null}
      {/* Spacer so avatar sits half over the cover */}
      <div className="h-28 sm:h-36" aria-hidden />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/** Inner shell padding for public profile pages (compose with LayoutWrapper). */
export function ProfilePageWrap({ children }: { children: ReactNode }) {
  return (
    <div className="px-3 py-4 sm:px-5 sm:py-8">
      <ProfileShell>
        <ProfileThemeScope>{children}</ProfileThemeScope>
      </ProfileShell>
    </div>
  );
}
