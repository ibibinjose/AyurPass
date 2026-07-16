"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
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
  { href: "/dashboard", label: "Overview", icon: LeafIcon },
  { href: "/explore", label: "Book a session", icon: CalendarIcon },
  { href: "/shop", label: "Shop", icon: LotusIcon },
  { href: "/dashboard/assessment", label: "Dosha assessment", icon: CompassIcon },
  { href: "/dashboard/bookings", label: "My bookings", icon: CalendarIcon },
  { href: "/dashboard/purchases", label: "My orders", icon: LotusIcon },
  { href: "/dashboard/rewards", label: "Rewards", icon: TrophyIcon },
  { href: "/dashboard/gift-cards", label: "Gift cards", icon: GiftIcon },
  { href: "/dashboard/plans", label: "Treatment plans", icon: SparkleIcon },
  { href: "/dashboard/settings", label: "Settings", icon: PencilIcon },
];

const PROVIDER_NAV = [
  { href: "/dashboard", label: "Overview", icon: LeafIcon },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarIcon },
  { href: "/dashboard/schedule", label: "Schedule", icon: CalendarIcon },
  { href: "/dashboard/services", label: "Sessions", icon: CompassIcon },
  { href: "/dashboard/packages", label: "Packages", icon: SparkleIcon },
  { href: "/dashboard/retreats", label: "Retreats", icon: CompassIcon },
  { href: "/dashboard/products", label: "Products", icon: LotusIcon },
  { href: "/dashboard/orders", label: "Orders", icon: FlameIcon },
  { href: "/dashboard/terminal", label: "Virtual terminal", icon: SparkleIcon },
  { href: "/dashboard/rooms", label: "Rooms", icon: MoonIcon },
  { href: "/dashboard/team", label: "Team", icon: UsersIcon },
  { href: "/dashboard/channels", label: "Online channels", icon: CompassIcon },
  { href: "/dashboard/business", label: "Business", icon: ShieldIcon },
  { href: "/dashboard/enquiries", label: "Enquiries", icon: UsersIcon },
  { href: "/dashboard/settings", label: "Settings", icon: PencilIcon },
];

const ADMIN_NAV = [
  { href: "/dashboard", label: "Overview", icon: LeafIcon },
  { href: "/dashboard/admin/providers", label: "Providers", icon: UsersIcon },
  { href: "/dashboard/admin/bookings", label: "All bookings", icon: CalendarIcon },
  { href: "/dashboard/admin/users", label: "Users", icon: CompassIcon },
  { href: "/dashboard/settings", label: "Settings", icon: PencilIcon },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-ink-muted">Preparing your sanctuary…</p>
      </main>
    );
  }

  const isProvider = user.role === "PROVIDER_ADMIN" || user.role === "PROFESSIONAL";
  const nav =
    user.role === "PLATFORM_ADMIN" ? ADMIN_NAV : isProvider ? PROVIDER_NAV : CONSUMER_NAV;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-hairline bg-surface px-5 py-6 md:flex">
        <Logo />
        <nav className="mt-8 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-forest text-white"
                    : "text-ink-secondary hover:bg-clay/70 hover:text-forest"
                }`}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-hairline pt-4">
          <p className="truncate text-sm font-medium text-foreground">{user.fullName}</p>
          <p className="truncate text-xs text-ink-muted">{user.email}</p>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="mt-3 text-sm text-ink-muted hover:text-forest"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-hairline bg-surface px-5 py-4 md:hidden">
          <Logo />
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="text-sm text-ink-muted"
          >
            Sign out
          </button>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-hairline bg-surface px-3 py-2 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm ${
                pathname === item.href ? "bg-forest text-white" : "text-ink-secondary"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
