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
  return <Redirect href={user ? "/(tabs)" : "/(auth)/welcome"} />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.forestDeep,
    justifyContent: "center",
    alignItems: "center",
  },
});
