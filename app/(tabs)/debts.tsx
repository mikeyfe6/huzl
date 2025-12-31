import React, { useEffect, useMemo, useRef, useState } from "react";

import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, greenColor, mediumGreyColor, orangeColor, redColor, whiteColor } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";
import { supabase } from "@/utils/supabase";

import { AuthGate } from "@/components/loading";

type DebtItem = {
    id: string;
    user_id: string;
    name: string;
    amount: number;
    installments: number;
    active: boolean;
    created_at?: string;
};

export default function DebtsScreen() {
    const { user } = useAuth();

    const { symbol: currencySymbol } = useCurrency();
    const [debts, setDebts] = useState<DebtItem[]>([]);
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [installments, setInstallments] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    const nameInputRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    const handleEditDebt = (debt: DebtItem) => {
        setName(debt.name);
        setAmount(debt.amount.toString());
        setInstallments(debt.installments?.toString() || "");
        setEditingId(debt.id);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        setTimeout(() => nameInputRef.current?.focus(), 100);
    };

    const handleCancelEdit = () => {
        setName("");
        setAmount("");
        setInstallments("");
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
        if (!user || !name.trim() || !amount.trim() || !installments.trim()) return;
        setLoading(true);
        try {
            if (editingId) {
                const { data, error } = await supabase
                    .from("debts")
                    .update({
                        name,
                        amount: Number.parseFloat(amount),
                        installments: Number.parseInt(installments, 10),
                    })
                    .eq("id", editingId)
                    .eq("user_id", user.id)
                    .select()
                    .single();
                if (!error && data) {
                    setDebts((prev) => prev.map((d) => (d.id === editingId ? { ...d, ...data } : d)));
                    handleCancelEdit();
                }
            } else {
                const { data, error } = await supabase
                    .from("debts")
                    .insert({
                        user_id: user.id,
                        name,
                        amount: Number.parseFloat(amount),
                        installments: Number.parseInt(installments, 10),
                        active: true,
                    })
                    .select()
                    .single();
                if (!error && data) {
                    setDebts((prev) => [data as DebtItem, ...prev]);
                    setName("");
                    setAmount("");
                    setInstallments("");
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

    const baseGap = { gap: 12 };
    const baseSpace = { gap: 8 };
    const baseWeight = { fontWeight: "600" as const };
    const baseRadius = { borderRadius: 8 };
    const baseBorder = { borderWidth: 1 };

    const baseFlex = (
        justify: "flex-start" | "center" | "space-between" | undefined = undefined,
        align: "flex-start" | "center" | "flex-end" | undefined = undefined
    ) => ({
        flexDirection: "row" as const,
        justifyContent: justify,
        alignItems: align,
    });

    const baseMain = {
        ...baseGap,
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 16,
    };

    const baseLabel = {
        ...baseWeight,
        fontSize: 14,
        marginTop: 8,
        color: theme.label,
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
        ...baseFlex("center", "center"),
        ...baseRadius,
        paddingVertical: 12,
        flex: 1,
    };

    const baseButtonText = {
        ...baseWeight,
        color: whiteColor,
    };

    const baseList = {
        ...baseGap,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 20,
    };

    const baseCard = {
        ...baseInput,
        // ...baseGap,
        gap: 16,
        padding: 12,
        backgroundColor: theme.cardBackground,
        borderColor: theme.borderColor,
    };

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
                title: {
                    ...baseFlex("space-between", "center"),
                    ...baseSpace,
                },
                icons: {
                    ...baseFlex("center", "center"),
                    ...baseGap,
                },
                icon: {
                    ...baseBorder,
                    borderRadius: 6,
                    padding: 8,
                },
                info: {
                    ...baseFlex("space-between"),
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: theme.dividerColor,
                },
                item: {
                    ...baseCard,
                },
                amount: { fontSize: 13, opacity: 0.7, marginTop: 4 },
                emptyState: {
                    ...baseFlex("center", "center"),
                    paddingVertical: 60,
                },
                emptyStateText: {
                    fontSize: 18,
                    opacity: 0.6,
                    textAlign: "center",
                    color: theme.emptyStateText,
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
                    <ThemedText style={styles.label}>Installments (months)</ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 12"
                        placeholderTextColor={theme.placeholder}
                        value={installments}
                        onChangeText={setInstallments}
                        keyboardType="number-pad"
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
                    {debts.length === 0 ? (
                        <ThemedView style={styles.emptyState}>
                            <ThemedText style={styles.emptyStateText}>No debts (hooray!)</ThemedText>
                        </ThemedView>
                    ) : (
                        debts.map((debt) => (
                            <ThemedView key={debt.id} style={[styles.item, !debt.active && { opacity: 0.5 }]}>
                                <View style={styles.title}>
                                    <ThemedText type="defaultSemiBold">{debt.name}</ThemedText>
                                    <View style={styles.icons}>
                                        <TouchableOpacity
                                            onPress={() => handleToggleActive(debt.id, debt.active)}
                                            style={[
                                                styles.icon,
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
                                                styles.icon,
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
                                                styles.icon,
                                                {
                                                    borderColor: redColor,
                                                },
                                            ]}
                                        >
                                            <Ionicons name="trash" size={16} color={redColor} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.info}>
                                    <ThemedText style={styles.amount}>
                                        Remaining: {currencySymbol} {debt.amount}
                                    </ThemedText>

                                    <ThemedText style={styles.amount}>
                                        Installments: {debt.installments} months
                                    </ThemedText>
                                </View>
                            </ThemedView>
                        ))
                    )}
                </ThemedView>
            </ScrollView>
        </AuthGate>
    );
}
