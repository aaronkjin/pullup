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

  // Handle save/bookmark
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
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color={COLORS.text} />
        </TouchableOpacity>
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
              onLike={handleLike}
              onSave={handleSave}
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
  },
  title: {
    fontSize: FONT.sizes.xxl,
    fontWeight: "700",
    color: COLORS.text,
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.l,
    marginBottom: SPACING.m,
  },
  filterButton: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.s,
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
  listContainer: {
    padding: SPACING.l,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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

export default HomeScreen;
