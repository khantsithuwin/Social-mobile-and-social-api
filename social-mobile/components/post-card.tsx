import { Text, TouchableOpacity, View } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { PostType } from "@/types/global";
import { router } from "expo-router";

export default function PostCard({ post }: { post: PostType }) {
  return (
    <View
      style={{
        marginHorizontal: 12,
        marginTop: 10,
        padding: 14,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 8,
        backgroundColor: "#ffffff",
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
        <View style={{ flexShrink: 1 }}>
          <Text style={{ fontWeight: "bold", fontSize: 15 }}>
            {post.user.name}
          </Text>
          <Text style={{ fontSize: 13, color: "teal" }}>{post.created}</Text>
          <TouchableOpacity onPress={() => router.push(`/view/${post.id}`)}>
            <Text style={{ marginTop: 5 }}>{post.content}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginTop: 15,
        }}
      >
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <TouchableOpacity>
            <Ionicons name="heart-outline" size={24} color={"red"} />
          </TouchableOpacity>
          <Text>10</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <TouchableOpacity>
            <Ionicons name="chatbubble-outline" size={24} color={"gray"} />
          </TouchableOpacity>
          <Text>{post.comments ? post.comments.length : 0}</Text>
        </View>
      </View>
    </View>
  );
}
