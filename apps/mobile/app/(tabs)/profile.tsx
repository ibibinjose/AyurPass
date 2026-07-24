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
import { HeaderLogo } from "../../src/components/HeaderLogo";
import { DoshaMeterGroup } from "../../src/components/DoshaMeter";
import { useAuth } from "../../src/auth";
import { api, ApiError } from "../../src/api";
import { resolveMediaUrl } from "../../src/media";
import { useHealthProfile, useLoyalty } from "../../src/hooks/useProfileExtras";
import type { Dosha } from "../../src/dosha";
import type { HealthProfile } from "../../src/types";
import { isPracticeRole, isStaffRole, roleLabel } from "../../src/persona";
import { colors } from "../../src/theme";

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
    >
      <View className="h-8 w-8 items-center justify-center rounded-[10px] bg-system-blue/10">
        <Ionicons name={icon} size={18} color={colors.systemBlue} />
      </View>
      <Text className="flex-1 font-body-semi text-base text-foreground">{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
    </Pressable>
  );
}

/**
 * Neo-minimal consumer profile — immersive gradient hero, status ring avatar,
 * soft cards (mirrors web ProfileThemeScope vibe). NativeWind + Query.
 */
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
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <View className="min-h-[220px] overflow-hidden pb-7">
          <LinearGradient
            colors={[colors.forest, colors.leaf, colors.goldSoft]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="absolute inset-0 opacity-95"
            style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, opacity: 0.95 }}
          />
          <View className="w-full flex-row justify-end px-4 pt-2 z-10">
            <HeaderLogo />
          </View>
          <View className="items-center pt-2" style={{ paddingHorizontal: pad }}>
            <Pressable
              onPress={openAvatarOptions}
              disabled={avatarBusy}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
              className="mb-1.5 h-[104px] w-[104px] rounded-full bg-white/35 p-1 active:opacity-90"
            >
              <View className="flex-1 items-center justify-center overflow-hidden rounded-full border-[3px] border-surface bg-surface">
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} className="h-full w-full" />
                ) : (
                  <Text className="font-display text-[28px] text-forest">{initials}</Text>
                )}
              </View>
              <View className="absolute bottom-0.5 right-0.5 h-7 w-7 items-center justify-center rounded-full border border-black/5 bg-surface">
                <Ionicons
                  name={avatarBusy ? "hourglass-outline" : "camera"}
                  size={14}
                  color={colors.forest}
                />
              </View>
            </Pressable>
            <Text className="mb-2.5 font-body-medium text-xs text-white/80">
              {avatarBusy ? "Saving…" : "Tap to change photo"}
            </Text>
            <View className="max-w-[90%] flex-row items-center gap-2">
              <Text className="shrink font-display text-[26px] text-white" numberOfLines={1}>
                {user?.fullName ?? "Wellness seeker"}
              </Text>
              <View className="rounded-full bg-white/20 px-2 py-0.5">
                <Text className="font-body-semi text-[10px] uppercase tracking-wide text-white">
                  {roleLabel(user?.role)}
                </Text>
              </View>
            </View>
            <Text className="mt-1 font-body-medium text-sm text-white/85" numberOfLines={1}>
              {user?.email}
            </Text>
            {scores ? (
              <View className="mt-3 rounded-full bg-white/20 px-3 py-1.5">
                <Text className="font-body-semi text-xs tracking-wide text-white">
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
              className="flex-row items-center justify-between rounded-lg p-[18px]"
              style={{
                borderRadius: 22,
                padding: 18,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text className="font-body-semi text-[11px] uppercase tracking-widest text-gold-soft">
                  AyurPass Rewards
                </Text>
                <Text className="mt-1 font-display text-[28px] text-white">
                  {loyalty.pointsBalance} pts
                </Text>
                <Text className="mt-0.5 font-body-medium text-sm text-white/80">
                  {loyalty.tier} tier
                </Text>
              </View>
              <Ionicons name="sparkles" size={28} color={colors.goldSoft} />
            </LinearGradient>
          ) : null}

          {scores ? (
            <Card className="mt-3.5">
              <Text className="mb-3 font-body-semi text-xs uppercase tracking-widest text-ink-muted">
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
              className="mt-3.5 flex-row items-center gap-3 rounded-2xl border border-hairline bg-surface p-4 active:opacity-90"
            >
              <Ionicons name="compass-outline" size={22} color={colors.forest} />
              <View className="flex-1">
                <Text className="font-body-semi text-base text-forest">Free energy quiz</Text>
                <Text className="mt-0.5 font-body text-[13px] text-ink-muted">
                  Optional — maps how you feel day to day
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
            </Pressable>
          )}

          <Card className="mt-3.5 overflow-hidden rounded-2xl p-0">
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

          <Pressable onPress={confirmLogout} className="mt-6 items-center py-3.5 active:opacity-70">
            <Text className="font-body-semi text-base text-danger">Sign out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
