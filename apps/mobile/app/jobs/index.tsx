import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, EmptyState, Loading } from "../../src/components/ui";
import { useJobs } from "../../src/hooks/useCatalogDetail";
import { colors } from "../../src/theme";

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
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <View className="border-b border-hairline bg-surface p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => router.back()}
              className="h-9 w-9 items-center justify-center rounded-full bg-clay active:opacity-80"
            >
              <Ionicons name="arrow-back" size={20} color={colors.forest} />
            </Pressable>
            <View>
              <Text className="font-display text-xl text-forest">Careers & Job Board</Text>
              <Text className="font-body-medium text-xs text-ink-muted">
                Ayurveda, Yoga, Spa & Wellness Positions
              </Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View className="mt-3.5 flex-row items-center rounded-full border border-hairline bg-clay px-3.5 py-2.5">
          <Ionicons name="search-outline" size={18} color={colors.inkMuted} />
          <TextInput
            placeholder="Search job title, clinic, or city..."
            placeholderTextColor={colors.inkMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="ml-2 flex-1 font-body text-sm text-foreground"
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
          className="mt-3 flex-row"
          contentContainerStyle={{ gap: 8 }}
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-3.5 py-1.5 ${
                  active ? "bg-forest" : "bg-clay border border-hairline"
                }`}
              >
                <Text
                  className={`font-body-semi text-xs ${
                    active ? "text-white" : "text-ink-secondary"
                  }`}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Jobs List */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
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
              className="rounded-2xl border border-hairline bg-surface p-4 shadow-sm active:opacity-90"
            >
              <View className="flex-row items-center justify-between">
                <Badge tone="leaf">{job.category}</Badge>
                <Text className="font-body-semi text-xs uppercase text-leaf">
                  {job.employmentType.replace("_", " ")}
                </Text>
              </View>

              <Text className="mt-2 font-display text-lg text-forest">{job.title}</Text>

              {job.provider?.businessName ? (
                <Text className="font-body-semi text-sm text-ink-secondary">
                  {job.provider.businessName}
                </Text>
              ) : null}

              {(job.city || job.country || job.locationType) && (
                <View className="mt-1 flex-row items-center gap-1">
                  <Ionicons name="location-outline" size={14} color={colors.inkMuted} />
                  <Text className="font-body-medium text-xs text-ink-muted">
                    {[job.city, job.country].filter(Boolean).join(", ") || job.locationType}
                  </Text>
                </View>
              )}

              <Text className="mt-2 font-body text-sm text-ink-secondary" numberOfLines={2}>
                {job.description}
              </Text>

              <View className="mt-3 flex-row items-center justify-between border-t border-hairline pt-3">
                <Text className="font-body-semi text-sm text-forest">
                  {job.salaryMin
                    ? `${job.currency} $${job.salaryMin}${
                        job.salaryMax ? ` - $${job.salaryMax}` : "+"
                      }`
                    : "Competitive Salary"}
                </Text>
                <View className="flex-row items-center gap-1 rounded-full bg-forest px-3.5 py-1.5">
                  <Text className="font-body-semi text-xs text-white">View Details</Text>
                  <Ionicons name="chevron-forward" size={12} color="#fff" />
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
