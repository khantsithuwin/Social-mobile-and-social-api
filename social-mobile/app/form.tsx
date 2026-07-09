import { queryClient, useApp } from "@/components/app-provider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import { View, TextInput, Text, TouchableOpacity } from "react-native";

export default function Form() {
  const { colors } = useApp();
  const [content, setContent] = useState("");

  const add = async () => {
    const token = await AsyncStorage.getItem("token");
    const res = await fetch("http://localhost:8800/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      await queryClient.invalidateQueries({ queryKey: ["Posts"] });
      router.dismiss();
    } else {
      alert("Unable to add Post");
    }
  };

  return (
    <View
      style={{ flex: 1, padding: 20, backgroundColor: colors.background }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "800",
          color: colors.text,
          marginBottom: 14,
        }}
      >
        Create post
      </Text>
      <TextInput
        value={content}
        onChangeText={setContent}
        multiline
        style={{
          minHeight: 130,
          backgroundColor: colors.input,
          borderColor: colors.border,
          color: colors.text,
          borderWidth: 1,
          padding: 16,
          borderRadius: 20,
          fontSize: 16,
          textAlignVertical: "top",
        }}
        placeholder="What's on your mind?"
        placeholderTextColor="#9ca3af"
      />
      <TouchableOpacity
        onPress={add}
        style={{
          backgroundColor: colors.primary,
          padding: 15,
          borderRadius: 999,
          marginTop: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>Post</Text>
      </TouchableOpacity>
    </View>
  );
}
