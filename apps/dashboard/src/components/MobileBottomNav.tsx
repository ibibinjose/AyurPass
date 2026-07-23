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
  SearchIcon,
  SparkleIcon,
  TrophyIcon,
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

function TabBar({ tabs, ariaLabel }: { tabs: Tab[]; ariaLabel: string }) {
  const pathname = usePathname() || "/";

  return (
    <nav
      className="dash-tab-bar fixed inset-x-0 bottom-0 z-50 border-t border-[var(--separator)] bg-surface/92 backdrop-blur-xl md:hidden"
      style={{
        paddingBottom: "max(0.4rem, env(safe-area-inset-bottom, 0px))",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
      aria-label={ariaLabel}
    >
      <ul className="mx-auto flex h-[3.35rem] max-w-lg items-stretch justify-between gap-0.5 px-1.5">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <li key={tab.href + tab.label} className="flex min-w-0 flex-1">
              <Link
                href={tab.href}
                className={`touch-manipulation flex min-h-[var(--tap-min)] w-full flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 transition-colors active:scale-[0.97] ${
                  active
                    ? "text-forest"
                    : "text-ink-muted active:bg-clay/50"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={`flex h-7 w-10 items-center justify-center rounded-full transition-colors ${
                    active ? "bg-forest/12 text-forest" : ""
                  }`}
                >
                  <Icon className={`h-[22px] w-[22px] ${active ? "stroke-[1.9]" : ""}`} />
                </span>
                <span
                  className={`max-w-full truncate text-[10px] leading-none tracking-tight ${
                    active ? "font-bold" : "font-medium"
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
 * Public site bottom tabs — mobile only.
 * Fixed above the home indicator with blur + safe-area inset.
 */
export function MobileBottomNav() {
  const pathname = usePathname() || "/";
  const { user } = useAuth();

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
      match: (p) =>
        p.startsWith("/dashboard") || p.startsWith("/login") || p.startsWith("/register"),
    },
  ];

  return <TabBar tabs={tabs} ariaLabel="Primary" />;
}

/**
 * Dashboard bottom tabs — role-aware, thumb-zone native pattern (iOS / Android).
 */
export function DashboardBottomNav() {
  const { user } = useAuth();
  if (!user) return null;

  // Honour workspace mode switcher (admin can use seeker/practice tabs too)
  let mode = "seeker";
  try {
    mode =
      (typeof window !== "undefined" &&
        (window.localStorage.getItem("ayurpass.dashboard.workspaceMode") ||
          window.localStorage.getItem("ayurpass.dashboard.viewModeOverride"))) ||
      (user.role === "PLATFORM_ADMIN"
        ? "admin"
        : user.role === "PROVIDER_ADMIN" || user.role === "PROFESSIONAL"
          ? "practice"
          : "seeker");
  } catch {
    mode =
      user.role === "PLATFORM_ADMIN"
        ? "admin"
        : user.role === "PROVIDER_ADMIN" || user.role === "PROFESSIONAL"
          ? "practice"
          : "seeker";
  }

  const isAdmin = mode === "admin";
  const isProvider = mode === "practice" || mode === "staff" || mode === "provider";
  const isCareers = mode === "careers";

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
    : isCareers
      ? [
          {
            href: "/careers",
            label: "Roles",
            icon: SearchIcon,
            match: (p) => p.startsWith("/careers"),
          },
          {
            href: "/dashboard/jobs",
            label: "Hiring",
            icon: UsersIcon,
            match: (p) => p.startsWith("/dashboard/jobs"),
          },
          {
            href: "/discover",
            label: "Practices",
            icon: CompassIcon,
            match: (p) => p.startsWith("/discover"),
          },
          {
            href: "/dashboard/settings",
            label: "You",
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
          // Seeker — keep primary wellness actions in the thumb zone
          {
            href: "/dashboard",
            label: "Home",
            icon: LeafTabIcon,
            match: (p) => p === "/dashboard",
          },
          {
            href: "/dashboard/bookings",
            label: "Bookings",
            icon: CalendarIcon,
            match: (p) => p.startsWith("/dashboard/bookings"),
          },
          {
            href: "/explore",
            label: "Book",
            icon: SparkleIcon,
            match: (p) => p.startsWith("/explore") || p.startsWith("/book"),
          },
          {
            href: "/dashboard/rewards",
            label: "Rewards",
            icon: TrophyIcon,
            match: (p) =>
              p.startsWith("/dashboard/rewards") || p.startsWith("/dashboard/gift-cards"),
          },
          {
            href: "/dashboard/settings",
            label: "You",
            icon: UsersIcon,
            match: (p) =>
              p.startsWith("/dashboard/settings") ||
              p.startsWith("/dashboard/permissions") ||
              p.startsWith("/dashboard/purchases") ||
              p.startsWith("/dashboard/plans") ||
              p.startsWith("/dashboard/assessment"),
          },
        ];

  return <TabBar tabs={tabs} ariaLabel="Dashboard" />;
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

