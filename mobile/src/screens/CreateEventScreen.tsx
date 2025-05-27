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
  const [category, setCategory] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  // Categories for selection
  const categories = [
    "Food",
    "Music",
    "Academic",
    "Social",
    "Recreation",
    "Sports",
    "Arts",
    "Technology",
    "Other",
  ];

  // Handle category selection
  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
  };

  // Handle create event
  const handleCreateEvent = async () => {
    if (!title || !description || !location || !dateTime || !category) {
      Alert.alert(
        "Missing Information",
        "Please fill in all the required fields."
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
        category,
        isPrivate,
      };

      await EventApi.createEvent(eventData);

      // Reset form
      setTitle("");
      setDescription("");
      setLocation("");
      setDateTime("");
      setCategory("");
      setIsPrivate(false);

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

          {/* Category */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoriesContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.selectedCategory,
                  ]}
                  onPress={() => handleCategorySelect(cat)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat && styles.selectedCategoryText,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Privacy Setting */}
          <View style={styles.formGroup}>
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Private Event</Text>
              <Switch
                value={isPrivate}
                onValueChange={setIsPrivate}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor="#FFF"
              />
            </View>
            <Text style={styles.helperText}>
              Private events will require a QR wristband for entry.
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, !title && styles.disabledButton]}
            onPress={handleCreateEvent}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Create Event</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.requiredNote}>* Required fields</Text>
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
    padding: SPACING.l,
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
  },
  imageUpload: {
    height: 180,
    backgroundColor: COLORS.card,
    borderWidth: 1,
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
    marginBottom: SPACING.xl,
  },
  formGroup: {
    marginBottom: SPACING.l,
  },
  label: {
    fontSize: FONT.sizes.s,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.m,
    fontSize: FONT.sizes.m,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 100,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryButton: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.xs,
    margin: 4,
  },
  selectedCategory: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
  },
  selectedCategoryText: {
    color: "#FFF",
    fontWeight: "600",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  helperText: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING.m,
    alignItems: "center",
    marginTop: SPACING.m,
  },
  disabledButton: {
    backgroundColor: COLORS.border,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: FONT.sizes.m,
    fontWeight: "600",
  },
  requiredNote: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
    marginTop: SPACING.s,
    textAlign: "center",
  },
});

export default CreateEventScreen;
