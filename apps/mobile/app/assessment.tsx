import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Body, Button, Display, ErrorNote, Title } from "../src/components/ui";
import { DoshaMeterGroup } from "../src/components/DoshaMeter";
import { useAuth } from "../src/auth";
import { api } from "../src/api";
import { DOSHA_INFO, DOSHA_QUESTIONS, scoreAssessment, type DoshaScores } from "../src/dosha";
import { colors, fonts } from "../src/theme";

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
      <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Hero Header Banner */}
          <View style={{ position: "relative", overflow: "hidden", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, marginBottom: 16 }}>
            <LinearGradient
              colors={[colors.forestDeep, colors.forest, colors.leaf]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
            />

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
              <View>
                <Text style={{ fontSize: 13, color: colors.goldSoft, fontFamily: fonts.bodySemi }}>
                  Ayurvedic Prakriti 🌿
                </Text>
                <Text style={{ fontSize: 26, fontFamily: fonts.display, color: colors.white, marginTop: 2 }}>
                  Energy <Text style={{ color: colors.goldSoft }}>quiz</Text>
                </Text>
              </View>
              <View style={{ height: 44, width: 44, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}>
                <Ionicons name="sparkles-outline" size={22} color={colors.goldSoft} />
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 20, gap: 16 }}>
            <View style={{ borderRadius: 20, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface, padding: 20, gap: 12 }}>
              <Display style={{ fontSize: 22, color: colors.forest }}>Discover your constitution</Display>
              <Body secondary style={{ fontSize: 15, lineHeight: 22, color: colors.inkSecondary }}>
                In Ayurveda, your prakriti is your innate balance of three doshas — Vata (air & ether),
                Pitta (fire & water) and Kapha (earth & water). Twelve gentle questions reveal yours, and
                everything on AyurPass is personalised from it.
              </Body>
              <Body muted style={{ fontSize: 13, color: colors.inkMuted }}>
                Answer instinctively — how you've been for most of your life, not just this week.
              </Body>
            </View>

            <View style={{ gap: 12, marginTop: 8 }}>
              <Button title="Begin the assessment" onPress={() => setStage("quiz")} style={{ backgroundColor: colors.forest, borderRadius: 999 }} />
              <Button title="Skip for now" variant="ghost" onPress={() => router.replace("/(tabs)")} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (stage === "quiz") {
    const q = DOSHA_QUESTIONS[step];
    const progress = ((step + 1) / DOSHA_QUESTIONS.length) * 100;
    return (
      <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Hero Header Banner */}
          <View style={{ position: "relative", overflow: "hidden", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, marginBottom: 16 }}>
            <LinearGradient
              colors={[colors.forestDeep, colors.forest, colors.leaf]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
            />

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
              <View>
                <Text style={{ fontSize: 13, color: colors.goldSoft, fontFamily: fonts.bodySemi }}>
                  Question {step + 1} of {DOSHA_QUESTIONS.length}
                </Text>
                <Text style={{ fontSize: 24, fontFamily: fonts.display, color: colors.white, marginTop: 2 }}>
                  Prakriti <Text style={{ color: colors.goldSoft }}>quiz</Text>
                </Text>
              </View>
              <Text style={{ fontSize: 16, fontFamily: fonts.bodySemi, color: colors.goldSoft }}>{Math.round(progress)}%</Text>
            </View>
          </View>

          <View style={{ paddingHorizontal: 20, gap: 16 }}>
            {/* Progress track */}
            <View style={{ height: 6, borderRadius: 999, backgroundColor: colors.clay, overflow: "hidden" }}>
              <View style={{ height: 6, borderRadius: 999, backgroundColor: colors.gold, width: `${progress}%` }} />
            </View>

            <View style={{ borderRadius: 20, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface, padding: 20, marginTop: 8 }}>
              <Title style={{ fontSize: 20, lineHeight: 28, color: colors.forest }}>{q.prompt}</Title>

              <View style={{ marginTop: 20, gap: 12 }}>
                {q.options.map((opt, i) => (
                  <Pressable
                    key={i}
                    onPress={() => pick(i)}
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.hairline,
                      borderRadius: 16,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                    }}
                  >
                    <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.foreground, lineHeight: 21 }}>{opt.label}</Text>
                  </Pressable>
                ))}
              </View>

              {step > 0 ? (
                <Pressable onPress={() => setStep(step - 1)} style={{ marginTop: 20 }}>
                  <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.leaf }}>← Previous question</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const info = result ? DOSHA_INFO[result.primary] : null;
  return (
    <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Hero Header Banner */}
        <View style={{ position: "relative", overflow: "hidden", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, marginBottom: 16 }}>
          <LinearGradient
            colors={[colors.forestDeep, colors.forest, colors.leaf]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
          />

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
            <View>
              <Text style={{ fontSize: 13, color: colors.goldSoft, fontFamily: fonts.bodySemi }}>
                Your Constitution ✨
              </Text>
              <Text style={{ fontSize: 26, fontFamily: fonts.display, color: colors.white, marginTop: 2 }}>
                {info?.name} <Text style={{ color: colors.goldSoft }}>({info?.element})</Text>
              </Text>
            </View>
            <View style={{ height: 44, width: 44, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}>
              <Ionicons name="sparkles" size={22} color={colors.goldSoft} />
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 16 }}>
          <Body secondary style={{ fontSize: 15, lineHeight: 22, color: colors.inkSecondary }}>
            {info?.qualities}
          </Body>

          <View style={{ borderRadius: 20, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface, padding: 18, gap: 12 }}>
            {result ? <DoshaMeterGroup {...result} primary={result.primary} /> : null}
            <View style={{ borderTopWidth: 1, borderTopColor: colors.hairline, paddingTop: 14, marginTop: 6 }}>
              <Body secondary>
                <Text style={{ fontFamily: fonts.bodySemi, color: colors.foreground }}>Balanced by: </Text>
                {info?.balancedBy}
              </Body>
            </View>
          </View>

          {saving ? <Body muted style={{ marginTop: 10 }}>Saving your profile…</Body> : null}
          <ErrorNote message={error} />

          <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
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
            <Button title="Explore wellness" style={{ flex: 1, backgroundColor: colors.forest, borderRadius: 999 }} onPress={() => router.replace("/(tabs)")} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
