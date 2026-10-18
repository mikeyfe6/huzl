import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";

import { Colors, linkColor } from "@/constants/theme";

export default function TabLayout() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    const getIconColor = (color: unknown, focused: boolean): string => {
        if (focused) return linkColor;
        if (typeof color === "string") return color;
        return theme.icon;
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={["top", "left", "right"]}>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: linkColor,
                    tabBarInactiveTintColor: theme.icon,
                    tabBarShowLabel: true,
                    headerShown: false,
                    tabBarButton: (props) => <HapticTab {...props} style={props.style} />,
                    tabBarStyle:
                        user ?
                            {
                                height: 80,
                                backgroundColor: theme.background,
                                borderTopColor: theme.icon + "20",
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
                        tabBarIcon: ({ color, focused }) => (
                            <IconSymbol size={28} name="house.fill" color={getIconColor(color, focused)} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="expenses"
                    options={{
                        title: t("tabs.expenses"),
                        tabBarIcon: ({ color, focused }) => (
                            <IconSymbol size={28} name="graph.2d" color={getIconColor(color, focused)} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="budgets"
                    options={{
                        title: t("tabs.budgets"),
                        tabBarIcon: ({ color, focused }) => (
                            <IconSymbol size={28} name="basket.fill" color={getIconColor(color, focused)} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="debts"
                    options={{
                        title: t("tabs.debts"),
                        tabBarIcon: ({ color, focused }) => (
                            <IconSymbol size={28} name="creditcard" color={getIconColor(color, focused)} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="settings"
                    options={{
                        title: t("tabs.settings"),
                        tabBarIcon: ({ color, focused }) => (
                            <IconSymbol size={28} name="gear" color={getIconColor(color, focused)} />
                        ),
                    }}
                />
            </Tabs>
        </SafeAreaView>
    );
}
