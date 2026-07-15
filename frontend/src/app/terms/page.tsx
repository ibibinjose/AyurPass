import type { Metadata } from "next";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { PageHero, LegalDoc, type DocSection } from "@/components/content";

export const metadata: Metadata = {
  title: "Terms of Service | AyurPass",
  description:
    "The terms that govern your use of AyurPass — bookings, payments, cancellations, provider obligations and acceptable use.",
  alternates: { canonical: "https://www.ayurpass.com/terms" },
};

const sections: DocSection[] = [
  {
    id: "acceptance",
    heading: "Acceptance of terms",
    blocks: [
      "By creating an account or using AyurPass, you agree to these Terms of Service. If you are using the platform on behalf of a business, you confirm that you are authorized to bind that business to these terms.",
    ],
  },
  {
    id: "the-service",
    heading: "The service",
    blocks: [
      "AyurPass is a marketplace that connects clients with independent wellness providers and lets them book services, packages and products. We verify providers before listing them, but we are not the provider of the wellness services themselves and do not practice medicine. Practitioners are solely responsible for the care they deliver.",
    ],
  },
  {
    id: "medical-disclaimer",
    heading: "Not medical advice",
    blocks: [
      "The dosha assessment, recommendations and educational content on AyurPass are for wellness and informational purposes only. They are not a substitute for professional medical diagnosis or treatment. Always consult a qualified healthcare provider before starting any new therapy, and seek immediate care in an emergency.",
    ],
  },
  {
    id: "bookings-payments",
    heading: "Bookings and payments",
    blocks: [
      "When you book, you agree to pay the listed price plus any applicable taxes and fees. Payments are processed by our third-party payment provider. Gift cards and reward points may be applied at checkout where eligible.",
      [
        "A booking is confirmed only once payment is authorized.",
        "Prices, availability and provider offerings may change at any time.",
        "Reward points and gift-card balances have no cash value and are non-transferable except as expressly permitted.",
      ],
    ],
  },
  {
    id: "cancellations",
    heading: "Cancellations and refunds",
    blocks: [
      "Cancellation windows and refund eligibility are set by each provider and shown before you confirm a booking. Where a booking is eligible for a refund, it is returned to your original payment method or as reward credit. No-show protection may apply a fee for appointments missed without notice.",
    ],
  },
  {
    id: "provider-terms",
    heading: "Provider obligations",
    blocks: [
      "Providers agree to keep listings accurate, hold all licenses required in their jurisdiction, honor confirmed bookings, and protect client information. Commission applies only to completed bookings as described in your plan. We may suspend or remove listings that violate these terms or receive substantiated safety complaints.",
    ],
  },
  {
    id: "acceptable-use",
    heading: "Acceptable use",
    blocks: [
      "You agree not to misuse the platform. In particular, you will not:",
      [
        "Post false, misleading or unlawful content, or impersonate another person or business.",
        "Attempt to access accounts, data or systems without authorization.",
        "Interfere with the platform's operation or security, or scrape it without permission.",
        "Use the service to harass, harm or discriminate against others.",
      ],
    ],
  },
  {
    id: "liability",
    heading: "Limitation of liability",
    blocks: [
      "To the fullest extent permitted by law, AyurPass is not liable for indirect, incidental or consequential damages arising from your use of the platform or from the services provided by independent practitioners. Our total liability for any claim is limited to the amount you paid through the platform in the six months before the claim.",
    ],
  },
  {
    id: "changes",
    heading: "Changes to these terms",
    blocks: [
      "We may update these terms as the service evolves. If we make material changes, we will notify you through the platform or by email. Continued use after changes take effect constitutes acceptance. Questions can be directed to legal@ayurpass.com.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LayoutWrapper>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        subtitle="The agreement between you and AyurPass when you use the platform."
      />
      <LegalDoc updated="July 15, 2026" sections={sections} />
    </LayoutWrapper>
  );
}
