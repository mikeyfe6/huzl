import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Alert,
    FlatList,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    TextInput,
    View,
    useWindowDimensions,
} from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";

import { formatNumber } from "@/utils/helpers";
import { supabase } from "@/utils/supabase";

import { DebtItem } from "@/components/list/debt-item";
import { SORT_OPTIONS, SortDebtsModal } from "@/components/modal/sort-debts-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Collapsible } from "@/components/ui/collapsible";
import { AuthGate } from "@/components/ui/loading";

import { Colors, whiteColor } from "@/constants/theme";
import { baseOrange, baseRed } from "@/styles/base";
import { getDebtsStyles } from "@/styles/debts";

// TODO: Test android datepicker....
// TODO: Checken of ik de originele bedrag toon en dan al betaalde bedrag ook ernaast toon...

export default function DebtsScreen() {
    const { t } = useTranslation();
    const { user, refreshUser } = useAuth();

    const colorScheme = useColorScheme();
    const { symbol: currencySymbol } = useCurrency();
    const { width: screenWidth } = useWindowDimensions();

    const nameInputRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const flatListRef = useRef<FlatList<DebtItem>>(null);

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
    const [sortOption, setSortOption] = useState<SortOption>("default");
    const [sortModalVisible, setSortModalVisible] = useState(false);

    const debtSortPreferenceKey = user ? `@huzl_debt_sort:${user.id}` : "@huzl_debt_sort:guest";

    const theme = Colors[colorScheme ?? "light"];
    const styles = useMemo(() => getDebtsStyles(theme, screenWidth), [theme, screenWidth]);

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

    const handleTogglePayment = useCallback(
        (id: string, index: number) => {
            const opening = paymentId !== id;
            setPaymentId(opening ? id : null);
            setPaymentAmount("");
            if (opening && index >= 0) {
                setTimeout(() => flatListRef.current?.scrollToIndex({ index, viewPosition: 0.3, animated: true }), 150);
            }
        },
        [paymentId],
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
        async (debtId: string, amount: number, updatedNextPaymentDate?: string | null) => {
            if (!user || !paymentAmount.trim()) return { error: "No user or payment amount" };
            const payment = Number.isFinite(amount) ? amount : Number.parseFloat(paymentAmount);
            if (Number.isNaN(payment) || payment <= 0) return { error: "Invalid payment amount" };

            const debt = debts.find((d) => d.id === debtId);
            if (!debt) return { error: "Debt not found" };

            const newAmount = Math.max(0, debt.amount - payment);
            const updateData: { amount: number; next_payment_date?: string | null } = { amount: newAmount };
            if (updatedNextPaymentDate !== undefined) {
                updateData.next_payment_date = updatedNextPaymentDate;
            }
            setLoading(true);

            const { data, error } = await supabase
                .from("debts")
                .update(updateData)
                .eq("id", debtId)
                .eq("user_id", user.id)
                .select();

            if (!error && data && data.length > 0) {
                setDebts((prev) =>
                    prev.map((d) =>
                        d.id === debtId ?
                            {
                                ...d,
                                amount: newAmount,
                                next_payment_date: updatedNextPaymentDate ?? d.next_payment_date,
                            }
                        :   d,
                    ),
                );
                setPaymentId(null);
                setPaymentAmount("");
            }
            setLoading(false);
            return { error: error ? error.message : null };
        },
        [debts, paymentAmount, user],
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

    const sortLabelMap = useMemo(
        () => Object.fromEntries(SORT_OPTIONS.map((option) => [option.value, t(option.labelKey)])),
        [t],
    );

    const currentSort = SORT_OPTIONS.find((opt) => opt.value === sortOption);

    const sortedDebts = useMemo(() => {
        const sorted = [...debts];

        const getDateValue = (item: DebtItem) => {
            if (!item.next_payment_date) return Number.MAX_SAFE_INTEGER;
            const date = new Date(item.next_payment_date).getTime();
            return Number.isNaN(date) ? Number.MAX_SAFE_INTEGER : date;
        };

        switch (sortOption) {
            case "alphabetic-asc":
                return sorted.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
            case "alphabetic-desc":
                return sorted.sort((a, b) => b.name.localeCompare(a.name, undefined, { sensitivity: "base" }));
            case "cost-asc":
                return sorted.sort((a, b) => a.amount - b.amount);
            case "cost-desc":
                return sorted.sort((a, b) => b.amount - a.amount);
            case "date-closest":
                return sorted.sort((a, b) => getDateValue(a) - getDateValue(b));
            case "date-farthest":
                return sorted.sort((a, b) => getDateValue(b) - getDateValue(a));
            case "default":
            default:
                return sorted;
        }
    }, [debts, sortOption]);

    const setSortAndClose = async (opt: SortOption) => {
        setSortOption(opt);
        setSortModalVisible(false);

        try {
            await AsyncStorage.setItem(debtSortPreferenceKey, opt);
            if (user) {
                const { data } = await supabase.auth.getSession();
                if (data.session) {
                    const { error } = await supabase.auth.updateUser({ data: { debt_sort: opt } });
                    if (error) throw error;
                    await refreshUser();
                }
            }
        } catch (error) {
            console.error("Failed to save debt sort preference:", error);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const loadSortPreference = async () => {
            try {
                if (user) {
                    const { data: authUser } = await supabase.auth.getUser();
                    const cloudSort = authUser.user?.user_metadata?.debt_sort;
                    if (!cancelled && cloudSort && SORT_OPTIONS.some((option) => option.value === cloudSort)) {
                        setSortOption(cloudSort as SortOption);
                        await AsyncStorage.setItem(debtSortPreferenceKey, cloudSort);
                        return;
                    }
                }

                const savedSort = await AsyncStorage.getItem(debtSortPreferenceKey);
                if (!cancelled && savedSort && SORT_OPTIONS.some((option) => option.value === savedSort)) {
                    setSortOption(savedSort as SortOption);
                    if (user) {
                        const { data } = await supabase.auth.getSession();
                        if (data.session) {
                            const { error } = await supabase.auth.updateUser({ data: { debt_sort: savedSort } });
                            if (error) throw error;
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load debt sort preference:", error);
            }
        };

        void loadSortPreference();

        return () => {
            cancelled = true;
        };
    }, [debtSortPreferenceKey, user]);

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

    const activeDebts = sortedDebts.filter((d) => d.amount > 0);
    const paidOffDebts = sortedDebts.filter((d) => d.amount === 0);

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
                        {nextPaymentDate.length > 0 && (
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
                <>
                    <View style={styles.debtHeader}>
                        <View style={styles.debtTitle}>
                            <ThemedText type="subtitle">{t("debts.yourDebts")}</ThemedText>
                            <ThemedText style={styles.debtNumber}>({activeDebts.length})</ThemedText>
                        </View>
                        <View style={styles.modalButtons}>
                            <Pressable
                                style={styles.modalTrigger}
                                onPress={() => setSortModalVisible(true)}
                                accessibilityRole="button"
                                accessibilityLabel="Open sort options"
                            >
                                {currentSort &&
                                    (currentSort.iconSet === "material" ?
                                        <MaterialCommunityIcons name={currentSort.icon} size={18} color={theme.label} />
                                    :   <Ionicons name={currentSort.icon} size={16} color={theme.label} />)}
                                {screenWidth > 568 && (
                                    <ThemedText style={styles.modalTriggerText}>{sortLabelMap[sortOption]}</ThemedText>
                                )}
                            </Pressable>
                        </View>
                    </View>
                    <SortDebtsModal
                        visible={sortModalVisible}
                        sortOption={sortOption}
                        onSelect={setSortAndClose}
                        onClose={() => setSortModalVisible(false)}
                        theme={theme}
                    />
                </>
            )}
        </>
    );

    const renderItem = useCallback(
        (props: { item: DebtItem; index: number }) => (
            <DebtItem
                debt={props.item}
                index={props.index}
                currencySymbol={currencySymbol}
                onToggleActive={handleToggleActive}
                onTogglePayment={handleTogglePayment}
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
            handleTogglePayment,
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

    const PaidOffList =
        paidOffDebts.length > 0 ?
            <Collapsible title={t("debts.paidOff")}>
                {paidOffDebts.map((debt) => (
                    <DebtItem
                        key={debt.id}
                        debt={debt}
                        index={-1}
                        currencySymbol={currencySymbol}
                        onToggleActive={handleToggleActive}
                        onTogglePayment={handleTogglePayment}
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
                ))}
            </Collapsible>
        :   null;

    return (
        <AuthGate>
            <FlatList
                ref={flatListRef}
                data={activeDebts}
                keyExtractor={(debt) => debt.id}
                contentContainerStyle={debts.length > 0 ? { backgroundColor: theme.background } : undefined}
                ListHeaderComponent={Header}
                renderItem={renderItem}
                onScrollToIndexFailed={(info) =>
                    setTimeout(() => flatListRef.current?.scrollToIndex({ index: info.index, viewPosition: 0.3 }), 100)
                }
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
                ListFooterComponent={PaidOffList}
            />
        </AuthGate>
    );
}
