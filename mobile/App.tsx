import React from "react";
import { LogBox } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";

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
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
