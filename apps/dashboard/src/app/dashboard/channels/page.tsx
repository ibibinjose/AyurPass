"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Channel, SyncReport } from "@/lib/types";
import {
  CalendarIcon,
  CheckIcon,
  CompassIcon,
  ExternalLinkIcon,
  GlobeIcon,
  LeafIcon,
  MoonIcon,
  ShareIcon,
  SparkleIcon,
} from "@/components/icons";
import { DashHeader } from "@/components/dashboard/DashboardKit";
import { Button, EmptyState, Field, Input } from "@/components/ui";

const CHANNEL_ICON: Record<string, typeof LeafIcon> = {
  SQUARE_POS: CompassIcon,
  STRIPE_PAYMENTS: SparkleIcon,
  GOOGLE_CALENDAR: MoonIcon,
  APPLE_ICAL: CalendarIcon,
  MAILCHIMP: SparkleIcon,
  SENDGRID: SparkleIcon,
  AYURPASS_STORE: LeafIcon,
};

const STATUS_STYLE: Record<string, string> = {
  connected: "bg-forest text-white",
  active: "bg-forest text-white",
  disconnected: "border border-hairline text-ink-secondary",
};

export default function ChannelsPage() {
  const { user } = useAuth();
  const provider = user?.provider ?? user?.professional?.provider ?? null;
  const [channels, setChannels] = useState<Channel[] | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [sync, setSync] = useState<SyncReport | null>(null);
  const [activeTab, setActiveTab] = useState<"widget" | "integrations">("widget");

  // Widget Builder States
  const [widgetFormat, setWidgetFormat] = useState<"iframe" | "button">("iframe");
  const [brandColor, setBrandColor] = useState("#1e3228");
  const [widgetHeight, setWidgetHeight] = useState("750");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!provider) return;
    api
      .channels(provider.id)
      .then(setChannels)
      .catch(() => setChannels([]));
  }, [provider]);

  useEffect(reload, [reload]);

  if (!provider) {
    return <EmptyState title="No practice linked" body="Channels are managed by provider accounts." />;
  }

  const handle = provider.vanityHandle || provider.slug || provider.id;
  const origin = typeof window !== "undefined" ? window.location.origin : "https://ayurpass.com";
  const embedUrl = `${origin}/embed/${handle}?color=${encodeURIComponent(brandColor)}`;
  const bookingPageUrl = `${origin}/@${handle}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=12&data=${encodeURIComponent(bookingPageUrl)}`;

  const iframeSnippet = `<!-- AyurPass Booking Widget -->
<iframe
  src="${embedUrl}"
  width="100%"
  height="${widgetHeight}"
  frameborder="0"
  style="border:none; border-radius:16px; box-shadow:0 8px 30px rgba(0,0,0,0.06);"
  title="Book with ${provider.businessName}"
></iframe>`;

  const buttonSnippet = `<!-- AyurPass Book Now Button -->
<a
  href="${bookingPageUrl}"
  target="_blank"
  rel="noopener"
  style="display:inline-flex; align-items:center; gap:8px; padding:12px 24px; border-radius:999px; background-color:${brandColor}; color:#ffffff; font-weight:600; text-decoration:none; font-family:sans-serif; box-shadow:0 4px 14px rgba(0,0,0,0.15);"
>
  📅 Book Appointment
</a>`;

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  }

  async function connect(c: Channel) {
    if (!provider) return;
    setActing(c.type);
    try {
      await api.connectChannel(provider.id, c.type);
      reload();
    } finally {
      setActing(null);
    }
  }

  async function disconnect(c: Channel) {
    if (!c.integrationId) return;
    setActing(c.type);
    try {
      await api.disconnectChannel(c.integrationId);
      reload();
    } finally {
      setActing(null);
    }
  }

  async function runSync(c: Channel) {
    if (!c.integrationId) return;
    setActing(c.type);
    setSync(null);
    try {
      setSync(await api.syncChannel(c.integrationId));
      reload();
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="space-y-6">
      <DashHeader
        eyebrow="Practice Presence"
        title="Booking Channels & Website Widgets"
        description="Embed your live booking calendar onto your website, print front-desk QR counter signs, and sync with POS and calendars."
      />

      {/* Tabs */}
      <div className="flex border-b border-hairline gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("widget")}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === "widget"
              ? "border-b-2 border-forest text-forest font-bold"
              : "text-ink-muted hover:text-foreground"
          }`}
        >
          <GlobeIcon className="h-4 w-4" />
          Website Widget &amp; QR Kit
        </button>
        <button
          onClick={() => setActiveTab("integrations")}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === "integrations"
              ? "border-b-2 border-forest text-forest font-bold"
              : "text-ink-muted hover:text-foreground"
          }`}
        >
          <SparkleIcon className="h-4 w-4" />
          Calendar Sync &amp; POS Integrations
        </button>
      </div>

      {activeTab === "widget" ? (
        <div className="grid gap-8 lg:grid-cols-2 mt-6">
          {/* Left: Widget Generator */}
          <div className="rounded-2xl border border-hairline bg-surface p-6 space-y-6 shadow-xs">
            <div>
              <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-bold text-forest uppercase tracking-wider">
                Embed on Any Site
              </span>
              <h2 className="mt-2 font-display text-xl font-bold text-forest">
                Website Booking Widget
              </h2>
              <p className="mt-1 text-sm text-ink-secondary">
                Paste this widget code into your WordPress, Squarespace, Wix, or Shopify website to take live appointments directly on your site.
              </p>
            </div>

            {/* Config controls */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                  Widget Format
                </label>
                <div className="flex rounded-xl border border-hairline p-1 bg-surface-raised/40">
                  <button
                    type="button"
                    onClick={() => setWidgetFormat("iframe")}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                      widgetFormat === "iframe"
                        ? "bg-forest text-white shadow-2xs"
                        : "text-ink-secondary hover:text-foreground"
                    }`}
                  >
                    Embedded iFrame
                  </button>
                  <button
                    type="button"
                    onClick={() => setWidgetFormat("button")}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                      widgetFormat === "button"
                        ? "bg-forest text-white shadow-2xs"
                        : "text-ink-secondary hover:text-foreground"
                    }`}
                  >
                    Booking Button
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                  Brand Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded-lg border border-hairline bg-transparent p-1"
                  />
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="h-9 flex-1 rounded-lg border border-hairline px-3 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Generated Code Snippet */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  HTML Embed Code
                </label>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      widgetFormat === "iframe" ? iframeSnippet : buttonSnippet,
                      "embed_code",
                    )
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline"
                >
                  {copiedKey === "embed_code" ? (
                    <span className="text-green-700 flex items-center gap-1">
                      <CheckIcon className="h-3.5 w-3.5" /> Copied!
                    </span>
                  ) : (
                    "Copy Code Snippet"
                  )}
                </button>
              </div>
              <textarea
                readOnly
                rows={widgetFormat === "iframe" ? 7 : 5}
                value={widgetFormat === "iframe" ? iframeSnippet : buttonSnippet}
                className="w-full rounded-xl border border-hairline bg-surface-raised/40 p-3 font-mono text-xs text-ink-secondary focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-hairline text-xs">
              <a
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-forest hover:underline"
              >
                <ExternalLinkIcon className="h-3.5 w-3.5" />
                Test live embed view ({`/embed/${handle}`})
              </a>
              <span className="text-ink-muted">Compatible with WordPress, Squarespace &amp; Wix</span>
            </div>
          </div>

          {/* Right: Printable Front-Desk QR Kit & Social Link */}
          <div className="space-y-6">
            {/* QR Card */}
            <div className="rounded-2xl border border-hairline bg-surface p-6 space-y-5 shadow-xs">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-forest-deep uppercase tracking-wider">
                    Reception Desk Kit
                  </span>
                  <h2 className="mt-2 font-display text-xl font-bold text-forest">
                    Printable Front-Desk QR Code
                  </h2>
                  <p className="mt-1 text-sm text-ink-secondary">
                    Display this QR counter sign at your clinic reception or on treatment room tables for rebooking.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-hairline bg-surface-raised/30">
                <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl border border-hairline bg-white p-2 shadow-xs">
                  <Image
                    src={qrCodeUrl}
                    alt="Booking QR Code"
                    width={160}
                    height={160}
                    unoptimized
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="space-y-3 text-center sm:text-left flex-1">
                  <h3 className="font-semibold text-sm text-forest">
                    &ldquo;Scan to Book Your Next Session&rdquo;
                  </h3>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Clients scan with their smartphone camera to open your branded booking menu and schedule in seconds.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                    <a
                      href={qrCodeUrl}
                      download={`ayurpass-booking-qr-${handle}.png`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-white hover:bg-forest-deep shadow-2xs transition-colors"
                    >
                      Download High-Res QR
                    </a>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="rounded-full border border-hairline bg-surface px-4 py-2 text-xs font-semibold text-forest hover:bg-forest/5"
                    >
                      Print Counter Card
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Bio Link Card */}
            <div className="rounded-2xl border border-hairline bg-surface p-6 space-y-4 shadow-xs">
              <h3 className="font-display text-lg font-bold text-forest">
                Instagram &amp; TikTok Bio Booking Link
              </h3>
              <p className="text-xs text-ink-secondary">
                Add this short URL to your social profiles to convert profile visitors into paying appointments.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${bookingPageUrl}?src=social_bio`}
                  className="flex-1 rounded-xl border border-hairline bg-surface-raised/40 px-3.5 py-2.5 font-mono text-xs text-foreground focus:outline-none"
                />
                <Button
                  onClick={() =>
                    copyToClipboard(`${bookingPageUrl}?src=social_bio`, "bio_link")
                  }
                  className="!px-4 !py-2.5 text-xs whitespace-nowrap"
                >
                  {copiedKey === "bio_link" ? "Copied!" : "Copy Link"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Integrations Tab */
        <div className="mt-8 space-y-4">
          {channels?.[0]?.mock && (
            <p className="rounded-xl border border-gold-soft bg-clay/50 px-4 py-3 text-sm text-ink-secondary">
              Connections run in <strong>demo mode</strong> — no external account is contacted. Add live API keys to activate real sync.
            </p>
          )}

          {channels === null ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-clay/70" />
            ))
          ) : (
            channels.map((c) => {
              const Icon = CHANNEL_ICON[c.type] ?? LeafIcon;
              const connected = c.status === "connected" || c.status === "active";
              return (
                <div key={c.type} className="rounded-2xl border border-hairline bg-surface p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-clay text-forest">
                        <Icon className="h-5.5 w-5.5" />
                      </span>
                      <div>
                        <p className="flex items-center gap-2 font-medium text-foreground">
                          {c.name}
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLE[c.status] ?? STATUS_STYLE.disconnected}`}
                          >
                            {c.status}
                          </span>
                        </p>
                        <p className="mt-1 max-w-lg text-sm text-ink-secondary">{c.description}</p>
                        {c.externalAccountId && (
                          <p className="mt-1.5 text-xs text-ink-muted">
                            Account {c.externalAccountId}
                            {c.lastSyncAt &&
                              ` · last synced ${new Date(c.lastSyncAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}`}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {(c.type === "APPLE_ICAL" || c.type === "GOOGLE_CALENDAR") && (
                        <Button
                          variant="soft"
                          className="!px-3.5 !py-1.5"
                          onClick={() => {
                            const url = `${window.location.origin}/api/calendar/ics?providerId=${provider.id}`;
                            navigator.clipboard.writeText(url);
                            alert("2-Way Calendar Sync URL copied to clipboard!\n\n" + url);
                          }}
                        >
                          Copy Feed URL
                        </Button>
                      )}
                      {!c.connectable ? (
                        <span className="rounded-full bg-clay px-3.5 py-1.5 text-xs font-medium text-forest">
                          Always on
                        </span>
                      ) : connected ? (
                        <>
                          <Button
                            disabled={acting === c.type}
                            onClick={() => runSync(c)}
                            className="!px-3.5 !py-1.5"
                          >
                            {acting === c.type ? "Syncing…" : "Sync now"}
                          </Button>
                          <Button
                            variant="ghost"
                            disabled={acting === c.type}
                            onClick={() => disconnect(c)}
                            className="!px-3.5 !py-1.5"
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          disabled={acting === c.type}
                          onClick={() => connect(c)}
                          className="!px-3.5 !py-1.5"
                        >
                          {acting === c.type ? "Connecting…" : "Connect"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {sync && sync.type === c.type && (
                    <div className="mt-4 rounded-xl bg-clay/50 px-4 py-3 text-sm text-ink-secondary">
                      Synced {sync.report.catalogItemsPushed} catalog items,{" "}
                      {sync.report.inventoryCountsPulled} inventory counts and{" "}
                      {sync.report.appointmentsMirrored} appointments.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
