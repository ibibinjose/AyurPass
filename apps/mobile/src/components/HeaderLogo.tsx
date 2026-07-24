import { Image, View, Pressable } from "react-native";
import { useRouter } from "expo-router";

export function HeaderLogo({ size = 38 }: { size?: number }) {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push("/")} accessibilityRole="button">
      <View
        style={{ width: size, height: size }}
        className="overflow-hidden rounded-xl border border-hairline bg-surface items-center justify-center"
      >
        <Image
          source={require("../../assets/icon.png")}
          style={{ width: size - 4, height: size - 4 }}
          className="rounded-lg"
          resizeMode="contain"
          accessibilityLabel="AyurPass"
        />
      </View>
    </Pressable>
  );
}
