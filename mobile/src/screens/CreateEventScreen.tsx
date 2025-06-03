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
import Icon from "react-native-vector-icons/Ionicons";

import { EventApi } from "../services/apiProvider";
import { COLORS, SPACING, FONT } from "../utils/theme";

const CreateEventScreen = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [dateTime, setDateTime] = useState("");
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
    if (!title || !description || !location || !dateTime) {
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

      // TODO: Need to upload image and get the URL here
      const imageUrl =
        "https://images.unsplash.com/photo-1523580494863-6f3031224c94";

      // TODO: Need to get org ID and org name from user profile
      const eventData = {
        title,
        description,
        organizerId: "org1",
        organizerName: "Stanford Eats",
        organizerImageUrl: "https://logo.clearbit.com/stanford.edu",
        location,
        dateTime,
        imageUrl,
        isPrivate,
        eventPassword: isPrivate ? eventPassword : undefined,
      };

      await EventApi.createEvent(eventData);

      // Reset form
      setTitle("");
      setDescription("");
      setLocation("");
      setDateTime("");
      setIsPrivate(false);
      setEventPassword("");

      Alert.alert("Success", "Event created successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Failed to create event:", error);
      Alert.alert("Error", "Failed to create event. Please try again.");
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
          <Icon name="image-outline" size={48} color={COLORS.secondaryText} />
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
            <Text style={styles.label}>Date and Time *</Text>
            <TextInput
              style={styles.input}
              value={dateTime}
              onChangeText={setDateTime}
              placeholder="MM/DD/YYYY HH:MM AM/PM"
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
                  <Icon name="refresh" size={20} color={COLORS.primary} />
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
