import { Image, View } from "react-native";

export function HeaderLogo({ size = 38 }: { size?: number }) {
  return (
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
  );
}
