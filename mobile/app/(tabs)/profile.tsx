import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Body, Card, VerifiedTick } from "../../src/components/ui";
import { DoshaMeterGroup } from "../../src/components/DoshaMeter";
import { useAuth } from "../../src/auth";
import { api } from "../../src/api";
import type { Dosha } from "../../src/dosha";
import type { HealthProfile, LoyaltySummary } from "../../src/types";
import { colors, fonts, radius, spacing } from "../../src/theme";

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

function Row({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }]}
    >
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={colors.systemBlue} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
    </Pressable>
  );
}

/**
 * Neo-minimal consumer profile — immersive gradient hero, status ring avatar,
 * soft cards, springy rows (mirrors web ProfileThemeScope vibe).
 */
export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const pad = width >= 400 ? 20 : 16;
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
  const initials =
    user?.fullName
      ?.split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "AP";

  function confirmLogout() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => logout() },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Immersive hero */}
        <View style={styles.heroWrap}>
          <LinearGradient
            colors={[colors.forest, colors.leaf, colors.goldSoft]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          />
          <View style={[styles.heroContent, { paddingHorizontal: pad }]}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarInner}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </View>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {user?.fullName ?? "Wellness seeker"}
              </Text>
              <VerifiedTick size={20} />
            </View>
            <Text style={styles.email} numberOfLines={1}>
              {user?.email}
            </Text>
            {scores ? (
              <View style={styles.doshaPill}>
                <Text style={styles.doshaPillText}>
                  Prakriti · {scores.primary.charAt(0).toUpperCase() + scores.primary.slice(1)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={{ paddingHorizontal: pad, marginTop: -12 }}>
          {loyalty ? (
            <LinearGradient
              colors={[colors.forest, "#2a4a3c"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.loyaltyCard}
            >
              <View>
                <Text style={styles.loyaltyEyebrow}>AyurPass Rewards</Text>
                <Text style={styles.loyaltyPoints}>{loyalty.pointsBalance} pts</Text>
                <Text style={styles.loyaltyTier}>{loyalty.tier} tier</Text>
              </View>
              <Ionicons name="sparkles" size={28} color={colors.goldSoft} />
            </LinearGradient>
          ) : null}

          {scores ? (
            <Card style={{ marginTop: 14 }}>
              <Text style={styles.sectionLabel}>Dosha balance</Text>
              <DoshaMeterGroup
                vata={scores.vata}
                pitta={scores.pitta}
                kapha={scores.kapha}
                primary={scores.primary}
              />
            </Card>
          ) : (
            <Pressable
              onPress={() => router.push("/assessment")}
              style={({ pressed }) => [styles.ctaCard, pressed && { opacity: 0.9 }]}
            >
              <Ionicons name="compass-outline" size={22} color={colors.systemBlue} />
              <View style={{ flex: 1 }}>
                <Text style={styles.ctaTitle}>Discover your dosha</Text>
                <Text style={styles.ctaBody}>Take the Prakriti assessment</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
            </Pressable>
          )}

          <Card style={{ marginTop: 14, padding: 0, overflow: "hidden" }}>
            <Row icon="calendar-outline" label="My bookings" onPress={() => router.push("/(tabs)/bookings")} />
            <Row icon="gift-outline" label="Offers & deals" onPress={() => router.push("/offers")} />
            <Row
              icon="compass-outline"
              label={scores ? "Retake assessment" : "Dosha assessment"}
              onPress={() => router.push("/assessment")}
            />
            <Row icon="search-outline" label="Explore sessions" onPress={() => router.push("/(tabs)/explore")} />
          </Card>

          <Pressable
            onPress={confirmLogout}
            style={({ pressed }) => [styles.signOut, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    minHeight: 220,
    paddingBottom: 28,
    overflow: "hidden",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.95,
  },
  heroContent: {
    alignItems: "center",
    paddingTop: 28,
  },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    padding: 4,
    backgroundColor: "rgba(255,255,255,0.35)",
    marginBottom: 14,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 48,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.surface,
  },
  avatarText: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.forest,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: "90%",
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.white,
    flexShrink: 1,
  },
  email: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
  },
  doshaPill: {
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  doshaPillText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.white,
    letterSpacing: 0.3,
  },
  loyaltyCard: {
    borderRadius: radius.lg,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  loyaltyEyebrow: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.goldSoft,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  loyaltyPoints: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.white,
    marginTop: 4,
  },
  loyaltyTier: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  sectionLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.inkMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  ctaCard: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 16,
  },
  ctaTitle: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.forest },
  ctaBody: { fontFamily: fonts.body, fontSize: 13, color: colors.inkMuted, marginTop: 2 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
    minHeight: 52,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(0,122,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.foreground,
  },
  signOut: {
    marginTop: 24,
    alignItems: "center",
    paddingVertical: 14,
  },
  signOutText: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.danger,
  },
});
