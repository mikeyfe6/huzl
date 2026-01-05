import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";

import { supabase } from "@/utils/supabase";

import { formatAmount, formatCurrency, formatNumber } from "@/utils/helpers";

import { AuthGate } from "@/components/loading";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { blueColor, Colors, greenColor, mediumGreyColor, orangeColor, redColor, slateColor } from "@/constants/theme";
import {
    baseButton,
    baseButtonText,
    baseCard,
    baseEmpty,
    baseEmptyText,
    baseFlex,
    baseGap,
    baseIcon,
    baseIcons,
    baseInput,
    baseLabel,
    baseList,
    baseMain,
    baseSelect,
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
    const { t } = useTranslation();
    const { user } = useAuth();

    const { symbol: currencySymbol } = useCurrency();
    const [debts, setDebts] = useState<DebtItem[]>([]);
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [payPerMonth, setPayPerMonth] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [paymentId, setPaymentId] = useState<string | null>(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    const nameInputRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    const handleEditDebt = (debt: DebtItem) => {
        setName(debt.name);
        setAmount(debt.amount.toFixed(2));
        setPayPerMonth(debt.pay_per_month?.toFixed(2) || "");
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

    const confirmDeleteDebt = (id: string, name: string) => {
        if (Platform.OS === "web") {
            const ok = globalThis.confirm(`${t("debts.delete")} "${name}"?`);
            if (ok) handleDeleteDebt(id);
            return;
        }

        Alert.alert(`${t("debts.deleteDebt")}`, `${t("debts.delete")} "${name}"?`, [
            { text: t("debts.cancel"), style: "cancel" },
            { text: t("debts.delete"), style: "destructive", onPress: () => handleDeleteDebt(id) },
        ]);
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

    const handleMakePayment = async (debtId: string) => {
        if (!user || !paymentAmount.trim()) return;
        const payment = Number.parseFloat(paymentAmount);
        if (Number.isNaN(payment) || payment <= 0) return;

        const debt = debts.find((d) => d.id === debtId);
        if (!debt) return;

        const newAmount = Math.max(0, debt.amount - payment);
        setLoading(true);

        const { data, error } = await supabase
            .from("debts")
            .update({ amount: newAmount })
            .eq("id", debtId)
            .eq("user_id", user.id)
            .select();

        if (!error && data && data.length > 0) {
            setDebts((prev) => prev.map((d) => (d.id === debtId ? { ...d, amount: newAmount } : d)));
            setPaymentId(null);
            setPaymentAmount("");
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
                    ...baseLabel(theme),
                },
                input: {
                    ...baseInput(theme),
                    ...baseSelect,
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
                    ...baseCard(theme),
                },
                itemHeader: {
                    ...baseFlex("space-between", "flex-start"),
                    ...baseGap,
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
                    ...baseIcons,
                },
                itemIcon: {
                    ...baseIcon,
                },
                itemAmount: {
                    ...baseFlex("space-between"),
                    flexWrap: "wrap",
                    gap: 4,
                    paddingTop: 8,
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: theme.dividerColor,
                },
                itemPayment: {
                    fontWeight: "500",
                    fontSize: 13,
                    color: slateColor,
                },
                itemRemaining: {
                    fontSize: 12.5,
                    opacity: 0.6,
                },
                paymentSection: {
                    ...baseFlex("center"),
                    ...baseGap,
                },
                paymentInput: {
                    ...baseInput(theme),
                    ...baseSelect,
                    flex: 2,
                },
                paymentButton: {
                    ...baseButton,
                },
                paymentButtonText: {
                    ...baseButtonText,
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
                        {t("debts.title")}
                    </ThemedText>
                    <ThemedText style={styles.label}>{t("debts.name")}</ThemedText>
                    <TextInput
                        ref={nameInputRef}
                        style={styles.input}
                        placeholder={t("debts.namePlaceholder")}
                        placeholderTextColor={theme.placeholder}
                        value={name}
                        onChangeText={setName}
                    />
                    <ThemedText style={styles.label}>
                        {t("debts.totalAmount")} ({currencySymbol})
                    </ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder={t("debts.totalAmountPlaceholder")}
                        placeholderTextColor={theme.placeholder}
                        value={amount}
                        onChangeText={(text) => setAmount(formatNumber(text))}
                        keyboardType="decimal-pad"
                    />
                    <ThemedText style={styles.label}>
                        {t("debts.monthlyPayment")} ({currencySymbol})
                    </ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder={t("debts.monthlyPaymentPlaceholder")}
                        placeholderTextColor={theme.placeholder}
                        value={payPerMonth}
                        onChangeText={(text) => setPayPerMonth(formatNumber(text))}
                        keyboardType="decimal-pad"
                    />
                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: orangeColor }]}
                            onPress={handleAddOrUpdateDebt}
                            disabled={loading}
                        >
                            <ThemedText style={styles.buttonText}>
                                {editingId ? t("debts.updateDebt") : t("debts.addDebt")}
                            </ThemedText>
                        </TouchableOpacity>
                        {editingId && (
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: redColor }]}
                                onPress={handleCancelEdit}
                                disabled={loading}
                            >
                                <ThemedText style={styles.buttonText}>{t("debts.cancel")}</ThemedText>
                            </TouchableOpacity>
                        )}
                    </View>
                </ThemedView>
                <ThemedView style={styles.list}>
                    <ThemedText type="subtitle" style={styles.header}>
                        {t("debts.yourDebts")}
                    </ThemedText>
                    {debts.length === 0 ? (
                        <ThemedView style={styles.emptyState}>
                            <ThemedText style={styles.emptyStateText}>{t("debts.noDebts")}</ThemedText>
                        </ThemedView>
                    ) : (
                        debts.map((debt) => (
                            <ThemedView key={debt.id} style={[styles.item, !debt.active && { opacity: 0.5 }]}>
                                <View style={styles.itemHeader}>
                                    <View style={styles.itemTitle}>
                                        <ThemedText type="defaultSemiBold" numberOfLines={1} ellipsizeMode="tail">
                                            {debt.name}
                                        </ThemedText>
                                        <ThemedText style={styles.itemLabel}>
                                            {t("debts.total")}: {formatCurrency(debt.amount, currencySymbol)}
                                        </ThemedText>
                                    </View>
                                    <View style={styles.itemIcons}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setPaymentId(paymentId === debt.id ? null : debt.id);
                                                setPaymentAmount("");
                                            }}
                                            style={[
                                                styles.itemIcon,
                                                {
                                                    borderColor: blueColor,
                                                },
                                            ]}
                                        >
                                            <Ionicons name="cash-outline" size={16} color={blueColor} />
                                        </TouchableOpacity>
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
                                            onPress={() => confirmDeleteDebt(debt.id, debt.name)}
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
                                        {t("debts.monthly")}:{" "}
                                        {debt.pay_per_month
                                            ? `${formatCurrency(debt.pay_per_month, currencySymbol)}`
                                            : "—"}
                                    </ThemedText>
                                    {debt.pay_per_month && debt.pay_per_month > 0 ? (
                                        (() => {
                                            const months = Math.ceil(debt.amount / debt.pay_per_month);
                                            const lastPayment =
                                                debt.amount % debt.pay_per_month === 0
                                                    ? formatAmount(debt.pay_per_month)
                                                    : formatAmount(debt.amount % debt.pay_per_month);
                                            return (
                                                <ThemedText style={styles.itemRemaining}>
                                                    {t("debts.terms")}: {months}{" "}
                                                    {months > 1
                                                        ? `(${months - 1} × ${currencySymbol} ${formatAmount(
                                                              debt.pay_per_month
                                                          )} — 1 x: ${currencySymbol} ${lastPayment})`
                                                        : ""}
                                                </ThemedText>
                                            );
                                        })()
                                    ) : (
                                        <ThemedText style={styles.itemRemaining}>{t("debts.terms")}: —</ThemedText>
                                    )}
                                </View>
                                {paymentId === debt.id && (
                                    <View style={styles.paymentSection}>
                                        <TextInput
                                            style={styles.paymentInput}
                                            placeholder={`${t("debts.amountPaid")} (${currencySymbol})`}
                                            placeholderTextColor={theme.placeholder}
                                            value={paymentAmount}
                                            onChangeText={(text) => setPaymentAmount(formatNumber(text))}
                                            keyboardType="decimal-pad"
                                            autoFocus
                                        />
                                        <TouchableOpacity
                                            style={[styles.paymentButton, { backgroundColor: greenColor }]}
                                            onPress={() => handleMakePayment(debt.id)}
                                            disabled={loading || !paymentAmount.trim()}
                                        >
                                            <ThemedText style={styles.paymentButtonText}>{t("debts.save")}</ThemedText>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.paymentButton, { backgroundColor: redColor }]}
                                            onPress={() => {
                                                setPaymentId(null);
                                                setPaymentAmount("");
                                            }}
                                            disabled={loading}
                                        >
                                            <ThemedText style={styles.paymentButtonText}>
                                                {t("debts.cancel")}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </ThemedView>
                        ))
                    )}
                </ThemedView>
            </ScrollView>
        </AuthGate>
    );
}
