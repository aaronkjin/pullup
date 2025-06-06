import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SPACING, FONT } from "../utils/theme";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onLogout,
}) => {
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable>
          <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
              <Text style={styles.title}>Settings</Text>
            </View>

            <View style={styles.content}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={COLORS.error}
                />
                <Text style={styles.logoutText}>Log out</Text>
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
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT.sizes.l,
    fontWeight: "600",
    color: COLORS.text,
  },
  content: {
    padding: SPACING.m,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.m,
    borderRadius: 12,
    backgroundColor: COLORS.lightRed,
  },
  logoutText: {
    fontSize: FONT.sizes.m,
    fontWeight: "600",
    color: COLORS.error,
    marginLeft: SPACING.s,
  },
});

export default SettingsModal;
