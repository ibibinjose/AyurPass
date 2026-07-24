"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "./Logo";
import { MenuIcon, XIcon } from "./icons";

const PRIMARY_LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/offers", label: "Offers" },
  { href: "/dashboard/bookings", label: "Calendar" },
  { href: "/explore", label: "Sessions" },
] as const;

const MORE_LINKS = [
  { href: "/about", label: "About us & Mission" },
  { href: "/shop", label: "Shop" },
  { href: "/packages", label: "Packages" },
  { href: "/wellness", label: "Wellness guide" },
  { href: "/list-your-business", label: "List your business" },
  { href: "/partners", label: "For partners" },
] as const;

function navActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const linkClass = (active: boolean) =>
  `rounded-lg px-1.5 py-1 transition-colors ${
    active ? "font-medium text-forest" : "text-ink-secondary hover:text-forest"
  }`;

import { LocationSelectorButton } from "./LocationSelectorButton";
import { InstallAppButton } from "./InstallPrompt";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Adaptive nav: deepen blur/opacity after scroll.
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile drawer on route change.
  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (active) {
        setMobileOpen(false);
        setMoreOpen(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [pathname]);

  // Escape + click-outside for "More" menu.
  useEffect(() => {
    if (!moreOpen && !mobileOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMoreOpen(false);
        setMobileOpen(false);
      }
    }
    function onClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [moreOpen, mobileOpen]);

  // Prevent body scroll when mobile menu is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const moreActive = MORE_LINKS.some((l) => navActive(pathname, l.href));

  return (
    <header
      className={`safe-sticky-top sticky z-50 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ${
        scrolled
          ? "border-[var(--separator)] bg-surface/80 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-xl supports-[backdrop-filter]:bg-surface/70"
          : "border-transparent bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/55"
      }`}
    >
      <div className="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-3 px-[var(--space-page-x)] sm:min-h-16 sm:gap-4">
        <Logo />

        <nav className="hidden items-center gap-5 text-sm lg:flex" aria-label="Primary">
          {PRIMARY_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(navActive(pathname, l.href))}>
              {l.label}
            </Link>
          ))}
          <div className="relative" ref={moreRef}>
            <button
              type="button"
              className={linkClass(moreActive || moreOpen)}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              onClick={() => setMoreOpen((v) => !v)}
            >
              More
              <span className="ml-0.5 inline-block text-[10px] opacity-70" aria-hidden>
                ▾
              </span>
            </button>
            {moreOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 min-w-[12rem] rounded-2xl border border-hairline bg-surface p-1.5 shadow-[0_12px_40px_rgba(36,56,46,0.12)]"
              >
                {MORE_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    role="menuitem"
                    className={`block rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
                      navActive(pathname, l.href)
                        ? "bg-clay/80 font-medium text-forest"
                        : "text-ink-secondary hover:bg-clay/50 hover:text-forest"
                    }`}
                    onClick={() => setMoreOpen(false)}
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="mt-1 border-t border-hairline px-1.5 pt-1.5">
                  <InstallAppButton
                    compact
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-forest hover:bg-clay/50"
                    label="Add to Home Screen"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LocationSelectorButton />
          {loading ? (
            <span className="h-9 w-24 animate-pulse rounded-full bg-clay/80" aria-hidden />
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-forest-deep"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={logout}
                className="text-sm text-ink-secondary transition-colors hover:text-forest"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-ink-secondary transition-colors hover:text-forest"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-forest-deep"
              >
                Begin your journey
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-ink-secondary transition-colors hover:bg-clay/70 hover:text-forest lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls={menuId}
        >
          {mobileOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen ? (
        <div
          id={menuId}
          className="border-t border-hairline bg-background/98 backdrop-blur-md lg:hidden"
        >
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4" aria-label="Mobile">
            {[...PRIMARY_LINKS, ...MORE_LINKS].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-xl px-3 py-3 text-base transition-colors ${
                  navActive(pathname, l.href)
                    ? "bg-clay/80 font-medium text-forest"
                    : "text-ink-secondary hover:bg-clay/40 hover:text-forest"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-hairline pt-4">
              <div className="pb-1">
                <LocationSelectorButton className="w-full justify-between py-2 px-4 text-sm" />
              </div>
              <InstallAppButton
                label="Add to Home Screen"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-forest/20 bg-leaf/10 px-4 text-sm font-bold text-forest"
              />
              {loading ? null : user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="rounded-full bg-forest px-4 py-3 text-center text-sm font-medium text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    className="rounded-xl px-3 py-3 text-left text-sm text-ink-secondary"
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-xl px-3 py-3 text-sm text-ink-secondary"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full bg-forest px-4 py-3 text-center text-sm font-medium text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    Begin your journey
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
