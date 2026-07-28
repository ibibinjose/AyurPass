"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { Button, Card, CardContent, ErrorNote } from "@/components/ui";
import { loginUrl } from "@/lib/auth-redirect";
import { Logo } from "@/components/Logo";

type AccountRole = "CONSUMER" | "PROFESSIONAL" | "PROVIDER_ADMIN";

type AccountOption = {
  role: AccountRole;
  icon: React.ReactNode;
  emoji: string;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  perks: string[];
  gradientHeader: string;
  btnGradient: string;
  badgeLabel: string;
  badgeColor: string;
  highlightText: string;
};

const ACCOUNT_OPTIONS: AccountOption[] = [
  {
    role: "CONSUMER",
    icon: <Compass className="h-7 w-7 text-[#1e3228]" />,
    emoji: "🌿",
    title: "Seeker",
    subtitle: "Wellness Explorer & Client",
    tagline: "Discover & book holistic wellness",
    description:
      "Explore vetted Ayurveda clinics, yoga studios & spas near you. Take your Prakriti quiz, receive personalized recommendations, and book instantly.",
    perks: [
      "Personalized Prakriti Dosha quiz",
      "Geospatial 'Near Me' clinic search",
      "Instant appointment & pass booking",
      "AyurPass rewards & loyalty points",
    ],
    gradientHeader: "from-[#1e3228] via-[#2f5a44] to-[#a67a24]",
    btnGradient: "from-[#1e3228] to-[#2f5a44]",
    badgeLabel: "Free • Explorer",
    badgeColor: "bg-[#1e3228]/10 text-[#1e3228] border-[#1e3228]/25",
    highlightText: "text-[#1e3228]",
  },
  {
    role: "PROFESSIONAL",
    icon: <UserCheck className="h-7 w-7 text-[#a67a24]" />,
    emoji: "🧘",
    title: "Professional",
    subtitle: "Practitioner & Therapist",
    tagline: "Build your clinical practice",
    description:
      "Build your public practitioner profile, earn verified credentials, accept client consultation leads, and manage your schedules seamlessly.",
    perks: [
      "Public verified practitioner profile",
      "Official credential vetting badge",
      "Schedule & consultation manager",
      "Connect with clinics or studios",
    ],
    gradientHeader: "from-[#a67a24] via-[#855e14] to-[#1e3228]",
    btnGradient: "from-[#a67a24] to-[#855e14]",
    badgeLabel: "For Practitioners",
    badgeColor: "bg-[#a67a24]/15 text-[#a67a24] border-[#a67a24]/30",
    highlightText: "text-[#a67a24]",
  },
  {
    role: "PROVIDER_ADMIN",
    icon: <Building2 className="h-7 w-7 text-[#1e3228]" />,
    emoji: "🏛️",
    title: "Provider",
    subtitle: "Clinic · Studio · Retreat",
    tagline: "Grow your wellness business",
    description:
      "List your clinic, spa, or yoga studio. Manage staff members, room availability, service menus, direct bookings, and job listings.",
    perks: [
      "Complete business venue listing",
      "Staff, schedule & service POS",
      "Real-time bookings & payments",
      "Recruitment & practitioner hiring",
    ],
    gradientHeader: "from-[#1e3228] via-[#a67a24] to-[#efe8d9]",
    btnGradient: "from-[#1e3228] via-[#a67a24] to-[#7c5710]",
    badgeLabel: "For Businesses",
    badgeColor: "bg-[#1e3228]/15 text-[#1e3228] border-[#1e3228]/30",
    highlightText: "text-[#1e3228]",
  },
];

type ComparisonFeature = {
  feature: string;
  seeker: boolean | string;
  professional: boolean | string;
  provider: boolean | string;
};

const COMPARISON_MATRIX: ComparisonFeature[] = [
  { feature: "Dosha & Prakriti Assessment", seeker: "Included", professional: "Included", provider: "Included" },
  { feature: "Discover Clinics & Near Me Search", seeker: true, professional: true, provider: true },
  { feature: "Book Appointments & Passes", seeker: true, professional: true, provider: true },
  { feature: "Public Practitioner Profile", seeker: false, professional: true, provider: true },
  { feature: "Verified Credential Seal", seeker: false, professional: true, provider: true },
  { feature: "Venue & Business Listing", seeker: false, professional: "Clinic Link", provider: "Full Venue" },
  { feature: "Staff & Schedule Management", seeker: false, professional: "Personal", provider: "Team & Rooms" },
  { feature: "Publish Job Openings", seeker: false, professional: false, provider: true },
];

