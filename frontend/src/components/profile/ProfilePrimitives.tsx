"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
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
import { useEngagement } from "@/hooks/useEngagement";
import type { EngagementTarget } from "@/lib/engagement";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const actionBtn =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors sm:px-4";
const actionPrimary = `${actionBtn} bg-forest text-white shadow-[0_2px_8px_rgba(36,56,46,0.14)] hover:bg-forest-deep`;
const actionOutline = `${actionBtn} border border-hairline bg-surface text-forest hover:border-leaf`;
const actionActive = `${actionBtn} border border-leaf/50 bg-leaf/10 text-forest`;
const actionLikeActive = `${actionBtn} border border-red-200 bg-red-50 text-red-700`;

/** CulturePass-style overline-labelled section. */
export function ProfileSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">{label}</p>
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
}

function LinkRowIcon({ item }: { item: ProfileLinkItem }) {
  const key = `${item.kind ?? ""} ${item.label}`.toLowerCase();
  const box = "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-clay/80 text-forest";
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
  if (item.external !== false && item.href.startsWith("http")) {
    return (
      <span aria-hidden className={box}>
        <ExternalLinkIcon className="h-5 w-5" />
      </span>
    );
  }
  if (key.includes("website") || key.includes("aaa")) {
    return (
      <span aria-hidden className={box}>
        <GlobeIcon className="h-5 w-5" />
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
  "group flex items-center gap-3.5 rounded-2xl border border-hairline bg-surface px-5 py-4 shadow-[0_1px_0_rgba(36,56,46,0.04)] transition-all hover:-translate-y-px hover:border-leaf/35 hover:shadow-[0_8px_24px_rgba(36,56,46,0.07)] active:translate-y-0";

/** Stacked full-width link rows — link-in-bio style. */
export function ProfileLinkButtons({ items }: { items: ProfileLinkItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const inner = (
          <>
            <LinkRowIcon item={item} />
            <span className="min-w-0 flex-1 text-left">
              <span className="block font-medium text-foreground group-hover:text-forest">
                {item.label}
              </span>
              {item.sublabel ? (
                <span className="mt-0.5 block truncate text-sm text-ink-muted">{item.sublabel}</span>
              ) : null}
            </span>
            <ExternalLinkIcon className="h-4 w-4 shrink-0 text-ink-muted opacity-60 transition-opacity group-hover:opacity-100" />
          </>
        );
        if (item.external !== false && item.href.startsWith("http")) {
          return (
            <a
              key={`${item.label}-${item.href}`}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className={linkRowClass}
            >
              {inner}
            </a>
          );
        }
        if (item.href.startsWith("mailto:") || item.href.startsWith("tel:")) {
          return (
            <a key={`${item.label}-${item.href}`} href={item.href} className={linkRowClass}>
              {inner}
            </a>
          );
        }
        return (
          <Link key={`${item.label}-${item.href}`} href={item.href} className={linkRowClass}>
            {inner}
          </Link>
        );
      })}
    </div>
  );
}

