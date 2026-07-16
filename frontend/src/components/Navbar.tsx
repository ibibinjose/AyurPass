"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "./Logo";
import { Button } from "./ui";
import { MenuIcon, XIcon } from "./icons";
import { useState } from "react";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        
        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 text-sm text-ink-secondary lg:flex">
          <Link href="/discover" className="hover:text-forest transition-colors">
            Discover
          </Link>
          <Link href="/retreats" className="hover:text-forest transition-colors">
            Retreats
          </Link>
          <Link href="/explore" className="hover:text-forest transition-colors">
            Book a session
          </Link>
          <Link href="/shop" className="hover:text-forest transition-colors">
            Shop
          </Link>
          <Link href="/packages" className="hover:text-forest transition-colors">
            Packages
          </Link>
          <Link href="/wellness" className="hover:text-forest transition-colors">
            Wellness Guide
          </Link>
          <Link href="/list-your-business" className="hover:text-forest transition-colors">
            List your business
          </Link>
        </nav>
        
        <div className="hidden items-center gap-3 lg:flex">
          {loading ? null : user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest-deep transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-sm text-ink-secondary hover:text-forest transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-ink-secondary hover:text-forest transition-colors">
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest-deep transition-colors"
              >
                Begin your journey
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="lg:hidden text-ink-secondary"
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-hairline bg-background/95 backdrop-blur p-5">
          <nav className="flex flex-col gap-4">
            <Link
              href="/discover"
              className="py-2 text-ink-secondary hover:text-forest transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Discover
            </Link>
            <Link
              href="/retreats"
              className="py-2 text-ink-secondary hover:text-forest transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Retreats
            </Link>
            <Link
              href="/explore"
              className="py-2 text-ink-secondary hover:text-forest transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Book a session
            </Link>
            <Link 
              href="/shop" 
              className="py-2 text-ink-secondary hover:text-forest transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <Link 
              href="/packages" 
              className="py-2 text-ink-secondary hover:text-forest transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Packages
            </Link>
            <Link 
              href="/wellness" 
              className="py-2 text-ink-secondary hover:text-forest transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Wellness Guide
            </Link>
            <Link
              href="/list-your-business"
              className="py-2 text-ink-secondary hover:text-forest transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              List your business
            </Link>
            
            <div className="mt-4 pt-4 border-t border-hairline flex flex-col gap-3">
              {loading ? null : user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="w-full rounded-full bg-forest px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-forest-deep transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 text-sm text-ink-secondary hover:text-forest transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="py-2 text-sm text-ink-secondary hover:text-forest transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="w-full rounded-full bg-forest px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-forest-deep transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Begin your journey
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}