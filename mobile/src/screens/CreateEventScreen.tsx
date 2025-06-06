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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { EventApi } from "../services/apiProvider";
import { AuthTokenManager } from "../config/api";
import { COLORS, SPACING, FONT } from "../utils/theme";

const CreateEventScreen = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [eventPassword, setEventPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (!title || !description || !location || !eventDate || !eventTime) {
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
      console.log('Current auth token for event creation:', token);
      
      if (!token || !token.startsWith('org_')) {
        Alert.alert("Error", "You must be logged in as an organization to create events.");
        return;
      }

      // Parse token format: org_${org_id}_${timestamp}
      const parts = token.split('_');
      if (parts.length < 2) {
        Alert.alert("Error", "Invalid authentication token. Please log in again.");
        return;
      }

      const orgId = parseInt(parts[1]);
      if (isNaN(orgId)) {
        Alert.alert("Error", "Invalid organization ID. Please log in again.");
        return;
      }

      console.log('Extracted org_id for event creation:', orgId);

      // Use dummy image URL for now
      const dummyImageUrl = "https://images.unsplash.com/photo-1523580494863-6f3031224c94";

      // Prepare event data
      const eventData = {
        org_id: orgId,
        name: title,
        event_date: eventDate,
        event_time: eventTime,
        location,
        description,
        image_url: dummyImageUrl,
        is_public: !isPrivate,
        passcode: isPrivate ? eventPassword : undefined,
      };

      console.log('Creating event with data:', eventData);
      console.log('Data types:', {
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
      console.log('Data values:', eventData);

      const createdEvent = await EventApi.createEvent(eventData);

      console.log('Event creation response:', createdEvent);

      // Reset form
      setTitle("");
      setDescription("");
      setLocation("");
      setEventDate("");
      setEventTime("");
      setIsPrivate(false);
      setEventPassword("");

      Alert.alert("Success", `Event created successfully! Event ID: ${createdEvent.id}`, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
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

        {/* Image upload placeholder */}
        <TouchableOpacity style={styles.imageUpload}>
          <Ionicons name="image-outline" size={48} color={COLORS.secondaryText} />
          <Text style={styles.imageUploadText}>Upload Event Image</Text>
        </TouchableOpacity>

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

          {/* Date and Time */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={styles.input}
              value={eventDate}
              onChangeText={setEventDate}
              placeholder="MM/DD/YYYY"
              placeholderTextColor={COLORS.secondaryText}
            />
          </View>

          {/* Time */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Time *</Text>
            <TextInput
              style={styles.input}
              value={eventTime}
              onChangeText={setEventTime}
              placeholder="HH:MM AM/PM"
              placeholderTextColor={COLORS.secondaryText}
            />
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
  imageUpload: {
    height: 150,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.l,
  },
  imageUploadText: {
    fontSize: FONT.sizes.s,
    color: COLORS.secondaryText,
    marginTop: SPACING.s,
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
  },
  switchSubtext: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
    marginTop: 2,
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
