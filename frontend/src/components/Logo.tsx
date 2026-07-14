import Link from "next/link";
import { LeafIcon } from "./icons";

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full ${
          dark ? "bg-gold-soft text-forest" : "bg-forest text-gold-soft"
        }`}
      >
        <LeafIcon className="h-4.5 w-4.5" />
      </span>
      <span
        className={`font-display text-xl tracking-tight ${dark ? "text-white" : "text-forest"}`}
      >
        AyurPass
      </span>
    </Link>
  );
}
