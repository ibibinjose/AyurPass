"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { DashboardBottomNav } from "@/components/MobileBottomNav";
import { NotificationCenter } from "@/components/NotificationCenter";
import { InlineSpinner } from "@/components/ui";
import { loginUrl } from "@/lib/auth-redirect";
import { resolveMediaUrl } from "@/lib/media";
import { practicePath } from "@/lib/paths";
import {
  availableModes,
  homeForMode,
  MODE_META,
  readStoredMode,
  resolveMode,
  roleDisplayLabel,
  type WorkspaceMode,
  writeStoredMode,
} from "@/lib/persona";
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
  shortLabel?: string;
  icon: IconComp;
  exact?: boolean;
  hint?: string;
  badge?: string;
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
        href: "/dashboard/bookings",
        label: "Calendar",
        shortLabel: "Calendar",
        icon: CalendarIcon,
        hint: "Colour-coded sessions",
        chip: true,
      },
      {
        href: "/explore",
        label: "Sessions",
        shortLabel: "Sessions",
        icon: SparkleIcon,
        hint: "Book treatments & classes",
        chip: true,
      },
      {
        href: "/offers",
        label: "Offers",
        icon: GiftIcon,
        hint: "Specials & packages",
        chip: true,
      },
      {
        href: "/shop",
        label: "Shop",
        icon: LotusIcon,
        hint: "Oils & formulations",
      },
      {
        href: "/events",
        label: "Events",
        icon: FlameIcon,
        hint: "Classes & workshops",
        chip: true,
      },
      {
        href: "/retreats",
        label: "Retreats",
        icon: MoonIcon,
        hint: "Immersive escapes",
      },
      {
        href: "/careers",
        label: "Careers",
        shortLabel: "Jobs",
        icon: SearchIcon,
        hint: "Open wellness roles",
      },
    ],
  },
  {
    label: "My Wellness",
    items: [
      {
        href: "/dashboard/pass",
        label: "Wellness Pass",
        shortLabel: "Pass",
        icon: TrophyIcon,
        hint: "Apple & Google Wallet",
        chip: true,
      },
      {
        href: "/dashboard/bookings",
        label: "My Bookings",
        shortLabel: "List",
        icon: CalendarIcon,
        hint: "Pay & manage",
      },
      {
        href: "/dashboard/assessment",
        label: "Dosha Assessment",
        shortLabel: "Dosha",
        icon: CompassIcon,
        hint: "Prakriti profile",
        chip: true,
      },
      {
        href: "/dashboard/plans",
        label: "Treatment Plans",
        shortLabel: "Plans",
        icon: SparkleIcon,
        hint: "Shared care",
      },
      {
        href: "/dashboard/purchases",
        label: "My Orders",
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
        label: "Gift Cards",
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
    items: [
      {
        href: "/dashboard",
        label: "Overview",
        icon: LeafIcon,
        exact: true,
        chip: true,
        hint: "Practice stats",
      },
    ],
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
      { href: "/dashboard/rooms", label: "Rooms", icon: MoonIcon, hint: "Practice spaces" },
      {
        href: "/dashboard/team",
        label: "Team",
        icon: UsersIcon,
        chip: true,
        hint: "Staff profiles",
      },
      {
        href: "/dashboard/jobs",
        label: "Jobs & Hiring",
        icon: UsersIcon,
        chip: true,
        hint: "Post vacancies",
      },
      {
        href: "/dashboard/clients",
        label: "Clients",
        icon: UsersIcon,
        chip: true,
        hint: "CRM directory",
      },
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
        hint: "Bookable sessions",
      },
      { href: "/dashboard/packages", label: "Packages", icon: SparkleIcon, hint: "Bundled sessions" },
      {
        href: "/dashboard/events",
        label: "Events",
        icon: FlameIcon,
        chip: true,
        hint: "Host workshops",
      },
      { href: "/dashboard/retreats", label: "Retreats", icon: MoonIcon, hint: "Sanctuary escapes" },
      { href: "/dashboard/products", label: "Products", icon: LotusIcon, hint: "Store inventory" },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/dashboard/orders", label: "Orders", icon: FlameIcon, chip: true, hint: "Sales history" },
      {
        href: "/dashboard/enquiries",
        label: "Enquiries",
        icon: MailIcon,
        chip: true,
        hint: "Client messaging",
      },
      {
        href: "/dashboard/scan",
        label: "Scan Pass",
        icon: SearchIcon,
        chip: true,
        hint: "Desk check-in",
      },
      { href: "/dashboard/terminal", label: "Virtual Terminal", icon: SparkleIcon, hint: "Accept payments" },
      { href: "/dashboard/payments", label: "Payments", icon: TrophyIcon, hint: "Counter checkouts" },
    ],
  },
  {
    label: "Practice",
    items: [
      { href: "/dashboard/channels", label: "Online Channels", icon: GlobeIcon, hint: "Integrations & APIs" },
      {
        href: "/dashboard/verification",
        label: "Verification",
        icon: ShieldIcon,
        hint: "Credentials & docs",
        chip: true,
      },
      {
        href: "/dashboard/staff",
        label: "Staff & Access",
        icon: ShieldIcon,
        hint: "Roles & permissions",
        chip: true,
      },
      {
        href: "/dashboard/business",
        label: "Business",
        icon: ShieldIcon,
        hint: "Public page",
        chip: true,
      },
      { href: "/dashboard/settings", label: "Settings", icon: PencilIcon, chip: true, hint: "Configurations" },
    ],
  },
];

