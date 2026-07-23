import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "../../src/theme";

const PILLARS: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: "leaf-outline", label: "Ayurveda" },
  { icon: "flower-outline", label: "Yoga" },
  { icon: "moon-outline", label: "Meditation" },
  { icon: "flame-outline", label: "Spa" },
];

/**
 * Welcome must use StyleSheet for critical layout.
 * NativeWind className on LinearGradient often does not apply flex:1 in release
 * builds → empty gradient + light stack background = white screen + white logo.
 */
export default function Welcome() {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.forestDeep, colors.forest, colors.leaf]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logo}
              accessibilityLabel="AyurPass"
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brand}>AyurPass</Text>
          <Text style={styles.tagline}>Find & book Ayurveda, Yoga & Wellness</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.headline}>
            Wellness, tuned to your{" "}
            <Text style={styles.headlineAccent}>constitution</Text>.
          </Text>
          <Text style={styles.body}>
            Find clinics, studios and spas that fit how you feel — free to browse. Optional
            quiz personalises matches when you want it.
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

        <View style={styles.actions}>
          <Pressable
            onPress={() => router.push("/(auth)/register")}
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            accessibilityRole="button"
          >
            <Text style={styles.primaryBtnText}>Create your account</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/(auth)/login")}
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryBtnText}>I already have an account</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.forestDeep,
  },
  safe: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  header: {
    marginTop: 12,
  },
  logoWrap: {
    width: 76,
    height: 76,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.white,
  },
  tagline: {
    marginTop: 6,
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.72)",
  },
  hero: {
    flexShrink: 1,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 42,
    color: colors.white,
  },
  headlineAccent: {
    color: colors.goldSoft,
  },
  body: {
    marginTop: 16,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(255,255,255,0.82)",
  },
  pillars: {
    marginTop: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pillar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pillarText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: "rgba(255,255,255,0.92)",
  },
  actions: {
    gap: 12,
    marginBottom: 8,
  },
  primaryBtn: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.gold,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  primaryBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.forestDeep,
  },
  secondaryBtn: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  secondaryBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.white,
  },
  pressed: {
    opacity: 0.88,
  },
});
