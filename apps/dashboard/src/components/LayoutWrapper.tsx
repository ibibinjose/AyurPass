"use client";

import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MobileBottomNav } from "./MobileBottomNav";
import { EmailVerifyBanner } from "./EmailVerifyBanner";

interface LayoutWrapperProps {
  children: ReactNode;
  /** Hide chrome for rare full-bleed screens. */
  bare?: boolean;
}

export function LayoutWrapper({ children, bare = false }: LayoutWrapperProps) {
  if (bare) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[100dvh] min-h-screen flex-col overflow-x-clip">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <EmailVerifyBanner />
      <div
        id="main-content"
        className="min-w-0 flex-grow"
        tabIndex={-1}
      >
        {children}
      </div>
      {/* Full footer on tablet+; compact strip on mobile (above bottom tabs). */}
      <div className="hidden md:block">
        <Footer />
      </div>
      <div className="md:hidden border-t border-[var(--separator)]/60">
        <Footer compact />
      </div>
      <MobileBottomNav />
    </div>
  );
}
