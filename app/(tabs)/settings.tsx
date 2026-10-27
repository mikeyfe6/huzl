import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useFocusEffect } from "expo-router/react-navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Platform, Pressable, ScrollView, Switch, TextInput, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";
import { useThemePreference } from "@/hooks/use-theme-preference";

import { formatAmount, formatTotalMonthlyIncome } from "@/utils/helpers";
import {
    getDebtNotificationsPreferenceAsync,
    REMINDER_HOUR,
    REMINDER_MINUTE,
    setDebtNotificationsPreferenceAsync,
} from "@/utils/notifications";
import { supabase } from "@/utils/supabase";

import { ExternalLink } from "@/components/external-link";
import { CurrencyPickerModal } from "@/components/modal/currency-picker-modal";
import { LanguagePickerModal } from "@/components/modal/language-picker-modal";
import { ChangePasswordModal } from "@/components/modal/reset-password-modal";
import { TerminateAccountModal } from "@/components/modal/terminate-account-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AuthGate } from "@/components/ui/loading";

import { HUZL_APP_STORE_URL, HUZL_MENEFEX_URL, HUZL_PLAY_STORE_URL } from "@/constants/links";
import { Colors, linkColor, mediumGreyColor, whiteColor } from "@/constants/theme";
import { baseInactive } from "@/styles/base";

import { getSettingsStyles } from "@/styles/settings";

import packageJson from "@/package.json";

