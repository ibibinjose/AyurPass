import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, Body, EmptyState, Loading } from "../../src/components/ui";
import { useJobDetail } from "../../src/hooks/useCatalogDetail";
import { colors, fonts } from "../../src/theme";

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const jobQ = useJobDetail(id);
  const job = jobQ.data;

  if (jobQ.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
        <Loading />
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView className="flex-1 bg-background p-4" style={{ flex: 1, backgroundColor: colors.background, padding: 16 }} edges={["top", "bottom"]}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16, flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="arrow-back" size={20} color={colors.forest} />
          <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.forest }}>Back</Text>
        </Pressable>
        <EmptyState title="Job posting not found" body="This listing may have expired or been removed." />
      </SafeAreaView>
    );
  }

  const provider = job.provider;

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header Banner */}
        <View style={{ position: "relative", overflow: "hidden", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, marginBottom: 16 }}>
          <LinearGradient
            colors={[colors.forestDeep, colors.forest, colors.leaf]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
          />

          <Pressable
            onPress={() => router.back()}
            style={{
              position: "absolute",
              left: 16,
              top: 16,
              zIndex: 20,
              height: 36,
              width: 36,
              borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color={colors.white} />
          </Pressable>

          <View style={{ paddingTop: 32, zIndex: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Badge tone="leaf">{job.category}</Badge>
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 11, textTransform: "uppercase", color: colors.goldSoft }}>
                {job.employmentType.replace("_", " ")}
              </Text>
            </View>

            <Text style={{ fontSize: 24, fontFamily: fonts.display, color: colors.white, marginTop: 10 }}>{job.title}</Text>

            {provider?.businessName ? (
              <Pressable
                onPress={() => provider.id && router.push(`/provider/${provider.id}`)}
                style={{ marginTop: 4, flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Ionicons name="business-outline" size={15} color={colors.goldSoft} />
                <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.goldSoft, textDecorationLine: "underline" }}>
                  {provider.businessName}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 14 }}>
          {/* Job Details Card */}
          <View style={{ borderRadius: 20, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface, padding: 18, gap: 10 }}>
            {(job.city || job.country || job.locationType) && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="location-outline" size={16} color={colors.inkMuted} />
                <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.inkMuted }}>
                  {[job.city, job.country].filter(Boolean).join(", ") || job.locationType}
                </Text>
              </View>
            )}

            {job.salaryMin ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 12, backgroundColor: colors.clay, padding: 12 }}>
                <Ionicons name="cash-outline" size={18} color={colors.forest} />
                <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.forest }}>
                  {job.currency} ${job.salaryMin}
                  {job.salaryMax ? ` - $${job.salaryMax}` : "+"}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Description Section */}
          <View style={{ borderRadius: 20, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface, padding: 18, gap: 8 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 18, color: colors.forest }}>Role Description</Text>
            <Body secondary style={{ fontSize: 15, lineHeight: 22, color: colors.inkSecondary }}>
              {job.description}
            </Body>
          </View>

          {/* Requirements Section */}
          {job.requirements ? (
            <View style={{ borderRadius: 20, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface, padding: 18, gap: 8 }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 18, color: colors.forest }}>Requirements & Qualifications</Text>
              <Body secondary style={{ fontSize: 15, lineHeight: 22, color: colors.inkSecondary }}>
                {job.requirements}
              </Body>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Floating Apply Bar */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, borderTopWidth: 1, borderTopColor: colors.hairline, backgroundColor: colors.surface, padding: 16, elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.08, shadowRadius: 6 }}>
        <Pressable
          onPress={() => router.push(`/jobs/apply/${job.id}`)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderRadius: 999,
            backgroundColor: colors.forest,
            paddingVertical: 14,
          }}
        >
          <Ionicons name="paper-plane-outline" size={18} color="#fff" />
          <Text style={{ fontFamily: fonts.bodySemi, fontSize: 16, color: colors.white }}>Apply For Position</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