const ADMIN_GROUPS: NavGroup[] = [
  {
    label: "Platform",
    items: [
      { href: "/dashboard", label: "Overview", icon: LeafIcon, exact: true, chip: true, hint: "Control center" },
      {
        href: "/dashboard/admin/providers",
        label: "Providers",
        icon: UsersIcon,
        chip: true,
        hint: "Approved practices",
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
      { href: "/dashboard/admin/offers", label: "Offers", icon: GiftIcon, hint: "Global campaigns" },
      {
        href: "/dashboard/admin/bookings",
        label: "All Bookings",
        icon: CalendarIcon,
        chip: true,
        hint: "Platform schedule",
      },
      {
        href: "/dashboard/jobs",
        label: "Jobs & Careers",
        icon: CompassIcon,
        chip: true,
        hint: "Openings & hiring",
      },
      { href: "/dashboard/admin/users", label: "Users", icon: CompassIcon, hint: "Registered accounts" },
      { href: "/dashboard/settings", label: "Settings", icon: PencilIcon, chip: true, hint: "Admin settings" },
    ],
  },
];

const STAFF_GROUPS: NavGroup[] = [
  {
    label: "Home",
    items: [
      {
        href: "/dashboard",
        label: "Overview",
        icon: LeafIcon,
        exact: true,
        chip: true,
        hint: "Your day",
      },
    ],
  },
  {
    label: "Work",
    items: [
      {
        href: "/dashboard/calendar",
        label: "Calendar",
        icon: CalendarIcon,
        chip: true,
        hint: "Your schedule",
      },
      {
        href: "/dashboard/schedule",
        label: "Schedule",
        icon: CalendarIcon,
        hint: "List view",
      },
      {
        href: "/dashboard/clients",
        label: "Clients",
        icon: UsersIcon,
        chip: true,
        hint: "People you care for",
      },
      {
        href: "/dashboard/services",
        label: "Sessions",
        icon: CompassIcon,
        chip: true,
        hint: "What you deliver",
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        href: "/dashboard/settings",
        label: "Settings",
        icon: PencilIcon,
        chip: true,
        hint: "Profile & photo",
      },
      {
        href: "/careers",
        label: "Careers Board",
        icon: SearchIcon,
        hint: "Browse open roles",
      },
    ],
  },
];

const CAREERS_GROUPS: NavGroup[] = [
  {
    label: "Careers",
    items: [
      {
        href: "/careers",
        label: "Open Roles",
        icon: SearchIcon,
        chip: true,
        hint: "Browse vacancies",
      },
      {
        href: "/dashboard/jobs",
        label: "Hiring (Practice)",
        icon: UsersIcon,
        chip: true,
        hint: "Post roles if running a practice",
      },
      {
        href: "/discover",
        label: "Practices",
        icon: CompassIcon,
        hint: "Find employers",
      },
      {
        href: "/dashboard/settings",
        label: "Profile",
        icon: PencilIcon,
        chip: true,
        hint: "Your account",
      },
    ],
  },
];

const PAGE_TITLES: { test: (p: string) => boolean; title: string }[] = [
  { test: (p) => p === "/dashboard", title: "Overview" },
  { test: (p) => p.startsWith("/dashboard/bookings"), title: "Calendar & Bookings" },
  { test: (p) => p.startsWith("/dashboard/assessment"), title: "Dosha Profile" },
  { test: (p) => p.startsWith("/dashboard/plans"), title: "Treatment Plans" },
  { test: (p) => p.startsWith("/dashboard/purchases"), title: "Orders & Receipts" },
  { test: (p) => p.startsWith("/dashboard/rewards"), title: "Rewards & Tiers" },
  { test: (p) => p.startsWith("/dashboard/gift-cards"), title: "Gift Cards" },
  { test: (p) => p.startsWith("/dashboard/permissions"), title: "Privacy & Permissions" },
  { test: (p) => p.startsWith("/dashboard/settings"), title: "Account Settings" },
  { test: (p) => p.startsWith("/dashboard/business"), title: "Business Profile" },
  { test: (p) => p.startsWith("/dashboard/calendar"), title: "Schedule Board" },
  { test: (p) => p.startsWith("/dashboard/schedule"), title: "Schedule List" },
  { test: (p) => p.startsWith("/dashboard/enquiries"), title: "Enquiries & Leads" },
  { test: (p) => p.startsWith("/dashboard/services"), title: "Sessions Catalogue" },
  { test: (p) => p.startsWith("/dashboard/admin"), title: "Platform Admin" },
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
        className={`dash-nav-link group relative flex items-center justify-center rounded-xl p-2.5 transition-all duration-200 ${
          active
            ? "bg-gradient-to-r from-forest to-forest-deep text-white shadow-sm glow-forest scale-[1.03]"
            : "text-ink-secondary hover:bg-surface/80 hover:text-forest"
        }`}
      >
        {active ? (
          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gold shadow-xs" />
        ) : null}
        <Icon className="h-[1.15rem] w-[1.15rem]" />
        <span className="pointer-events-none absolute left-full z-50 ml-2 hidden whitespace-nowrap rounded-xl bg-forest-deep px-3 py-1.5 text-xs font-bold text-white shadow-xl group-hover:block">
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
      className={`dash-nav-link group relative flex items-center gap-3 rounded-xl px-3 transition-all duration-200 ${
        dense ? "min-h-[var(--tap-min)] py-2.5" : "py-2"
      } text-xs font-bold ${
        active
          ? "bg-gradient-to-r from-forest to-forest-deep text-white shadow-sm glow-forest scale-[1.01]"
          : "text-ink-secondary hover:bg-surface/80 hover:text-forest active:bg-clay/80"
      }`}
    >
      {active ? (
        <span
          className="absolute left-0 top-1/2 h-5.5 w-1 -translate-y-1/2 rounded-r-full bg-gold shadow-xs"
          aria-hidden
        />
      ) : null}
      <span
        className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg transition-colors ${
          active ? "bg-white/20 text-white" : "bg-clay/60 text-forest group-hover:bg-clay"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1 flex flex-col justify-center py-0.5">
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-xs font-bold leading-tight">{item.label}</span>
          {item.badge ? (
            <span
              className={`rounded-full px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider ${
                active ? "bg-white/20 text-white" : "bg-leaf/20 text-forest"
              }`}
            >
              {item.badge}
            </span>
          ) : null}
        </div>
        {item.hint ? (
          <span
            className={`truncate text-[10px] font-medium mt-0.5 leading-none transition-colors ${
              active ? "text-white/70" : "text-ink-muted"
            }`}
          >
            {item.hint}
          </span>
        ) : null}
      </div>
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
      className="flex-1 space-y-4 overflow-y-auto overscroll-contain py-1 [-webkit-overflow-scrolling:touch]"
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
  mode,
  modes,
  onLogout,
  onNavigate,
  onSelectMode,
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
  mode: WorkspaceMode;
  modes: WorkspaceMode[];
  onLogout: () => void;
  onNavigate?: () => void;
  onSelectMode?: (mode: WorkspaceMode) => void;
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
      className={`absolute bottom-full mb-2 z-50 bg-surface/95 backdrop-blur-xl border border-hairline rounded-2xl p-2 shadow-2xl ${
        collapsed ? "left-2 w-48" : "left-1 right-1"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-2 border-b border-hairline mb-1">
        <p className="text-xs font-bold text-forest truncate">{user.fullName || "Account"}</p>
        <p className="text-[10px] font-medium text-ink-muted truncate">{user.email}</p>
      </div>

      <Link
        href="/dashboard/settings"
        onClick={() => {
          closeMenu();
          onNavigate?.();
        }}
        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-ink-secondary hover:bg-clay/50 hover:text-forest transition-colors"
      >
        <PencilIcon className="h-3.5 w-3.5" />
        Settings &amp; Profile
      </Link>

      {practiceName && publicHref && (
        <Link
          href={publicHref}
          onClick={() => {
            closeMenu();
            onNavigate?.();
          }}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-ink-secondary hover:bg-clay/50 hover:text-forest transition-colors"
        >
          <ExternalLinkIcon className="h-3.5 w-3.5" />
          View Public Practice
        </Link>
      )}

      {modes.length > 1 && onSelectMode ? (
        <div className="border-b border-hairline px-2 py-2 mb-1">
          <p className="px-1 pb-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-muted">
            Switch Workspace
          </p>
          <div className="flex flex-col gap-0.5">
            {modes.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  closeMenu();
                  onSelectMode(m);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-left text-xs font-bold transition-colors ${
                  m === mode
                    ? "bg-forest text-white shadow-2xs"
                    : "text-ink-secondary hover:bg-clay/50 hover:text-forest"
                }`}
              >
                <span>{MODE_META[m].label}</span>
                {m === mode ? (
                  <span className="text-[9px] font-bold uppercase opacity-80">Active</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          closeMenu();
          onLogout();
        }}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors mt-1 pt-2 border-t border-hairline"
      >
        <span>Sign Out</span>
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
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-forest text-xs font-bold text-white ring-2 ring-surface shadow-2xs transition-transform active:scale-95"
        >
          {resolveMediaUrl(user.avatarUrl) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveMediaUrl(user.avatarUrl)!}
              alt=""
              className="h-full w-full object-cover"
            />
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
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center gap-2.5 rounded-2xl px-2 py-2 text-left hover:bg-clay/40 transition-colors"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-forest text-xs font-bold text-white ring-2 ring-surface shadow-2xs">
          {resolveMediaUrl(user.avatarUrl) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveMediaUrl(user.avatarUrl)!}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-foreground">
            {user.fullName || "Account"}
          </p>
          <p className="truncate text-[10px] font-medium text-ink-muted">{user.email}</p>
          <span className="mt-0.5 inline-flex rounded-full bg-leaf/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-forest">
            {roleDisplayLabel(user.role)}
          </span>
        </div>
        <span className="text-xs text-ink-muted">▾</span>
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
  const [mode, setMode] = useState<WorkspaceMode>("seeker");

  useEffect(() => {
    if (!loading && !user) router.replace(loginUrl(pathname));
  }, [loading, user, router, pathname]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (!active) return;
      try {
        const storedCollapse = window.localStorage.getItem(COLLAPSE_KEY);
        if (storedCollapse === "1") setCollapsed(true);
      } catch {
        /* ignore */
      }
    };
    run();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    queueMicrotask(() => {
      setMode(resolveMode(user, readStoredMode()));
    });
  }, [user]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (active) setMobileOpen(false);
    };
    run();
    return () => {
      active = false;
    };
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

  const modes = useMemo(() => availableModes(user), [user]);

  const handleSelectMode = useCallback(
    (next: WorkspaceMode) => {
      setMode(next);
      writeStoredMode(next);
      const home = homeForMode(next);
      if (pathname !== home) router.push(home);
    },
    [pathname, router],
  );

  const groups = useMemo(() => {
    if (!user) return [];
    if (mode === "admin") return ADMIN_GROUPS;
    if (mode === "practice") return PROVIDER_GROUPS;
    if (mode === "staff") return STAFF_GROUPS;
    if (mode === "careers") return CAREERS_GROUPS;
    return CONSUMER_GROUPS;
  }, [user, mode]);

  const chipNav = useMemo(() => {
    const items = groups.flatMap((g) => g.items).filter((i) => i.chip);
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

  const hubLabel = MODE_META[mode].label;
  const hubSubtext = MODE_META[mode].description;

  return (
    <div className="dash-shell flex bg-background">
      <a href="#dashboard-main" className="skip-link">
        Skip to dashboard
      </a>

      {/* Desktop Sidebar */}
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
          <div className="mt-3 flex flex-col px-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                {hubLabel}
              </p>
              <span className="rounded-full bg-gold-soft/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-forest">
                {MODE_META[mode].short}
              </span>
            </div>
            <p className="text-[10px] text-ink-muted/85 mt-0.5 font-medium leading-relaxed">
              {hubSubtext}
            </p>
            {modes.length > 1 && !collapsed ? (
              <div className="mt-2.5 flex flex-wrap gap-1">
                {modes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSelectMode(m)}
                    className={`profile-spring rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                      m === mode
                        ? "bg-forest text-white shadow-2xs"
                        : "bg-clay/70 text-ink-secondary hover:bg-clay hover:text-forest"
                    }`}
                    title={MODE_META[m].description}
                  >
                    {MODE_META[m].short}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="my-2 h-px w-full bg-hairline" />
        )}

        <div className="mt-3 flex min-h-0 flex-1 flex-col">
          <SidebarNav groups={groups} pathname={pathname} collapsed={collapsed} />
          <UserFooter
            user={user}
            collapsed={collapsed}
            practiceName={practiceName}
            publicHref={publicHref}
            mode={mode}
            modes={modes}
            onLogout={handleLogout}
            onSelectMode={handleSelectMode}
          />
        </div>
      </aside>

      {/* Mobile Drawer */}
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
                mode={mode}
                modes={modes}
                onLogout={handleLogout}
                onNavigate={() => setMobileOpen(false)}
                onSelectMode={handleSelectMode}
              />
            </div>
          </aside>
        </div>
      ) : null}

      {/* Main Layout Body & Desktop Top Bar */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Desktop Sticky Header Top Bar */}
        <header className="hidden md:flex sticky top-0 z-40 items-center justify-between border-b border-hairline bg-surface/90 px-6 py-3 backdrop-blur-xl shadow-2xs">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                {MODE_META[mode].label}
              </p>
              <h1 className="font-display text-lg font-bold text-forest leading-none mt-0.5">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/discover"
              className="flex items-center gap-2 rounded-full border border-hairline/80 bg-surface/90 px-3.5 py-1.5 text-xs font-medium text-ink-muted hover:border-forest/40 hover:text-foreground transition-all shadow-2xs"
            >
              <SearchIcon className="h-3.5 w-3.5 text-forest" />
              <span>Search sessions, practices...</span>
              <kbd className="rounded bg-clay/60 px-1.5 py-0.5 text-[9px] font-bold text-ink-muted">
                ⌘K
              </kbd>
            </Link>

            <Link
              href="/explore"
              className="profile-spring inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-forest-deep active:scale-95"
            >
              <SparkleIcon className="h-3.5 w-3.5" />
              <span>Book Session</span>
            </Link>

            <NotificationCenter />

            <Link
              href="/dashboard/settings"
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-forest text-xs font-bold text-white shadow-2xs ring-2 ring-surface hover:ring-forest/30 transition-all"
              title="Account Settings"
            >
              {resolveMediaUrl(user.avatarUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveMediaUrl(user.avatarUrl)!}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </Link>
          </div>
        </header>

        {/* Mobile top bar */}
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
                {MODE_META[mode].label}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Link
              href="/explore"
              className="dash-nav-link inline-flex min-h-10 items-center rounded-full bg-forest px-3.5 text-xs font-bold text-white active:bg-forest-deep"
            >
              Book
            </Link>
            <Link
              href="/dashboard/settings"
              className="dash-nav-link flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-forest text-[11px] font-bold text-white ring-1 ring-hairline"
              aria-label="Account settings"
            >
              {resolveMediaUrl(user.avatarUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveMediaUrl(user.avatarUrl)!}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </Link>
          </div>
        </header>

        {/* Mobile context chips */}
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
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex-1 w-full h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <DashboardBottomNav />
    </div>
  );
}
