import React, { useState, useEffect } from "react";
import { LogBox } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";
import AppNavigator from "./src/navigation";
import { theme } from "./src/utils/theme";

interface UserInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
  userType?: 'student' | 'organization';
}

// Ignore warnings below for MVP
LogBox.ignoreLogs([
  "Reanimated 2",
  "AsyncStorage",
  "new NativeEventEmitter",
  "VirtualizedLists should never be nested",
]);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AppNavigator
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
          userInfo={userInfo}
          setUserInfo={setUserInfo}
        />
      </PaperProvider>
    </SafeAreaProvider>
  );
}