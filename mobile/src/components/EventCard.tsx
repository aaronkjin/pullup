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
  onPullUp?: (eventId: string) => void;
  userType?: "student" | "organization";
}

const { width } = Dimensions.get("window");

const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  onPullUp,
  userType = "student",
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

        {/* Pull up counter and action */}
        <View style={styles.actionsContainer}>
          {/* Pull Up Counter */}
          <View style={styles.pullUpContainer}>
            <Ionicons name="person" size={20} color={COLORS.primary} />
            <Text style={styles.pullUpCount}>{event.pullUpCount}</Text>
            <Text style={styles.pullUpText}>pulling up</Text>
          </View>

          {/* Pull Up Button (only for students) */}
          {userType === "student" && onPullUp && (
            <TouchableOpacity
              style={[
                styles.pullUpButton,
                event.userPulledUp && styles.pullUpButtonActive,
                event.isPrivate &&
                  !event.userPulledUp &&
                  styles.pullUpButtonDisabled,
              ]}
              onPress={() => {
                if (!event.isPrivate) {
                  onPullUp(event.id);
                }
              }}
              disabled={event.isPrivate && !event.userPulledUp}
            >
              <Ionicons
                name={
                  event.isPrivate && !event.userPulledUp
                    ? "lock-closed"
                    : event.userPulledUp
                    ? "checkmark"
                    : "add"
                }
                size={16}
                color={
                  event.isPrivate && !event.userPulledUp
                    ? COLORS.secondaryText
                    : event.userPulledUp
                    ? COLORS.background
                    : COLORS.primary
                }
              />
              <Text
                style={[
                  styles.pullUpButtonText,
                  event.userPulledUp && styles.pullUpButtonTextActive,
                  event.isPrivate &&
                    !event.userPulledUp &&
                    styles.pullUpButtonTextDisabled,
                ]}
              >
                {event.isPrivate && !event.userPulledUp
                  ? "Locked"
                  : event.userPulledUp
                  ? "Going"
                  : "Pull Up"}
              </Text>
            </TouchableOpacity>
          )}
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
    marginBottom: SPACING.m,
  },
  location: {
    fontSize: FONT.sizes.s,
    color: COLORS.secondaryText,
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pullUpContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pullUpCount: {
    fontSize: FONT.sizes.s,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 4,
  },
  pullUpText: {
    fontSize: FONT.sizes.s,
    color: COLORS.secondaryText,
    marginLeft: 4,
  },
  pullUpButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: 20,
  },
  pullUpButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pullUpButtonDisabled: {
    backgroundColor: "#F8F8F8",
    borderColor: "#F8F8F8",
  },
  pullUpButtonText: {
    fontSize: FONT.sizes.s,
    fontWeight: "600",
    color: COLORS.primary,
    marginLeft: 4,
  },
  pullUpButtonTextActive: {
    color: COLORS.background,
  },
  pullUpButtonTextDisabled: {
    color: COLORS.secondaryText,
  },
});

export default EventCard;
