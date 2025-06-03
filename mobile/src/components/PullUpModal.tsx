import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Event } from "../types";
import { COLORS, SPACING, FONT } from "../utils/theme";

interface PullUpModalProps {
  visible: boolean;
  event: Event | null;
  onClose: () => void;
  onConfirm: (eventId: string, password?: string) => void;
}

const PullUpModal: React.FC<PullUpModalProps> = ({
  visible,
  event,
  onClose,
  onConfirm,
}) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!event) return null;

  const handleConfirm = async () => {
    if (event.isPrivate && !password.trim()) {
      Alert.alert("Password Required", "Please enter the event password.");
      return;
    }

    setLoading(true);
    try {
      await onConfirm(event.id, event.isPrivate ? password : undefined);
      setPassword("");
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to pull up to event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Event Info */}
          {event.imageUrl && (
            <Image
              source={{ uri: event.imageUrl }}
              style={styles.eventImage}
              resizeMode="cover"
            />
          )}

          <View style={styles.content}>
            <Text style={styles.title}>{event.title}</Text>
            <Text style={styles.organizer}>{event.organizerName}</Text>
            <Text style={styles.date}>{formatDate(event.dateTime)}</Text>
            <Text style={styles.location}>{event.location}</Text>

            {event.isPrivate && (
              <View style={styles.privateContainer}>
                <Ionicons name="lock-closed" size={16} color={COLORS.primary} />
                <Text style={styles.privateText}>Private Event</Text>
              </View>
            )}

            <Text style={styles.description}>{event.description}</Text>

            {/* Password Input for Private Events */}
            {event.isPrivate && (
              <View style={styles.passwordContainer}>
                <Text style={styles.passwordLabel}>Event Password</Text>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            )}

            {/* Pull Up Info */}
            <View style={styles.pullUpInfo}>
              <Ionicons name="person" size={20} color={COLORS.primary} />
              <Text style={styles.pullUpCount}>{event.pullUpCount}</Text>
              <Text style={styles.pullUpText}>people pulling up</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                loading && styles.disabledButton,
                event.userPulledUp && styles.pulledUpButton,
              ]}
              onPress={handleConfirm}
              disabled={loading}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  event.userPulledUp && styles.pulledUpButtonText,
                ]}
              >
                {loading
                  ? event.userPulledUp
                    ? "Updating..."
                    : "Pulling Up..."
                  : event.userPulledUp
                  ? "Not Going"
                  : "Pull Up!"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
  },
  container: {
    backgroundColor: COLORS.background,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    maxHeight: "90%",
    marginTop: 0,
  },
  eventImage: {
    width: "100%",
    height: 200,
  },
  content: {
    padding: SPACING.m,
  },
  title: {
    fontSize: FONT.sizes.xl,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  organizer: {
    fontSize: FONT.sizes.m,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  date: {
    fontSize: FONT.sizes.s,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  location: {
    fontSize: FONT.sizes.s,
    color: COLORS.secondaryText,
    marginBottom: SPACING.m,
  },
  privateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F7FF",
    paddingHorizontal: SPACING.s,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: SPACING.m,
  },
  privateText: {
    fontSize: FONT.sizes.s,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: "500",
  },
  description: {
    fontSize: FONT.sizes.s,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.m,
  },
  passwordContainer: {
    marginBottom: SPACING.m,
  },
  passwordLabel: {
    fontSize: FONT.sizes.s,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    fontSize: FONT.sizes.s,
    color: COLORS.text,
    backgroundColor: COLORS.card,
  },
  pullUpInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  pullUpCount: {
    fontSize: FONT.sizes.m,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 4,
  },
  pullUpText: {
    fontSize: FONT.sizes.m,
    color: COLORS.secondaryText,
    marginLeft: 4,
  },
  actions: {
    flexDirection: "row",
    padding: SPACING.m,
    paddingTop: 0,
    gap: SPACING.m,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.m,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: FONT.sizes.m,
    color: COLORS.text,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: SPACING.m,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: FONT.sizes.m,
    color: COLORS.background,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  pulledUpButton: {
    backgroundColor: COLORS.warning,
  },
  pulledUpButtonText: {
    color: COLORS.background,
  },
});

export default PullUpModal;