export default function SettingsScreen() {
    const { t, i18n } = useTranslation();
    const { user, refreshUser, signOut } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [loading, setLoading] = useState(false);
    const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const [monthlyIncome, setMonthlyIncome] = useState<number | null>(null);
    const [changePasswordVisible, setChangePasswordVisible] = useState(false);
    const [terminateAccountVisible, setTerminateAccountVisible] = useState(false);
    const [debtRemindersEnabled, setDebtRemindersEnabled] = useState(true);

    const { symbol: currencySymbol, code: currencyCode } = useCurrency();
    const { preference, updatePreference } = useThemePreference();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];
    const styles = useMemo(() => getSettingsStyles(theme), [theme]);

    useEffect(() => {
        void getDebtNotificationsPreferenceAsync().then(setDebtRemindersEnabled);
    }, []);

    const handleToggleDebtReminders = async (value: boolean) => {
        setDebtRemindersEnabled(value);
        await setDebtNotificationsPreferenceAsync(value);
    };

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
            let cancelled = false;

            const loadIncome = async () => {
                const { data, error } = await supabase
                    .from("incomes")
                    .select("id, amount, frequency, active, variable, tracking_started_at")
                    .eq("user_id", user.id);

                if (cancelled) return;

                if (error || !Array.isArray(data)) {
                    setMonthlyIncome(null);
                    return;
                }

                const activeIncomes = data.filter((income) => income.active !== false);
                const incomeIds = activeIncomes.map((income) => income.id);
                const { data: payments, error: paymentsError } =
                    incomeIds.length > 0 ?
                        await supabase
                            .from("income_payments")
                            .select("income_id, amount, received_at")
                            .in("income_id", incomeIds)
                    :   { data: [], error: null };

                if (cancelled) return;

                if (paymentsError || !Array.isArray(payments)) {
                    setMonthlyIncome(null);
                    return;
                }

                const total = formatTotalMonthlyIncome(
                    activeIncomes.map((income) => ({
                        id: income.id,
                        amount: Number(income.amount),
                        frequency: income.frequency,
                        active: income.active,
                        variable: income.variable === true,
                        tracking_started_at: income.tracking_started_at,
                    })),
                    payments.map((payment) => ({
                        income_id: payment.income_id,
                        amount: Number(payment.amount),
                        received_at: payment.received_at,
                    })),
                );

                setMonthlyIncome(total);
            };

            void loadIncome();

            return () => {
                cancelled = true;
            };
        }, [user]),
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
                            <ThemedText style={styles.settingLabel}>{t("settings.label.displayName")}</ThemedText>
                            <TextInput
                                style={styles.input}
                                placeholder={t("settings.placeholder.displayName")}
                                placeholderTextColor={theme.placeholder}
                                value={displayName}
                                onChangeText={setDisplayName}
                            />
                        </ThemedView>
                        <ThemedView style={[styles.settingItem, styles.settingItemNoBorder]}>
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
                        <Pressable
                            style={[styles.saveButton, (!hasProfileChanges || loading) && baseInactive]}
                            onPress={handleSaveProfile}
                            disabled={loading || !hasProfileChanges}
                        >
                            <ThemedText style={styles.saveButtonText}>
                                {loading ? t("common.saving") : t("settings.button.saveProfile")}
                            </ThemedText>
                        </Pressable>
                        <Pressable style={styles.passwordButton} onPress={() => setChangePasswordVisible(true)}>
                            <ThemedText style={styles.passwordButtonText}>
                                {t("settings.button.changePassword")}
                            </ThemedText>
                        </Pressable>
                    </ThemedView>

                    <View style={styles.hr} />

                    <ThemedView>
                        <ThemedText style={styles.settingTitle} type="subtitle">
                            {t("settings.subtitle.appearance")}
                        </ThemedText>
                        <ThemedView style={styles.settingItem}>
                            <ThemedText style={styles.settingLabel}>{t("settings.label.theme")}</ThemedText>
                            <View style={styles.settingWrapper}>
                                <Pressable
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
                                </Pressable>
                                <Pressable
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
                                </Pressable>
                                <Pressable
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
                                </Pressable>
                            </View>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView>
                        <ThemedText style={styles.settingTitle} type="subtitle">
                            {t("settings.subtitle.currency")}
                        </ThemedText>
                        <Pressable style={styles.settingItem} onPress={() => setCurrencyModalVisible(true)}>
                            <View style={styles.settingBox}>
                                <ThemedText style={[styles.settingLabel, styles.settingLink]}>
                                    {t("settings.link.currencySymbol")}
                                </ThemedText>
                                <ThemedText style={styles.settingValue}>
                                    {currencySymbol} ({currencyCode})
                                </ThemedText>
                            </View>
                        </Pressable>
                    </ThemedView>

                    <ThemedView>
                        <ThemedText style={styles.settingTitle} type="subtitle">
                            {t("settings.subtitle.income")}
                        </ThemedText>
                        <Pressable style={styles.settingItem} onPress={() => router.push("/income")}>
                            <View style={styles.settingBox}>
                                <ThemedText style={[styles.settingLabel, styles.settingLink]}>
                                    {t("settings.link.monthlyIncome")}
                                </ThemedText>
                                <ThemedText style={styles.settingValue}>
                                    {monthlyIncome === null ? t("settings.notSet") : formatAmount(monthlyIncome)}
                                </ThemedText>
                            </View>
                        </Pressable>
                    </ThemedView>

                    <ThemedView>
                        <ThemedText style={styles.settingTitle} type="subtitle">
                            {t("settings.subtitle.language")}
                        </ThemedText>
                        <Pressable style={[styles.settingItem]} onPress={() => setLanguageModalVisible(true)}>
                            <View style={styles.settingBox}>
                                <ThemedText style={[styles.settingLabel, styles.settingLink]}>
                                    {t("settings.link.selectLanguage")}
                                </ThemedText>
                                <ThemedText style={styles.settingValue}>
                                    {i18n.language === "nl" ? "Nederlands" : "English"}
                                </ThemedText>
                            </View>
                        </Pressable>
                    </ThemedView>

                    {Platform.OS !== "web" && (
                        <ThemedView>
                            <ThemedText style={styles.settingTitle} type="subtitle">
                                {t("settings.subtitle.notifications")}
                            </ThemedText>
                            <ThemedView style={styles.settingItem}>
                                <View style={styles.settingBox}>
                                    <ThemedView>
                                        <ThemedText style={styles.settingLabel}>
                                            {t("settings.label.debtReminders")}
                                        </ThemedText>
                                        <ThemedText style={styles.settingValue}>
                                            {t("settings.label.debtRemindersDescription", {
                                                time: `${String(REMINDER_HOUR).padStart(2, "0")}:${String(
                                                    REMINDER_MINUTE,
                                                ).padStart(2, "0")}`,
                                            })}
                                        </ThemedText>
                                    </ThemedView>
                                    <Switch
                                        value={debtRemindersEnabled}
                                        onValueChange={(value) => void handleToggleDebtReminders(value)}
                                        trackColor={{ false: mediumGreyColor, true: linkColor }}
                                        thumbColor={whiteColor}
                                        ios_backgroundColor={mediumGreyColor}
                                    />
                                </View>
                            </ThemedView>
                        </ThemedView>
                    )}

                    <ThemedView>
                        <ThemedText style={styles.settingTitle} type="subtitle">
                            {t("settings.subtitle.helpdesk")}
                        </ThemedText>
                        <ThemedView style={[styles.settingItem]}>
                            <ThemedText style={styles.settingLabel}>{t("settings.label.helpdesk")}</ThemedText>
                            <Pressable onPress={() => router.push("/helpdesk")}>
                                <View style={styles.settingBox}>
                                    <ThemedText style={[styles.settingLabel, styles.settingLink]}>
                                        {t("settings.link.submitTicket")}
                                    </ThemedText>
                                </View>
                            </Pressable>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView>
                        <ThemedText style={styles.settingTitle} type="subtitle">
                            {t("settings.subtitle.about")}
                        </ThemedText>
                        <ThemedView style={[styles.settingItem]}>
                            <ThemedText style={styles.settingLabel}>{t("settings.label.version")}</ThemedText>
                            <ThemedText style={styles.settingValue}>{packageJson.version}</ThemedText>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.linksContainer}>
                        {Platform.OS === "web" && (
                            <View style={styles.linksApps}>
                                <ExternalLink href={HUZL_APP_STORE_URL} theme={theme} style={styles.linksApp}>
                                    <Ionicons name="logo-apple-appstore" size={18} color={linkColor} />{" "}
                                    <ThemedText type="app" style={styles.linkText}>
                                        {t("common.downloadOnAppStore")}
                                    </ThemedText>
                                </ExternalLink>
                                <ExternalLink href={HUZL_PLAY_STORE_URL} theme={theme} style={styles.linksApp}>
                                    <Ionicons name="logo-google-playstore" size={18} color={linkColor} />{" "}
                                    <ThemedText type="app" style={styles.linkText}>
                                        {t("common.downloadOnPlayStore")}
                                    </ThemedText>
                                </ExternalLink>
                            </View>
                        )}
                        <View style={styles.linksWrapper}>
                            <Link href="/terms" asChild>
                                <Pressable>
                                    <ThemedText type="link" style={styles.linkText}>
                                        {t("settings.link.terms")}
                                    </ThemedText>
                                </Pressable>
                            </Link>
                            <ThemedText type="label">•</ThemedText>
                            <Link href="/privacy" asChild>
                                <Pressable>
                                    <ThemedText type="link" style={styles.linkText}>
                                        {t("settings.link.privacy")}
                                    </ThemedText>
                                </Pressable>
                            </Link>
                        </View>
                        <View style={styles.linksWrapper}>
                            <Pressable onPress={() => setTerminateAccountVisible(true)}>
                                <ThemedText type="link-danger" style={styles.linkText}>
                                    {user?.user_metadata?.deleteRequested ?
                                        t("settings.link.undoTermination")
                                    :   t("settings.link.terminateAccount")}
                                </ThemedText>
                            </Pressable>
                        </View>
                        <View style={styles.poweredBy}>
                            <ExternalLink href={HUZL_MENEFEX_URL} theme={theme}>
                                <ThemedText style={styles.poweredByText}>{t("common.poweredBy")} </ThemedText>
                            </ExternalLink>
                        </View>
                    </ThemedView>

                    <Pressable
                        style={[styles.logOutButton]}
                        onPress={async () => {
                            await signOut();
                        }}
                    >
                        <ThemedText style={styles.logOutButtonText}> {t("settings.button.signOut")}</ThemedText>
                    </Pressable>
                </ThemedView>

                <CurrencyPickerModal
                    visible={currencyModalVisible}
                    onClose={() => setCurrencyModalVisible(false)}
                    currentSymbol={currencySymbol}
                    theme={theme}
                />
                <LanguagePickerModal
                    visible={languageModalVisible}
                    onClose={() => setLanguageModalVisible(false)}
                    theme={theme}
                />
                <ChangePasswordModal
                    visible={changePasswordVisible}
                    onClose={() => setChangePasswordVisible(false)}
                    theme={theme}
                />
                <TerminateAccountModal
                    visible={terminateAccountVisible}
                    onClose={() => setTerminateAccountVisible(false)}
                    theme={theme}
                />
            </ScrollView>
        </AuthGate>
    );
}
