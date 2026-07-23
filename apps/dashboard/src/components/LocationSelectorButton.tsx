"use client";

import { useLocation } from "@/context/LocationContext";

export function LocationSelectorButton({ className = "" }: { className?: string }) {
  const { flag, countryCode, currency, openModal } = useLocation();

  return (
    <button
      type="button"
      onClick={openModal}
      title="Change Country, Currency & Timezone"
      className={`inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface/90 px-3 py-1.5 text-xs font-semibold text-forest shadow-xs transition-all hover:bg-clay hover:border-forest/40 ${className}`}
    >
      <span className="text-sm">{flag}</span>
      <span>{countryCode}</span>
      <span className="text-ink-muted">·</span>
      <span className="font-mono text-[11px] font-bold text-forest">{currency}</span>
    </button>
  );
}
