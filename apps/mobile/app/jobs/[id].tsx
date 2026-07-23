import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, Body, EmptyState, Loading } from "../../src/components/ui";
import { useJobDetail } from "../../src/hooks/useCatalogDetail";
import { colors } from "../../src/theme";

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const jobQ = useJobDetail(id);
  const job = jobQ.data;

  if (jobQ.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
        <Loading />
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView className="flex-1 bg-background p-4" edges={["top", "bottom"]}>
        <Pressable onPress={() => router.back()} className="mb-4 flex-row items-center gap-1">
          <Ionicons name="arrow-back" size={20} color={colors.forest} />
          <Text className="font-body-semi text-sm text-forest">Back</Text>
        </Pressable>
        <EmptyState title="Job posting not found" body="This listing may have expired or been removed." />
      </SafeAreaView>
    );
  }

  const provider = job.provider;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-hairline bg-surface p-4">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-clay active:opacity-80"
        >
          <Ionicons name="arrow-back" size={20} color={colors.forest} />
        </Pressable>
        <Text className="font-body-semi text-base text-forest">Job Opportunity</Text>
        <View className="w-9" />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Job Header Card */}
        <View className="rounded-2xl border border-hairline bg-surface p-5 shadow-sm">
          <View className="flex-row items-center justify-between">
            <Badge tone="leaf">{job.category}</Badge>
            <Text className="font-body-semi text-xs uppercase text-leaf">
              {job.employmentType.replace("_", " ")}
            </Text>
          </View>

          <Text className="mt-3 font-display text-2xl text-forest">{job.title}</Text>

          {provider?.businessName ? (
            <Pressable
              onPress={() => provider.id && router.push(`/provider/${provider.id}`)}
              className="mt-1 flex-row items-center gap-1 active:opacity-80"
            >
              <Ionicons name="business-outline" size={16} color={colors.forest} />
              <Text className="font-body-semi text-base text-forest underline">
                {provider.businessName}
              </Text>
            </Pressable>
          ) : null}

          {(job.city || job.country || job.locationType) && (
            <View className="mt-2 flex-row items-center gap-1.5">
              <Ionicons name="location-outline" size={16} color={colors.inkMuted} />
              <Text className="font-body-medium text-sm text-ink-muted">
                {[job.city, job.country].filter(Boolean).join(", ") || job.locationType}
              </Text>
            </View>
          )}

          {job.salaryMin ? (
            <View className="mt-3 flex-row items-center gap-1.5 rounded-xl bg-clay p-3">
              <Ionicons name="cash-outline" size={18} color={colors.forest} />
              <Text className="font-body-semi text-sm text-forest">
                {job.currency} ${job.salaryMin}
                {job.salaryMax ? ` - $${job.salaryMax}` : "+"}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Description Section */}
        <View className="rounded-2xl border border-hairline bg-surface p-5 gap-2">
          <Text className="font-display text-lg text-forest">Role Description</Text>
          <Body secondary className="text-base leading-6">
            {job.description}
          </Body>
        </View>

        {/* Requirements Section */}
        {job.requirements ? (
          <View className="rounded-2xl border border-hairline bg-surface p-5 gap-2">
            <Text className="font-display text-lg text-forest">Requirements & Qualifications</Text>
            <Body secondary className="text-base leading-6">
              {job.requirements}
            </Body>
          </View>
        ) : null}
      </ScrollView>

      {/* Floating Apply Bar */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-hairline bg-surface p-4 shadow-lg">
        <Pressable
          onPress={() => router.push(`/jobs/apply/${job.id}`)}
          className="flex-row items-center justify-center gap-2 rounded-full bg-forest py-3.5 active:opacity-90"
        >
          <Ionicons name="paper-plane-outline" size={20} color="#fff" />
          <Text className="font-body-semi text-base text-white">Apply For Position</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
