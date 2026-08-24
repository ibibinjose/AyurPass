import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../src/auth";
import { colors } from "../src/theme";

export default function Index() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.goldSoft} size="large" />
      </View>
    );
  }
  // Let guests explore first; booking and account-bound actions ask for sign-in only when needed.
  return <Redirect href={user ? "/(tabs)" : "/(tabs)/explore"} />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.forestDeep,
    justifyContent: "center",
    alignItems: "center",
  },
});
