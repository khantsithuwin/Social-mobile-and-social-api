import AppProvider, { useApp } from "@/components/app-provider";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

function AppStack() {
  const { isDark, colors } = useApp();

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: "800",
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
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
