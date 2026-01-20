import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";

import { Colors } from "@/constants/theme";
import { baseOutline } from "@/styles/base";

export default function TabLayout() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={["top", "left", "right"]}>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: theme.tint,
                    tabBarShowLabel: true,
                    headerShown: false,
                    tabBarButton: (props) => <HapticTab {...props} style={[props.style, baseOutline(theme)]} />,
                    tabBarStyle:
                        user ?
                            {
                                height: 80,
                            }
                        :   { display: "none" },
                    tabBarItemStyle: {
                        paddingVertical: 14,
                        height: 80,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: t("tabs.home"),
                        tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="expenses"
                    options={{
                        title: t("tabs.expenses"),
                        tabBarIcon: ({ color }) => <IconSymbol size={28} name="graph.2d" color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="budgets"
                    options={{
                        title: t("tabs.budgets"),
                        tabBarIcon: ({ color }) => <IconSymbol size={28} name="basket.fill" color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="debts"
                    options={{
                        title: t("tabs.debts"),
                        tabBarIcon: ({ color }) => <IconSymbol size={28} name="creditcard" color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="settings"
                    options={{
                        title: t("tabs.settings"),
                        tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
                    }}
                />
            </Tabs>
        </SafeAreaView>
    );
}
