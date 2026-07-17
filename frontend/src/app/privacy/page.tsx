import type { Metadata } from "next";
import Link from "next/link";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { PageHero, LegalDoc, type DocSection } from "@/components/content";

export const metadata: Metadata = {
  title: "Privacy Policy | AyurPass",
  description:
    "How AyurPass collects, uses, protects and shares your personal and health information — including dosha assessments, bookings and free directory listings.",
  alternates: { canonical: "https://www.ayurpass.com/privacy" },
  openGraph: {
    title: "Privacy Policy | AyurPass",
    description:
      "Your health is personal. How we handle account, wellness and booking data on AyurPass.",
    url: "https://www.ayurpass.com/privacy",
  },
};

const sections: DocSection[] = [
  {
    id: "overview",
    heading: "Overview",
    summary: "Who we are and what this policy covers.",
    blocks: [
      "AyurPass (“we”, “us”, “our”) is a wellness discovery and booking platform. We help you find Ayurvedic clinics, yoga studios, meditation centres, health clubs, luxury spas and retreats — and, where available, book sessions online. Practices may also hold a free public directory listing without accepting bookings through us.",
      "This Privacy Policy explains what information we collect, why we collect it, how we share it, and the choices you have. It applies to ayurpass.com, our apps, and related services.",
      "We treat health-related information — including your Prakriti (dosha) assessment and any notes you share when booking — as sensitive personal data and apply heightened protections to it.",
    ],
  },
  {
    id: "information-we-collect",
    heading: "Information we collect",
    summary: "Account, wellness, booking, payment and technical data.",
    blocks: [
      "Depending on how you use AyurPass, we may collect:",
      [
        "Account details: name, email, phone number, password, profile photo and role (seeker, practitioner or practice admin).",
        "Wellness profile: Prakriti assessment answers, dosha scores and preferences you save.",
        "Public profile data for practices and practitioners: business name, bio, credentials, media, contact details and public handles you choose to publish (including standard practice URLs and any root vanity handle you request, such as www.ayurpass.com/yourhandle).",
        "Handle requests and moderation records: the username you request, request status (pending, approved or denied), and any admin review notes needed to protect trademarks and public figures.",
        "Booking & enquiry information: services booked, appointment times, enquiries you send to a practice, and optional health notes you provide.",
        "Quality & safety signals: ratings, reviews, likes/dislikes and abuse reports you submit (and related moderation data).",
        "Transactions: purchases, gift cards, reward points and payment status. Card details are processed by our payment partner (e.g. Stripe); we do not store full card numbers.",
        "Technical data: device, browser, IP address, approximate location derived from IP, cookies/local storage and usage analytics needed to operate and secure the service.",
      ],
    ],
  },
  {
    id: "how-we-use",
    heading: "How we use your information",
    blocks: [
      "We use personal information to:",
      [
        "Provide the service: accounts, discovery, enquiries, bookings, payments and practice dashboards.",
        "Personalise recommendations using your dosha profile, goals and location where you allow it.",
        "Show public listings you create (practices, practitioners, sessions, products, retreats).",
        "Communicate about appointments, receipts, security alerts and material policy changes.",
        "Protect the platform against fraud, abuse and security threats, and to review reports.",
        "Improve features using aggregated or de-identified analytics.",
        "Comply with law and enforce our Terms of Service.",
      ],
      "We do not sell your personal information. We do not use your health assessment data for third-party advertising.",
    ],
  },
  {
    id: "health-data",
    heading: "Health and dosha data",
    summary: "Sensitive data with tighter controls.",
    blocks: [
      "Your Prakriti assessment and any health notes attached to a booking are treated as special-category / sensitive information where applicable law requires.",
      [
        "Assessment results are visible to you in your account and may inform personalised discovery.",
        "Notes you attach to a booking are shared with the practice or practitioner involved in that booking, under your direction.",
        "You can retake assessments and manage related data from your dashboard where available.",
        "Practitioners who access client health information must only use it for the care you requested.",
      ],
      "Educational content and dosha guidance on AyurPass are not medical advice. See our Terms for the full disclaimer.",
    ],
  },
  {
    id: "sharing",
    heading: "How we share information",
    blocks: [
      "We share information only as needed to run AyurPass:",
      [
        "Practices & practitioners: when you enquire or book, we share the contact and booking details needed to respond or deliver care — plus any notes you choose to include.",
        "Service providers: hosting, email delivery, payments, analytics and security vendors under contracts that limit use of your data.",
        "Public directory: information you publish on a free or bookable listing (name, photos, bio, credentials) is visible to visitors.",
        "Legal & safety: authorities or other parties when required by law, or to protect rights, safety and the integrity of the platform (including investigating abuse reports).",
        "Business transfers: a successor entity in a merger or acquisition, subject to this policy or equivalent protections.",
      ],
    ],
  },
  {
    id: "your-rights",
    heading: "Your rights and choices",
    blocks: [
      "Depending on where you live (for example under GDPR, UK GDPR or similar laws), you may have rights to:",
      [
        "Access a copy of personal data we hold about you.",
        "Correct inaccurate data.",
        "Delete data, subject to legal retention needs (e.g. payment records).",
        "Export data in a portable format.",
        "Object to or restrict certain processing.",
        "Withdraw consent where processing is consent-based.",
      ],
      "You can update many details in Settings and manage privacy-related permissions from your dashboard. To exercise other rights, email privacy@ayurpass.com. We may need to verify your identity before acting on a request. We aim to respond within 30 days (or the period required by local law).",
    ],
  },
  {
    id: "cookies",
    heading: "Cookies and similar technologies",
    blocks: [
      "We use essential cookies and local storage to keep you signed in and secure the service, plus limited analytics and preference storage. We do not use third-party advertising cookies. See our full Cookie Policy for details and controls.",
    ],
  },
  {
    id: "security-retention",
    heading: "Security and retention",
    blocks: [
      "We use encryption in transit (HTTPS), access controls, and operational safeguards. Access to sensitive health-related fields is limited to need-to-know roles and the practitioners you engage.",
      "We retain account data while your account is active and for a reasonable period afterward for security, dispute resolution and legal obligations. When data is no longer needed, we delete or de-identify it.",
      "No online service is perfectly secure. If you believe your account is compromised, change your password and contact us immediately.",
    ],
  },
  {
    id: "international",
    heading: "International users",
    blocks: [
      "AyurPass may be operated from Australia and other regions, with infrastructure providers in multiple countries. If we transfer personal data internationally, we use appropriate safeguards required by applicable law (such as standard contractual clauses where relevant).",
    ],
  },
  {
    id: "children",
    heading: "Children",
    blocks: [
      "AyurPass is not directed at children under 16 (or the higher age of digital consent in your region). We do not knowingly collect personal data from children. If you believe a child has provided data, contact privacy@ayurpass.com and we will take appropriate steps.",
    ],
  },
  {
    id: "changes",
    heading: "Changes to this policy",
    blocks: [
      "We may update this Privacy Policy as our product or legal requirements evolve. Material changes will be highlighted on this page and, where appropriate, notified by email or in-product notice. The “Last updated” date at the top reflects the latest revision.",
    ],
  },
  {
    id: "contact",
    heading: "Contact us",
    blocks: [
      "Privacy questions and data-subject requests: privacy@ayurpass.com. You may also use our Contact page. If you are in the EEA/UK and are unsatisfied with our response, you may lodge a complaint with your local supervisory authority.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LayoutWrapper>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="Your health is personal. Here is exactly how we collect, use, share and protect your information on AyurPass."
        actions={
          <>
            <Link
              href="/cookies"
              className="inline-flex min-h-10 items-center rounded-full border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/15"
            >
              Cookie Policy
            </Link>
            <Link
              href="/terms"
              className="inline-flex min-h-10 items-center rounded-full border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/15"
            >
              Terms of Service
            </Link>
          </>
        }
      />
      <LegalDoc
        updated="July 17, 2026"
        effective="July 17, 2026"
        sections={sections}
        contactEmail="privacy@ayurpass.com"
        contactLabel="Privacy requests are usually answered within 30 days."
      />
    </LayoutWrapper>
  );
}
