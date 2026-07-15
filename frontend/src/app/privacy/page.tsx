import type { Metadata } from "next";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { PageHero, LegalDoc, type DocSection } from "@/components/content";

export const metadata: Metadata = {
  title: "Privacy Policy | AyurPass",
  description:
    "How AyurPass collects, uses, protects and shares your personal and health information across our wellness platform.",
  alternates: { canonical: "https://www.ayurpass.com/privacy" },
};

const sections: DocSection[] = [
  {
    id: "overview",
    heading: "Overview",
    blocks: [
      "AyurPass (\"we\", \"us\", \"our\") connects you with Ayurvedic clinics, yoga studios, meditation centers, health clubs and luxury spas, and personalizes recommendations using a guided Prakriti (dosha) assessment. This policy explains what information we collect, why we collect it, and the choices you have.",
      "We treat health-related information — including your dosha assessment and any notes you share when booking — as sensitive personal data and apply heightened protections to it.",
    ],
  },
  {
    id: "information-we-collect",
    heading: "Information we collect",
    blocks: [
      "We collect the following categories of information:",
      [
        "Account details: name, email address, phone number and password.",
        "Wellness profile: your Prakriti assessment answers and resulting dosha balance.",
        "Booking information: services or packages booked, appointment times, and optional health notes you provide to a practitioner.",
        "Transactions: purchases, gift cards, reward points and payment status (card details are handled by our payment processor, not stored by us).",
        "Technical data: device, browser, IP address and usage analytics needed to operate and secure the service.",
      ],
    ],
  },
  {
    id: "how-we-use",
    heading: "How we use your information",
    blocks: [
      "We use your information to:",
      [
        "Provide the service: create your account, match you with practitioners, and manage bookings and payments.",
        "Personalize recommendations based on your dosha profile, goals and location.",
        "Communicate with you about appointments, receipts, and account or policy changes.",
        "Protect the platform against fraud, abuse and security threats.",
        "Improve our features using aggregated, de-identified analytics.",
      ],
      "We do not sell your personal information, and we never use your health data for advertising.",
    ],
  },
  {
    id: "sharing",
    heading: "How we share information",
    blocks: [
      "Your health data is shared with a practitioner only when you book with them and only to the extent needed to deliver that service. Beyond that, we share information with:",
      [
        "Service providers who process payments, host infrastructure or send transactional messages on our behalf, under contractual confidentiality obligations.",
        "Authorities where required by law, or to protect the rights and safety of our users.",
        "A successor entity in the event of a merger, acquisition or asset sale, subject to this policy.",
      ],
    ],
  },
  {
    id: "your-rights",
    heading: "Your rights and choices",
    blocks: [
      "Depending on your location, you may have the right to access, correct, export or delete your personal data, and to object to or restrict certain processing. You can manage most of your data directly from your dashboard settings, or contact us to exercise these rights. You may withdraw consent to health-data sharing at any time; this will not affect processing already carried out.",
    ],
  },
  {
    id: "security-retention",
    heading: "Security and retention",
    blocks: [
      "We use encryption in transit, access controls and regular reviews to protect your information. No system is perfectly secure, but we work to limit access to health data on a strict need-to-know basis. We retain your information for as long as your account is active and as required to meet legal, accounting or reporting obligations, after which it is deleted or de-identified.",
    ],
  },
  {
    id: "contact",
    heading: "Contact us",
    blocks: [
      "Questions about this policy or your data can be sent to privacy@ayurpass.com, or through our Contact page. We aim to respond to verified requests within 30 days.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LayoutWrapper>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="Your health is personal. Here is exactly how we handle your information."
      />
      <LegalDoc updated="July 15, 2026" sections={sections} />
    </LayoutWrapper>
  );
}
