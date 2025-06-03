import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/Ionicons";

import { RootStackParamList, Event } from "../types";
import { EventApi } from "../services/apiProvider";
import { COLORS, SPACING, FONT } from "../utils/theme";

type EventDetailsRouteProp = RouteProp<RootStackParamList, "EventDetails">;
type EventDetailsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "EventDetails"
>;

const EventDetailsScreen = () => {
  const route = useRoute<EventDetailsRouteProp>();
  const navigation = useNavigation<EventDetailsNavigationProp>();
  const { eventId } = route.params;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch event details
  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      console.log("Fetching event details for eventId:", eventId);
      const eventData = await EventApi.getEventById(eventId);
      console.log("Received event data:", eventData);
      setEvent(eventData);

      // Set header title
      if (eventData) {
        navigation.setOptions({
          title: eventData.title,
        });
      }
    } catch (error) {
      console.error("Failed to fetch event details:", error);
      console.error("EventId that failed:", eventId);
      // Log the route params to debug
      console.error("Route params:", route.params);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to QR wristband screen
  const handleGetWristband = () => {
    navigation.navigate("QRWristband", { eventId });
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Event not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Event Image */}
        {event.imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: event.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            {event.isPrivate && (
              <View style={styles.privateBadge}>
                <Icon name="lock-closed" size={12} color="#FFF" />
                <Text style={styles.privateBadgeText}>Private Event</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.contentContainer}>
          {/* Event Header */}
          <View style={styles.headerContainer}>
            <View style={styles.organizerContainer}>
              <Image
                source={{ uri: event.organizerImageUrl }}
                style={styles.organizerImage}
              />
              <Text style={styles.organizerName}>{event.organizerName}</Text>
            </View>

            <Text style={styles.title}>{event.title}</Text>

            <View style={styles.detailRow}>
              <Icon name="calendar" size={18} color={COLORS.secondaryText} />
              <Text style={styles.detailText}>
                {formatDate(event.dateTime)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="location" size={18} color={COLORS.secondaryText} />
              <Text style={styles.detailText}>{event.location}</Text>
            </View>

            {event.isPrivate && (
              <View style={styles.privateContainer}>
                <Icon name="lock-closed" size={16} color={COLORS.primary} />
                <Text style={styles.privateText}>Private Event</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Pull Up Info */}
          <View style={styles.pullUpContainer}>
            <Icon name="person" size={20} color={COLORS.primary} />
            <Text style={styles.pullUpCount}>{event.pullUpCount}</Text>
            <Text style={styles.pullUpText}>people pulling up</Text>
          </View>

          {/* Action - Share only */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => {
                // TODO: Implement share functionality
                console.log("Share event:", event.id);
              }}
            >
              <Icon
                name="share-social-outline"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.shareButtonText}>Share Event</Text>
            </TouchableOpacity>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: FONT.sizes.l,
    color: COLORS.error,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 250,
  },
  privateBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
  },
  privateBadgeText: {
    color: "#FFF",
    fontSize: FONT.sizes.xs,
    fontWeight: "600",
    marginLeft: 4,
  },
  contentContainer: {
    padding: SPACING.l,
  },
  headerContainer: {
    marginBottom: SPACING.l,
  },
  organizerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.s,
  },
  organizerImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.xs,
  },
  organizerName: {
    fontSize: FONT.sizes.s,
    fontWeight: "500",
    color: COLORS.secondaryText,
  },
  title: {
    fontSize: FONT.sizes.xxl,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.m,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  detailText: {
    fontSize: FONT.sizes.s,
    color: COLORS.secondaryText,
    marginLeft: SPACING.xs,
  },
  privateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F7FF",
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: SPACING.s,
  },
  privateText: {
    fontSize: FONT.sizes.xs,
    color: COLORS.primary,
    fontWeight: "500",
  },
  descriptionContainer: {
    marginBottom: SPACING.l,
  },
  sectionTitle: {
    fontSize: FONT.sizes.l,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  description: {
    fontSize: FONT.sizes.m,
    color: COLORS.text,
    lineHeight: 24,
  },
  pullUpContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.l,
  },
  pullUpCount: {
    fontSize: FONT.sizes.m,
    fontWeight: "600",
    color: COLORS.secondaryText,
    marginLeft: SPACING.xs,
  },
  pullUpText: {
    fontSize: FONT.sizes.s,
    color: COLORS.secondaryText,
    marginLeft: SPACING.xs,
  },
  actionsContainer: {
    marginBottom: SPACING.l,
    paddingBottom: SPACING.l,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  shareButtonText: {
    fontSize: FONT.sizes.s,
    fontWeight: "600",
    color: "#FFF",
    marginLeft: SPACING.xs,
  },
});

export default EventDetailsScreen;
