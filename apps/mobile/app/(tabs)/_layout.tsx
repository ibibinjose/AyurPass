import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts } from "../../src/theme";

function TabBarIcon({
  name,
  focusedName,
  title,
  focused,
  color,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focusedName: keyof typeof Ionicons.glyphMap;
  title: string;
  focused: boolean;
  color: string;
}) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          height: 30,
          paddingHorizontal: 16,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: focused ? "rgba(23,75,58,0.12)" : "transparent",
        }}
      >
        <Ionicons
          name={focused ? focusedName : name}
          size={20}
          color={focused ? colors.sage : color}
        />
      </View>
      <Text
        style={{
          fontFamily: focused ? fonts.bodySemi : fonts.bodyMedium,
          fontSize: 11,
          marginTop: 3,
          color: focused ? colors.sage : colors.inkMuted,
          letterSpacing: 0.35,
        }}
      >
        {title}
      </Text>
      {focused && (
        <View
          style={{
            marginTop: 2,
            height: 4,
            width: 4,
            borderRadius: 2,
            backgroundColor: colors.terracotta,
          }}
        />
      )}
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, Platform.OS === "android" ? 12 : 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,  // Disable built-in labels to prevent duplication
        tabBarActiveTintColor: colors.sage,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.hairline,
          borderTopWidth: 1,
          height: 68 + bottom,
          paddingTop: 10,
          paddingBottom: bottom,
          elevation: 8,
          shadowColor: colors.sageDark,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="compass-outline"
              focusedName="compass"
              title="Discover"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="bookmark-outline"
              focusedName="bookmark"
              title="Bookings"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="calendar-outline"
              focusedName="calendar"
              title="Calendar"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="person-outline"
              focusedName="person"
              title="Profile"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}