/**
 * Bespoke, on-brand SVG illustrations for the wellness disciplines.
 *
 * Inline SVG (like `icons.tsx`) keeps these crisp at any size, theme-matched to
 * the AyurPass palette, and free of `next.config` image-domain setup. Each fills
 * its container and is decorative — pages provide the accessible label.
 */

type ArtProps = { className?: string };

// Brand palette, mirrored from globals.css so the art reads as one system.
const C = {
  forest: "#24382e",
  forestDeep: "#182720",
  leaf: "#3d6650",
  gold: "#b9892f",
  goldSoft: "#e9d9b8",
  clay: "#f0e9db",
  surface: "#fffdf9",
  ink: "#211e19",
} as const;

const baseSvg =
  "h-full w-full" as const;

/** Ayurveda — an apothecary still life: mortar & pestle, herbs, a remedy bottle. */
export function AyurvedaArt({ className = "" }: ArtProps) {
  return (
    <svg
      viewBox="0 0 640 400"
      className={`${baseSvg} ${className}`}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="ayur-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7f0e2" />
          <stop offset="1" stopColor={C.clay} />
        </linearGradient>
        <linearGradient id="ayur-bottle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.leaf} />
          <stop offset="1" stopColor={C.forest} />
        </linearGradient>
      </defs>

      <rect width="640" height="400" fill="url(#ayur-bg)" />
      {/* soft sun */}
      <circle cx="500" cy="120" r="150" fill={C.gold} opacity="0.08" />
      <circle cx="500" cy="120" r="96" fill={C.gold} opacity="0.08" />

      {/* shelf line */}
      <line x1="70" y1="312" x2="570" y2="312" stroke={C.gold} strokeWidth="2" opacity="0.35" />

      {/* mortar & pestle */}
      <g stroke={C.forest} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M232 250 h146 a10 10 0 0 1 10 12 l-14 42 a26 26 0 0 1 -25 20 h-88 a26 26 0 0 1 -25 -20 l-14 -42 a10 10 0 0 1 10 -12 Z" fill={C.goldSoft} />
        <path d="M305 250 v-2" />
        <line x1="330" y1="196" x2="300" y2="278" stroke={C.gold} strokeWidth="9" />
        <circle cx="333" cy="192" r="9" fill={C.gold} stroke="none" />
      </g>
      <path d="M255 268 q50 -18 100 0" stroke={C.leaf} strokeWidth="4" fill="none" opacity="0.55" strokeLinecap="round" />

      {/* herb sprig, left */}
      <g stroke={C.leaf} strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M150 312 C 150 250, 158 214, 178 182" />
        <path d="M164 236 q-30 -6 -44 -30" />
        <path d="M172 208 q28 -8 40 -30" />
        <path d="M158 268 q-28 -2 -42 -24" />
      </g>
      <g fill={C.leaf} opacity="0.9">
        <ellipse cx="112" cy="204" rx="16" ry="9" transform="rotate(-28 112 204)" />
        <ellipse cx="216" cy="176" rx="16" ry="9" transform="rotate(26 216 176)" />
        <ellipse cx="110" cy="242" rx="14" ry="8" transform="rotate(-22 110 242)" />
      </g>

      {/* remedy bottle, right */}
      <g>
        <rect x="430" y="150" width="14" height="26" rx="4" fill={C.forest} />
        <path d="M420 176 h34 a12 12 0 0 1 12 12 v96 a20 20 0 0 1 -20 20 h-30 a20 20 0 0 1 -20 -20 v-96 a12 12 0 0 1 12 -12 Z" fill="url(#ayur-bottle)" />
        <rect x="410" y="220" width="54" height="52" rx="8" fill={C.surface} opacity="0.14" />
        <path d="M437 208 l6 14 h-12 Z" fill={C.goldSoft} />
        <circle cx="437" cy="248" r="7" fill={C.goldSoft} opacity="0.85" />
      </g>

      {/* scattered seeds */}
      <g fill={C.gold} opacity="0.8">
        <circle cx="400" cy="316" r="4" />
        <circle cx="416" cy="322" r="3" />
        <circle cx="386" cy="323" r="3" />
      </g>
    </svg>
  );
}

