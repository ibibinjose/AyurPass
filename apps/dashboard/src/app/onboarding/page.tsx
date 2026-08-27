"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Compass,
  Flame,
  Flower2,
  Heart,
  Leaf,
  MapPin,
  Moon,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Zap,
} from "lucide-react";
import { Button, Card, CardContent, ErrorNote } from "@/components/ui";
import { Logo } from "@/components/Logo";
import { BRAND_VERIFIED_MARK } from "@/lib/brand";

type OnboardingRole = "CONSUMER" | "PROFESSIONAL" | "PROVIDER_ADMIN";

type RoleOption = {
  role: OnboardingRole;
  icon: React.ReactNode;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  gradient: string;
  badge: string;
};

const ROLES: RoleOption[] = [
  {
    role: "CONSUMER",
    icon: <Compass className="h-6 w-6 text-[#1e3228]" />,
    emoji: "🌿",
    title: "Seeker",
    subtitle: "Wellness Explorer & Client",
    description: "Discover vetted Ayurvedic clinics, yoga studios, retreats and spas. Take your Prakriti quiz and book sessions.",
    features: ["Personalized Prakriti quiz", "Geospatial 'Near Me' search", "Instant appointment & pass booking", "Earn AyurPass rewards"],
    gradient: "from-[#1e3228] via-[#2f5a44] to-[#a67a24]",
    badge: "For Seekers",
  },
  {
    role: "PROFESSIONAL",
    icon: <UserCheck className="h-6 w-6 text-[#a67a24]" />,
    emoji: "🧘",
    title: "Professional",
    subtitle: "Practitioner & Therapist",
    description: "Build your verified practitioner profile, display credentials, receive consultation leads, and manage schedules.",
    features: ["Public verified practitioner profile", "Official credential vetting badge", "Schedule & consultation manager", "Connect with clinics & studios"],
    gradient: "from-[#a67a24] via-[#855e14] to-[#1e3228]",
    badge: "For Practitioners",
  },
  {
    role: "PROVIDER_ADMIN",
    icon: <Building2 className="h-6 w-6 text-[#1e3228]" />,
    emoji: "🏛️",
    title: "Provider",
    subtitle: "Clinic · Studio · Retreat",
    description: "List your business venue, manage staff members, service menus, room schedules, direct bookings, and job listings.",
    features: ["Complete venue & brand profile", "Staff, schedule & service POS", "Real-time bookings & payments", "Practitioner recruitment"],
    gradient: "from-[#1e3228] via-[#a67a24] to-[#e9d9b8]",
    badge: "For Businesses",
  },
];

type DoshaType = "vata" | "pitta" | "kapha" | "balanced";

const DOSHAS: { id: DoshaType; name: string; element: string; emoji: string; color: string; desc: string }[] = [
  { id: "vata", name: "Vata", element: "Air & Ether", emoji: "💨", color: "border-purple-400 bg-purple-50/50 text-purple-900", desc: "Creative, energetic, quick-minded. Needs warmth, grounding, and routine." },
  { id: "pitta", name: "Pitta", element: "Fire & Water", emoji: "🔥", color: "border-amber-400 bg-amber-50/50 text-amber-900", desc: "Passionate, focused, goal-oriented. Needs cooling, relaxation, and balance." },
  { id: "kapha", name: "Kapha", element: "Earth & Water", emoji: "🌱", color: "border-emerald-400 bg-emerald-50/50 text-emerald-900", desc: "Calm, grounded, compassionate. Needs stimulation, movement, and lightness." },
  { id: "balanced", name: "Tridoshic", element: "All 3 Elements", emoji: "✨", color: "border-gold-soft bg-gold/10 text-forest-deep", desc: "Harmonious blend across Vata, Pitta, and Kapha energies." },
];

