"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  DOSHA_INFO,
  DOSHA_QUESTIONS,
  scoreAssessment,
  type DoshaScores,
} from "@/lib/dosha";
import { DoshaMeterGroup } from "@/components/DoshaMeter";
import { Button, EmptyState, ErrorNote } from "@/components/ui";

type Stage = "intro" | "quiz" | "result";

export default function AssessmentPage() {
  const { user } = useAuth();
  const [stage, setStage] = useState<Stage>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<DoshaScores | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExisting, setHasExisting] = useState(false);

  const isConsumer = user?.role === "CONSUMER";

  useEffect(() => {
    if (!user || !isConsumer) return;
    api
      .healthProfile(user.id)
      .then((p) => setHasExisting(Boolean(p)))
      .catch(() => {});
  }, [user, isConsumer]);

  if (!isConsumer) {
    return (
      <EmptyState
        title="Assessment is for wellness seekers"
        body="The Prakriti assessment maps a client's constitution. Provider accounts don't have a dosha profile."
      />
    );
  }

  async function finish(finalAnswers: Record<string, number>) {
    if (!user) return;
    const scores = scoreAssessment(finalAnswers);
    setResult(scores);
    setStage("result");
    setSaving(true);
    setError(null);
    try {
      await api.saveHealthProfile(user.id, {
        consumerId: user.id,
        vataScore: scores.vata,
        pittaScore: scores.pitta,
        kaphaScore: scores.kapha,
        questionnaireResponses: finalAnswers,
        lastAssessment: new Date().toISOString(),
      });
    } catch {
      setError("Your result couldn't be saved — it will still show below, but please retake later.");
    } finally {
      setSaving(false);
    }
  }

  function pick(optionIndex: number) {
    const q = DOSHA_QUESTIONS[step];
    const next = { ...answers, [q.id]: optionIndex };
    setAnswers(next);
    if (step + 1 < DOSHA_QUESTIONS.length) {
      setStep(step + 1);
    } else {
      void finish(next);
    }
  }

  if (stage === "intro") {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="font-display text-3xl text-forest">Prakriti assessment</h1>
        <p className="mt-3 leading-relaxed text-ink-secondary">
          In Ayurveda, your <em>prakriti</em> is your innate constitution — a unique balance of
          three doshas: <strong>Vata</strong> (air & ether), <strong>Pitta</strong> (fire & water)
          and <strong>Kapha</strong> (earth & water). Twelve gentle questions reveal yours, and
          everything on AyurPass is personalised from it.
        </p>
        <p className="mt-3 text-sm text-ink-muted">
          Answer instinctively — how you&apos;ve been for most of your life, not just this week.
        </p>
        <Button className="mt-7" onClick={() => setStage("quiz")}>
          {hasExisting ? "Retake the assessment" : "Begin the assessment"}
        </Button>
      </div>
    );
  }

  if (stage === "quiz") {
    const q = DOSHA_QUESTIONS[step];
    return (
      <div className="mx-auto max-w-xl">
        <div className="mb-6">
          <div className="flex items-baseline justify-between text-sm text-ink-muted">
            <span>
              Question {step + 1} of {DOSHA_QUESTIONS.length}
            </span>
            <span className="tabular-nums">
              {Math.round((step / DOSHA_QUESTIONS.length) * 100)}%
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-clay">
            <div
              className="h-full rounded-full bg-gold transition-all"
              style={{ width: `${(step / DOSHA_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        <h1 className="font-display text-2xl leading-snug text-forest">{q.prompt}</h1>
        <div className="mt-6 space-y-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => pick(i)}
              className="w-full rounded-2xl border border-hairline bg-surface px-5 py-4 text-left text-sm leading-relaxed text-foreground transition-colors hover:border-leaf hover:bg-clay/40"
            >
              {opt.label}
            </button>
          ))}
        </div>
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-6 text-sm text-ink-muted hover:text-forest"
          >
            ← Previous question
          </button>
        )}
      </div>
    );
  }

  // result
  const info = result ? DOSHA_INFO[result.primary] : null;
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Your constitution
        </p>
        <h1 className="mt-2 font-display text-4xl text-forest">
          {info?.name} <span className="text-ink-muted text-2xl">· {info?.element}</span>
        </h1>
        <p className="mt-3 leading-relaxed text-ink-secondary">{info?.qualities}</p>
      </div>

      <div className="rounded-2xl border border-hairline bg-surface p-6">
        {result && <DoshaMeterGroup {...result} primary={result.primary} />}
        <p className="mt-5 border-t border-hairline pt-4 text-sm leading-relaxed text-ink-secondary">
          <strong className="text-foreground">Balanced by:</strong> {info?.balancedBy}
        </p>
      </div>

      {saving && <p className="text-sm text-ink-muted">Saving your profile…</p>}
      <ErrorNote message={error} />

      <div className="flex gap-3">
        <Button
          variant="ghost"
          onClick={() => {
            setAnswers({});
            setStep(0);
            setStage("quiz");
          }}
        >
          Retake
        </Button>
        <Button onClick={() => (window.location.href = "/packages")}>
          Explore packages for your dosha
        </Button>
      </div>
    </div>
  );
}