/** Yoga — a serene seated figure reaching toward a rising sun. */
export function YogaArt({ className = "" }: ArtProps) {
  return (
    <svg
      viewBox="0 0 640 400"
      className={`${baseSvg} ${className}`}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="yoga-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef3ea" />
          <stop offset="1" stopColor="#dfe9df" />
        </linearGradient>
        <radialGradient id="yoga-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.gold} stopOpacity="0.9" />
          <stop offset="1" stopColor={C.gold} stopOpacity="0.15" />
        </radialGradient>
      </defs>

      <rect width="640" height="400" fill="url(#yoga-bg)" />

      {/* sun + rays */}
      <circle cx="320" cy="196" r="92" fill="url(#yoga-sun)" />
      <circle cx="320" cy="196" r="58" fill={C.gold} opacity="0.85" />
      <g stroke={C.gold} strokeWidth="4" strokeLinecap="round" opacity="0.5">
        <line x1="320" y1="70" x2="320" y2="96" />
        <line x1="230" y1="106" x2="248" y2="124" />
        <line x1="410" y1="106" x2="392" y2="124" />
        <line x1="196" y1="196" x2="222" y2="196" />
        <line x1="444" y1="196" x2="418" y2="196" />
      </g>

      {/* horizon */}
      <path d="M0 300 q320 -40 640 0 v100 H0 Z" fill={C.leaf} opacity="0.16" />
      <line x1="60" y1="318" x2="580" y2="318" stroke={C.forest} strokeWidth="3" opacity="0.25" />

      {/* seated figure in lotus, arms overhead */}
      <g fill={C.forest}>
        <circle cx="320" cy="150" r="20" />
        {/* torso */}
        <path d="M320 172 c-20 0 -30 18 -30 44 c0 20 8 34 30 40 c22 -6 30 -20 30 -40 c0 -26 -10 -44 -30 -44 Z" />
        {/* arms raised to prayer above head */}
        <path d="M304 200 c-16 -20 -22 -44 8 -60 M336 200 c16 -20 22 -44 -8 -60" stroke={C.forest} strokeWidth="12" strokeLinecap="round" fill="none" />
        {/* crossed legs */}
        <path d="M292 256 c-30 6 -46 18 -30 34 c14 12 44 10 58 2 M348 256 c30 6 46 18 30 34 c-14 12 -44 10 -58 2" stroke={C.forest} strokeWidth="14" strokeLinecap="round" fill="none" />
      </g>
      {/* mat */}
      <ellipse cx="320" cy="316" rx="118" ry="14" fill={C.forest} opacity="0.12" />
    </svg>
  );
}

