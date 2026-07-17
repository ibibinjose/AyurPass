import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/ui";
import { colors, fonts } from "../../src/theme";

const PILLARS: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: "leaf-outline", label: "Ayurveda" },
  { icon: "flower-outline", label: "Yoga" },
  { icon: "moon-outline", label: "Meditation" },
  { icon: "flame-outline", label: "Spa" },
];

export default function Welcome() {
  const router = useRouter();
  return (
    <LinearGradient colors={[colors.forestDeep, colors.forest, colors.leaf]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, justifyContent: "space-between", padding: 24 }}>
        <View style={{ marginTop: 24 }}>
          <Image source={require("../../assets/icon.png")} style={styles.mark} accessibilityLabel="AyurPass" />
          <Text style={styles.brand}>AyurPass</Text>
          <Text style={styles.tagline}>Find & book Ayurveda, Yoga & Wellness</Text>
        </View>

        <View>
          <Text style={styles.headline}>
            Wellness, tuned to your <Text style={{ color: colors.goldSoft }}>constitution</Text>.
          </Text>
          <Text style={styles.sub}>
            Verified Ayurveda, Yoga & Wellness — find & book practices personalised to your
            dosha.
          </Text>

          <View style={styles.pillars}>
            {PILLARS.map((p) => (
              <View key={p.label} style={styles.pillar}>
                <Ionicons name={p.icon} size={18} color={colors.goldSoft} />
                <Text style={styles.pillarText}>{p.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Button title="Create your account" variant="gold" onPress={() => router.push("/(auth)/register")} />
          <Button title="I already have an account" variant="ghost" onPress={() => router.push("/(auth)/login")} />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  mark: {
    height: 72,
    width: 72,
    borderRadius: 16,
    marginBottom: 12,
  },
  brand: { fontFamily: fonts.display, fontSize: 26, color: colors.white },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.72)",
    marginTop: 6,
    fontWeight: "600",
  },
  headline: { fontFamily: fonts.display, fontSize: 40, lineHeight: 44, color: colors.white },
  sub: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(255,255,255,0.78)",
    marginTop: 16,
  },
  pillars: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 24 },
  pillar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pillarText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: "rgba(255,255,255,0.9)" },
});
