import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Body, Display } from "../src/components/ui";
import { HeaderLogo } from "../src/components/HeaderLogo";
import { colors } from "../src/theme";

const PILLARS = [
  { title: "Ayurveda", icon: "leaf-outline" as const, desc: "Classical consultations & Panchakarma" },
  { title: "Yoga & Movement", icon: "flower-outline" as const, desc: "Hatha, Vinyasa & Pranayama" },
  { title: "Meditation & Mind", icon: "moon-outline" as const, desc: "Mindfulness & sound bath healing" },
  { title: "Spa & Bodywork", icon: "flame-outline" as const, desc: "Holistic massage & hydrotherapy" },
  { title: "Nutrition & Lifestyle", icon: "nutrition-outline" as const, desc: "Prakriti constitutional diets" },
];

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      {/* Header Bar */}
      <View className="flex-row items-center justify-between border-b border-hairline bg-surface px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-clay active:opacity-80"
        >
          <Ionicons name="arrow-back" size={20} color={colors.forest} />
        </Pressable>
        <Text className="font-display text-lg text-forest">About AyurPass</Text>
        <HeaderLogo size={34} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Card */}
        <View className="items-center rounded-3xl border border-hairline bg-surface p-6 shadow-sm">
          <View className="h-20 w-20 overflow-hidden rounded-2xl border border-hairline bg-surface p-1 shadow-xs items-center justify-center">
            <Image
              source={require("../assets/icon.png")}
              style={{ width: 70, height: 70 }}
              className="rounded-xl"
              resizeMode="contain"
              accessibilityLabel="AyurPass Logo"
            />
          </View>
          <Text className="mt-3 font-display text-2xl text-forest">AyurPass</Text>
          <Text className="font-body-medium text-xs uppercase tracking-widest text-gold">
            Constitutional Wellness Pass
          </Text>
          <Body muted className="mt-2 text-center text-sm leading-5">
            Harmonising ancient wisdom with modern digital wellbeing.
          </Body>
        </View>

        {/* Mission Card */}
        <View className="rounded-2xl border border-hairline bg-surface p-5 gap-2">
          <View className="flex-row items-center gap-2">
            <Ionicons name="compass-outline" size={22} color={colors.leaf} />
            <Text className="font-display text-xl text-forest">Our Mission</Text>
          </View>
          <Text className="font-body text-sm leading-6 text-ink-secondary">
            To empower every individual to discover, understand, and experience authentic holistic
            care tuned to their unique mind-body constitution (Prakriti).
          </Text>
        </View>

        {/* Vision Card */}
        <View className="rounded-2xl border border-hairline bg-surface p-5 gap-2">
          <View className="flex-row items-center gap-2">
            <Ionicons name="sparkles-outline" size={22} color={colors.gold} />
            <Text className="font-display text-xl text-forest">Our Vision</Text>
          </View>
          <Text className="font-body text-sm leading-6 text-ink-secondary">
            To build a global ecosystem where integrative, preventative healthcare is verified,
            transparent, and accessible to everyone everywhere.
          </Text>
        </View>

        {/* Five Pillars */}
        <View className="rounded-2xl border border-hairline bg-surface p-5 gap-3">
          <Text className="font-display text-lg text-forest">Five Pillars of Care</Text>
          {PILLARS.map((p) => (
            <View key={p.title} className="flex-row items-center gap-3 border-b border-hairline/60 pb-3 last:border-b-0 last:pb-0">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-clay">
                <Ionicons name={p.icon} size={18} color={colors.forest} />
              </View>
              <View className="flex-1">
                <Text className="font-body-semi text-sm text-forest">{p.title}</Text>
                <Text className="font-body text-xs text-ink-muted">{p.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <Pressable
          onPress={() => router.push("/(tabs)")}
          className="flex-row items-center justify-center gap-2 rounded-full bg-forest py-4 active:opacity-90 mt-2"
        >
          <Ionicons name="search-outline" size={18} color="#fff" />
          <Text className="font-body-semi text-base text-white">Explore Verified Places</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
