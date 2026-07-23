import { Stack } from "expo-router";
import { colors } from "../../src/theme";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Dark base so a failed gradient never flashes white
        contentStyle: { backgroundColor: colors.forestDeep, flex: 1 },
        animation: "fade",
      }}
    />
  );
}
