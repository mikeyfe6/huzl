import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";

import { supabase } from "@/utils/supabase";

import { formatCurrency, formatNumber } from "@/utils/helpers";

import { AuthGate } from "@/components/loading";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ExpensesPie } from "@/components/ui/expenses-pie";
import { SORT_OPTIONS, SortModal, SortOption } from "@/components/ui/sort-modal";

import {
    businessColor,
    Colors,
    familyColor,
    greenColor,
    investColor,
    linkColor,
    mediumGreyColor,
    personalColor,
    redColor,
    slateColor,
} from "@/constants/theme";
import {
    baseBorder,
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
    baseRadius,
    baseSelect,
    baseSize,
    baseSpace,
    baseWeight,
} from "@/styles/base";

type Frequency = "daily" | "monthly" | "yearly";
type Category = "personal" | "business" | "family" | "invest";
interface ExpenseItem {
    id: string;
    name: string;
    amount: number;
    frequency: Frequency;
    category: Category;
    yearlyTotal: number;
    active: boolean;
}

export default function ExpensesScreen() {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [expenseName, setExpenseName] = useState("");
    const [expenseAmount, setExpenseAmount] = useState("");
    const [frequency, setFrequency] = useState<Frequency>("monthly");
    const [category, setCategory] = useState<Category>("personal");
    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<SortOption>("default");
    const [sortModalVisible, setSortModalVisible] = useState(false);
    const [nameFocused, setNameFocused] = useState(false);
    const [amountFocused, setAmountFocused] = useState(false);

    const { symbol: currencySymbol } = useCurrency();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    const nameInputRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    const calculateYearlyTotal = (amount: number, freq: Frequency): number => {
        const num = Number.parseFloat(amount.toString());
        if (Number.isNaN(num)) return 0;

        switch (freq) {
            case "daily":
                return num * 365;
            case "monthly":
                return num * 12;
            case "yearly":
                return num;
            default:
                return 0;
        }
    };

    const handleAddExpense = async () => {
        if (!user) return;
        if (!expenseName.trim() || !expenseAmount.trim()) return;

        setLoading(true);
        try {
            if (editingId) {
                const { data, error } = await supabase
                    .from("expenses")
                    .update({
                        name: expenseName,
                        amount: Number.parseFloat(expenseAmount),
                        frequency,
                        category,
                    })
                    .eq("id", editingId)
                    .select()
                    .single();

                if (error) {
                    console.error("Update error:", error);
                    alert(`Failed to update expense: ${error.message}`);
                    return;
                }

                if (data) {
                    const amount = Number.parseFloat(String(data.amount));
                    setExpenses((prev) =>
                        prev.map((exp) =>
                            exp.id === editingId
                                ? {
                                      id: data.id,
                                      name: data.name,
                                      amount,
                                      frequency: data.frequency as Frequency,
                                      category: (data.category as Category) ?? "personal",
                                      yearlyTotal: calculateYearlyTotal(amount, data.frequency as Frequency),
                                      active: data.active ?? true,
                                  }
                                : exp
                        )
                    );
                    setExpenseName("");
                    setExpenseAmount("");
                    setFrequency("monthly");
                    setCategory("personal");
                    setEditingId(null);
                }
            } else {
                const { data, error } = await supabase
                    .from("expenses")
                    .insert({
                        user_id: user.id,
                        name: expenseName,
                        amount: Number.parseFloat(expenseAmount),
                        frequency,
                        category,
                        active: true,
                    })
                    .select()
                    .single();

                if (error) {
                    console.error("Insert error:", error);
                    alert(`Failed to add expense: ${error.message}`);
                    return;
                }

                if (data) {
                    const amount = Number.parseFloat(String(data.amount));
                    const newExpense: ExpenseItem = {
                        id: data.id,
                        name: data.name,
                        amount,
                        frequency: data.frequency as Frequency,
                        category: (data.category as Category) ?? "personal",
                        yearlyTotal: calculateYearlyTotal(amount, data.frequency as Frequency),
                        active: data.active ?? true,
                    };
                    setExpenses((prev) => [newExpense, ...prev]);
                    setExpenseName("");
                    setExpenseAmount("");
                    setFrequency("monthly");
                    setCategory("personal");
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEditExpense = (expense: ExpenseItem) => {
        setExpenseName(expense.name);
        setExpenseAmount(expense.amount.toFixed(2));
        setFrequency(expense.frequency);
        setCategory(expense.category);
        setEditingId(expense.id);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        setTimeout(() => nameInputRef.current?.focus(), 100);
    };

    const handleCancelEdit = () => {
        setExpenseName("");
        setExpenseAmount("");
        setFrequency("monthly");
        setCategory("personal");
        setEditingId(null);
    };

    const handleDeleteExpense = async (id: string) => {
        if (!user) return;
        setLoading(true);
        try {
            const { error } = await supabase.from("expenses").delete().eq("id", id);
            if (!error) {
                setExpenses((prev) => prev.filter((expense) => expense.id !== id));
            }
        } finally {
            setLoading(false);
        }
    };

    const confirmDeleteExpense = (id: string, name: string) => {
        if (Platform.OS === "web") {
            const ok = globalThis.confirm(`${t("expenses.delete")} "${name}"?`);
            if (ok) handleDeleteExpense(id);
            return;
        }

        Alert.alert(t("expenses.deleteExpense"), `${t("expenses.delete")} "${name}"?`, [
            { text: t("expenses.cancel"), style: "cancel" },
            { text: t("expenses.delete"), style: "destructive", onPress: () => handleDeleteExpense(id) },
        ]);
    };

    const handleToggleActive = async (id: string, currentActive: boolean) => {
        if (!user) return;
        setLoading(true);
        try {
            const { error } = await supabase.from("expenses").update({ active: !currentActive }).eq("id", id);
            if (!error) {
                setExpenses((prev) =>
                    prev.map((expense) => (expense.id === id ? { ...expense, active: !currentActive } : expense))
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const sortLabelMap = useMemo(
        () => Object.fromEntries(SORT_OPTIONS.map((option) => [option.value, t(option.labelKey)])),
        [t]
    );

    const categoryLabelMap = useMemo(
        () => ({
            personal: t("expenses.personal"),
            business: t("expenses.business"),
            family: t("expenses.family"),
            invest: t("expenses.invest"),
        }),
        [t]
    );

    const getSortedExpenses = (): ExpenseItem[] => {
        const sorted = [...expenses];

        switch (sortOption) {
            case "alphabetic-asc":
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case "alphabetic-desc":
                return sorted.sort((a, b) => b.name.localeCompare(a.name));
            case "cost-asc":
                return sorted.sort((a, b) => a.yearlyTotal - b.yearlyTotal);
            case "cost-desc":
                return sorted.sort((a, b) => b.yearlyTotal - a.yearlyTotal);
            case "default":
            default:
                return sorted;
        }
    };

    const setSortAndClose = (opt: SortOption) => {
        setSortOption(opt);
        setSortModalVisible(false);
    };

    const sortedExpenses = getSortedExpenses();

    const totalYearlySpend = expenses.filter((e) => e.active).reduce((sum, expense) => sum + expense.yearlyTotal, 0);

    const totalMonthlySpend = totalYearlySpend / 12;
    const totalDailySpend = totalYearlySpend / 365;

    const personalYearlySpend = expenses
        .filter((e) => e.active && e.category === "personal")
        .reduce((sum, e) => sum + e.yearlyTotal, 0);

    const businessYearlySpend = expenses
        .filter((e) => e.active && e.category === "business")
        .reduce((sum, e) => sum + e.yearlyTotal, 0);

    const familyYearlySpend = expenses
        .filter((e) => e.active && e.category === "family")
        .reduce((sum, e) => sum + e.yearlyTotal, 0);

    const investYearlySpend = expenses
        .filter((e) => e.active && e.category === "invest")
        .reduce((sum, e) => sum + e.yearlyTotal, 0);

    const getFrequencyLabel = (freq: Frequency): string => {
        switch (freq) {
            case "daily":
                return t("expenses.daily");
            case "monthly":
                return t("expenses.monthly");
            case "yearly":
                return t("expenses.yearly");
        }
    };

    useEffect(() => {
        if (!user) {
            setExpenses([]);
            return;
        }
        let isMounted = true;
        const fetchExpenses = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from("expenses")
                    .select("id,name,amount,frequency,category,active")
                    .order("created_at", { ascending: false });
                if (!error && data) {
                    const mapped: ExpenseItem[] = data.map((row: any) => {
                        const amount = Number.parseFloat(String(row.amount));
                        return {
                            id: row.id,
                            name: row.name,
                            amount,
                            frequency: row.frequency as Frequency,
                            category: (row.category as Category) ?? "personal",
                            yearlyTotal: calculateYearlyTotal(amount, row.frequency as Frequency),
                            active: row.active ?? true,
                        };
                    });
                    if (isMounted) setExpenses(mapped);
                } else if (isMounted) {
                    setExpenses([]);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchExpenses();
        return () => {
            isMounted = false;
        };
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
                categoryGroup: {
                    ...baseFlex("center"),
                    ...baseGap,
                    flexWrap: "wrap",
                },
                categoryOption: {
                    ...baseFlex("center", "center"),
                    ...baseInput(theme),
                    flex: 1,
                    minWidth: 120,
                },
                categoryActive: {
                    borderColor: linkColor,
                    backgroundColor: theme.selectedTab,
                },
                select: {
                    ...baseInput(theme),
                    justifyContent: "center",
                    overflow: Platform.select({
                        ios: "hidden",
                        android: "hidden",
                        default: "visible",
                    }),
                    height: Platform.select({
                        ios: 125,
                        android: undefined,
                        default: undefined,
                    }),
                },
                selectInput: {
                    ...baseInput(theme),
                    borderWidth: 0,
                    fontFamily: "System",
                    color: theme.inputText,
                    fontSize: Platform.select({
                        ios: 16,
                        android: 16,
                        default: 16,
                    }),
                    height: Platform.select({
                        ios: 216,
                        android: 44,
                        default: 44,
                    }),
                    paddingHorizontal: Platform.select({
                        ios: 0,
                        android: 0,
                        default: 12,
                    }),
                    paddingVertical: Platform.select({
                        ios: 0,
                        android: 0,
                        default: 10,
                    }),
                    minHeight: Platform.select({
                        android: "100%",
                    }),
                },
                selectOption: {
                    color: theme.inputText,
                    fontSize: Platform.select({
                        ios: 16,
                        android: 16,
                        default: 16,
                    }),
                },
                selectIcon: {
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    marginTop: -9,
                    pointerEvents: "none",
                },
                buttons: {
                    ...baseFlex("center"),
                    ...baseGap,
                    marginTop: 8,
                },
                button: {
                    ...baseButton,
                },
                buttonText: {
                    ...baseButtonText,
                },
                expenseList: {
                    ...baseList,
                },
                expenseHeader: {
                    ...baseFlex("space-between", "center"),
                    ...baseSpace,
                    marginBottom: 12,
                },
                expenseTitle: {
                    ...baseFlex("center", "center"),
                    ...baseSpace,
                },
                expenseNumber: {
                    ...baseSize,
                    opacity: 0.6,
                },
                sortTrigger: {
                    ...baseFlex("center", "center"),
                    ...baseInput(theme),
                    ...baseSpace,
                    ...baseSelect,
                },
                sortTriggerText: {
                    ...baseWeight,
                    fontSize: 14,
                    color: theme.label,
                },
                expenseAmounts: {
                    ...baseFlex("center"),
                    ...baseSpace,
                },
                expenseCard: {
                    ...baseCard(theme),
                },
                expenseInactive: {
                    opacity: 0.5,
                },
                expenseItem: {
                    ...baseFlex("space-between", "flex-start"),
                    ...baseGap,
                },
                expenseInfo: {
                    flex: 1,
                },
                expenseLabel: {
                    fontSize: 13,
                    opacity: 0.7,
                },
                expenseAmount: {
                    ...baseWeight,
                    fontSize: 13,
                },
                expenseMeta: {
                    ...baseFlex("flex-start", "center"),
                    ...baseSpace,
                    marginTop: 6,
                },
                badge: {
                    ...baseBorder,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    opacity: 0.7,
                    borderRadius: 12,
                },
                badgePersonal: {
                    backgroundColor: personalColor,
                    borderColor: personalColor,
                },
                badgeBusiness: {
                    backgroundColor: businessColor,
                    borderColor: businessColor,
                },
                badgeFamily: {
                    backgroundColor: familyColor,
                    borderColor: familyColor,
                },
                badgeInvest: {
                    backgroundColor: investColor,
                    borderColor: investColor,
                },
                badgeText: {
                    ...baseWeight,
                    fontSize: 11,
                    lineHeight: 11,
                    color: theme.text,
                },
                expenseIcons: {
                    ...baseIcons,
                },
                expenseIcon: {
                    ...baseIcon,
                },
                expenseTotal: {
                    ...baseFlex("space-between"),
                    paddingTop: 8,
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: theme.dividerColor,
                },
                expensePeriod: {
                    fontSize: 13,
                    color: slateColor,
                },
                expenseYearly: {
                    ...baseWeight,
                    fontSize: 14,
                    color: theme.text,
                },
                expenseMonthly: {
                    ...baseWeight,
                    fontSize: 14,
                    color: mediumGreyColor,
                },
                totalSection: {
                    ...baseBorder,
                    ...baseSpace,
                    ...baseRadius,
                    margin: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 20,
                    flex: 1,
                    borderColor: theme.inputBorder,
                },
                totalYear: {
                    backgroundColor: theme.yearlyTab,
                },
                totalMonth: {
                    backgroundColor: theme.monthlyTab,
                },
                totalDay: {
                    backgroundColor: theme.dailyTab,
                },
                totalDetails: {
                    ...baseFlex("space-between", "center"),
                    gap: 16,
                    paddingHorizontal: 16,
                    marginBottom: 16,
                },
                totalInline: {
                    fontWeight: "bold",
                    paddingLeft: 8,
                },
                totalPeriod: {
                    marginHorizontal: 0,
                    marginTop: 0,
                    marginBottom: 0,
                },
                totalAmount: {
                    fontSize: 32,
                    fontWeight: "bold",
                    color: theme.text,
                    lineHeight: 40,
                },
                chartContainer: {
                    ...baseFlex("center", "flex-start"),
                    backgroundColor: theme.background,
                    flexWrap: "wrap",
                    paddingHorizontal: 16,
                    paddingVertical: 32,
                    rowGap: 24,
                    columnGap: 64,
                },
                chartStats: {
                    width: "100%",
                    maxWidth: 700,
                    gap: 24,
                    marginVertical: 8,
                },
                chartButtons: {
                    ...baseFlex("center"),
                    ...baseGap,
                    flexWrap: "wrap",
                },
                chartButton: {
                    ...baseFlex("space-between", "center"),
                    ...baseRadius,
                    ...baseBorder,
                    flex: 1,
                    flexBasis: 225,
                    minHeight: 44,
                    paddingHorizontal: 18,
                },
                chartButtonDot: {
                    width: 12,
                    height: 12,
                    borderRadius: 25,
                },
                chartButtonText: { ...baseWeight },
                chartButtonLabel: {
                    fontSize: 14,
                    color: theme.statLabel,
                },
                chartItems: {
                    ...baseFlex("center", "center"),
                    flexWrap: "wrap",
                    rowGap: 10,
                    columnGap: 8,
                },
                chartItem: {
                    ...baseRadius,
                    paddingHorizontal: 12,
                    paddingTop: 3,
                    paddingBottom: 4,
                    opacity: 0.75,
                    backgroundColor: theme.dividerColor,
                    borderColor: theme.borderColor,
                },
                chartItemText: {
                    ...baseWeight,
                },
                chartItemLabel: {
                    fontSize: 13,
                    color: theme.statLabel,
                },
                emptyState: {
                    ...baseEmpty,
                },
                emptyStateText: {
                    ...baseEmptyText(theme),
                },
            }),
        [theme]
    );

    return (
        <AuthGate>
            <ScrollView ref={scrollViewRef} contentContainerStyle={styles.container}>
                <ThemedView style={styles.fieldset}>
                    <ThemedText type="title" style={styles.heading}>
                        {t("expenses.title")}
                    </ThemedText>

                    <ThemedText style={styles.label}>{t("expenses.name")}</ThemedText>
                    <TextInput
                        ref={nameInputRef}
                        style={[styles.input, nameFocused && { borderColor: linkColor }]}
                        placeholder={t("expenses.namePlaceholder")}
                        placeholderTextColor={theme.placeholder}
                        value={expenseName}
                        onChangeText={setExpenseName}
                        onFocus={() => setNameFocused(true)}
                        onBlur={() => setNameFocused(false)}
                    />

                    <ThemedText style={styles.label}>
                        {t("expenses.amount")} ({currencySymbol})
                    </ThemedText>
                    <TextInput
                        style={[
                            styles.input,
                            amountFocused && {
                                borderColor: linkColor,
                            },
                        ]}
                        placeholder="0.00"
                        placeholderTextColor={theme.placeholder}
                        value={expenseAmount}
                        onChangeText={(text) => setExpenseAmount(formatNumber(text))}
                        keyboardType="decimal-pad"
                        onFocus={() => setAmountFocused(true)}
                        onBlur={() => setAmountFocused(false)}
                    />

                    <ThemedText style={styles.label}>{t("expenses.category")}</ThemedText>
                    <View style={styles.categoryGroup}>
                        <TouchableOpacity
                            style={[styles.categoryOption, category === "personal" && styles.categoryActive]}
                            onPress={() => setCategory("personal")}
                            accessibilityRole="radio"
                            accessibilityState={{
                                selected: category === "personal",
                            }}
                        >
                            <ThemedText>{t("expenses.personal")}</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.categoryOption, category === "business" && styles.categoryActive]}
                            onPress={() => setCategory("business")}
                            accessibilityRole="radio"
                            accessibilityState={{
                                selected: category === "business",
                            }}
                        >
                            <ThemedText>{t("expenses.business")}</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.categoryOption, category === "family" && styles.categoryActive]}
                            onPress={() => setCategory("family")}
                            accessibilityRole="radio"
                            accessibilityState={{
                                selected: category === "family",
                            }}
                        >
                            <ThemedText>{t("expenses.family")}</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.categoryOption, category === "invest" && styles.categoryActive]}
                            onPress={() => setCategory("invest")}
                            accessibilityRole="radio"
                            accessibilityState={{
                                selected: category === "invest",
                            }}
                        >
                            <ThemedText>{t("expenses.invest")}</ThemedText>
                        </TouchableOpacity>
                    </View>

                    <ThemedText style={styles.label}>{t("expenses.frequency")}</ThemedText>
                    <View style={[styles.select]}>
                        <Picker
                            selectedValue={frequency}
                            onValueChange={(itemValue) => setFrequency(itemValue as Frequency)}
                            style={[
                                styles.selectInput,
                                Platform.OS === "web"
                                    ? ([
                                          {
                                              appearance: "none",
                                              WebkitAppearance: "none",
                                              MozAppearance: "none",
                                          } as any,
                                      ] as any)
                                    : null,
                            ]}
                            itemStyle={styles.selectOption}
                        >
                            <Picker.Item label={t("expenses.daily")} value="daily" />
                            <Picker.Item label={t("expenses.monthly")} value="monthly" />
                            <Picker.Item label={t("expenses.yearly")} value="yearly" />
                        </Picker>
                        {Platform.OS === "web" && (
                            <Ionicons name="chevron-down" size={18} color={theme.inputText} style={styles.selectIcon} />
                        )}
                    </View>

                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: greenColor }]}
                            onPress={handleAddExpense}
                        >
                            <ThemedText style={styles.buttonText}>
                                {editingId ? t("expenses.updateExpense") : t("expenses.addExpense")}
                            </ThemedText>
                        </TouchableOpacity>
                        {editingId && (
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: redColor }]}
                                onPress={handleCancelEdit}
                            >
                                <ThemedText style={styles.buttonText}>{t("expenses.cancel")}</ThemedText>
                            </TouchableOpacity>
                        )}
                    </View>
                </ThemedView>

                {expenses.length > 0 && (
                    <ThemedView style={styles.expenseList}>
                        <View style={styles.expenseHeader}>
                            <View style={styles.expenseTitle}>
                                <ThemedText type="subtitle">{t("expenses.yourExpenses")}</ThemedText>
                                <ThemedText style={styles.expenseNumber}>({sortedExpenses.length})</ThemedText>
                            </View>
                            <TouchableOpacity
                                style={styles.sortTrigger}
                                onPress={() => setSortModalVisible(true)}
                                accessibilityRole="button"
                                accessibilityLabel="Open sort options"
                            >
                                <Ionicons name="swap-vertical" size={16} color={theme.label} />
                                <ThemedText style={styles.sortTriggerText}>{sortLabelMap[sortOption]}</ThemedText>
                                <Ionicons name="chevron-down" size={16} color={theme.label} />
                            </TouchableOpacity>
                        </View>

                        <SortModal
                            visible={sortModalVisible}
                            sortOption={sortOption}
                            onSelect={setSortAndClose}
                            onRequestClose={() => setSortModalVisible(false)}
                            theme={theme}
                        />

                        {sortedExpenses.map((expense) => (
                            <View
                                key={expense.id}
                                style={[styles.expenseCard, !expense.active && styles.expenseInactive]}
                            >
                                <View style={styles.expenseItem}>
                                    <View style={styles.expenseInfo}>
                                        <ThemedText type="defaultSemiBold" numberOfLines={1} ellipsizeMode="tail">
                                            {expense.name}
                                        </ThemedText>
                                        <View style={styles.expenseMeta}>
                                            <ThemedText style={styles.expenseLabel}>
                                                <ThemedText style={styles.expenseAmount}>
                                                    {formatCurrency(expense.amount, currencySymbol)}
                                                </ThemedText>{" "}
                                                - {getFrequencyLabel(expense.frequency)}
                                            </ThemedText>
                                            <View
                                                style={[
                                                    styles.badge,
                                                    expense.category === "personal" && styles.badgePersonal,
                                                    expense.category === "business" && styles.badgeBusiness,
                                                    expense.category === "family" && styles.badgeFamily,
                                                    expense.category === "invest" && styles.badgeInvest,
                                                ]}
                                            >
                                                <ThemedText style={styles.badgeText}>
                                                    {categoryLabelMap[expense.category]}
                                                </ThemedText>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.expenseIcons}>
                                        <TouchableOpacity
                                            onPress={() => handleToggleActive(expense.id, expense.active)}
                                            style={[
                                                styles.expenseIcon,
                                                {
                                                    borderColor: expense.active ? greenColor : mediumGreyColor,
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name={expense.active ? "eye" : "eye-off"}
                                                size={16}
                                                color={expense.active ? greenColor : mediumGreyColor}
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleEditExpense(expense)}
                                            style={[
                                                styles.expenseIcon,
                                                {
                                                    borderColor: mediumGreyColor,
                                                },
                                            ]}
                                        >
                                            <Ionicons name="pencil" size={16} color={mediumGreyColor} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => confirmDeleteExpense(expense.id, expense.name)}
                                            style={[
                                                styles.expenseIcon,
                                                {
                                                    borderColor: redColor,
                                                },
                                            ]}
                                        >
                                            <Ionicons name="trash" size={16} color={redColor} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.expenseTotal}>
                                    <ThemedText style={styles.expensePeriod}>{t("expenses.period")}:</ThemedText>
                                    <View style={styles.expenseAmounts}>
                                        <ThemedText style={styles.expenseYearly}>
                                            {formatCurrency(expense.yearlyTotal, currencySymbol)}
                                        </ThemedText>
                                        <ThemedText style={styles.expenseMonthly}>
                                            {formatCurrency(expense.yearlyTotal / 12, currencySymbol)}
                                        </ThemedText>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ThemedView>
                )}

                {expenses.length > 0 && (
                    <>
                        <ThemedView style={[styles.totalSection, styles.totalYear]}>
                            <ThemedText type="subtitle">{t("expenses.yearlySpend")}</ThemedText>
                            <ThemedText style={styles.totalAmount}>
                                {formatCurrency(totalYearlySpend, currencySymbol)}
                            </ThemedText>
                            <ThemedText>
                                {t("expenses.personal")}:{" "}
                                <ThemedText style={styles.totalInline}>
                                    {formatCurrency(personalYearlySpend, currencySymbol)}
                                </ThemedText>
                            </ThemedText>
                            <ThemedText>
                                {t("expenses.business")}:{" "}
                                <ThemedText style={styles.totalInline}>
                                    {formatCurrency(businessYearlySpend, currencySymbol)}
                                </ThemedText>
                            </ThemedText>
                            <ThemedText>
                                {t("expenses.family")}:{" "}
                                <ThemedText style={styles.totalInline}>
                                    {formatCurrency(familyYearlySpend, currencySymbol)}
                                </ThemedText>
                            </ThemedText>
                            <ThemedText>
                                {t("expenses.invest")}:{" "}
                                <ThemedText style={styles.totalInline}>
                                    {formatCurrency(investYearlySpend, currencySymbol)}
                                </ThemedText>
                            </ThemedText>
                        </ThemedView>

                        <View style={styles.totalDetails}>
                            <ThemedView style={[styles.totalSection, styles.totalPeriod, styles.totalMonth]}>
                                <ThemedText type="defaultSemiBold">{t("expenses.monthlySpend")}</ThemedText>
                                <ThemedText style={[styles.totalAmount, { fontSize: 28 }]}>
                                    {formatCurrency(totalMonthlySpend, currencySymbol)}
                                </ThemedText>
                            </ThemedView>

                            <ThemedView style={[styles.totalSection, styles.totalPeriod, styles.totalDay]}>
                                <ThemedText type="defaultSemiBold">{t("expenses.dailySpend")}</ThemedText>
                                <ThemedText style={[styles.totalAmount, { fontSize: 28 }]}>
                                    {formatCurrency(totalDailySpend, currencySymbol)}
                                </ThemedText>
                            </ThemedView>
                        </View>

                        <View style={styles.chartContainer}>
                            <ExpensesPie
                                expenses={expenses}
                                selectedCategory={category}
                                onCategorySelect={setCategory}
                            />
                            <View style={styles.chartStats}>
                                <View style={styles.chartButtons}>
                                    {(["personal", "business", "family", "invest"] as Category[]).map((cat) => {
                                        let btnBgColor = theme.inputBackground;
                                        let btnBorderColor = theme.inputBorder;
                                        let dotColor = slateColor;
                                        let percent = 0;

                                        switch (cat) {
                                            case "personal":
                                                dotColor = personalColor;
                                                percent =
                                                    totalYearlySpend > 0
                                                        ? (personalYearlySpend / totalYearlySpend) * 100
                                                        : 0;
                                                break;
                                            case "business":
                                                dotColor = businessColor;
                                                percent =
                                                    totalYearlySpend > 0
                                                        ? (businessYearlySpend / totalYearlySpend) * 100
                                                        : 0;
                                                break;
                                            case "family":
                                                dotColor = familyColor;
                                                percent =
                                                    totalYearlySpend > 0
                                                        ? (familyYearlySpend / totalYearlySpend) * 100
                                                        : 0;
                                                break;
                                            case "invest":
                                                dotColor = investColor;
                                                percent =
                                                    totalYearlySpend > 0
                                                        ? (investYearlySpend / totalYearlySpend) * 100
                                                        : 0;
                                                break;
                                        }

                                        if (category === cat) {
                                            btnBgColor = dotColor;
                                            btnBorderColor = dotColor;
                                        }

                                        return (
                                            <TouchableOpacity
                                                key={cat}
                                                onPress={() => setCategory(cat)}
                                                style={[
                                                    styles.chartButton,
                                                    {
                                                        backgroundColor: btnBgColor,
                                                        borderColor: btnBorderColor,
                                                    },
                                                ]}
                                            >
                                                <View
                                                    style={[
                                                        styles.chartButtonDot,
                                                        {
                                                            backgroundColor: dotColor,
                                                        },
                                                    ]}
                                                />
                                                <ThemedText style={styles.chartButtonText}>
                                                    {categoryLabelMap[cat]}
                                                </ThemedText>
                                                <ThemedText style={[styles.chartButtonText, styles.chartButtonLabel]}>
                                                    {percent.toFixed(1)}%
                                                </ThemedText>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                                <View style={styles.chartItems}>
                                    {expenses.filter((e) => e.active && e.category === category).length === 0 ? (
                                        <ThemedText>{t("expenses.noExpensesInCategories")}</ThemedText>
                                    ) : (
                                        expenses
                                            .filter((e) => e.active && e.category === category)
                                            .map((e) => ({
                                                ...e,
                                                percent:
                                                    (e.yearlyTotal /
                                                        (expenses
                                                            .filter((x) => x.active)
                                                            .reduce((sum, x) => sum + x.yearlyTotal, 0) || 1)) *
                                                    100,
                                            }))
                                            .sort((a, b) => b.percent - a.percent)
                                            .map((e) => (
                                                <ThemedText key={e.id} style={styles.chartItem}>
                                                    <ThemedText style={styles.chartItemText}>{e.name} </ThemedText>
                                                    <ThemedText style={styles.chartItemLabel}>
                                                        - {e.percent.toFixed(1)}%
                                                    </ThemedText>
                                                </ThemedText>
                                            ))
                                    )}
                                </View>
                            </View>
                        </View>
                    </>
                )}

                {expenses.length === 0 && !loading && (
                    <ThemedView style={styles.emptyState}>
                        <ThemedText style={styles.emptyStateText}>{t("expenses.addFirstExpense")}</ThemedText>
                    </ThemedView>
                )}
            </ScrollView>
        </AuthGate>
    );
}
