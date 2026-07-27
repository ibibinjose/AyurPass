import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, EmptyState, Loading } from "../../src/components/ui";
import { useJobs } from "../../src/hooks/useCatalogDetail";
import { colors, fonts } from "../../src/theme";

const CATEGORIES = [
  { id: "ALL", label: "All Jobs" },
  { id: "AYURVEDA", label: "Ayurveda" },
  { id: "YOGA", label: "Yoga" },
  { id: "SPA", label: "Spa & Body" },
  { id: "MEDITATION", label: "Meditation" },
  { id: "NUTRITION", label: "Nutrition" },
  { id: "COACHING", label: "Coaching" },
];

export default function JobsFeedScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const jobsQ = useJobs({
    category: selectedCategory === "ALL" ? undefined : selectedCategory,
    q: searchQuery.trim() || undefined,
  });

  const jobs = jobsQ.data ?? [];

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header Banner */}
        <View style={{ position: "relative", overflow: "hidden", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}>
          <LinearGradient
            colors={[colors.forestDeep, colors.forest, colors.leaf]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
          />

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Pressable
                onPress={() => router.back()}
                style={{
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
              <View>
                <Text style={{ fontSize: 13, color: colors.goldSoft, fontFamily: fonts.bodySemi }}>
                  AyurPass Careers 💼
                </Text>
                <Text style={{ fontSize: 24, fontFamily: fonts.display, color: colors.white, marginTop: 2 }}>
                  Job <Text style={{ color: colors.goldSoft }}>board</Text>
                </Text>
              </View>
            </View>
            <View style={{ height: 44, width: 44, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}>
              <Ionicons name="briefcase-outline" size={22} color={colors.goldSoft} />
            </View>
          </View>
        </View>

        {/* Content Container */}
        <View style={{ marginTop: -12, paddingHorizontal: 20 }}>
          {/* Search Bar */}
          <View style={{ minHeight: 48, flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 999, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 10 }}>
            <Ionicons name="search-outline" size={18} color={colors.inkMuted} />
            <TextInput
              placeholder="Search job title, clinic, or city..."
              placeholderTextColor={colors.inkMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 font-body text-base text-foreground"
              style={{ flex: 1, fontSize: 15, color: colors.foreground, fontFamily: fonts.body }}
            />
            {searchQuery ? (
              <Pressable onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color={colors.inkMuted} />
              </Pressable>
            ) : null}
          </View>

          {/* Category Horizontal Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 12 }}
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={{
                    borderRadius: 999,
                    borderWidth: 1,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderColor: active ? colors.forest : colors.hairline,
                    backgroundColor: active ? colors.forest : colors.surface,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: fonts.bodySemi,
                      fontSize: 13,
                      color: active ? colors.white : colors.forest,
                    }}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Main Jobs List */}
          <View style={{ marginTop: 4, gap: 12 }}>
            {jobsQ.isLoading ? (
              <Loading />
            ) : jobs.length === 0 ? (
              <EmptyState
                title="No job listings found"
                body="Try clearing your search query or selecting a different wellness category."
              />
            ) : (
              jobs.map((job) => (
                <Pressable
                  key={job.id}
                  onPress={() => router.push(`/jobs/${job.id}`)}
                  style={{
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: colors.hairline,
                    backgroundColor: colors.surface,
                    padding: 16,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Badge tone="leaf">{job.category}</Badge>
                    <Text style={{ fontFamily: fonts.bodySemi, fontSize: 12, textTransform: "uppercase", color: colors.leaf }}>
                      {job.employmentType.replace("_", " ")}
                    </Text>
                  </View>

                  <Text style={{ marginTop: 8, fontFamily: fonts.display, fontSize: 18, color: colors.forest }}>{job.title}</Text>

                  {job.provider?.businessName ? (
                    <Text style={{ marginTop: 2, fontFamily: fonts.bodySemi, fontSize: 14, color: colors.inkSecondary }}>
                      {job.provider.businessName}
                    </Text>
                  ) : null}

                  {(job.city || job.country || job.locationType) && (
                    <View style={{ marginTop: 4, flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Ionicons name="location-outline" size={14} color={colors.inkMuted} />
                      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.inkMuted }}>
                        {[job.city, job.country].filter(Boolean).join(", ") || job.locationType}
                      </Text>
                    </View>
                  )}

                  <Text style={{ marginTop: 6, fontFamily: fonts.body, fontSize: 14, color: colors.inkSecondary }} numberOfLines={2}>
                    {job.description}
                  </Text>

                  <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colors.hairline, paddingTop: 12 }}>
                    <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.forest }}>
                      {job.salaryMin
                        ? `${job.currency} $${job.salaryMin}${
                            job.salaryMax ? ` - $${job.salaryMax}` : "+"
                          }`
                        : "Competitive Salary"}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, backgroundColor: colors.forest, paddingHorizontal: 14, paddingVertical: 6 }}>
                      <Text style={{ fontFamily: fonts.bodySemi, fontSize: 12, color: colors.white }}>View Details</Text>
                      <Ionicons name="chevron-forward" size={12} color="#fff" />
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
