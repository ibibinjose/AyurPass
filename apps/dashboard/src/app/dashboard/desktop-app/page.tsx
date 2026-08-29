"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import {
  CalendarIcon,
  CheckCircleIcon,
  SparkleIcon,
  GlobeIcon,
} from "@/components/icons";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function DesktopAppPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<"mac" | "windows" | "other">("mac");

  useEffect(() => {
    // Check if already in standalone window
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect OS
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.includes("mac")) setPlatform("mac");
    else if (ua.includes("win")) setPlatform("windows");
    else setPlatform("other");

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const playTestChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      alert("Audio notification test played!");
    }
  };

  return (
    <LayoutWrapper>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-ink-muted">
          <Link href="/dashboard" className="hover:text-forest">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/dashboard/channels" className="hover:text-forest">
            Channels
          </Link>
          <span>/</span>
          <span className="text-forest">Desktop App</span>
        </div>

        {/* Hero Section */}
        <div className="rounded-3xl bg-forest p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gold-soft border border-white/15">
              Always-On Desktop PWA
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mt-4 leading-tight">
              AyurPass for macOS & Windows
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/80 leading-relaxed">
              Never miss a client walk-in or booking update. Run AyurPass in a dedicated, distraction-free desktop window right on your clinic front desk computer.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {isStandalone || installed ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-3 text-sm font-bold text-white border border-white/30 shadow-xs">
                  <CheckCircleIcon className="h-5 w-5 text-gold-soft" />
                  Desktop App Installed & Active
                </div>
              ) : deferredPrompt ? (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="profile-spring inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-bold text-forest shadow-md hover:bg-gold-soft active:scale-95"
                >
                  <SparkleIcon className="h-5 w-5" />
                  Install Desktop App Now
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 text-xs font-semibold text-white/90 border border-white/20">
                  <span>💡 Install from browser menu:</span>
                  <span className="font-bold underline">
                    {platform === "mac" ? "Safari: File → Add to Dock" : "Chrome/Edge: Click (⤓) in Address Bar"}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={playTestChime}
                className="profile-spring inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-xs font-bold text-white hover:bg-white/20 active:scale-95"
              >
                🔔 Test Notification Chime
              </button>
            </div>
          </div>

          {/* Decorative badge in corner */}
          <div className="hidden lg:block absolute -right-6 -bottom-6 w-80 h-80 rounded-full bg-white/5 border border-white/10 blur-2xl pointer-events-none" />
        </div>

        {/* Value Proposition Grid */}
        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold text-forest">
            Why Clinic Teams Love the Desktop App
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Engineered for high-volume wellness clinics, multi-therapist practices, and busy reception desks.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-hairline bg-surface p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/10 text-forest mb-4">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-foreground text-base">
                Dedicated Standalone Window
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
                Eliminates browser tab clutter. Receptionists can keep AyurPass open on a second monitor without worrying about accidentally closing browser tabs.
              </p>
            </div>

            <div className="rounded-2xl border border-hairline bg-surface p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/10 text-forest mb-4">
                <SparkleIcon className="h-5 w-5 text-gold-dark" />
              </div>
              <h3 className="font-display font-bold text-foreground text-base">
                Instant Sound Chimes & Alerts
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
                Audible audio alerts chime whenever a client books online, reschedules, or makes a payment at the front desk, even when minimized.
              </p>
            </div>

            <div className="rounded-2xl border border-hairline bg-surface p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/10 text-forest mb-4">
                <GlobeIcon className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-foreground text-base">
                Fast Offline Cache Protection
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
                Pre-caches client rosters, day calendar views, and practice catalogs so reception operations stay smooth even during internet fluctuations.
              </p>
            </div>
          </div>
        </div>

        {/* Operating System Instructions */}
        <div className="mt-12 rounded-3xl border border-hairline bg-surface p-8 shadow-xs">
          <h2 className="font-display text-xl font-bold text-forest">
            Quick Installation Instructions
          </h2>
          <p className="mt-1 text-xs text-ink-muted">
            AyurPass is a progressive desktop application requiring zero downloads or administrative privileges.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-hairline bg-surface-raised/40 p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-md bg-forest/10 px-2 py-0.5 text-xs font-bold text-forest">
                  macOS (Safari / Chrome)
                </span>
              </div>
              <ol className="mt-3 space-y-2 text-xs text-ink-secondary list-decimal list-inside leading-relaxed">
                <li>Open <strong>ayurpass.com/dashboard</strong> in Safari or Chrome.</li>
                <li>In Safari: Click <strong>File → Add to Dock...</strong></li>
                <li>In Chrome: Click the <strong>(⤓) Install</strong> icon in the address bar.</li>
                <li>AyurPass will appear as a native app in your Mac Dock and Launchpad.</li>
              </ol>
            </div>

            <div className="rounded-2xl border border-hairline bg-surface-raised/40 p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-md bg-forest/10 px-2 py-0.5 text-xs font-bold text-forest">
                  Windows 11 / 10 (Edge / Chrome)
                </span>
              </div>
              <ol className="mt-3 space-y-2 text-xs text-ink-secondary list-decimal list-inside leading-relaxed">
                <li>Open <strong>ayurpass.com/dashboard</strong> in Microsoft Edge or Google Chrome.</li>
                <li>Click the <strong>App Available (⤓)</strong> button in the right side of the address bar.</li>
                <li>Click <strong>Install</strong> to add AyurPass to your Windows Start Menu & Taskbar.</li>
                <li>Optionally check <em>&ldquo;Auto-start on device login&rdquo;</em> for reception front desks.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
