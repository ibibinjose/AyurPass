import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, VerifiedTick } from "../../src/components/ui";
import { DoshaMeterGroup } from "../../src/components/DoshaMeter";
import { useAuth } from "../../src/auth";
import { api, ApiError } from "../../src/api";
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
  const { user, logout, refreshProfile } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const pad = width >= 400 ? 20 : 16;
  const [health, setHealth] = useState<HealthProfile | null>(null);
  const [loyalty, setLoyalty] = useState<LoyaltySummary | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);

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

  async function saveAvatarUrl(url: string | null) {
    if (!user) return;
    setAvatarBusy(true);
    try {
      await api.updateUser(user.id, { avatarUrl: url || undefined });
      await refreshProfile();
    } catch (e) {
      Alert.alert(
        "Couldn't save photo",
        e instanceof ApiError ? e.message : "Please try again.",
      );
    } finally {
      setAvatarBusy(false);
    }
  }

  async function pickAvatarFromLibrary() {
    if (!user || avatarBusy) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo library access to set your avatar.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setAvatarBusy(true);
    try {
      const uploaded = await api.uploadImage({
        uri: asset.uri,
        name: asset.fileName ?? "avatar.jpg",
        type: asset.mimeType ?? "image/jpeg",
      });
      await api.updateUser(user.id, { avatarUrl: uploaded.url });
      await refreshProfile();
    } catch (e) {
      Alert.alert(
        "Upload failed",
        e instanceof ApiError ? e.message : "Try again or paste an image link.",
      );
    } finally {
      setAvatarBusy(false);
    }
  }

  function promptAvatarLink() {
    // Alert.prompt is iOS-only.
    if (typeof Alert.prompt === "function") {
      Alert.prompt(
        "Profile photo link",
        "Paste an image URL (https://…)",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Save",
            onPress: (value?: string) => {
              const url = value?.trim();
              if (url) void saveAvatarUrl(url);
            },
          },
        ],
        "plain-text",
        user?.avatarUrl ?? "",
      );
      return;
    }
    Alert.alert(
      "Paste image link",
      "On Android, use Upload from library, or set your photo from the web app Settings.",
    );
  }

  function openAvatarOptions() {
    if (!user || avatarBusy) return;
    Alert.alert("Profile photo", "Upload from your device or paste an image link.", [
      { text: "Upload from library", onPress: () => void pickAvatarFromLibrary() },
      { text: "Paste image link", onPress: promptAvatarLink },
      ...(user.avatarUrl
        ? [{ text: "Remove photo", style: "destructive" as const, onPress: () => void saveAvatarUrl(null) }]
        : []),
      { text: "Cancel", style: "cancel" },
    ]);
  }

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
            <Pressable
              onPress={openAvatarOptions}
              disabled={avatarBusy}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
              style={({ pressed }) => [styles.avatarRing, pressed && { opacity: 0.9 }]}
            >
              <View style={styles.avatarInner}>
                {user?.avatarUrl ? (
                  <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{initials}</Text>
                )}
              </View>
              <View style={styles.avatarBadge}>
                <Ionicons name={avatarBusy ? "hourglass-outline" : "camera"} size={14} color={colors.forest} />
              </View>
            </Pressable>
            <Text style={styles.avatarHint}>{avatarBusy ? "Saving…" : "Tap to change photo"}</Text>
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
    marginBottom: 6,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 48,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.surface,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  avatarHint: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 10,
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
