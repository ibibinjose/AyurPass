import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Role } from "../../src/types";
import { colors, fonts } from "../../src/theme";

type AccountOption = {
  role: Role;
  icon: keyof typeof Ionicons.glyphMap;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  perks: string[];
  gradient: readonly [string, string, string];
  accentColor: string;
  badgeLabel: string;
};

const ACCOUNT_OPTIONS: AccountOption[] = [
  {
    role: "CONSUMER",
    icon: "sparkles-outline",
    emoji: "🌿",
    title: "Seeker",
    subtitle: "Wellness Explorer",
    description:
      "Discover vetted clinics, yoga studios & spas near you. Get personalised Dosha-matched recommendations and book instantly.",
    perks: [
      "Prakriti Dosha quiz",
      "Near Me discovery",
      "Instant booking & AyurPass",
      "Loyalty points & rewards",
    ],
    gradient: [colors.forestDeep, colors.forest, colors.leaf] as const,
    accentColor: colors.leaf,
    badgeLabel: "Free • Most Popular",
  },
  {
    role: "PROFESSIONAL",
    icon: "person-circle-outline",
    emoji: "🧘",
    title: "Professional",
    subtitle: "Practitioner / Therapist",
    description:
      "Build your practitioner profile, get discovered by seekers, and manage your schedule — all under a verified clinic.",
    perks: [
      "Public practitioner profile",
      "Verified credential badge",
      "Booking schedule management",
      "Join a clinic or studio",
    ],
    gradient: ["#312e81", "#4338ca", "#6366f1"] as const,
    accentColor: "#818cf8",
    badgeLabel: "For Practitioners",
  },
  {
    role: "PROVIDER_ADMIN",
    icon: "business-outline",
    emoji: "🏛️",
    title: "Provider",
    subtitle: "Clinic · Studio · Retreat",
    description:
      "List your wellness business, manage staff and services, and appear in the AyurPass directory.",
    perks: [
      "Business listing & profile",
      "Staff & service management",
      "Bookings & payments dashboard",
      "Hiring & job listings",
    ],
    gradient: ["#78350f", "#b45309", "#d97706"] as const,
    accentColor: "#fbbf24",
    badgeLabel: "For Businesses",
  },
];

export default function AccountType() {
  const router = useRouter();
  const params = useLocalSearchParams<{ next?: string }>();
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const [selected, setSelected] = useState<Role>("CONSUMER");

  const selectedOption = ACCOUNT_OPTIONS.find((o) => o.role === selected)!;

  function handleContinue() {
    const query = new URLSearchParams({ role: selected });
    if (rawNext) query.set("next", rawNext);
    router.push(`/(auth)/register?${query.toString()}` as Href);
  }

  return (
    <View style={styles.root}>
      {/* Full-screen gradient background */}
      <LinearGradient
        colors={[colors.forestDeep, "#0f1a13", "#0a120d"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        {/* Top Navigation */}
        <View style={styles.topNav}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color={colors.white} />
          </Pressable>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>Choose Account Type</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.headline}>
            What brings you to{" "}
            <Text style={{ color: colors.goldSoft }}>AyurPass</Text>?
          </Text>
          <Text style={styles.subheadline}>
            Choose the account type that best describes you. You can always
            upgrade later.
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.cardsContainer}
          showsVerticalScrollIndicator={false}
        >
          {ACCOUNT_OPTIONS.map((option) => {
            const isSelected = selected === option.role;
            return (
              <Pressable
                key={option.role}
                onPress={() => setSelected(option.role)}
                style={[styles.card, isSelected && styles.cardSelected]}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                {/* Gradient accent strip on left edge when selected */}
                {isSelected && (
                  <LinearGradient
                    colors={option.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.cardAccentStrip}
                  />
                )}

                {/* Card Header Row */}
                <View style={styles.cardHeader}>
                  {/* Icon bubble */}
                  <View
                    style={[
                      styles.iconBubble,
                      isSelected && {
                        backgroundColor: option.accentColor + "28",
                        borderColor: option.accentColor + "60",
                      },
                    ]}
                  >
                    <Text style={styles.emoji}>{option.emoji}</Text>
                  </View>

                  {/* Title & Subtitle */}
                  <View style={styles.cardTitleBlock}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text
                        style={[
                          styles.cardTitle,
                          isSelected && { color: option.accentColor },
                        ]}
                      >
                        {option.title}
                      </Text>
                      {/* Badge */}
                      <View
                        style={[
                          styles.badge,
                          isSelected && {
                            backgroundColor: option.accentColor + "22",
                            borderColor: option.accentColor + "55",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            isSelected && { color: option.accentColor },
                          ]}
                        >
                          {option.badgeLabel}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.cardSubtitle}>{option.subtitle}</Text>
                  </View>

                  {/* Selection radio */}
                  <View
                    style={[
                      styles.radio,
                      isSelected && {
                        backgroundColor: option.accentColor,
                        borderColor: option.accentColor,
                      },
                    ]}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    )}
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.cardDescription}>{option.description}</Text>

                {/* Perks list */}
                <View style={styles.perksList}>
                  {option.perks.map((perk) => (
                    <View key={perk} style={styles.perkRow}>
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color={isSelected ? option.accentColor : colors.inkMuted}
                      />
                      <Text
                        style={[
                          styles.perkText,
                          isSelected && { color: "rgba(255,255,255,0.85)" },
                        ]}
                      >
                        {perk}
                      </Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            );
          })}

          {/* Bottom spacer */}
          <View style={{ height: 8 }} />
        </ScrollView>

        {/* CTA Footer */}
        <View style={styles.footer}>
          <Pressable
            onPress={handleContinue}
            style={{ overflow: "hidden", borderRadius: 16 }}
            accessibilityRole="button"
          >
            <LinearGradient
              colors={selectedOption.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaBtn}
            >
              <Text style={styles.ctaBtnText}>
                Continue as {selectedOption.title}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={selectedOption.accentColor}
              />
            </LinearGradient>
          </Pressable>

          <View style={styles.footerHint}>
            <Ionicons
              name="swap-horizontal-outline"
              size={13}
              color={colors.inkMuted}
            />
            <Text style={styles.footerHintText}>
              You can upgrade or change your account type later in Settings
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.forestDeep,
  },
  safe: {
    flex: 1,
  },
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  stepPill: {
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  stepPillText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  logoWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: colors.goldSoft,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
    color: colors.white,
    marginBottom: 8,
  },
  subheadline: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.65)",
  },
  cardsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 16,
    overflow: "hidden",
    position: "relative",
  },
  cardSelected: {
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.09)",
  },
  cardAccentStrip: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  emoji: {
    fontSize: 22,
  },
  cardTitleBlock: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 17,
    color: colors.white,
  },
  cardSubtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    color: "rgba(255,255,255,0.55)",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  cardDescription: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 12,
  },
  perksList: {
    gap: 6,
  },
  perkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  perkText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(10,18,13,0.6)",
  },
  ctaBtn: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 24,
  },
  ctaBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.white,
  },
  footerHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  footerHintText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
    textAlign: "center",
  },
});
