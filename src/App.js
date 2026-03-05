import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import { Home, Heart, MapPin } from "lucide-react-native";

import FavoritesProvider from "./context/FavoritesProvider";
import HomeScreen from "./screens/HomeScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import DetailScreen from "./screens/DetailScreen";
import LocationScreen from "./screens/LocationScreen";
import { PaperTheme, Colors } from "./theme";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          elevation: 4,
          shadowColor: Colors.overlay,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Home size={focused ? 26 : 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Heart
              size={focused ? 26 : 24}
              color={color}
              fill={focused ? color : "none"}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Stores"
        component={LocationScreen}
        options={{
          tabBarLabel: "Stores",
          tabBarIcon: ({ color, focused }) => (
            <MapPin
              size={focused ? 26 : 24}
              color={color}
              fill={focused ? color : "none"}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider theme={PaperTheme}>
      <SafeAreaProvider>
        <FavoritesProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen
                name="Main"
                component={Tabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Detail"
                component={DetailScreen}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
            <StatusBar style="auto" />
          </NavigationContainer>
        </FavoritesProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
