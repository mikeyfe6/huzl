import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, FlatList, Modal, Platform, Pressable, ScrollView, TextInput, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";

import { formatNumber } from "@/utils/helpers";
import { supabase } from "@/utils/supabase";

import { AuthGate } from "@/components/loading";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { DebtItem } from "@/components/ui/debt-item";

import { Colors, whiteColor } from "@/constants/theme";
import { baseOrange, baseRed } from "@/styles/base";
import { getDebtsStyles } from "@/styles/debts";

// TODO: Test android datepicker....

export default function DebtsScreen() {
    const { t } = useTranslation();
    const { user } = useAuth();

    const colorScheme = useColorScheme();
    const { symbol: currencySymbol } = useCurrency();

    const nameInputRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    const [debts, setDebts] = useState<DebtItem[]>([]);
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [payPerMonth, setPayPerMonth] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [paymentId, setPaymentId] = useState<string | null>(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [nextPaymentDate, setNextPaymentDate] = useState<string>("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);

    const theme = Colors[colorScheme ?? "light"];
    const styles = useMemo(() => getDebtsStyles(theme), [theme]);

    const handleEditDebt = useCallback((debt: DebtItem) => {
        setName(debt.name);
        setAmount(debt.amount.toFixed(2));
        setPayPerMonth(debt.pay_per_month?.toFixed(2) || "");
        setNextPaymentDate(debt.next_payment_date || "");
        setEditingId(debt.id);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        setTimeout(() => nameInputRef.current?.focus(), 100);
    }, []);

    const handleCancelEdit = () => {
        setName("");
        setAmount("");
        setPayPerMonth("");
        setNextPaymentDate("");
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

    const confirmDelete = useCallback(
        (id: string, name: string) => {
            if (Platform.OS === "web") {
                const ok = globalThis.confirm(`${t("common.delete")} "${name}"?`);
                if (ok) handleDeleteDebt(id);
                return;
            }

            Alert.alert(`${t("debts.deleteDebt")}`, `${t("common.delete")} "${name}"?`, [
                { text: t("common.cancel"), style: "cancel" },
                { text: t("common.delete"), style: "destructive", onPress: () => handleDeleteDebt(id) },
            ]);
        },
        [t, user],
    );

    const handleToggleActive = useCallback(
        async (id: string, currentActive: boolean) => {
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
        },
        [user],
    );

    const handleMakePayment = useCallback(
        async (debtId: string, amount: number) => {
            if (!user || !paymentAmount.trim()) return { error: "No user or payment amount" };
            const payment = Number.isFinite(amount) ? amount : Number.parseFloat(paymentAmount);
            if (Number.isNaN(payment) || payment <= 0) return { error: "Invalid payment amount" };

            const debt = debts.find((d) => d.id === debtId);
            if (!debt) return { error: "Debt not found" };

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
            return { error: error ? error.message : null };
        },
        [paymentAmount, user],
    );

    const handleAddOrUpdateDebt = async () => {
        if (!user || !name.trim() || !amount.trim()) return;
        setLoading(true);
        try {
            const payPerMonthValue = payPerMonth.trim() ? Number.parseFloat(payPerMonth) : null;
            const nextPaymentDateValue = nextPaymentDate.trim() ? nextPaymentDate : null;
            if (editingId) {
                const { data, error } = await supabase
                    .from("debts")
                    .update({
                        name,
                        amount: Number.parseFloat(amount),
                        pay_per_month: payPerMonthValue,
                        next_payment_date: nextPaymentDateValue,
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
                        next_payment_date: nextPaymentDateValue,
                        active: true,
                    })
                    .select()
                    .single();
                if (!error && data) {
                    setDebts((prev) => [data as DebtItem, ...prev]);
                    setName("");
                    setAmount("");
                    setPayPerMonth("");
                    setNextPaymentDate("");
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

    const Header = (
        <>
            <ThemedView style={styles.fieldset}>
                <ThemedText type="title" style={styles.heading}>
                    {t("debts.title")}
                </ThemedText>
                <ThemedText style={styles.label}>{t("debts.label.name")}</ThemedText>
                <TextInput
                    ref={nameInputRef}
                    style={styles.input}
                    placeholder={t("debts.placeholder.name")}
                    placeholderTextColor={theme.placeholder}
                    value={name}
                    onChangeText={setName}
                />
                <ThemedText style={styles.label}>
                    {t("debts.label.totalAmount")} ({currencySymbol})
                </ThemedText>
                <TextInput
                    style={styles.input}
                    placeholder={t("debts.placeholder.totalAmount")}
                    placeholderTextColor={theme.placeholder}
                    value={amount}
                    onChangeText={(text) => setAmount(formatNumber(text))}
                    keyboardType="decimal-pad"
                />
                <ThemedText style={styles.label}>
                    {t("debts.label.monthlyPayment")} ({currencySymbol})
                </ThemedText>
                <TextInput
                    style={styles.input}
                    placeholder={t("debts.placeholder.monthlyPayment")}
                    placeholderTextColor={theme.placeholder}
                    value={payPerMonth}
                    onChangeText={(text) => setPayPerMonth(formatNumber(text))}
                    keyboardType="decimal-pad"
                />
                <ThemedText style={styles.label}>{t("debts.label.nextPaymentDate")}</ThemedText>
                {Platform.OS === "web" ?
                    <div style={styles.dateWrapper}>
                        <input
                            type="date"
                            style={styles.dateInput}
                            value={nextPaymentDate ? nextPaymentDate.slice(0, 10) : ""}
                            onChange={(e) =>
                                setNextPaymentDate(e.target.value ? new Date(e.target.value).toISOString() : "")
                            }
                            placeholder={t("debts.placeholder.nextPaymentDate")}
                        />
                        {nextPaymentDate && (
                            <Pressable
                                accessibilityRole="button"
                                style={styles.cancel}
                                onPress={() => setNextPaymentDate("")}
                                accessibilityLabel={t("common.clear")}
                            >
                                <Ionicons name="close" size={24} color={whiteColor} />
                            </Pressable>
                        )}
                    </div>
                :   <>
                        <View style={styles.dateWrapperFallback}>
                            <Pressable
                                style={styles.input}
                                onPress={() => {
                                    setTempSelectedDate(nextPaymentDate ? new Date(nextPaymentDate) : new Date());
                                    setShowDatePicker(true);
                                }}
                                accessibilityRole="button"
                                accessibilityLabel={t("debts.label.nextPaymentDate")}
                            >
                                <ThemedText style={{ color: nextPaymentDate ? theme.inputText : theme.placeholder }}>
                                    {nextPaymentDate ?
                                        new Date(nextPaymentDate).toLocaleDateString(t("seo.lang"))
                                    :   t("debts.placeholder.nextPaymentDate")}
                                </ThemedText>
                            </Pressable>
                            {nextPaymentDate && (
                                <Pressable
                                    accessibilityRole="button"
                                    style={styles.cancel}
                                    onPress={() => setNextPaymentDate("")}
                                    accessibilityLabel={t("common.clear")}
                                >
                                    <Ionicons name="close" size={24} color={whiteColor} />
                                </Pressable>
                            )}
                        </View>
                        {Platform.OS === "ios" && (
                            <Modal
                                transparent
                                animationType="fade"
                                visible={showDatePicker}
                                onRequestClose={() => setShowDatePicker(false)}
                            >
                                <View style={styles.modal}>
                                    <View style={styles.datepicker}>
                                        <DateTimePicker
                                            value={
                                                tempSelectedDate ||
                                                (nextPaymentDate ? new Date(nextPaymentDate) : new Date())
                                            }
                                            mode="date"
                                            display="spinner"
                                            textColor={theme.inputText}
                                            onChange={(_, selectedDate) => {
                                                if (selectedDate) {
                                                    setTempSelectedDate(selectedDate);
                                                }
                                            }}
                                        />
                                        <View style={styles.dateButtons}>
                                            <Pressable
                                                style={styles.cancelButton}
                                                onPress={() => {
                                                    setShowDatePicker(false);
                                                }}
                                            >
                                                <Ionicons name="close" size={24} color={whiteColor} />
                                            </Pressable>
                                            <Pressable
                                                style={styles.saveButton}
                                                onPress={() => {
                                                    if (tempSelectedDate) {
                                                        setNextPaymentDate(tempSelectedDate.toISOString());
                                                    }
                                                    setShowDatePicker(false);
                                                }}
                                            >
                                                <ThemedText style={styles.buttonText}>{t("common.save")}</ThemedText>
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            </Modal>
                        )}
                        {Platform.OS === "android" && showDatePicker && (
                            <DateTimePicker
                                value={nextPaymentDate ? new Date(nextPaymentDate) : new Date()}
                                mode="date"
                                display="default"
                                onChange={(_, selectedDate) => {
                                    setShowDatePicker(false);
                                    if (selectedDate) {
                                        setNextPaymentDate(selectedDate.toISOString());
                                    }
                                }}
                            />
                        )}
                    </>
                }
                <View style={styles.buttons}>
                    <Pressable
                        style={[styles.button, { ...baseOrange }]}
                        onPress={handleAddOrUpdateDebt}
                        disabled={loading}
                    >
                        <ThemedText style={styles.buttonText}>
                            {editingId ? t("debts.button.updateDebt") : t("debts.button.addDebt")}
                        </ThemedText>
                    </Pressable>
                    {editingId && (
                        <Pressable
                            style={[styles.button, { ...baseRed }]}
                            onPress={handleCancelEdit}
                            disabled={loading}
                        >
                            <ThemedText style={styles.buttonText}>{t("common.cancel")}</ThemedText>
                        </Pressable>
                    )}
                </View>
            </ThemedView>

            {debts.length > 0 && (
                <ThemedView style={styles.list}>
                    <ThemedText type="subtitle" style={styles.header}>
                        {t("debts.yourDebts")}
                    </ThemedText>
                </ThemedView>
            )}
        </>
    );

    const renderItem = useCallback(
        (props: { item: DebtItem }) => (
            <DebtItem
                debt={props.item}
                currencySymbol={currencySymbol}
                onToggleActive={handleToggleActive}
                onEdit={handleEditDebt}
                onDelete={confirmDelete}
                styles={styles}
                paymentId={paymentId}
                setPaymentId={setPaymentId}
                paymentAmount={paymentAmount}
                setPaymentAmount={setPaymentAmount}
                onPayment={handleMakePayment}
                loading={loading}
                theme={theme}
                t={t}
            />
        ),
        [
            currencySymbol,
            handleToggleActive,
            handleEditDebt,
            confirmDelete,
            styles,
            paymentId,
            setPaymentAmount,
            handleMakePayment,
            loading,
            theme,
        ],
    );

    return (
        <AuthGate>
            <FlatList
                data={debts}
                keyExtractor={(debt) => debt.id}
                contentContainerStyle={debts.length > 0 ? { backgroundColor: theme.background } : undefined}
                ListHeaderComponent={Header}
                renderItem={renderItem}
                ListEmptyComponent={
                    loading ?
                        <ThemedView style={styles.emptyState}>
                            <ThemedText style={styles.emptyStateText}>
                                <Ionicons name="time-outline" size={24} color={theme.inputText} />
                            </ThemedText>
                        </ThemedView>
                    :   <ThemedView style={styles.emptyState}>
                            <ThemedText style={styles.emptyStateText}>{t("debts.noDebts")}</ThemedText>
                        </ThemedView>
                }
            />
        </AuthGate>
    );
}
