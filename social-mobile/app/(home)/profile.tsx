import { queryClient, useApp } from "@/components/app-provider";
import { router } from "expo-router";
import { useState } from "react";
import { Text, View, TextInput, TouchableOpacity } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Profile() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { auth, setAuth, colors } = useApp();

  const login = async () => {
    if (!username || !password) {
      alert("Username and password are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:8800/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const { user, token } = await res.json();
        setAuth(user);
        await AsyncStorage.setItem("token", token);
        await queryClient.invalidateQueries({ queryKey: ["Posts"] });
        router.push("/");
      } else {
        const data = await res.json().catch(() => undefined);
        alert(data?.msg ?? "Unable to login");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const register = async () => {
    if (!name.trim() || !username.trim() || !password) {
      alert("Name, username and password are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:8800/users", {
        method: "POST",
        body: JSON.stringify({ name, username, bio, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const { user, token } = await res.json();
        setAuth(user);
        await AsyncStorage.setItem("token", token);
        await queryClient.invalidateQueries({ queryKey: ["Posts"] });
        router.push("/");
      } else {
        const data = await res.json().catch(() => undefined);
        alert(data?.msg ?? "Unable to register");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = async () => {
    setAuth(undefined);
    await AsyncStorage.removeItem("token");
    await queryClient.invalidateQueries({ queryKey: ["Posts"] });
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
      }}
    >
      {auth && (
        <View>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 10,
              color: colors.text,
            }}
          >
            {auth.name}
          </Text>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 10,
              color: colors.text,
            }}
          >
            @{auth.username}
          </Text>
          <TouchableOpacity
            onPress={logout}
            style={{
              backgroundColor: "red",
              borderColor: "#666666",
              borderWidth: 1,
              padding: 10,
              paddingHorizontal: 30,
              borderRadius: 15,
              marginTop: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white" }}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
      {!auth && (
        <View style={{ width: "80%", gap: 5 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 10,
              color: colors.text,
            }}
          >
            {isRegister ? "REGISTER" : "LOGIN"}
          </Text>
          {isRegister && (
            <TextInput
              value={name}
              onChangeText={setName}
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
                borderWidth: 1,
                padding: 15,
                borderRadius: 15,
                fontSize: 15,
              }}
              placeholder="name"
              placeholderTextColor="#9ca3af"
            />
          )}
          <TextInput
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
              borderWidth: 1,
              padding: 15,
              borderRadius: 15,
              fontSize: 15,
            }}
            placeholder="username"
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
              borderWidth: 1,
              padding: 15,
              borderRadius: 15,
              fontSize: 15,
            }}
            placeholder="password"
            placeholderTextColor="#9ca3af"
          />
          {isRegister && (
            <TextInput
              value={bio}
              onChangeText={setBio}
              multiline
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
                borderWidth: 1,
                padding: 15,
                borderRadius: 15,
                fontSize: 15,
              }}
              placeholder="bio (optional)"
              placeholderTextColor="#9ca3af"
            />
          )}
          <TouchableOpacity
            onPress={isRegister ? register : login}
            disabled={isSubmitting}
            style={{
              backgroundColor: "teal",
              borderColor: "#666666",
              borderWidth: 1,
              padding: 15,
              borderRadius: 15,
              marginTop: 5,
              alignItems: "center",
              opacity: isSubmitting ? 0.5 : 1,
            }}
          >
            <Text style={{ color: "white" }}>
              {isSubmitting
                ? "Please wait..."
                : isRegister
                  ? "Register"
                  : "Login"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsRegister(!isRegister)}
            disabled={isSubmitting}
            style={{
              padding: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "teal" }}>
              {isRegister
                ? "Already have an account? Login"
                : "New user? Register"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
