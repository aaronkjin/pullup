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

import {
  RootStackParamList,
  StudentTabParamList,
  OrganizationTabParamList,
} from "../types";
import { COLORS } from "../utils/theme";
import { UserProvider } from "../contexts/UserContext";

// Screens
import HomeScreen from "../screens/HomeScreen";
import MyEventsScreen from "../screens/MyEventsScreen";
import CreateEventScreen from "../screens/CreateEventScreen";
import EventDetailsScreen from "../screens/EventDetailsScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";

interface UserInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
  userType?: "student" | "organization";
}

const Stack = createNativeStackNavigator();
const StudentTab = createBottomTabNavigator();
const OrganizationTab = createBottomTabNavigator();

interface StudentTabNavigatorProps {
  userInfo: UserInfo | null;
  setIsAuthenticated: (auth: boolean) => void;
  setUserInfo: (userInfo: UserInfo | null) => void;
}

// Student Tab Navigator (Home + My Events)
const StudentTabNavigator = ({
  userInfo,
  setIsAuthenticated,
  setUserInfo,
}: StudentTabNavigatorProps) => {
  return (
    <UserProvider
      userInfo={userInfo}
      setUserInfo={setUserInfo}
      setIsAuthenticated={setIsAuthenticated}
    >
      <StudentTab.Navigator
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
        <StudentTab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }: TabBarIconProps) => (
              <Ionicons name="home" color={color} size={size} />
            ),
            headerShown: false,
          }}
        />
        <StudentTab.Screen
          name="MyEvents"
          component={MyEventsScreen}
          options={{
            title: "My Events",
            tabBarIcon: ({ color, size }: TabBarIconProps) => (
              <Ionicons name="calendar" color={color} size={size} />
            ),
            headerShown: false,
          }}
        />
      </StudentTab.Navigator>
    </UserProvider>
  );
};

interface OrganizationTabNavigatorProps {
  userInfo: UserInfo | null;
  setIsAuthenticated: (auth: boolean) => void;
  setUserInfo: (userInfo: UserInfo | null) => void;
}

// Organization Tab Navigator (My Events + Create)
const OrganizationTabNavigator = ({
  userInfo,
  setIsAuthenticated,
  setUserInfo,
}: OrganizationTabNavigatorProps) => {
  return (
    <UserProvider
      userInfo={userInfo}
      setUserInfo={setUserInfo}
      setIsAuthenticated={setIsAuthenticated}
    >
      <OrganizationTab.Navigator
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
        <OrganizationTab.Screen
          name="MyEvents"
          component={MyEventsScreen}
          options={{
            title: "My Events",
            tabBarIcon: ({ color, size }: TabBarIconProps) => (
              <Ionicons name="calendar" color={color} size={size} />
            ),
            headerShown: false,
          }}
        />
        <OrganizationTab.Screen
          name="Create"
          component={CreateEventScreen}
          options={{
            tabBarIcon: ({ color, size }: TabBarIconProps) => (
              <Ionicons name="add-circle" color={color} size={size} />
            ),
            headerShown: false,
          }}
        />
      </OrganizationTab.Navigator>
    </UserProvider>
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
            {/* Student Interface */}
            {userInfo?.userType === "student" && (
              <Stack.Screen name="Main" options={{ headerShown: false }}>
                {(
                  props: NativeStackScreenProps<RootStackParamList, "Main">
                ) => (
                  <StudentTabNavigator
                    {...props}
                    userInfo={userInfo}
                    setIsAuthenticated={setIsAuthenticated}
                    setUserInfo={setUserInfo}
                  />
                )}
              </Stack.Screen>
            )}

            {/* Organization Interface */}
            {userInfo?.userType === "organization" && (
              <>
                <Stack.Screen name="Main" options={{ headerShown: false }}>
                  {(
                    props: NativeStackScreenProps<RootStackParamList, "Main">
                  ) => (
                    <OrganizationTabNavigator
                      {...props}
                      userInfo={userInfo}
                      setIsAuthenticated={setIsAuthenticated}
                      setUserInfo={setUserInfo}
                    />
                  )}
                </Stack.Screen>

                {/* Organization-only screens */}
                <Stack.Screen
                  name="EventDetails"
                  component={EventDetailsScreen}
                  options={{
                    title: "Event Details",
                    headerBackTitle: "Back",
                  }}
                />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
