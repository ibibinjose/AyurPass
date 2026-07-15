import type { Metadata } from "next";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { PageHero, LegalDoc, type DocSection } from "@/components/content";

export const metadata: Metadata = {
  title: "Cookie Policy | AyurPass",
  description:
    "What cookies and similar technologies AyurPass uses, why we use them, and how you can control them.",
  alternates: { canonical: "https://www.ayurpass.com/cookies" },
};

const sections: DocSection[] = [
  {
    id: "what-are-cookies",
    heading: "What cookies are",
    blocks: [
      "Cookies are small text files stored on your device when you visit a website. We also use similar technologies such as local storage and pixels. Together they help the platform remember you, keep you signed in, and understand how the service is used.",
    ],
  },
  {
    id: "types",
    heading: "Types of cookies we use",
    blocks: [
      [
        "Essential: required to sign in, hold your session and secure the platform. These cannot be switched off.",
        "Preferences: remember choices such as your location or language.",
        "Analytics: help us understand which features are used so we can improve them. These are aggregated and de-identified.",
        "We do not use advertising cookies and we do not track you across other websites.",
      ],
    ],
  },
  {
    id: "managing",
    heading: "Managing cookies",
    blocks: [
      "Most browsers let you view, block or delete cookies through their settings. Blocking essential cookies will prevent you from signing in or completing a booking. You can also clear the AyurPass session at any time by logging out. Where required by law, we ask for your consent to non-essential cookies before setting them.",
    ],
  },
  {
    id: "changes",
    heading: "Changes and contact",
    blocks: [
      "We may update this policy to reflect new technologies or legal requirements. For questions about our use of cookies, contact privacy@ayurpass.com.",
    ],
  },
];

export default function CookiesPage() {
  return (
    <LayoutWrapper>
      <PageHero
        eyebrow="Legal"
        title="Cookie Policy"
        subtitle="The cookies we use and the control you have over them."
      />
      <LegalDoc updated="July 15, 2026" sections={sections} />
    </LayoutWrapper>
  );
}
