import React from "react";
import { View, StyleSheet, Text, Image } from "react-native";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

interface UserInfo {
  name?: string;
  picture?: string;
  email?: string;
}

interface LoginScreenProps {
  setIsAuthenticated: (auth: boolean) => void;
  setUserInfo: (userInfo: UserInfo | null) => void;
}

const LoginScreen = ({ setIsAuthenticated, setUserInfo }: LoginScreenProps) => {
  const handleLoginSuccess = (credentialResponse: any) => {
    console.log("Login successful!", credentialResponse);
    const decodedToken = jwtDecode<UserInfo>(credentialResponse.credential); // use jwtdecode to grab names, photo, etc
    console.log("Login successful!", decodedToken);
    setUserInfo(decodedToken);
    setIsAuthenticated(true);
  };

  const handleLoginError = () => {
    console.log("Login failed");
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/stanford-logo.png")}
        style={styles.stanfordLogo}
        resizeMode="contain"
      />
      <Text style={styles.title}>You're almost there! 🎉</Text>
      <Text style={styles.subtitle}>
        Log in with your Stanford account to continue.
      </Text>
      <GoogleLogin onSuccess={handleLoginSuccess} onError={handleLoginError} />
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
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
});

export default LoginScreen;
