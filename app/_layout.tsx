import "@/utils/i18n";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import Head from "expo-router/head";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
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
    const name = pathname?.replace(/^\//, "") || "home";

    require("react").useEffect(() => {
        logScreenView(name, pageTitle);
    }, [pathname]);

    const pageTitle = (() => {
        if (name === "home") {
            return t("seo.title", { defaultValue: "Huzl • Money Management" });
        }
        const labels: Record<string, string> = {
            expenses: t("tabs.expenses"),
            debts: t("tabs.debts"),
            budgets: t("tabs.budgets"),
            settings: t("tabs.settings"),
            income: t("modal.income"),
            privacy: t("modal.privacy"),
            terms: t("modal.terms"),
        };
        const label = labels[name] || t("tabs.home");
        return `${label} • Huzl`;
    })();

    return (
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <RefreshProvider>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="income" options={{ presentation: "modal", title: t("modal.income") }} />
                    <Stack.Screen name="terms" options={{ presentation: "modal", title: t("modal.terms") }} />
                    <Stack.Screen name="privacy" options={{ presentation: "modal", title: t("modal.privacy") }} />
                </Stack>
                {Platform.OS === "web" && (
                    <Head>
                        <title>{pageTitle}</title>
                        {user && <meta name="robots" content="noindex, nofollow" />}
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

    useEffect(() => {
        if (Platform.OS !== "web") return;
        const head = document.head;

        if (gtmId) {
            if (!document.getElementById("gtm-script")) {
                const script = document.createElement("script");
                script.id = "gtm-script";
                script.async = true;
                script.innerHTML = `(
                    function(w,d,s,l,i){
                        w[l]=w[l]||[];
                        w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
                        var f=d.getElementsByTagName(s)[0], j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
                        j.async=true;
                        j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                        f.parentNode.insertBefore(j,f);
                    }
                )(window,document,'script','dataLayer','${gtmId}');`;
                head.appendChild(script);
            }
            return;
        }

        if (gaId) {
            if (!document.getElementById("gtag-lib")) {
                const lib = document.createElement("script");
                lib.id = "gtag-lib";
                lib.async = true;
                lib.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
                head.appendChild(lib);
            }
            if (!document.getElementById("gtag-init")) {
                const init = document.createElement("script");
                init.id = "gtag-init";
                init.innerHTML = `
                    window.dataLayer = window.dataLayer || [];
                    window.gtag = function gtag(){ window.dataLayer.push(arguments); };
                    window.gtag('js', new Date());
                    window.gtag('config', '${gaId}', { send_page_view: false });
                `;
                head.appendChild(init);
            }
        }
    }, [gtmId, gaId]);

    return (
        <CustomThemeProvider>
            <Head>
                <meta
                    name="description"
                    content={t("seo.description", {
                        defaultValue:
                            "Manage budgets, track expenses, monitor debts and monthly income with Huzl's clear summaries.",
                    })}
                />
                <meta property="og:locale" content={i18n.language === "nl" ? "nl_NL" : "en_US"} />
                {verification && <meta name="google-site-verification" content={verification} />}
            </Head>
            <AuthProvider>
                <RootContent />
            </AuthProvider>
        </CustomThemeProvider>
    );
}
