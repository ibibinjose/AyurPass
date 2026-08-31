"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  SparkleIcon,
  ShieldIcon,
  ArrowRightIcon,
} from "@/components/icons";
import { ErrorNote } from "@/components/ui";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  memorySnapshot?: {
    dosha: string;
    clientName: string | null;
    episodesCount: number;
    upcomingCount: number;
    guardrailsCount: number;
  };
}

interface MemoryProfile {
  semantic: {
    fullName: string | null;
    email: string | null;
    primaryDosha: string;
    currentImbalances: string[];
    dietaryPreferences?: string;
    sensitivitiesAllergies: string[];
    lastAssessmentDate?: string;
  };
  episodes: {
    id: string;
    serviceName: string;
    serviceCategory: string;
    date: string;
    providerName: string;
    practitionerName?: string;
    clinicalNotes?: string;
  }[];
  upcomingAppointments: {
    id: string;
    serviceName: string;
    startTime: string;
    isVirtual: boolean;
    videoUrl?: string;
  }[];
  proceduralGuardrails: string[];
}

const SAMPLE_QUESTIONS = [
  "What treatment should I book next for my physical stiffness?",
  "What foods or herbal teas support my Agni after detox?",
  "Can I reschedule my appointment for tomorrow?",
  "How does my Pitta constitution affect my sleep?",
];

