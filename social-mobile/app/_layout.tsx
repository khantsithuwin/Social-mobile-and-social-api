import AppProvider, { useApp } from "@/components/app-provider";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

function AppStack() {
  const { isDark } = useApp();

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack>
        <Stack.Screen
          name="(home)"
          options={{ headerShown: false, title: "Home" }}
        />
        <Stack.Screen name="view/[id]" options={{ title: "View Post" }} />
        <Stack.Screen
          name="form"
          options={{ title: "New Post", presentation: "modal" }}
        />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <AppStack />
    </AppProvider>
  );
}
