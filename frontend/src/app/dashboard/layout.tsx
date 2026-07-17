"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { DashboardBottomNav } from "@/components/MobileBottomNav";
import { InlineSpinner } from "@/components/ui";
import { loginUrl } from "@/lib/auth-redirect";
import { practicePath } from "@/lib/paths";
import {
  CalendarIcon,
  CompassIcon,
  ExternalLinkIcon,
  FlameIcon,
  GiftIcon,
  GlobeIcon,
  LeafIcon,
  LotusIcon,
  MailIcon,
  MenuIcon,
  MoonIcon,
  PencilIcon,
  SearchIcon,
  ShieldIcon,
  SparkleIcon,
  TrophyIcon,
  UsersIcon,
  XIcon,
} from "@/components/icons";

type IconComp = (props: { className?: string }) => ReactNode;

type NavItem = {
  href: string;
  label: string;
  /** Shorter label for mobile chips / tight UI */
  shortLabel?: string;
  icon: IconComp;
  exact?: boolean;
  hint?: string;
  /** Pin into mobile horizontal chip strip (seekers) */
  chip?: boolean;
};

type NavGroup = { label: string; items: NavItem[] };

const CONSUMER_GROUPS: NavGroup[] = [
  {
    label: "Home",
    items: [
      {
        href: "/dashboard",
        label: "Overview",
        shortLabel: "Home",
        icon: LeafIcon,
        exact: true,
        hint: "Your sanctuary",
        chip: true,
      },
    ],
  },
  {
    label: "Explore",
    items: [
      {
        href: "/discover",
        label: "Discover",
        icon: CompassIcon,
        hint: "Practices near you",
        chip: true,
      },
      {
        href: "/explore",
        label: "Book a session",
        shortLabel: "Book",
        icon: CalendarIcon,
        hint: "Treatments & classes",
        chip: true,
      },
      {
        href: "/shop",
        label: "Shop",
        icon: LotusIcon,
        hint: "Oils & formulations",
        chip: true,
      },
      {
        href: "/retreats",
        label: "Retreats",
        icon: MoonIcon,
        hint: "Immersive programmes",
      },
      {
        href: "/offers",
        label: "Offers",
        icon: GiftIcon,
        hint: "Specials & packages",
      },
    ],
  },
  {
    label: "My wellness",
    items: [
      {
        href: "/dashboard/bookings",
        label: "My bookings",
        shortLabel: "Bookings",
        icon: CalendarIcon,
        hint: "Pay & calendar",
        chip: true,
      },
      {
        href: "/dashboard/assessment",
        label: "Dosha assessment",
        shortLabel: "Dosha",
        icon: CompassIcon,
        hint: "Prakriti profile",
        chip: true,
      },
      {
        href: "/dashboard/plans",
        label: "Treatment plans",
        shortLabel: "Plans",
        icon: SparkleIcon,
        hint: "Shared care",
      },
      {
        href: "/dashboard/purchases",
        label: "My orders",
        shortLabel: "Orders",
        icon: FlameIcon,
        hint: "Shop history",
      },
      {
        href: "/dashboard/rewards",
        label: "Rewards",
        icon: TrophyIcon,
        hint: "Points & tiers",
        chip: true,
      },
      {
        href: "/dashboard/gift-cards",
        label: "Gift cards",
        shortLabel: "Gifts",
        icon: GiftIcon,
        hint: "Give wellness",
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        href: "/dashboard/permissions",
        label: "Privacy",
        icon: ShieldIcon,
        hint: "Health data sharing",
      },
      {
        href: "/dashboard/settings",
        label: "Settings",
        icon: PencilIcon,
        hint: "Profile & photo",
        chip: true,
      },
    ],
  },
];

