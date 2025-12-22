import { Tabs } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
                    headerShown: false,
                    tabBarButton: HapticTab,
                    tabBarStyle: {
                        height: 90,
                    },
                    tabBarItemStyle: {
                        paddingVertical: 18,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Home",
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
                        tabBarIcon: ({ color }) => (
                            <IconSymbol
                                size={28}
                                name="figure.play"
                                color={color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="tracker"
                    options={{
                        title: "Tracker",
                        tabBarIcon: ({ color }) => (
                            <IconSymbol
                                size={28}
                                name="paperplane.fill"
                                color={color}
                            />
                        ),
                    }}
                />
            </Tabs>
        </SafeAreaView>
    );
}