export function ConciergeClient() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memoryProfile, setMemoryProfile] = useState<MemoryProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    api
      .getAiMemoryProfile()
      .then((data) => {
        if (cancelled) return;
        setMemoryProfile(data);
        setLoadingProfile(false);

        // Preload initial welcoming message
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: `Namaste ${user.fullName || "friend"}. I am your AyurPass AI Care Concierge. I have loaded your ${data.semantic.primaryDosha} constitution and your past clinical treatments into my active working memory. How may I support your wellness balance today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            memorySnapshot: {
              dosha: data.semantic.primaryDosha,
              clientName: data.semantic.fullName,
              episodesCount: data.episodes.length,
              upcomingCount: data.upcomingAppointments.length,
              guardrailsCount: data.proceduralGuardrails.length,
            },
          },
        ]);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadingProfile(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);
    setError(null);

    const historyForApi = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    try {
      const res = await api.aiConcierge(query.trim(), historyForApi);
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        memorySnapshot: res.memorySnapshot,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reach the AI Concierge.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-forest p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="rounded-full bg-white/15 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-gold-soft border border-white/20">
              Cognitive Agent Memory
            </span>
            <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-[11px] font-bold text-gold-soft">
              7 Memory Layers Active
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
            AyurPass AI Care &amp; Booking Concierge
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-white/80 leading-relaxed max-w-2xl">
            Unlike generic chatbots with blank-slate amnesia, your AyurPass Concierge uses structured <strong>Semantic Facts</strong>, <strong>Episodic Clinical Treatment Summaries</strong>, and <strong>Procedural Safety Guardrails</strong> to guide your Ayurvedic care safely.
          </p>
        </div>
      </div>

      {/* Main 2-Column Interface */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Left Column: Chat Stream */}
        <div className="flex flex-col rounded-3xl border border-hairline bg-surface shadow-xs min-h-[640px] overflow-hidden">
          {/* Chat Header */}
          <div className="border-b border-hairline px-6 py-4 flex items-center justify-between bg-surface-raised/40">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest text-white">
                <SparkleIcon className="h-5 w-5 text-gold-soft" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground text-sm">
                  Integrative Care Assistant
                </h3>
                <p className="text-[11px] text-ink-muted">
                  Grounding recommendations in your Dosha &amp; clinic history
                </p>
              </div>
            </div>
            <span className="rounded-full bg-forest/10 px-2.5 py-1 text-[10px] font-bold text-forest border border-forest/15">
              ● Active Session
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[520px]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed sm:text-sm ${
                    m.role === "user"
                      ? "bg-forest text-white shadow-xs rounded-br-xs"
                      : "bg-clay/50 text-foreground border border-hairline rounded-bl-xs"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.content}</p>
                </div>

                <div className="mt-1 flex items-center gap-2 px-1 text-[10px] text-ink-muted">
                  <span>{m.timestamp}</span>
                  {m.memorySnapshot && (
                    <span className="rounded-full bg-forest/10 px-1.5 py-0.2 text-[9px] font-bold text-forest">
                      🌿 {m.memorySnapshot.dosha}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-ink-muted p-3 bg-clay/30 rounded-2xl max-w-xs border border-hairline animate-pulse">
                <SparkleIcon className="h-4 w-4 text-gold-dark animate-spin" />
                <span>Consulting Ayurvedic memory layers…</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Prompts */}
          <div className="border-t border-hairline/60 bg-surface-raised/20 p-3 overflow-x-auto scrollbar-none">
            <div className="flex gap-2 text-[11px] whitespace-nowrap">
              {SAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void handleSend(q)}
                  disabled={loading}
                  className="rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs text-ink-secondary hover:border-forest hover:text-forest transition-colors shadow-2xs shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="border-t border-hairline p-4 bg-surface">
            <ErrorNote message={error} />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend();
              }}
              className="flex items-center gap-2 mt-1"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about therapies, post-care diet, or schedule changes…"
                disabled={loading}
                className="flex-1 rounded-2xl border border-hairline bg-surface px-4 py-3 text-xs sm:text-sm text-foreground placeholder:text-ink-muted focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded-2xl bg-forest px-5 py-3 text-xs font-bold text-white shadow-xs hover:bg-forest-deep disabled:opacity-50 transition-colors shrink-0"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Transparent Agent Memory Inspector */}
        <div className="space-y-6">
          {/* Memory Inspector Card */}
          <div className="rounded-3xl border border-hairline bg-surface p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h2 className="font-display text-base font-bold text-forest flex items-center gap-2">
                <ShieldIcon className="h-4 w-4 text-forest" />
                Active Memory Inspector
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Zero Hallucination
              </span>
            </div>

            {loadingProfile ? (
              <div className="p-4 text-center text-xs text-ink-muted animate-pulse">
                Loading client memory profile…
              </div>
            ) : memoryProfile ? (
              <>
                {/* 1. Semantic Memory (Postgres Facts) */}
                <div className="rounded-2xl border border-hairline bg-surface-raised/40 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                      <span>🌿</span> 1. Semantic Memory
                    </span>
                    <span className="rounded-full bg-forest px-2 py-0.5 text-[10px] font-bold text-white">
                      PostgreSQL
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-ink-secondary">
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Client:</span>
                      <span className="font-semibold text-foreground">
                        {memoryProfile.semantic.fullName || "Valued Client"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Constitution:</span>
                      <span className="font-bold text-forest-deep bg-gold/15 px-2 py-0.5 rounded">
                        {memoryProfile.semantic.primaryDosha}
                      </span>
                    </div>
                    <div>
                      <span className="text-ink-muted block mb-1">Health Focus / Agni:</span>
                      <div className="flex flex-wrap gap-1">
                        {memoryProfile.semantic.currentImbalances.map((imb) => (
                          <span
                            key={imb}
                            className="rounded-md bg-clay px-2 py-0.5 text-[10px] font-semibold text-forest"
                          >
                            {imb}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Episodic Memory (Past Completed Sessions) */}
                <div className="rounded-2xl border border-hairline bg-surface-raised/40 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                      <span>📜</span> 2. Episodic Memory
                    </span>
                    <span className="rounded-full bg-clay px-2 py-0.5 text-[10px] font-bold text-forest">
                      {memoryProfile.episodes.length} Episodes
                    </span>
                  </div>
                  <div className="space-y-2 divide-y divide-hairline text-xs">
                    {memoryProfile.episodes.map((ep) => (
                      <div key={ep.id} className="pt-2 first:pt-0">
                        <p className="font-semibold text-foreground">{ep.serviceName}</p>
                        <p className="text-[10px] text-ink-muted">
                          {ep.date} · {ep.providerName}
                        </p>
                        {ep.clinicalNotes && (
                          <p className="mt-1 text-[11px] text-ink-secondary italic bg-surface p-1.5 rounded border border-hairline/60">
                            &ldquo;{ep.clinicalNotes}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Procedural Memory (Guardrails) */}
                <div className="rounded-2xl border border-hairline bg-surface-raised/40 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                      <span>🛡️</span> 3. Procedural Guardrails
                    </span>
                    <span className="rounded-full bg-red-50 text-red-700 px-2 py-0.5 text-[10px] font-bold border border-red-200">
                      Enforced
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-ink-secondary list-disc list-inside">
                    <li>Emergency medical triage boundary (000/911 escalation)</li>
                    <li>24h Cancellation notice cutoff rule</li>
                    <li>Classical Vata/Pitta/Kapha seasonal Ritucharya</li>
                  </ul>
                </div>

                {/* 4. Prospective Memory (Follow-ups) */}
                <div className="rounded-2xl border border-hairline bg-surface-raised/40 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                      <span>⏰</span> 4. Prospective Memory
                    </span>
                    <span className="rounded-full bg-leaf/20 text-forest px-2 py-0.5 text-[10px] font-bold">
                      Scheduled
                    </span>
                  </div>
                  <p className="text-xs text-ink-secondary">
                    Automatic 24h post-treatment recovery check-ins and herbal hydration reminders dispatched via background queue.
                  </p>
                </div>
              </>
            ) : null}
          </div>

          {/* Action Card: Browse Catalog */}
          <div className="rounded-2xl border border-hairline bg-clay/30 p-5 space-y-3">
            <h4 className="font-display font-bold text-forest text-sm">
              Ready to schedule your recommended session?
            </h4>
            <p className="text-xs text-ink-secondary">
              Browse treatments and workshops tailored to your primary dosha and care plan.
            </p>
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:underline"
            >
              Explore Sessions Catalog <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
