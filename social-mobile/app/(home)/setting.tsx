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
      <Text style={{ fontSize: 21, fontWeight: "bold", color: colors.text }}>
        Appearance
      </Text>
      <TouchableOpacity
        onPress={toggleTheme}
        style={{
          marginTop: 15,
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Ionicons
            name={isDark ? "moon" : "sunny"}
            size={24}
            color={isDark ? "#facc15" : "#f59e0b"}
          />
          <Text style={{ fontSize: 16, color: colors.text }}>
            {isDark ? "Dark mode" : "Light mode"}
          </Text>
        </View>
        <Text style={{ color: "teal", fontWeight: "bold" }}>Change</Text>
      </TouchableOpacity>
    </View>
  );
}
