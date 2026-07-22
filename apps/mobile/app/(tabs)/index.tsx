import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Body, Display, EmptyState, ErrorNote, Loading } from "../../src/components/ui";
import { useAuth } from "../../src/auth";
import { formatAddress, PROVIDER_TYPE_ICON, PROVIDER_TYPE_LABEL } from "../../src/catalog";
import { useDebouncedValue } from "../../src/hooks/useDebouncedValue";
import { useProviders } from "../../src/hooks/useProviders";
import type { Provider } from "../../src/types";
import { colors } from "../../src/theme";

function ProviderCard({ provider, onPress }: { provider: Provider; onPress: () => void }) {
  const location = formatAddress(provider.address);
  const verified = provider.verificationStatus === "verified";
  return (
    <Pressable
      onPress={onPress}
      className="min-h-[72px] flex-row items-center gap-3.5 rounded-lg border border-hairline bg-surface p-3.5 active:opacity-90"
    >
      <View className="h-12 w-12 items-center justify-center rounded-full bg-forest">
        <Ionicons name={PROVIDER_TYPE_ICON[provider.type]} size={22} color={colors.goldSoft} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text className="shrink font-body-semi text-[17px] text-forest" numberOfLines={1}>
            {provider.businessName}
          </Text>
          {verified ? (
            <View
              accessibilityLabel="Verified"
              className="h-[18px] w-[18px] items-center justify-center rounded-full bg-system-blue"
            >
              <Ionicons name="checkmark" size={11} color={colors.white} />
            </View>
          ) : null}
        </View>
        <Text className="mt-0.5 font-body-medium text-sm text-ink-secondary">
          {PROVIDER_TYPE_LABEL[provider.type]}
        </Text>
        {location ? (
          <View className="mt-1 flex-row items-center gap-1">
            <Ionicons name="location-outline" size={13} color={colors.inkMuted} />
            <Text className="font-body-medium text-[13px] text-ink-muted">{location}</Text>
          </View>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
    </Pressable>
  );
}

export default function Discover() {
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 350);
  const { data, error, isLoading, isFetching, refetch, isRefetching } = useProviders(debounced);

  const providers = useMemo(() => data ?? [], [data]);
  const firstName = user?.fullName?.split(" ")[0];
  const errMsg =
    error instanceof Error ? error.message : error ? "Couldn't load providers." : null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={colors.leaf}
          />
        }
      >
        <Body muted>{firstName ? `Namaste, ${firstName}` : "Namaste"}</Body>
        <Display className="mt-0.5">Discover providers</Display>

        <Pressable
          onPress={() => router.push("/offers")}
          className="mt-4 flex-row items-center gap-3 rounded-lg bg-forest p-4 active:opacity-90"
        >
          <View className="flex-1">
            <Text className="font-body-medium text-[11px] uppercase tracking-wide text-gold-soft">
              Limited-time
            </Text>
            <Text className="mt-0.5 font-body-semi text-[17px] text-white">
              Wellness offers & deals
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.goldSoft} />
        </Pressable>

        <View className="mt-4 min-h-12 flex-row items-center gap-2.5 rounded-full border border-hairline bg-surface px-4 py-3.5">
          <Ionicons name="search-outline" size={18} color={colors.inkMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search clinics, studios, spas…"
            placeholderTextColor={colors.inkMuted}
            className="flex-1 font-body text-base text-foreground"
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query ? (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.inkMuted} />
            </Pressable>
          ) : null}
          {isFetching && !isRefetching ? (
            <Ionicons name="sync-outline" size={16} color={colors.leaf} />
          ) : null}
        </View>

        <View className="mt-5">
          <ErrorNote message={errMsg} />
          {isLoading && !data ? (
            <Loading label="Finding wellness near you…" />
          ) : providers.length === 0 ? (
            <EmptyState
              title="No providers found"
              body="Try a different search, or pull to refresh."
            />
          ) : (
            <View className="gap-3">
              {providers.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  onPress={() => router.push(`/provider/${p.id}`)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
