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
  GlobeIcon,
} from "@/components/icons";
import { api } from "@/lib/api";

const PARTNER_TRACKS = [
  {
    id: "clinics",
    icon: LeafIcon,
    title: "Clinics & Spas",
    subtitle: "For Ayurvedic practitioners, Panchakarma centers & wellness spas",
    badge: "Direct Bookings",
    formType: "Clinic / Practice",
    benefits: [
      "Verified practice profile with root handle (e.g. ayurpass.com/practice/your-name)",
      "Built-in consultation booking, intake forms & client history telemetry",
      "Dosha-compatible treatment tagging for targeted client matching",
      "No upfront monthly fee — pay only on successful completed bookings",
    ],
  },
  {
    id: "corporate",
    icon: UsersIcon,
    title: "Corporate Wellness",
    subtitle: "For companies, HR leads & employee benefit managers",
    badge: "Employee Pass",
    formType: "Corporate Wellness",
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
    formType: "Retreat / Resort",
    benefits: [
      "List multi-day retreat packages with custom accommodation & meal tiers",
      "Accept global deposits in 40+ currencies with automated payouts via Stripe Connect",
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
    formType: "Herbal Brand",
    benefits: [
      "Sell products directly on the AyurPass wellness marketplace",
      "Direct recommendation engine for practitioners during client consultations",
      "Transparent inventory, shipping status, and payout tracking",
      "Authenticity & organic certification verification trust badge",
    ],
  },
];

const STATS = [
  { value: "AU", label: "Home market", icon: GlobeIcon },
  { value: "Now", label: "Onboarding clinics", icon: LeafIcon },
  { value: "Stripe", label: "Payments", icon: SparkleIcon },
  { value: "$0", label: "Upfront setup fee", icon: ShieldIcon },
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

  const handleSelectTrack = (track: typeof PARTNER_TRACKS[number]) => {
    setActiveTab(track.id);
    setForm((prev) => ({ ...prev, partnerType: track.formType }));
  };

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
      {/* Hero Banner */}
      <PageHero
        eyebrow="For wellness partners"
        title="Scale Your Practice with AyurPass"
        subtitle="For clinics, corporate wellness teams, retreat resorts, and authentic herbal brands. We are onboarding practices in Australia now."
      />

      {/* Stats Section */}
      <section className="border-b border-hairline/80 bg-surface/90 py-10 shadow-2xs backdrop-blur">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="group flex flex-col items-center rounded-2xl border border-hairline/80 bg-surface p-5 text-center shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-leaf/40 hover:shadow-xs"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-forest/10 text-forest mb-2.5 transition-colors group-hover:bg-forest group-hover:text-white">
                  <s.icon className="h-5 w-5" />
                </div>
                <p className="font-display text-3xl font-bold tracking-tight text-forest sm:text-4xl">
                  {s.value}
                </p>
                <p className="mt-1 text-xs font-semibold text-ink-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Track Selector Tabs */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-forest/10 px-4 py-1 text-xs font-bold uppercase tracking-wider text-forest">
            <SparkleIcon className="h-3.5 w-3.5" />
            <span>Tailored Partnership Tracks</span>
          </span>
          <h2 className="mt-3.5 font-display text-3xl font-bold text-forest sm:text-4xl">
            Choose Your Partnership Program
          </h2>
          <p className="mt-2 text-sm font-medium text-ink-muted">
            Select your track to explore dedicated features, automated workflows, and global booking integrations.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-3 border-b border-hairline pb-4">
          {PARTNER_TRACKS.map((track) => {
            const active = activeTab === track.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => handleSelectTrack(track)}
                className={`profile-spring flex items-center gap-2.5 rounded-2xl px-5 py-3 text-sm font-bold transition-all ${
                  active
                    ? "bg-forest text-white shadow-md ring-2 ring-forest/30"
                    : "bg-surface border border-hairline text-ink-secondary hover:bg-clay/50 hover:text-forest"
                }`}
              >
                <track.icon className={`h-4.5 w-4.5 ${active ? "text-gold-soft" : ""}`} />
                <span>{track.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Track Highlight Card */}
        <div className="mt-8 rounded-3xl border border-hairline bg-surface p-6 shadow-xs sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-hairline pb-8">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-forest text-gold-soft shadow-xs">
                <activeTrack.icon className="h-8 w-8" />
              </span>
              <div>
                <span className="inline-block rounded-full bg-leaf/20 px-3 py-0.5 text-xs font-bold text-forest">
                  {activeTrack.badge}
                </span>
                <h3 className="mt-1 font-display text-2.5xl font-bold text-forest">{activeTrack.title}</h3>
                <p className="text-sm font-medium text-ink-muted">{activeTrack.subtitle}</p>
              </div>
            </div>

            <a
              href="#apply-form"
              onClick={() => setForm((prev) => ({ ...prev, partnerType: activeTrack.formType }))}
              className="profile-spring inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-forest-deep active:scale-95"
            >
              <span>Apply for {activeTrack.title}</span>
              <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-8">
            <h4 className="font-display text-lg font-bold text-forest mb-4">Key Benefits &amp; Features:</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              {activeTrack.benefits.map((b) => (
                <div
                  key={b}
                  className="group flex items-start gap-3.5 rounded-2xl border border-hairline/80 bg-background/60 p-4 transition-all hover:border-leaf/40 hover:bg-background"
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-leaf/20 text-forest">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-medium leading-relaxed text-ink">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Application / Inquiry Form Section */}
      <section id="apply-form" className="scroll-mt-20 border-t border-hairline bg-surface/60 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-5">
          <div className="rounded-3xl border border-hairline bg-surface p-6 shadow-xl sm:p-12">
            <div className="text-center max-w-lg mx-auto">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-forest/10 text-forest shadow-2xs">
                <MailIcon className="h-7 w-7" />
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold text-forest">
                Start Your Partnership
              </h2>
              <p className="mt-2 text-sm font-medium text-ink-muted">
                Submit your details below. Our partnership director will review your request and reach out within 24 hours.
              </p>
            </div>

            {submitted ? (
              <div className="mt-10 rounded-3xl bg-forest/10 p-8 text-center border border-forest/20 shadow-xs">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest text-white shadow-md">
                  <CheckIcon className="h-8 w-8" />
                </div>
                <h3 className="mt-4 font-display text-2.5xl font-bold text-forest">
                  Inquiry Successfully Received!
                </h3>
                <p className="mt-2 text-sm font-medium text-ink-secondary max-w-md mx-auto">
                  Thank you for your interest in partnering with AyurPass. Our partnerships team has received your request and will contact you via email shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="profile-spring mt-6 inline-flex rounded-full bg-forest px-6 py-3 text-xs font-bold text-white shadow-xs hover:bg-forest-deep"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                {error && (
                  <div className="rounded-2xl bg-red-500/10 p-4 text-xs font-bold text-red-600 border border-red-500/20">
                    {error}
                  </div>
                )}

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">
                      Partnership Track *
                    </label>
                    <select
                      value={form.partnerType}
                      onChange={(e) => setForm({ ...form, partnerType: e.target.value })}
                      className="w-full rounded-2xl border border-hairline bg-surface px-4 py-3.5 text-sm font-medium text-ink focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all"
                    >
                      <option value="Clinic / Practice">Clinic / Wellness Practice</option>
                      <option value="Corporate Wellness">Corporate Wellness Program</option>
                      <option value="Retreat / Resort">Retreat Center / Eco Resort</option>
                      <option value="Herbal Brand">Herbal Brand / Manufacturer</option>
                      <option value="Affiliate / Creator">Affiliate / Wellness Creator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">
                      Organization / Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lotus Wellness Clinic"
                      value={form.orgName}
                      onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                      className="w-full rounded-2xl border border-hairline bg-surface px-4 py-3.5 text-sm font-medium text-ink placeholder:text-ink-muted focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your full name"
                      value={form.contactName}
                      onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                      className="w-full rounded-2xl border border-hairline bg-surface px-4 py-3.5 text-sm font-medium text-ink placeholder:text-ink-muted focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@organization.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-2xl border border-hairline bg-surface px-4 py-3.5 text-sm font-medium text-ink placeholder:text-ink-muted focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+61 400 000 000"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full rounded-2xl border border-hairline bg-surface px-4 py-3.5 text-sm font-medium text-ink placeholder:text-ink-muted focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">
                      Country / Region *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Australia, India, USA"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="w-full rounded-2xl border border-hairline bg-surface px-4 py-3.5 text-sm font-medium text-ink placeholder:text-ink-muted focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">
                    How can we help your organization? (Optional)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your services, locations, or goals..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-2xl border border-hairline bg-surface px-4 py-3.5 text-sm font-medium text-ink placeholder:text-ink-muted focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="profile-spring w-full rounded-full bg-forest py-4 text-center text-xs font-bold text-white shadow-md transition-all hover:bg-forest-deep active:scale-95 disabled:opacity-50"
                >
                  {loading ? "Sending Partnership Inquiry..." : "Submit Partnership Request →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="mx-auto max-w-4xl px-5 py-16 sm:py-20">
        <div className="text-center max-w-xl mx-auto">
          <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-4 py-1 text-xs font-bold uppercase tracking-wider text-forest">
            Frequently Asked Questions
          </span>
          <h2 className="mt-3.5 font-display text-3xl font-bold text-forest">
            Everything You Need to Know
          </h2>
        </div>

        <div className="mt-10 space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={faq.q}
                className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                  isOpen
                    ? "border-forest/40 bg-surface shadow-2xs"
                    : "border-hairline bg-surface/80 hover:border-leaf/40"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-5 text-left font-display text-base font-bold text-forest hover:bg-clay/30 transition-colors"
                >
                  <span className="pr-4">{faq.q}</span>
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all ${isOpen ? "bg-forest text-white" : "bg-clay/50 text-forest"}`}>
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-hairline/60 px-5 pb-5 pt-3 text-sm font-medium leading-relaxed text-ink-secondary">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative overflow-hidden border-t border-hairline bg-forest py-16 text-white">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-4xl px-5 text-center relative z-10">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-gold-soft mx-auto mb-4 shadow-2xs">
            <ShieldIcon className="h-7 w-7" />
          </span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Ready to list your practice for free?</h2>
          <p className="mt-3 text-sm text-white/80 max-w-xl mx-auto font-medium">
            You can create a free public directory profile in under 2 minutes and start receiving direct client bookings right away.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/list-your-business"
              className="profile-spring rounded-full bg-gold px-8 py-4 text-xs font-bold text-forest-deep shadow-lg hover:bg-gold-soft active:scale-95"
            >
              List your practice — 100% free
            </Link>
          </div>
        </div>
      </section>
    </LayoutWrapper>
  );
}
