import "@/utils/i18n";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider as CustomThemeProvider, useColorScheme } from "@/hooks/use-color-scheme";
import { RefreshProvider } from "@/hooks/use-refresh-context";

export const unstable_settings = {
    anchor: "(tabs)",
};

function RootContent() {
    const colorScheme = useColorScheme();

    return (
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <AuthProvider>
                <RefreshProvider>
                    <Stack>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="income" options={{ presentation: "modal", title: "Income" }} />
                        <Stack.Screen name="terms" options={{ presentation: "modal", title: "Terms of Service" }} />
                        <Stack.Screen name="privacy" options={{ presentation: "modal", title: "Privacy Policy" }} />
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
