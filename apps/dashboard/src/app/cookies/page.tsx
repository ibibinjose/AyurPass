import type { Metadata } from "next";
import Link from "next/link";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { PageHero, LegalDoc, type DocSection } from "@/components/content";

export const metadata: Metadata = {
  title: "Cookie Policy | AyurPass",
  description:
    "Cookies and similar technologies on AyurPass — essential, preferences, analytics — and how you can control them.",
  alternates: { canonical: "https://www.ayurpass.com/cookies" },
  openGraph: {
    title: "Cookie Policy | AyurPass",
    description: "What we store on your device and the control you have.",
    url: "https://www.ayurpass.com/cookies",
  },
};

const sections: DocSection[] = [
  {
    id: "what-are-cookies",
    heading: "What cookies are",
    blocks: [
      "Cookies are small text files stored on your device when you visit a website. We also use similar technologies such as browser local storage and, where relevant, pixels or software development kits in our apps.",
      "Together they help AyurPass keep you signed in, remember preferences, measure product performance and protect against abuse.",
    ],
  },
  {
    id: "types",
    heading: "Types we use",
    summary: "Essential first — no advertising cookies.",
    blocks: [
      [
        "Essential: required to sign in, maintain your session, route requests securely and prevent fraud. Without these, core features (login, checkout, dashboard) cannot work.",
        "Preferences: remember choices such as UI density, saved directory filters or dismissed notices.",
        "Analytics: help us understand which pages and features are used so we can improve reliability and design. We aim to use aggregated or de-identified metrics where practical.",
        "Functional local storage: stores auth tokens, engagement preferences and similar client state needed for a smooth experience.",
      ],
      "We do not use third-party advertising cookies, and we do not sell cookie data. We do not track you across unrelated third-party websites for ads.",
    ],
  },
  {
    id: "examples",
    heading: "Examples on AyurPass",
    blocks: [
      [
        "Session / access tokens so you stay signed in while using the dashboard.",
        "Refresh tokens (secure storage) to renew your session without re-entering your password every few minutes.",
        "Directory UI state such as saved searches or recent views (where enabled).",
        "Follow / like preferences stored locally until synced with your account where applicable.",
        "Security and load-balancing cookies from our hosting or CDN providers.",
      ],
    ],
  },
  {
    id: "duration",
    heading: "How long they last",
    blocks: [
      "Session cookies expire when you close the browser or after a short idle period. Persistent cookies and local storage entries last until they expire, you clear them, or you log out (which clears session credentials).",
      "Exact lifetimes vary by feature and security requirements; we keep essential auth lifetimes as short as practical while remaining usable.",
    ],
  },
  {
    id: "managing",
    heading: "Managing cookies",
    blocks: [
      "You can control cookies through your browser settings (block, delete or allow per site). Blocking essential cookies will prevent sign-in and booking.",
      [
        "Log out of AyurPass to clear active session tokens on that device.",
        "Clear site data for ayurpass.com in your browser to remove local storage and cookies.",
        "Use private/incognito windows if you prefer not to persist preferences.",
        "On mobile browsers, review site settings for each browser app you use.",
      ],
      "Where required by law, we will request consent before setting non-essential cookies. Essential cookies do not require consent under most frameworks because they are strictly necessary.",
    ],
  },
  {
    id: "third-parties",
    heading: "Third parties",
    blocks: [
      "Some infrastructure and payment partners may set their own essential cookies when you complete checkout or load assets from their domains. Those partners process data under their terms and our agreements. Review Stripe (or your regional payment processor) and our Privacy Policy for more detail.",
    ],
  },
  {
    id: "changes",
    heading: "Changes and contact",
    blocks: [
      "We may update this Cookie Policy when our technology or legal requirements change. The “Last updated” date will reflect revisions.",
      "Questions: privacy@ayurpass.com. For broader data rights, see our Privacy Policy.",
    ],
  },
];

export default function CookiesPage() {
  return (
    <LayoutWrapper>
      <PageHero
        eyebrow="Legal"
        title="Cookie Policy"
        subtitle="What we store on your device, why we store it, and how you stay in control — without advertising trackers."
        actions={
          <>
            <Link
              href="/privacy"
              className="inline-flex min-h-10 items-center rounded-full border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/15"
            >
              Privacy Policy
            </Link>
            <Link
              href="/dashboard/settings"
              className="inline-flex min-h-10 items-center rounded-full border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/15"
            >
              Account settings
            </Link>
          </>
        }
      />
      <LegalDoc
        updated="July 17, 2026"
        effective="July 17, 2026"
        sections={sections}
        contactEmail="privacy@ayurpass.com"
        contactLabel="Cookie and privacy questions go to the same team."
      />
    </LayoutWrapper>
  );
}
