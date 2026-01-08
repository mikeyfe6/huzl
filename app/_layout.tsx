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
import { logScreenView } from "@/utils/analytics";

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
    const gtmId = process.env.EXPO_PUBLIC_GTM_ID;
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
                {Platform.OS === "web" && gtmId ? (
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                                (function(w,d,s,l,i){
                                    w[l]=w[l]||[];
                                    w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
                                    var f=d.getElementsByTagName(s)[0],
                                        j=d.createElement(s),
                                        dl=l!='dataLayer'?'&l='+l:'';
                                    j.async=true;
                                    j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                                    f.parentNode.insertBefore(j,f);
                                })(window,document,'script','dataLayer','${gtmId}');
                            `,
                        }}
                    />
                ) : null}
                {Platform.OS === "web" && !gtmId && gaId ? (
                    <>
                        <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
                        <script
                            dangerouslySetInnerHTML={{
                                __html: `
                                window.dataLayer = window.dataLayer || [];
                                window.gtag = function gtag(){ window.dataLayer.push(arguments); };
                                window.gtag('js', new Date());
                                window.gtag('config', '${gaId}', {
                                    send_page_view: false,
                                });
                            `,
                            }}
                        />
                    </>
                ) : null}
            </Head>
            <AuthProvider>
                <RootContent />
            </AuthProvider>
        </CustomThemeProvider>
    );
}
