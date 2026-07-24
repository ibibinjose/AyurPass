import { Ionicons } from "@expo/vector-icons";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { formatAddress, PROVIDER_TYPE_LABEL } from "../catalog";
import { colors } from "../theme";
import type { Provider } from "../types";

export function ProviderMapView({
  providers,
  height = 400,
  singleProvider,
}: {
  providers?: Provider[];
  height?: number;
  singleProvider?: Provider;
}) {
  const list = singleProvider ? [singleProvider] : providers ?? [];

  return (
    <View style={[styles.container, { height }]} className="overflow-hidden rounded-2xl border border-hairline bg-surface shadow-xs items-center justify-center p-6">
      <View className="items-center mb-4">
        <Ionicons name="map-outline" size={48} color={colors.forest} />
        <Text className="font-body-semi text-lg text-forest mt-2 text-center">
          Interactive Map
        </Text>
        <Text className="font-body text-sm text-ink-muted text-center mt-1">
          The interactive map is available in the iOS and Android app.
        </Text>
      </View>

      {singleProvider && (
        <Pressable
          className="bg-forest px-4 py-2.5 rounded-full flex-row items-center gap-2"
          onPress={() => {
            const label = encodeURIComponent(singleProvider.businessName);
            const url = `https://www.google.com/maps/search/?api=1&query=${label}`;
            Linking.openURL(url);
          }}
        >
          <Ionicons name="location-outline" size={16} color="#fff" />
          <Text className="font-body-semi text-sm text-white">
            Open in Google Maps
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});
