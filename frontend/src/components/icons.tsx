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
