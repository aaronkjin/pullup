import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../utils/theme";
import { AuthApi } from "../services/realApi";
import { AuthTokenManager } from "../config/api";

interface UserInfo {
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  email?: string;
  userType?: "student" | "organization";
}

interface LoginScreenProps {
  setIsAuthenticated: (auth: boolean) => void;
  setUserInfo: (userInfo: UserInfo | null) => void;
  navigation: any;
  route: any;
}

const LoginScreen = ({
  setIsAuthenticated,
  setUserInfo,
  navigation,
  route,
}: LoginScreenProps) => {
  const { userType } = route.params;
  const [isSignUp, setIsSignUp] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Password requirements state
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // Check password requirements
  const checkPasswordRequirements = (password: string) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setPasswordRequirements(requirements);
    return Object.values(requirements).every(Boolean);
  };

  // Handle password change
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (isSignUp) {
      checkPasswordRequirements(text);
    }
  };

  const handleAuth = async () => {
    if (isSignUp) {
      if (userType === "student") {
        if (
          !firstName.trim() ||
          !lastName.trim() ||
          !email.trim() ||
          !password.trim()
        ) {
          Alert.alert("Error", "Please fill in all fields");
          return;
        }
      } else {
        if (!organizationName.trim() || !email.trim() || !password.trim()) {
          Alert.alert("Error", "Please fill in all fields");
          return;
        }
      }

      if (!checkPasswordRequirements(password)) {
        Alert.alert(
          "Error",
          "Please make sure your password meets all requirements"
        );
        return;
      }
    } else {
      if (!email.trim() || !password.trim()) {
        Alert.alert("Error", "Please enter your email and password");
        return;
      }
    }

    if (!email.includes("@stanford.edu")) {
      Alert.alert("Error", "Please use a valid Stanford email address");
      return;
    }

    if (isSignUp && userType === "student") {
      try {
        const response = await AuthApi.createStudent({
          name: `${firstName} ${lastName}`,
          email: email,
          password: password,
        });
        
        const tempToken = `student_${response.student_id}_${Date.now()}`;
        await AuthTokenManager.setToken(tempToken);
        console.log('Stored temporary auth token:', tempToken);
        
        Alert.alert(
          "Success!", 
          `Student account created successfully!`,
          [
            {
              text: "OK",
              onPress: () => {
                const userInfo: UserInfo = {
                  firstName: firstName,
                  lastName: lastName,
                  email,
                  userType: userType,
                };
                setUserInfo(userInfo);
                setIsAuthenticated(true);
              }
            }
          ]
        );
        return;
      } catch (error: any) {
        console.error("Student creation error:", error);
        
        let errorMessage = "Failed to create student account. Please try again.";
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        Alert.alert("Error", errorMessage);
        return;
      }
    }

    if (!isSignUp && userType === "student") {
      try {
        const response = await AuthApi.loginStudent({
          email: email,
          password: password,
        });
        
        const tempToken = `student_${response.student_id}_${Date.now()}`;
        await AuthTokenManager.setToken(tempToken);
        console.log('Stored login auth token:', tempToken);
        
        const nameParts = response.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        Alert.alert(
          "Welcome back!", 
          `Login successful! Welcome back, ${response.name}`,
          [
            {
              text: "OK",
              onPress: () => {
                const userInfo: UserInfo = {
                  firstName: firstName,
                  lastName: lastName,
                  email: response.email,
                  userType: userType,
                };
                setUserInfo(userInfo);
                setIsAuthenticated(true);
              }
            }
          ]
        );
        return;
      } catch (error: any) {
        console.error("Student login error:", error);
        
        let errorMessage = "Login failed. Please check your credentials.";
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        Alert.alert("Login Error", errorMessage);
        return;
      }
    }

    const userInfo: UserInfo = {
      firstName: userType === "student" ? firstName : undefined,
      lastName: userType === "student" ? lastName : undefined,
      organizationName:
        userType === "organization" ? organizationName : undefined,
      email,
      userType: userType,
    };

    setUserInfo(userInfo);
    setIsAuthenticated(true);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image
          source={require("../assets/stanford-logo.png")}
          style={styles.stanfordLogo}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          {isSignUp ? "Create Account" : "Sign In"}
        </Text>
        <Text style={styles.subtitle}>
          {isSignUp ? "You're almost there! 🎉" : "Welcome back! 🕺"}
        </Text>

        <View style={styles.formContainer}>
          {isSignUp && (
            <>
              {userType === "student" ? (
                <>
                  <View style={styles.nameRowContainer}>
                    <View style={styles.nameInputContainer}>
                      <Text style={styles.inputLabel}>First Name</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Michael"
                        placeholderTextColor="#999"
                        value={firstName}
                        onChangeText={setFirstName}
                        autoCapitalize="words"
                      />
                    </View>

                    <View style={styles.nameInputContainer}>
                      <Text style={styles.inputLabel}>Last Name</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Bernstein"
                        placeholderTextColor="#999"
                        value={lastName}
                        onChangeText={setLastName}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Organization Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Stanford Tree-Planting Club"
                    placeholderTextColor="#999"
                    value={organizationName}
                    onChangeText={setOrganizationName}
                    autoCapitalize="words"
                  />
                </View>
              )}
            </>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Stanford Email</Text>
            <TextInput
              style={styles.input}
              placeholder={
                userType === "student"
                  ? "michaelbernstein@stanford.edu"
                  : "treeplanting@stanford.edu"
              }
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Choose a strong password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!isPasswordVisible}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                <Ionicons
                  name={isPasswordVisible ? "eye-off" : "eye"}
                  size={20}
                  color={COLORS.secondaryText}
                />
              </TouchableOpacity>
            </View>

            {/* Password Requirements (only show during sign up) */}
            {isSignUp && (
              <View style={styles.passwordRequirementsContainer}>
                <Text style={styles.requirementsTitle}>
                  Password must contain:
                </Text>
                <View style={styles.requirementsList}>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={
                        passwordRequirements.minLength
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={16}
                      color={
                        passwordRequirements.minLength
                          ? COLORS.primary
                          : COLORS.secondaryText
                      }
                    />
                    <Text
                      style={[
                        styles.requirementText,
                        passwordRequirements.minLength &&
                          styles.requirementTextMet,
                      ]}
                    >
                      At least 8 characters
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={
                        passwordRequirements.hasUppercase
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={16}
                      color={
                        passwordRequirements.hasUppercase
                          ? COLORS.primary
                          : COLORS.secondaryText
                      }
                    />
                    <Text
                      style={[
                        styles.requirementText,
                        passwordRequirements.hasUppercase &&
                          styles.requirementTextMet,
                      ]}
                    >
                      One uppercase letter
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={
                        passwordRequirements.hasLowercase
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={16}
                      color={
                        passwordRequirements.hasLowercase
                          ? COLORS.primary
                          : COLORS.secondaryText
                      }
                    />
                    <Text
                      style={[
                        styles.requirementText,
                        passwordRequirements.hasLowercase &&
                          styles.requirementTextMet,
                      ]}
                    >
                      One lowercase letter
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={
                        passwordRequirements.hasNumber
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={16}
                      color={
                        passwordRequirements.hasNumber
                          ? COLORS.primary
                          : COLORS.secondaryText
                      }
                    />
                    <Text
                      style={[
                        styles.requirementText,
                        passwordRequirements.hasNumber &&
                          styles.requirementTextMet,
                      ]}
                    >
                      One number
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={
                        passwordRequirements.hasSpecialChar
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={16}
                      color={
                        passwordRequirements.hasSpecialChar
                          ? COLORS.primary
                          : COLORS.secondaryText
                      }
                    />
                    <Text
                      style={[
                        styles.requirementText,
                        passwordRequirements.hasSpecialChar &&
                          styles.requirementTextMet,
                      ]}
                    >
                      One special character
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
            <Text style={styles.authButtonText}>
              {isSignUp ? "Create Account" : "Sign In"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={styles.switchButtonText}>
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  stanfordLogo: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondaryText,
    marginBottom: 32,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  authButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  authButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  switchButton: {
    alignItems: "center",
    marginTop: 16,
  },
  switchButtonText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f9f9f9",
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  eyeButton: {
    padding: 4,
  },
  passwordRequirementsContainer: {
    marginTop: 8,
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
  },
  requirementsList: {
    gap: 4,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  requirementText: {
    fontSize: 12,
    color: COLORS.secondaryText,
  },
  requirementTextMet: {
    color: COLORS.text,
    fontWeight: "500",
  },
  nameRowContainer: {
    flexDirection: "row",
    gap: 8,
  },
  nameInputContainer: {
    flex: 1,
    gap: 8,
  },
});

export default LoginScreen;
