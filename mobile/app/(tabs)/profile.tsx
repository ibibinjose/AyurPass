import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Alert, Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Body, Card, Display, Title } from "../../src/components/ui";
import { DoshaMeterGroup } from "../../src/components/DoshaMeter";
import { useAuth } from "../../src/auth";
import { api } from "../../src/api";
import type { Dosha } from "../../src/dosha";
import type { HealthProfile, LoyaltySummary } from "../../src/types";
import { colors, fonts, radius } from "../../src/theme";

function toScores(p: HealthProfile): { vata: number; pitta: number; kapha: number; primary: Dosha } {
  const vata = Number(p.vataScore ?? 0);
  const pitta = Number(p.pittaScore ?? 0);
  const kapha = Number(p.kaphaScore ?? 0);
  const entries: [Dosha, number][] = [
    ["vata", vata],
    ["pitta", pitta],
    ["kapha", kapha],
  ];
  const primary = entries.sort((a, b) => b[1] - a[1])[0][0];
  return { vata, pitta, kapha, primary };
}

function Row({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Ionicons name={icon} size={20} color={colors.leaf} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
    </Pressable>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [health, setHealth] = useState<HealthProfile | null>(null);
  const [loyalty, setLoyalty] = useState<LoyaltySummary | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      api.healthProfile(user.id).then(setHealth).catch(() => {});
      api.loyalty().then(setLoyalty).catch(() => {});
    }, [user]),
  );

  const scores = health ? toScores(health) : null;
  const initials = user?.fullName?.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  function confirmLogout() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => logout() },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Display>Profile</Display>

        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials ?? "AP"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Title>{user?.fullName ?? "Wellness seeker"}</Title>
            <Body muted>{user?.email}</Body>
          </View>
        </View>

        {loyalty ? (
          <Card style={{ marginTop: 16, backgroundColor: colors.forest, borderColor: colors.forest }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text style={styles.rewardsLabel}>AyurPass Rewards · {loyalty.tier}</Text>
                <Text style={styles.rewardsPoints}>{loyalty.pointsBalance} pts</Text>
              </View>
              <Ionicons name="trophy-outline" size={30} color={colors.goldSoft} />
            </View>
            {loyalty.nextTier ? (
              <Text style={styles.rewardsHint}>
                {loyalty.pointsToNextTier} pts to {loyalty.nextTier}
              </Text>
            ) : null}
          </Card>
        ) : null}

        <View style={{ marginTop: 20 }}>
          <Title style={{ fontSize: 18, marginBottom: 10 }}>Your constitution</Title>
          {scores ? (
            <Card>
              <DoshaMeterGroup {...scores} primary={scores.primary} />
              <Pressable onPress={() => router.push("/assessment")} style={{ marginTop: 8 }}>
                <Text style={styles.link}>Retake assessment →</Text>
              </Pressable>
            </Card>
          ) : (
            <Card>
              <Body secondary>You haven&apos;t taken the Prakriti assessment yet.</Body>
              <Pressable onPress={() => router.push("/assessment")} style={{ marginTop: 10 }}>
                <Text style={styles.link}>Take the assessment →</Text>
              </Pressable>
            </Card>
          )}
        </View>

        <View style={{ marginTop: 20, gap: 2 }}>
          <Row icon="calendar-outline" label="My bookings" onPress={() => router.push("/(tabs)/bookings")} />
          <Row icon="compass-outline" label="Discover providers" onPress={() => router.push("/(tabs)")} />
        </View>

        <Pressable onPress={confirmLogout} style={styles.logout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 20 },
  avatar: {
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: colors.leaf,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: fonts.display, fontSize: 22, color: colors.white },
  rewardsLabel: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.goldSoft },
  rewardsPoints: { fontFamily: fonts.display, fontSize: 28, color: colors.white, marginTop: 2 },
  rewardsHint: { fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 8 },
  link: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.forest },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  rowLabel: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.foreground },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
  },
  logoutText: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.danger },
});
