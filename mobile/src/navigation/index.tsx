import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import {
  createBottomTabNavigator,
  BottomTabScreenProps,
} from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { TabBarIconProps } from "@react-navigation/bottom-tabs";

import { RootStackParamList } from "../types";
import { COLORS } from "../utils/theme";

// Screens
import HomeScreen from "../screens/HomeScreen";
import EventDetailsScreen from "../screens/EventDetailsScreen";
import CreateEventScreen from "../screens/CreateEventScreen";
import ProfileScreen from "../screens/ProfileScreen";
import QRWristbandScreen from "../screens/QRWristbandScreen";
import ScanQRScreen from "../screens/ScanQRScreen";
import TopEventsScreen from "../screens/TopEventsScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";

interface UserInfo {
  name?: string;
  picture?: string;
  email?: string;
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Define ParamList for MainTabNavigator
export type MainTabParamList = {
  Home: undefined;
  TopEvents: undefined;
  CreateEvent: undefined;
  ScanQR: undefined;
  Profile: undefined; // userInfo will be passed as a prop directly, not a route param here
};

interface MainTabNavigatorProps {
  userInfo: UserInfo | null;
}

// Bottom Tab Navigator
const MainTabNavigator = ({ userInfo }: MainTabNavigatorProps) => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.secondaryText,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          paddingBottom: 8,
          height: 80,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          paddingBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: -8,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <Ionicons name="home" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="TopEvents"
        component={TopEventsScreen}
        options={{
          title: "Top Events",
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <Ionicons name="trophy" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="CreateEvent"
        component={CreateEventScreen}
        options={{
          title: "Create",
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <Ionicons name="add-circle" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="ScanQR"
        component={ScanQRScreen}
        options={{
          title: "Scan",
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <Ionicons name="qr-code" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <Ionicons name="person" color={color} size={size} />
          ),
          headerShown: false,
        }}
      >
        {(props: BottomTabScreenProps<MainTabParamList, "Profile">) => (
          <ProfileScreen {...props} userInfo={userInfo} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

interface AppNavigatorProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  userInfo: UserInfo | null;
  setUserInfo: (userInfo: UserInfo | null) => void;
}

// Root Stack Navigator
const AppNavigator = ({
  isAuthenticated,
  setIsAuthenticated,
  userInfo,
  setUserInfo,
}: AppNavigatorProps) => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.card,
          },
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontWeight: "600",
          },
          headerShadowVisible: false,
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Login"
              options={{
                headerShown: true,
                title: "",
                headerBackTitle: "Back",
              }}
            >
              {(props: { navigation: any; route: any }) => (
                <LoginScreen
                  {...props}
                  setIsAuthenticated={setIsAuthenticated}
                  setUserInfo={setUserInfo}
                />
              )}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="Main" options={{ headerShown: false }}>
              {(props: NativeStackScreenProps<RootStackParamList, "Main">) => (
                <MainTabNavigator {...props} userInfo={userInfo} />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="EventDetails"
              component={EventDetailsScreen}
              options={{
                title: "",
                headerBackTitle: "Back",
                headerTransparent: true,
              }}
            />
            <Stack.Screen
              name="QRWristband"
              component={QRWristbandScreen}
              options={{ title: "Event Wristband" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
