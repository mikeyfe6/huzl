import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { CurrencyPickerModal } from "@/components/ui/currency-modal";
import {
    Colors,
    greenColor,
    linkColor,
    redColor,
    silverColor,
    whiteColor,
} from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";
import { useThemePreference } from "@/hooks/use-theme-preference";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
    const { user, refreshUser, signOut } = useAuth();
    const router = useRouter();

    useEffect(() => {
        let mounted = true;
        if (mounted && !user) {
            router.replace("/");
        }
        return () => {
            mounted = false;
        };
    }, [user]);

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];
    const { preference, updatePreference } = useThemePreference();
    const { symbol: currencySymbol, code: currencyCode } = useCurrency();

    const [displayName, setDisplayName] = useState("");
    const [loading, setLoading] = useState(false);
    const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

    useEffect(() => {
        if (user?.user_metadata) {
            setDisplayName(user.user_metadata.display_name || "");
        }
    }, [user]);

    const handleSaveProfile = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    display_name: displayName,
                },
            });

            if (error) {
                Alert.alert(
                    "Error",
                    `Failed to update profile: ${error.message}`
                );
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

    const baseGap = { gap: 12 };

    const baseWeight = { fontWeight: "600" as const };

    const baseRadius = { borderRadius: 8 };

    const baseBorder = { borderWidth: 1 };

    const baseCenter = {
        alignItems: "center" as const,
        justifyContent: "center" as const,
    };

    const baseMain = {
        ...baseGap,
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 16,
    };

    const baseInput = {
        ...baseRadius,
        ...baseBorder,
        borderColor: theme.inputBorder,
        backgroundColor: theme.inputBackground,
        outlineWidth: 0,
        minHeight: 44,
    };

    const baseSelect = {
        paddingHorizontal: 12,
        paddingVertical: 10,
    };

    const baseButton = {
        ...baseRadius,
        ...baseCenter,
        paddingVertical: 12,
    };

    const baseButtonText = {
        ...baseWeight,
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
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
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
                    ...baseInput,
                    ...baseSelect,
                    color: theme.inputText,
                },
                saveButton: {
                    ...baseButton,
                    backgroundColor: greenColor,
                },
                saveButtonText: {
                    ...baseButtonText,
                    color: whiteColor,
                },
                logOut: {
                    marginTop: 24,
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
                themeButton: {
                    ...baseInput,
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
            }),
        [theme]
    );

    const monthlyIncome = useMemo(() => {
        const val = (user?.user_metadata as any)?.monthly_income;
        if (typeof val === "number") return val;
        if (val) return Number.parseFloat(String(val));
        return null;
    }, [user]);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <ThemedView style={styles.wrapper}>
                <ThemedText type="title" style={styles.heading}>
                    Settings
                </ThemedText>

                <ThemedView>
                    <ThemedText style={styles.settingTitle} type="subtitle">
                        Profile
                    </ThemedText>
                    <ThemedView style={styles.settingItem}>
                        <ThemedText style={styles.settingLabel}>
                            Email
                        </ThemedText>
                        <ThemedText style={styles.settingValue}>
                            {user?.email || "Not set"}
                        </ThemedText>
                    </ThemedView>
                    <ThemedView
                        style={[styles.settingItem, styles.settingItemNoBorder]}
                    >
                        <ThemedText style={styles.settingLabel}>
                            Display Name
                        </ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="Your name"
                            placeholderTextColor={theme.placeholder}
                            value={displayName}
                            onChangeText={setDisplayName}
                        />
                    </ThemedView>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSaveProfile}
                        disabled={loading}
                    >
                        <ThemedText style={styles.saveButtonText}>
                            {loading ? "Saving..." : "Save Profile"}
                        </ThemedText>
                    </TouchableOpacity>
                </ThemedView>

                <ThemedView>
                    <ThemedText style={styles.settingTitle} type="subtitle">
                        Appearance
                    </ThemedText>
                    <ThemedView style={styles.settingItem}>
                        <ThemedText style={styles.settingLabel}>
                            Theme
                        </ThemedText>
                        <View style={styles.settingWrapper}>
                            <TouchableOpacity
                                style={[
                                    styles.themeButton,
                                    preference === "light" &&
                                        styles.themeButtonActive,
                                ]}
                                onPress={() => updatePreference("light")}
                            >
                                <ThemedText
                                    style={[
                                        styles.themeButtonText,
                                        preference === "light" &&
                                            styles.themeButtonTextActive,
                                    ]}
                                >
                                    Light
                                </ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.themeButton,
                                    preference === "dark" &&
                                        styles.themeButtonActive,
                                ]}
                                onPress={() => updatePreference("dark")}
                            >
                                <ThemedText
                                    style={[
                                        styles.themeButtonText,
                                        preference === "dark" &&
                                            styles.themeButtonTextActive,
                                    ]}
                                >
                                    Dark
                                </ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.themeButton,
                                    preference === "system" &&
                                        styles.themeButtonActive,
                                ]}
                                onPress={() => updatePreference("system")}
                            >
                                <ThemedText
                                    style={[
                                        styles.themeButtonText,
                                        preference === "system" &&
                                            styles.themeButtonTextActive,
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
                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={() => setCurrencyModalVisible(true)}
                    >
                        <View style={styles.settingBox}>
                            <ThemedText
                                style={[
                                    styles.settingLabel,
                                    styles.settingLabelNoMargin,
                                    styles.settingLink,
                                ]}
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
                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={() => router.push("/income")}
                    >
                        <View style={styles.settingBox}>
                            <ThemedText
                                style={[
                                    styles.settingLabel,
                                    styles.settingLabelNoMargin,
                                    styles.settingLink,
                                ]}
                            >
                                Monthly Income
                            </ThemedText>
                            <ThemedText style={styles.settingValue}>
                                {monthlyIncome === null
                                    ? "Not set"
                                    : monthlyIncome}
                            </ThemedText>
                        </View>
                    </TouchableOpacity>
                </ThemedView>

                <ThemedView>
                    <ThemedText style={styles.settingTitle} type="subtitle">
                        About
                    </ThemedText>
                    <ThemedView style={[styles.settingItem]}>
                        <ThemedText style={styles.settingLabel}>
                            Version
                        </ThemedText>
                        <ThemedText style={styles.settingValue}>
                            1.0.0
                        </ThemedText>
                    </ThemedView>
                </ThemedView>

                <ThemedView style={[styles.logOut]}>
                    <TouchableOpacity
                        style={[styles.logOutButton]}
                        onPress={async () => {
                            await signOut();
                        }}
                    >
                        <ThemedText style={styles.logOutButtonText}>
                            Log Out
                        </ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            </ThemedView>

            <CurrencyPickerModal
                visible={currencyModalVisible}
                onClose={() => setCurrencyModalVisible(false)}
                currentSymbol={currencySymbol}
            />
        </ScrollView>
    );
}
