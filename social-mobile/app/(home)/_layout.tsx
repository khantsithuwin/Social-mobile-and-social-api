import { router, Tabs } from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";
import { TouchableOpacity } from "react-native";
import { useApp } from "@/components/app-provider";

export default function HomeLayout() {
  const { auth, colors } = useApp();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTitleStyle: {
          color: colors.text,
          fontSize: 22,
          fontWeight: "800",
        },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 86,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => {
            return <Ionicons name="home" size={24} color={color} />;
          },
          headerRight: () => {
            return auth ? (
              <TouchableOpacity
                onPress={() => {
                  router.push("/form");
                }}
                style={{
                  marginRight: 16,
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            ) : (
              <></>
            );
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => {
            return <Ionicons name="person-circle" size={24} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: "Setting",
          tabBarIcon: ({ color }) => {
            return <Ionicons name="settings-sharp" size={24} color={color} />;
          },
        }}
      />
    </Tabs>
  );
}
