import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Comment } from "../types";
import { COLORS, SPACING, FONT } from "../utils/theme";

interface CommentItemProps {
  comment: Comment;
  onUpvote: (commentId: string, currentVote: "up" | "down" | null) => void;
  onDownvote: (commentId: string, currentVote: "up" | "down" | null) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onUpvote,
  onDownvote,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `${Math.floor(diffInMs / (1000 * 60))}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri:
              comment.userImageUrl ||
              "https://randomuser.me/api/portraits/lego/1.jpg",
          }}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.username}>{comment.username}</Text>
          <Text style={styles.time}>{formatDate(comment.createdAt)}</Text>
        </View>
      </View>

      <Text style={styles.commentText}>{comment.text}</Text>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onUpvote(comment.id, comment.userVote)}
        >
          <Ionicons
            name={
              comment.userVote === "up"
                ? "arrow-up-circle"
                : "arrow-up-circle-outline"
            }
            size={18}
            color={
              comment.userVote === "up" ? COLORS.primary : COLORS.secondaryText
            }
          />
          <Text
            style={[
              styles.actionText,
              comment.userVote === "up" && styles.activeText,
            ]}
          >
            {comment.upvotes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onDownvote(comment.id, comment.userVote)}
        >
          <Ionicons
            name={
              comment.userVote === "down"
                ? "arrow-down-circle"
                : "arrow-down-circle-outline"
            }
            size={18}
            color={
              comment.userVote === "down" ? COLORS.error : COLORS.secondaryText
            }
          />
          <Text
            style={[
              styles.actionText,
              comment.userVote === "down" && styles.errorText,
            ]}
          >
            {comment.downvotes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons
            name="chatbubble-outline"
            size={16}
            color={COLORS.secondaryText}
          />
          <Text style={styles.actionText}>Reply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  header: {
    flexDirection: "row",
    marginBottom: SPACING.xs,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: SPACING.s,
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  username: {
    fontSize: FONT.sizes.s,
    fontWeight: "600",
    color: COLORS.text,
  },
  time: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
  },
  commentText: {
    fontSize: FONT.sizes.s,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.s,
    marginLeft: 44, // align with username
  },
  actionsContainer: {
    flexDirection: "row",
    marginLeft: 44, // align with username
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: SPACING.m,
  },
  actionText: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
    marginLeft: 4,
  },
  activeText: {
    color: COLORS.primary,
  },
  errorText: {
    color: COLORS.error,
  },
});

export default CommentItem;
