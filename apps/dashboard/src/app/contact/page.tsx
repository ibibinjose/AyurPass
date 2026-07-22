import type { Metadata } from "next";
import Link from "next/link";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { PageHero } from "@/components/content";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | AyurPass",
  description:
    "Get in touch with the AyurPass team for help with bookings, billing, becoming a provider, or privacy requests.",
  alternates: { canonical: "https://www.ayurpass.com/contact" },
};

const CHANNELS = [
  {
    label: "General & support",
    value: "hello@ayurpass.com",
    href: "mailto:hello@ayurpass.com",
  },
  {
    label: "Providers",
    value: "providers@ayurpass.com",
    href: "mailto:providers@ayurpass.com",
  },
  {
    label: "Privacy & data",
    value: "privacy@ayurpass.com",
    href: "mailto:privacy@ayurpass.com",
  },
];

export default function ContactPage() {
  return (
    <LayoutWrapper>
      <PageHero
        eyebrow="Support"
        title="Contact us"
        subtitle="We're here to help you find balance. Reach out and we'll reply within one business day."
      />

      <section className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <ContactForm />

          <aside className="space-y-6">
            <div className="rounded-2xl border border-hairline bg-surface p-6">
              <h2 className="font-display text-lg text-forest">Email us directly</h2>
              <ul className="mt-4 space-y-4">
                {CHANNELS.map((c) => (
                  <li key={c.value}>
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                      {c.label}
                    </p>
                    <a
                      href={c.href}
                      className="text-sm font-medium text-forest underline-offset-2 hover:underline"
                    >
                      {c.value}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-hairline bg-clay/60 p-6">
              <h2 className="font-display text-lg text-forest">Before you write</h2>
              <p className="mt-2 text-sm text-ink-secondary">
                Many questions are answered in our help resources.
              </p>
              <div className="mt-4 flex flex-col gap-2 text-sm">
                <Link href="/faq" className="font-medium text-forest hover:underline">
                  Read the FAQ →
                </Link>
                <Link href="/help" className="font-medium text-forest hover:underline">
                  Visit the Help Center →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </LayoutWrapper>
  );
}
