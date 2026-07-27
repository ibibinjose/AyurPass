import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Body } from "../src/components/ui";
import { colors, fonts } from "../src/theme";

const PILLARS = [
  { title: "Ayurveda", icon: "leaf-outline" as const, desc: "Classical consultations & Panchakarma" },
  { title: "Yoga & Movement", icon: "flower-outline" as const, desc: "Hatha, Vinyasa & Pranayama" },
  { title: "Meditation & Mind", icon: "moon-outline" as const, desc: "Mindfulness & sound bath healing" },
  { title: "Spa & Bodywork", icon: "flame-outline" as const, desc: "Holistic massage & hydrotherapy" },
  { title: "Nutrition & Lifestyle", icon: "nutrition-outline" as const, desc: "Prakriti constitutional diets" },
];

const STATS = [
  { label: "Vetted Clinics", value: "100+" },
  { label: "Happy Seekers", value: "10,000+" },
  { label: "Authentic Care", value: "100%" },
];

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header Banner */}
        <View style={{ position: "relative", overflow: "hidden", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28, marginBottom: 16 }}>
          <LinearGradient
            colors={[colors.forestDeep, colors.forest, colors.leaf]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
          />

          <Pressable
            onPress={() => router.back()}
            style={{
              position: "absolute",
              left: 16,
              top: 16,
              zIndex: 20,
              height: 36,
              width: 36,
              borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color={colors.white} />
          </Pressable>

          <View style={{ alignItems: "center", paddingTop: 12 }}>
            <View style={{ height: 76, width: 76, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: colors.surface, padding: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 3 }}>
              <Image
                source={require("../assets/icon.png")}
                style={{ width: 64, height: 64, borderRadius: 16 }}
                resizeMode="contain"
                accessibilityLabel="AyurPass Logo"
              />
            </View>
            <Text style={{ marginTop: 12, fontFamily: fonts.display, fontSize: 28, color: colors.white }}>AyurPass</Text>
            <Text style={{ fontFamily: fonts.bodySemi, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: colors.goldSoft, marginTop: 2 }}>
              Constitutional Wellness Pass
            </Text>
            <Body style={{ marginTop: 8, textAlign: "center", fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.88)", paddingHorizontal: 20 }}>
              Harmonising ancient wisdom with modern digital wellbeing.
            </Body>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 14 }}>
          {/* Key Stats Row */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            {STATS.map((s) => (
              <View
                key={s.label}
                style={{
                  flex: 1,
                  alignItems: "center",
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: colors.hairline,
                  backgroundColor: colors.surface,
                  paddingVertical: 14,
                  paddingHorizontal: 6,
                }}
              >
                <Text style={{ fontFamily: fonts.display, fontSize: 20, color: colors.forest }}>{s.value}</Text>
                <Text style={{ marginTop: 2, fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.inkMuted, textAlign: "center" }}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Mission Card */}
          <View style={{ borderRadius: 20, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface, padding: 18, gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="compass-outline" size={22} color={colors.leaf} />
              <Text style={{ fontFamily: fonts.display, fontSize: 20, color: colors.forest }}>Our Mission</Text>
            </View>
            <Text style={{ fontFamily: fonts.body, fontSize: 14, lineHeight: 22, color: colors.inkSecondary }}>
              To empower every individual to discover, understand, and experience authentic holistic
              care tuned to their unique mind-body constitution (Prakriti).
            </Text>
          </View>

          {/* Vision Card */}
          <View style={{ borderRadius: 20, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface, padding: 18, gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="sparkles-outline" size={22} color={colors.gold} />
              <Text style={{ fontFamily: fonts.display, fontSize: 20, color: colors.forest }}>Our Vision</Text>
            </View>
            <Text style={{ fontFamily: fonts.body, fontSize: 14, lineHeight: 22, color: colors.inkSecondary }}>
              To build a global ecosystem where integrative, preventative healthcare is verified,
              transparent, and accessible to everyone everywhere.
            </Text>
          </View>

          {/* Five Pillars */}
          <View style={{ borderRadius: 20, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface, padding: 18, gap: 12 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 18, color: colors.forest }}>Five Pillars of Care</Text>
            {PILLARS.map((p) => (
              <View key={p.title} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.hairline }}>
                <View style={{ height: 36, width: 36, alignItems: "center", justifyContent: "center", borderRadius: 999, backgroundColor: colors.clay }}>
                  <Ionicons name={p.icon} size={18} color={colors.forest} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.forest }}>{p.title}</Text>
                  <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.inkMuted }}>{p.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Dual Action CTAs */}
          <View style={{ gap: 10, marginTop: 4 }}>
            <Pressable
              onPress={() => router.push("/assessment")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderRadius: 999,
                backgroundColor: colors.forest,
                paddingVertical: 14,
              }}
            >
              <Ionicons name="sparkles" size={18} color="#fff" />
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 16, color: colors.white }}>Take Free Energy Quiz</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/(tabs)")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: colors.hairline,
                backgroundColor: colors.surface,
                paddingVertical: 14,
              }}
            >
              <Ionicons name="search-outline" size={18} color={colors.forest} />
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 16, color: colors.forest }}>Explore Verified Clinics</Text>
            </Pressable>
          </View>

          {/* App Info & Links */}
          <View style={{ alignItems: "center", marginTop: 12, gap: 4 }}>
            <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.inkMuted }}>
              AyurPass App v1.2.0 · Built with ♥ for Holistic Health
            </Text>
            <Pressable onPress={() => void Linking.openURL("https://ayurpass.com")}>
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 12, color: colors.leaf, textDecorationLine: "underline" }}>
                visit ayurpass.com
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
