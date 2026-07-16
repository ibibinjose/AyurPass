"use client";

import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MobileBottomNav } from "./MobileBottomNav";

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
    <div className="flex min-h-[100dvh] min-h-screen flex-col">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <div
        id="main-content"
        className="flex-grow pb-[calc(3.75rem+env(safe-area-inset-bottom,0px))] md:pb-0"
        tabIndex={-1}
      >
        {children}
      </div>
      {/* Footer stays desktop/tablet; mobile uses bottom tabs instead of a long footer scroll */}
      <div className="hidden md:block">
        <Footer />
      </div>
      <MobileBottomNav />
    </div>
  );
}
