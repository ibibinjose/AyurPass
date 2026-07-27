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
import { ProviderMapView } from "../../src/components/ProviderMapView";
import { colors, fonts } from "../../src/theme";

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
    <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Hero Header Banner */}
        <View style={{ position: "relative", overflow: "hidden", minHeight: 220, paddingBottom: 28, paddingTop: 16 }}>
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

          <View style={{ alignItems: "center", paddingHorizontal: pad, paddingTop: 8 }}>
            <View style={{ marginBottom: 14, height: 88, width: 88, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.25)", padding: 4 }}>
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 999, backgroundColor: colors.forestDeep }}>
                <Ionicons
                  name={PROVIDER_TYPE_ICON[provider.type]}
                  size={32}
                  color={colors.goldSoft}
                />
              </View>
            </View>
            <View style={{ maxWidth: "92%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Text
                style={{ textAlign: "center", fontFamily: fonts.display, fontSize: 24, color: colors.white }}
                numberOfLines={2}
              >
                {provider.businessName}
              </Text>
              {verified ? <VerifiedTick size={22} /> : null}
            </View>
            <Text style={{ marginTop: 6, fontFamily: fonts.bodySemi, fontSize: 15, color: "rgba(255,255,255,0.9)" }}>{typeLabel}</Text>
            {location ? (
              <View style={{ marginTop: 8, maxWidth: "90%", flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.85)" />
                <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 13, color: "rgba(255,255,255,0.85)" }} numberOfLines={1}>
                  {location}
                </Text>
              </View>
            ) : null}

            {hasJobs ? (
              <Pressable
                onPress={() => setTab("jobs")}
                style={{
                  marginTop: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "rgba(233,217,184,0.4)",
                  backgroundColor: "rgba(233,217,184,0.2)",
                  paddingHorizontal: 14,
                  paddingVertical: 4,
                }}
              >
                <Ionicons name="briefcase-outline" size={14} color={colors.goldSoft} />
                <Text style={{ fontFamily: fonts.bodySemi, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: colors.goldSoft }}>
                  WE'RE HIRING · {jobs.length} OPEN {jobs.length === 1 ? "POSITION" : "POSITIONS"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={{ paddingHorizontal: pad, marginTop: 14 }}>
          <View style={{ flexDirection: "row", gap: 4, borderRadius: 999, backgroundColor: colors.clay, padding: 4 }}>
            {tabs.map((t) => {
              const active = tab === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setTab(t.id)}
                  style={{
                    minHeight: 40,
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 999,
                    paddingVertical: 8,
                    backgroundColor: active ? colors.surface : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: fonts.bodySemi,
                      fontSize: 14,
                      color: active ? colors.forest : colors.inkMuted,
                    }}
                  >
                    {t.label}
                    {"count" in t && t.count != null ? ` (${t.count})` : ""}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {tab === "about" ? (
            <View style={{ marginTop: 16, gap: 12 }}>
              {about ? (
                <Body secondary className="text-base leading-6" style={{ fontSize: 16, lineHeight: 24 }}>
                  {about}
                </Body>
              ) : (
                <EmptyState
                  title="No story yet"
                  body="This practice hasn't written an about section."
                />
              )}
              {(provider.registrationNumber || provider.licenceNumber) && (
                <View style={{ gap: 6, borderRadius: 16, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface, padding: 14 }}>
                  {provider.registrationNumber ? (
                    <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.inkMuted }}>
                      Registration ·{" "}
                      <Text style={{ fontFamily: fonts.bodySemi, color: colors.foreground }}>
                        {provider.registrationNumber}
                      </Text>
                    </Text>
                  ) : null}
                  {provider.licenceNumber ? (
                    <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.inkMuted }}>
                      Licence ·{" "}
                      <Text style={{ fontFamily: fonts.bodySemi, color: colors.foreground }}>
                        {provider.licenceNumber}
                      </Text>
                    </Text>
                  ) : null}
                </View>
              )}
              <View style={{ marginTop: 4, gap: 8 }}>
                <Text style={{ fontFamily: fonts.bodySemi, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: colors.inkMuted }}>
                  Location & Map
                </Text>
                <ProviderMapView singleProvider={provider} height={200} />
              </View>

              {provider.brandProfile?.tags && provider.brandProfile.tags.length > 0 ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
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
            <View style={{ marginTop: 16, gap: 12 }}>
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
            <View style={{ marginTop: 16, gap: 12 }}>
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
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <Badge tone="leaf">{job.category}</Badge>
                      <Text style={{ fontFamily: fonts.bodySemi, fontSize: 12, textTransform: "uppercase", color: colors.leaf }}>
                        {job.employmentType.replace("_", " ")}
                      </Text>
                    </View>
                    <Text style={{ marginTop: 8, fontFamily: fonts.display, fontSize: 18, color: colors.forest }}>{job.title}</Text>
                    <Text style={{ marginTop: 4, fontFamily: fonts.body, fontSize: 14, color: colors.inkMuted }} numberOfLines={2}>
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
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, backgroundColor: colors.forest, paddingHorizontal: 12, paddingVertical: 6 }}>
                        <Text style={{ fontFamily: fonts.bodySemi, fontSize: 12, color: colors.white }}>Apply Now</Text>
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