/** Meditation — a figure in stillness beneath a crescent moon, wrapped in aura rings. */
export function MeditationArt({ className = "" }: ArtProps) {
  return (
    <svg
      viewBox="0 0 640 400"
      className={`${baseSvg} ${className}`}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="med-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.forestDeep} />
          <stop offset="1" stopColor={C.forest} />
        </linearGradient>
        <radialGradient id="med-glow" cx="0.5" cy="0.6" r="0.5">
          <stop offset="0" stopColor={C.gold} stopOpacity="0.5" />
          <stop offset="1" stopColor={C.gold} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="640" height="400" fill="url(#med-bg)" />
      <rect width="640" height="400" fill="url(#med-glow)" />

      {/* stars */}
      <g fill={C.goldSoft}>
        <circle cx="120" cy="90" r="2.5" opacity="0.9" />
        <circle cx="200" cy="60" r="1.8" opacity="0.7" />
        <circle cx="520" cy="110" r="2.2" opacity="0.85" />
        <circle cx="440" cy="66" r="1.6" opacity="0.6" />
        <circle cx="90" cy="180" r="1.8" opacity="0.6" />
        <circle cx="560" cy="200" r="2" opacity="0.7" />
      </g>

      {/* crescent moon */}
      <g transform="translate(492 96)">
        <circle cx="0" cy="0" r="34" fill={C.goldSoft} />
        <circle cx="14" cy="-8" r="30" fill={C.forestDeep} />
      </g>

      {/* aura rings */}
      <g fill="none" stroke={C.gold} strokeLinecap="round">
        <circle cx="320" cy="248" r="120" opacity="0.18" strokeWidth="2" />
        <circle cx="320" cy="248" r="92" opacity="0.28" strokeWidth="2" />
        <circle cx="320" cy="248" r="64" opacity="0.4" strokeWidth="2" />
      </g>

      {/* seated meditating figure */}
      <g fill={C.goldSoft}>
        <circle cx="320" cy="196" r="18" />
        <path d="M320 216 c-22 0 -34 18 -34 44 c0 16 6 28 22 34 h24 c16 -6 22 -18 22 -34 c0 -26 -12 -44 -34 -44 Z" />
        {/* hands resting on knees */}
        <path d="M288 272 c-22 4 -34 12 -22 24 c8 8 30 8 42 2 M352 272 c22 4 34 12 22 24 c-8 8 -30 8 -42 2" stroke={C.goldSoft} strokeWidth="12" strokeLinecap="round" fill="none" />
      </g>
      <ellipse cx="320" cy="320" rx="86" ry="10" fill={C.gold} opacity="0.18" />
    </svg>
  );
}

/** Health Club — strength & motion: a dumbbell, kettlebell and an energy pulse. */
export function HealthClubArt({ className = "" }: ArtProps) {
  return (
    <svg
      viewBox="0 0 640 400"
      className={`${baseSvg} ${className}`}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="gym-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2ede2" />
          <stop offset="1" stopColor={C.clay} />
        </linearGradient>
        <linearGradient id="gym-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.leaf} />
          <stop offset="1" stopColor={C.forest} />
        </linearGradient>
      </defs>

      <rect width="640" height="400" fill="url(#gym-bg)" />
      <circle cx="150" cy="120" r="130" fill={C.gold} opacity="0.07" />

      {/* motion arcs */}
      <g fill="none" stroke={C.gold} strokeWidth="4" strokeLinecap="round" opacity="0.4">
        <path d="M470 120 a70 70 0 0 1 60 96" />
        <path d="M496 108 a96 96 0 0 1 78 120" />
      </g>

      {/* energy pulse line */}
      <path
        d="M70 214 h120 l18 -44 22 96 20 -68 16 32 h250"
        fill="none"
        stroke={C.gold}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />

      {/* dumbbell */}
      <g transform="rotate(-24 320 300)">
        <rect x="250" y="286" width="140" height="20" rx="10" fill="url(#gym-metal)" />
        <g fill={C.forest}>
          <rect x="228" y="266" width="26" height="60" rx="10" />
          <rect x="210" y="276" width="20" height="40" rx="8" />
          <rect x="386" y="266" width="26" height="60" rx="10" />
          <rect x="410" y="276" width="20" height="40" rx="8" />
        </g>
        <rect x="300" y="290" width="40" height="12" rx="6" fill={C.gold} opacity="0.85" />
      </g>

      {/* kettlebell */}
      <g transform="translate(486 250)">
        <path d="M-16 -22 a26 26 0 0 1 32 0" fill="none" stroke={C.forest} strokeWidth="9" strokeLinecap="round" />
        <path d="M0 -12 c-34 0 -46 26 -46 50 c0 22 20 34 46 34 c26 0 46 -12 46 -34 c0 -24 -12 -50 -46 -50 Z" fill="url(#gym-metal)" />
        <circle cx="0" cy="46" r="16" fill={C.goldSoft} opacity="0.5" />
      </g>

      <line x1="60" y1="340" x2="580" y2="340" stroke={C.forest} strokeWidth="3" opacity="0.18" />
    </svg>
  );
}

