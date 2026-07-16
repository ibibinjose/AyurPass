"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  CalendarIcon,
  CompassIcon,
  LotusIcon,
  MoonIcon,
  UsersIcon,
} from "@/components/icons";

type Tab = {
  href: string;
  label: string;
  icon: (props: { className?: string }) => ReactNode;
  match: (pathname: string) => boolean;
};

const PUBLIC_TABS: Tab[] = [
  {
    href: "/discover",
    label: "Discover",
    icon: CompassIcon,
    match: (p) =>
      p === "/discover" ||
      p.startsWith("/providers") ||
      p.startsWith("/practice") ||
      p.startsWith("/me/"),
  },
  {
    href: "/retreats",
    label: "Retreats",
    icon: MoonIcon,
    match: (p) => p.startsWith("/retreats"),
  },
  {
    href: "/explore",
    label: "Book",
    icon: CalendarIcon,
    match: (p) => p.startsWith("/explore") || p.startsWith("/book"),
  },
  {
    href: "/shop",
    label: "Shop",
    icon: LotusIcon,
    match: (p) => p.startsWith("/shop") || p.startsWith("/packages") || p.startsWith("/offers"),
  },
];

/**
 * Apple-style bottom tab bar — mobile only (hidden from `md` up).
 * Fixed above the home indicator with blur + safe-area inset.
 */
export function MobileBottomNav() {
  const pathname = usePathname() || "/";
  const { user } = useAuth();

  // Auth screens keep a clean full-screen form.
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/dashboard")
  ) {
    return null;
  }

  const accountHref = user ? "/dashboard" : "/login";
  const tabs: Tab[] = [
    ...PUBLIC_TABS,
    {
      href: accountHref,
      label: user ? "You" : "Sign in",
      icon: UsersIcon,
      match: (p) => p.startsWith("/dashboard") || p.startsWith("/login") || p.startsWith("/register"),
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--separator)] bg-surface/90 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom, 0px))" }}
      aria-label="Primary"
    >
      <ul className="mx-auto flex h-[3.25rem] max-w-lg items-stretch justify-between px-1">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <li key={tab.href + tab.label} className="flex min-w-0 flex-1">
              <Link
                href={tab.href}
                className={`flex min-h-[44px] w-full flex-col items-center justify-center gap-0.5 px-1 transition-colors ${
                  active ? "text-[var(--system-blue)]" : "text-ink-muted"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={`h-[22px] w-[22px] ${active ? "stroke-[1.9]" : ""}`} />
                <span
                  className={`max-w-full truncate text-[10px] leading-none ${
                    active ? "font-semibold" : "font-medium"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Bottom tabs for the signed-in dashboard (mobile).
 * Keeps primary destinations one thumb-reach away.
 */
export function DashboardBottomNav() {
  const pathname = usePathname() || "/";
  const { user } = useAuth();
  if (!user) return null;

  const isProvider = user.role === "PROVIDER_ADMIN" || user.role === "PROFESSIONAL";
  const isAdmin = user.role === "PLATFORM_ADMIN";

  const tabs: Tab[] = isAdmin
    ? [
        {
          href: "/dashboard",
          label: "Home",
          icon: LeafTabIcon,
          match: (p) => p === "/dashboard",
        },
        {
          href: "/dashboard/admin/providers",
          label: "Providers",
          icon: UsersIcon,
          match: (p) => p.startsWith("/dashboard/admin/providers"),
        },
        {
          href: "/dashboard/admin/bookings",
          label: "Bookings",
          icon: CalendarIcon,
          match: (p) => p.startsWith("/dashboard/admin/bookings"),
        },
        {
          href: "/dashboard/settings",
          label: "Settings",
          icon: UsersIcon,
          match: (p) => p.startsWith("/dashboard/settings"),
        },
      ]
    : isProvider
      ? [
          {
            href: "/dashboard",
            label: "Home",
            icon: LeafTabIcon,
            match: (p) => p === "/dashboard",
          },
          {
            href: "/dashboard/calendar",
            label: "Calendar",
            icon: CalendarIcon,
            match: (p) =>
              p.startsWith("/dashboard/calendar") || p.startsWith("/dashboard/schedule"),
          },
          {
            href: "/dashboard/enquiries",
            label: "Leads",
            icon: UsersIcon,
            match: (p) => p.startsWith("/dashboard/enquiries"),
          },
          {
            href: "/dashboard/business",
            label: "Business",
            icon: LotusIcon,
            match: (p) =>
              p.startsWith("/dashboard/business") || p.startsWith("/dashboard/services"),
          },
          {
            href: "/dashboard/settings",
            label: "You",
            icon: UsersIcon,
            match: (p) => p.startsWith("/dashboard/settings"),
          },
        ]
      : [
          {
            href: "/dashboard",
            label: "Home",
            icon: LeafTabIcon,
            match: (p) => p === "/dashboard",
          },
          {
            href: "/discover",
            label: "Discover",
            icon: CompassIcon,
            match: (p) => p.startsWith("/discover"),
          },
          {
            href: "/dashboard/bookings",
            label: "Bookings",
            icon: CalendarIcon,
            match: (p) => p.startsWith("/dashboard/bookings"),
          },
          {
            href: "/dashboard/assessment",
            label: "Dosha",
            icon: CompassIcon,
            match: (p) => p.startsWith("/dashboard/assessment"),
          },
          {
            href: "/dashboard/settings",
            label: "You",
            icon: UsersIcon,
            match: (p) =>
              p.startsWith("/dashboard/settings") || p.startsWith("/dashboard/permissions"),
          },
        ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--separator)] bg-surface/90 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom, 0px))" }}
      aria-label="Dashboard"
    >
      <ul className="mx-auto flex h-[3.25rem] max-w-lg items-stretch justify-between px-1">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <li key={tab.href} className="flex min-w-0 flex-1">
              <Link
                href={tab.href}
                className={`flex min-h-[44px] w-full flex-col items-center justify-center gap-0.5 px-1 transition-colors ${
                  active ? "text-[var(--system-blue)]" : "text-ink-muted"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-[22px] w-[22px]" />
                <span
                  className={`max-w-full truncate text-[10px] leading-none ${
                    active ? "font-semibold" : "font-medium"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function LeafTabIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 19C5 10 10 4 20 4c0 10-6 15-15 15Z" />
      <path d="M5 19c3-5 7-9 11-11" />
    </svg>
  );
}
