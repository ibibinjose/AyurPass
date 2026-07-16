interface IconProps {
  className?: string;
}

function base(className?: string) {
  return {
    className,
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
}

export function LeafIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M5 19C5 10 10 4 20 4c0 10-6 15-15 15Z" />
      <path d="M5 19c3-5 7-9 11-11" />
    </svg>
  );
}

export function LotusIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 4c1.8 2 2.6 4.2 2.6 6.4S13.4 14 12 15c-1.4-1-2.6-2.4-2.6-4.6S10.2 6 12 4Z" />
      <path d="M4 9c2.4.4 4.4 1.5 5.8 3.2M20 9c-2.4.4-4.4 1.5-5.8 3.2" />
      <path d="M3 13.5C4.6 17 8 19 12 19s7.4-2 9-5.5" />
    </svg>
  );
}

export function FlameIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 3c1 3-2.5 4.5-2.5 8a4.5 4.5 0 0 0 9 0c0-1.5-.5-2.8-1.5-4-.2 1-.8 1.8-1.5 2.2C15.8 7 15 4.5 12 3Z" />
      <path d="M9.5 14.5A2.5 2.5 0 0 0 12 17" />
    </svg>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />
    </svg>
  );
}

export function SparkleIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 4l1.8 4.9L19 11l-5.2 2.1L12 18l-1.8-4.9L5 11l5.2-2.1L12 4Z" />
      <path d="M18.5 4.5v3M17 6h3" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </svg>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5" />
      <path d="M15.5 6a2.8 2.8 0 1 1 0 5.4M17 14.7c1.8.5 3 1.9 3.5 4" />
    </svg>
  );
}

export function CompassIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15.5 8.5 13.6 13.6 8.5 15.5l1.9-5.1L15.5 8.5Z" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 3.5 5 6v5.5c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6l-7-2.5Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M4.5 12h15M13.5 6l6 6-6 6" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="m5 12.5 4.2 4.2L19 7" />
    </svg>
  );
}

export function DumbbellIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M6.5 8.5v7M4 10v3M17.5 8.5v7M20 10v3M6.5 12h11" />
    </svg>
  );
}

export function CoachIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M4 16.5 9.5 11l3 3L20 6.5" />
      <path d="M15 6.5h5v5" />
    </svg>
  );
}

export function ImageIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m5 18 5-5 3.5 3.5L16 14l3.5 3.5" />
    </svg>
  );
}

export function MapPinIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 21c4-4.5 6-7.8 6-10.5a6 6 0 1 0-12 0C6 13.2 8 16.5 12 21Z" />
      <circle cx="12" cy="10.5" r="2.2" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M5 7h14M10 7V5h4v2M8 7l.7 12h6.6L16 7" />
    </svg>
  );
}

export function PencilIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="m14.5 5.5 4 4L8 20H4v-4L14.5 5.5Z" />
      <path d="m12.5 7.5 4 4" />
    </svg>
  );
}

export function GiftIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M4 11.5h16V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-7.5Z" />
      <path d="M3 8h18v3.5H3zM12 8v12" />
      <path d="M12 8S10.5 4 8.5 4a2 2 0 0 0 0 4H12Zm0 0s1.5-4 3.5-4a2 2 0 0 1 0 4H12Z" />
    </svg>
  );
}

export function TrophyIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3" />
      <path d="M10 15h4M9 20h6M12 15v5" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function ShareIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" />
    </svg>
  );
}

export function LinkIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.2-1.2" />
    </svg>
  );
}

export function ExternalLinkIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

export function GlobeIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M6.5 4h2l1.5 4.5-2 1.2a11 11 0 0 0 5.8 5.8l1.2-2L21 14.5V16.5a2 2 0 0 1-2.2 2 17 17 0 0 1-7.8-2.3A17 17 0 0 1 4.3 8.2 2 2 0 0 1 6.5 6Z" />
    </svg>
  );
}

export function HeartIcon({ className, filled }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base(className)} fill={filled ? "currentColor" : "none"}>
      <path d="M12 20.5s-7-4.6-9.5-8.5C.5 8.8 2.2 5 5.8 5c1.8 0 3.2 1 4.2 2.3C11 6 12.4 5 14.2 5 17.8 5 19.5 8.8 21.5 12c-2.5 3.9-9.5 8.5-9.5 8.5Z" />
    </svg>
  );
}
