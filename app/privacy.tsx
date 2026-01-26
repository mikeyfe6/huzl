import { router } from "expo-router";
import Head from "expo-router/head";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Platform, ScrollView, StyleSheet, TouchableOpacity } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";

import { ExternalLink } from "@/components/external-link";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { Colors, linkColor, whiteColor } from "@/constants/theme";
import { baseButton, baseButtonText, baseOpacity, baseSpace, baseWeight } from "@/styles/base";

export default function PrivacyScreen() {
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
                    <title>{`${t("privacy.title")} • Huzl`}</title>
                    <meta name="robots" content="index, follow" />
                </Head>
            )}
            <ScrollView contentContainerStyle={styles.content}>
                <ThemedText type="title" style={styles.title}>
                    {t("privacy.title")}
                </ThemedText>
                <ThemedText style={styles.updated}>{t("privacy.updated")}</ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    {t("privacy.section1.title")}
                </ThemedText>
                <ThemedText style={styles.paragraph}>{t("privacy.section1.content")}</ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    {t("privacy.section2.title")}
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    <ThemedText style={baseWeight}>{t("privacy.section2.accountData")}: </ThemedText>
                    {t("privacy.section2.accountDataDesc")}
                    {"\n\n"}
                    <ThemedText style={baseWeight}>{t("privacy.section2.financialData")}: </ThemedText>
                    {t("privacy.section2.financialDataDesc")}
                    {"\n\n"}
                    <ThemedText style={baseWeight}>{t("privacy.section2.usageData")}: </ThemedText>
                    {t("privacy.section2.usageDataDesc")}
                </ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    {t("privacy.section3.title")}
                </ThemedText>
                <ThemedText style={styles.paragraph}>{t("privacy.section3.content")}</ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    {t("privacy.section4.title")}
                </ThemedText>
                <ThemedText style={styles.paragraph}>{t("privacy.section4.content")}</ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    {t("privacy.section5.title")}
                </ThemedText>
                <ThemedText style={styles.paragraph}>{t("privacy.section5.content")}</ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    {t("privacy.section6.title")}
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    {t("privacy.section6.intro")}
                    {"\n\n"}• <ThemedText style={baseWeight}>{t("privacy.section6.right1")}:</ThemedText>{" "}
                    {t("privacy.section6.right1Desc")}
                    {"\n"}• <ThemedText style={baseWeight}>{t("privacy.section6.right2")}:</ThemedText>{" "}
                    {t("privacy.section6.right2Desc")}
                    {"\n"}• <ThemedText style={baseWeight}>{t("privacy.section6.right3")}:</ThemedText>{" "}
                    {t("privacy.section6.right3Desc")}
                    {"\n"}• <ThemedText style={baseWeight}>{t("privacy.section6.right4")}:</ThemedText>{" "}
                    {t("privacy.section6.right4Desc")}
                    {"\n"}• <ThemedText style={baseWeight}>{t("privacy.section6.right5")}:</ThemedText>{" "}
                    {t("privacy.section6.right5Desc")}
                </ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    {t("privacy.section7.title")}
                </ThemedText>
                <ThemedText style={styles.paragraph}>{t("privacy.section7.content")}</ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    {t("privacy.section8.title")}
                </ThemedText>
                <ThemedText style={styles.paragraph}>{t("privacy.section8.content")}</ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    {t("privacy.section9.title")}
                </ThemedText>
                <ThemedText style={styles.paragraph}>{t("privacy.section9.content")}</ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    {t("privacy.section10.title")}
                </ThemedText>
                <ThemedText style={styles.paragraph}>{t("privacy.section10.content")}</ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    {t("privacy.section11.title")}
                </ThemedText>
                <ThemedText style={styles.paragraph}>{t("privacy.section11.content")}</ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    {t("privacy.section12.title")}
                </ThemedText>
                <ThemedText style={styles.paragraph}>{t("privacy.section12.content")}</ThemedText>

                <ThemedText style={[styles.paragraph, styles.updated]}>
                    Menefex{"\n"}
                    KVK-nummer: 76045315{"\n"}
                    E-mail: info@menefex.nl{"\n"}
                    Website:{" "}
                    <ExternalLink href="https://menefex.nl" theme={theme}>
                        <ThemedText type="link">menefex.nl</ThemedText>
                    </ExternalLink>
                </ThemedText>

                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ThemedText style={styles.backButtonText}>{t("common.back")}</ThemedText>
                </TouchableOpacity>
            </ScrollView>
        </ThemedView>
    );
}
