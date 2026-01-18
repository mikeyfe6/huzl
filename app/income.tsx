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

import { Colors, greenColor, linkColor, mediumGreyColor, redColor, silverColor } from "@/constants/theme";
import {
    baseBorder,
    baseButton,
    baseButtonText,
    baseCenter,
    baseCorner,
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
    const [originalSources, setOriginalSources] = useState<IncomeSource[]>([]);

    const hasIncomeChanges = useMemo(() => {
        if (originalSources.length !== sources.length) return true;

        for (let i = 0; i < sources.length; i++) {
            const a = sources[i];
            const b = originalSources[i];

            if (!b) return true;

            const aAmount = Number.parseFloat(a.amount);
            const bAmount = Number.parseFloat(b.amount);

            if (
                a.type !== b.type ||
                a.active !== b.active ||
                (Number.isNaN(aAmount) && !Number.isNaN(bAmount)) ||
                (!Number.isNaN(aAmount) && Number.isNaN(bAmount)) ||
                (!Number.isNaN(aAmount) && !Number.isNaN(bAmount) && aAmount !== bAmount)
            ) {
                return true;
            }
        }

        return false;
    }, [sources, originalSources]);

    const saveButtonDisabled = useMemo(() => {
        if (saving || !hasIncomeChanges) return true;
        const activeSources = sources.filter((src) => src.active !== false);
        if (activeSources.length === 0) return true;
        for (const src of activeSources) {
            const parsed = Number.parseFloat(src.amount);
            if (src.amount === "" || Number.isNaN(parsed) || parsed < 0) return true;
        }
        return false;
    }, [saving, hasIncomeChanges, sources]);

    const incomeTypes = [
        { key: "salary", label: t("income.category.salary") },
        { key: "freelance", label: t("income.category.freelance") },
        { key: "benefit", label: t("income.category.benefit") },
        { key: "pension", label: t("income.category.pension") },
        { key: "alimony", label: t("income.category.alimony") },
        { key: "investment", label: t("income.category.investment") },
        { key: "other", label: t("income.category.other") },
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
                Alert.alert(t("income.error.invalidAmountTitle"), t("income.error.invalidAmountMsg"));
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
                    })),
                );
                if (error) {
                    insertError = error;
                }
            }

            if (updateError || insertError) {
                Alert.alert("Error", `Failed to save income: ${updateError?.message || insertError?.message}`);
                return;
            }
            setOriginalSources(sources);
            Alert.alert(t("income.saved"), t("income.savedMsg"));
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
            .eq("active", true)
            .then(({ data, error }) => {
                let mappedSources: IncomeSource[];
                if (error) {
                    Alert.alert("Error", `Failed to load incomes: ${error.message}`);
                    mappedSources = [];
                } else if (Array.isArray(data) && data.length > 0) {
                    mappedSources = data.map(
                        (row): IncomeSource => ({
                            id: row.id,
                            type: row.type,
                            amount: typeof row.amount === "number" ? row.amount.toFixed(2) : String(row.amount),
                            active: row.active !== false,
                        }),
                    );
                } else {
                    mappedSources = [{ type: "salary", amount: "", active: true }];
                }
                setSources(mappedSources);
                setOriginalSources(mappedSources);
                setLoading(false);
            });
    }, [user]);

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
                    color: silverColor,
                    fontSize: 18,
                    marginBottom: 24,
                },
                label: {
                    marginBottom: 12,
                },
                wrapper: {
                    ...baseFlex("center", "center"),
                },
                item: {
                    ...baseBorder,
                    ...baseSelect,
                    flex: 1,
                    borderColor: theme.inputBorder,
                    borderRadius: 6,
                },
                icons: {
                    ...baseCenter,
                    flexDirection: "column",
                    gap: 12,
                    marginLeft: 16,
                },
                icon: {
                    ...baseIcon,
                },
                input: {
                    ...baseSize,
                    ...baseWeight,
                    color: theme.text,
                    paddingVertical: 6,
                    marginBottom: 4,
                    outlineWidth: 0,
                },
                category: {
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: theme.inputBorder,
                    paddingTop: 10,
                    gap: 16,
                },
                type: {
                    ...baseBorder,
                    borderRadius: 7,
                    paddingHorizontal: 14,
                    paddingVertical: 5,
                    borderColor: theme.inputBorder,
                },
                typeText: { ...baseSmall },
                delete: { padding: 4 },
                add: { marginTop: 8, marginBottom: 6 },
                addText: {
                    ...baseWeight,
                    color: greenColor,
                },
                total: {
                    ...baseFlex("space-between", "center"),
                    ...baseCorner,
                    fontSize: 18,
                    backgroundColor: theme.cardBackground,
                    padding: 16,
                    marginTop: 4,
                },
                buttons: {
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
                closeButton: {
                    ...baseButton,
                    backgroundColor: redColor,
                },
                closeButtonText: {
                    ...baseButtonText,
                },
            }),
        [theme],
    );

    return (
        <AuthGate>
            <ScrollView contentContainerStyle={styles.container}>
                <ThemedView style={styles.fieldset}>
                    <ThemedText type="title">{t("income.title")}</ThemedText>
                    <ThemedText style={styles.subtitle}>{t("income.subtitle")}</ThemedText>
                    <ThemedText type="subtitle" style={styles.label}>
                        {t("income.label")}
                    </ThemedText>

                    {loading ?
                        <ThemedText>Loading...</ThemedText>
                    :   sources.map((src, idx) => (
                            <View key={src.id ?? idx} style={styles.wrapper}>
                                <TouchableOpacity style={[styles.item, { opacity: src.active ? 1 : 0.5 }]}>
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
                                                            borderColor:
                                                                src.type === item.key ? linkColor : theme.inputBorder,
                                                            marginRight: isLast ? 0 : 8,
                                                        },
                                                    ]}
                                                    onPress={() => updateSource(idx, "type", item.key)}
                                                >
                                                    <ThemedText style={styles.typeText}>{item.label}</ThemedText>
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
                    }
                    <TouchableOpacity onPress={addSource} style={styles.add}>
                        <ThemedText style={styles.addText}>+ {t("income.addSource")}</ThemedText>
                    </TouchableOpacity>
                    <View style={styles.total}>
                        <ThemedText> {t("income.total")}:</ThemedText>
                        <ThemedText type="defaultSemiBold"> {formatCurrency(total, currencySymbol)}</ThemedText>
                    </View>
                    <ThemedView style={styles.buttons}>
                        <TouchableOpacity
                            style={[styles.saveButton, saveButtonDisabled && styles.saveButtonDisabled]}
                            disabled={saveButtonDisabled}
                            onPress={handleSave}
                        >
                            <ThemedText style={styles.saveButtonText}>
                                {saving ? t("common.saving") : t("common.save")}
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                            <ThemedText style={styles.closeButtonText}>{t("common.close")}</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </ThemedView>
            </ScrollView>
        </AuthGate>
    );
}
