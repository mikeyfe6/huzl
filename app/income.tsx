import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, TextInput, TouchableOpacity } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";

import { supabase } from "@/utils/supabase";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { Colors, greenColor, silverColor } from "@/constants/theme";
import {
    baseButton,
    baseButtonText,
    baseFlex,
    baseGap,
    baseInput,
    baseSelect,
    baseSmall,
    baseWeight,
} from "@/styles/base";

export default function ModalScreen() {
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];
    const { user, refreshUser } = useAuth();
    const { symbol: currencySymbol } = useCurrency();

    const baseIncomeString = useMemo(() => {
        const val = (user?.user_metadata as any)?.monthly_income;
        if (typeof val === "number") return val.toFixed(2);
        if (typeof val === "string" && val) {
            const parsed = Number.parseFloat(val);
            return Number.isNaN(parsed) ? val : parsed.toFixed(2);
        }
        return "";
    }, [user]);

    const [income, setIncome] = useState<string>(baseIncomeString);
    const [saving, setSaving] = useState(false);

    const hasIncomeChanges = useMemo(() => {
        return income.trim() !== baseIncomeString.trim();
    }, [income, baseIncomeString]);

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

    useEffect(() => {
        setIncome(baseIncomeString);
    }, [baseIncomeString]);

    const styles = useMemo(
        () =>
            StyleSheet.create({
                outerContainer: {
                    ...baseFlex("center", "center"),
                    flex: 1,
                    padding: 20,
                },
                container: {
                    width: "100%",
                    maxWidth: 500,
                },
                title: {
                    marginBottom: 12,
                    textAlign: "center",
                },
                hint: {
                    color: silverColor,
                    textAlign: "center",
                    marginBottom: 48,
                },
                label: {
                    ...baseWeight,
                    ...baseSmall,
                    color: theme.label,
                    marginBottom: 12,
                },
                input: {
                    ...baseInput(theme),
                    ...baseSelect,
                },
                actions: {
                    ...baseGap,
                    marginTop: 20,
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
                    {t("income.setIncome")}
                </ThemedText>
                <ThemedText style={styles.hint}>{t("income.setIncomeLabel")}</ThemedText>
                <ThemedText style={styles.label}>
                    {t("income.amount")} ({currencySymbol})
                </ThemedText>
                <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={theme.placeholder}
                    keyboardType="decimal-pad"
                    value={income}
                    onChangeText={(text) => setIncome(text)}
                />
                <ThemedView style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.saveButton, (saving || !hasIncomeChanges) && styles.saveButtonDisabled]}
                        disabled={saving || !hasIncomeChanges}
                        onPress={handleSave}
                    >
                        <ThemedText style={styles.saveButtonText}>
                            {saving ? t("income.saving") : t("income.saveIncome")}
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelLink} onPress={() => router.back()}>
                        <ThemedText type="danger">{t("income.cancel")}</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            </ThemedView>
        </ThemedView>
    );
}
