"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

function buildWelcome(fullName: string | null | undefined, data: MemoryProfile): string {
  const name = fullName || "friend";
  const hasDosha = data.semantic.primaryDosha && data.semantic.primaryDosha !== "Not assessed yet";
  const hasEpisodes = data.episodes.length > 0;

  if (hasDosha && hasEpisodes) {
    return `Namaste ${name}. I am your AyurPass Care Concierge. I can see your ${data.semantic.primaryDosha} profile and ${data.episodes.length} past treatment${data.episodes.length === 1 ? "" : "s"} on file. How may I support your wellness today?`;
  }
  if (hasDosha) {
    return `Namaste ${name}. I am your AyurPass Care Concierge. I can see your ${data.semantic.primaryDosha} profile on file. You do not have completed treatments yet — I can still help with general Ayurvedic guidance and booking questions. How may I help?`;
  }
  if (hasEpisodes) {
    return `Namaste ${name}. I am your AyurPass Care Concierge. I can see ${data.episodes.length} past treatment${data.episodes.length === 1 ? "" : "s"} on file. A dosha assessment is not recorded yet. How may I support your wellness today?`;
  }
  return `Namaste ${name}. I am your AyurPass Care Concierge. I do not yet have a dosha assessment or treatment history on file for you, but I can still help with general Ayurvedic guidance and booking questions. How may I help?`;
}

