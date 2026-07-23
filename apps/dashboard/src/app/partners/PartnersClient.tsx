"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { PageHero } from "@/components/content";
import {
  LeafIcon,
  UsersIcon,
  SparkleIcon,
  ShieldIcon,
  CompassIcon,
  ArrowRightIcon,
  CheckIcon,
  MailIcon,
} from "@/components/icons";
import { api } from "@/lib/api";

const PARTNER_TRACKS = [
  {
    id: "clinics",
    icon: LeafIcon,
    title: "Clinics & Spas",
    subtitle: "For Ayurvedic practitioners, Panchakarma centers & wellness spas",
    badge: "Direct Bookings",
    benefits: [
      "Verified practice profile with root handle (e.g. ayurpass.com/practice/your-name)",
      "Built-in consultation booking, intake forms & telemetry",
      "Dosha-compatible treatment tagging for targeted client matching",
      "No upfront monthly fee — pay only on successful bookings",
    ],
  },
  {
    id: "corporate",
    icon: UsersIcon,
    title: "Corporate Wellness",
    subtitle: "For companies, HR leads & employee benefit managers",
    badge: "Employee Pass",
    benefits: [
      "Provide employees monthly AyurPass wellness credits & stipends",
      "Consolidated monthly invoicing and HR usage analytics dashboard",
      "Access to verified stress-relief, yoga, Ayurvedic consultation & massage practitioners",
      "Custom company onboarding and dedicated wellness advisor",
    ],
  },
  {
    id: "retreats",
    icon: SparkleIcon,
    title: "Retreats & Resorts",
    subtitle: "For multi-day retreat centers, wellness eco-resorts & ashrams",
    badge: "Global Guests",
    benefits: [
      "List multi-day retreat packages with custom accommodation & meal tiers",
      "Accept global deposits in 40+ currencies with automated payouts",
      "Pre-arrival guest health & dosha questionnaire integration",
      "Promotional placement on AyurPass global discovery channels",
    ],
  },
  {
    id: "brands",
    icon: CompassIcon,
    title: "Herbal Brands & Products",
    subtitle: "For authentic Ayurvedic formulations, organic teas & wellness tools",
    badge: "Marketplace",
    benefits: [
      "Sell products directly on the AyurPass wellness marketplace",
      "Direct recommendation engine for practitioners during client consultations",
      "Transparent inventory, shipping status, and payout tracking",
      "Authenticity & organic certification verification trust badge",
    ],
  },
];

const STATS = [
  { value: "48+", label: "Countries & Currencies Supported" },
  { value: "100+", label: "Verified Clinics & Wellness Centers" },
  { value: "98%", label: "Client Satisfaction & Retention" },
  { value: "0$", label: "Upfront Setup Fee" },
];

const FAQS = [
  {
    q: "How does practitioner and clinic verification work?",
    a: "Every practitioner and practice submits their professional credentials (such as AHPRA, AAA Australia, or state medical licences). Our verification team reviews documentation within 24–48 hours to grant the Verified badge.",
  },
  {
    q: "Are there any upfront or subscription costs?",
    a: "No! Creating a practice listing, receiving enquiries, and managing basic profile features is 100% free. We only charge a small platform commission on completed paid bookings or marketplace sales.",
  },
  {
    q: "How does Corporate Wellness billing work?",
    a: "Corporate partners receive a unified dashboard to set monthly per-employee stipends. Employers receive a single monthly itemized invoice while employees enjoy seamless booking across all verified AyurPass providers.",
  },
  {
    q: "Can retreat operators accept international deposits?",
    a: "Yes! AyurPass supports payments and payouts in 40+ currencies including AUD, USD, EUR, GBP, INR, and AED via Stripe Connect.",
  },
];

