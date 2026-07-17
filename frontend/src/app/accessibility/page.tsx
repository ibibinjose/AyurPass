import type { Metadata } from "next";
import Link from "next/link";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { PageHero, LegalDoc, type DocSection } from "@/components/content";

export const metadata: Metadata = {
  title: "Accessibility Statement | AyurPass",
  description:
    "AyurPass accessibility commitments — WCAG-oriented design, keyboard support, contrast, and how to report barriers.",
  alternates: { canonical: "https://www.ayurpass.com/accessibility" },
  openGraph: {
    title: "Accessibility Statement | AyurPass",
    description: "Making personalised wellness usable for everyone.",
    url: "https://www.ayurpass.com/accessibility",
  },
};

const sections: DocSection[] = [
  {
    id: "commitment",
    heading: "Our commitment",
    blocks: [
      "Wellness should be within everyone’s reach. We design AyurPass so people can discover care, book sessions and manage accounts regardless of ability, device or assistive technology.",
      "Accessibility is part of how we build — not a one-off checklist. We prioritise barriers that block booking, account access or understanding of critical information (prices, times, credentials).",
    ],
  },
  {
    id: "standards",
    heading: "Standards we aim for",
    summary: "WCAG 2.1 Level AA as our north star.",
    blocks: [
      "We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA for primary user journeys (browse, search, book, sign in, manage account). In practice we work toward:",
      [
        "Colour contrast that remains readable, including dosha visualisations checked against common colour-vision deficiencies.",
        "Full keyboard operation and visible focus states on interactive controls.",
        "Meaningful text alternatives for meaningful images; decorative images marked appropriately.",
        "Semantic structure (headings, lists, landmarks) and labelled form fields for screen readers.",
        "Layouts that reflow and remain usable when zoomed to 200% or viewed on small screens.",
        "Touch targets sized for comfortable use on mobile (approximately 44×44 CSS pixels where practical).",
        "Error messages that explain what went wrong and how to fix it.",
      ],
    ],
  },
  {
    id: "features",
    heading: "Features that support access",
    blocks: [
      [
        "Skip link to main content on public pages.",
        "Responsive directory and dashboard layouts.",
        "Reduced-motion respect where system preferences are set (prefers-reduced-motion).",
        "Clear language on critical legal and booking steps.",
        "Report and feedback tools so you can flag barriers without a phone call.",
      ],
    ],
  },
  {
    id: "known-limits",
    heading: "Known limitations",
    blocks: [
      "Some areas may not yet meet every success criterion:",
      [
        "Provider-uploaded photos, PDFs or embedded third-party widgets may lack complete alternatives until improved by the practice.",
        "Map or calendar embeds from third parties depend on those vendors’ accessibility.",
        "Older archived content may lag behind newer patterns as we redesign.",
      ],
      "We track issues and prioritise fixes that unlock core tasks (finding a practice, booking, managing privacy).",
    ],
  },
  {
    id: "compatibility",
    heading: "Compatibility",
    blocks: [
      "We test primarily with current versions of major browsers (Chrome, Safari, Firefox, Edge) on desktop and mobile, and with keyboard-only navigation. We periodically check with common screen readers (such as VoiceOver and NVDA) on representative flows.",
      "AyurPass requires a modern browser with JavaScript enabled for interactive booking and dashboard features.",
    ],
  },
  {
    id: "ongoing",
    heading: "Ongoing work",
    blocks: [
      "We include accessibility review in product development, fix regressions when found, and train contributors on inclusive patterns. Provider guidelines encourage accessible media and plain-language listings.",
    ],
  },
  {
    id: "feedback",
    heading: "Report a barrier",
    summary: "We want to hear from you.",
    blocks: [
      "If you encounter an accessibility barrier, email accessibility@ayurpass.com with:",
      [
        "The page URL or screen name.",
        "What you were trying to do.",
        "What went wrong (and your browser / assistive tech if known).",
      ],
      "We aim to acknowledge reports promptly and prioritise severe blockers. You can also use Report / Suggest from the site footer for product feedback.",
      "If you need information in an alternative format (for example large print summary of a policy), tell us and we will do our best to help.",
    ],
  },
  {
    id: "enforcement",
    heading: "Formal complaints",
    blocks: [
      "If you are not satisfied with our response on an accessibility matter, you may also contact us via legal@ayurpass.com. Depending on your location, you may have rights to raise issues with a relevant human-rights or digital-access body.",
    ],
  },
];

export default function AccessibilityPage() {
  return (
    <LayoutWrapper>
      <PageHero
        eyebrow="Inclusion"
        title="Accessibility Statement"
        subtitle="Making personalised wellness usable for everyone — keyboard, screen reader, mobile and beyond."
        actions={
          <>
            <a
              href="mailto:accessibility@ayurpass.com"
              className="inline-flex min-h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-forest hover:bg-gold-soft"
            >
              accessibility@ayurpass.com
            </a>
            <Link
              href="/contact"
              className="inline-flex min-h-10 items-center rounded-full border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/15"
            >
              Contact support
            </Link>
          </>
        }
      />
      <LegalDoc
        updated="July 17, 2026"
        effective="July 17, 2026"
        sections={sections}
        contactEmail="accessibility@ayurpass.com"
        contactLabel="Tell us the page and what blocked you — we prioritise severe barriers."
      />
    </LayoutWrapper>
  );
}
