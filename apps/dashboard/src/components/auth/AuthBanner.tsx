"use client";

import { useEffect, useState } from "react";
import { Calendar, Heart, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";

interface Testimonial {
  text: string;
  author: string;
  role: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    text: "AyurPass is my sanctuary. Discovering my Dosha changed my entire daily routine and lifestyle.",
    author: "Priya K.",
    role: "Wellness Seeker",
  },
  {
    text: "Running our Ayurveda practice has never been smoother. Seamless billing, booking, and treatment plans.",
    author: "Dr. Amit Sharma",
    role: "Veda Wellness Clinic",
  },
  {
    text: "The shared care features allow me to collaborate perfectly with my clients' other health professionals.",
    author: "Elena Rostova",
    role: "Ayurveda Practitioner",
  },
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
    <div className="relative hidden w-1/2 flex-col justify-between bg-forest p-12 text-white lg:flex overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-gold-soft/10 blur-[120px] pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 h-[400px] w-[400px] rounded-full bg-leaf/25 blur-[100px] pointer-events-none" />

      {/* Brand Header */}
      <div className="relative z-10">
        <Logo dark />
      </div>

      {/* Dynamic Testimonial Section with Fade Animation */}
      <div className="relative z-10 my-auto max-w-lg transition-all duration-700">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-soft/70">
          Holistic Sanctuary
        </span>
        <blockquote className="mt-4 font-display text-3xl font-light leading-snug tracking-wide text-white/95">
          “{active.text}”
        </blockquote>
        <div className="mt-6 flex items-center gap-3">
          <div className="h-1 w-8 rounded bg-gold-soft" />
          <p className="text-sm font-semibold text-white">
            {active.author} <span className="font-normal text-white/60">· {active.role}</span>
          </p>
        </div>
      </div>

      {/* Floating Mock UI Widgets */}
      <div className="relative z-10 grid grid-cols-2 gap-4">
        {/* Next Session Widget */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4.5 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Next Session</span>
            <Calendar className="h-4 w-4 text-gold-soft" />
          </div>
          <p className="mt-2 text-sm font-bold truncate">Abhyanga & Swedana</p>
          <p className="text-[11px] text-white/65 mt-0.5">Today at 2:00 PM · Room A</p>
        </div>

        {/* Dosha Progress Widget */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4.5 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Prakriti Dosha</span>
            <Heart className="h-4 w-4 text-red-400" />
          </div>
          <p className="mt-2 text-sm font-bold">Vata-Pitta Profile</p>
          <div className="mt-2.5 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-white/70 w-7 font-semibold">Vata</span>
              <div className="h-1 w-full rounded bg-white/10 overflow-hidden">
                <div className="h-full w-[55%] bg-gold-soft" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-white/70 w-7 font-semibold">Pitta</span>
              <div className="h-1 w-full rounded bg-white/10 overflow-hidden">
                <div className="h-full w-[35%] bg-leaf" />
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badge Bar */}
        <div className="col-span-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-gold-soft" />
            <span className="text-[10px] font-semibold tracking-wide text-white/80">
              HIPAA & GDPR Compliant Health Records
            </span>
          </div>
          <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">SECURE</span>
        </div>
      </div>
    </div>
  );
}
