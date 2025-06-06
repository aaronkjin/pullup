import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

import { RootStackParamList, Event } from "../types";
import { COLORS, SPACING, FONT } from "../utils/theme";
import { EventApi } from "../services/apiProvider";

type EventDetailsRouteProp = RouteProp<RootStackParamList, "EventDetails">;
type EventDetailsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "EventDetails"
>;

interface Attendee {
  id: string;
  name: string;
  email: string;
  checkedIn: boolean;
}

const EventDetailsScreen = () => {
  const route = useRoute<EventDetailsRouteProp>();
  const navigation = useNavigation<EventDetailsNavigationProp>();
  const { event } = route.params;

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(true);
  const [isPasswordCopied, setIsPasswordCopied] = useState(false);

  // Set header title
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: event.title,
    });
  }, [navigation, event.title]);

  // Fetch attendees when component mounts
  React.useEffect(() => {
    const fetchAttendees = async () => {
      try {
        setIsLoadingAttendees(true);
        console.log("Fetching attendees for event:", event.id);

        const eventAttendees = await EventApi.getEventAttendees(event.id);
        console.log("Fetched attendees:", eventAttendees);

        setAttendees(eventAttendees);
      } catch (error) {
        console.error("Error fetching attendees:", error);
        Alert.alert("Error", "Failed to load attendees");
      } finally {
        setIsLoadingAttendees(false);
      }
    };

    fetchAttendees();
  }, [event.id]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
    const timePart = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${datePart} at ${timePart}`;
  };

  const handleCheckIn = async (attendeeId: string) => {
    // Find the attendee to get their current status
    const attendee = attendees.find((a) => a.id === attendeeId);
    if (!attendee) return;

    const newCheckedInStatus = !attendee.checkedIn;

    // Optimistic UI update
    setAttendees((prevAttendees) =>
      prevAttendees.map((a) =>
        a.id === attendeeId ? { ...a, checkedIn: newCheckedInStatus } : a
      )
    );

    try {
      // Make API call to update registration status
      await EventApi.updateAttendeeRegistration(
        attendeeId,
        event.id,
        newCheckedInStatus
      );
      console.log(
        `Successfully updated registration status for attendee ${attendeeId} to ${newCheckedInStatus}`
      );
    } catch (error) {
      console.error("Error updating attendee registration:", error);

      // Revert optimistic update on error
      setAttendees((prevAttendees) =>
        prevAttendees.map((a) =>
          a.id === attendeeId
            ? { ...a, checkedIn: !newCheckedInStatus } // Revert back
            : a
        )
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update registration status";
      Alert.alert("Error", errorMessage);
    }
  };

  const handleCopyPassword = async () => {
    if (event.eventPassword) {
      await Clipboard.setStringAsync(event.eventPassword);
      setIsPasswordCopied(true);
      setTimeout(() => setIsPasswordCopied(false), 2000);
    }
  };

  const handleDeleteEvent = () => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Make API call to delete event from server
              await EventApi.deleteEvent(event.id);

              Alert.alert("Success", "Event deleted successfully", [
                {
                  text: "OK",
                  onPress: () => navigation.goBack(),
                },
              ]);
              console.log("Event deleted successfully:", event.id);
            } catch (error) {
              console.error("Error deleting event:", error);

              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Failed to delete event";
              Alert.alert("Error", errorMessage);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {event.imageUrl && (
          <Image
            source={{ uri: event.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <View style={styles.contentContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>{event.title}</Text>
              <View style={styles.organizerContainer}>
                <Image
                  source={{ uri: event.organizerImageUrl }}
                  style={styles.organizerImage}
                />
                <Text style={styles.organizerName}>{event.organizerName}</Text>
              </View>
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

          {/* Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={COLORS.secondaryText}
              />
              <Text style={styles.detailText}>
                {formatDate(event.dateTime)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color={COLORS.secondaryText}
              />
              <Text style={styles.detailText}>{event.location}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.description}>{event.description}</Text>

          {/* Event Password */}
          {event.isPrivate && event.eventPassword && (
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

          {/* Divider */}
          <View style={styles.divider} />

          {/* Attendees */}
          <View style={styles.attendeesSection}>
            <View style={styles.attendeesHeader}>
              <Text style={styles.sectionTitle}>Attendees</Text>
              <View style={styles.pullUpIndicator}>
                <Ionicons name="people" size={18} color={COLORS.primary} />
                <Text style={styles.pullUpCount}>{attendees.length}</Text>
                <Text style={styles.pullUpText}>pulling up</Text>
              </View>
            </View>

            {isLoadingAttendees ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading attendees...</Text>
              </View>
            ) : attendees.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="people-outline"
                  size={48}
                  color={COLORS.secondaryText}
                />
                <Text style={styles.emptyText}>No attendees yet</Text>
                <Text style={styles.emptySubtext}>
                  Let's get this party started!
                </Text>
              </View>
            ) : (
              attendees.map((attendee) => (
                <TouchableOpacity
                  key={attendee.id}
                  style={styles.attendeeRow}
                  onPress={() => handleCheckIn(attendee.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.attendeeInfo}>
                    <Text
                      style={[
                        styles.attendeeName,
                        attendee.checkedIn && styles.attendeeNameCheckedIn,
                      ]}
                    >
                      {attendee.name}
                    </Text>
                    {attendee.email && (
                      <Text style={styles.attendeeEmail}>{attendee.email}</Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.checkInCircle,
                      attendee.checkedIn && styles.checkInCircleChecked,
                    ]}
                  >
                    {attendee.checkedIn && (
                      <Ionicons name="checkmark" size={16} color="#FFF" />
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Delete Button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteEvent}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            <Text style={styles.deleteButtonText}>Delete Event</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  image: {
    width: "100%",
    height: 220,
  },
  contentContainer: {
    padding: SPACING.l,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.m,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: SPACING.s,
  },
  title: {
    fontSize: FONT.sizes.xxl,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  organizerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  organizerImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: SPACING.s,
  },
  organizerName: {
    fontSize: FONT.sizes.m,
    color: COLORS.secondaryText,
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
  detailsSection: {
    marginBottom: SPACING.l,
    padding: SPACING.m,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.s,
  },
  detailText: {
    fontSize: FONT.sizes.m,
    color: COLORS.text,
    marginLeft: SPACING.m,
  },
  description: {
    fontSize: FONT.sizes.m,
    color: COLORS.secondaryText,
    lineHeight: 24,
    marginBottom: SPACING.l,
  },
  passwordSection: {
    backgroundColor: "#F0F7FF",
    padding: SPACING.m,
    borderRadius: 12,
    marginBottom: SPACING.l,
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
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.l,
  },
  attendeesSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT.sizes.l,
    fontWeight: "bold",
    color: COLORS.text,
  },
  attendeesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  pullUpIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F7FF",
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pullUpCount: {
    fontSize: FONT.sizes.s,
    fontWeight: "700",
    color: COLORS.primary,
    marginLeft: SPACING.s,
  },
  pullUpText: {
    fontSize: FONT.sizes.s,
    color: COLORS.secondaryText,
    marginLeft: SPACING.s,
  },
  attendeeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    fontSize: FONT.sizes.m,
    color: COLORS.text,
  },
  attendeeNameCheckedIn: {
    textDecorationLine: "line-through",
    color: COLORS.secondaryText,
  },
  attendeeEmail: {
    fontSize: FONT.sizes.s,
    color: COLORS.secondaryText,
  },
  checkInCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  checkInCircleChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  loadingContainer: {
    paddingVertical: SPACING.xl,
    alignItems: "center",
  },
  loadingText: {
    fontSize: FONT.sizes.m,
    color: COLORS.secondaryText,
  },
  emptyContainer: {
    paddingVertical: SPACING.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: FONT.sizes.l,
    fontWeight: "600",
    color: COLORS.secondaryText,
    marginTop: SPACING.m,
    marginBottom: SPACING.s,
  },
  emptySubtext: {
    fontSize: FONT.sizes.m,
    color: COLORS.secondaryText,
    textAlign: "center",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.m,
    borderRadius: 12,
    backgroundColor: COLORS.lightRed,
    marginTop: SPACING.l,
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: FONT.sizes.m,
    fontWeight: "600",
    marginLeft: SPACING.s,
  },
});

export default EventDetailsScreen;
