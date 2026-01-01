import { router } from "expo-router";
import { Alert, Platform, StyleSheet, TextInput, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, greenColor, silverColor, whiteColor } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";
import { supabase } from "@/utils/supabase";
import { useMemo, useState } from "react";

export default function ModalScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];
    const { user, refreshUser } = useAuth();
    const { symbol: currencySymbol } = useCurrency();

    const [income, setIncome] = useState<string>(() => {
        const val = (user?.user_metadata as any)?.monthly_income;
        if (typeof val === "number") return String(val);
        if (typeof val === "string") return val;
        return "";
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!user) return;
        const parsed = Number.parseFloat(income);
        if (Number.isNaN(parsed) || parsed < 0) {
            Alert.alert("Invalid amount", "Please enter a valid non-negative number.");
            return;
        }
        setSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { monthly_income: parsed },
            });
            if (error) {
                Alert.alert("Error", `Failed to save income: ${error.message}`);
                return;
            }
            await refreshUser();
            Alert.alert("Saved", "Monthly income updated.");
            router.back();
        } catch (e) {
            console.error("Save income error:", e);
            const msg = e instanceof Error ? e.message : "An unexpected error occurred.";
            Alert.alert("Error", msg);
        } finally {
            setSaving(false);
        }
    };

    // TODO: refactoring styles...

    const styles = useMemo(
        () =>
            StyleSheet.create({
                outerContainer: {
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 20,
                },
                container: {
                    width: "100%",
                    maxWidth: Platform.select({
                        ios: undefined,
                        android: undefined,
                        default: 400,
                    }),
                },
                title: {
                    marginBottom: 16,
                    textAlign: "center",
                },
                label: {
                    fontSize: 14,
                    color: theme.label,
                    fontWeight: "600",
                    marginBottom: 12,
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
                hint: {
                    color: silverColor,
                    textAlign: "center",
                    marginBottom: 24,
                },
                actions: {
                    marginTop: 20,
                    gap: 12,
                },
                saveButton: {
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: "center",
                    backgroundColor: greenColor,
                },
                saveButtonText: {
                    color: whiteColor,
                    fontWeight: "600",
                    fontSize: 16,
                },
                cancelLink: {
                    paddingVertical: 8,
                    alignItems: "center",
                },
            }),
        [theme]
    );

    return (
        <ThemedView style={styles.outerContainer}>
            <ThemedView style={styles.container}>
                <ThemedText type="title" style={styles.title}>
                    Set Monthly Income
                </ThemedText>
                <ThemedText style={styles.hint}>Used for budget and summaries.</ThemedText>
                <ThemedText style={styles.label}>Amount ({currencySymbol})</ThemedText>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. 2500"
                    placeholderTextColor={theme.placeholder}
                    keyboardType="numeric"
                    value={income}
                    onChangeText={setIncome}
                />
                <ThemedView style={styles.actions}>
                    <TouchableOpacity style={styles.saveButton} disabled={saving} onPress={handleSave}>
                        <ThemedText style={styles.saveButtonText}>{saving ? "Saving..." : "Save"}</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelLink} onPress={() => router.back()}>
                        <ThemedText type="danger">Cancel</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            </ThemedView>
        </ThemedView>
    );
}
