import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts } from "../../src/theme";

/**
 * Bottom tabs — Discover · Calendar · Offers · You
 * Book sessions via Calendar → “Book session” (explore stays a stack route).
 */
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, Platform.OS === "android" ? 8 : 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.hairline,
          borderTopWidth: StyleHairline,
          height: 52 + bottom,
          paddingTop: 6,
          paddingBottom: bottom > 0 ? bottom : 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.bodySemi,
          fontSize: 10,
          marginTop: 1,
          letterSpacing: 0.1,
        },
        tabBarItemStyle: {
          minHeight: 44,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "compass" : "compass-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="offers"
        options={{
          title: "Offers",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "gift" : "gift-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "You",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      {/* Hidden routes — still navigable via push */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
          title: "Sessions",
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          href: null,
          title: "Bookings",
        }}
      />
    </Tabs>
  );
}

const StyleHairline = Platform.OS === "ios" ? 0.5 : 1;