/** All hero actions in one row — Follow · Like · Enquire · Book · Share · Copy. */
export function ProfileActionBar({
  target,
  shareUrl,
  shareTitle,
  shareText,
  onEnquire,
  bookHref,
  enquireDisabled,
}: {
  target: EngagementTarget;
  shareUrl: string;
  shareTitle: string;
  shareText?: string;
  onEnquire: () => void;
  bookHref?: string | null;
  enquireDisabled?: boolean;
}) {
  const { following, liked, onFollow, onLike } = useEngagement(target);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  async function share() {
    const payload = { title: shareTitle, text: shareText ?? shareTitle, url: shareUrl };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        /* user cancelled */
      }
    }
    await copyLink();
  }

  return (
    <div className="mt-4 flex w-full max-w-full gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden">
      <button
        type="button"
        onClick={onFollow}
        className={following ? actionActive : actionPrimary}
        aria-pressed={following}
      >
        {following ? <CheckIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
        {following ? "Following" : "Follow"}
      </button>
      <button
        type="button"
        onClick={onLike}
        className={liked ? actionLikeActive : actionOutline}
        aria-pressed={liked}
      >
        <HeartIcon className="h-4 w-4" filled={liked} />
        {liked ? "Liked" : "Like"}
      </button>
      <button
        type="button"
        onClick={onEnquire}
        disabled={enquireDisabled}
        className={`${actionOutline} disabled:opacity-50`}
      >
        Enquire
      </button>
      {bookHref ? (
        <Link href={bookHref} className={actionOutline}>
          Book
        </Link>
      ) : null}
      <button type="button" onClick={() => void share()} className={actionOutline}>
        <ShareIcon className="h-4 w-4" />
        Share
      </button>
      <button type="button" onClick={() => void copyLink()} className={actionOutline}>
        <LinkIcon className="h-4 w-4" />
        {copyState === "copied" ? "Copied" : "Copy"}
      </button>
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

export function ProfileAvatar({
  name,
  imageUrl,
  hubLogoUrl,
  size = 112,
}: {
  name: string;
  imageUrl?: string | null;
  hubLogoUrl?: string | null;
  size?: number;
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full rounded-full object-cover shadow-[0_8px_30px_rgba(36,56,46,0.12)] ring-2 ring-surface ring-offset-2 ring-offset-background"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="flex items-center justify-center rounded-full bg-gradient-to-br from-gold-soft to-clay font-display text-2xl text-forest shadow-[0_8px_30px_rgba(36,56,46,0.1)] ring-2 ring-surface ring-offset-2 ring-offset-background"
          style={{ width: size, height: size }}
          aria-hidden
        >
          {initials || <UsersIcon className="h-10 w-10" />}
        </div>
      )}
      {hubLogoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hubLogoUrl}
          alt=""
          className="absolute -bottom-0.5 -right-0.5 h-9 w-9 rounded-full border-2 border-surface object-cover shadow-sm"
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

export function ProfileVerifiedMark() {
  return (
    <span
      className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full bg-leaf/15 text-leaf"
      title="Verified"
    >
      <CheckIcon className="h-3.5 w-3.5" />
    </span>
  );
}

export function ProfileMetaRow({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:justify-start">
      {children}
    </div>
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

export function ProfileAaaBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-hairline bg-surface px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-forest">
      <ShieldIcon className="h-3.5 w-3.5 text-leaf" />
      AAA Listed
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
    <div className="mx-auto w-full max-w-[1024px] rounded-[28px] border border-hairline/80 bg-surface/90 px-5 py-7 shadow-[0_12px_40px_rgba(36,56,46,0.06)] sm:px-8 sm:py-9">
      {children}
    </div>
  );
}

export function ProfileHeroShell({ children }: { children: ReactNode }) {
  return (
    <header className="flex flex-col items-center gap-7 border-b border-hairline/70 pb-9 md:flex-row md:items-start md:gap-10 md:pb-11">
      {children}
    </header>
  );
}

export function ProfileHeroInfo({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-col items-center gap-1.5 text-center md:flex-1 md:items-start md:text-left">
      {children}
    </div>
  );
}

export function ProfileBodyGrid({ main, sidebar }: { main: ReactNode; sidebar: ReactNode }) {
  return (
    <div className="mt-9 flex flex-col gap-10 pb-4 md:mt-11 md:flex-row md:items-start md:gap-14">
      <div className="min-w-0 flex flex-1 flex-col gap-11">{main}</div>
      <aside className="flex w-full flex-col gap-9 md:sticky md:top-24 md:w-[300px] md:shrink-0">
        {sidebar}
      </aside>
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

/** Optional soft cover band behind hero. */
export function ProfileCoverBand({ imageUrl }: { imageUrl?: string | null }) {
  if (!imageUrl) {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-leaf/8 via-gold-soft/20 to-transparent sm:h-44"
      />
    );
  }
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-36 overflow-hidden sm:h-44">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="" className="h-full w-full object-cover opacity-[0.22] blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-surface/80 to-surface" />
    </div>
  );
}

export function ProfilePageFrame({ coverUrl, children }: { coverUrl?: string | null; children: ReactNode }) {
  return (
    <div className="relative">
      <ProfileCoverBand imageUrl={coverUrl} />
      <div className="relative">{children}</div>
    </div>
  );
}

/** Inner shell padding for public profile pages (compose with LayoutWrapper). */
export function ProfilePageWrap({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 py-6 sm:px-5 sm:py-8">
      <ProfileShell>{children}</ProfileShell>
    </div>
  );
}