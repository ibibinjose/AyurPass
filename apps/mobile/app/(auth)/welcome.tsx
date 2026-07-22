import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/ui";
import { colors } from "../../src/theme";

const PILLARS: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: "leaf-outline", label: "Ayurveda" },
  { icon: "flower-outline", label: "Yoga" },
  { icon: "moon-outline", label: "Meditation" },
  { icon: "flame-outline", label: "Spa" },
];

export default function Welcome() {
  const router = useRouter();
  return (
    <LinearGradient colors={[colors.forestDeep, colors.forest, colors.leaf]} className="flex-1">
      <SafeAreaView className="flex-1 justify-between p-6">
        <View className="mt-6">
          <Image
            source={require("../../assets/icon.png")}
            className="mb-3 h-[72px] w-[72px] rounded-2xl"
            accessibilityLabel="AyurPass"
          />
          <Text className="font-display text-[26px] text-white">AyurPass</Text>
          <Text className="mt-1.5 font-body-semi text-sm leading-5 text-white/70">
            Find & book Ayurveda, Yoga & Wellness
          </Text>
        </View>

        <View>
          <Text className="font-display text-[40px] leading-[44px] text-white">
            Wellness, tuned to your <Text className="text-gold-soft">constitution</Text>.
          </Text>
          <Text className="mt-4 font-body text-base leading-6 text-white/80">
            Verified Ayurveda, Yoga & Wellness — find & book practices personalised to your dosha.
          </Text>

          <View className="mt-6 flex-row flex-wrap gap-2.5">
            {PILLARS.map((p) => (
              <View
                key={p.label}
                className="flex-row items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5"
              >
                <Ionicons name={p.icon} size={18} color={colors.goldSoft} />
                <Text className="font-body-medium text-[13px] text-white/90">{p.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="gap-3">
          <Button
            title="Create your account"
            variant="gold"
            onPress={() => router.push("/(auth)/register")}
          />
          <Pressable
            onPress={() => router.push("/(auth)/login")}
            accessibilityRole="button"
            className="min-h-tap items-center justify-center rounded-full border border-white/25 px-[22px] py-3.5 active:opacity-90"
          >
            <Text className="font-body-semi text-base text-white">I already have an account</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
