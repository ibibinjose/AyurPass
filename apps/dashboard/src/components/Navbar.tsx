"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "./Logo";
import {
  MenuIcon,
  XIcon,
  SearchIcon,
  CalendarIcon,
  CompassIcon,
  SparkleIcon,
  GiftIcon,
  UsersIcon,
  LotusIcon,
  FlameIcon,
  MoonIcon,
  ShieldIcon,
  PencilIcon,
} from "./icons";
import { LocationSelectorButton } from "./LocationSelectorButton";
import { InstallAppButton } from "./InstallPrompt";
import { NotificationCenter } from "./NotificationCenter";

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

const PRIMARY_LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/explore", label: "Sessions" },
  { href: "/events", label: "Events" },
  { href: "/offers", label: "Offers" },
  { href: "/dashboard/bookings", label: "Calendar" },
] as const;

const MORE_LINKS = [
  { href: "/retreats", label: "Retreats & Escapes", icon: MoonIcon },
  { href: "/shop", label: "Apothecary Shop", icon: LotusIcon },
  { href: "/packages", label: "Wellness Packages", icon: SparkleIcon },
  { href: "/wellness", label: "Ayurvedic Guide", icon: CompassIcon },
  { href: "/about", label: "About & Mission", icon: ShieldIcon },
  { href: "/list-your-business", label: "List Your Practice", icon: FlameIcon },
  { href: "/partners", label: "Global Partners", icon: UsersIcon },
] as const;

const QUICK_SEARCH_TAGS = [
  { label: "Abhyanga Massage", href: "/explore?q=Abhyanga" },
  { label: "Panchakarma Detox", href: "/explore?q=Panchakarma" },
  { label: "Yoga Flow", href: "/explore?q=Yoga" },
  { label: "Ayurvedic Consult", href: "/explore?q=Consultation" },
];

function navActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const linkClass = (active: boolean) =>
  `profile-spring rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
    active
      ? "bg-forest text-white shadow-2xs"
      : "text-ink-secondary hover:bg-clay/50 hover:text-forest"
  }`;

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (active) {
        setMobileOpen(false);
        setMoreOpen(false);
        setUserMenuOpen(false);
        setNotifOpen(false);
        setSearchFocused(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen && !mobileOpen && !userMenuOpen && !notifOpen && !searchFocused) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMoreOpen(false);
        setMobileOpen(false);
        setUserMenuOpen(false);
        setNotifOpen(false);
        setSearchFocused(false);
      }
    }
    function onClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [moreOpen, mobileOpen, userMenuOpen, notifOpen, searchFocused]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const moreActive = MORE_LINKS.some((l) => navActive(pathname, l.href));

  const initials =
    user?.fullName
      ?.split(/\s+/)
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() ||
    user?.email.slice(0, 2).toUpperCase() ||
    "AP";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-hairline bg-surface/90 shadow-xs backdrop-blur-xl supports-[backdrop-filter]:bg-surface/80"
          : "border-b border-hairline/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/65"
      }`}
    >
      {/* Top Gradient Accent Bar */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-forest via-gold to-leaf opacity-90" />

      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        {/* Live Search Quick Input */}
        <div className="relative hidden md:block flex-1 max-w-md" ref={searchRef}>
          <div className="relative">
            <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest" />
            <input
              type="text"
              placeholder="Search practices, sessions, retreats…"
              onFocus={() => setSearchFocused(true)}
              className="w-full rounded-full border border-hairline/80 bg-surface/90 pl-10 pr-9 py-2 text-xs font-medium placeholder:text-ink-muted shadow-2xs focus:border-forest focus:bg-surface focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-block rounded bg-clay/60 px-1.5 py-0.5 text-[9px] font-bold text-ink-muted">
              ⌘K
            </kbd>
          </div>

          {/* Quick Search Preview Popover */}
          {searchFocused && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-hairline bg-surface p-3 shadow-2xl backdrop-blur-xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-2 px-1">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SEARCH_TAGS.map((tag) => (
                  <Link
                    key={tag.label}
                    href={tag.href}
                    onClick={() => setSearchFocused(false)}
                    className="profile-spring rounded-full border border-hairline bg-clay/30 px-3 py-1 text-xs font-bold text-forest hover:bg-forest hover:text-white transition-colors"
                  >
                    {tag.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Primary Links */}
        <nav className="hidden items-center gap-1.5 text-xs lg:flex" aria-label="Primary">
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
              <span>More</span>
              <span className="ml-1 text-[10px]" aria-hidden>
                ▾
              </span>
            </button>
            {moreOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2.5 min-w-[15rem] rounded-2xl border border-hairline bg-surface/95 p-2 shadow-2xl backdrop-blur-xl"
              >
                {MORE_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    role="menuitem"
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                      navActive(pathname, l.href)
                        ? "bg-forest text-white shadow-2xs"
                        : "text-ink-secondary hover:bg-clay/50 hover:text-forest"
                    }`}
                    onClick={() => setMoreOpen(false)}
                  >
                    <l.icon className="h-4 w-4" />
                    <span>{l.label}</span>
                  </Link>
                ))}
                <div className="mt-1.5 border-t border-hairline pt-1.5">
                  <InstallAppButton
                    compact
                    className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-forest hover:bg-clay/50"
                    label="Add to Home Screen"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </nav>

        {/* Topbar Actions & User Area */}
        <div className="hidden items-center gap-3 lg:flex">
          <LocationSelectorButton />

          {/* Notification Center */}
          {user && <NotificationCenter />}

          {loading ? (
            <span className="h-9 w-24 animate-pulse rounded-full bg-clay/80" aria-hidden />
          ) : user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="profile-spring flex items-center gap-2 rounded-full border border-hairline bg-surface p-1 pr-3 text-xs font-bold text-forest shadow-2xs hover:border-leaf hover:bg-clay/30"
              >
                <div className="relative">
                  <span className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-forest text-[11px] font-bold text-white shadow-2xs">
                    {initials}
                  </span>
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-surface" />
                </div>
                <span className="max-w-[110px] truncate">{user.fullName || "Account"}</span>
                <span className="text-[10px]">▾</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2.5 w-60 rounded-2xl border border-hairline bg-surface/95 p-2 shadow-2xl backdrop-blur-xl">
                  <div className="border-b border-hairline px-3 py-2 mb-1">
                    <p className="text-xs font-bold text-forest truncate">{user.fullName || "User Account"}</p>
                    <p className="text-[10px] font-medium text-ink-muted truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-forest hover:bg-clay/50"
                  >
                    <SparkleIcon className="h-4 w-4 text-forest" />
                    <span>Dashboard Overview</span>
                  </Link>

                  <Link
                    href="/dashboard/bookings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-ink-secondary hover:bg-clay/50 hover:text-forest"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    <span>My Calendar &amp; Bookings</span>
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-ink-secondary hover:bg-clay/50 hover:text-forest"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Account Settings</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors mt-1 pt-2 border-t border-hairline"
                  >
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="profile-spring rounded-full border border-hairline bg-surface px-4 py-2 text-xs font-bold text-forest shadow-2xs hover:bg-clay/40"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="profile-spring rounded-full bg-forest px-4.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-forest-deep active:scale-95"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-hairline bg-surface text-forest transition-all hover:bg-clay/50 lg:hidden shadow-2xs"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls={menuId}
        >
          {mobileOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile navigation drawer */}
      {mobileOpen ? (
        <div
          id={menuId}
          className="border-t border-hairline bg-surface/95 backdrop-blur-2xl lg:hidden shadow-xl"
        >
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4" aria-label="Mobile">
            <Link
              href="/discover"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 rounded-2xl border border-hairline bg-background/80 p-3 text-xs font-bold text-ink-muted mb-2 shadow-2xs"
            >
              <SearchIcon className="h-4 w-4 text-forest" />
              <span>Search practices, sessions, retreats…</span>
            </Link>

            {[...PRIMARY_LINKS, ...MORE_LINKS].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all ${
                  navActive(pathname, l.href)
                    ? "bg-forest text-white shadow-2xs"
                    : "text-ink-secondary hover:bg-clay/50 hover:text-forest"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <span>{l.label}</span>
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2.5 border-t border-hairline pt-4">
              <LocationSelectorButton className="w-full justify-between py-2.5 px-4 text-xs font-bold" />
              <InstallAppButton
                label="Add to Home Screen"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-forest/20 bg-leaf/10 px-4 text-xs font-bold text-forest"
              />
              {loading ? null : user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="rounded-full bg-forest px-4 py-3 text-center text-xs font-bold text-white shadow-2xs"
                    onClick={() => setMobileOpen(false)}
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    type="button"
                    className="rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/login"
                    className="rounded-full border border-hairline bg-surface py-3 text-center text-xs font-bold text-forest shadow-2xs"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full bg-forest py-3 text-center text-xs font-bold text-white shadow-2xs"
                    onClick={() => setMobileOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
