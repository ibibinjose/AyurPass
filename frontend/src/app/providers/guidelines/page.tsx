import type { Metadata } from "next";
import Link from "next/link";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { PageHero, LegalDoc, type DocSection } from "@/components/content";
import { ArrowRightIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Provider Guidelines | AyurPass",
  description:
    "The standards every AyurPass provider agrees to — verification, accurate listings, licensing, client care and professional conduct.",
  alternates: { canonical: "https://www.ayurpass.com/providers/guidelines" },
};

const sections: DocSection[] = [
  {
    id: "verification",
    heading: "Verification & credentials",
    blocks: [
      "Every practice is reviewed before it goes live. To stay listed, you agree to keep your credentials current and hold all licenses required in your jurisdiction.",
      [
        "Provide accurate business and practitioner details during onboarding.",
        "Hold and maintain the qualifications and licenses for the services you offer.",
        "Update us promptly if your licensing or registration status changes.",
      ],
    ],
  },
  {
    id: "listings",
    heading: "Accurate listings",
    blocks: [
      "Clients rely on your listings to choose care that fits them. Keep them truthful and current.",
      [
        "Describe services, durations and prices exactly as delivered.",
        "Use your own photography and content, or media you are licensed to use.",
        "Tag dosha compatibility honestly and avoid unverifiable health claims.",
        "Keep availability up to date to prevent avoidable cancellations.",
      ],
    ],
  },
  {
    id: "client-care",
    heading: "Client care & safety",
    blocks: [
      "You are responsible for the care you deliver. Clients should feel safe, informed and respected at every visit.",
      [
        "Honor confirmed bookings and communicate changes as early as possible.",
        "Screen for contraindications and refer to medical care when appropriate.",
        "Obtain informed consent for treatments and respect client boundaries.",
        "Maintain clean, safe and accessible facilities.",
      ],
    ],
  },
  {
    id: "conduct",
    heading: "Professional conduct",
    blocks: [
      "AyurPass is built on trust. We expect every provider to act with integrity and to treat clients and staff fairly, without discrimination or harassment of any kind.",
    ],
  },
  {
    id: "data",
    heading: "Handling client data",
    blocks: [
      "Client health information shared with you through AyurPass may be used only to deliver the booked service. Store it securely, limit access to those who need it, and never use it for marketing without explicit consent. See our Privacy Policy for how we protect this data on the platform.",
    ],
  },
  {
    id: "enforcement",
    heading: "Enforcement",
    blocks: [
      "We may review listings and investigate complaints at any time. Practices that violate these guidelines or receive substantiated safety concerns may be suspended or removed. We will always aim to notify you and give an opportunity to respond where it is safe and appropriate to do so.",
    ],
  },
];

export default function ProviderGuidelinesPage() {
  return (
    <LayoutWrapper>
      <PageHero
        eyebrow="For Providers"
        title="Provider guidelines"
        subtitle="The standards that keep AyurPass a trusted place for authentic wellness care."
      />
      <LegalDoc updated="July 15, 2026" sections={sections} />
      <section className="mx-auto max-w-4xl px-5 pb-16">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-hairline bg-clay/60 p-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="font-display text-lg text-forest">Ready to list your practice?</p>
            <p className="mt-1 text-sm text-ink-secondary">
              Complete verification and reach clients matched to what you do best.
            </p>
          </div>
          <Link
            href="/register?as=provider"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-forest-deep"
          >
            Get started
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </LayoutWrapper>
  );
}
