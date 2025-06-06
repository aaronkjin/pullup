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
  Pressable,
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  if (!event) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (event.userPulledUp) {
        // Handle "Not Going" action
        await onConfirm(event.id);
        onClose();
        return;
      }

      // Handle "Pull Up" action
      if (event.isPrivate && !password.trim()) {
        Alert.alert("Password Required", "Please enter the event password.");
        setLoading(false);
        return;
      }

      const passwordToSend = event.isPrivate ? password : undefined;
      await onConfirm(event.id, passwordToSend);
      setPassword("");
      onClose();
    } catch (error) {
      const action = event.userPulledUp
        ? "update registration"
        : "pull up to event";
      Alert.alert("Error", `Failed to ${action}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setIsPasswordVisible(false);
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
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
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable>
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
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.title}>{event.title}</Text>
                  <View style={styles.organizerContainer}>
                    <Image
                      source={{ uri: event.organizerImageUrl }}
                      style={styles.organizerImage}
                    />
                    <Text style={styles.organizerName}>
                      {event.organizerName}
                    </Text>
                  </View>
                </View>
                {event.isPrivate && (
                  <View style={styles.privateContainer}>
                    <Ionicons
                      name="lock-closed"
                      size={12}
                      color={COLORS.secondaryText}
                    />
                    <Text style={styles.privateText}>Private</Text>
                  </View>
                )}
              </View>

              {/* Details */}
              <View style={styles.detailsSection}>
                <View style={styles.detailRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={COLORS.secondaryText}
                  />
                  <Text style={styles.detailText}>
                    {formatDate(event.dateTime)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={COLORS.secondaryText}
                  />
                  <Text style={styles.detailText}>{event.location}</Text>
                </View>
              </View>

              {/* Description */}
              <Text style={styles.description}>{event.description}</Text>

              {/* Password Input for Private Events */}
              {event.isPrivate && !event.userPulledUp && (
                <View style={styles.passwordContainer}>
                  <Text style={styles.passwordLabel}>Event Password</Text>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter password"
                    secureTextEntry={!isPasswordVisible}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    <Ionicons
                      name={isPasswordVisible ? "eye" : "eye-off"}
                      size={20}
                      color={COLORS.secondaryText}
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* Pull Up Info */}
              <View style={styles.attendeesHeader}>
                <View style={styles.pullUpIndicator}>
                  <Ionicons name="people" size={18} color={COLORS.primary} />
                  <Text style={styles.pullUpCount}>{event.pullUpCount}</Text>
                  <Text style={styles.pullUpText}> pulling up</Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
              >
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
        </Pressable>
      </Pressable>
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
  },
  eventImage: {
    width: "100%",
    height: 200,
  },
  content: {
    padding: SPACING.l,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.m,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: SPACING.s,
  },
  title: {
    fontSize: FONT.sizes.xxl,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  organizerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  organizerImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: SPACING.s,
  },
  organizerName: {
    fontSize: FONT.sizes.m,
    color: COLORS.secondaryText,
  },
  privateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: 8,
  },
  privateText: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
    marginLeft: 4,
  },
  detailsSection: {
    marginBottom: SPACING.l,
    padding: SPACING.m,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.s,
  },
  detailText: {
    fontSize: FONT.sizes.m,
    color: COLORS.text,
    marginLeft: SPACING.m,
  },
  description: {
    fontSize: FONT.sizes.m,
    color: COLORS.secondaryText,
    lineHeight: 24,
    marginBottom: SPACING.l,
  },
  passwordContainer: {
    marginBottom: SPACING.m,
    position: "relative",
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
    paddingRight: 50,
    paddingVertical: SPACING.s,
    fontSize: FONT.sizes.s,
    color: COLORS.text,
    backgroundColor: COLORS.card,
  },
  eyeIcon: {
    position: "absolute",
    right: SPACING.m,
    top: 35,
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
    height: 24,
  },
  attendeesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  sectionTitle: {
    fontSize: FONT.sizes.l,
    fontWeight: "bold",
    color: COLORS.text,
  },
  pullUpIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F7FF",
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pullUpCount: {
    fontSize: FONT.sizes.s,
    fontWeight: "700",
    color: COLORS.primary,
    marginLeft: SPACING.s,
  },
  pullUpText: {
    fontSize: FONT.sizes.s,
    color: COLORS.secondaryText,
    marginLeft: SPACING.s,
  },
  actions: {
    flexDirection: "row",
    padding: SPACING.m,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.m,
    backgroundColor: COLORS.background,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.m,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  cancelButtonText: {
    fontSize: FONT.sizes.m,
    color: COLORS.text,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: SPACING.m,
    borderRadius: 12,
    backgroundColor: "#d7e7f7",
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: FONT.sizes.m,
    color: COLORS.primary,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  pulledUpButton: {
    backgroundColor: COLORS.lightRed,
  },
  pulledUpButtonText: {
    color: COLORS.error,
    fontWeight: "600",
  },
});

export default PullUpModal;
