"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { XIcon } from "@/components/icons";

const DISMISS_KEY = "ayurpass.install.dismissedAt";
const DISMISS_DAYS = 14;

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

function isDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    return Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

function detectIos(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent.toLowerCase();
  const iOS = /iphone|ipad|ipod/.test(ua);
  // iPadOS 13+ reports as Mac — check touch points
  const iPadOs =
    ua.includes("macintosh") &&
    typeof navigator !== "undefined" &&
    navigator.maxTouchPoints > 1;
  return iOS || iPadOs;
}

/** Share icon for iOS instructions (SF-style). */
function ShareIosIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 7l4-4 4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HomeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * PWA install: soft bottom sheet + optional manual open via InstallAppButton.
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [ios, setIos] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [busy, setBusy] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);

  const close = useCallback((persist = true) => {
    setOpen(false);
    setIosHelp(false);
    if (persist) markDismissed();
  }, []);

  useEffect(() => {
    if (isStandalone()) return;

    setIos(detectIos());

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);

    // Soft auto-show: after short delay, only if not dismissed and (BIP ready or iOS)
    const timer = window.setTimeout(() => {
      if (isDismissedRecently() || isStandalone()) return;
      const iosDevice = detectIos();
      // On Android/desktop wait for beforeinstallprompt if possible; still show iOS sheet
      if (iosDevice) {
        setOpen(true);
      }
    }, 4500);

    // If BIP already fired (or fires soon), show once available
    const showWhenReady = window.setTimeout(() => {
      if (isDismissedRecently() || isStandalone()) return;
      // deferredPrompt state may lag — check via canInstall in next tick handled below
    }, 6000);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.clearTimeout(timer);
      window.clearTimeout(showWhenReady);
    };
  }, []);

  // When install becomes available and user hasn't dismissed, surface the sheet once
  useEffect(() => {
    if (!canInstall || isDismissedRecently() || isStandalone()) return;
    const t = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(t);
  }, [canInstall]);

  // Allow other UI to open the sheet
  useEffect(() => {
    function onOpen() {
      if (isStandalone()) return;
      setOpen(true);
      setIosHelp(detectIos());
    }
    window.addEventListener("ayurpass-open-install", onOpen);
    return () => window.removeEventListener("ayurpass-open-install", onOpen);
  }, []);

  const handleInstall = async () => {
    if (ios) {
      setIosHelp(true);
      return;
    }
    if (!deferredPrompt) {
      // Desktop Safari / unsupported — show generic tips
      setIosHelp(true);
      return;
    }
    setBusy(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        close(true);
      }
      setDeferredPrompt(null);
      setCanInstall(false);
    } finally {
      setBusy(false);
    }
  };

  if (isStandalone()) return null;

  return (
    <>
      {/* Backdrop */}
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-[9998] bg-forest/25 backdrop-blur-[2px] md:bg-forest/20"
          aria-label="Close install prompt"
          onClick={() => close(true)}
        />
      ) : null}

      {/* Bottom sheet */}
      <div
        role="dialog"
        aria-modal={open}
        aria-labelledby="install-title"
        className={`fixed inset-x-0 bottom-0 z-[9999] mx-auto w-full max-w-lg transform px-3 transition-all duration-300 ease-out sm:px-4 ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-[120%] opacity-0"
        }`}
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="overflow-hidden rounded-[1.35rem] border border-hairline bg-surface shadow-[0_-8px_40px_rgba(30,50,40,0.18)]">
          {/* Brand header strip */}
          <div className="flex items-center gap-3 bg-gradient-to-br from-forest to-leaf px-4 py-3.5 text-white">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-white/10 ring-2 ring-white/25">
              <Image
                src="/icon-192.png"
                alt=""
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold-soft">
                AyurPass app
              </p>
              <h2 id="install-title" className="font-display text-lg font-semibold leading-tight">
                Add to Home Screen
              </h2>
              <p className="mt-0.5 text-xs text-white/80">
                Faster open · Full-screen · Your calendar & pass in one tap
              </p>
            </div>
            <button
              type="button"
              onClick={() => close(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Dismiss"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 px-4 py-4">
            {!iosHelp ? (
              <ul className="grid gap-2 text-sm text-ink-secondary">
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-leaf/15 text-leaf">
                    <HomeIcon className="h-3.5 w-3.5" />
                  </span>
                  <span>
                    <strong className="text-forest">One-tap access</strong> from your home screen —
                    no app store required.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-leaf/15 text-xs font-bold text-leaf">
                    ✓
                  </span>
                  <span>
                    Bookings, events, offers and your <strong className="text-forest">Wellness Pass</strong>{" "}
                    feel like a native app.
                  </span>
                </li>
              </ul>
            ) : (
              <div className="rounded-2xl border border-leaf/25 bg-leaf/5 px-3.5 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-forest">
                  {ios ? "On iPhone / iPad" : "Install from browser"}
                </p>
                {ios ? (
                  <ol className="mt-2 space-y-2.5 text-sm text-ink-secondary">
                    <li className="flex gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest text-[11px] font-bold text-white">
                        1
                      </span>
                      <span className="pt-0.5">
                        Tap <strong className="text-forest">Share</strong>{" "}
                        <ShareIosIcon className="inline h-4 w-4 text-forest align-text-bottom" /> at
                        the bottom of Safari
                      </span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest text-[11px] font-bold text-white">
                        2
                      </span>
                      <span className="pt-0.5">
                        Scroll and choose <strong className="text-forest">Add to Home Screen</strong>
                      </span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest text-[11px] font-bold text-white">
                        3
                      </span>
                      <span className="pt-0.5">
                        Tap <strong className="text-forest">Add</strong> — AyurPass appears on your
                        home screen
                      </span>
                    </li>
                  </ol>
                ) : (
                  <ol className="mt-2 space-y-2 text-sm text-ink-secondary">
                    <li>
                      1. Open the browser menu{" "}
                      <strong className="text-forest">(⋮ or ⋯)</strong>
                    </li>
                    <li>
                      2. Choose <strong className="text-forest">Install app</strong> or{" "}
                      <strong className="text-forest">Add to Home screen</strong>
                    </li>
                    <li>3. Confirm — open AyurPass like any app</li>
                  </ol>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => void handleInstall()}
                disabled={busy}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-forest px-5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(30,50,40,0.25)] transition hover:bg-forest-deep active:scale-[0.98] disabled:opacity-60"
              >
                <HomeIcon className="h-4 w-4" />
                {busy
                  ? "Opening…"
                  : ios || iosHelp
                    ? iosHelp && ios
                      ? "Show steps again"
                      : "How to add"
                    : canInstall
                      ? "Add to Home Screen"
                      : "Add to Home Screen"}
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-hairline bg-surface px-5 text-sm font-semibold text-ink-secondary hover:border-leaf hover:text-forest"
              >
                Not now
              </button>
            </div>

            {ios && !iosHelp ? (
              <p className="text-center text-[11px] text-ink-muted">
                Safari required on iPhone for “Add to Home Screen”.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

/** Compact control — open install sheet from nav, profile, footer, etc. */
export function InstallAppButton({
  className = "",
  label = "Add to Home Screen",
  compact = false,
}: {
  className?: string;
  label?: string;
  compact?: boolean;
}) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setHidden(isStandalone());
  }, []);

  if (hidden) return null;

  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new Event("ayurpass-open-install"));
      }}
      className={
        className ||
        (compact
          ? "inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs font-bold text-forest hover:border-leaf"
          : "inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-forest px-4 text-sm font-bold text-white hover:bg-forest-deep")
      }
    >
      <HomeIcon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {label}
    </button>
  );
}