const PROVIDER_GROUPS: NavGroup[] = [
  {
    label: "Home",
    items: [{ href: "/dashboard", label: "Overview", icon: LeafIcon, exact: true, chip: true }],
  },
  {
    label: "Organiser",
    items: [
      {
        href: "/dashboard/calendar",
        label: "Calendar",
        icon: CalendarIcon,
        hint: "Day board",
        chip: true,
      },
      {
        href: "/dashboard/schedule",
        label: "Schedule",
        icon: CalendarIcon,
        hint: "List view",
        chip: true,
      },
      { href: "/dashboard/rooms", label: "Rooms", icon: MoonIcon },
      { href: "/dashboard/team", label: "Team", icon: UsersIcon, chip: true },
      { href: "/dashboard/clients", label: "Clients", icon: UsersIcon, chip: true },
    ],
  },
  {
    label: "Catalogue",
    items: [
      {
        href: "/dashboard/services",
        label: "Sessions",
        icon: CompassIcon,
        chip: true,
      },
      { href: "/dashboard/packages", label: "Packages", icon: SparkleIcon },
      { href: "/dashboard/retreats", label: "Retreats", icon: MoonIcon },
      { href: "/dashboard/products", label: "Products", icon: LotusIcon },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/dashboard/orders", label: "Orders", icon: FlameIcon, chip: true },
      {
        href: "/dashboard/enquiries",
        label: "Enquiries",
        icon: MailIcon,
        chip: true,
      },
      { href: "/dashboard/terminal", label: "Virtual terminal", icon: SparkleIcon },
      { href: "/dashboard/payments", label: "Payments", icon: TrophyIcon },
    ],
  },
  {
    label: "Practice",
    items: [
      { href: "/dashboard/channels", label: "Online channels", icon: GlobeIcon },
      {
        href: "/dashboard/business",
        label: "Business",
        icon: ShieldIcon,
        hint: "Public page",
        chip: true,
      },
      { href: "/dashboard/settings", label: "Settings", icon: PencilIcon, chip: true },
    ],
  },
];

const ADMIN_GROUPS: NavGroup[] = [
  {
    label: "Platform",
    items: [
      { href: "/dashboard", label: "Overview", icon: LeafIcon, exact: true, chip: true },
      {
        href: "/dashboard/admin/providers",
        label: "Providers",
        icon: UsersIcon,
        chip: true,
      },
      {
        href: "/dashboard/admin/vanity",
        label: "Vanity URLs",
        icon: GlobeIcon,
        hint: "Root @handles",
      },
      {
        href: "/dashboard/admin/feedback",
        label: "Reports",
        icon: ShieldIcon,
        hint: "Abuse & ideas",
        chip: true,
      },
      { href: "/dashboard/admin/offers", label: "Offers", icon: GiftIcon },
      {
        href: "/dashboard/admin/bookings",
        label: "All bookings",
        icon: CalendarIcon,
        chip: true,
      },
      { href: "/dashboard/admin/users", label: "Users", icon: CompassIcon },
      { href: "/dashboard/settings", label: "Settings", icon: PencilIcon, chip: true },
    ],
  },
];

const ROLE_LABEL: Record<string, string> = {
  CONSUMER: "Seeker",
  PROFESSIONAL: "Practitioner",
  PROVIDER_ADMIN: "Practice admin",
  PLATFORM_ADMIN: "Platform admin",
};

const PAGE_TITLES: { test: (p: string) => boolean; title: string }[] = [
  { test: (p) => p === "/dashboard", title: "Overview" },
  { test: (p) => p.startsWith("/dashboard/bookings"), title: "Bookings" },
  { test: (p) => p.startsWith("/dashboard/assessment"), title: "Dosha" },
  { test: (p) => p.startsWith("/dashboard/plans"), title: "Plans" },
  { test: (p) => p.startsWith("/dashboard/purchases"), title: "Orders" },
  { test: (p) => p.startsWith("/dashboard/rewards"), title: "Rewards" },
  { test: (p) => p.startsWith("/dashboard/gift-cards"), title: "Gift cards" },
  { test: (p) => p.startsWith("/dashboard/permissions"), title: "Privacy" },
  { test: (p) => p.startsWith("/dashboard/settings"), title: "Settings" },
  { test: (p) => p.startsWith("/dashboard/business"), title: "Business" },
  { test: (p) => p.startsWith("/dashboard/calendar"), title: "Calendar" },
  { test: (p) => p.startsWith("/dashboard/schedule"), title: "Schedule" },
  { test: (p) => p.startsWith("/dashboard/enquiries"), title: "Enquiries" },
  { test: (p) => p.startsWith("/dashboard/services"), title: "Sessions" },
  { test: (p) => p.startsWith("/dashboard/admin"), title: "Admin" },
];

const COLLAPSE_KEY = "ayurpass.dashboard.sidebarCollapsed";

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact || href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function pageTitle(pathname: string): string {
  return PAGE_TITLES.find((t) => t.test(pathname))?.title ?? "Dashboard";
}