export function ConciergeClient() {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memoryProfile, setMemoryProfile] = useState<MemoryProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const loadMemoryProfile = useCallback(() => {
    if (!user) return;
    let cancelled = false;
    setLoadingProfile(true);
    setProfileError(null);

    api
      .getAiMemoryProfile()
      .then((data) => {
        if (cancelled) return;
        setMemoryProfile(data);
        setLoadingProfile(false);
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: buildWelcome(user.fullName, data),
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
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadingProfile(false);
        setMemoryProfile(null);
        setMessages([]);
        setProfileError(
          err instanceof Error ? err.message : "Could not load your care memory profile.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setMemoryProfile(null);
      setMessages([]);
      setLoadingProfile(false);
      setProfileError(null);
      return;
    }
    return loadMemoryProfile();
  }, [user, authLoading, loadMemoryProfile]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading || !user) return;

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
      setError(err instanceof Error ? err.message : "Could not reach the Care Concierge.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 text-center text-sm text-ink-muted animate-pulse">
        Checking your session…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-hairline bg-surface p-8 sm:p-10 text-center shadow-xs space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-forest text-white">
            <SparkleIcon className="h-6 w-6 text-gold-soft" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Sign in for Care Concierge
          </h1>
          <p className="text-sm text-ink-secondary leading-relaxed max-w-md mx-auto">
            The memory-backed Care Concierge uses your profile and booking history when you are
            signed in. Guests do not get invented clinical history — please sign in to continue.
          </p>
          <Link
            href="/login?next=/dashboard/concierge"
            className="inline-flex items-center gap-2 rounded-2xl bg-forest px-5 py-3 text-sm font-bold text-white shadow-xs hover:bg-forest-deep"
          >
            Sign in <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-forest p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="rounded-full bg-white/15 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-gold-soft border border-white/20">
              Care assistant
            </span>
            <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-[11px] font-bold text-gold-soft">
              Uses your profile &amp; booking history when signed in
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
            AyurPass AI Care &amp; Booking Concierge
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-white/80 leading-relaxed max-w-2xl">
            Your Care Concierge can reference your profile, dosha assessment (when recorded), and
            past bookings to offer practical Ayurvedic guidance and scheduling help. It is not a
            medical diagnosis tool.
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
                  Care Concierge
                </h3>
                <p className="text-[11px] text-ink-muted">
                  Grounded in your profile &amp; bookings when available
                </p>
              </div>
            </div>
            <span className="rounded-full bg-forest/10 px-2.5 py-1 text-[10px] font-bold text-forest border border-forest/15">
              {profileError ? "● Profile unavailable" : loadingProfile ? "● Loading…" : "● Signed in"}
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[520px]">
            {profileError && (
              <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 space-y-3">
                <p className="text-sm font-semibold text-red-800">Could not load care memory</p>
                <p className="text-xs text-red-700/90">{profileError}</p>
                <button
                  type="button"
                  onClick={() => loadMemoryProfile()}
                  className="rounded-xl bg-forest px-3 py-1.5 text-xs font-bold text-white hover:bg-forest-deep"
                >
                  Retry
                </button>
              </div>
            )}

            {loadingProfile && messages.length === 0 && !profileError && (
              <div className="p-4 text-center text-xs text-ink-muted animate-pulse">
                Loading your care context…
              </div>
            )}

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
                  {m.memorySnapshot &&
                    m.memorySnapshot.dosha &&
                    m.memorySnapshot.dosha !== "Not assessed yet" && (
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
                <span>Thinking with your care context…</span>
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
                  disabled={loading || !!profileError || loadingProfile}
                  className="rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs text-ink-secondary hover:border-forest hover:text-forest transition-colors shadow-2xs shrink-0 disabled:opacity-50"
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
                disabled={loading || !!profileError || loadingProfile}
                className="flex-1 rounded-2xl border border-hairline bg-surface px-4 py-3 text-xs sm:text-sm text-foreground placeholder:text-ink-muted focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim() || !!profileError || loadingProfile}
                className="rounded-2xl bg-forest px-5 py-3 text-xs font-bold text-white shadow-xs hover:bg-forest-deep disabled:opacity-50 transition-colors shrink-0"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Care context inspector */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-hairline bg-surface p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h2 className="font-display text-base font-bold text-forest flex items-center gap-2">
                <ShieldIcon className="h-4 w-4 text-forest" />
                Care context
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                From your account
              </span>
            </div>

            {loadingProfile ? (
              <div className="p-4 text-center text-xs text-ink-muted animate-pulse">
                Loading care profile…
              </div>
            ) : profileError ? (
              <div className="space-y-3">
                <p className="text-xs text-ink-secondary">
                  Care context could not be loaded. Retry to refresh your profile and booking history.
                </p>
                <button
                  type="button"
                  onClick={() => loadMemoryProfile()}
                  className="rounded-xl border border-hairline px-3 py-1.5 text-xs font-bold text-forest hover:border-forest"
                >
                  Retry
                </button>
              </div>
            ) : memoryProfile ? (
              <>
                <div className="rounded-2xl border border-hairline bg-surface-raised/40 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                      <span>🌿</span> Profile
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-ink-secondary">
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Client:</span>
                      <span className="font-semibold text-foreground">
                        {memoryProfile.semantic.fullName || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Constitution:</span>
                      <span className="font-bold text-forest-deep bg-gold/15 px-2 py-0.5 rounded">
                        {memoryProfile.semantic.primaryDosha}
                      </span>
                    </div>
                    {memoryProfile.semantic.currentImbalances.length > 0 && (
                      <div>
                        <span className="text-ink-muted block mb-1">Health focus:</span>
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
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-hairline bg-surface-raised/40 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                      <span>📜</span> Past treatments
                    </span>
                    <span className="rounded-full bg-clay px-2 py-0.5 text-[10px] font-bold text-forest">
                      {memoryProfile.episodes.length}
                    </span>
                  </div>
                  {memoryProfile.episodes.length === 0 ? (
                    <p className="text-xs text-ink-muted">
                      No completed treatments on file yet.
                    </p>
                  ) : (
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
                  )}
                </div>

                <div className="rounded-2xl border border-hairline bg-surface-raised/40 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                      <span>🛡️</span> Safety notes
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-ink-secondary list-disc list-inside">
                    <li>Not an emergency medical service — call 000/911 if needed</li>
                    <li>24h cancellation notice where clinic policy applies</li>
                    <li>Guidance only uses facts on your account</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-hairline bg-surface-raised/40 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                      <span>⏰</span> Upcoming
                    </span>
                    <span className="rounded-full bg-leaf/20 text-forest px-2 py-0.5 text-[10px] font-bold">
                      {memoryProfile.upcomingAppointments.length}
                    </span>
                  </div>
                  {memoryProfile.upcomingAppointments.length === 0 ? (
                    <p className="text-xs text-ink-muted">No upcoming sessions booked.</p>
                  ) : (
                    <ul className="space-y-1.5 text-xs text-ink-secondary">
                      {memoryProfile.upcomingAppointments.map((u) => (
                        <li key={u.id}>
                          <strong className="text-foreground">{u.serviceName}</strong>
                          <span className="text-ink-muted">
                            {" "}
                            · {new Date(u.startTime).toLocaleString()}
                            {u.isVirtual ? " · Virtual" : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            ) : null}
          </div>

          <div className="rounded-2xl border border-hairline bg-clay/30 p-5 space-y-3">
            <h4 className="font-display font-bold text-forest text-sm">
              Ready to schedule a session?
            </h4>
            <p className="text-xs text-ink-secondary">
              Browse treatments and workshops across AyurPass centers.
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
