import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import { EventApi } from "../services/apiProvider";
import { AuthTokenManager } from "../config/api";
import { COLORS, SPACING, FONT } from "../utils/theme";

const EVENT_IMAGE_CAROUSEL = [
  "https://images.unsplash.com/photo-1508302882073-8af6be4c6688?q=80&w=2971&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1619139079319-ba9ff149a8c2?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1632988663082-4bac2c1847a0?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1685410613011-23d2794971a7?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1564343656448-37fa0e1c324f?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1624565930667-e62d3beb8725?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1676768310070-f71e44192000?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1682795407633-648756ba31dd?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1669003950464-d1971232d363?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1676768308394-a6fa0ae18184?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1685645103851-6518d54f0bd3?q=80&w=2971&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1566549721958-6142e5d00b71?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1718431978455-4ede1707322b?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1705199540072-16ded0003316?q=80&w=2972&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1691280001563-37a0075cacd4?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1591674135614-4bf1f584565b?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1694570682052-14a740b3f8ca?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1634794369442-628315d82777?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1458682760028-07c9d41d0cd1?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

const CreateEventScreen = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  // Date/Time state
  const [isAllDay, setIsAllDay] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 60 * 60 * 1000)); // 1 hr later
  const [activePicker, setActivePicker] = useState<
    "startDate" | "startTime" | "endDate" | "endTime" | null
  >(null);

  const [isPrivate, setIsPrivate] = useState(false);
  const [eventPassword, setEventPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format date for backend (MM/DD/YYYY)
  const formatDateForBackend = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Format time for backend (HH:MM AM/PM)
  const formatTimeForBackend = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Picker visibility with toggle behavior
  const togglePicker = (
    pickerType: "startDate" | "startTime" | "endDate" | "endTime"
  ) => {
    if (activePicker === pickerType) {
      setActivePicker(null);
    } else {
      setActivePicker(pickerType);
    }
  };

  // Date/time picker changes
  const onStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setActivePicker(null);
    }
    if (selectedDate) {
      setStartDate(selectedDate);
      // If end date is before start date, update it
      if (selectedDate > endDate) {
        setEndDate(new Date(selectedDate.getTime() + 60 * 60 * 1000));
      }
    }
  };

  const onStartTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setActivePicker(null);
    }
    if (selectedDate) {
      const newStartDate = new Date(startDate);
      newStartDate.setHours(selectedDate.getHours());
      newStartDate.setMinutes(selectedDate.getMinutes());
      setStartDate(newStartDate);

      // If end time is before start time on same day, update it
      if (
        formatDate(newStartDate) === formatDate(endDate) &&
        newStartDate >= endDate
      ) {
        const newEndDate = new Date(newStartDate.getTime() + 60 * 60 * 1000);
        setEndDate(newEndDate);
      }
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setActivePicker(null);
    }
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setActivePicker(null);
    }
    if (selectedDate) {
      const newEndDate = new Date(endDate);
      newEndDate.setHours(selectedDate.getHours());
      newEndDate.setMinutes(selectedDate.getMinutes());
      setEndDate(newEndDate);
    }
  };

  // All-day toggle
  const handleAllDayToggle = (value: boolean) => {
    setIsAllDay(value);
    setActivePicker(null);
    if (value) {
      const newStartDate = new Date(startDate);
      newStartDate.setHours(0, 0, 0, 0);
      setStartDate(newStartDate);

      const newEndDate = new Date(endDate);
      newEndDate.setHours(23, 59, 59, 999);
      setEndDate(newEndDate);
    }
  };

  // Generate random password for private events
  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEventPassword(result);
  };

  // Auto-generate password when private is toggled on
  const handlePrivateToggle = (value: boolean) => {
    setIsPrivate(value);
    if (value && !eventPassword) {
      generatePassword();
    } else if (!value) {
      setEventPassword("");
    }
  };

  // Handle create event
  const handleCreateEvent = async () => {
    if (!title || !description || !location) {
      Alert.alert(
        "Missing Information",
        "Please fill in all the required fields."
      );
      return;
    }

    if (isPrivate && !eventPassword) {
      Alert.alert(
        "Password Required",
        "Please generate a password for the private event."
      );
      return;
    }

    try {
      setLoading(true);

      // Extract org_id from auth token
      const token = await AuthTokenManager.getToken();
      console.log("Current auth token for event creation:", token);

      if (!token || !token.startsWith("org_")) {
        Alert.alert(
          "Error",
          "You must be logged in as an organization to create events."
        );
        return;
      }

      // Parse token format: org_${org_id}_${timestamp}
      const parts = token.split("_");
      if (parts.length < 2) {
        Alert.alert(
          "Error",
          "Invalid authentication token. Please log in again."
        );
        return;
      }

      const orgId = parseInt(parts[1]);
      if (isNaN(orgId)) {
        Alert.alert("Error", "Invalid organization ID. Please log in again.");
        return;
      }

      console.log("Extracted org_id for event creation:", orgId);

      const randomImageUrl =
        EVENT_IMAGE_CAROUSEL[
          Math.floor(Math.random() * EVENT_IMAGE_CAROUSEL.length)
        ];

      // Format date and time for backend
      const eventDate = formatDateForBackend(startDate);
      const eventTime = isAllDay ? "All Day" : formatTimeForBackend(startDate);

      // Prepare event data
      const eventData = {
        org_id: orgId,
        name: title,
        event_date: eventDate,
        event_time: eventTime,
        location,
        description,
        image_url: randomImageUrl,
        is_public: !isPrivate,
        passcode: isPrivate ? eventPassword : undefined,
      };

      console.log("Creating event with data:", eventData);
      console.log("Data types:", {
        org_id: typeof eventData.org_id,
        name: typeof eventData.name,
        event_date: typeof eventData.event_date,
        event_time: typeof eventData.event_time,
        location: typeof eventData.location,
        description: typeof eventData.description,
        image_url: typeof eventData.image_url,
        is_public: typeof eventData.is_public,
        passcode: typeof eventData.passcode,
      });
      console.log("Data values:", eventData);

      const createdEvent = await EventApi.createEvent(eventData);

      console.log("Event creation response:", createdEvent);

      // Reset form
      setTitle("");
      setDescription("");
      setLocation("");
      setIsAllDay(false);
      setStartDate(new Date());
      setEndDate(new Date(Date.now() + 60 * 60 * 1000));
      setIsPrivate(false);
      setEventPassword("");

      console.log(
        "Success",
        `Event created successfully! Event ID: ${createdEvent.id}`
      );
      navigation.goBack();
    } catch (error: any) {
      console.error("Failed to create event:", error);
      let errorMessage = "Failed to create event. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Event</Text>
          <Text style={styles.subtitle}>
            Share your organization's upcoming events with the Stanford
            community
          </Text>
        </View>

        {/* Form fields */}
        <View style={styles.formContainer}>
          {/* Title */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Event Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter a catchy title"
              placeholderTextColor={COLORS.secondaryText}
            />
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your event in detail"
              placeholderTextColor={COLORS.secondaryText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Location */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g., Tressider Union"
              placeholderTextColor={COLORS.secondaryText}
            />
          </View>

          {/* Date and Time Section */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Date and Time *</Text>

            {/* All-day toggle */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>All-day</Text>
              <Switch
                value={isAllDay}
                onValueChange={handleAllDayToggle}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.background}
              />
            </View>

            {/* Start Date/Time */}
            <View style={styles.dateTimeRow}>
              <Text style={styles.dateTimeLabel}>Starts</Text>

              <TouchableOpacity
                style={[
                  styles.dateTimeButton,
                  styles.dateTimeButtonFlex,
                  activePicker === "startDate" && styles.dateTimeButtonActive,
                ]}
                onPress={() => togglePicker("startDate")}
              >
                <Text
                  style={[
                    styles.dateTimeText,
                    activePicker === "startDate" && styles.dateTimeTextActive,
                  ]}
                >
                  {formatDate(startDate)}
                </Text>
              </TouchableOpacity>

              {!isAllDay && (
                <TouchableOpacity
                  style={[
                    styles.dateTimeButton,
                    styles.dateTimeButtonFlex,
                    activePicker === "startTime" && styles.dateTimeButtonActive,
                  ]}
                  onPress={() => togglePicker("startTime")}
                >
                  <Text
                    style={[
                      styles.dateTimeText,
                      activePicker === "startTime" && styles.dateTimeTextActive,
                    ]}
                  >
                    {formatTime(startDate)}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* End Date/Time */}
            <View style={styles.dateTimeRow}>
              <Text style={styles.dateTimeLabel}>Ends</Text>

              <TouchableOpacity
                style={[
                  styles.dateTimeButton,
                  styles.dateTimeButtonFlex,
                  activePicker === "endDate" && styles.dateTimeButtonActive,
                ]}
                onPress={() => togglePicker("endDate")}
              >
                <Text
                  style={[
                    styles.dateTimeText,
                    activePicker === "endDate" && styles.dateTimeTextActive,
                  ]}
                >
                  {formatDate(endDate)}
                </Text>
              </TouchableOpacity>

              {!isAllDay && (
                <TouchableOpacity
                  style={[
                    styles.dateTimeButton,
                    styles.dateTimeButtonFlex,
                    activePicker === "endTime" && styles.dateTimeButtonActive,
                  ]}
                  onPress={() => togglePicker("endTime")}
                >
                  <Text
                    style={[
                      styles.dateTimeText,
                      activePicker === "endTime" && styles.dateTimeTextActive,
                    ]}
                  >
                    {formatTime(endDate)}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Single Date/Time Picker Container */}
            {activePicker && (
              <View style={styles.pickerContainer}>
                {activePicker === "startDate" && (
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onStartDateChange}
                    minimumDate={new Date()}
                    style={styles.picker}
                    textColor={COLORS.text}
                    accentColor={COLORS.primary}
                  />
                )}

                {activePicker === "startTime" && (
                  <DateTimePicker
                    value={startDate}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onStartTimeChange}
                    style={styles.picker}
                    textColor={COLORS.text}
                    accentColor={COLORS.primary}
                  />
                )}

                {activePicker === "endDate" && (
                  <DateTimePicker
                    value={endDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onEndDateChange}
                    minimumDate={startDate}
                    style={styles.picker}
                    textColor={COLORS.text}
                    accentColor={COLORS.primary}
                  />
                )}

                {activePicker === "endTime" && (
                  <DateTimePicker
                    value={endDate}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onEndTimeChange}
                    style={styles.picker}
                    textColor={COLORS.text}
                    accentColor={COLORS.primary}
                  />
                )}
              </View>
            )}
          </View>

          {/* Privacy Setting */}
          <View style={styles.formGroup}>
            <View style={styles.switchContainer}>
              <View>
                <Text style={styles.label}>Private Event</Text>
                <Text style={styles.switchSubtext}>
                  Require password for access
                </Text>
              </View>
              <Switch
                value={isPrivate}
                onValueChange={handlePrivateToggle}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.background}
              />
            </View>
          </View>

          {/* Password Generation for Private Events */}
          {isPrivate && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Event Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={eventPassword}
                  onChangeText={setEventPassword}
                  placeholder="Generated password"
                  placeholderTextColor={COLORS.secondaryText}
                />
                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={generatePassword}
                >
                  <Ionicons name="refresh" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.passwordNote}>
                Share this password with invited guests. They'll need it to pull
                up to your event.
              </Text>
            </View>
          )}
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, loading && styles.disabledButton]}
          onPress={handleCreateEvent}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <Text style={styles.createButtonText}>Create Event</Text>
          )}
        </TouchableOpacity>
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
    padding: SPACING.m,
    paddingBottom: 100,
  },
  header: {
    marginBottom: SPACING.l,
  },
  title: {
    fontSize: FONT.sizes.xxl,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT.sizes.s,
    color: COLORS.secondaryText,
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: SPACING.l,
  },
  formGroup: {
    marginBottom: SPACING.l,
  },
  label: {
    fontSize: FONT.sizes.s,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    fontSize: FONT.sizes.s,
    color: COLORS.text,
    backgroundColor: COLORS.card,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  switchLabel: {
    fontSize: FONT.sizes.s,
    color: COLORS.text,
    fontWeight: "500",
  },
  switchSubtext: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.s,
    gap: SPACING.s,
  },
  dateTimeLabel: {
    fontSize: FONT.sizes.s,
    color: COLORS.text,
    width: 50,
    fontWeight: "500",
  },
  dateTimeButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    minWidth: 100,
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateTimeButtonFlex: {
    flex: 1,
    minWidth: 0,
  },
  dateTimeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateTimeText: {
    fontSize: FONT.sizes.s,
    color: COLORS.text,
    textAlign: "center",
    fontWeight: "500",
  },
  dateTimeTextActive: {
    color: COLORS.background,
    fontWeight: "600",
  },
  pickerContainer: {
    marginTop: SPACING.m,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  picker: {
    backgroundColor: "transparent",
    height: 200,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    marginRight: SPACING.s,
  },
  generateButton: {
    padding: SPACING.s,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  passwordNote: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
    marginTop: SPACING.s,
    fontStyle: "italic",
  },
  createButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: SPACING.m,
    alignItems: "center",
  },
  createButtonText: {
    fontSize: FONT.sizes.m,
    fontWeight: "600",
    color: COLORS.background,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default CreateEventScreen;
