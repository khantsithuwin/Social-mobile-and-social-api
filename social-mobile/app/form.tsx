import { queryClient } from "@/components/app-provider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import { View, TextInput, Text, TouchableOpacity } from "react-native";

export default function Form() {
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
    <View style={{ padding: 20 }}>
      <TextInput
        value={content}
        onChangeText={setContent}
        style={{
          backgroundColor: "white",
          borderColor: "#666666",
          borderWidth: 1,
          padding: 15,
          borderRadius: 15,
          fontSize: 15,
        }}
        placeholder="What on your mind"
      />
      <TouchableOpacity
        onPress={add}
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
        <Text style={{ color: "white" }}>Post</Text>
      </TouchableOpacity>
    </View>
  );
}
