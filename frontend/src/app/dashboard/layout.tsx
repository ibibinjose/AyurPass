"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { DashboardBottomNav } from "@/components/MobileBottomNav";
import { InlineSpinner } from "@/components/ui";
import {
  CalendarIcon,
  CompassIcon,
  FlameIcon,
  GiftIcon,
  LeafIcon,
  LotusIcon,
  MoonIcon,
  ShieldIcon,
  SparkleIcon,
  TrophyIcon,
  UsersIcon,
  PencilIcon,
} from "@/components/icons";

const CONSUMER_NAV = [
  { href: "/dashboard", label: "Overview", icon: LeafIcon, exact: true },
  { href: "/explore", label: "Book a session", icon: CalendarIcon },
  { href: "/shop", label: "Shop", icon: LotusIcon },
  { href: "/dashboard/assessment", label: "Dosha assessment", icon: CompassIcon },
  { href: "/dashboard/bookings", label: "My bookings", icon: CalendarIcon },
  { href: "/dashboard/purchases", label: "My orders", icon: LotusIcon },
  { href: "/dashboard/rewards", label: "Rewards", icon: TrophyIcon },
  { href: "/dashboard/gift-cards", label: "Gift cards", icon: GiftIcon },
  { href: "/dashboard/plans", label: "Treatment plans", icon: SparkleIcon },
  { href: "/dashboard/permissions", label: "Privacy", icon: ShieldIcon },
  { href: "/dashboard/settings", label: "Settings", icon: PencilIcon },
];

const PROVIDER_NAV = [
  { href: "/dashboard", label: "Overview", icon: LeafIcon, exact: true },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarIcon },
  { href: "/dashboard/schedule", label: "Schedule", icon: CalendarIcon },
  { href: "/dashboard/services", label: "Sessions", icon: CompassIcon },
  { href: "/dashboard/packages", label: "Packages", icon: SparkleIcon },
  { href: "/dashboard/retreats", label: "Retreats", icon: CompassIcon },
  { href: "/dashboard/products", label: "Products", icon: LotusIcon },
  { href: "/dashboard/orders", label: "Orders", icon: FlameIcon },
  { href: "/dashboard/enquiries", label: "Enquiries", icon: UsersIcon },
  { href: "/dashboard/terminal", label: "Virtual terminal", icon: SparkleIcon },
  { href: "/dashboard/payments", label: "Payments", icon: SparkleIcon },
  { href: "/dashboard/rooms", label: "Rooms", icon: MoonIcon },
  { href: "/dashboard/team", label: "Team", icon: UsersIcon },
  { href: "/dashboard/channels", label: "Online channels", icon: CompassIcon },
  { href: "/dashboard/business", label: "Business", icon: ShieldIcon },
  { href: "/dashboard/settings", label: "Settings", icon: PencilIcon },
];

const ADMIN_NAV = [
  { href: "/dashboard", label: "Overview", icon: LeafIcon, exact: true },
  { href: "/dashboard/admin/providers", label: "Providers", icon: UsersIcon },
  { href: "/dashboard/admin/offers", label: "Offers", icon: GiftIcon },
  { href: "/dashboard/admin/bookings", label: "All bookings", icon: CalendarIcon },
  { href: "/dashboard/admin/users", label: "Users", icon: CompassIcon },
  { href: "/dashboard/settings", label: "Settings", icon: PencilIcon },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact || href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-5">
        <InlineSpinner label="Preparing your sanctuary…" />
      </main>
    );
  }

  const isProvider = user.role === "PROVIDER_ADMIN" || user.role === "PROFESSIONAL";
  const nav =
    user.role === "PLATFORM_ADMIN" ? ADMIN_NAV : isProvider ? PROVIDER_NAV : CONSUMER_NAV;

  return (
    <div className="flex min-h-screen bg-background">
      <a href="#dashboard-main" className="skip-link">
        Skip to dashboard
      </a>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-hairline bg-surface px-5 py-6 md:flex">
        <Logo />
        <nav className="mt-8 flex-1 space-y-0.5 overflow-y-auto" aria-label="Dashboard">
          {nav.map((item) => {
            const active = isActive(pathname, item.href, "exact" in item ? item.exact : false);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-forest text-white shadow-[0_2px_8px_rgba(36,56,46,0.12)]"
                    : "text-ink-secondary hover:bg-clay/70 hover:text-forest"
                }`}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-hairline pt-4">
          <p className="truncate text-sm font-medium text-foreground">
            {user.fullName || "Account"}
          </p>
          <p className="truncate text-xs text-ink-muted">{user.email}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/" className="text-sm text-ink-muted transition-colors hover:text-forest">
              Home
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="text-sm text-ink-muted transition-colors hover:text-forest"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-hairline bg-surface px-5 py-4 md:hidden">
          <Logo />
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="rounded-full px-3 py-2 text-sm text-ink-muted hover:bg-clay/60"
          >
            Sign out
          </button>
        </header>
        <nav
          className="chip-scroll flex gap-1.5 overflow-x-auto border-b border-hairline bg-surface px-3 py-2.5 md:hidden"
          aria-label="Dashboard mobile"
        >
          {nav.map((item) => {
            const active = isActive(pathname, item.href, "exact" in item ? item.exact : false);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-forest text-white" : "text-ink-secondary hover:bg-clay/60"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main
          id="dashboard-main"
          className="mx-auto w-full max-w-4xl flex-1 px-[var(--space-page-x)] py-6 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:py-10 md:pb-10"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
      <DashboardBottomNav />
    </div>
  );
}
