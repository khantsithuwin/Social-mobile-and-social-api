import PostCard from "@/components/post-card";
import { PostType } from "@/types/global";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

async function fetchPost(id: string): Promise<PostType> {
  const res = await fetch(`http://localhost:8800/posts/${id}`);
  return res.json();
}

export default function ViewPost() {
  const { id } = useLocalSearchParams();

  const {
    data: post,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["posts", id as string],
    queryFn: () => fetchPost(id as string),
  });

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontWeight: "bold", color: "red" }}>
          {error.message}
        </Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontWeight: "bold", color: "red" }}>
          There is no post
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontWeight: "bold" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <PostCard post={post} />
      <View style={{ padding: 15 }}>
        <TextInput
          style={{
            backgroundColor: "white",
            borderColor: "#666666",
            borderWidth: 1,
            padding: 15,
            borderRadius: 15,
            fontSize: 15,
          }}
          placeholder="Your reply"
        />
        <TouchableOpacity
          style={{
            backgroundColor: "teal",
            borderColor: "#666666",
            borderWidth: 1,
            padding: 15,
            marginTop: 10,
            borderRadius: 15,
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Text style={{ color: "white" }}>Add Comment</Text>
        </TouchableOpacity>
        <View>
          {post.comments.map((comment) => {
            return (
              <View
                key={comment.id}
                style={{
                  backgroundColor: "white",
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
                  borderRadius: 15,
                  padding: 10,
                  marginVertical: 5,
                }}
              >
                <Text
                  style={{ fontWeight: "bold", fontSize: 15, marginBottom: 5 }}
                >
                  {comment.user.name}
                </Text>
                <Text>{comment.content}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
