import { router, Tabs } from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";
import { TouchableOpacity } from "react-native";
import { useApp } from "@/components/app-provider";

export default function HomeLayout() {
  const { auth } = useApp();

  return (
    <Tabs>
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
                style={{ marginRight: 15 }}
              >
                <Ionicons name="add-circle" size={24} />
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