export default function AccountTypePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");

  const [selectedRole, setSelectedRole] = useState<AccountRole>("CONSUMER");
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const selectedOption = ACCOUNT_OPTIONS.find((o) => o.role === selectedRole)!;

  function handleContinue() {
    try {
      const registerUrlWithRole = nextParam
        ? `/register?role=${selectedRole}&next=${encodeURIComponent(nextParam)}`
        : `/register?role=${selectedRole}`;
      router.push(registerUrlWithRole);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-[#e9d9b8] text-[#1e3228] font-sans">
      {/* Dynamic Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[550px] w-[550px] rounded-full bg-[#a67a24]/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 h-[550px] w-[650px] rounded-full bg-[#1e3228]/15 blur-[150px]" />

      {/* Standard Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-hairline/80 bg-surface/95 backdrop-blur-xl shadow-xs">
        {/* Top Gradient Accent Line */}
        <div className="h-[2.5px] w-full bg-gradient-to-r from-forest via-gold to-leaf opacity-90" />

        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-hairline/80 bg-surface px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-leaf hover:bg-clay/40"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-ink-muted" />
              <span>Back</span>
            </Link>

            <Logo />
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1 text-xs font-bold text-gold-deep">
              <ShieldCheck className="h-3.5 w-3.5 text-gold-deep" />
              <span>Step 1 of 2</span>
            </span>

            <Link
              href={loginUrl(nextParam || undefined)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-forest hover:bg-forest-deep transition-all shadow-xs"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-10 md:py-14">
        <div className="max-w-5xl w-full">
          {/* Hero Header Section */}
          <div className="text-center mb-10 md:mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#a67a24]/40 bg-[#fffdf9]/90 px-4 py-1.5 text-xs font-extrabold text-[#a67a24] mb-4 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-[#a67a24]" />
              <span>AyurPass Account Creation</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-display font-bold text-[#1e3228] tracking-tight mb-3">
              What brings you to <span className="text-[#a67a24] font-extrabold">AyurPass</span>?
            </h1>

            <p className="text-sm md:text-base text-[#1e3228]/85 font-medium max-w-xl mx-auto">
              Select your account type below. You can seamlessly switch or add roles anytime in your profile settings.
            </p>

            {/* Quick Role Switcher Pills (Mobile / Desktop Quick Select) */}
            <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-[#1e3228]/15 bg-[#fffdf9]/80 p-1.5 shadow-sm">
              {ACCOUNT_OPTIONS.map((opt) => {
                const isActive = selectedRole === opt.role;
                return (
                  <button
                    key={opt.role}
                    type="button"
                    onClick={() => setSelectedRole(opt.role)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[#1e3228] text-white shadow-md"
                        : "text-[#1e3228]/70 hover:text-[#1e3228] hover:bg-[#1e3228]/5"
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3 Account Selection Cards Grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
            role="radiogroup"
            aria-label="Account Type Options"
          >
            {ACCOUNT_OPTIONS.map((option) => {
              const isSelected = selectedRole === option.role;

              return (
                <Card
                  key={option.role}
                  onClick={() => setSelectedRole(option.role)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedRole(option.role);
                    }
                  }}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  className={`cursor-pointer transition-all duration-300 overflow-hidden outline-none flex flex-col justify-between ${
                    isSelected
                      ? "ring-2 ring-[#1e3228] shadow-2xl scale-[1.02] border-transparent bg-[#fffdf9]"
                      : "border-[#1e3228]/15 hover:border-[#a67a24] bg-[#fffdf9]/90 hover:scale-[1.01]"
                  }`}
                >
                  <div>
                    {/* Top Decorative Banner */}
                    <div
                      className={`h-2.5 w-full bg-gradient-to-r ${option.gradientHeader}`}
                    />

                    <CardContent className="p-6 md:p-7">
                      {/* Icon Container & Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`p-3 rounded-2xl transition-all ${
                            isSelected
                              ? "bg-[#1e3228]/10 shadow-inner"
                              : "bg-[#efe8d9]"
                          }`}
                        >
                          {option.icon}
                        </div>

                        <span
                          className={`text-[11px] font-bold px-3 py-1 rounded-full border ${option.badgeColor}`}
                        >
                          {option.badgeLabel}
                        </span>
                      </div>

                      {/* Role Title & Subtitle */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{option.emoji}</span>
                        <h2 className="text-xl font-bold font-display text-[#1e3228]">
                          {option.title}
                        </h2>
                      </div>
                      <p className="text-xs font-semibold text-[#a67a24] mb-3">
                        {option.subtitle}
                      </p>

                      <p className="text-xs text-[#3f3b34] mb-5 leading-relaxed">
                        {option.description}
                      </p>

                      {/* Feature Perks List */}
                      <div className="space-y-2.5 mb-6">
                        {option.perks.map((perk, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div
                              className={`mt-0.5 rounded-full p-0.5 ${
                                isSelected
                                  ? "bg-[#1e3228] text-white"
                                  : "bg-[#efe8d9] text-[#3f3b34]"
                              }`}
                            >
                              <Check className="h-3 w-3 stroke-[3]" />
                            </div>
                            <span className="text-xs font-medium text-[#1e3228] leading-snug">
                              {perk}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </div>

                  {/* Radio Selection Footer */}
                  <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-[#ddd6c8]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#5c574e]">
                      {isSelected ? "Active Selection" : "Click to Select"}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-[#1e3228] bg-[#1e3228] text-white shadow-md scale-110"
                          : "border-[#ddd6c8] bg-[#fffdf9]"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Error Banner */}
          {error && <ErrorNote message={error} />}

          {/* Action Call To Action Button */}
          <div className="flex flex-col items-center max-w-md mx-auto">
            <Button
              onClick={handleContinue}
              className={`w-full py-4 text-base font-bold rounded-2xl bg-gradient-to-r ${selectedOption.btnGradient} text-white shadow-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] flex items-center justify-center gap-2`}
            >
              <span>Continue as {selectedOption.title}</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </Button>

            <p className="mt-3.5 text-xs text-[#1e3228]/80 font-medium text-center flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#1e3228]" />
              <span>Free registration • Upgrade or switch roles anytime in Settings</span>
            </p>

            {/* Toggle Comparison Table */}
            <button
              type="button"
              onClick={() => setShowComparison(!showComparison)}
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#1e3228] hover:text-[#a67a24] transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>{showComparison ? "Hide Feature Matrix" : "Compare Account Privileges"}</span>
              {showComparison ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Feature Privilege Matrix Drawer */}
          {showComparison && (
            <div className="mt-8 rounded-3xl border border-[#1e3228]/15 bg-[#fffdf9] p-6 shadow-xl animate-in fade-in slide-in-from-top-4">
              <div className="text-center mb-6">
                <h3 className="font-display text-xl font-bold text-[#1e3228]">Account Privileges Comparison</h3>
                <p className="text-xs text-[#5c574e]">See what features are included with each account type</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium">
                  <thead>
                    <tr className="border-b border-[#ddd6c8] text-[#1e3228]">
                      <th className="py-3 px-4 font-bold">Platform Feature</th>
                      <th className="py-3 px-4 text-center font-bold">🌿 Seeker</th>
                      <th className="py-3 px-4 text-center font-bold">🧘 Professional</th>
                      <th className="py-3 px-4 text-center font-bold">🏛️ Provider</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ddd6c8]">
                    {COMPARISON_MATRIX.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#efe8d9]/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-[#1e3228]">{row.feature}</td>
                        <td className="py-3 px-4 text-center">
                          {typeof row.seeker === "boolean" ? (
                            row.seeker ? (
                              <Check className="h-4 w-4 mx-auto text-[#1e3228] stroke-[3]" />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )
                          ) : (
                            <span className="font-bold text-[#1e3228]">{row.seeker}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {typeof row.professional === "boolean" ? (
                            row.professional ? (
                              <Check className="h-4 w-4 mx-auto text-[#a67a24] stroke-[3]" />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )
                          ) : (
                            <span className="font-bold text-[#a67a24]">{row.professional}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {typeof row.provider === "boolean" ? (
                            row.provider ? (
                              <Check className="h-4 w-4 mx-auto text-[#1e3228] stroke-[3]" />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )
                          ) : (
                            <span className="font-bold text-[#1e3228]">{row.provider}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full p-6 text-center text-xs text-[#1e3228]/60 border-t border-[#1e3228]/15 font-medium">
        © {new Date().getFullYear()} AyurPass Inc. • Vetted Wellness Network
      </footer>
    </div>
  );
}