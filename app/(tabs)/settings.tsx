import { Link, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";
import { useThemePreference } from "@/hooks/use-theme-preference";

import { supabase } from "@/utils/supabase";

import { formatAmount } from "@/utils/helpers";

import { AuthGate } from "@/components/loading";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { CurrencyPickerModal } from "@/components/ui/currency-modal";

import { Colors, greenColor, linkColor, redColor, silverColor, whiteColor } from "@/constants/theme";
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
    baseWeight,
} from "@/styles/base";

export default function SettingsScreen() {
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

    useEffect(() => {
        if (user) {
            setEmail(user.email || "");
            setDisplayName(user.user_metadata?.display_name || "");
        }
    }, [user]);

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
                    borderBottomWidth: 1,
                    borderBottomColor: theme.dividerColor,
                },
                settingItemNoBorder: {
                    borderBottomWidth: 0,
                },
                settingLabel: {
                    ...baseWeight,
                    fontSize: 14,
                    color: theme.label,
                    marginBottom: 12,
                },
                settingBox: {
                    ...baseFlex("space-between", "center"),
                },
                settingWrapper: {
                    ...baseGap,
                    flexDirection: "row",
                    marginTop: 8,
                },
                settingLink: {
                    color: linkColor,
                },
                settingLabelNoMargin: {
                    marginBottom: 0,
                },
                settingValue: {
                    fontSize: 14,
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
                hr: {
                    borderBottomColor: theme.dividerColor,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    marginTop: 16,
                },
                saveButtonText: {
                    ...baseButtonText,
                    color: whiteColor,
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
                    ...baseFlex("center", "center"),
                    ...baseGap,
                    marginTop: 20,
                },
                linkText: {
                    fontSize: 14,
                },
                logOutButton: {
                    marginTop: 12,
                    ...baseBorder,
                    ...baseButton,
                    borderColor: redColor,
                },
                logOutButtonText: {
                    ...baseButtonText,
                    color: redColor,
                },
            }),
        [theme]
    );

    const monthlyIncome = useMemo(() => {
        const val = (user?.user_metadata as any)?.monthly_income;
        if (typeof val === "number") return val;
        if (val) return Number.parseFloat(String(val));
        return null;
    }, [user]);

    const hasProfileChanges = useMemo(() => {
        const baseEmail = user?.email || "";
        const baseDisplayName = user?.user_metadata?.display_name || "";

        return email.trim() !== baseEmail || displayName.trim() !== baseDisplayName;
    }, [user, email, displayName]);

    return (
        <AuthGate>
            <ScrollView contentContainerStyle={styles.container}>
                <ThemedView style={styles.wrapper}>
                    <ThemedText type="title" style={styles.heading}>
                        Settings
                    </ThemedText>

                    <ThemedView>
                        <ThemedText style={styles.settingTitle} type="subtitle">
                            Profile
                        </ThemedText>
                        <ThemedView style={[styles.settingItem, styles.settingItemNoBorder]}>
                            <ThemedText style={styles.settingLabel}>Email</ThemedText>
                            <TextInput
                                style={styles.input}
                                placeholder="your@email.com"
                                placeholderTextColor={theme.placeholder}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                        </ThemedView>
                        <ThemedView style={[styles.settingItem, styles.settingItemNoBorder]}>
                            <ThemedText style={styles.settingLabel}>Display Name</ThemedText>
                            <TextInput
                                style={styles.input}
                                placeholder="Your name"
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
                                {loading ? "Saving..." : "Save Profile"}
                            </ThemedText>
                        </TouchableOpacity>
                    </ThemedView>

                    <View style={styles.hr} />

                    <ThemedView>
                        <ThemedText style={styles.settingTitle} type="subtitle">
                            Appearance
                        </ThemedText>
                        <ThemedView style={styles.settingItem}>
                            <ThemedText style={styles.settingLabel}>Theme</ThemedText>
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
                                        Light
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
                                        Dark
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
                                        System
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView>
                        <ThemedText style={styles.settingTitle} type="subtitle">
                            Currency
                        </ThemedText>
                        <TouchableOpacity style={styles.settingItem} onPress={() => setCurrencyModalVisible(true)}>
                            <View style={styles.settingBox}>
                                <ThemedText
                                    style={[styles.settingLabel, styles.settingLabelNoMargin, styles.settingLink]}
                                >
                                    Currency Symbol
                                </ThemedText>
                                <ThemedText style={styles.settingValue}>
                                    {currencySymbol} ({currencyCode})
                                </ThemedText>
                            </View>
                        </TouchableOpacity>
                    </ThemedView>

                    <ThemedView>
                        <ThemedText style={styles.settingTitle} type="subtitle">
                            Income
                        </ThemedText>
                        <TouchableOpacity style={styles.settingItem} onPress={() => router.push("/income")}>
                            <View style={styles.settingBox}>
                                <ThemedText
                                    style={[styles.settingLabel, styles.settingLabelNoMargin, styles.settingLink]}
                                >
                                    Monthly Income
                                </ThemedText>
                                <ThemedText style={styles.settingValue}>
                                    {monthlyIncome === null ? "Not set" : formatAmount(monthlyIncome)}
                                </ThemedText>
                            </View>
                        </TouchableOpacity>
                    </ThemedView>

                    <ThemedView>
                        <ThemedText style={styles.settingTitle} type="subtitle">
                            About
                        </ThemedText>
                        <ThemedView style={[styles.settingItem]}>
                            <ThemedText style={styles.settingLabel}>Version</ThemedText>
                            <ThemedText style={styles.settingValue}>1.0.0</ThemedText>
                        </ThemedView>
                        <View style={styles.linksContainer}>
                            <Link href="/terms" asChild>
                                <TouchableOpacity>
                                    <ThemedText type="link" style={styles.linkText}>
                                        Voorwaarden
                                    </ThemedText>
                                </TouchableOpacity>
                            </Link>
                            <ThemedText type="label">•</ThemedText>
                            <Link href="/privacy" asChild>
                                <TouchableOpacity>
                                    <ThemedText type="link" style={styles.linkText}>
                                        Privacy
                                    </ThemedText>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </ThemedView>

                    <TouchableOpacity
                        style={[styles.logOutButton]}
                        onPress={async () => {
                            await signOut();
                        }}
                    >
                        <ThemedText style={styles.logOutButtonText}>Log Out</ThemedText>
                    </TouchableOpacity>
                </ThemedView>

                <CurrencyPickerModal
                    visible={currencyModalVisible}
                    onClose={() => setCurrencyModalVisible(false)}
                    currentSymbol={currencySymbol}
                />
            </ScrollView>
        </AuthGate>
    );
}
