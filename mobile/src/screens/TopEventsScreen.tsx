import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList, Event } from "../types";
import { EventApi } from "../services/apiProvider";
import EventCard from "../components/EventCard";
import { COLORS, SPACING, FONT } from "../utils/theme";

type TopEventsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Main"
>;

const TopEventsScreen = () => {
  const navigation = useNavigation<TopEventsNavigationProp>();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeFilter, setTimeFilter] = useState<string>("all-time"); // 'all-time', 'month', 'week'

  // Fetch top events
  const fetchTopEvents = async () => {
    try {
      setLoading(true);
      // TODO: Need to pass time filter to API
      const allEvents = await EventApi.getEvents();

      // Sort by likes for MVP
      const sortedEvents = [...allEvents].sort((a, b) => b.likes - a.likes);
      setEvents(sortedEvents);
    } catch (error) {
      console.error("Failed to fetch top events:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle like
  const handleLike = async (eventId: string) => {
    try {
      const updatedEvent = await EventApi.toggleLike(eventId);
      setEvents(
        events.map((event) => (event.id === eventId ? updatedEvent : event))
      );
    } catch (error) {
      console.error("Failed to like:", error);
    }
  };

  // Handle save
  const handleSave = async (eventId: string) => {
    try {
      const updatedEvent = await EventApi.toggleSaved(eventId);
      setEvents(
        events.map((event) => (event.id === eventId ? updatedEvent : event))
      );
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  // Handle event press
  const handleEventPress = (eventId: string) => {
    navigation.navigate("EventDetails", { eventId });
  };

  useEffect(() => {
    fetchTopEvents();
  }, [timeFilter]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Top Events</Text>
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            timeFilter === "all-time" && styles.activeFilter,
          ]}
          onPress={() => setTimeFilter("all-time")}
        >
          <Text
            style={[
              styles.filterText,
              timeFilter === "all-time" && styles.activeFilterText,
            ]}
          >
            All-Time
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            timeFilter === "month" && styles.activeFilter,
          ]}
          onPress={() => setTimeFilter("month")}
        >
          <Text
            style={[
              styles.filterText,
              timeFilter === "month" && styles.activeFilterText,
            ]}
          >
            This Month
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            timeFilter === "week" && styles.activeFilter,
          ]}
          onPress={() => setTimeFilter("week")}
        >
          <Text
            style={[
              styles.filterText,
              timeFilter === "week" && styles.activeFilterText,
            ]}
          >
            This Week
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={styles.eventContainer}>
              <View style={styles.rankingBadge}>
                <Text style={styles.rankingNumber}>{index + 1}</Text>
              </View>
              <EventCard
                event={item}
                onPress={handleEventPress}
                onLike={handleLike}
                onSave={handleSave}
              />
            </View>
          )}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="trophy" size={48} color={COLORS.secondaryText} />
              <Text style={styles.emptyText}>No events found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.l,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  title: {
    fontSize: FONT.sizes.xl,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
  filtersContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: SPACING.m,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterButton: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.xs,
    marginHorizontal: SPACING.xs,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilter: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONT.sizes.s,
    fontWeight: "500",
    color: COLORS.secondaryText,
  },
  activeFilterText: {
    color: COLORS.card,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: SPACING.l,
  },
  eventContainer: {
    position: "relative",
    marginBottom: SPACING.l,
  },
  rankingBadge: {
    position: "absolute",
    top: -8,
    left: -8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  rankingNumber: {
    fontSize: FONT.sizes.m,
    fontWeight: "700",
    color: "#FFF",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT.sizes.m,
    color: COLORS.secondaryText,
    marginTop: SPACING.m,
  },
});

export default TopEventsScreen;