function ChevronIcon({ dir, className }: { dir: "left" | "right"; className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {dir === "left" ? <path d="m15 6-6 6 6 6" /> : <path d="m9 6 6 6-6 6" />}
    </svg>
  );
}

function NavLink({
  item,
  pathname,
  collapsed,
  onNavigate,
  dense,
}: {
  item: NavItem;
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
  /** Larger touch targets for mobile drawer */
  dense?: boolean;
}) {
  const active = isActive(pathname, item.href, item.exact);
  const Icon = item.icon;

  if (collapsed) {
    return (
      <Link
        href={item.href}
        title={item.label}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={`dash-nav-link group relative flex items-center justify-center rounded-xl p-2.5 transition-colors ${
          active
            ? "bg-forest text-white shadow-[0_2px_10px_rgba(36,56,46,0.18)]"
            : "text-ink-secondary hover:bg-clay/80 hover:text-forest"
        }`}
      >
        {active ? (
          <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-leaf" />
        ) : null}
        <Icon className="h-[1.15rem] w-[1.15rem]" />
        <span className="pointer-events-none absolute left-full z-50 ml-2 hidden whitespace-nowrap rounded-lg bg-forest px-2 py-1 text-xs font-semibold text-white shadow-lg group-hover:block">
          {item.label}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`dash-nav-link group relative flex items-center gap-3 rounded-xl px-3 transition-colors ${
        dense ? "min-h-[var(--tap-min)] py-2.5" : "py-2"
      } text-sm font-semibold ${
        active
          ? "bg-forest text-white shadow-[0_2px_10px_rgba(36,56,46,0.14)]"
          : "text-ink-secondary hover:bg-clay/70 hover:text-forest active:bg-clay/80"
      }`}
    >
      {active ? (
        <span
          className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-leaf"
          aria-hidden
        />
      ) : null}
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
          active ? "bg-white/15" : "bg-clay/60 text-forest group-hover:bg-clay"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.hint && !active ? (
        <span className="hidden max-w-[5.5rem] truncate text-[10px] font-medium text-ink-muted xl:inline">
          {item.hint}
        </span>
      ) : null}
    </Link>
  );
}

