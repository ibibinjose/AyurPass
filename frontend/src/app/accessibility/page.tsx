import type { Metadata } from "next";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { PageHero, LegalDoc, type DocSection } from "@/components/content";

export const metadata: Metadata = {
  title: "Accessibility Statement | AyurPass",
  description:
    "AyurPass is committed to making wellness accessible to everyone. Read our accessibility commitments and how to reach us.",
  alternates: { canonical: "https://www.ayurpass.com/accessibility" },
};

const sections: DocSection[] = [
  {
    id: "commitment",
    heading: "Our commitment",
    blocks: [
      "Wellness should be within everyone's reach. We are committed to making AyurPass usable by as many people as possible, regardless of ability or technology, and we treat accessibility as an ongoing part of how we build the product.",
    ],
  },
  {
    id: "standards",
    heading: "Standards we follow",
    blocks: [
      "We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. In practice, this means we work to ensure:",
      [
        "Sufficient color contrast, including for our dosha meters, which are validated for common forms of color-vision deficiency.",
        "Full keyboard operability and visible focus states across interactive elements.",
        "Meaningful text alternatives for images and illustrations.",
        "Semantic, screen-reader-friendly structure and labelled form fields.",
        "Layouts that reflow and remain usable when zoomed or on small screens.",
      ],
    ],
  },
  {
    id: "ongoing",
    heading: "Ongoing work",
    blocks: [
      "Accessibility is never finished. We test with keyboard and screen readers as part of development, and we prioritize fixes for barriers that prevent people from booking care. Some third-party content, such as provider-supplied media, may not yet meet every criterion, and we work with providers to improve it.",
    ],
  },
  {
    id: "feedback",
    heading: "Give us feedback",
    blocks: [
      "If you encounter a barrier on AyurPass, we want to hear about it. Email accessibility@ayurpass.com with the page and a description of the issue, and we will respond and work to resolve it. If you need information in an alternative format, we will do our best to provide it.",
    ],
  },
];

export default function AccessibilityPage() {
  return (
    <LayoutWrapper>
      <PageHero
        eyebrow="Commitment"
        title="Accessibility Statement"
        subtitle="Making personalized wellness usable for everyone."
      />
      <LegalDoc updated="July 15, 2026" sections={sections} />
    </LayoutWrapper>
  );
}
