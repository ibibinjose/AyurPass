"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  CalendarIcon,
  CheckCircleIcon,
  GiftIcon,
  SparkleIcon,
  XIcon,
  LeafIcon,
} from "./icons";

export interface AppNotification {
  id: string;
  type: "booking" | "reminder" | "payment" | "reward" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n-1",
    type: "reminder",
    title: "Upcoming Session Reminder",
    message: "Your Abhyanga Full Body Therapy is scheduled for tomorrow at 10:00 AM with Lotus Wellness.",
    time: "10m ago",
    read: false,
    link: "/dashboard/bookings",
  },
  {
    id: "n-2",
    type: "reward",
    title: "Rewards Earned!",
    message: "You earned 150 AyurPass Wellness Points from your recent session booking.",
    time: "2h ago",
    read: false,
    link: "/dashboard/rewards",
  },
  {
    id: "n-3",
    type: "payment",
    title: "Payment Confirmed",
    message: "Payment receipt #AP-8842 for $120.00 AUD was successfully settled.",
    time: "1d ago",
    read: true,
    link: "/dashboard/purchases",
  },
  {
    id: "n-4",
    type: "system",
    title: "Weekly Dosha Insights",
    message: "Check your updated Prakriti profile and seasonal Ayurvedic nutrition recommendations.",
    time: "2d ago",
    read: true,
    link: "/dashboard/assessment",
  },
];

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

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "booking" | "reward">("all");
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const popoverRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const removeNotif = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "booking") return n.type === "booking" || n.type === "reminder";
    if (filter === "reward") return n.type === "reward" || n.type === "payment";
    return true;
  });

  const getNotifIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "reminder":
      case "booking":
        return <CalendarIcon className="h-4 w-4 text-forest" />;
      case "reward":
        return <GiftIcon className="h-4 w-4 text-amber-600" />;
      case "payment":
        return <CheckCircleIcon className="h-4 w-4 text-emerald-600" />;
      default:
        return <SparkleIcon className="h-4 w-4 text-[var(--system-blue)]" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="profile-spring relative flex h-9.5 w-9.5 items-center justify-center rounded-full border border-hairline bg-surface text-forest shadow-2xs transition-all hover:border-leaf/40 hover:bg-clay/30 active:scale-95"
        title="Notification Center"
        aria-expanded={isOpen}
      >
        <BellIcon className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-amber-500 font-display text-[9px] font-bold text-white shadow-2xs ring-2 ring-surface animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Popover Drawer */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2.5 w-80 sm:w-96 rounded-3xl border border-hairline bg-surface/95 p-4 shadow-2xl backdrop-blur-2xl space-y-3 border-hairline/80">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-hairline pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-white shadow-xs font-bold text-xs">
                <BellIcon className="h-3.5 w-3.5" />
              </span>
              <h3 className="font-display text-sm font-bold text-forest">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-bold text-forest hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex gap-1 overflow-x-auto text-[11px]">
            {(
              [
                ["all", "All"],
                ["unread", "Unread"],
                ["booking", "Bookings"],
                ["reward", "Rewards"],
              ] as const
            ).map(([f, label]) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`profile-spring rounded-full px-2.5 py-1 font-bold transition-all ${
                  filter === f
                    ? "bg-forest text-white shadow-2xs"
                    : "border border-hairline bg-surface/80 text-ink-secondary hover:bg-clay/40"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {filteredNotifs.length === 0 ? (
              <div className="py-8 text-center">
                <LeafIcon className="mx-auto h-8 w-8 text-ink-muted/50" />
                <p className="mt-2 text-xs font-semibold text-ink-muted">
                  No notifications in this filter.
                </p>
              </div>
            ) : (
              filteredNotifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`group relative flex items-start gap-3 rounded-2xl border p-3 transition-all cursor-pointer ${
                    n.read
                      ? "border-hairline/60 bg-surface/60 opacity-80 hover:opacity-100"
                      : "border-leaf/40 bg-leaf/10 shadow-2xs ring-1 ring-leaf/20"
                  }`}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface shadow-2xs">
                    {getNotifIcon(n.type)}
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-bold ${n.read ? "text-foreground" : "text-forest"}`}>
                        {n.title}
                      </p>
                      <span className="text-[9px] font-semibold text-ink-muted shrink-0">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium leading-tight text-ink-muted line-clamp-2">
                      {n.message}
                    </p>

                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={() => {
                          markAsRead(n.id);
                          setIsOpen(false);
                        }}
                        className="mt-1.5 inline-flex items-center text-[10px] font-bold text-forest hover:underline"
                      >
                        View details →
                      </Link>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => removeNotif(n.id, e)}
                    className="opacity-0 group-hover:opacity-100 rounded-full p-1 text-ink-muted hover:bg-clay/50 hover:text-foreground transition-all"
                    title="Dismiss notification"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
