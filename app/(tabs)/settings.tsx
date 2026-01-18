import { useFocusEffect } from "@react-navigation/native";
import { Link, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";
import { useThemePreference } from "@/hooks/use-theme-preference";

import { formatAmount } from "@/utils/helpers";
import { supabase } from "@/utils/supabase";

import { AuthGate } from "@/components/loading";
import { CurrencyPickerModal } from "@/components/modal/currency-picker-modal";
import { LanguagePickerModal } from "@/components/modal/language-picker-modal";
import { ChangePasswordModal } from "@/components/modal/reset-password-modal";
import { TerminateAccountModal } from "@/components/modal/terminate-account-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { Colors, greenColor, linkColor, mediumGreyColor, redColor, silverColor, whiteColor } from "@/constants/theme";
import {
    baseBorder,
    baseButton,
    baseButtonText,
    baseCenter,
    baseFlex,
    baseGap,
    baseInput,
    baseMain,
    baseSelect,
    baseSmall,
    baseWeight,
} from "@/styles/base";

export default function SettingsScreen() {
    const { t, i18n } = useTranslation();
    const { user, refreshUser, signOut } = useAuth();
    const router = useRouter();

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];
    const { preference, updatePreference } = useThemePreference();
    const { symbol: currencySymbol, code: currencyCode } = useCurrency();

    const [email, setEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [loading, setLoading] = useState(false);
    const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const [monthlyIncome, setMonthlyIncome] = useState<number | null>(null);
    const [changePasswordVisible, setChangePasswordVisible] = useState(false);
    const [terminateAccountVisible, setTerminateAccountVisible] = useState(false);

    const handleSaveProfile = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const updateData: any = {
                data: {
                    display_name: displayName,
                },
            };

            if (email !== user.email) {
                updateData.email = email;
            }

            const { error } = await supabase.auth.updateUser(updateData);

            if (error) {
                Alert.alert("Error", `Failed to update profile: ${error.message}`);
            } else {
                await refreshUser();
                Alert.alert("Success", "Profile updated successfully");
            }
        } catch (err) {
            console.error("Profile update error:", err);
            Alert.alert("Error", "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const hasProfileChanges = useMemo(() => {
        const baseEmail = user?.email || "";
        const baseDisplayName = user?.user_metadata?.display_name || "";

        return email.trim() !== baseEmail || displayName.trim() !== baseDisplayName;
    }, [user, email, displayName]);

    useEffect(() => {
        if (user) {
            setEmail(user.email || "");
            setDisplayName(user.user_metadata?.display_name || "");
        }
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            if (!user) {
                setMonthlyIncome(null);
                return;
            }
            supabase
                .from("incomes")
                .select("amount")
                .eq("user_id", user.id)
                .then(({ data, error }) => {
                    if (error || !Array.isArray(data)) {
                        setMonthlyIncome(null);
                    } else {
                        const total = data.reduce((sum, row) => {
                            const amt =
                                typeof row.amount === "number" ? row.amount : Number.parseFloat(String(row.amount));
                            return sum + (Number.isNaN(amt) ? 0 : amt);
                        }, 0);
                        setMonthlyIncome(total);
                    }
                });
        }, [user]),
    );

    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: {
                    paddingBottom: 24,
                },
                wrapper: {
                    ...baseMain,
                },
                heading: {
                    marginBottom: 16,
                },
                settingTitle: {
                    ...baseWeight,
                    marginTop: 8,
                    marginBottom: 8,
                    color: silverColor,
                },
                settingItem: {
                    paddingTop: 12,
                    paddingBottom: 20,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.dividerColor,
                },
                settingItemNoBorder: {
                    borderBottomWidth: 0,
                },
                settingItemLessPadding: {
                    paddingBottom: 8,
                },
                settingLabel: {
                    ...baseWeight,
                    ...baseSmall,
                    color: theme.label,
                    marginBottom: 12,
                },
                settingBox: {
                    ...baseFlex("space-between", "center"),
                },
                settingWrapper: {
                    ...baseGap,
                    flexDirection: "row",
                },
                settingLink: {
                    color: linkColor,
                    marginBottom: 0,
                },
                settingLabelNoMargin: {
                    marginBottom: 0,
                },
                settingValue: {
                    ...baseSmall,
                    color: theme.placeholder,
                },
                input: {
                    ...baseInput(theme),
                    ...baseSelect,
                },
                saveButton: {
                    ...baseButton,
                    backgroundColor: greenColor,
                },
                saveButtonDisabled: {
                    opacity: 0.5,
                },
                saveButtonText: {
                    ...baseButtonText,
                    color: whiteColor,
                },
                passwordButton: {
                    ...baseBorder,
                    ...baseButton,
                    marginTop: 16,
                    borderColor: mediumGreyColor,
                },
                passwordButtonText: {
                    ...baseButtonText,
                    color: theme.text,
                },
                hr: {
                    borderBottomColor: theme.dividerColor,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    marginTop: 16,
                },
                themeButton: {
                    ...baseInput(theme),
                    ...baseCenter,
                    flex: 1,
                },
                themeButtonActive: {
                    backgroundColor: theme.tint,
                    borderColor: theme.tint,
                },
                themeButtonText: {
                    color: theme.text,
                },
                themeButtonTextActive: {
                    ...baseWeight,
                    color: whiteColor,
                },
                linksContainer: {
                    ...baseCenter,
                    ...baseGap,
                    marginVertical: 12,
                },
                linksWrapper: {
                    ...baseFlex("center", "center"),
                    ...baseGap,
                },
                linkText: {
                    ...baseSmall,
                },
                logOutButton: {
                    ...baseBorder,
                    ...baseButton,
                    borderColor: redColor,
                },
                logOutButtonText: {
                    ...baseButtonText,
                    color: redColor,
                },
            }),
        [theme],
    );

    return (
        <AuthGate>
            <ScrollView contentContainerStyle={styles.container}>
                <ThemedView style={styles.wrapper}>
                    <ThemedText type="title" style={styles.heading}>
                        {t("settings.title")}
                    </ThemedText>

                    <ThemedView>
                        <ThemedText style={styles.settingTitle} type="subtitle">
                            {t("settings.subtitle.profile")}
                        </ThemedText>
                        <ThemedView
                            style={[styles.settingItem, styles.settingItemNoBorder, styles.settingItemLessPadding]}
                        >
                            <ThemedText style={styles.settingLabel}>{t("settings.label.email")}</ThemedText>
                            <TextInput
                                style={styles.input}
                                placeholder={t("auth.placeholder.email")}
                                placeholderTextColor={theme.placeholder}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                        </ThemedView>
                        <ThemedView style={[styles.settingItem, styles.settingItemNoBorder]}>
                            <ThemedText style={styles.settingLabel}>{t("settings.label.displayName")}</ThemedText>
                            <TextInput
                                style={styles.input}
                                placeholder={t("settings.placeholder.displayName")}
                                placeholderTextColor={theme.placeholder}
                                value={displayName}
                                onChangeText={setDisplayName}
                            />
                        </ThemedView>
                        <TouchableOpacity
                            style={[styles.saveButton, (!hasProfileChanges || loading) && styles.saveButtonDisabled]}
                            onPress={handleSaveProfile}
                            disabled={loading || !hasProfileChanges}
                        >
                            <ThemedText style={styles.saveButtonText}>
                                {loading ? t("common.saving") : t("settings.button.saveProfile")}
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.passwordButton} onPress={() => setChangePasswordVisible(true)}>
                            <ThemedText style={styles.passwordButtonText}>
                                {t("settings.button.changePassword")}
                            </ThemedText>
                        </TouchableOpacity>
                    </ThemedView>

                    <View style={styles.hr} />

                    <ThemedView>
                        <ThemedText style={styles.settingTitle} type="subtitle">
                            {t("settings.subtitle.appearance")}
                        </ThemedText>
                        <ThemedView style={styles.settingItem}>
                            <ThemedText style={styles.settingLabel}>{t("settings.label.theme")}</ThemedText>
                            <View style={styles.settingWrapper}>
                                <TouchableOpacity
                                    style={[styles.themeButton, preference === "light" && styles.themeButtonActive]}
                                    onPress={() => updatePreference("light")}
                                >
                                    <ThemedText
                                        style={[
                                            styles.themeButtonText,
                                            preference === "light" && styles.themeButtonTextActive,
                                        ]}
                                    >
                                        {t("settings.button.light")}
                                    </ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.themeButton, preference === "dark" && styles.themeButtonActive]}
                                    onPress={() => updatePreference("dark")}
                                >
                                    <ThemedText
                                        style={[
                                            styles.themeButtonText,
                                            preference === "dark" && styles.themeButtonTextActive,
                                        ]}
                                    >
                                        {t("settings.button.dark")}
                                    </ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.themeButton, preference === "system" && styles.themeButtonActive]}
                                    onPress={() => updatePreference("system")}
                                >
                                    <ThemedText
                                        style={[
                                            styles.themeButtonText,
                                            preference === "system" && styles.themeButtonTextActive,
                                        ]}
                                    >
                                        {t("settings.button.system")}
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView>
                        <ThemedText style={styles.settingTitle} type="subtitle">
                            {t("settings.subtitle.currency")}
                        </ThemedText>
                        <TouchableOpacity style={styles.settingItem} onPress={() => setCurrencyModalVisible(true)}>
                            <View style={styles.settingBox}>
                                <ThemedText style={[styles.settingLabel, styles.settingLink]}>
                                    {t("settings.link.currencySymbol")}
                                </ThemedText>
                                <ThemedText style={styles.settingValue}>
                                    {currencySymbol} ({currencyCode})
                                </ThemedText>
                            </View>
                        </TouchableOpacity>
                    </ThemedView>

                    <ThemedView>
                        <ThemedText style={styles.settingTitle} type="subtitle">
                            {t("settings.subtitle.income")}
                        </ThemedText>
                        <TouchableOpacity style={styles.settingItem} onPress={() => router.push("/income")}>
                            <View style={styles.settingBox}>
                                <ThemedText style={[styles.settingLabel, styles.settingLink]}>
                                    {t("settings.link.monthlyIncome")}
                                </ThemedText>
                                <ThemedText style={styles.settingValue}>
                                    {monthlyIncome === null ? t("settings.notSet") : formatAmount(monthlyIncome)}
                                </ThemedText>
                            </View>
                        </TouchableOpacity>
                    </ThemedView>

                    <ThemedView>
                        <ThemedText style={styles.settingTitle} type="subtitle">
                            {t("settings.subtitle.language")}
                        </ThemedText>
                        <TouchableOpacity style={[styles.settingItem]} onPress={() => setLanguageModalVisible(true)}>
                            <View style={styles.settingBox}>
                                <ThemedText style={[styles.settingLabel, styles.settingLink]}>
                                    {t("settings.link.selectLanguage")}
                                </ThemedText>
                                <ThemedText style={styles.settingValue}>
                                    {i18n.language === "nl" ? "Nederlands" : "English"}
                                </ThemedText>
                            </View>
                        </TouchableOpacity>
                    </ThemedView>

                    <ThemedView>
                        <ThemedText style={styles.settingTitle} type="subtitle">
                            {t("settings.subtitle.helpdesk")}
                        </ThemedText>
                        <ThemedView style={[styles.settingItem]}>
                            <ThemedText style={styles.settingLabel}>{t("settings.label.helpdesk")}</ThemedText>
                            <TouchableOpacity onPress={() => router.push("/helpdesk")}>
                                <View style={styles.settingBox}>
                                    <ThemedText style={[styles.settingLabel, styles.settingLink]}>
                                        {t("settings.link.submitTicket")}
                                    </ThemedText>
                                </View>
                            </TouchableOpacity>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView>
                        <ThemedText style={styles.settingTitle} type="subtitle">
                            {t("settings.subtitle.about")}
                        </ThemedText>
                        <ThemedView style={[styles.settingItem]}>
                            <ThemedText style={styles.settingLabel}>{t("settings.label.version")}</ThemedText>
                            <ThemedText style={styles.settingValue}>1.0.0</ThemedText>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.linksContainer}>
                        <View style={styles.linksWrapper}>
                            <Link href="/terms" asChild>
                                <TouchableOpacity>
                                    <ThemedText type="link" style={styles.linkText}>
                                        {t("settings.link.terms")}
                                    </ThemedText>
                                </TouchableOpacity>
                            </Link>
                            <ThemedText type="label">•</ThemedText>
                            <Link href="/privacy" asChild>
                                <TouchableOpacity>
                                    <ThemedText type="link" style={styles.linkText}>
                                        {t("settings.link.privacy")}
                                    </ThemedText>
                                </TouchableOpacity>
                            </Link>
                        </View>
                        <View style={styles.linksWrapper}>
                            <TouchableOpacity onPress={() => setTerminateAccountVisible(true)}>
                                <ThemedText type="link" style={styles.linkText}>
                                    {user?.user_metadata?.deleteRequested ?
                                        t("settings.link.undoTermination")
                                    :   t("settings.link.terminateAccount")}
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </ThemedView>

                    <TouchableOpacity
                        style={[styles.logOutButton]}
                        onPress={async () => {
                            await signOut();
                        }}
                    >
                        <ThemedText style={styles.logOutButtonText}> {t("settings.button.signOut")}</ThemedText>
                    </TouchableOpacity>
                </ThemedView>

                <CurrencyPickerModal
                    visible={currencyModalVisible}
                    onClose={() => setCurrencyModalVisible(false)}
                    currentSymbol={currencySymbol}
                />
                <LanguagePickerModal visible={languageModalVisible} onClose={() => setLanguageModalVisible(false)} />
                <ChangePasswordModal visible={changePasswordVisible} onClose={() => setChangePasswordVisible(false)} />
                <TerminateAccountModal
                    visible={terminateAccountVisible}
                    onClose={() => setTerminateAccountVisible(false)}
                />
            </ScrollView>
        </AuthGate>
    );
}
