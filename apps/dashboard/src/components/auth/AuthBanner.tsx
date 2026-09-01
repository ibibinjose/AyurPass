"use client";

import { useEffect, useState } from "react";
import { Calendar, Heart, ShieldCheck, Sparkles, Award, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/Logo";

interface Testimonial {
  text: string;
  author: string;
  role: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    text: "AyurPass is my sanctuary. Discovering my Dosha changed my entire daily routine and lifestyle.",
    author: "Priya K.",
    role: "Wellness Seeker",
    rating: 5,
  },
  {
    text: "Running our Ayurveda practice has never been smoother. Seamless billing, booking, and treatment plans.",
    author: "Dr. Amit Sharma",
    role: "Veda Wellness Clinic",
    rating: 5,
  },
  {
    text: "The shared care features allow me to collaborate perfectly with my clients' other health professionals.",
    author: "Elena Rostova",
    role: "Ayurveda Practitioner",
    rating: 5,
  },
];

const FEATURES = [
  "Personalized Prakriti & Vikriti Assessment",
  "HIPAA & GDPR Encrypted Health Vault",
  "Seamless Clinic & Telehealth Booking",
];

export function AuthBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const active = TESTIMONIALS[index];

  return (
    <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-forest-deep via-forest to-sage-dark p-12 text-white lg:flex overflow-hidden select-none">
      {/* Decorative Glow Elements */}
      <div className="absolute -right-32 -top-32 h-[550px] w-[550px] rounded-full bg-gold-bright/10 blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute -left-24 -bottom-24 h-[450px] w-[450px] rounded-full bg-leaf-light/15 blur-[110px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 h-72 w-72 rounded-full bg-saffron/10 blur-[90px] pointer-events-none" />

      {/* Brand Header */}
      <div className="relative z-10 flex items-center justify-between">
        <Logo dark />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md text-gold-soft">
          <Sparkles className="h-3.5 w-3.5 text-gold-bright" />
          <span>Holistic Platform v1.3</span>
        </span>
      </div>

      {/* Hero Value Prop & Dynamic Testimonial Section */}
      <div className="relative z-10 my-auto max-w-xl space-y-8">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-bright">
            <Award className="h-3.5 w-3.5" />
            Holistic Sanctuary
          </span>
          <h2 className="mt-3 font-display text-3xl xl:text-4xl font-normal leading-snug text-white">
            Transform Your Mind, Body & Vital Energy
          </h2>
          <p className="mt-3 text-sm text-white/75 leading-relaxed max-w-lg">
            Create an account to book verified Ayurveda practices, or list your clinic on AyurPass.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-2.5 pt-1">
          {FEATURES.map((feat, i) => (
            <div key={i} className="flex items-center gap-2.5 text-xs text-white/85">
              <CheckCircle2 className="h-4 w-4 text-gold-bright shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        {/* Dynamic Testimonial Carousel */}
        <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl shadow-2xl transition-all duration-500">
          <div className="flex items-center gap-1 text-gold-bright mb-3">
            {Array.from({ length: active.rating }).map((_, r) => (
              <span key={r} className="text-sm">★</span>
            ))}
          </div>
          <blockquote className="font-display text-lg font-light leading-relaxed text-white/95 italic">
            “{active.text}”
          </blockquote>
          <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-gold to-saffron flex items-center justify-center font-bold text-xs text-forest-deep shadow-md">
                {active.author[0]}
              </div>
              <div>
                <p className="text-xs font-bold text-white">{active.author}</p>
                <p className="text-[11px] text-white/60">{active.role}</p>
              </div>
            </div>

            {/* Testimonial Indicator Dots */}
            <div className="flex items-center gap-1.5">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-6 bg-gold-bright" : "w-1.5 bg-white/30 hover:bg-white/50"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Mock UI Widgets */}
      <div className="relative z-10 grid grid-cols-2 gap-4">
        {/* Next Session Widget */}
        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl shadow-xl hover:border-white/25 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">Next Session</span>
            <Calendar className="h-4 w-4 text-gold-bright" />
          </div>
          <p className="mt-2 text-xs font-bold text-white truncate">Abhyanga & Swedana Ritual</p>
          <p className="text-[11px] text-white/65 mt-0.5">Today at 2:00 PM · Room A</p>
        </div>

        {/* Dosha Progress Widget */}
        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl shadow-xl hover:border-white/25 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">Prakriti Dosha</span>
            <Heart className="h-4 w-4 text-red-300 animate-pulse" />
          </div>
          <p className="mt-2 text-xs font-bold text-white">Vata-Pitta Balance</p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-white/80 w-6 font-semibold">Vata</span>
              <div className="h-1 w-full rounded-full bg-white/15 overflow-hidden">
                <div className="h-full w-[55%] bg-gold-bright rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-white/80 w-6 font-semibold">Pitta</span>
              <div className="h-1 w-full rounded-full bg-white/15 overflow-hidden">
                <div className="h-full w-[35%] bg-leaf-bright rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badge Bar */}
        <div className="col-span-2 flex items-center justify-between rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-gold-bright shrink-0" />
            <span className="text-[11px] font-medium tracking-wide text-white/90">
              HIPAA & GDPR Compliant Health Records
            </span>
          </div>
          <span className="text-[9px] font-bold text-gold-bright uppercase tracking-widest bg-gold/20 px-2 py-0.5 rounded-full border border-gold/30">
            SECURE 256-BIT
          </span>
        </div>
      </div>
    </div>
  );
}
