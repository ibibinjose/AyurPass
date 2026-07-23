import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Badge,
  Body,
  EmptyState,
  Loading,
  VerifiedTick,
} from "../../src/components/ui";
import { ServiceCard } from "../../src/components/ServiceCard";
import { formatAddress, PROVIDER_TYPE_ICON, PROVIDER_TYPE_LABEL } from "../../src/catalog";
import { useProviderDetail, useProviderJobs, useProviderServices } from "../../src/hooks/useCatalogDetail";
import { colors } from "../../src/theme";

type TabId = "about" | "services" | "jobs";

/**
 * Practice profile — gradient hero, verified tick, hiring banner, About / Services / Jobs tabs.
 * NativeWind + TanStack Query.
 */
export default function ProviderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const pad = width >= 400 ? 20 : 16;
  const [tab, setTab] = useState<TabId>("about");

  const providerQ = useProviderDetail(id);
  const servicesQ = useProviderServices(id);
  const jobsQ = useProviderJobs(id);
  const provider = providerQ.data;
  const services = servicesQ.data ?? null;
  const jobs = jobsQ.data ?? [];

  const location = provider ? formatAddress(provider.address) : "";
  const verified = provider?.verificationStatus === "verified";
  const about = provider?.brandProfile?.about;
  const typeLabel = provider ? PROVIDER_TYPE_LABEL[provider.type] : "";
  const hasJobs = jobs.length > 0;

  const tabs = useMemo(
    () =>
      [
        { id: "about" as const, label: "About" },
        {
          id: "services" as const,
          label: "Services",
          count: services?.length,
        },
        {
          id: "jobs" as const,
          label: "Careers",
          count: jobs.length > 0 ? jobs.length : undefined,
        },
      ] as const,
    [services?.length, jobs.length],
  );

  if (providerQ.isLoading && provider === undefined) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
        <Loading />
      </SafeAreaView>
    );
  }

  if (!provider) {
    return (
      <SafeAreaView className="flex-1 bg-background p-5" edges={["bottom"]}>
        <EmptyState title="Provider not found" body="This listing may have been removed." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="min-h-[200px] pb-7 pt-6">
          <LinearGradient
            colors={[colors.forest, colors.leaf, "#4a6b58"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
          />
          <View className="items-center" style={{ paddingHorizontal: pad }}>
            <View className="mb-3.5 h-[88px] w-[88px] rounded-full bg-white/25 p-1">
              <View className="flex-1 items-center justify-center rounded-full bg-forest-deep">
                <Ionicons
                  name={PROVIDER_TYPE_ICON[provider.type]}
                  size={32}
                  color={colors.goldSoft}
                />
              </View>
            </View>
            <View className="max-w-[92%] flex-row items-center justify-center gap-2">
              <Text
                className="shrink text-center font-display text-2xl text-white"
                numberOfLines={2}
              >
                {provider.businessName}
              </Text>
              {verified ? <VerifiedTick size={22} /> : null}
            </View>
            <Text className="mt-1.5 font-body-semi text-[15px] text-white/90">{typeLabel}</Text>
            {location ? (
              <View className="mt-2 max-w-[90%] flex-row items-center gap-1">
                <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.85)" />
                <Text className="font-body-medium text-[13px] text-white/85" numberOfLines={1}>
                  {location}
                </Text>
              </View>
            ) : null}

            {hasJobs ? (
              <Pressable
                onPress={() => setTab("jobs")}
                className="mt-3 flex-row items-center gap-1.5 rounded-full border border-gold-soft/40 bg-gold-soft/20 px-3.5 py-1 active:opacity-90"
              >
                <Ionicons name="briefcase-outline" size={14} color={colors.goldSoft} />
                <Text className="font-body-semi text-xs uppercase tracking-wider text-gold-soft">
                  WE'RE HIRING · {jobs.length} OPEN {jobs.length === 1 ? "POSITION" : "POSITIONS"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={{ paddingHorizontal: pad, marginTop: 14 }}>
          <View className="flex-row gap-1 rounded-full bg-clay p-1">
            {tabs.map((t) => {
              const active = tab === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setTab(t.id)}
                  className={`min-h-10 flex-1 items-center justify-center rounded-full py-2.5 ${
                    active ? "bg-surface" : ""
                  }`}
                >
                  <Text
                    className={`font-body-semi text-sm ${
                      active ? "text-forest" : "text-ink-muted"
                    }`}
                  >
                    {t.label}
                    {"count" in t && t.count != null ? ` (${t.count})` : ""}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {tab === "about" ? (
            <View className="mt-4 gap-3">
              {about ? (
                <Body secondary className="text-base leading-6">
                  {about}
                </Body>
              ) : (
                <EmptyState
                  title="No story yet"
                  body="This practice hasn't written an about section."
                />
              )}
              {(provider.registrationNumber || provider.licenceNumber) && (
                <View className="gap-1.5 rounded-md border border-hairline bg-surface p-3.5">
                  {provider.registrationNumber ? (
                    <Text className="font-body-medium text-sm text-ink-muted">
                      Registration ·{" "}
                      <Text className="font-body-semi text-foreground">
                        {provider.registrationNumber}
                      </Text>
                    </Text>
                  ) : null}
                  {provider.licenceNumber ? (
                    <Text className="font-body-medium text-sm text-ink-muted">
                      Licence ·{" "}
                      <Text className="font-body-semi text-foreground">
                        {provider.licenceNumber}
                      </Text>
                    </Text>
                  ) : null}
                </View>
              )}
              {provider.brandProfile?.tags && provider.brandProfile.tags.length > 0 ? (
                <View className="flex-row flex-wrap gap-2">
                  {provider.brandProfile.tags.slice(0, 8).map((tag) => (
                    <Badge key={tag} tone="muted">
                      {tag}
                    </Badge>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}

          {tab === "services" ? (
            <View className="mt-4 gap-3">
              {servicesQ.isLoading && services === null ? (
                <Loading />
              ) : !services || services.length === 0 ? (
                <EmptyState title="No services listed yet" />
              ) : (
                services.map((s) => (
                  <ServiceCard
                    key={s.id}
                    service={s}
                    onPress={() => router.push(`/service/${s.id}`)}
                  />
                ))
              )}
            </View>
          ) : null}

          {tab === "jobs" ? (
            <View className="mt-4 gap-3">
              {jobsQ.isLoading ? (
                <Loading />
              ) : jobs.length === 0 ? (
                <EmptyState
                  title="No open vacancies"
                  body="This practice is not actively hiring right now."
                />
              ) : (
                jobs.map((job) => (
                  <Pressable
                    key={job.id}
                    onPress={() => router.push(`/jobs/${job.id}`)}
                    className="rounded-2xl border border-hairline bg-surface p-4 shadow-sm active:opacity-90"
                  >
                    <View className="flex-row items-center justify-between gap-2">
                      <Badge tone="leaf">{job.category}</Badge>
                      <Text className="font-body-semi text-xs uppercase text-leaf">
                        {job.employmentType.replace("_", " ")}
                      </Text>
                    </View>
                    <Text className="mt-2 font-display text-lg text-forest">{job.title}</Text>
                    <Text className="mt-1 font-body text-sm text-ink-muted" numberOfLines={2}>
                      {job.description}
                    </Text>
                    <View className="mt-3 flex-row items-center justify-between border-t border-hairline pt-3">
                      <Text className="font-body-semi text-sm color-forest">
                        {job.salaryMin
                          ? `${job.currency} $${job.salaryMin}${
                              job.salaryMax ? ` - $${job.salaryMax}` : "+"
                            }`
                          : "Competitive Salary"}
                      </Text>
                      <View className="flex-row items-center gap-1 rounded-full bg-forest px-3 py-1.5">
                        <Text className="font-body-semi text-xs text-white">Apply Now</Text>
                        <Ionicons name="chevron-forward" size={12} color="#fff" />
                      </View>
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
