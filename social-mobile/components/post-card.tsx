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
  disableOpen,
}: {
  post: PostType;
  onDeleted?: () => void;
  disableOpen?: boolean;
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
        marginHorizontal: 16,
        marginTop: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 20,
        backgroundColor: colors.card,
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
      }}
    >
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 48,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.primary,
          }}
        >
          <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>
            {post.user.name[0].toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontWeight: "700", fontSize: 16, color: colors.text }}
          >
            {post.user.name}
          </Text>
          <Text style={{ fontSize: 13, color: colors.muted }}>{created}</Text>
          {disableOpen ? (
            <Text
              style={{
                marginTop: 8,
                color: colors.text,
                fontSize: 16,
                lineHeight: 23,
              }}
            >
              {post.content}
            </Text>
          ) : (
            <TouchableOpacity onPress={() => router.push(`/view/${post.id}`)}>
              <Text
                style={{
                  marginTop: 8,
                  color: colors.text,
                  fontSize: 16,
                  lineHeight: 23,
                }}
              >
                {post.content}
              </Text>
            </TouchableOpacity>
          )}
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
            <Ionicons name="trash-outline" size={21} color={colors.danger} />
          </TouchableOpacity>
        )}
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          gap: 34,
          marginTop: 18,
          paddingLeft: 60,
        }}
      >
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <TouchableOpacity onPress={toggleLike} disabled={isLiking}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={24}
              color={liked ? colors.danger : colors.muted}
            />
          </TouchableOpacity>
          <Text style={{ color: colors.muted, fontWeight: "600" }}>
            {likesCount}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => router.push(`/view/${post.id}`)}
            disabled={disableOpen}
          >
            <Ionicons
              name="chatbubble-outline"
              size={24}
              color={colors.muted}
            />
          </TouchableOpacity>
          <Text style={{ color: colors.muted, fontWeight: "600" }}>
            {post.comments ? post.comments.length : 0}
          </Text>
        </View>
      </View>
    </View>
  );
}
