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
import SettingsModal from "../components/SettingsModal";
import { COLORS, SPACING, FONT } from "../utils/theme";
import { useUser } from "../contexts/UserContext";
import { AuthTokenManager } from "../config/api";

type MyEventsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Main"
>;

const MyEventsScreen = () => {
  const navigation = useNavigation<MyEventsScreenNavigationProp>();
  const { userInfo, logout } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Settings modal state
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const userType = userInfo?.userType || "student";

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      // For students: get their registered events
      // For organizations: get their created events
      if (userType === "student") {
        // Extract student_id from auth token
        const token = await AuthTokenManager.getToken();
        console.log("Current auth token:", token);

        if (token && token.startsWith("student_")) {
          // Parse token format: student_${student_id}_${timestamp}
          const parts = token.split("_");
          if (parts.length >= 2) {
            const studentId = parseInt(parts[1]);
            console.log("Extracted student_id:", studentId);

            if (!isNaN(studentId)) {
              const data = await EventApi.getUserEvents(studentId);
              setEvents(data);
              return;
            }
          }
        }

        console.log(
          "Could not extract valid student_id from token, using empty array"
        );
        setEvents([]);
      } else {
        const data = await EventApi.getOrganizationEvents();
        setEvents(data);
      }
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

  // Handle pull up (for students viewing their registered events)
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

  // Handle event press
  const handleEventPress = (eventId: string) => {
    if (userType === "organization") {
      // Organizations navigate to detailed event management screen
      navigation.navigate("EventDetails", { eventId });
    } else {
      // Students see modal (to be implemented)
      console.log("Show student event modal for:", eventId);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const renderEmptyState = () => {
    const emptyMessage =
      userType === "student"
        ? "Pull up to an event!"
        : "Create your first event!";

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name={
            userType === "student" ? "calendar-outline" : "add-circle-outline"
          }
          size={48}
          color={COLORS.secondaryText}
        />
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.title}>My Events</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setSettingsModalVisible(true)}
        >
          <Ionicons name="settings-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={handleEventPress}
              onPullUp={userType === "student" ? handlePullUp : undefined}
              userType={userType}
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
          ListEmptyComponent={renderEmptyState}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        onLogout={handleLogout}
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
  settingsButton: {
    padding: SPACING.xs,
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

export default MyEventsScreen;
