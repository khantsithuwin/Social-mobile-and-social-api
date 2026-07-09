import PostCard from "@/components/post-card";
import { queryClient, useApp } from "@/components/app-provider";
import { PostType } from "@/types/global";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

async function fetchPost(id: string): Promise<PostType> {
  const token = await AsyncStorage.getItem("token");
  const res = await fetch(`http://localhost:8800/posts/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.json();
}

export default function ViewPost() {
  const { id } = useLocalSearchParams();
  const { auth } = useApp();
  const [content, setContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string>();

  const {
    data: post,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["Post", id as string],
    queryFn: () => fetchPost(id as string),
  });

  const refreshPost = async () => {
    await queryClient.invalidateQueries({ queryKey: ["Post", id as string] });
    await queryClient.invalidateQueries({ queryKey: ["Posts"] });
  };

  const addComment = async () => {
    if (!content.trim()) {
      alert("Comment is required");
      return;
    }

    const token = await AsyncStorage.getItem("token");
    if (!token) {
      alert("Please login to add a comment");
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch("http://localhost:8800/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: Number(id), content }),
      });

      if (res.ok) {
        setContent("");
        await refreshPost();
      } else {
        const data = await res.json().catch(() => undefined);
        alert(data?.msg ?? "Unable to add comment");
      }
    } finally {
      setIsAdding(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      alert("Please login to delete your comment");
      return;
    }

    setDeletingCommentId(commentId);
    try {
      const res = await fetch(`http://localhost:8800/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        await refreshPost();
      } else {
        const data = await res.json().catch(() => undefined);
        alert(data?.msg ?? "Unable to delete comment");
      }
    } finally {
      setDeletingCommentId(undefined);
    }
  };

  const confirmDeleteComment = (commentId: string) => {
    Alert.alert(
      "Delete comment",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteComment(commentId),
        },
      ],
    );
  };

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
      <PostCard post={post} onDeleted={() => router.back()} />
      <View style={{ padding: 15 }}>
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
          placeholder="Your reply"
        />
        <TouchableOpacity
          onPress={addComment}
          disabled={isAdding}
          style={{
            backgroundColor: "teal",
            borderColor: "#666666",
            borderWidth: 1,
            padding: 15,
            marginTop: 10,
            borderRadius: 15,
            alignItems: "center",
            marginBottom: 10,
            opacity: isAdding ? 0.5 : 1,
          }}
        >
          <Text style={{ color: "white" }}>
            {isAdding ? "Adding..." : "Add Comment"}
          </Text>
        </TouchableOpacity>
        <View>
          {post.comments.map((comment) => {
            const commentCreated = formatDistanceToNow(
              new Date(comment.created),
              {
                addSuffix: true,
              },
            );
            const isOwner =
              auth?.id && String(auth.id) === String(comment.user.id);

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
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "bold", fontSize: 15 }}>
                      {comment.user.name}
                    </Text>
                    <Text style={{ fontSize: 13, color: "teal" }}>
                      {commentCreated}
                    </Text>
                  </View>
                  {isOwner && (
                    <TouchableOpacity
                      onPress={() => confirmDeleteComment(comment.id)}
                      disabled={deletingCommentId === comment.id}
                      style={{
                        width: 32,
                        height: 32,
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: deletingCommentId === comment.id ? 0.4 : 1,
                      }}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={"#dc2626"}
                      />
                    </TouchableOpacity>
                  )}
                </View>
                <Text>{comment.content}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