function SidebarNav({
  groups,
  pathname,
  collapsed,
  onNavigate,
  dense,
}: {
  groups: NavGroup[];
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
  dense?: boolean;
}) {
  return (
    <nav
      className="flex-1 space-y-5 overflow-y-auto overscroll-contain py-1 [-webkit-overflow-scrolling:touch]"
      aria-label="Dashboard"
    >
      {groups.map((group) => (
        <div key={group.label}>
          {!collapsed ? (
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">
              {group.label}
            </p>
          ) : (
            <div className="mx-auto mb-1.5 h-px w-6 bg-hairline" aria-hidden />
          )}
          <div className={`space-y-0.5 ${collapsed ? "flex flex-col items-stretch" : ""}`}>
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                collapsed={collapsed}
                onNavigate={onNavigate}
                dense={dense}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function UserFooter({
  user,
  collapsed,
  practiceName,
  publicHref,
  isSeeker,
  onLogout,
  onNavigate,
  hasBothProfiles,
  onToggleViewMode,
}: {
  user: {
    fullName?: string | null;
    email: string;
    role: string;
    avatarUrl?: string | null;
  };
  collapsed?: boolean;
  practiceName?: string | null;
  publicHref?: string | null;
  isSeeker?: boolean;
  onLogout: () => void;
  onNavigate?: () => void;
  hasBothProfiles?: boolean;
  onToggleViewMode?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const initials =
    user.fullName
      ?.split(/\s+/)
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() ||
    user.email.slice(0, 2).toUpperCase() ||
    "AP";

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;
    const clickOutside = () => setIsOpen(false);
    document.addEventListener("click", clickOutside);
    return () => document.removeEventListener("click", clickOutside);
  }, [isOpen]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const menuItems = (
    <div
      className={`absolute bottom-full mb-2 z-50 bg-surface border border-hairline rounded-2xl p-2 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-100 ${
        collapsed ? "left-2 w-48" : "left-1 right-1"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-2 border-b border-hairline mb-1">
        <p className="text-xs font-bold text-forest truncate">{user.fullName || "Account"}</p>
        <p className="text-[10px] text-ink-muted truncate">{user.email}</p>
      </div>

      <Link
        href="/dashboard/settings"
        onClick={() => {
          closeMenu();
          onNavigate?.();
        }}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-ink-secondary hover:bg-clay/50 hover:text-forest transition-colors"
      >
        <PencilIcon className="h-3.5 w-3.5" />
        Settings & Profile
      </Link>

      {practiceName && publicHref && (
        <Link
          href={publicHref}
          onClick={() => {
            closeMenu();
            onNavigate?.();
          }}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-ink-secondary hover:bg-clay/50 hover:text-forest transition-colors"
        >
          <ExternalLinkIcon className="h-3.5 w-3.5" />
          View Public Page
        </Link>
      )}

      {hasBothProfiles && onToggleViewMode && (
        <button
          type="button"
          onClick={() => {
            closeMenu();
            onToggleViewMode();
          }}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-ink-secondary hover:bg-clay/50 hover:text-forest transition-colors"
        >
          <CompassIcon className="h-3.5 w-3.5" />
          {isSeeker ? "Switch to Hub view" : "Switch to Seeker view"}
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          closeMenu();
          onLogout();
        }}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors mt-1 pt-2 border-t border-hairline"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-3.5 w-3.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
          />
        </svg>
        Sign out
      </button>
    </div>
  );

  if (collapsed) {
    return (
      <div className="mt-auto relative flex flex-col items-center gap-2 border-t border-hairline pt-3">
        <button
          type="button"
          onClick={toggle}
          title="Account profile menu"
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-clay text-xs font-bold text-forest ring-2 ring-surface transition-transform active:scale-95"
        >
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </button>
        {isOpen && menuItems}
      </div>
    );
  }

  return (
    <div className="mt-auto space-y-3 border-t border-hairline pt-3 relative">
      {practiceName && publicHref ? (
        <Link
          href={publicHref}
          onClick={onNavigate}
          className="dash-nav-link flex items-center gap-2 rounded-xl border border-hairline bg-clay/30 px-3 py-2.5 transition-colors hover:border-leaf hover:bg-clay/50"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-bold text-forest">{practiceName}</span>
            <span className="block text-[10px] font-medium text-ink-muted">View public page</span>
          </span>
          <ExternalLinkIcon className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
        </Link>
      ) : isSeeker ? (
        <div className="grid grid-cols-2 gap-1.5">
          <Link
            href="/explore"
            onClick={onNavigate}
            className="dash-nav-link flex min-h-[var(--tap-min)] items-center justify-center gap-1.5 rounded-xl bg-forest px-2 text-xs font-bold text-white active:bg-forest-deep"
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            Book
          </Link>
          <Link
            href="/discover"
            onClick={onNavigate}
            className="dash-nav-link flex min-h-[var(--tap-min)] items-center justify-center gap-1.5 rounded-xl border border-hairline bg-clay/30 px-2 text-xs font-bold text-forest hover:border-leaf"
          >
            <SearchIcon className="h-3.5 w-3.5" />
            Discover
          </Link>
        </div>
      ) : (
        <Link
          href="/discover"
          onClick={onNavigate}
          className="dash-nav-link flex items-center gap-2 rounded-xl border border-hairline bg-clay/30 px-3 py-2 text-xs font-semibold text-forest transition-colors hover:border-leaf"
        >
          <SearchIcon className="h-3.5 w-3.5" />
          Discover
        </Link>
      )}

      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center gap-2.5 rounded-xl px-2 py-2 text-left hover:bg-clay/40 transition-colors"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-clay text-xs font-bold text-forest ring-2 ring-surface">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {user.fullName || "Account"}
          </p>
          <p className="truncate text-[11px] font-medium text-ink-muted">{user.email}</p>
          <span className="mt-1 inline-flex rounded-full bg-leaf/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-forest">
            {ROLE_LABEL[user.role] ?? user.role.replace(/_/g, " ")}
          </span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-4 w-4 shrink-0 text-ink-muted"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
        </svg>
      </button>

      {isOpen && menuItems}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [viewModeOverride, setViewModeOverride] = useState<"seeker" | "provider" | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace(loginUrl(pathname));
  }, [loading, user, router, pathname]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COLLAPSE_KEY);
      if (stored === "1") setCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  function toggleCollapsed() {
    setCollapsed((v) => {
      const next = !v;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const hasBothProfiles =
    user?.role === "PROVIDER_ADMIN" ||
    user?.role === "PROFESSIONAL" ||
    Boolean(user?.provider || user?.professional);

  const isProvider =
    viewModeOverride === "provider" ||
    (viewModeOverride !== "seeker" &&
      (user?.role === "PROVIDER_ADMIN" || user?.role === "PROFESSIONAL"));
  const isAdmin = user?.role === "PLATFORM_ADMIN";
  const isSeeker =
    viewModeOverride === "seeker" ||
    (viewModeOverride !== "provider" && Boolean(user && !isProvider && !isAdmin));

  const groups = useMemo(() => {
    if (!user) return [];
    if (isAdmin) return ADMIN_GROUPS;
    if (isProvider) return PROVIDER_GROUPS;
    return CONSUMER_GROUPS;
  }, [user, isAdmin, isProvider]);

  const chipNav = useMemo(() => {
    const items = groups.flatMap((g) => g.items).filter((i) => i.chip);
    // Prefer curated order for seekers; fall back to first chips
    return items.length ? items : groups.flatMap((g) => g.items).slice(0, 8);
  }, [groups]);

  const provider = user?.provider ?? user?.professional?.provider ?? null;
  const publicHref = provider ? practicePath(provider) : null;
  const practiceName = provider?.businessName ?? null;
  const title = pageTitle(pathname);

  const initials =
    user?.fullName
      ?.split(/\s+/)
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "AP";

  if (loading || !user) {
    return (
      <main className="dash-shell flex flex-col items-center justify-center gap-3 px-5">
        <InlineSpinner label="Preparing your sanctuary…" />
      </main>
    );
  }

  const wide =
    pathname.startsWith("/dashboard/calendar") ||
    pathname.startsWith("/dashboard/schedule") ||
    pathname.startsWith("/dashboard/business");

  function handleLogout() {
    logout();
    router.push("/");
  }

  const hubLabel = isAdmin ? "Admin console" : isProvider ? "Practice hub" : "Your wellness";

  return (
    <div className="dash-shell flex bg-background">
      <a href="#dashboard-main" className="skip-link">
        Skip to dashboard
      </a>

      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-[100dvh] h-screen shrink-0 flex-col border-r border-hairline bg-surface/95 py-4 backdrop-blur-md md:flex ${
          collapsed ? "w-[4.75rem] px-2" : "w-[16.75rem] px-3"
        }`}
        style={{
          paddingTop: "max(1rem, env(safe-area-inset-top, 0px))",
          paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div
          className={`mb-1 flex items-center ${
            collapsed ? "flex-col gap-2" : "justify-between gap-2 px-0.5"
          }`}
        >
          {collapsed ? (
            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest font-display text-sm font-bold text-white shadow-sm"
              title="AyurPass home"
            >
              A
            </Link>
          ) : (
            <Logo />
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            className="dash-nav-link rounded-lg p-2 text-ink-muted transition-colors hover:bg-clay/70 hover:text-forest"
            aria-label={collapsed ? "Expand menu" : "Collapse menu"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronIcon dir={collapsed ? "right" : "left"} className="h-4 w-4" />
          </button>
        </div>

        {!collapsed ? (
          <div className="mt-3 flex items-center justify-between gap-2 px-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
              {hubLabel}
            </p>
            {isSeeker ? (
              <span className="rounded-full bg-gold-soft/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-forest">
                Seeker
              </span>
            ) : null}
          </div>
        ) : (
          <div className="my-2 h-px w-full bg-hairline" />
        )}

        {/* Seeker quick actions (expanded) */}
        {isSeeker && !collapsed ? (
          <div className="mt-3 grid grid-cols-2 gap-1.5 px-0.5">
            <Link
              href="/explore"
              className="dash-nav-link flex items-center justify-center gap-1 rounded-xl bg-forest px-2 py-2 text-[11px] font-bold text-white hover:bg-forest-deep"
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              Book
            </Link>
            <Link
              href="/discover"
              className="dash-nav-link flex items-center justify-center gap-1 rounded-xl border border-hairline bg-clay/40 px-2 py-2 text-[11px] font-bold text-forest hover:border-leaf"
            >
              <CompassIcon className="h-3.5 w-3.5" />
              Discover
            </Link>
          </div>
        ) : null}

        <div className="mt-3 flex min-h-0 flex-1 flex-col">
          <SidebarNav groups={groups} pathname={pathname} collapsed={collapsed} />
          <UserFooter
            user={user}
            collapsed={collapsed}
            practiceName={practiceName}
            publicHref={publicHref}
            isSeeker={isSeeker}
            onLogout={handleLogout}
            hasBothProfiles={hasBothProfiles}
            onToggleViewMode={() =>
              setViewModeOverride((prev) => (prev === "seeker" ? "provider" : "seeker"))
            }
          />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <button
            type="button"
            className="absolute inset-0 bg-forest/45 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="dash-drawer-panel absolute inset-y-0 left-0 flex w-[min(20.5rem,90vw)] flex-col border-r border-hairline bg-surface px-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between gap-2 px-0.5">
              <Logo />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="dash-nav-link flex h-11 w-11 items-center justify-center rounded-xl text-ink-muted hover:bg-clay/70 hover:text-forest"
                aria-label="Close menu"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-3 flex items-center justify-between px-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                {hubLabel}
              </p>
              {isSeeker ? (
                <span className="rounded-full bg-gold-soft/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-forest">
                  Seeker
                </span>
              ) : null}
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              <SidebarNav
                groups={groups}
                pathname={pathname}
                dense
                onNavigate={() => setMobileOpen(false)}
              />
              <UserFooter
                user={user}
                practiceName={practiceName}
                publicHref={publicHref}
                isSeeker={isSeeker}
                onLogout={handleLogout}
                onNavigate={() => setMobileOpen(false)}
                hasBothProfiles={hasBothProfiles}
                onToggleViewMode={() =>
                  setViewModeOverride((prev) => (prev === "seeker" ? "provider" : "seeker"))
                }
              />
            </div>
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar — safe-area for notch / status bar */}
        <header className="dash-mobile-top sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-hairline bg-surface/95 py-2.5 backdrop-blur-md md:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="dash-nav-link flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-hairline text-forest active:bg-clay/60"
              aria-label="Open menu"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="truncate font-display text-base font-semibold leading-tight text-forest">
                {title}
              </p>
              <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                {isSeeker ? "Wellness seeker" : hubLabel}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {isSeeker ? (
              <Link
                href="/explore"
                className="dash-nav-link inline-flex min-h-10 items-center rounded-full bg-forest px-3.5 text-xs font-bold text-white active:bg-forest-deep"
              >
                Book
              </Link>
            ) : null}
            <Link
              href="/dashboard/settings"
              className="dash-nav-link flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-clay text-[11px] font-bold text-forest ring-1 ring-hairline"
              aria-label="Account settings"
            >
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </Link>
          </div>
        </header>

        {/* Mobile context chips — curated, not full nav dump */}
        <nav
          className="dash-chip-scroll flex gap-1.5 overflow-x-auto border-b border-hairline bg-surface/90 px-3 py-2 md:hidden"
          style={{
            paddingLeft: "max(0.75rem, env(safe-area-inset-left, 0px))",
            paddingRight: "max(0.75rem, env(safe-area-inset-right, 0px))",
          }}
          aria-label="Quick links"
        >
          {chipNav.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`dash-nav-link inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[13px] font-semibold transition-colors active:scale-[0.98] ${
                  active
                    ? "bg-forest text-white shadow-sm"
                    : "border border-hairline bg-surface text-ink-secondary active:bg-clay/50"
                }`}
              >
                <Icon className="h-3.5 w-3.5 opacity-90" />
                {item.shortLabel ?? item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="dash-nav-link inline-flex min-h-9 shrink-0 items-center rounded-full border border-dashed border-hairline px-3.5 text-[13px] font-semibold text-ink-muted active:bg-clay/40"
          >
            More
          </button>
        </nav>

        <main
          id="dashboard-main"
          className={`mx-auto w-full flex-1 px-[var(--space-page-x)] py-5 sm:py-8 md:pb-10 ${
            wide ? "max-w-[88rem]" : "max-w-5xl"
          } pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-10`}
          style={{
            paddingLeft: "max(var(--space-page-x), env(safe-area-inset-left, 0px))",
            paddingRight: "max(var(--space-page-x), env(safe-area-inset-right, 0px))",
          }}
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
      <DashboardBottomNav />
    </div>
  );
}
