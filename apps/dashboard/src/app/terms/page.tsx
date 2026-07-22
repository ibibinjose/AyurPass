import type { Metadata } from "next";
import Link from "next/link";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { PageHero, LegalDoc, type DocSection } from "@/components/content";

export const metadata: Metadata = {
  title: "Terms of Service | AyurPass",
  description:
    "Terms governing AyurPass — discovery, free listings, bookings, payments, cancellations, provider duties, reviews and acceptable use.",
  alternates: { canonical: "https://www.ayurpass.com/terms" },
  openGraph: {
    title: "Terms of Service | AyurPass",
    description: "The agreement between you and AyurPass when you use the platform.",
    url: "https://www.ayurpass.com/terms",
  },
};

const sections: DocSection[] = [
  {
    id: "acceptance",
    heading: "Acceptance of terms",
    blocks: [
      "By creating an account, listing a practice, browsing listings or otherwise using AyurPass, you agree to these Terms of Service and our Privacy Policy. If you use AyurPass on behalf of a business, you confirm you are authorised to bind that business.",
      "If you do not agree, do not use the service.",
    ],
  },
  {
    id: "the-service",
    heading: "The service",
    summary: "Discovery marketplace — not a medical provider.",
    blocks: [
      "AyurPass is a platform that helps people discover wellness practices and, where enabled, book sessions, packages, products or retreats. Practices may appear as free directory listings (enquiries only) or with online booking and payments.",
      "We verify or review listings to improve quality, but independent practices and practitioners remain responsible for the care and products they provide. AyurPass is not a clinic, hospital or medical service and does not employ practitioners to deliver treatments on its behalf unless expressly stated.",
    ],
  },
  {
    id: "medical-disclaimer",
    heading: "Not medical advice",
    blocks: [
      "Dosha assessments, educational content, recommendations and practitioner bios are for wellness and information only. They are not a diagnosis, prescription or substitute for professional medical care. Always consult a qualified healthcare provider before starting therapies, especially if you are pregnant, have a condition or take medication. Seek emergency care when needed.",
    ],
  },
  {
    id: "accounts",
    heading: "Accounts and eligibility",
    blocks: [
      [
        "You must provide accurate registration details and keep them up to date.",
        "You are responsible for activity under your account and for safeguarding your password.",
        "You must be old enough to form a binding contract in your jurisdiction (and at least the age of digital consent where required).",
        "We may suspend or close accounts that violate these terms, pose security risks or receive substantiated abuse reports.",
      ],
    ],
  },
  {
    id: "public-profiles",
    heading: "Public profiles and handles",
    blocks: [
      "Practices and practitioners may publish public pages, media, credentials and contact details. You must only publish content you have rights to use, and that is accurate and lawful.",
      "Standard practice URLs (for example /practice/your-clinic or /providers/…) are available when you list. Namespaced practitioner handles (for example /ayur/your-name or /yoga/your-name) are licensed for use on AyurPass and may be reclaimed if abandoned, abusive, misleading or infringing.",
      "Root vanity usernames — short brand URLs of the form www.ayurpass.com/yourhandle (for example www.ayurpass.com/ayurholi) — are optional. You may request a root handle from your practice dashboard. A root handle is not public until a platform administrator approves it. Administrators may approve, deny or later revoke a root handle at their discretion, including to protect trademarks, celebrities, public figures, reserved platform paths and the integrity of the directory.",
      [
        "Handles are normalised to lowercase and must meet our format rules (length and allowed characters).",
        "Requesting a handle does not guarantee approval. Until approved, your standard practice or practitioner URL remains the live public page.",
        "Changing an approved handle creates a new request and may take the previous root URL offline until the new one is approved.",
        "You must not request handles that impersonate another brand, person or organisation, or that are deceptive, offensive or reserved.",
        "AyurPass may reassign or cancel handles that violate these terms, are unused for a long period, or conflict with legal rights of others.",
      ],
    ],
  },
  {
    id: "bookings-payments",
    heading: "Bookings and payments",
    blocks: [
      "When you book or purchase through AyurPass, you agree to the price shown (plus applicable taxes and fees). Payment is processed by our payment partners. Gift cards and reward points may apply where offered.",
      [
        "A booking is confirmed only when payment is authorised or the practice accepts the booking as shown in the product flow.",
        "Prices, availability and offerings may change; the price at checkout controls for that transaction.",
        "Reward points and gift balances have no cash value except where required by law and are non-transferable unless we say otherwise.",
        "Free directory listings may collect enquiries without processing payment through AyurPass.",
      ],
    ],
  },
  {
    id: "cancellations",
    heading: "Cancellations and refunds",
    blocks: [
      "Cancellation windows and refund rules are set by each practice and displayed before you confirm (or in the booking confirmation). Eligible refunds return to the original payment method or as platform credit as stated at the time.",
      "No-show or late-cancellation fees may apply under the practice’s policy. Disputes should first be raised with the practice; we may assist as a platform but are not the service provider.",
    ],
  },
  {
    id: "provider-terms",
    heading: "Provider and practitioner obligations",
    blocks: [
      "If you list a practice or practitioner profile, you agree to:",
      [
        "Keep listings accurate (including credentials, pricing and availability).",
        "Hold all licences, registrations and insurances required where you operate.",
        "Honour confirmed bookings and respond to enquiries in good faith.",
        "Protect client information and use health notes only for the care requested.",
        "Comply with advertising and health-claims rules in your jurisdiction.",
        "Not misuse client data obtained through AyurPass.",
      ],
      "Commission or fees apply as described in your plan. We may suspend listings for policy breaches, safety concerns or repeated quality issues.",
    ],
  },
  {
    id: "reviews-quality",
    heading: "Reviews, ratings and feedback",
    blocks: [
      "Users may leave ratings, reviews, likes, dislikes, abuse reports and suggestions. You agree that feedback must be honest, lawful and not defamatory. We may moderate, hide or remove content that violates these terms or our trust & safety standards.",
      "Fake reviews, review manipulation and malicious false reports are prohibited.",
    ],
  },
  {
    id: "acceptable-use",
    heading: "Acceptable use",
    blocks: [
      "You agree not to:",
      [
        "Post false, misleading, unlawful or infringing content, or impersonate others.",
        "Access accounts, data or systems without authorisation, or probe for vulnerabilities without permission.",
        "Scrape, harvest or bulk-export data except via documented public interfaces we allow.",
        "Harass, harm, discriminate against or exploit others.",
        "Use AyurPass to send spam or unsolicited commercial messages outside legitimate enquiries/bookings.",
        "Interfere with the security or availability of the service.",
      ],
    ],
  },
  {
    id: "ip",
    heading: "Intellectual property",
    blocks: [
      "AyurPass branding, software and original content are owned by us or our licensors. You retain ownership of content you upload, and grant us a worldwide licence to host, display and distribute it as needed to operate the platform (including public listings you publish).",
      "You must not use our marks without written permission.",
    ],
  },
  {
    id: "liability",
    heading: "Limitation of liability",
    blocks: [
      "To the fullest extent permitted by law, AyurPass is not liable for indirect, incidental, special, consequential or punitive damages, or for losses arising from services delivered by independent practices and practitioners.",
      "Our aggregate liability for claims relating to the platform is limited to the greater of (a) the fees you paid to AyurPass for the service giving rise to the claim in the six months before the claim, or (b) one hundred US dollars (or local equivalent) — except where liability cannot be limited by law (for example, death or personal injury caused by negligence, or fraud).",
    ],
  },
  {
    id: "indemnity",
    heading: "Indemnity",
    blocks: [
      "You agree to indemnify and hold AyurPass harmless from claims arising out of your content, your use of the platform, your wellness services (if you are a provider), or your breach of these terms, except to the extent caused by our wilful misconduct.",
    ],
  },
  {
    id: "governing-law",
    heading: "Governing law",
    blocks: [
      "These terms are governed by the laws of New South Wales, Australia, without regard to conflict-of-law rules, unless mandatory consumer protections in your country of residence require otherwise. Courts in New South Wales have non-exclusive jurisdiction, subject to those mandatory rights.",
    ],
  },
  {
    id: "changes",
    heading: "Changes to these terms",
    blocks: [
      "We may update these terms as AyurPass evolves. Material changes will be posted here and, where appropriate, notified in-product or by email. Continued use after the effective date constitutes acceptance of the updated terms.",
    ],
  },
  {
    id: "contact",
    heading: "Contact",
    blocks: [
      "Legal questions: legal@ayurpass.com. Support: our Contact page or Help centre. Privacy: privacy@ayurpass.com.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LayoutWrapper>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        subtitle="The agreement between you and AyurPass for discovery, free listings, bookings and practice tools."
        actions={
          <>
            <Link
              href="/privacy"
              className="inline-flex min-h-10 items-center rounded-full border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/15"
            >
              Privacy Policy
            </Link>
            <Link
              href="/list-your-business"
              className="inline-flex min-h-10 items-center rounded-full border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/15"
            >
              List a practice
            </Link>
          </>
        }
      />
      <LegalDoc
        updated="July 17, 2026"
        effective="July 17, 2026"
        sections={sections}
        contactEmail="legal@ayurpass.com"
        contactLabel="Questions about these terms? Reach our legal team or general support."
      />
    </LayoutWrapper>
  );
}
