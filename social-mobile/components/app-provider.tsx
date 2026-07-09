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
    border: string;
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AppProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<UserType | undefined>();
  const [isDark, setIsDark] = useState(false);

  const colors = {
    background: isDark ? "#111827" : "#f3f4f6",
    card: isDark ? "#1f2937" : "#ffffff",
    text: isDark ? "#f9fafb" : "#111827",
    border: isDark ? "#374151" : "#e5e7eb",
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
