import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];
    const { user } = useAuth();

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: theme.tint,
                    tabBarShowLabel: true,
                    headerShown: false,
                    tabBarButton: HapticTab,
                    tabBarStyle: user
                        ? {
                              height: Platform.select({
                                  ios: 90,
                                  android: 90,
                                  default: 70,
                              }),
                          }
                        : { display: "none" },
                    tabBarItemStyle: { paddingVertical: 8 },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Home",
                        tabBarLabel: "Home",
                        tabBarButton: user ? HapticTab : () => null,
                        tabBarIcon: ({ color }) => (
                            <IconSymbol
                                size={28}
                                name="house.fill"
                                color={color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="expenses"
                    options={{
                        title: "Expenses",
                        tabBarLabel: "Expenses",
                        tabBarButton: user ? HapticTab : () => null,
                        tabBarIcon: ({ color }) => (
                            <IconSymbol
                                size={28}
                                name="graph.2d"
                                color={color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="budgets"
                    options={{
                        title: "Budgets",
                        tabBarLabel: "Budgets",
                        tabBarButton: user ? HapticTab : () => null,
                        tabBarIcon: ({ color }) => (
                            <IconSymbol
                                size={28}
                                name="basket.fill"
                                color={color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="settings"
                    options={{
                        title: "Settings",
                        tabBarLabel: "Settings",
                        tabBarButton: user ? HapticTab : () => null,
                        tabBarIcon: ({ color }) => (
                            <IconSymbol size={28} name="gear" color={color} />
                        ),
                    }}
                />
            </Tabs>
        </SafeAreaView>
    );
}
