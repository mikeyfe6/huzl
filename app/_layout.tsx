import "@/utils/i18n";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import "react-native-reanimated";

import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider as CustomThemeProvider, useColorScheme } from "@/hooks/use-color-scheme";
import { RefreshProvider } from "@/hooks/use-refresh-context";

export const unstable_settings = {
    anchor: "(tabs)",
};

function RootContent() {
    const { t } = useTranslation();
    const colorScheme = useColorScheme();

    return (
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <AuthProvider>
                <RefreshProvider>
                    <Stack>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="income" options={{ presentation: "modal", title: t("modal.income") }} />
                        <Stack.Screen name="terms" options={{ presentation: "modal", title: t("modal.terms") }} />
                        <Stack.Screen name="privacy" options={{ presentation: "modal", title: t("modal.privacy") }} />
                    </Stack>
                    <StatusBar style="auto" />
                </RefreshProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default function RootLayout() {
    return (
        <CustomThemeProvider>
            <RootContent />
        </CustomThemeProvider>
    );
}
