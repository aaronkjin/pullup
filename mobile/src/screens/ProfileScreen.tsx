import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { COLORS, SPACING, FONT } from "../utils/theme";
import { mockUsers, mockEvents } from "../services/mockData";
import { RootStackParamList, Event } from "../types";

interface UserInfo {
  name?: string;
  picture?: string;
  email?: string;
}

interface ProfileScreenProps {
  userInfo: UserInfo | null;
}

type ProfileNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Main"
>;

// For demo, we're using the first user from mock data
// const currentUser = mockUsers[0];

const ProfileScreen = ({ userInfo }: ProfileScreenProps) => {
  const navigation = useNavigation<ProfileNavigationProp>();
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);

  // Refresh saved events when component mounts and whenever mockEvents changes
  useEffect(() => {
    const fetchSavedEvents = () => {
      const filteredSavedEvents = mockEvents.filter((event) => event.saved);
      setSavedEvents(filteredSavedEvents);
    };

    fetchSavedEvents();

    // Add navigation listener to refresh when screen is focused
    const unsubscribe = navigation.addListener("focus", () => {
      fetchSavedEvents();
    });

    return unsubscribe;
  }, [navigation]);

  const handleSavedEventPress = (eventId: string) => {
    navigation.navigate("EventDetails", { eventId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Profile</Text>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri:
                userInfo?.picture ||
                "https://randomuser.me/api/portraits/lego/1.jpg",
            }}
            style={styles.profileImage}
          />
          <Text style={styles.displayName}>
            {userInfo?.name || "User Name"}
          </Text>
          <Text style={styles.username}>
            @{userInfo?.email || "user.email"}
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>15</Text>
              <Text style={styles.statLabel}>Events Attended</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>7</Text>
              <Text style={styles.statLabel}>Wristbands</Text>
            </View>
          </View>
        </View>

        {/* Saved Events */}
        <View style={styles.savedEventsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved Events</Text>
            <Text style={styles.savedCount}>
              {savedEvents.length} event{savedEvents.length !== 1 ? "s" : ""}
            </Text>
          </View>

          {savedEvents.length > 0 ? (
            <FlatList
              data={savedEvents}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.savedEventCard}
                  onPress={() => handleSavedEventPress(item.id)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.savedEventImage}
                  />
                  <View style={styles.savedEventInfo}>
                    <Text style={styles.savedEventTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.savedEventDate} numberOfLines={1}>
                      {new Date(item.dateTime).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                    <View style={styles.savedEventMeta}>
                      <Icon
                        name="location"
                        size={12}
                        color={COLORS.secondaryText}
                      />
                      <Text style={styles.savedEventLocation} numberOfLines={1}>
                        {item.location}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No saved events yet</Text>
              }
              style={styles.savedEventsList}
            />
          ) : (
            <View style={styles.emptyStateContainer}>
              <Icon name="bookmark-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>No saved events yet</Text>
              <Text style={styles.emptySubtext}>
                Events you bookmark will appear here
              </Text>
            </View>
          )}
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity style={styles.settingItem}>
            <Icon name="person-outline" size={24} color={COLORS.text} />
            <Text style={styles.settingText}>Edit Profile</Text>
            <Icon
              name="chevron-forward"
              size={20}
              color={COLORS.secondaryText}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Icon name="notifications-outline" size={24} color={COLORS.text} />
            <Text style={styles.settingText}>Notifications</Text>
            <Icon
              name="chevron-forward"
              size={20}
              color={COLORS.secondaryText}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Icon name="shield-outline" size={24} color={COLORS.text} />
            <Text style={styles.settingText}>Privacy</Text>
            <Icon
              name="chevron-forward"
              size={20}
              color={COLORS.secondaryText}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Icon name="help-circle-outline" size={24} color={COLORS.text} />
            <Text style={styles.settingText}>Help & Support</Text>
            <Icon
              name="chevron-forward"
              size={20}
              color={COLORS.secondaryText}
            />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton}>
          <Icon name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Pullup v0.1.0</Text>
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
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  header: {
    padding: SPACING.l,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  screenTitle: {
    fontSize: FONT.sizes.xl,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
  profileSection: {
    alignItems: "center",
    padding: SPACING.l,
    backgroundColor: COLORS.card,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: SPACING.m,
  },
  displayName: {
    fontSize: FONT.sizes.xl,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  username: {
    fontSize: FONT.sizes.m,
    color: COLORS.secondaryText,
    marginBottom: SPACING.m,
  },
  statsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    paddingVertical: SPACING.m,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: FONT.sizes.l,
    fontWeight: "700",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: COLORS.border,
  },
  savedEventsSection: {
    marginTop: SPACING.m,
    paddingTop: SPACING.m,
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.m,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  sectionTitle: {
    fontSize: FONT.sizes.l,
    fontWeight: "700",
    color: COLORS.text,
  },
  savedCount: {
    fontSize: FONT.sizes.s,
    color: COLORS.secondaryText,
    fontWeight: "500",
  },
  savedEventsList: {
    marginLeft: -SPACING.s,
  },
  savedEventCard: {
    width: 150,
    marginRight: SPACING.m,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  savedEventImage: {
    width: "100%",
    height: 100,
  },
  savedEventInfo: {
    padding: SPACING.s,
  },
  savedEventTitle: {
    fontSize: FONT.sizes.s,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  savedEventDate: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
  },
  savedEventMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.xs / 2,
  },
  savedEventLocation: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
    marginLeft: 4,
    flex: 1,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.secondaryText,
    fontSize: FONT.sizes.s,
    marginTop: SPACING.s,
    fontWeight: "600",
  },
  emptySubtext: {
    textAlign: "center",
    color: COLORS.secondaryText,
    fontSize: FONT.sizes.xs,
    marginTop: SPACING.xs,
  },
  settingsSection: {
    marginTop: SPACING.m,
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingText: {
    flex: 1,
    fontSize: FONT.sizes.m,
    color: COLORS.text,
    marginLeft: SPACING.m,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    marginHorizontal: SPACING.l,
    marginTop: SPACING.l,
    paddingVertical: SPACING.m,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  signOutText: {
    fontSize: FONT.sizes.m,
    color: COLORS.error,
    fontWeight: "600",
    marginLeft: SPACING.xs,
  },
  appInfo: {
    alignItems: "center",
    marginTop: SPACING.l,
  },
  appVersion: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
  },
});

export default ProfileScreen;
