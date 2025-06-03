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
  ScrollView
} from "react-native";
import { COLORS } from '../utils/theme';

interface UserInfo {
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  email?: string;
  userType?: 'student' | 'organization';
}

interface LoginScreenProps {
  setIsAuthenticated: (auth: boolean) => void;
  setUserInfo: (userInfo: UserInfo | null) => void;
  navigation: any;
  route: any;
}

const LoginScreen = ({ setIsAuthenticated, setUserInfo, navigation, route }: LoginScreenProps) => {
  const { userType } = route.params;
  const [isSignUp, setIsSignUp] = useState(true);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = () => {
    if (isSignUp) {
      if (userType === 'student') {
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
          Alert.alert('Error', 'Please fill in all fields');
          return;
        }
      } else {
        if (!organizationName.trim() || !email.trim() || !password.trim()) {
          Alert.alert('Error', 'Please fill in all fields');
          return;
        }
      }
    } else {
      if (!email.trim() || !password.trim()) {
        Alert.alert('Error', 'Please enter your email and password');
        return;
      }
    }

    if (!email.includes('@stanford.edu')) {
      Alert.alert('Error', 'Please use a valid Stanford email address');
      return;
    }

    const userInfo: UserInfo = {
      firstName: userType === 'student' ? firstName : undefined,
      lastName: userType === 'student' ? lastName : undefined,
      organizationName: userType === 'organization' ? organizationName : undefined,
      email,
      userType: userType
    };

    setUserInfo(userInfo);
    setIsAuthenticated(true);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image
          source={require("../assets/stanford-logo.png")}
          style={styles.stanfordLogo}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>
          {isSignUp ? 'Create Account' : 'Sign In'}
        </Text>
        <Text style={styles.subtitle}>
          {userType === 'student' ? 'Stanford Student' : 'Stanford Organization'}
        </Text>

        <View style={styles.formContainer}>
          {isSignUp && (
            <>
              {userType === 'student' ? (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>First Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Jane"
                      placeholderTextColor="#999"
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                    />
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Last Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Doe"
                      placeholderTextColor="#999"
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                    />
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
              placeholder={userType === 'student' ? "janedoe@stanford.edu" : "treeplanting@stanford.edu"}
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Choose a strong password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
            <Text style={styles.authButtonText}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.switchButton}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={styles.switchButtonText}>
              {isSignUp 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Sign Up"
              }
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
    width: '100%',
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
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
    backgroundColor: '#f9f9f9',
  },
  authButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  authButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  switchButtonText: {
    color: COLORS.primary,
    fontSize: 14,
  },
});

export default LoginScreen;