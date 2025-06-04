import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, SPACING, FONT } from "../utils/theme";

interface WelcomeScreenProps {
  navigation: any;
}

const WelcomeScreen = ({ navigation }: WelcomeScreenProps) => {
  const [selectedUserType, setSelectedUserType] = useState<
    "student" | "organization" | null
  >(null);

  const handleNext = () => {
    if (selectedUserType) {
      navigation.navigate("Login", { userType: selectedUserType });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Pullup</Text>
      <Text style={styles.subtitle}>
        The go-to place for finding and sharing campus events.
      </Text>

      <Text style={styles.questionText}>I am a...</Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.optionCard,
            selectedUserType === "student" && styles.selectedCard,
          ]}
          onPress={() => setSelectedUserType("student")}
        >
          <Text
            style={[
              styles.optionTitle,
              selectedUserType === "student" && styles.selectedText,
            ]}
          >
            Student
          </Text>
          <Text style={styles.optionSubtitle}>
            Discover and join campus events
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionCard,
            selectedUserType === "organization" && styles.selectedCard,
          ]}
          onPress={() => setSelectedUserType("organization")}
        >
          <Text
            style={[
              styles.optionTitle,
              selectedUserType === "organization" && styles.selectedText,
            ]}
          >
            Student Organization
          </Text>
          <Text style={styles.optionSubtitle}>
            Publicize and manage your group's events
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.nextButton, !selectedUserType && styles.disabledButton]}
        onPress={handleNext}
        disabled={!selectedUserType}
      >
        <Text
          style={[
            styles.nextButtonText,
            !selectedUserType && styles.disabledButtonText,
          ]}
        >
          Next
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.secondaryText,
    marginBottom: 48,
    textAlign: "center",
  },
  questionText: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 24,
    textAlign: "center",
  },
  optionsContainer: {
    width: "100%",
    marginBottom: 48,
  },
  optionCard: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: "#f0f8ff",
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  selectedText: {
    color: COLORS.primary,
  },
  optionSubtitle: {
    fontSize: 14,
    color: COLORS.secondaryText,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 120,
  },
  disabledButton: {
    backgroundColor: COLORS.border,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  disabledButtonText: {
    color: COLORS.secondaryText,
  },
});

export default WelcomeScreen;
