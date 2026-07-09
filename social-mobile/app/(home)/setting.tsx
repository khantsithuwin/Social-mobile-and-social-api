import { useApp } from "@/components/app-provider";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, TouchableOpacity, View } from "react-native";

export default function Setting() {
  const { isDark, toggleTheme, colors } = useApp();

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: colors.background,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text }}>
        Appearance
      </Text>
      <Text style={{ marginTop: 6, color: colors.muted }}>
        Choose how the app looks on your phone.
      </Text>
      <TouchableOpacity
        onPress={toggleTheme}
        style={{
          marginTop: 18,
          padding: 18,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 42,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isDark ? "#312e81" : "#fef3c7",
            }}
          >
            <Ionicons
              name={isDark ? "moon" : "sunny"}
              size={22}
              color={isDark ? "#c4b5fd" : "#f59e0b"}
            />
          </View>
          <Text style={{ fontSize: 16, color: colors.text }}>
            {isDark ? "Dark mode" : "Light mode"}
          </Text>
        </View>
        <Text style={{ color: colors.primary, fontWeight: "700" }}>
          Change
        </Text>
      </TouchableOpacity>
    </View>
  );
}
