import React, { useState, useEffect} from "react";
import { LogBox } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";
import { GoogleOAuthProvider} from '@react-oauth/google'
import { GOOGLE_CLIENT_ID } from "./src/utils/config";
import AppNavigator from "./src/navigation";
import { theme } from "./src/utils/theme";
// Ignore warnings below for MVP
LogBox.ignoreLogs([
  "Reanimated 2",
  "AsyncStorage",
  "new NativeEventEmitter",
  "VirtualizedLists should never be nested",
]);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <SafeAreaProvider> 
        <PaperProvider theme={theme}>
          <AppNavigator 
            isAuthenticated={isAuthenticated} 
            setIsAuthenticated={setIsAuthenticated} 
          />
        </PaperProvider>
      </SafeAreaProvider>
    </GoogleOAuthProvider>
  );
}
