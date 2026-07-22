import type { Dosha } from "@/lib/dosha";
import { DOSHA_INFO } from "@/lib/dosha";

const DOSHA_COLOR: Record<Dosha, string> = {
  vata: "var(--vata)",
  pitta: "var(--pitta)",
  kapha: "var(--kapha)",
};

interface DoshaMeterProps {
  dosha: Dosha;
  /** 0–100 */
  value: number;
  primary?: boolean;
}

/**
 * One dosha meter row: swatch + name + value are always visible text labels,
 * so identity and magnitude never rely on the fill color alone.
 */
export function DoshaMeter({ dosha, value, primary = false }: DoshaMeterProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const color = DOSHA_COLOR[dosha];

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: color }}
          />
          {DOSHA_INFO[dosha].name}
          {primary && (
            <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-forest">
              Primary
            </span>
          )}
        </span>
        <span className="text-sm text-ink-secondary tabular-nums">{clamped}%</span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-[4px] bg-clay"
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${DOSHA_INFO[dosha].name} score`}
      >
        <div
          className="h-full rounded-r-[4px]"
          style={{ width: `${clamped}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function DoshaMeterGroup({
  vata,
  pitta,
  kapha,
  primary,
}: {
  vata: number;
  pitta: number;
  kapha: number;
  primary?: Dosha;
}) {
  return (
    <div className="space-y-4">
      <DoshaMeter dosha="vata" value={vata} primary={primary === "vata"} />
      <DoshaMeter dosha="pitta" value={pitta} primary={primary === "pitta"} />
      <DoshaMeter dosha="kapha" value={kapha} primary={primary === "kapha"} />
    </div>
  );
}
