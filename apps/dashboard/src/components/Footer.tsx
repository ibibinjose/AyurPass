import Link from "next/link";
import { Logo } from "./Logo";
import { ArrowRightIcon, MailIcon } from "./icons";
import { ReportSuggestTrigger } from "./ReportSuggestModal";
import { LocationSelectorButton } from "./LocationSelectorButton";


const EXPLORE = [
  { href: "/discover", label: "Discover places" },
  { href: "/retreats", label: "Retreats & trainings" },
  { href: "/explore", label: "Book a session" },
  { href: "/offers", label: "Offers" },
  { href: "/shop", label: "Wellness shop" },
  { href: "/packages", label: "Packages" },
  { href: "/wellness", label: "Wellness guide" },
] as const;

const SUPPORT = [
  { href: "/about", label: "About us & Mission" },
  { href: "/help", label: "Help centre" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact us" },
  { href: "/dashboard/gift-cards", label: "Gift cards" },
  { href: "/dashboard/assessment", label: "Dosha assessment" },
] as const;

const PROVIDERS = [
  { href: "/list-your-business", label: "List your practice free" },
  { href: "/providers/benefits", label: "Benefits & pricing" },
  { href: "/providers/guidelines", label: "Provider guidelines" },
  { href: "/partners", label: "Partner programs" },
  { href: "/dashboard", label: "Practice dashboard" },
] as const;

const LEGAL = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
  { href: "/accessibility", label: "Accessibility" },
] as const;

const linkClass =
  "text-sm font-medium text-ink-secondary transition-colors hover:text-forest";

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
        {title}
      </h3>
      <ul className="mt-3.5 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={linkClass}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="18" height="18" x="3" y="3" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.725-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const socialClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-surface text-ink-secondary transition-colors hover:border-leaf hover:bg-clay/50 hover:text-forest";

/**
 * Site footer — full on tablet/desktop; compact strip on mobile (above bottom tabs).
 */
export function Footer({ compact = false }: { compact?: boolean }) {
  const year = new Date().getFullYear();

  if (compact) {
    return (
      <footer className="border-t border-hairline bg-surface">
        <div className="mx-auto max-w-6xl px-[var(--space-page-x)] py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Logo className="scale-90 origin-left" />
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-ink-muted">
              <Link href="/discover" className="hover:text-forest">
                Discover
              </Link>
              <Link href="/list-your-business" className="hover:text-forest">
                List free
              </Link>
              <Link href="/help" className="hover:text-forest">
                Help
              </Link>
              <Link href="/privacy" className="hover:text-forest">
                Privacy
              </Link>
            </div>
          </div>
          <p className="mt-3 text-[11px] font-medium text-ink-muted">
            © {year} AyurPass · Wellness personalised to your constitution
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-auto border-t border-hairline bg-surface">
      {/* CTA band */}
      <div className="border-b border-hairline bg-[linear-gradient(135deg,rgba(30,50,40,0.04),rgba(185,137,47,0.06))]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-[var(--space-page-x)] py-8 sm:flex-row sm:items-center sm:py-9">
          <div className="max-w-md">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
              Join AyurPass
            </p>
            <p className="mt-1 font-display text-xl font-semibold text-forest sm:text-2xl">
              Find care — or get discovered
            </p>
            <p className="mt-1.5 text-sm font-medium text-ink-secondary">
              Browse verified practices free, or list your clinic, studio or spa in minutes.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/discover"
              className="btn-press inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-forest to-forest-deep px-5.5 py-2.5 text-sm font-semibold text-white shadow-md hover:from-forest-deep hover:to-forest hover:shadow-lg transition-all"
            >
              Discover places
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/list-your-business"
              className="btn-press inline-flex min-h-11 items-center rounded-full border border-hairline/80 bg-surface/90 px-5.5 py-2.5 text-sm font-semibold text-forest shadow-xs hover:border-leaf/50 hover:bg-surface transition-all"
            >
              List free
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-[var(--space-page-x)] py-12 sm:py-14">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-4">
            <Logo />
            <p className="mt-4 max-w-xs text-sm font-medium leading-relaxed text-ink-secondary">
              Ayurveda, yoga, luxury spa, meditation and health clubs — one wellness ecosystem,
              personalised to your constitution.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <a
                href="https://www.instagram.com/ayurpass.app"
                target="_blank"
                rel="noopener noreferrer"
                className={socialClass}
                aria-label="AyurPass on Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://x.com/ayurpass"
                target="_blank"
                rel="noopener noreferrer"
                className={socialClass}
                aria-label="AyurPass on X"
              >
                <XIcon />
              </a>
              <a
                href="https://www.linkedin.com/company/ayurpass"
                target="_blank"
                rel="noopener noreferrer"
                className={socialClass}
                aria-label="AyurPass on LinkedIn"
              >
                <LinkedInIcon />
              </a>
              <a
                href="mailto:hello@ayurpass.com"
                className={socialClass}
                aria-label="Email AyurPass"
              >
                <MailIcon className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-4 text-xs font-medium text-ink-muted">
              <a
                href="mailto:hello@ayurpass.com"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-forest"
              >
                <MailIcon className="h-3.5 w-3.5" />
                hello@ayurpass.com
              </a>
            </p>
          </div>

          <div className="lg:col-span-2">
            <FooterColumn title="Explore" links={EXPLORE} />
          </div>
          <div className="lg:col-span-2">
            <FooterColumn title="Support" links={SUPPORT} />
            <div className="mt-4">
              <ReportSuggestTrigger />
            </div>
          </div>
          <div className="lg:col-span-2">
            <FooterColumn title="For providers" links={PROVIDERS} />
          </div>

          {/* Disciplines quick filters */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
              Disciplines
            </h3>
            <ul className="mt-3.5 space-y-2.5">
              {[
                { href: "/ayurveda", label: "Ayurveda" },
                { href: "/yoga", label: "Yoga" },
                { href: "/meditation", label: "Meditation" },
                { href: "/spa", label: "Ayurvedic Spa" },
                { href: "/fitness", label: "Health Club" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-hairline pt-6 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-medium text-ink-muted">
              © {year} AyurPass. All rights reserved.
            </p>
            <LocationSelectorButton className="text-[11px] py-1 px-2.5" />
          </div>
          <nav
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-ink-muted"
            aria-label="Legal"
          >
            {LEGAL.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="transition-colors hover:text-forest"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
