import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Callout, Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { formatAddress, PROVIDER_TYPE_ICON, PROVIDER_TYPE_LABEL } from "../catalog";
import { colors, fonts } from "../theme";
import type { Provider } from "../types";

// Default center fallback (Sydney / Gold Coast / Australia regional center or global default)
const DEFAULT_REGION = {
  latitude: -33.8688,
  longitude: 151.2093,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

// Generates stable coordinates if a mock provider is missing lat/lng
function getCoordinates(provider: Provider, index: number) {
  const addr = provider.address as Record<string, any> | undefined;
  if (addr?.lat && addr?.lng) {
    return { latitude: Number(addr.lat), longitude: Number(addr.lng) };
  }
  // Offset pseudo coordinates near default region for demonstration if un-geocoded
  const latOffset = (index % 5 - 2) * 0.035;
  const lngOffset = (Math.floor(index / 5) % 5 - 2) * 0.035;
  return {
    latitude: DEFAULT_REGION.latitude + latOffset,
    longitude: DEFAULT_REGION.longitude + lngOffset,
  };
}

export function ProviderMapView({
  providers,
  height = 400,
  singleProvider,
}: {
  providers?: Provider[];
  height?: number;
  singleProvider?: Provider;
}) {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [locating, setLocating] = useState(false);

  const list = singleProvider ? [singleProvider] : providers ?? [];

  const initialRegion = singleProvider
    ? {
        ...getCoordinates(singleProvider, 0),
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      }
    : DEFAULT_REGION;

  async function goToMyLocation() {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location permission", "Please enable location access to see places near you.");
        setLocating(false);
        return;
      }

      const curr = await Location.getCurrentPositionAsync({});
      mapRef.current?.animateToRegion({
        latitude: curr.coords.latitude,
        longitude: curr.coords.longitude,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
      });
    } catch {
      Alert.alert("Location error", "Couldn't fetch your current GPS location.");
    } finally {
      setLocating(false);
    }
  }

  function openNativeMaps(p: Provider, index: number) {
    const coords = getCoordinates(p, index);
    const label = encodeURIComponent(p.businessName);
    const url = `https://maps.apple.com/?q=${label}&ll=${coords.latitude},${coords.longitude}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Maps unavailable", `Address: ${formatAddress(p.address)}`);
    });
  }

  return (
    <View style={[styles.container, { height }]} className="overflow-hidden rounded-2xl border border-hairline bg-surface shadow-xs">
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {list.map((p, idx) => {
          const coords = getCoordinates(p, idx);
          const iconName = PROVIDER_TYPE_ICON[p.type] || "business-outline";
          const verified = p.verificationStatus === "verified";

          return (
            <Marker
              key={p.id}
              coordinate={coords}
              title={p.businessName}
              description={PROVIDER_TYPE_LABEL[p.type]}
            >
              {/* Custom Pin Design */}
              <View className="items-center">
                <View className="flex-row items-center gap-1 rounded-full border border-forest bg-forest px-2.5 py-1.5 shadow-md">
                  <Ionicons name={iconName} size={14} color={colors.goldSoft} />
                  <Text className="font-body-semi text-xs text-white" numberOfLines={1}>
                    {p.businessName}
                  </Text>
                  {verified ? (
                    <View className="h-3.5 w-3.5 items-center justify-center rounded-full bg-system-blue">
                      <Ionicons name="checkmark" size={9} color="#fff" />
                    </View>
                  ) : null}
                </View>
                <View className="h-2 w-2 rotate-45 bg-forest -mt-1" />
              </View>

              {/* Callout */}
              <Callout
                tooltip
                onPress={() => {
                  if (singleProvider) {
                    openNativeMaps(p, idx);
                  } else {
                    router.push(`/provider/${p.id}`);
                  }
                }}
              >
                <View className="w-56 rounded-xl border border-hairline bg-surface p-3 shadow-lg">
                  <Text className="font-body-semi text-sm text-forest" numberOfLines={1}>
                    {p.businessName}
                  </Text>
                  <Text className="font-body-medium text-xs text-leaf">
                    {PROVIDER_TYPE_LABEL[p.type]}
                  </Text>
                  <Text className="mt-1 font-body text-[11px] text-ink-muted" numberOfLines={1}>
                    {formatAddress(p.address)}
                  </Text>
                  <View className="mt-2.5 flex-row items-center justify-between border-t border-hairline pt-2">
                    <Text className="font-body-semi text-[11px] text-forest">
                      {singleProvider ? "Get Directions" : "View Practice"}
                    </Text>
                    <Ionicons name="chevron-forward" size={12} color={colors.forest} />
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Floating GPS button */}
      <Pressable
        onPress={goToMyLocation}
        disabled={locating}
        className="absolute bottom-3 right-3 h-10 w-10 items-center justify-center rounded-full border border-hairline bg-surface shadow-md active:opacity-80"
        accessibilityLabel="Go to my location"
      >
        <Ionicons
          name={locating ? "sync-outline" : "navigate-outline"}
          size={20}
          color={colors.forest}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});
