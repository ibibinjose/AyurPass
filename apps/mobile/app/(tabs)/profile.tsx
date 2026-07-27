import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../src/components/ui";
import { DoshaMeterGroup } from "../../src/components/DoshaMeter";
import { useAuth } from "../../src/auth";
import { api, ApiError } from "../../src/api";
import { resolveMediaUrl } from "../../src/media";
import { useHealthProfile, useLoyalty } from "../../src/hooks/useProfileExtras";
import type { Dosha } from "../../src/dosha";
import type { HealthProfile } from "../../src/types";
import { isPracticeRole, isStaffRole, roleLabel } from "../../src/persona";
import { colors, fonts } from "../../src/theme";

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
      className="min-h-[52px] flex-row items-center gap-3 border-b border-hairline px-4 py-3.5 active:opacity-85"
      style={{
        minHeight: 52,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.hairline,
        paddingHorizontal: 16,
        paddingVertical: 14,
      }}
    >
      <View style={{ height: 32, width: 32, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "rgba(47,90,68,0.12)" }}>
        <Ionicons name={icon} size={18} color={colors.forest} />
      </View>
      <Text style={{ flex: 1, fontSize: 16, fontFamily: fonts.bodySemi, color: colors.foreground }}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
    </Pressable>
  );
}

export default function Profile() {
  const { user, logout, refreshProfile } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const pad = width >= 400 ? 20 : 16;
  const [avatarBusy, setAvatarBusy] = useState(false);

  const healthQ = useHealthProfile(user?.id);
  const loyaltyQ = useLoyalty(Boolean(user));

  useFocusEffect(
    useCallback(() => {
      void healthQ.refetch();
      void loyaltyQ.refetch();
    }, [healthQ.refetch, loyaltyQ.refetch]),
  );

  const health = healthQ.data ?? null;
  const loyalty = loyaltyQ.data ?? null;
  const scores = health ? toScores(health) : null;
  const avatarUri = resolveMediaUrl(user?.avatarUrl);
  const isPlatformAdmin = user?.role === "PLATFORM_ADMIN";
  const showPracticeLink = isPracticeRole(user) || isStaffRole(user);
  const webHub =
    (process.env.EXPO_PUBLIC_WEB_URL?.replace(/\/$/, "") || "https://ayurpass.com") +
    "/dashboard";
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
    <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        {/* Hero Header Banner */}
        <View style={{ position: "relative", overflow: "hidden", paddingBottom: 28 }}>
          <LinearGradient
            colors={[colors.forestDeep, colors.forest, colors.leaf]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
          />

          <View style={{ paddingHorizontal: pad, paddingTop: 20, alignItems: "center" }}>
            <Pressable
              onPress={openAvatarOptions}
              disabled={avatarBusy}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
              style={{ position: "relative", marginBottom: 8, height: 104, width: 104, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.25)", padding: 4 }}
            >
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 999, borderWidth: 3, borderColor: colors.surface, backgroundColor: colors.surface }}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={{ height: "100%", width: "100%" }} />
                ) : (
                  <Text style={{ fontSize: 28, fontFamily: fonts.display, color: colors.forest }}>{initials}</Text>
                )}
              </View>
              <View style={{ position: "absolute", bottom: 2, right: 2, height: 28, width: 28, alignItems: "center", justifyContent: "center", borderRadius: 999, borderWidth: 1, borderColor: "rgba(0,0,0,0.1)", backgroundColor: colors.surface }}>
                <Ionicons
                  name={avatarBusy ? "hourglass-outline" : "camera"}
                  size={14}
                  color={colors.forest}
                />
              </View>
            </Pressable>
            <Text style={{ marginBottom: 10, fontSize: 12, fontFamily: fonts.bodyMedium, color: "rgba(255,255,255,0.8)" }}>
              {avatarBusy ? "Saving…" : "Tap to change photo"}
            </Text>
            <View style={{ maxWidth: "90%", flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ fontSize: 26, fontFamily: fonts.display, color: colors.white }} numberOfLines={1}>
                {user?.fullName ?? "Wellness seeker"}
              </Text>
              <View style={{ borderRadius: 999, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ fontSize: 10, fontFamily: fonts.bodySemi, textTransform: "uppercase", letterSpacing: 0.5, color: colors.white }}>
                  {roleLabel(user?.role)}
                </Text>
              </View>
            </View>
            <Text style={{ marginTop: 4, fontSize: 14, fontFamily: fonts.bodyMedium, color: "rgba(255,255,255,0.85)" }} numberOfLines={1}>
              {user?.email}
            </Text>
            {scores ? (
              <View style={{ marginTop: 12, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={{ fontSize: 12, fontFamily: fonts.bodySemi, letterSpacing: 0.5, color: colors.white }}>
                  Energy · {scores.primary.charAt(0).toUpperCase() + scores.primary.slice(1)}
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
              style={{
                borderRadius: 22,
                padding: 18,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                elevation: 4,
              }}
            >
              <View>
                <Text style={{ fontSize: 11, fontFamily: fonts.bodySemi, textTransform: "uppercase", letterSpacing: 1, color: colors.goldSoft }}>
                  AyurPass Rewards
                </Text>
                <Text style={{ marginTop: 4, fontSize: 28, fontFamily: fonts.display, color: colors.white }}>
                  {loyalty.pointsBalance} pts
                </Text>
                <Text style={{ marginTop: 2, fontSize: 14, fontFamily: fonts.bodyMedium, color: "rgba(255,255,255,0.8)" }}>
                  {loyalty.tier} tier
                </Text>
              </View>
              <Ionicons name="sparkles" size={28} color={colors.goldSoft} />
            </LinearGradient>
          ) : null}

          {scores ? (
            <Card className="mt-3.5">
              <Text style={{ marginBottom: 12, fontSize: 12, fontFamily: fonts.bodySemi, textTransform: "uppercase", letterSpacing: 1, color: colors.inkMuted }}>
                Dosha balance
              </Text>
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
              style={{
                marginTop: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.hairline,
                backgroundColor: colors.surface,
                padding: 16,
              }}
            >
              <Ionicons name="compass-outline" size={22} color={colors.forest} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontFamily: fonts.bodySemi, color: colors.forest }}>Free energy quiz</Text>
                <Text style={{ marginTop: 2, fontSize: 13, fontFamily: fonts.body, color: colors.inkMuted }}>
                  Optional — maps how you feel day to day
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
            </Pressable>
          )}

          <Card className="mt-3.5 overflow-hidden rounded-2xl p-0" style={{ marginTop: 14, borderRadius: 20, overflow: "hidden", padding: 0 }}>
            <Row icon="calendar-outline" label="Calendar" onPress={() => router.push("/(tabs)/calendar")} />
            <Row icon="list-outline" label="All bookings" onPress={() => router.push("/(tabs)/bookings")} />
            <Row icon="gift-outline" label="Offers & deals" onPress={() => router.push("/(tabs)/offers")} />
            <Row
              icon="compass-outline"
              label={scores ? "Retake energy quiz" : "Energy quiz"}
              onPress={() => router.push("/assessment")}
            />
            <Row
              icon="add-circle-outline"
              label="Book a session"
              onPress={() => router.push("/(tabs)/explore")}
            />
            <Row
              icon="briefcase-outline"
              label="Careers / jobs"
              onPress={() => router.push("/jobs")}
            />
            <Row
              icon="information-circle-outline"
              label="About AyurPass"
              onPress={() => router.push("/about")}
            />
            {showPracticeLink ? (
              <Row
                icon="business-outline"
                label={
                  isPlatformAdmin
                    ? "Open admin hub (web)"
                    : isPracticeRole(user)
                      ? "Open practice hub (web)"
                      : "Open staff schedule (web)"
                }
                onPress={() => {
                  void Linking.openURL(webHub);
                }}
              />
            ) : null}
          </Card>

          <Pressable onPress={confirmLogout} style={{ marginTop: 24, alignItems: "center", paddingVertical: 14 }}>
            <Text style={{ fontSize: 16, fontFamily: fonts.bodySemi, color: colors.danger }}>Sign out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
