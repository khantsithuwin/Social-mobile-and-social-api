import PostCard from "@/components/post-card";
import { PostType } from "@/types/global";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { View, Text, ScrollView } from "react-native";

async function fetchPosts(): Promise<PostType[]> {
  const res = await fetch("http://localhost:8800/posts");
  return res.json();
}

export default function Home() {
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
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>{error?.message}</Text>
      </View>
    );
  }
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Loading....</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      {posts?.map((post) => {
        return <PostCard key={post.id} post={post} />;
      })}
    </ScrollView>
  );
}
