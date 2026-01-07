import "@/utils/i18n";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import Head from "expo-router/head";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ThemeProvider as CustomThemeProvider, useColorScheme } from "@/hooks/use-color-scheme";
import { RefreshProvider } from "@/hooks/use-refresh-context";
import { logScreenView, setUserId } from "@/utils/analytics";

export const unstable_settings = {
    anchor: "(tabs)",
};

function RootContent() {
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const { user } = useAuth();
    const { usePathname } = require("expo-router");
    const pathname: string = usePathname();

    // Track screen views when the route changes (web + native)
    require("react").useEffect(() => {
        const name = pathname?.replace(/^\//, "") || "home";
        logScreenView(name);
    }, [pathname]);

    // Sync analytics user id when auth changes
    require("react").useEffect(() => {
        setUserId(user?.id ?? null);
    }, [user?.id]);

    // Dev-only: fire a test event once on mount to verify GA4
    require("react").useEffect(() => {
        if (__DEV__) {
            // Avoid blocking render; best-effort fire-and-forget
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            require("@/utils/analytics").logEvent("dev_test_open", { ts: Date.now() });
        }
        // run once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <RefreshProvider>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="income" options={{ presentation: "modal", title: t("modal.income") }} />
                    <Stack.Screen name="terms" options={{ presentation: "modal", title: t("modal.terms") }} />
                    <Stack.Screen name="privacy" options={{ presentation: "modal", title: t("modal.privacy") }} />
                </Stack>
                {Platform.OS === "web" && user && (
                    <Head>
                        <meta name="robots" content="noindex, nofollow" />
                    </Head>
                )}
                <StatusBar style="auto" />
            </RefreshProvider>
        </ThemeProvider>
    );
}

export default function RootLayout() {
    const { t, i18n } = useTranslation();
    const gaId = process.env.EXPO_PUBLIC_GA_MEASUREMENT_ID;
    const verification = process.env.EXPO_PUBLIC_GOOGLE_SITE_VERIFICATION;
    return (
        <CustomThemeProvider>
            <Head>
                <title>{t("seo.title", { defaultValue: "Huzl • Money Management" })}</title>
                <meta
                    name="description"
                    content={t("seo.description", {
                        defaultValue:
                            "Manage budgets, track expenses, monitor debts and monthly income with Huzl's clear summaries.",
                    })}
                />
                <meta property="og:locale" content={i18n.language === "nl" ? "nl_NL" : "en_US"} />
                {verification && <meta name="google-site-verification" content={verification} />}
                {Platform.OS === "web" && gaId && (
                    <>
                        <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
                        <script
                            dangerouslySetInnerHTML={{
                                __html: `
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);} 
                                gtag('js', new Date());
                                gtag('config', '${gaId}');
                            `,
                            }}
                        />
                    </>
                )}
            </Head>
            <AuthProvider>
                <RootContent />
            </AuthProvider>
        </CustomThemeProvider>
    );
}
