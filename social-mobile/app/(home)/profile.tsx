import { useApp } from "@/components/app-provider";
import { router } from "expo-router";
import { useState } from "react";
import { Text, View, TextInput, TouchableOpacity } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Profile() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { auth, setAuth } = useApp();

  const login = async () => {
    if (!username || !password) {
      return false;
    }

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
      router.push("/");
    } else {
      alert("Unable to login");
    }
  };

  const logout = async () => {
    setAuth(undefined);
    await AsyncStorage.removeItem("token");
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
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
            }}
          >
            LOGIN
          </Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            style={{
              backgroundColor: "white",
              borderColor: "#666666",
              borderWidth: 1,
              padding: 15,
              borderRadius: 15,
              fontSize: 15,
            }}
            placeholder="username"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{
              backgroundColor: "white",
              borderColor: "#666666",
              borderWidth: 1,
              padding: 15,
              borderRadius: 15,
              fontSize: 15,
            }}
            placeholder="password"
          />
          <TouchableOpacity
            onPress={login}
            style={{
              backgroundColor: "teal",
              borderColor: "#666666",
              borderWidth: 1,
              padding: 15,
              borderRadius: 15,
              marginTop: 5,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white" }}>Login</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
