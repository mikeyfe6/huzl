import { router } from "expo-router";
import Head from "expo-router/head";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, ScrollView, StyleSheet } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";

import { ExternalLink } from "@/components/external-link";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { Colors, linkColor, whiteColor } from "@/constants/theme";
import { baseButton, baseButtonText, baseOpacity, baseSpace } from "@/styles/base";

export default function TermsScreen() {
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: {
                    flex: 1,
                },
                content: {
                    padding: 20,
                    paddingBottom: 40,
                },
                title: {
                    marginBottom: 8,
                },
                subtitle: {
                    marginTop: 24,
                    marginBottom: 12,
                },
                paragraph: {
                    marginBottom: 12,
                    opacity: 0.9,
                },
                updated: {
                    ...baseSpace,
                    ...baseOpacity,
                    fontStyle: "italic",
                },
                backButton: {
                    ...baseButton(theme),
                    backgroundColor: linkColor,
                    marginTop: 16,
                },
                backButtonText: {
                    ...baseButtonText,
                    color: whiteColor,
                },
            }),
        [theme],
    );

    return (
        <ThemedView style={styles.container}>
            {Platform.OS === "web" && (
                <Head>
                    <title>{`${t("terms.title")} • Huzl`}</title>
                    <meta name="robots" content="index, follow" />
                </Head>
            )}
            <ScrollView contentContainerStyle={styles.content}>
                <ThemedText type="title" style={styles.title}>
                    {t("terms.title")}
                </ThemedText>
                <ThemedText style={styles.updated}>{t("terms.updated")}</ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    {t("terms.section1.title")}
                </ThemedText>
                <ThemedText style={styles.paragraph}>{t("terms.section1.content")}</ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    {t("terms.section2.title")}
                </ThemedText>
                <ThemedText style={styles.paragraph}>{t("terms.section2.content")}</ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    {t("terms.section3.title")}
                </ThemedText>
                <ThemedText style={styles.paragraph}>{t("terms.section3.content")}</ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    {t("terms.section4.title")}
                </ThemedText>
                <ThemedText style={styles.paragraph}>{t("terms.section4.content")}</ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    {t("terms.section5.title")}
                </ThemedText>
                <ThemedText style={styles.paragraph}>{t("terms.section5.content")}</ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    {t("terms.section6.title")}
                </ThemedText>
                <ThemedText style={styles.paragraph}>{t("terms.section6.content")}</ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    {t("terms.section7.title")}
                </ThemedText>
                <ThemedText style={styles.paragraph}>{t("terms.section7.content")}</ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    {t("terms.section8.title")}
                </ThemedText>
                <ThemedText style={styles.paragraph}>{t("terms.section8.content")}</ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    {t("terms.section9.title")}
                </ThemedText>
                <ThemedText style={styles.paragraph}>{t("terms.section9.content")}</ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    {t("terms.section10.title")}
                </ThemedText>
                <ThemedText style={styles.paragraph}>{t("terms.section10.content")}</ThemedText>

                <ThemedText style={[styles.paragraph, styles.updated]}>
                    {t("terms.contact.name")}
                    {"\n"}
                    {t("terms.contact.kvk")}
                    {"\n"}
                    {t("terms.contact.email")}
                    {"\n"}
                    {t("terms.contact.website")}{" "}
                    <ExternalLink href="https://menefex.nl" theme={theme}>
                        <ThemedText type="link">menefex.nl</ThemedText>
                    </ExternalLink>
                </ThemedText>

                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <ThemedText style={styles.backButtonText}>{t("common.back")}</ThemedText>
                </Pressable>
            </ScrollView>
        </ThemedView>
    );
}
