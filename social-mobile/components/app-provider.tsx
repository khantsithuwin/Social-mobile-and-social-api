import { UserType } from "@/types/global";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ReactNode,
  Dispatch,
  SetStateAction,
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

export const queryClient = new QueryClient();

type AuthContextType = {
  auth: UserType | undefined;
  setAuth: Dispatch<SetStateAction<UserType | undefined>>;
  isDark: boolean;
  toggleTheme: () => Promise<void>;
  colors: {
    background: string;
    card: string;
    text: string;
    muted: string;
    border: string;
    primary: string;
    danger: string;
    input: string;
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AppProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<UserType | undefined>();
  const [isDark, setIsDark] = useState(false);

  const colors = {
    background: isDark ? "#0f172a" : "#f8fafc",
    card: isDark ? "#1e293b" : "#ffffff",
    text: isDark ? "#f8fafc" : "#0f172a",
    muted: isDark ? "#94a3b8" : "#64748b",
    border: isDark ? "#334155" : "#e2e8f0",
    primary: "#14b8a6",
    danger: "#ef4444",
    input: isDark ? "#162033" : "#ffffff",
  };

  const toggleTheme = async () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    await AsyncStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    (async () => {
      const savedTheme = await AsyncStorage.getItem("theme");
      setIsDark(savedTheme === "dark");

      const token = await AsyncStorage.getItem("token");
      if (token) {
        const res = await fetch("http://localhost:8800/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          setAuth(await res.json());
        } else {
          await AsyncStorage.removeItem("token");
        }
      }
    })();
  }, []);

  return (
    <AuthContext.Provider
      value={{ auth, setAuth, isDark, toggleTheme, colors }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AuthContext.Provider>
  );
}

export const useApp = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useApp must be used within an AuthProvider");
  }

  return context;
};
