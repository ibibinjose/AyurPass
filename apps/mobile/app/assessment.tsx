import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { Body, Button, Display, ErrorNote, Screen, Title } from "../src/components/ui";
import { DoshaMeterGroup } from "../src/components/DoshaMeter";
import { useAuth } from "../src/auth";
import { api } from "../src/api";
import { DOSHA_INFO, DOSHA_QUESTIONS, scoreAssessment, type DoshaScores } from "../src/dosha";
import { colors, fonts, radius } from "../src/theme";

type Stage = "intro" | "quiz" | "result";

export default function Assessment() {
  const { user } = useAuth();
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<DoshaScores | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError("Your result couldn't be saved — it still shows below. You can retake it later.");
    } finally {
      setSaving(false);
    }
  }

  function pick(optionIndex: number) {
    const q = DOSHA_QUESTIONS[step];
    const next = { ...answers, [q.id]: optionIndex };
    setAnswers(next);
    if (step + 1 < DOSHA_QUESTIONS.length) setStep(step + 1);
    else void finish(next);
  }

  if (stage === "intro") {
    return (
      <Screen>
        <View style={{ marginTop: 20 }}>
          <View style={styles.badge}>
            <Ionicons name="sparkles-outline" size={16} color={colors.gold} />
            <Text style={styles.badgeText}>Prakriti assessment</Text>
          </View>
          <Display style={{ marginTop: 16 }}>Discover your constitution</Display>
          <Body secondary style={{ marginTop: 12 }}>
            In Ayurveda, your prakriti is your innate balance of three doshas — Vata (air & ether),
            Pitta (fire & water) and Kapha (earth & water). Twelve gentle questions reveal yours, and
            everything on AyurPass is personalised from it.
          </Body>
          <Body muted style={{ marginTop: 12 }}>
            Answer instinctively — how you&apos;ve been for most of your life, not just this week.
          </Body>
        </View>
        <View style={{ marginTop: 28, gap: 12 }}>
          <Button title="Begin the assessment" onPress={() => setStage("quiz")} />
          <Button title="Skip for now" variant="ghost" onPress={() => router.replace("/(tabs)")} />
        </View>
      </Screen>
    );
  }

  if (stage === "quiz") {
    const q = DOSHA_QUESTIONS[step];
    const progress = (step / DOSHA_QUESTIONS.length) * 100;
    return (
      <Screen>
        <View style={{ marginTop: 12 }}>
          <View style={styles.progressRow}>
            <Body muted>
              Question {step + 1} of {DOSHA_QUESTIONS.length}
            </Body>
            <Body muted>{Math.round(progress)}%</Body>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress}%` }]} />
          </View>

          <Title style={{ marginTop: 24, lineHeight: 30 }}>{q.prompt}</Title>

          <View style={{ marginTop: 20, gap: 12 }}>
            {q.options.map((opt, i) => (
              <Pressable key={i} onPress={() => pick(i)} style={styles.option}>
                <Text style={styles.optionText}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>

          {step > 0 ? (
            <Pressable onPress={() => setStep(step - 1)} style={{ marginTop: 20 }}>
              <Text style={{ fontFamily: fonts.body, color: colors.inkMuted }}>← Previous question</Text>
            </Pressable>
          ) : null}
        </View>
      </Screen>
    );
  }

  const info = result ? DOSHA_INFO[result.primary] : null;
  return (
    <Screen>
      <View style={{ marginTop: 16 }}>
        <Text style={styles.eyebrow}>Your constitution</Text>
        <Display style={{ marginTop: 8 }}>
          {info?.name} <Text style={{ color: colors.inkMuted, fontSize: 22 }}>· {info?.element}</Text>
        </Display>
        <Body secondary style={{ marginTop: 10 }}>
          {info?.qualities}
        </Body>

        <View style={styles.resultCard}>
          {result ? <DoshaMeterGroup {...result} primary={result.primary} /> : null}
          <View style={{ borderTopWidth: 1, borderTopColor: colors.hairline, paddingTop: 14, marginTop: 6 }}>
            <Body secondary>
              <Text style={{ fontFamily: fonts.bodySemi, color: colors.foreground }}>Balanced by: </Text>
              {info?.balancedBy}
            </Body>
          </View>
        </View>

        {saving ? <Body muted style={{ marginTop: 14 }}>Saving your profile…</Body> : null}
        <View style={{ marginTop: 8 }}>
          <ErrorNote message={error} />
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
          <Button
            title="Retake"
            variant="ghost"
            style={{ flex: 1 }}
            onPress={() => {
              setAnswers({});
              setStep(0);
              setStage("quiz");
            }}
          />
          <Button title="Explore wellness" style={{ flex: 1 }} onPress={() => router.replace("/(tabs)")} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(185,137,47,0.12)",
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.gold },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  track: { height: 6, borderRadius: 999, backgroundColor: colors.clay, overflow: "hidden" },
  fill: { height: 6, borderRadius: 999, backgroundColor: colors.gold },
  option: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.lg,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  optionText: { fontFamily: fonts.body, fontSize: 15, color: colors.foreground, lineHeight: 21 },
  eyebrow: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.gold,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.lg,
    padding: 18,
    marginTop: 20,
  },
});
