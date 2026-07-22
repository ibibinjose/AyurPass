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
import { useProviderDetail, useProviderServices } from "../../src/hooks/useCatalogDetail";
import { colors } from "../../src/theme";

type TabId = "about" | "services";

/**
 * Practice profile — gradient hero, verified tick, About / Services tabs.
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
  const provider = providerQ.data;
  const services = servicesQ.data ?? null;

  const location = provider ? formatAddress(provider.address) : "";
  const verified = provider?.verificationStatus === "verified";
  const about = provider?.brandProfile?.about;
  const typeLabel = provider ? PROVIDER_TYPE_LABEL[provider.type] : "";

  const tabs = useMemo(
    () =>
      [
        { id: "about" as const, label: "About" },
        {
          id: "services" as const,
          label: "Services",
          count: services?.length,
        },
      ] as const,
    [services?.length],
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
                    {"count" in t && t.count != null ? ` ${t.count}` : ""}
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
