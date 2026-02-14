import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { Home, Heart } from "lucide-react-native";

import FavoritesProvider from "./context/FavoritesProvider";
import HomeScreen from "./screens/HomeScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import DetailScreen from "./screens/DetailScreen";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#FF6B6B",
    primaryContainer: "#FFE8E8",
    secondary: "#4ECDC4",
    secondaryContainer: "#C7F0ED",
    error: "#D32F2F",
    background: "#F5F5F5",
    surface: "#FFFFFF",
  },
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF6B6B",
        tabBarInactiveTintColor: "#757575",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
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
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider theme={theme}>
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
                options={{
                  title: "Product Details",
                  headerStyle: {
                    backgroundColor: "#FF6B6B",
                  },
                  headerTintColor: "#FFFFFF",
                  headerTitleStyle: {
                    fontWeight: "bold",
                  },
                }}
              />
            </Stack.Navigator>
            <StatusBar style="auto" />
          </NavigationContainer>
        </FavoritesProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