export default function PartnersClient() {
  const [activeTab, setActiveTab] = useState("clinics");
  const [form, setForm] = useState({
    partnerType: "Clinic / Practice",
    orgName: "",
    contactName: "",
    email: "",
    phone: "",
    country: "Australia",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const activeTrack = PARTNER_TRACKS.find((t) => t.id === activeTab) || PARTNER_TRACKS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.orgName.trim() || !form.email.trim() || !form.contactName.trim()) {
      setError("Please fill out your organization name, contact name and email.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.createEnquiry({
        name: form.contactName,
        email: form.email,
        phone: form.phone || undefined,
        message: `Subject: Partnership Inquiry (${form.partnerType}): ${form.orgName}\nOrganization: ${form.orgName}\nCountry: ${form.country}\nPartner Type: ${form.partnerType}\n\nDetails:\n${form.message}`,
      });
      setSubmitted(true);
    } catch {
      setError("Failed to send inquiry. Please try again or email partners@ayurpass.com directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutWrapper>
      <PageHero
        eyebrow="For Global Partners"
        title="Grow Your Wellness Practice with AyurPass"
        subtitle="Empowering clinics, corporate wellness teams, retreat resorts, and authentic herbal brands across 48+ countries."
      />

      {/* Stats Bar */}
      <section className="border-b border-hairline bg-surface/80">
        <div className="mx-auto max-w-6xl px-5 py-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-3xl font-bold text-forest sm:text-4xl">{s.value}</p>
                <p className="mt-1 text-xs font-medium text-ink-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Track Selector Tabs */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:py-18">
        <div className="text-center">
          <span className="inline-block rounded-full bg-forest/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-forest">
            Partner Tracks
          </span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-forest sm:text-4xl">
            Choose Your Partnership Program
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            Tailored solutions designed for your specific organization type
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-2 border-b border-hairline pb-4">
          {PARTNER_TRACKS.map((track) => {
            const active = activeTab === track.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => setActiveTab(track.id)}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all ${
                  active
                    ? "bg-forest text-white shadow-md"
                    : "bg-surface border border-hairline text-ink-secondary hover:bg-clay hover:text-forest"
                }`}
              >
                <track.icon className={`h-4.5 w-4.5 ${active ? "text-gold" : ""}`} />
                <span>{track.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Track Highlight Card */}
        <div className="mt-8 rounded-3xl border border-hairline bg-surface p-6 shadow-sm sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-hairline pb-8">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest text-gold-soft">
                <activeTrack.icon className="h-7 w-7" />
              </span>
              <div>
                <span className="inline-block rounded-full bg-gold/20 px-3 py-0.5 text-xs font-bold text-forest">
                  {activeTrack.badge}
                </span>
                <h3 className="mt-1 font-display text-2xl font-semibold text-forest">{activeTrack.title}</h3>
                <p className="text-sm text-ink-muted">{activeTrack.subtitle}</p>
              </div>
            </div>

            <a
              href="#apply-form"
              className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-forest-deep"
            >
              Apply for {activeTrack.title}
              <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-8">
            <h4 className="font-display text-lg font-semibold text-forest mb-4">Key Benefits & Features:</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              {activeTrack.benefits.map((b) => (
                <div key={b} className="flex items-start gap-3 rounded-2xl border border-hairline bg-background p-4">
                  <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-leaf" />
                  <span className="text-sm leading-relaxed text-ink">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Application / Inquiry Form Section */}
      <section id="apply-form" className="scroll-mt-20 border-t border-hairline bg-surface/60 py-14 sm:py-18">
        <div className="mx-auto max-w-4xl px-5">
          <div className="rounded-3xl border border-hairline bg-surface p-6 shadow-lg sm:p-10">
            <div className="text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-forest/10 text-forest">
                <MailIcon className="h-6 w-6" />
              </span>
              <h2 className="mt-3 font-display text-3xl font-semibold text-forest">
                Start Your Partnership
              </h2>
              <p className="mt-2 text-sm text-ink-muted">
                Fill out your details below and our partnership director will contact you within 24 hours.
              </p>
            </div>

            {submitted ? (
              <div className="mt-8 rounded-2xl bg-forest/10 p-8 text-center border border-forest/20">
                <CheckIcon className="mx-auto h-12 w-12 text-forest" />
                <h3 className="mt-3 font-display text-2xl font-semibold text-forest">
                  Inquiry Received!
                </h3>
                <p className="mt-2 text-sm text-ink-secondary">
                  Thank you for your interest in partnering with AyurPass. Our partnerships team has received your request and will reach out shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-6 inline-flex rounded-full bg-forest px-6 py-2.5 text-xs font-semibold text-white"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {error && (
                  <div className="rounded-2xl bg-red-500/10 p-4 text-xs font-semibold text-red-600 border border-red-500/20">
                    {error}
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-1.5">
                      Partnership Track *
                    </label>
                    <select
                      value={form.partnerType}
                      onChange={(e) => setForm({ ...form, partnerType: e.target.value })}
                      className="w-full rounded-2xl border border-hairline bg-surface px-4 py-3 text-sm text-ink focus:border-forest focus:outline-none"
                    >
                      <option value="Clinic / Practice">Clinic / Wellness Practice</option>
                      <option value="Corporate Wellness">Corporate Wellness Program</option>
                      <option value="Retreat / Resort">Retreat Center / Eco Resort</option>
                      <option value="Herbal Brand">Herbal Brand / Manufacturer</option>
                      <option value="Affiliate / Creator">Affiliate / Wellness Creator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-1.5">
                      Organization / Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lotus Wellness Clinic"
                      value={form.orgName}
                      onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                      className="w-full rounded-2xl border border-hairline bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-forest focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-1.5">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your full name"
                      value={form.contactName}
                      onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                      className="w-full rounded-2xl border border-hairline bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-forest focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-1.5">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@organization.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-2xl border border-hairline bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-forest focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+61 400 000 000"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full rounded-2xl border border-hairline bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-forest focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-1.5">
                      Country / Region *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Australia, India, USA"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="w-full rounded-2xl border border-hairline bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-forest focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-1.5">
                    How can we help your organization? (Optional)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your services, locations, or goals..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-2xl border border-hairline bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-forest focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-forest py-4 text-center text-sm font-semibold text-white shadow-md transition-colors hover:bg-forest-deep disabled:opacity-50"
                >
                  {loading ? "Sending Partnership Inquiry..." : "Submit Partnership Request"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="mx-auto max-w-4xl px-5 py-14 sm:py-18">
        <div className="text-center">
          <span className="inline-block rounded-full bg-forest/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-forest">
            Got Questions?
          </span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-forest">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-8 space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-2xl border border-hairline bg-surface transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-5 text-left font-display text-base font-semibold text-forest hover:bg-clay/50"
                >
                  <span>{faq.q}</span>
                  <span className="ml-2 text-xl font-light text-forest">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div className="border-t border-hairline px-5 pb-5 pt-3 text-sm leading-relaxed text-ink-secondary">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="border-t border-hairline bg-forest py-14 text-white">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-gold-soft mx-auto mb-4">
            <ShieldIcon className="h-6 w-6" />
          </span>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Ready to list your practice for free?</h2>
          <p className="mt-3 text-sm text-white/70 max-w-xl mx-auto">
            You can create a free public directory profile in under 2 minutes and start receiving direct client bookings right away.
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <Link
              href="/list-your-business"
              className="rounded-full bg-gold px-8 py-3.5 text-sm font-bold text-forest-deep shadow-lg hover:bg-gold-soft"
            >
              List your practice — free
            </Link>
          </div>
        </div>
      </section>
    </LayoutWrapper>
  );
}
