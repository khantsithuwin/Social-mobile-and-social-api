import PostCard from "@/components/post-card";
import { useApp } from "@/components/app-provider";
import { PostType } from "@/types/global";
import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, ScrollView } from "react-native";

async function fetchPosts(): Promise<PostType[]> {
  const token = await AsyncStorage.getItem("token");
  const res = await fetch("http://localhost:8800/posts", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.json();
}

export default function Home() {
  const { colors } = useApp();
  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["Posts"],
    queryFn: fetchPosts,
  });
  if (error) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ color: colors.text }}>{error?.message}</Text>
      </View>
    );
  }
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ color: colors.text }}>Loading....</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingVertical: 8 }}
    >
      {posts?.map((post) => {
        return <PostCard key={post.id} post={post} />;
      })}
    </ScrollView>
  );
}
