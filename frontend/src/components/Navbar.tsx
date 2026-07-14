"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "./Logo";

export function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-ink-secondary sm:flex">
          <Link href="/explore" className="hover:text-forest">
            Book a session
          </Link>
          <Link href="/shop" className="hover:text-forest">
            Shop
          </Link>
          <Link href="/packages" className="hover:text-forest">
            Packages
          </Link>
          <Link href="/#providers" className="hover:text-forest">
            For providers
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest-deep"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-sm text-ink-muted hover:text-forest"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-ink-secondary hover:text-forest">
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest-deep"
              >
                Begin your journey
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
