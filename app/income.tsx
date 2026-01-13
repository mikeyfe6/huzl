import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, FlatList, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";

import { formatCurrency, formatNumber } from "@/utils/helpers";
import { supabase } from "@/utils/supabase";

import { AuthGate } from "@/components/loading";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { Colors, greenColor, linkColor, mediumGreyColor, redColor, silverColor, whiteColor } from "@/constants/theme";
import {
    baseButton,
    baseButtonText,
    baseFlex,
    baseGap,
    baseIcon,
    baseMain,
    baseSelect,
    baseSize,
    baseSmall,
    baseWeight,
} from "@/styles/base";

type IncomeSource = { id?: number; type: string; amount: string; active?: boolean };

export default function IncomeScreen() {
    const { t } = useTranslation();
    const { user } = useAuth();

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];
    const { symbol: currencySymbol } = useCurrency();

    const [sources, setSources] = useState<IncomeSource[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasIncomeChanges, setHasIncomeChanges] = useState(false);

    const incomeTypes = [
        { key: "salary", label: t("income.type.salary", "Salaris") },
        { key: "freelance", label: t("income.type.freelance", "Freelance/Zelfstandig") },
        { key: "benefit", label: t("income.type.benefit", "Uitkering/Toeslag") },
        { key: "pension", label: t("income.type.pension", "Pensioen") },
        { key: "alimony", label: t("income.type.alimony", "Alimentatie") },
        { key: "investment", label: t("income.type.investment", "Dividend/Rente") },
        { key: "other", label: t("income.type.other", "Overig") },
    ];

    const addSource = () => {
        setSources((prev) => [...prev, { type: "salary", amount: "", active: true }]);
    };

    const removeSource = async (idx: number) => {
        const src = sources[idx];
        if (src.id) {
            setSaving(true);
            const { error } = await supabase.from("incomes").delete().eq("id", src.id);
            if (error) {
                Alert.alert("Error", `Failed to delete income: ${error.message}`);
            }
        }
        setSources((prev) => prev.filter((_, i) => i !== idx));
        setSaving(false);
    };

    const updateSource = (idx: number, field: "type" | "amount", value: string) => {
        setSources((prev) => prev.map((src, i) => (i === idx ? { ...src, [field]: value } : src)));
    };

    const toggleActive = (idx: number) => {
        setSources((prev) => prev.map((src, i) => (i === idx ? { ...src, active: !src.active } : src)));
    };

    const handleSave = async () => {
        if (!user) return;
        for (const src of sources) {
            if (src.active === false) continue;
            const parsed = Number.parseFloat(src.amount);
            if (Number.isNaN(parsed) || parsed < 0) {
                Alert.alert(
                    t("income.invalidAmountTitle", "Ongeldig bedrag"),
                    t("income.invalidAmountMsg", "Voer een geldig, niet-negatief bedrag in.")
                );
                return;
            }
        }
        setSaving(true);
        try {
            const updates = sources.filter((src) => src.id);
            const inserts = sources.filter((src) => !src.id);

            let updateError = null;
            for (const src of updates) {
                const { error } = await supabase
                    .from("incomes")
                    .update({
                        type: src.type,
                        amount: Number.parseFloat(src.amount),
                        active: src.active !== false,
                    })
                    .eq("id", src.id);
                if (error) {
                    updateError = error;
                    break;
                }
            }

            let insertError = null;
            if (inserts.length > 0) {
                const { error } = await supabase.from("incomes").insert(
                    inserts.map((src: IncomeSource) => ({
                        user_id: user.id,
                        type: src.type,
                        amount: Number.parseFloat(src.amount),
                        active: src.active !== false,
                    }))
                );
                if (error) {
                    insertError = error;
                }
            }

            if (updateError || insertError) {
                Alert.alert("Error", `Failed to save income: ${updateError?.message || insertError?.message}`);
                return;
            }
            Alert.alert(t("income.saved", "Opgeslagen"), t("income.savedMsg", "Inkomen bijgewerkt."));
        } catch (e) {
            console.error("Save income error:", e);
            const msg = e instanceof Error ? e.message : "An unexpected error occurred.";
            Alert.alert("Error", msg);
        } finally {
            setSaving(false);
        }
    };

    const total = sources.reduce((sum, src) => {
        if (src.active === false) return sum;
        const parsed = Number.parseFloat(src.amount);
        return sum + (Number.isNaN(parsed) ? 0 : parsed);
    }, 0);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        supabase
            .from("incomes")
            .select("id, type, amount, active")
            .eq("user_id", user.id)
            .then(({ data, error }) => {
                if (error) {
                    Alert.alert("Error", `Failed to load incomes: ${error.message}`);
                    setSources([]);
                } else if (Array.isArray(data) && data.length > 0) {
                    setSources(
                        data.map((row) => ({
                            id: row.id,
                            type: row.type,
                            amount: typeof row.amount === "number" ? row.amount.toFixed(2) : String(row.amount),
                            active: row.active !== false, // default to true if undefined
                        }))
                    );
                } else {
                    setSources([{ type: "salary", amount: "", active: true }]);
                }
                setLoading(false);
                setHasIncomeChanges(false);
            });
    }, [user]);

    useEffect(() => {
        setHasIncomeChanges(true);
    }, [sources]);

    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: {
                    paddingBottom: 24,
                },
                fieldset: {
                    ...baseMain,
                },
                subtitle: {
                    marginBottom: 12,
                },
                hint: {
                    color: silverColor,
                    fontSize: 18,
                    marginBottom: 36,
                },
                label: {
                    ...baseWeight,
                    ...baseSmall,
                    color: theme.label,
                    marginBottom: 12,
                },
                wrapper: {
                    ...baseFlex("center", "center"),
                },
                item: {
                    flex: 1,
                    borderWidth: 1,
                    borderColor: theme.inputBorder,
                    borderRadius: 6,
                    ...baseSelect,
                },
                icons: {
                    marginLeft: 16,
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                },
                icon: {
                    ...baseIcon,
                },
                input: {
                    // ...baseWeight,
                    ...baseSize,
                    color: theme.text,
                    paddingVertical: 6,
                    fontSize: 16,
                    marginBottom: 4,
                    fontWeight: "500",
                },
                category: {
                    borderTopWidth: 1,
                    paddingTop: 10,
                    borderTopColor: theme.inputBorder,
                    gap: 16,
                },
                type: {
                    borderRadius: 8,
                    paddingHorizontal: 14,
                    paddingVertical: 5,
                    borderWidth: 1,
                    borderColor: theme.inputBorder,
                },
                typeText: { ...baseSmall },
                delete: { padding: 4 },
                add: { marginTop: 8, marginBottom: 6 },
                addText: {
                    color: greenColor,
                    fontWeight: "bold",
                },
                total: {
                    ...baseFlex("space-between", "center"),
                    fontSize: 18,
                    backgroundColor: theme.cardBackground,
                    paddingHorizontal: 16,
                    paddingTop: 14,
                    paddingBottom: 18,
                    borderRadius: 12,
                    marginTop: 24,
                },
                actions: {
                    ...baseGap,
                    marginTop: 12,
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
                backButton: {
                    ...baseButton,
                    backgroundColor: redColor,
                },
                backButtonText: {
                    ...baseButtonText,
                    color: whiteColor,
                },
            }),
        [theme]
    );

    return (
        <AuthGate>
            <ScrollView contentContainerStyle={styles.container}>
                <ThemedView style={styles.fieldset}>
                    <ThemedText type="title">{t("income.setIncome")}</ThemedText>
                    <ThemedText style={styles.hint}>{t("income.setIncomeLabel")}</ThemedText>
                    <ThemedText type="subtitle" style={styles.subtitle}>
                        {t("income.sourcesLabel", "Inkomensbronnen")}
                    </ThemedText>

                    {loading ? (
                        <ThemedText>Loading...</ThemedText>
                    ) : (
                        sources.map((src, idx) => (
                            <View key={src.id ?? idx} style={styles.wrapper}>
                                <TouchableOpacity onPress={() => {}} activeOpacity={1} style={styles.item}>
                                    <TextInput
                                        style={styles.input}
                                        value={src.amount}
                                        placeholder="0.00"
                                        placeholderTextColor={theme.placeholder}
                                        keyboardType="decimal-pad"
                                        onChangeText={(text) => updateSource(idx, "amount", formatNumber(text))}
                                    />
                                    <FlatList
                                        data={incomeTypes}
                                        horizontal
                                        style={styles.category}
                                        keyExtractor={(item) => item.key}
                                        renderItem={({ item, index }) => {
                                            const isLast = index === incomeTypes.length - 1;
                                            return (
                                                <TouchableOpacity
                                                    style={[
                                                        styles.type,
                                                        {
                                                            backgroundColor:
                                                                src.type === item.key ? linkColor : theme.background,
                                                            marginRight: isLast ? 0 : 8,
                                                        },
                                                    ]}
                                                    onPress={() => updateSource(idx, "type", item.key)}
                                                >
                                                    <ThemedText
                                                        style={[
                                                            styles.typeText,
                                                            {
                                                                color: src.type === item.key ? whiteColor : theme.text,
                                                            },
                                                        ]}
                                                    >
                                                        {item.label}
                                                    </ThemedText>
                                                </TouchableOpacity>
                                            );
                                        }}
                                        showsHorizontalScrollIndicator={false}
                                    />
                                </TouchableOpacity>
                                <View style={styles.icons}>
                                    <TouchableOpacity
                                        onPress={() => toggleActive(idx)}
                                        style={[
                                            styles.icon,
                                            {
                                                borderColor: src.active ? greenColor : mediumGreyColor,
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name={src.active ? "eye" : "eye-off"}
                                            size={16}
                                            color={src.active ? greenColor : mediumGreyColor}
                                        />
                                    </TouchableOpacity>
                                    {sources.length > 1 && (
                                        <TouchableOpacity
                                            onPress={() => removeSource(idx)}
                                            style={[
                                                styles.icon,
                                                {
                                                    borderColor: redColor,
                                                },
                                            ]}
                                        >
                                            <Ionicons name="trash" size={16} color={redColor} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))
                    )}
                    <TouchableOpacity onPress={addSource} style={styles.add}>
                        <ThemedText style={styles.addText}>+ {t("income.addSource", "Bron toevoegen")}</ThemedText>
                    </TouchableOpacity>
                    <View style={styles.total}>
                        <ThemedText> {t("income.total", "Totaal")}:</ThemedText>
                        <ThemedText type="defaultSemiBold"> {formatCurrency(total, currencySymbol)}</ThemedText>
                    </View>
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
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <ThemedText style={styles.backButtonText}>{t("income.close")}</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </ThemedView>
            </ScrollView>
        </AuthGate>
    );
}
