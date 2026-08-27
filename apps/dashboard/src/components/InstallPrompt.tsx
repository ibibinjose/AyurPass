"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { XIcon } from "@/components/icons";

const DISMISS_KEY = "ayurpass.install.dismissedAt";

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
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
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
  const iPadOs =
    ua.includes("macintosh") &&
    typeof navigator !== "undefined" &&
    navigator.maxTouchPoints > 1;
  return iOS || iPadOs;
}

/** SF-style Share icon for iOS. */
function ShareIosIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3v11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M8.5 6.5L12 3l3.5 3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 14v4.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** SF-style Add to Home Screen Plus-Square icon. */
function PlusSquareIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PhoneAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="2" width="14" height="20" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Apple iOS style bottom sheet for PWA install instructions.
 */
export function InstallPrompt() {
  const [mounted, setMounted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [ios, setIos] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [busy, setBusy] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  const close = useCallback((persist = true) => {
    setOpen(false);
    setIosHelp(false);
    if (persist) markDismissed();
  }, []);

  useEffect(() => {
    if (isStandalone()) return;

    queueMicrotask(() => setIos(detectIos()));

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
    };
  }, []);

  useEffect(() => {
    function onOpen() {
      if (isStandalone()) return;
      setOpen(true);
      setIosHelp(false);
    }
    window.addEventListener("ayurpass-open-install", onOpen);
    return () => window.removeEventListener("ayurpass-open-install", onOpen);
  }, []);

  const handleInstall = async () => {
    if (ios) {
      if (iosHelp) {
        close(true);
      } else {
        setIosHelp(true);
      }
      return;
    }
    if (!deferredPrompt) {
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

  if (!mounted || isStandalone()) return null;

  return (
    <>
      {/* Translucent Backdrop */}
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-md transition-opacity duration-300"
          aria-label="Close install prompt"
          onClick={() => close(true)}
        />
      ) : null}

      {/* iOS Action Sheet / Bottom Sheet Panel */}
      <div
        role="dialog"
        aria-modal={open}
        aria-labelledby="install-title"
        className={`fixed inset-x-0 bottom-0 z-[9999] mx-auto w-full max-w-md transform px-3 pb-safe transition-all duration-300 cubic-bezier(0.16,1,0.3,1) sm:px-4 ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-[110%] opacity-0"
        }`}
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="apple-glass-panel relative overflow-hidden rounded-[2.2rem] border border-white/40 bg-surface/95 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
          {/* iOS Sheet Drag Handle Bar */}
          <div className="flex justify-center pt-3 pb-1" aria-hidden>
            <div className="h-1.2 w-9 rounded-full bg-hairline/80" />
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={() => close(true)}
            className="absolute top-3.5 right-4.5 flex h-7 w-7 items-center justify-center rounded-full bg-clay/70 text-ink-muted transition-colors hover:bg-clay hover:text-foreground"
            aria-label="Close"
          >
            <XIcon className="h-4 w-4" />
          </button>

          {/* Main Content Body */}
          <div className="p-5 pt-2 text-center">
            {/* App Icon Showcase */}
            <div className="relative mx-auto mb-3.5 h-16 w-16 overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-forest to-leaf shadow-[0_8px_20px_rgba(30,50,40,0.25)] ring-1 ring-black/5">
              <Image
                src="/icon-192.png"
                alt="AyurPass App Icon"
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>

            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
              AyurPass Web App
            </p>
            <h2 id="install-title" className="font-display text-xl font-bold text-forest">
              Add to Home Screen
            </h2>
            <p className="mt-1 text-xs font-medium text-ink-muted leading-relaxed">
              Experience instant opening, full-screen view, and offline access to your Wellness Pass.
            </p>

            {/* Simulated Safari Instruction Diagram for iOS */}
            {iosHelp || ios ? (
              <div className="mt-4 rounded-2xl border border-hairline/80 bg-clay/50 p-4 text-left shadow-xs">
                <div className="flex items-center justify-between border-b border-hairline/60 pb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-forest">
                    {ios ? "Safari iPhone Instructions" : "Browser Installation"}
                  </span>
                  <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-extrabold text-forest">
                    Easy Step
                  </span>
                </div>

                {ios ? (
                  <ol className="mt-3 space-y-3 text-xs font-medium text-foreground">
                    <li className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest text-xs font-bold text-white shadow-xs">
                        1
                      </span>
                      <div className="min-w-0 flex-1">
                        <span>Tap <strong className="text-forest font-semibold">Share</strong> in Safari toolbar</span>
                        <div className="mt-1 flex items-center gap-1.5 rounded-lg bg-surface px-2.5 py-1 text-system-blue shadow-2xs">
                          <ShareIosIcon className="h-4 w-4" />
                          <span className="text-[11px] font-bold">Share Icon (bottom of screen)</span>
                        </div>
                      </div>
                    </li>

                    <li className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest text-xs font-bold text-white shadow-xs">
                        2
                      </span>
                      <div className="min-w-0 flex-1">
                        <span>Scroll down & select <strong className="text-forest font-semibold">Add to Home Screen</strong></span>
                        <div className="mt-1 flex items-center gap-1.5 rounded-lg bg-surface px-2.5 py-1 text-foreground shadow-2xs">
                          <PlusSquareIcon className="h-4 w-4 text-forest" />
                          <span className="text-[11px] font-bold">Add to Home Screen</span>
                        </div>
                      </div>
                    </li>

                    <li className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest text-xs font-bold text-white shadow-xs">
                        3
                      </span>
                      <div className="min-w-0 flex-1">
                        <span>Tap <strong className="text-forest font-semibold">Add</strong> in top right corner</span>
                      </div>
                    </li>
                  </ol>
                ) : (
                  <ol className="mt-3 space-y-2 text-xs font-medium text-foreground">
                    <li>1. Tap your browser menu <strong className="text-forest">(⋮ or ⋯)</strong></li>
                    <li>2. Tap <strong className="text-forest">Install App</strong> or <strong className="text-forest">Add to Home Screen</strong></li>
                    <li>3. Confirm to launch AyurPass from your phone apps!</li>
                  </ol>
                )}
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-2.5 text-left text-xs">
                <div className="rounded-2xl border border-hairline/70 bg-surface p-3 shadow-2xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-forest/10 text-forest">
                    <PhoneAppIcon className="h-4 w-4" />
                  </div>
                  <p className="mt-2 font-bold text-foreground">App Speed</p>
                  <p className="text-[11px] text-ink-muted">Launches like a native iOS/Android app.</p>
                </div>
                <div className="rounded-2xl border border-hairline/70 bg-surface p-3 shadow-2xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/15 text-gold-deep">
                    <PlusSquareIcon className="h-4 w-4" />
                  </div>
                  <p className="mt-2 font-bold text-foreground">No App Store</p>
                  <p className="text-[11px] text-ink-muted">Installs directly to your home screen.</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => void handleInstall()}
                disabled={busy}
                className="btn-press inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-forest via-leaf to-forest-deep px-6 text-sm font-bold text-white shadow-md glow-forest disabled:opacity-60"
              >
                <PhoneAppIcon className="h-4 w-4 text-gold-bright" />
                {busy
                  ? "Opening…"
                  : ios || iosHelp
                    ? iosHelp && ios
                      ? "Got it"
                      : "How to add to Home Screen"
                    : canInstall
                      ? "Install AyurPass App"
                      : "How to add to Home Screen"}
              </button>

              <button
                type="button"
                onClick={() => close(true)}
                className="btn-press inline-flex min-h-11 w-full items-center justify-center rounded-full bg-clay/50 px-5 text-xs font-semibold text-ink-secondary hover:bg-clay hover:text-foreground"
              >
                Not Now
              </button>
            </div>

            {/* Bottom iOS Indicator line */}
            {ios && !iosHelp ? (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-forest">
                <ShareIosIcon className="h-3.5 w-3.5 text-system-blue" />
                <span>Tap <strong>Share</strong> in Safari toolbar to add</span>
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
  label,
  compact = false,
}: {
  className?: string;
  label?: string;
  compact?: boolean;
}) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    queueMicrotask(() => setHidden(isStandalone()));
  }, []);

  if (hidden) return null;

  const defaultLabel = label ?? (compact ? "Get App" : "Add to Home Screen");

  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new Event("ayurpass-open-install"));
      }}
      className={
        className ||
        (compact
          ? "btn-press inline-flex items-center gap-1.5 rounded-full border border-forest/20 bg-forest/8 px-3 py-1.5 text-xs font-bold text-forest shadow-2xs backdrop-blur-md transition-all hover:border-forest/40 hover:bg-forest/15 active:scale-95"
          : "btn-press inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-forest to-forest-deep px-4 text-xs font-bold text-white shadow-xs hover:from-forest-deep hover:to-forest")
      }
    >
      <PhoneAppIcon className={compact ? "h-3.5 w-3.5 text-forest" : "h-4 w-4 text-gold-bright"} />
      <span>{defaultLabel}</span>
    </button>
  );
}
