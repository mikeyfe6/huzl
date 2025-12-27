import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: {
                    flex: 1,
                },
                wrapper: {
                    paddingHorizontal: 16,
                },
                heading: {
                    marginTop: 24,
                    marginBottom: 16,
                },
                section: {
                    marginBottom: 24,
                },
                sectionTitle: {
                    marginBottom: 8,
                    fontSize: 14,
                    fontWeight: "600",
                    color: theme.label,
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
                    fontSize: 16,
                    color: theme.text,
                },
                settingValue: {
                    fontSize: 14,
                    color: theme.placeholder,
                    marginTop: 4,
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
                    <ThemedText style={styles.sectionTitle}>
                        Appearance
                    </ThemedText>
                    <ThemedView style={styles.settingItem}>
                        <ThemedText style={styles.settingLabel}>
                            Theme
                        </ThemedText>
                        <ThemedText style={styles.settingValue}>
                            {colorScheme === "dark" ? "Dark" : "Light"}
                        </ThemedText>
                    </ThemedView>
                </ThemedView>

                <ThemedView style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>
                        Currency
                    </ThemedText>
                    <ThemedView style={styles.settingItem}>
                        <ThemedText style={styles.settingLabel}>
                            Currency Symbol
                        </ThemedText>
                        <ThemedText style={styles.settingValue}>
                            € (EUR)
                        </ThemedText>
                    </ThemedView>
                </ThemedView>

                <ThemedView style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>About</ThemedText>
                    <ThemedView style={styles.settingItem}>
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
