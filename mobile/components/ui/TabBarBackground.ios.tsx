import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BlurTabBarBackground() {
  return (
    <BlurView
      tint="systemChromeMaterial"
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
  // Standard tab bar height for iOS
  const standardTabHeight = 49;
  const { bottom } = useSafeAreaInsets();
  return standardTabHeight + bottom;
}
