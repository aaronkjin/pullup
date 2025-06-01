import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Event } from "../types";
import { COLORS, SPACING, FONT } from "../utils/theme";

interface EventCardProps {
  event: Event;
  onPress: (eventId: string) => void;
  onLike: (eventId: string) => void;
  onSave: (eventId: string) => void;
}

const { width } = Dimensions.get("window");

const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  onLike,
  onSave,
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(event.id)}
      activeOpacity={0.9}
    >
      {/* Event Image */}
      {event.imageUrl && (
        <Image
          source={{ uri: event.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      {/* Event Info */}
      <View style={styles.infoContainer}>
        {/* Header with org info */}
        <View style={styles.header}>
          <Image
            source={{ uri: event.organizerImageUrl }}
            style={styles.orgImage}
          />
          <View style={styles.orgInfo}>
            <Text style={styles.orgName}>{event.organizerName}</Text>
            <Text style={styles.date}>{formatDate(event.dateTime)}</Text>
          </View>
          {event.isPrivate && (
            <View style={styles.privateContainer}>
              <Ionicons
                name="lock-closed"
                size={12}
                color={COLORS.secondaryText}
              />
              <Text style={styles.privateText}>Private</Text>
            </View>
          )}
        </View>

        {/* Event title and description */}
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {event.description}
        </Text>

        {/* Location */}
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={14} color={COLORS.secondaryText} />
          <Text style={styles.location}>{event.location}</Text>
        </View>

        {/* Category */}
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{event.category}</Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionsContainer}>
          {/* Like */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onLike(event.id)}
          >
            <Ionicons
              name={event.userLiked ? "heart" : "heart-outline"}
              size={24}
              color={event.userLiked ? COLORS.primary : COLORS.secondaryText}
            />
            <Text
              style={[styles.actionText, event.userLiked && styles.activeText]}
            >
              {event.likes}
            </Text>
          </TouchableOpacity>

          {/* Save */}
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={() => onSave(event.id)}
          >
            <Ionicons
              name={event.saved ? "bookmark" : "bookmark-outline"}
              size={22}
              color={event.saved ? COLORS.primary : COLORS.secondaryText}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: SPACING.l,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 180,
  },
  infoContainer: {
    padding: SPACING.m,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.s,
  },
  orgImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: SPACING.s,
  },
  orgInfo: {
    flex: 1,
  },
  orgName: {
    fontSize: FONT.sizes.s,
    fontWeight: "600",
    color: COLORS.text,
  },
  date: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  privateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: 12,
  },
  privateText: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
    marginLeft: 4,
  },
  title: {
    fontSize: FONT.sizes.l,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT.sizes.s,
    color: COLORS.secondaryText,
    lineHeight: 20,
    marginBottom: SPACING.s,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.s,
  },
  location: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
    marginLeft: 4,
  },
  categoryContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#F0F7FF",
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: SPACING.m,
  },
  category: {
    fontSize: FONT.sizes.xs,
    color: COLORS.primary,
    fontWeight: "500",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.s,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.xs,
    marginRight: SPACING.l,
  },
  actionText: {
    fontSize: FONT.sizes.s,
    color: COLORS.secondaryText,
    marginLeft: SPACING.xs,
  },
  activeText: {
    color: COLORS.primary,
    fontWeight: "500",
  },
  saveButton: {
    marginLeft: "auto",
    marginRight: 0,
  },
});

export default EventCard;
