import { Alert, Text, TouchableOpacity, View } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { PostType } from "@/types/global";
import { queryClient, useApp } from "@/components/app-provider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatDistanceToNow } from "date-fns";
import { router } from "expo-router";
import { useEffect, useState } from "react";

export default function PostCard({
  post,
  onDeleted,
}: {
  post: PostType;
  onDeleted?: () => void;
}) {
  const { auth, colors } = useApp();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [liked, setLiked] = useState(post.likedByMe);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const isOwner = auth?.id && String(auth.id) === String(post.user.id);
  const created = formatDistanceToNow(new Date(post.created), {
    addSuffix: true,
  });

  useEffect(() => {
    setLiked(post.likedByMe);
    setLikesCount(post.likesCount);
  }, [post.likedByMe, post.likesCount]);

  const toggleLike = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      alert("Please login to like this post");
      return;
    }

    setIsLiking(true);
    try {
      const res = await fetch("http://localhost:8800/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: Number(post.id) }),
      });

      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikesCount(data.likesCount);
        await queryClient.invalidateQueries({ queryKey: ["Posts"] });
        await queryClient.invalidateQueries({
          queryKey: ["Post", String(post.id)],
        });
      } else {
        const data = await res.json().catch(() => undefined);
        alert(data?.msg ?? "Unable to like post");
      }
    } finally {
      setIsLiking(false);
    }
  };

  const deletePost = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      alert("Please login to delete your post");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`http://localhost:8800/posts/${post.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        await queryClient.invalidateQueries({ queryKey: ["Posts"] });
        await queryClient.removeQueries({
          queryKey: ["Post", String(post.id)],
        });
        onDeleted?.();
      } else {
        const data = await res.json().catch(() => undefined);
        alert(data?.msg ?? "Unable to delete post");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert("Delete post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: deletePost,
      },
    ]);
  };

  return (
    <View
      style={{
        marginHorizontal: 12,
        marginTop: 10,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.card,
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
      }}
    >
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View
          style={{
            width: 54,
            height: 54,
            borderRadius: 54,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "teal",
          }}
        >
          <Text style={{ color: "white" }}>
            {post.user.name[0].toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontWeight: "bold", fontSize: 15, color: colors.text }}
          >
            {post.user.name}
          </Text>
          <Text style={{ fontSize: 13, color: "teal" }}>{created}</Text>
          <TouchableOpacity onPress={() => router.push(`/view/${post.id}`)}>
            <Text style={{ marginTop: 5, color: colors.text }}>
              {post.content}
            </Text>
          </TouchableOpacity>
        </View>
        {isOwner && (
          <TouchableOpacity
            onPress={confirmDelete}
            disabled={isDeleting}
            style={{
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
              opacity: isDeleting ? 0.4 : 1,
            }}
          >
            <Ionicons name="trash-outline" size={22} color={"#dc2626"} />
          </TouchableOpacity>
        )}
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginTop: 15,
        }}
      >
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <TouchableOpacity onPress={toggleLike} disabled={isLiking}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={24}
              color={"red"}
            />
          </TouchableOpacity>
          <Text style={{ color: colors.text }}>{likesCount}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.push(`/view/${post.id}`)}>
            <Ionicons name="chatbubble-outline" size={24} color={"gray"} />
          </TouchableOpacity>
          <Text style={{ color: colors.text }}>
            {post.comments ? post.comments.length : 0}
          </Text>
        </View>
      </View>
    </View>
  );
}