const SERVICE_INTERESTS = [
  { id: "ayurveda", label: "Ayurvedic Consultations", icon: Leaf },
  { id: "panchakarma", label: "Panchakarma Detox", icon: Sparkles },
  { id: "yoga", label: "Yoga & Pranayama", icon: Flower2 },
  { id: "meditation", label: "Mindfulness & Sound Bath", icon: Moon },
  { id: "spa", label: "Abhyanga & Herbal Spa", icon: Flame },
  { id: "retreats", label: "Wellness Retreats", icon: Heart },
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");

  const [step, setStep] = useState<number>(1);
  const [selectedRole, setSelectedRole] = useState<OnboardingRole>("CONSUMER");
  const [selectedDosha, setSelectedDosha] = useState<DoshaType>("balanced");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["ayurveda", "yoga"]);
  const [locationText, setLocationText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  function toggleInterest(id: string) {
    if (selectedInterests.includes(id)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter((item) => item !== id));
      }
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  }

  function handleComplete() {
    try {
      const targetRole = selectedRole;
      const targetUrl = `/register?role=${targetRole}${nextParam ? `&next=${encodeURIComponent(nextParam)}` : ""}`;
      router.push(targetUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-surface text-foreground font-sans">
      {/* Background Mesh Gradient */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[550px] w-[550px] rounded-full bg-gold/15 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 h-[550px] w-[650px] rounded-full bg-forest/10 blur-[150px]" />

      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-hairline/80 bg-surface/95 backdrop-blur-xl shadow-xs">
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

          {/* Stepper Progress */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    s === step
                      ? "w-8 bg-forest"
                      : s < step
                      ? "w-2.5 bg-gold"
                      : "w-2.5 bg-hairline"
                  }`}
                />
              ))}
            </div>

            <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1 text-xs font-bold text-gold-deep">
              <ShieldCheck className="h-3.5 w-3.5 text-gold-deep" />
              <span>Step {step} of 3</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-10 md:py-14">
        <div className="max-w-4xl w-full">
          {/* STEP 1: Account Type Selection */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-surface px-4 py-1.5 text-xs font-extrabold text-gold-deep mb-3 shadow-xs">
                  <Sparkles className="h-3.5 w-3.5 text-gold-deep" />
                  <span>Welcome to AyurPass</span>
                </div>

                <h1 className="text-3xl md:text-5xl font-display font-bold text-forest tracking-tight mb-3">
                  How will you use <span className="text-gold-deep">AyurPass</span>?
                </h1>

                <p className="text-sm md:text-base text-ink-muted font-medium max-w-xl mx-auto">
                  Choose your primary role. You can switch between Seeker, Professional, and Business accounts anytime.
                </p>
              </div>

              {/* Role Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {ROLES.map((roleOpt) => {
                  const isSelected = selectedRole === roleOpt.role;
                  return (
                    <Card
                      key={roleOpt.role}
                      onClick={() => setSelectedRole(roleOpt.role)}
                      className={`cursor-pointer transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? "ring-2 ring-forest shadow-2xl scale-[1.02] bg-surface"
                          : "border-hairline hover:border-gold hover:scale-[1.01] bg-surface/80"
                      }`}
                    >
                      <div>
                        <div className={`h-2.5 w-full bg-gradient-to-r ${roleOpt.gradient}`} />
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${isSelected ? "bg-forest/10" : "bg-clay/60"}`}>
                              {roleOpt.icon}
                            </div>
                            <span className="text-[11px] font-bold px-3 py-1 rounded-full border border-hairline bg-surface text-ink-muted">
                              {roleOpt.badge}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{roleOpt.emoji}</span>
                            <h2 className="text-xl font-bold font-display text-forest">{roleOpt.title}</h2>
                          </div>
                          <p className="text-xs font-semibold text-gold-deep mb-3">{roleOpt.subtitle}</p>
                          <p className="text-xs text-ink-muted mb-5 leading-relaxed">{roleOpt.description}</p>

                          <div className="space-y-2 mb-4">
                            {roleOpt.features.map((feat, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <div className={`mt-0.5 rounded-full p-0.5 ${isSelected ? "bg-forest text-white" : "bg-clay text-ink-muted"}`}>
                                  <Check className="h-3 w-3 stroke-[3]" />
                                </div>
                                <span className="text-xs font-medium text-foreground">{feat}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </div>

                      <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-hairline">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                          {isSelected ? "Selected" : "Select"}
                        </span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-forest bg-forest text-white scale-110" : "border-hairline bg-surface"}`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={() => setStep(2)}
                  className="w-full max-w-md py-4 text-base font-bold rounded-2xl bg-forest hover:bg-forest-deep text-white shadow-xl flex items-center justify-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Ayurvedic Constitution & Preferences */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-surface px-4 py-1.5 text-xs font-extrabold text-gold-deep mb-3 shadow-xs">
                  <Leaf className="h-3.5 w-3.5 text-leaf" />
                  <span>Prakriti & Wellness Profile</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-display font-bold text-forest tracking-tight mb-2">
                  Personalise Your <span className="text-gold-deep">AyurPass</span> Experience
                </h1>

                <p className="text-sm text-ink-muted font-medium max-w-lg mx-auto">
                  Select your primary Dosha constitution or preferences to help match tailored remedies and therapies.
                </p>
              </div>

              {/* Dosha Selector */}
              <div className="mb-8">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-3 text-center">
                  Select Primary Dosha Constitution
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {DOSHAS.map((d) => {
                    const isSelected = selectedDosha === d.id;
                    return (
                      <div
                        key={d.id}
                        onClick={() => setSelectedDosha(d.id)}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${d.color} ${
                          isSelected ? "ring-2 ring-forest scale-[1.03] shadow-lg" : "opacity-80 hover:opacity-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">{d.emoji}</span>
                          {isSelected && <CheckCircle2 className="h-5 w-5 text-forest" />}
                        </div>
                        <h3 className="font-display font-bold text-base">{d.name}</h3>
                        <p className="text-[11px] font-semibold opacity-75 mb-2">{d.element}</p>
                        <p className="text-xs leading-relaxed opacity-90">{d.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Service Interest Pills */}
              <div className="mb-10">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-3 text-center">
                  Select Services You Are Interested In
                </label>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {SERVICE_INTERESTS.map((svc) => {
                    const Icon = svc.icon;
                    const isSelected = selectedInterests.includes(svc.id);
                    return (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => toggleInterest(svc.id)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-forest text-white shadow-md border-transparent"
                            : "bg-surface border border-hairline text-ink-muted hover:border-gold hover:text-foreground"
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isSelected ? "text-gold-soft" : "text-leaf"}`} />
                        <span>{svc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="rounded-2xl py-3 px-6 text-sm font-semibold border-hairline hover:bg-clay/50"
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  <span>Back</span>
                </Button>

                <Button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 px-6 text-sm font-bold rounded-2xl bg-forest hover:bg-forest-deep text-white shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Next Step</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Location & Confirmation */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-surface px-4 py-1.5 text-xs font-extrabold text-gold-deep mb-3 shadow-xs">
                  <MapPin className="h-3.5 w-3.5 text-gold-deep" />
                  <span>Location & Preferences</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-display font-bold text-forest tracking-tight mb-2">
                  Find Vetted Clinics <span className="text-gold-deep">Near You</span>
                </h1>

                <p className="text-sm text-ink-muted font-medium max-w-lg mx-auto">
                  Enter your city or region to explore nearby Ayurvedic practitioners, yoga centers, and wellness spas.
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-6 mb-8">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                    City or Postal Code (Optional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
                    <input
                      type="text"
                      value={locationText}
                      onChange={(e) => setLocationText(e.target.value)}
                      placeholder="e.g. Sydney, Melbourne, Byron Bay..."
                      className="w-full rounded-2xl border border-hairline bg-surface pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-ink-muted/50 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 shadow-xs"
                    />
                  </div>
                </div>

                {/* Summary Card */}
                <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Image
                      src={BRAND_VERIFIED_MARK}
                      alt="AyurPass Verified"
                      width={36}
                      height={36}
                      className="h-9 w-9 object-contain"
                    />
                    <div>
                      <h3 className="font-display font-bold text-sm text-forest">Ready to create your account</h3>
                      <p className="text-xs text-ink-muted">Official AyurPass Network Access</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-ink-muted border-t border-gold/20 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">Role:</span>
                      <span className="capitalize font-bold text-forest">{selectedRole.toLowerCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">Constitution:</span>
                      <span className="capitalize font-bold text-gold-deep">{selectedDosha}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">Selected Services:</span>
                      <span className="font-bold text-foreground">{selectedInterests.length} Selected</span>
                    </div>
                  </div>
                </div>
              </div>

              {error && <ErrorNote message={error} />}

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
                <Button
                  variant="ghost"
                  onClick={() => setStep(2)}
                  className="rounded-2xl py-3.5 px-6 text-sm font-semibold border-hairline hover:bg-clay/50"
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  <span>Back</span>
                </Button>

                <Button
                  onClick={handleComplete}
                  className="flex-1 py-3.5 px-6 text-sm font-bold rounded-2xl bg-gradient-to-r from-forest to-leaf text-white shadow-xl flex items-center justify-center gap-2 hover:brightness-110"
                >
                  <Zap className="h-4 w-4 text-gold-soft" />
                  <span>Create AyurPass Account</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full p-6 text-center text-xs text-ink-muted border-t border-hairline font-medium">
        © {new Date().getFullYear()} AyurPass Inc. • Vetted Ayurvedic & Wellness Infrastructure
      </footer>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center p-6 text-foreground">
          <div className="flex items-center gap-3 text-sm font-semibold">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-forest border-t-transparent" />
            <span>Loading AyurPass Onboarding...</span>
          </div>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
