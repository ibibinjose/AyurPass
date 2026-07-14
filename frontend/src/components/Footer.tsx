import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-hairline bg-clay/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="max-w-sm text-sm text-ink-muted">
            Ayurveda · Yoga · Luxury Spa · Meditation — one intelligent wellness
            ecosystem, personalised to your constitution.
          </p>
        </div>
        <nav className="flex flex-wrap gap-8 text-sm text-ink-secondary">
          <Link href="/explore" className="hover:text-forest">
            Book
          </Link>
          <Link href="/shop" className="hover:text-forest">
            Shop
          </Link>
          <Link href="/packages" className="hover:text-forest">
            Packages
          </Link>
          <Link href="/register?as=provider" className="hover:text-forest">
            List your practice
          </Link>
          <Link href="/login" className="hover:text-forest">
            Sign in
          </Link>
        </nav>
      </div>
      <div className="border-t border-hairline py-4 text-center text-xs text-ink-muted">
        © {new Date().getFullYear()} AyurPass. Rooted in tradition, guided by intelligence.
      </div>
    </footer>
  );
}
