import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList, Event } from "../types";
import { EventApi } from "../services/apiProvider";
import EventCard from "../components/EventCard";
import PullUpModal from "../components/PullUpModal";
import { COLORS, SPACING, FONT } from "../utils/theme";

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Main"
>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("all"); // 'all', 'public', 'private'

  // Modal state
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await EventApi.getEvents();
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  // Handle pull up from card (quick action)
  const handlePullUp = async (eventId: string) => {
    try {
      const updatedEvent = await EventApi.togglePullUp(eventId);
      setEvents(
        events.map((event) => (event.id === eventId ? updatedEvent : event))
      );
    } catch (error) {
      console.error("Failed to toggle pull up:", error);
    }
  };

  // Handle event press (show modal)
  const handleEventPress = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setModalVisible(true);
    }
  };

  // Handle modal pull up confirmation
  const handleModalPullUp = async (eventId: string, password?: string) => {
    try {
      // For private events, validate password
      if (
        selectedEvent?.isPrivate &&
        password !== selectedEvent.eventPassword
      ) {
        throw new Error("Invalid password");
      }

      const updatedEvent = await EventApi.togglePullUp(eventId);
      setEvents(
        events.map((event) => (event.id === eventId ? updatedEvent : event))
      );
    } catch (error) {
      throw error; // Re-throw to let modal handle the error
    }
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedEvent(null);
  };

  // Filter events
  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true;
    if (filter === "public") return !event.isPrivate;
    if (filter === "private") return event.isPrivate;
    return true;
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.title}>Pullup</Text>
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === "all" && styles.activeFilter]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "all" && styles.activeFilterText,
            ]}
          >
            All Events
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "public" && styles.activeFilter,
          ]}
          onPress={() => setFilter("public")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "public" && styles.activeFilterText,
            ]}
          >
            Public
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "private" && styles.activeFilter,
          ]}
          onPress={() => setFilter("private")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "private" && styles.activeFilterText,
            ]}
          >
            Private
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={handleEventPress}
              onPullUp={handlePullUp}
              userType="student"
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="calendar-outline"
                size={48}
                color={COLORS.secondaryText}
              />
              <Text style={styles.emptyText}>No events found</Text>
            </View>
          }
        />
      )}

      {/* Pull Up Modal */}
      <PullUpModal
        visible={modalVisible}
        event={selectedEvent}
        onClose={closeModal}
        onConfirm={handleModalPullUp}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT.sizes.xl,
    fontWeight: "700",
    color: COLORS.text,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    backgroundColor: COLORS.background,
  },
  filterButton: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    marginRight: SPACING.s,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilter: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONT.sizes.s,
    color: COLORS.text,
    fontWeight: "500",
  },
  activeFilterText: {
    color: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: SPACING.m,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: FONT.sizes.l,
    color: COLORS.secondaryText,
    marginTop: SPACING.m,
    textAlign: "center",
  },
});

export default HomeScreen;
