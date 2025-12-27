import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, greenColor, silverColor, whiteColor } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "@/utils/supabase";

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];
    const { user, refreshUser } = useAuth();

    const [displayName, setDisplayName] = useState("");
    const [loading, setLoading] = useState(false);

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

    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: {
                    flex: 1,
                },
                wrapper: {
                    padding: 16,
                    paddingTop: 24,
                    gap: 12,
                },
                heading: {
                    marginBottom: 16,
                },
                section: {
                    marginBottom: 0,
                },
                sectionTitle: {
                    marginTop: 8,
                    marginBottom: 8,
                    fontWeight: "600",
                    color: silverColor,
                },
                settingItem: {
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.dividerColor,
                },
                settingItemLast: {
                    borderBottomWidth: 0,
                },
                settingLabel: {
                    fontSize: 14,
                    color: theme.label,
                    fontWeight: "600",
                    marginBottom: 12,
                },
                settingValue: {
                    fontSize: 14,
                    color: theme.placeholder,
                },
                input: {
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    fontSize: 16,
                    color: theme.inputText,
                    borderColor: theme.inputBorder,
                    backgroundColor: theme.inputBackground,
                    marginTop: 4,
                },
                saveButton: {
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: "center",
                    marginTop: 12,
                    backgroundColor: greenColor,
                },
                saveButtonText: {
                    color: whiteColor,
                    fontWeight: "600",
                    fontSize: 16,
                },
            }),
        [theme]
    );

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 24 }}
        >
            <ThemedView style={styles.wrapper}>
                <ThemedText type="title" style={styles.heading}>
                    Settings
                </ThemedText>

                <ThemedView style={styles.section}>
                    <ThemedText style={styles.sectionTitle} type="subtitle">
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
                        style={[styles.settingItem, styles.settingItemLast]}
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

                <ThemedView style={styles.section}>
                    <ThemedText style={styles.sectionTitle} type="subtitle">
                        Appearance
                    </ThemedText>
                    <ThemedView style={[styles.settingItem]}>
                        <ThemedText style={styles.settingLabel}>
                            Theme
                        </ThemedText>
                        <ThemedText style={styles.settingValue}>
                            {colorScheme === "dark" ? "Dark" : "Light"}
                        </ThemedText>
                    </ThemedView>
                </ThemedView>

                <ThemedView style={styles.section}>
                    <ThemedText style={styles.sectionTitle} type="subtitle">
                        Currency
                    </ThemedText>
                    <ThemedView style={[styles.settingItem]}>
                        <ThemedText style={styles.settingLabel}>
                            Currency Symbol
                        </ThemedText>
                        <ThemedText style={styles.settingValue}>
                            € (EUR)
                        </ThemedText>
                    </ThemedView>
                </ThemedView>

                <ThemedView style={styles.section}>
                    <ThemedText style={styles.sectionTitle} type="subtitle">
                        About
                    </ThemedText>
                    <ThemedView
                        style={[styles.settingItem, styles.settingItemLast]}
                    >
                        <ThemedText style={styles.settingLabel}>
                            Version
                        </ThemedText>
                        <ThemedText style={styles.settingValue}>
                            1.0.0
                        </ThemedText>
                    </ThemedView>
                </ThemedView>
            </ThemedView>
        </ScrollView>
    );
}
