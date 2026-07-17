/** Brand-coloured social / web logos for profile links. */

type IconProps = { className?: string };

function Svg({
  className,
  children,
  viewBox = "0 0 24 24",
}: {
  className?: string;
  children: React.ReactNode;
  viewBox?: string;
}) {
  return (
    <svg
      className={className}
      viewBox={viewBox}
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function InstagramBrandIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </Svg>
  );
}

export function FacebookBrandIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </Svg>
  );
}

export function XBrandIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.725-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </Svg>
  );
}

export function YouTubeBrandIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </Svg>
  );
}

export function LinkedInBrandIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </Svg>
  );
}

export function TikTokBrandIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </Svg>
  );
}

export function ThreadsBrandIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.313-8.184-3.83C2.35 18.135 1.5 15.055 1.5 11.5v-.5C1.5 7.445 2.35 4.365 3.995 1.83 5.845-.687 8.598-1.976 12.179-2h.007c3.581.024 6.334 1.313 8.184 3.83C22.015 4.365 22.865 7.445 22.865 11v.5c0 3.555-.85 6.635-2.495 9.17C18.52 22.687 15.767 23.976 12.186 24zm.01-21.5c-2.85.019-4.95.95-6.25 2.77C4.65 6.98 4 8.95 4 11.5v.5c0 2.55.65 4.52 1.946 6.23 1.3 1.82 3.4 2.751 6.25 2.77 2.85-.019 4.95-.95 6.25-2.77C19.74 16.52 20.39 14.55 20.39 12v-.5c0-2.55-.65-4.52-1.946-6.23-1.3-1.82-3.4-2.751-6.25-2.77z" />
    </Svg>
  );
}

export function WhatsAppBrandIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </Svg>
  );
}

export function PinterestBrandIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
    </Svg>
  );
}

export function GoogleBrandIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
    </Svg>
  );
}

export function TripadvisorBrandIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12.006 4.295c-2.67 0-5.338.784-7.645 2.353H0l1.963 2.135a5.997 5.997 0 004.04 10.23 6 6 0 004.001-1.535L12 19.705l1.996-2.227a5.997 5.997 0 008.041-8.695L24 6.648h-4.361c-2.307-1.569-4.975-2.353-7.633-2.353zm0 3.771a5.997 5.997 0 015.999 5.999 5.997 5.997 0 01-5.999 5.998 5.997 5.997 0 01-5.998-5.998 5.997 5.997 0 015.998-5.999zm0 1.927a4.072 4.072 0 00-4.071 4.072 4.072 4.072 0 004.071 4.071 4.072 4.072 0 004.072-4.071 4.072 4.072 0 00-4.072-4.072zm0 1.681a2.39 2.39 0 012.391 2.391 2.39 2.39 0 01-2.391 2.39 2.39 2.39 0 01-2.39-2.39 2.39 2.39 0 012.39-2.391z" />
    </Svg>
  );
}

export function YelpBrandIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M20.16 12.594l-4.995 1.433c-.96.276-1.74-.8-1.176-1.63l2.905-4.308a1.072 1.072 0 011.852.15l1.414 4.355zm-5.116 3.351l4.73 2.144a1.073 1.073 0 01.07 1.937l-4.185 2.24c-.89.476-1.89-.37-1.55-1.307l1.935-5.014zm-2.53-1.378l.41 5.14c.076 1.004-1.078 1.572-1.79.881L7.41 17.01c-.71-.688-.2-1.88.76-1.85l4.344.107zm-.91-2.228L7.04 9.282c-.78-.52-.6-1.7.3-1.95l5.16-1.44c.91-.254 1.63.76 1.12 1.57l-2.116 5.377zm1.05-6.31l.556-5.128C13.28.877 14.5.55 15.13 1.38l3.59 4.75c.62.82-.14 1.97-1.15 1.75L12.654 6.03z" />
    </Svg>
  );
}

export function GlobeBrandIcon({ className }: IconProps) {
  return (
    <Svg className={className} viewBox="0 0 24 24">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c2.5 2.7 3.75 5.7 3.75 9S14.5 18.3 12 21c-2.5-2.7-3.75-5.7-3.75-9S9.5 5.7 12 3z"
      />
    </Svg>
  );
}

/** Platform id → brand colour / gradient. */
export const SOCIAL_BRAND_STYLE: Record<
  string,
  { bg: string; fg: string; label: string }
> = {
  instagram: {
    bg: "linear-gradient(135deg,#f9ce34 0%,#ee2a7b 50%,#6228d7 100%)",
    fg: "#fff",
    label: "Instagram",
  },
  facebook: { bg: "#1877F2", fg: "#fff", label: "Facebook" },
  youtube: { bg: "#FF0000", fg: "#fff", label: "YouTube" },
  x: { bg: "#0f0f0f", fg: "#fff", label: "X" },
  linkedin: { bg: "#0A66C2", fg: "#fff", label: "LinkedIn" },
  tiktok: { bg: "#010101", fg: "#fff", label: "TikTok" },
  threads: { bg: "#000000", fg: "#fff", label: "Threads" },
  whatsapp: { bg: "#25D366", fg: "#fff", label: "WhatsApp" },
  pinterest: { bg: "#E60023", fg: "#fff", label: "Pinterest" },
  google: { bg: "#4285F4", fg: "#fff", label: "Google" },
  tripadvisor: { bg: "#34E0A1", fg: "#0a0a0a", label: "Tripadvisor" },
  yelp: { bg: "#FF1A1A", fg: "#fff", label: "Yelp" },
  other: { bg: "#2F5A44", fg: "#fff", label: "Link" },
  website: { bg: "#2F5A44", fg: "#fff", label: "Website" },
};

const ICONS: Record<string, (p: IconProps) => React.ReactNode> = {
  instagram: InstagramBrandIcon,
  facebook: FacebookBrandIcon,
  youtube: YouTubeBrandIcon,
  x: XBrandIcon,
  linkedin: LinkedInBrandIcon,
  tiktok: TikTokBrandIcon,
  threads: ThreadsBrandIcon,
  whatsapp: WhatsAppBrandIcon,
  pinterest: PinterestBrandIcon,
  google: GoogleBrandIcon,
  tripadvisor: TripadvisorBrandIcon,
  yelp: YelpBrandIcon,
  other: GlobeBrandIcon,
  website: GlobeBrandIcon,
};

/** Coloured brand tile for a social platform. */
export function SocialBrandBadge({
  platform,
  size = "md",
  className = "",
}: {
  platform: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const key = platform.toLowerCase();
  const style = SOCIAL_BRAND_STYLE[key] ?? SOCIAL_BRAND_STYLE.other;
  const Icon = ICONS[key] ?? GlobeBrandIcon;
  const dim =
    size === "sm" ? "h-9 w-9 text-[15px]" : size === "lg" ? "h-14 w-14 text-[26px]" : "h-12 w-12 text-[22px]";
  const radius = size === "sm" ? "rounded-xl" : "rounded-2xl";

  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center shadow-sm ${dim} ${radius} ${className}`}
      style={{ background: style.bg, color: style.fg }}
      title={style.label}
    >
      <Icon className="block" />
    </span>
  );
}
