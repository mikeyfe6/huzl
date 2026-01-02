import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";

import { supabase } from "@/utils/supabase";

import { AuthGate } from "@/components/loading";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { Colors, greenColor, mediumGreyColor, orangeColor, redColor, slateColor } from "@/constants/theme";
import {
    baseBorder,
    baseButton,
    baseButtonText,
    baseCard,
    baseEmpty,
    baseEmptyText,
    baseFlex,
    baseGap,
    baseInput,
    baseLabel,
    baseList,
    baseMain,
    baseSelect,
    baseWeight,
} from "@/styles/base";

type DebtItem = {
    id: string;
    user_id: string;
    name: string;
    amount: number;
    pay_per_month?: number | null;
    active: boolean;
    created_at?: string;
};

export default function DebtsScreen() {
    const { user } = useAuth();

    const { symbol: currencySymbol } = useCurrency();
    const [debts, setDebts] = useState<DebtItem[]>([]);
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [payPerMonth, setPayPerMonth] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    const nameInputRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    const handleEditDebt = (debt: DebtItem) => {
        setName(debt.name);
        setAmount(debt.amount.toString());
        setPayPerMonth(debt.pay_per_month?.toString() || "");
        setEditingId(debt.id);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        setTimeout(() => nameInputRef.current?.focus(), 100);
    };

    const handleCancelEdit = () => {
        setName("");
        setAmount("");
        setPayPerMonth("");
        setEditingId(null);
    };

    const handleDeleteDebt = async (id: string) => {
        if (!user) return;
        setLoading(true);
        const { error } = await supabase.from("debts").delete().eq("id", id).eq("user_id", user.id);
        if (!error) {
            setDebts((prev) => prev.filter((d) => d.id !== id));
        }
        setLoading(false);
    };

    const handleToggleActive = async (id: string, currentActive: boolean) => {
        if (!user) return;
        setLoading(true);
        const { error } = await supabase
            .from("debts")
            .update({ active: !currentActive })
            .eq("id", id)
            .eq("user_id", user.id);
        if (!error) {
            setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, active: !currentActive } : d)));
        }
        setLoading(false);
    };

    const handleAddOrUpdateDebt = async () => {
        if (!user || !name.trim() || !amount.trim()) return;
        setLoading(true);
        try {
            const payPerMonthValue = payPerMonth.trim() ? Number.parseFloat(payPerMonth) : null;
            if (editingId) {
                const { data, error } = await supabase
                    .from("debts")
                    .update({
                        name,
                        amount: Number.parseFloat(amount),
                        pay_per_month: payPerMonthValue,
                    })
                    .eq("id", editingId)
                    .eq("user_id", user.id)
                    .select();
                if (!error && Array.isArray(data) && data.length > 0) {
                    setDebts((prev) => prev.map((d) => (d.id === editingId ? { ...d, ...data[0] } : d)));
                    handleCancelEdit();
                }
            } else {
                const { data, error } = await supabase
                    .from("debts")
                    .insert({
                        user_id: user.id,
                        name,
                        amount: Number.parseFloat(amount),
                        pay_per_month: payPerMonthValue,
                        active: true,
                    })
                    .select()
                    .single();
                if (!error && data) {
                    setDebts((prev) => [data as DebtItem, ...prev]);
                    setName("");
                    setAmount("");
                    setPayPerMonth("");
                }
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        const fetchDebts = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("debts")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });
            if (!error && Array.isArray(data)) setDebts(data as DebtItem[]);
            setLoading(false);
        };
        fetchDebts();
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
                heading: {
                    marginBottom: 16,
                },
                label: {
                    ...baseLabel,
                },
                input: {
                    ...baseInput,
                    ...baseSelect,
                    color: theme.inputText,
                },
                buttons: {
                    ...baseFlex("center"),
                    ...baseGap,
                    marginTop: 8,
                },
                button: {
                    ...baseButton,
                },
                buttonText: { ...baseButtonText },
                list: { ...baseList },
                header: {
                    marginBottom: 8,
                },
                item: {
                    ...baseCard,
                },
                itemHeader: {
                    ...baseFlex("space-between"),
                },
                itemTitle: {
                    flex: 1,
                },
                itemLabel: {
                    fontSize: 13,
                    opacity: 0.7,
                    marginTop: 4,
                },
                itemIcons: {
                    ...baseFlex("center", "center"),
                    ...baseGap,
                },
                itemIcon: {
                    ...baseBorder,
                    borderRadius: 6,
                    padding: 8,
                },
                itemAmount: {
                    ...baseFlex("space-between"),
                    flexWrap: "wrap",
                    gap: 4,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: theme.dividerColor,
                },
                itemPayment: {
                    fontSize: 13,
                    color: slateColor,
                },
                itemRemaining: {
                    ...baseWeight,
                    fontSize: 13,
                    opacity: 0.6,
                },
                emptyState: {
                    ...baseEmpty,
                },
                emptyStateText: {
                    ...baseEmptyText(theme),
                },
            }),
        [theme, colorScheme]
    );

    return (
        <AuthGate>
            <ScrollView ref={scrollViewRef} contentContainerStyle={styles.container}>
                <ThemedView style={styles.fieldset}>
                    <ThemedText type="title" style={styles.heading}>
                        Debts
                    </ThemedText>
                    <ThemedText style={styles.label}>Name</ThemedText>
                    <TextInput
                        ref={nameInputRef}
                        style={styles.input}
                        placeholder="e.g., Car Loan"
                        placeholderTextColor={theme.placeholder}
                        value={name}
                        onChangeText={setName}
                    />
                    <ThemedText style={styles.label}>Max Amount ({currencySymbol})</ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 5000"
                        placeholderTextColor={theme.placeholder}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="decimal-pad"
                    />
                    <ThemedText style={styles.label}>Monthly Payment ({currencySymbol})</ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 200"
                        placeholderTextColor={theme.placeholder}
                        value={payPerMonth}
                        onChangeText={setPayPerMonth}
                        keyboardType="decimal-pad"
                    />
                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: orangeColor }]}
                            onPress={handleAddOrUpdateDebt}
                            disabled={loading}
                        >
                            <ThemedText style={styles.buttonText}>{editingId ? "Update Debt" : "Add Debt"}</ThemedText>
                        </TouchableOpacity>
                        {editingId && (
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: redColor }]}
                                onPress={handleCancelEdit}
                                disabled={loading}
                            >
                                <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                            </TouchableOpacity>
                        )}
                    </View>
                </ThemedView>
                <ThemedView style={styles.list}>
                    <ThemedText type="subtitle" style={styles.header}>
                        Your Debts
                    </ThemedText>
                    {debts.length === 0 ? (
                        <ThemedView style={styles.emptyState}>
                            <ThemedText style={styles.emptyStateText}>No debts (hooray!)</ThemedText>
                        </ThemedView>
                    ) : (
                        debts.map((debt) => (
                            <ThemedView key={debt.id} style={[styles.item, !debt.active && { opacity: 0.5 }]}>
                                <View style={styles.itemHeader}>
                                    <View style={styles.itemTitle}>
                                        <ThemedText type="defaultSemiBold">{debt.name}</ThemedText>
                                        <ThemedText style={styles.itemLabel}>
                                            Remaining: {currencySymbol} {debt.amount}
                                        </ThemedText>
                                    </View>
                                    <View style={styles.itemIcons}>
                                        <TouchableOpacity
                                            onPress={() => handleToggleActive(debt.id, debt.active)}
                                            style={[
                                                styles.itemIcon,
                                                {
                                                    borderColor: debt.active ? greenColor : mediumGreyColor,
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name={debt.active ? "eye" : "eye-off"}
                                                size={16}
                                                color={debt.active ? greenColor : mediumGreyColor}
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleEditDebt(debt)}
                                            style={[
                                                styles.itemIcon,
                                                {
                                                    borderColor: mediumGreyColor,
                                                },
                                            ]}
                                        >
                                            <Ionicons name="pencil" size={16} color={mediumGreyColor} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleDeleteDebt(debt.id)}
                                            style={[
                                                styles.itemIcon,
                                                {
                                                    borderColor: redColor,
                                                },
                                            ]}
                                        >
                                            <Ionicons name="trash" size={16} color={redColor} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.itemAmount}>
                                    <ThemedText style={styles.itemPayment}>
                                        Monthly: {debt.pay_per_month ? `${currencySymbol} ${debt.pay_per_month}` : "—"}
                                    </ThemedText>
                                    {debt.pay_per_month && debt.pay_per_month > 0 ? (
                                        (() => {
                                            const months = Math.ceil(debt.amount / debt.pay_per_month);
                                            const lastPayment =
                                                debt.amount % debt.pay_per_month === 0
                                                    ? debt.pay_per_month
                                                    : (debt.amount % debt.pay_per_month).toFixed(2);
                                            return (
                                                <ThemedText style={styles.itemRemaining}>
                                                    Remaining: {months}{" "}
                                                    {months > 1
                                                        ? `(${months - 1} × ${currencySymbol} ${
                                                              debt.pay_per_month
                                                          }, last: ${currencySymbol} ${lastPayment})`
                                                        : ""}
                                                </ThemedText>
                                            );
                                        })()
                                    ) : (
                                        <ThemedText style={styles.itemRemaining}>Months Remaining: —</ThemedText>
                                    )}
                                </View>
                            </ThemedView>
                        ))
                    )}
                </ThemedView>
            </ScrollView>
        </AuthGate>
    );
}
