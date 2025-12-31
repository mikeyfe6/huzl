import React, { useEffect, useMemo, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, whiteColor } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";
import { supabase } from "@/utils/supabase";

import { AuthGate } from "@/components/loading";

type Debt = {
    id: string;
    user_id: string;
    name: string;
    amount: number;
    created_at?: string;
};

export default function DebtsScreen() {
    const { user } = useAuth();

    const { symbol: currencySymbol } = useCurrency();
    const [debts, setDebts] = useState<Debt[]>([]);
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    const baseGap = { gap: 12 };

    const baseSpace = { gap: 8 };

    const baseWeight = { fontWeight: "600" as const };

    const baseRadius = { borderRadius: 8 };

    const baseBorder = { borderWidth: 1 };

    const baseFlex = (
        justify:
            | "flex-start"
            | "center"
            | "space-between"
            | undefined = undefined,
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
        marginTop: 8,
        paddingVertical: 12,
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
        ...baseSpace,
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
                button: {
                    ...baseButton,
                    backgroundColor: "#F7557B",
                },
                buttonText: { ...baseButtonText },
                list: { ...baseList },
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

    useEffect(() => {
        if (!user) return;
        const fetchDebts = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("debts")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });
            if (!error && Array.isArray(data)) setDebts(data as Debt[]);
            setLoading(false);
        };
        fetchDebts();
    }, [user]);

    const handleAddDebt = async () => {
        if (!user || !name.trim() || !amount.trim()) return;
        setLoading(true);
        const { data, error } = await supabase
            .from("debts")
            .insert({
                user_id: user.id,
                name,
                amount: Number.parseFloat(amount),
            })
            .select()
            .single();
        if (!error && data) {
            setDebts([data as Debt, ...debts]);
            setName("");
            setAmount("");
        }
        setLoading(false);
    };

    return (
        <AuthGate>
            <ScrollView contentContainerStyle={styles.container}>
                <ThemedView style={styles.fieldset}>
                    <ThemedText type="title" style={styles.heading}>
                        Debts
                    </ThemedText>
                    <ThemedText style={styles.label}>Name</ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Car Loan"
                        placeholderTextColor={theme.placeholder}
                        value={name}
                        onChangeText={setName}
                    />
                    <ThemedText style={styles.label}>
                        Max Amount ({currencySymbol})
                    </ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 5000"
                        placeholderTextColor={theme.placeholder}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="decimal-pad"
                    />
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleAddDebt}
                        disabled={loading}
                    >
                        <ThemedText style={styles.buttonText}>
                            {loading ? "Adding..." : "Add Debt"}
                        </ThemedText>
                    </TouchableOpacity>
                </ThemedView>
                <ThemedView style={styles.list}>
                    {debts.length === 0 ? (
                        <ThemedView style={styles.emptyState}>
                            <ThemedText style={styles.emptyStateText}>
                                No debts (hooray!)
                            </ThemedText>
                        </ThemedView>
                    ) : (
                        debts.map((debt) => (
                            <ThemedView key={debt.id} style={styles.item}>
                                <ThemedText type="defaultSemiBold">
                                    {debt.name}
                                </ThemedText>
                                <ThemedText style={styles.amount}>
                                    Remaining: {currencySymbol} {debt.amount}
                                </ThemedText>
                            </ThemedView>
                        ))
                    )}
                </ThemedView>
            </ScrollView>
        </AuthGate>
    );
}
