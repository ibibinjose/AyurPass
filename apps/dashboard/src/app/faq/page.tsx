import type { Metadata } from "next";
import Link from "next/link";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { PageHero } from "@/components/content";
import { ArrowRightIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | AyurPass",
  description:
    "Answers to common questions about the dosha assessment, booking, payments, gift cards, providers and privacy on AyurPass.",
  alternates: { canonical: "https://www.ayurpass.com/faq" },
};

const faqGroups: { category: string; items: { q: string; a: string }[] }[] = [
  {
    category: "Getting started",
    items: [
      {
        q: "What is AyurPass?",
        a: "AyurPass is a wellness marketplace that connects you with verified Ayurvedic clinics, yoga studios, meditation centers, health clubs and luxury spas — with recommendations personalized to your constitution by a guided Prakriti (dosha) assessment.",
      },
      {
        q: "What is the dosha assessment and do I need it?",
        a: "The Prakriti assessment is a short questionnaire that maps your Vata, Pitta and Kapha balance. It is optional, but taking it lets us tailor practitioner, treatment and package recommendations to you. You can retake it anytime from your dashboard.",
      },
      {
        q: "Is AyurPass free to use?",
        a: "Creating an account, taking the assessment and browsing providers are free. You only pay when you book a service, package or product. Providers pay a subscription and commission on completed bookings.",
      },
    ],
  },
  {
    category: "Bookings & payments",
    items: [
      {
        q: "How do I book a session?",
        a: "Find a service or provider through Explore or Discover, choose an available time, and confirm. Your booking is confirmed once payment is authorized, and you can view it anytime in your dashboard.",
      },
      {
        q: "What payment methods can I use?",
        a: "Payments are handled securely by our payment processor. You can also apply gift cards and eligible reward points at checkout to reduce the amount due.",
      },
      {
        q: "Can I cancel or reschedule?",
        a: "Yes. Each provider sets their own cancellation window, which is shown before you confirm. Eligible cancellations are refunded to your original payment method or as reward credit. Missing an appointment without notice may incur a no-show fee.",
      },
      {
        q: "How do gift cards and reward points work?",
        a: "Gift cards can be purchased and sent from your dashboard and redeemed at checkout. Reward points accrue on completed bookings and can be applied toward future purchases. Both are non-transferable except where noted.",
      },
    ],
  },
  {
    category: "Providers",
    items: [
      {
        q: "Are practitioners verified?",
        a: "Yes. Every provider is reviewed before being listed, and we ask them to hold the licenses required in their jurisdiction. You will see a verified indicator on their profile.",
      },
      {
        q: "I run a clinic or studio — how do I join?",
        a: "List your practice from the provider sign-up, choose a plan, and complete verification. You get a global audience matched to what you do best, plus scheduling, payments and analytics built in.",
      },
    ],
  },
  {
    category: "Privacy",
    items: [
      {
        q: "Who can see my health information?",
        a: "Your dosha profile and any notes you add to a booking are shared only with the practitioner you book, and only to deliver that service. We never use health data for advertising or sell your personal information. See our Privacy Policy for details.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <LayoutWrapper>
      <PageHero
        eyebrow="Support"
        title="Frequently asked questions"
        subtitle="Everything you need to know about assessments, bookings, payments and privacy."
      />

      <section className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
        <div className="space-y-12">
          {faqGroups.map((group) => (
            <div key={group.category}>
              <h2 className="font-display text-2xl text-forest">{group.category}</h2>
              <div className="mt-4 divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline bg-surface">
                {group.items.map((item) => (
                  <details key={item.q} className="group px-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-medium text-foreground marker:content-none">
                      {item.q}
                      <span
                        aria-hidden
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-hairline text-forest transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="-mt-1 pb-4 pr-10 leading-relaxed text-ink-secondary">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-hairline bg-clay/60 p-6 text-center">
          <p className="font-display text-lg text-forest">Still have a question?</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink-secondary">
            Our team is happy to help you find the right care.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-forest-deep"
          >
            Contact support
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </LayoutWrapper>
  );
}
