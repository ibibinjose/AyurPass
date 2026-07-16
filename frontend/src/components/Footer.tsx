import { Logo } from "./Logo";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-hairline bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm text-ink-secondary">
              Ayurveda · Yoga · Luxury Spa · Meditation — one intelligent wellness
              ecosystem, personalised to your constitution.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="https://www.instagram.com/ayurpass"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-secondary hover:text-forest transition-colors"
                aria-label="AyurPass on Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <circle cx="16" cy="11" r="1"></circle>
                  <path d="M21 11a8.1 8.1 0 0 0-15 2c0 4 3 7 7 10 4-3 7-6 7-10 0-1 0-3 3-4.5"></path>
                </svg>
              </a>
              <a
                href="https://x.com/ayurpass"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-secondary hover:text-forest transition-colors"
                aria-label="AyurPass on X (Twitter)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-display text-lg text-forest">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/discover" className="text-sm text-ink-secondary transition-colors hover:text-forest">
                  Discover providers
                </Link>
              </li>
              <li>
                <Link href="/retreats" className="text-sm text-ink-secondary transition-colors hover:text-forest">
                  Retreats & trainings
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-sm text-ink-secondary transition-colors hover:text-forest">
                  Book a session
                </Link>
              </li>
              <li>
                <Link href="/offers" className="text-sm text-ink-secondary transition-colors hover:text-forest">
                  Offers
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-sm text-ink-secondary transition-colors hover:text-forest">
                  Wellness shop
                </Link>
              </li>
              <li>
                <Link href="/packages" className="text-sm text-ink-secondary transition-colors hover:text-forest">
                  Packages
                </Link>
              </li>
              <li>
                <Link href="/wellness" className="text-sm text-ink-secondary transition-colors hover:text-forest">
                  Wellness guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 font-display text-lg text-forest">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard/gift-cards" className="text-ink-secondary hover:text-forest transition-colors">
                  Gift Cards
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-ink-secondary hover:text-forest transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-ink-secondary hover:text-forest transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-ink-secondary hover:text-forest transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Provider Resources */}
          <div>
            <h3 className="mb-4 font-display text-lg text-forest">For Providers</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/register?as=provider" className="text-ink-secondary hover:text-forest transition-colors">
                  List Your Practice
                </Link>
              </li>
              <li>
                <Link href="/providers/guidelines" className="text-ink-secondary hover:text-forest transition-colors">
                  Provider Guidelines
                </Link>
              </li>
              <li>
                <Link href="/providers/benefits" className="text-ink-secondary hover:text-forest transition-colors">
                  Benefits & Pricing
                </Link>
              </li>
              <li>
                <Link href="/partners" className="text-ink-secondary hover:text-forest transition-colors">
                  Partner Programs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-hairline flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-ink-muted">
            © {new Date().getFullYear()} AyurPass. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-ink-muted">
            <Link href="/privacy" className="hover:text-forest transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-forest transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-forest transition-colors">
              Cookie Policy
            </Link>
            <Link href="/accessibility" className="hover:text-forest transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}