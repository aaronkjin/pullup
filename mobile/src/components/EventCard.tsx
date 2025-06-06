import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  GestureResponderEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Event } from "../types";
import { COLORS, SPACING, FONT } from "../utils/theme";

interface EventCardProps {
  event: Event;
  onPress: (eventId: string) => void;
  onPullUp?: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
  userType?: "student" | "organization";
}

const { width } = Dimensions.get("window");

const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  onPullUp,
  onDelete,
  userType = "student",
}) => {
  const [isPasswordCopied, setIsPasswordCopied] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCopyPassword = async () => {
    if (event.eventPassword) {
      try {
        await Clipboard.setStringAsync(event.eventPassword);
        setIsPasswordCopied(true);

        setTimeout(() => {
          setIsPasswordCopied(false);
        }, 2000);
      } catch (error) {
        Alert.alert("Error", "Failed to copy password to clipboard");
      }
    }
  };

  const handleDeleteEvent = () => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          if (onDelete) {
            onDelete(event.id);
          }
        },
      },
    ]);
  };

  const onDeletePress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    handleDeleteEvent();
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
        {/* Header with org info and actions */}
        <View style={styles.header}>
          <View style={styles.orgContainer}>
            <Image
              source={{ uri: event.organizerImageUrl }}
              style={styles.orgImage}
            />
            <View style={styles.orgInfo}>
              <Text style={styles.orgName}>{event.organizerName}</Text>
              <Text style={styles.date}>{formatDate(event.dateTime)}</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
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
        </View>

        {/* Event Content */}
        <View style={styles.contentSection}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {event.description}
          </Text>

          {/* Location */}
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color={COLORS.secondaryText} />
            <Text style={styles.location}>{event.location}</Text>
          </View>
        </View>

        {/* Event Password Section */}
        {event.isPrivate &&
          userType === "organization" &&
          event.eventPassword && (
            <TouchableOpacity
              style={[
                styles.passwordSection,
                isPasswordCopied && styles.passwordSectionCopied,
              ]}
              onPress={handleCopyPassword}
              activeOpacity={0.8}
            >
              <View style={styles.passwordHeader}>
                <Ionicons
                  name="key-outline"
                  size={16}
                  color={isPasswordCopied ? "#059669" : COLORS.primary}
                />
                <Text style={styles.passwordLabel}>Event Password</Text>
              </View>
              <View style={styles.passwordContainer}>
                <Text
                  style={[
                    styles.passwordText,
                    isPasswordCopied && styles.passwordTextCopied,
                  ]}
                >
                  {event.eventPassword}
                </Text>
                {isPasswordCopied && (
                  <View style={styles.copiedIndicator}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#059669"
                    />
                    <Text style={styles.copiedText}>Copied!</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}

        {/* Footer Actions */}
        <View style={styles.footer}>
          {/* Pull Up Counter */}
          <View style={styles.pullUpContainer}>
            <View style={styles.pullUpIndicator}>
              <Ionicons name="people" size={18} color={COLORS.primary} />
              <Text style={styles.pullUpCount}>{event.pullUpCount}</Text>
            </View>
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

          {/* Delete Button for organizations */}
          {userType === "organization" && onDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={onDeletePress}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={16} color="#DC2626" />
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
    position: "relative",
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
    justifyContent: "space-between",
    marginBottom: SPACING.m,
  },
  orgContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    marginRight: SPACING.s,
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.s,
  },
  privateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: 8,
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
    backgroundColor: "#F8F9FA",
    paddingHorizontal: SPACING.s,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  location: {
    fontSize: FONT.sizes.s,
    color: COLORS.secondaryText,
    marginLeft: 6,
  },
  passwordSection: {
    backgroundColor: "#F0F7FF",
    padding: SPACING.m,
    borderRadius: 12,
    marginBottom: SPACING.m,
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  passwordSectionCopied: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  passwordHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.s,
  },
  passwordLabel: {
    fontSize: FONT.sizes.s,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 6,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  passwordText: {
    fontSize: FONT.sizes.m,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 1.5,
    fontFamily: "monospace",
  },
  passwordTextCopied: {
    color: "#059669",
  },
  copiedIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  copiedText: {
    fontSize: FONT.sizes.s,
    fontWeight: "600",
    color: "#059669",
    marginLeft: 4,
  },
  contentSection: {
    marginBottom: SPACING.m,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: SPACING.s,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  pullUpContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pullUpIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F7FF",
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: SPACING.s,
  },
  pullUpCount: {
    fontSize: FONT.sizes.s,
    fontWeight: "700",
    color: COLORS.primary,
    marginLeft: 4,
  },
  pullUpText: {
    fontSize: FONT.sizes.s,
    color: COLORS.secondaryText,
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
    borderColor: COLORS.border,
  },
  pullUpButtonText: {
    fontSize: FONT.sizes.s,
    color: COLORS.primary,
    fontWeight: "600",
    marginLeft: 4,
  },
  pullUpButtonTextActive: {
    color: COLORS.background,
  },
  pullUpButtonTextDisabled: {
    color: COLORS.secondaryText,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default EventCard;
