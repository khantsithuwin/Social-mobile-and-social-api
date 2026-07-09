import { queryClient, useApp } from "@/components/app-provider";
import PostCard from "@/components/post-card";
import { PostType } from "@/types/global";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View, TextInput, TouchableOpacity } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

async function fetchPosts(): Promise<PostType[]> {
  const token = await AsyncStorage.getItem("token");
  const res = await fetch("http://localhost:8800/posts", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.json();
}

export default function Profile() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { auth, setAuth, colors } = useApp();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["Posts"],
    queryFn: fetchPosts,
    enabled: !!auth,
  });

  const ownerPosts = posts?.filter((post) => {
    return String(post.user.id) === String(auth?.id);
  });

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

  if (auth) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View
          style={{
            margin: 16,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 26,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: 110,
              backgroundColor: colors.primary,
            }}
          />
          <View
            style={{
              padding: 20,
              paddingTop: 0,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 86,
                height: 86,
                borderRadius: 86,
                backgroundColor: colors.primary,
                borderWidth: 5,
                borderColor: colors.card,
                alignItems: "center",
                justifyContent: "center",
                marginTop: -43,
              }}
            >
              <Text
                style={{ color: "white", fontSize: 32, fontWeight: "800" }}
              >
                {auth.name[0].toUpperCase()}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 25,
                fontWeight: "800",
                textAlign: "center",
                color: colors.text,
                marginTop: 12,
              }}
            >
              {auth.name}
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                textAlign: "center",
                marginTop: 4,
                color: colors.muted,
              }}
            >
              @{auth.username}
            </Text>
            {auth.bio && (
              <Text
                style={{
                  color: colors.text,
                  textAlign: "center",
                  marginTop: 12,
                  lineHeight: 22,
                }}
              >
                {auth.bio}
              </Text>
            )}
            <TouchableOpacity
              onPress={logout}
              style={{
                backgroundColor: colors.danger,
                padding: 13,
                paddingHorizontal: 30,
                borderRadius: 999,
                marginTop: 18,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            paddingHorizontal: 16,
            marginTop: 4,
            marginBottom: 2,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 21, fontWeight: "800" }}>
            Your posts
          </Text>
          <Text style={{ color: colors.muted, marginTop: 4 }}>
            {ownerPosts?.length ?? 0} posts shared by you
          </Text>
        </View>

        {isLoading && (
          <Text style={{ color: colors.muted, padding: 16 }}>
            Loading your posts...
          </Text>
        )}

        {!isLoading && ownerPosts?.length === 0 && (
          <View
            style={{
              margin: 16,
              padding: 18,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: "700" }}>
              No posts yet
            </Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>
              Your posts will show here after you create one.
            </Text>
          </View>
        )}

        {ownerPosts?.map((post) => {
          return <PostCard key={post.id} post={post} />;
        })}
      </ScrollView>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backgroundColor: colors.background,
      }}
    >
      <View
        style={{
          width: "100%",
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 24,
          padding: 20,
          gap: 10,
        }}
      >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              textAlign: "center",
              marginBottom: 8,
              color: colors.text,
            }}
          >
            {isRegister ? "Create account" : "Welcome back"}
          </Text>
          {isRegister && (
            <TextInput
              value={name}
              onChangeText={setName}
              style={{
                backgroundColor: colors.input,
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
              backgroundColor: colors.input,
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
              backgroundColor: colors.input,
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
                backgroundColor: colors.input,
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
              backgroundColor: colors.primary,
              padding: 15,
              borderRadius: 999,
              marginTop: 8,
              alignItems: "center",
              opacity: isSubmitting ? 0.5 : 1,
            }}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>
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
            <Text style={{ color: colors.primary, fontWeight: "700" }}>
              {isRegister
                ? "Already have an account? Login"
                : "New user? Register"}
            </Text>
          </TouchableOpacity>
      </View>
    </View>
  );
}