/** Luxury Spa — a lotus on still water with stacked stones, a candle and rising steam. */
export function SpaArt({ className = "" }: ArtProps) {
  return (
    <svg
      viewBox="0 0 640 400"
      className={`${baseSvg} ${className}`}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="spa-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7f1e6" />
          <stop offset="1" stopColor="#eadfca" />
        </linearGradient>
        <linearGradient id="spa-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.leaf} stopOpacity="0.25" />
          <stop offset="1" stopColor={C.leaf} stopOpacity="0.45" />
        </linearGradient>
      </defs>

      <rect width="640" height="400" fill="url(#spa-bg)" />
      <circle cx="500" cy="110" r="140" fill={C.gold} opacity="0.08" />

      {/* water */}
      <rect x="0" y="300" width="640" height="100" fill="url(#spa-water)" />
      <g stroke={C.surface} strokeWidth="3" strokeLinecap="round" opacity="0.5" fill="none">
        <path d="M60 330 q30 -8 60 0 t60 0" />
        <path d="M470 348 q30 -8 60 0 t60 0" />
      </g>

      {/* steam wisps */}
      <g fill="none" stroke={C.leaf} strokeWidth="4" strokeLinecap="round" opacity="0.3">
        <path d="M150 168 c-14 -18 14 -30 0 -50 c-12 -16 8 -28 0 -44" />
        <path d="M496 200 c-14 -18 14 -30 0 -50" />
      </g>

      {/* candle */}
      <g transform="translate(492 236)">
        <rect x="-26" y="24" width="52" height="52" rx="8" fill={C.surface} />
        <rect x="-26" y="24" width="52" height="52" rx="8" fill={C.gold} opacity="0.12" />
        <rect x="-2" y="6" width="4" height="18" fill={C.forest} />
        <path d="M0 -18 c10 10 10 22 0 28 c-10 -6 -10 -18 0 -28 Z" fill={C.gold} />
        <path d="M0 -6 c5 5 5 11 0 14 c-5 -3 -5 -9 0 -14 Z" fill={C.goldSoft} />
      </g>

      {/* stacked stones */}
      <g transform="translate(150 300)">
        <ellipse cx="0" cy="0" rx="52" ry="18" fill={C.forest} />
        <ellipse cx="2" cy="-30" rx="40" ry="15" fill={C.leaf} />
        <ellipse cx="0" cy="-56" rx="28" ry="12" fill={C.forest} opacity="0.85" />
        <ellipse cx="1" cy="-76" rx="17" ry="9" fill={C.leaf} opacity="0.9" />
      </g>

      {/* lotus flower on water */}
      <g transform="translate(320 300)">
        <ellipse cx="0" cy="6" rx="86" ry="16" fill={C.leaf} opacity="0.25" />
        <g fill={C.goldSoft} stroke={C.gold} strokeWidth="2">
          <path d="M0 4 c-40 0 -60 -20 -66 -12 c-6 10 26 24 66 24 c40 0 72 -14 66 -24 c-6 -8 -26 12 -66 12 Z" opacity="0.9" />
          <path d="M0 2 c-26 -6 -40 -30 -34 -40 c8 -8 26 6 34 24 c8 -18 26 -32 34 -24 c6 10 -8 34 -34 40 Z" />
          <path d="M0 -2 c-14 -10 -18 -32 -10 -40 c6 -6 4 22 10 30 c6 -8 4 -36 10 -30 c8 8 4 30 -10 40 Z" fill={C.surface} />
        </g>
        <circle cx="0" cy="-8" r="6" fill={C.gold} />
      </g>
    </svg>
  );
}

export const WELLNESS_ART = {
  ayurveda: AyurvedaArt,
  yoga: YogaArt,
  meditation: MeditationArt,
  "health-club": HealthClubArt,
  spa: SpaArt,
} as const;
