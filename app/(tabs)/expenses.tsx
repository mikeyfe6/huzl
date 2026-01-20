import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";

import { formatCurrency, formatNumber } from "@/utils/helpers";
import { supabase } from "@/utils/supabase";

import { AuthGate } from "@/components/loading";
import { SORT_OPTIONS, SortModal, SortOption } from "@/components/modal/sort-expenses-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ExpensesPie } from "@/components/ui/expenses-pie";

import {
    businessColor,
    Colors,
    entertainmentColor,
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
    baseBold,
    baseBorder,
    baseButton,
    baseButtonText,
    baseCard,
    baseCorner,
    baseEmpty,
    baseEmptyText,
    baseFlex,
    baseGap,
    baseGreen,
    baseIcon,
    baseIcons,
    baseInput,
    baseLabel,
    baseList,
    baseMain,
    baseMini,
    baseOutline,
    baseRadius,
    baseRed,
    baseSelect,
    baseSize,
    baseSmall,
    baseSpace,
    baseWeight,
} from "@/styles/base";

type Frequency = "daily" | "weekly" | "monthly" | "quarterly" | "halfyearly" | "yearly";
type Category = "personal" | "business" | "family" | "invest" | "entertainment";
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

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];
    const { symbol: currencySymbol } = useCurrency();

    const nameInputRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    const [expenseName, setExpenseName] = useState("");
    const [expenseAmount, setExpenseAmount] = useState("");
    const [frequency, setFrequency] = useState<Frequency>("monthly");
    const [category, setCategory] = useState<Category>("personal");
    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<SortOption>("default");
    const [sortModalVisible, setSortModalVisible] = useState(false);

    const calculateYearlyTotal = (amount: number, freq: Frequency): number => {
        const num = Number.parseFloat(amount.toString());
        if (Number.isNaN(num)) return 0;

        switch (freq) {
            case "daily":
                return num * 365;
            case "weekly":
                return num * 52;
            case "monthly":
                return num * 12;
            case "quarterly":
                return num * 4;
            case "halfyearly":
                return num * 2;
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
                            exp.id === editingId ?
                                {
                                    id: data.id,
                                    name: data.name,
                                    amount,
                                    frequency: data.frequency as Frequency,
                                    category: (data.category as Category) ?? "personal",
                                    yearlyTotal: calculateYearlyTotal(amount, data.frequency as Frequency),
                                    active: data.active ?? true,
                                }
                            :   exp,
                        ),
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
            const ok = globalThis.confirm(`${t("common.delete")} "${name}"?`);
            if (ok) handleDeleteExpense(id);
            return;
        }

        Alert.alert(t("expenses.deleteExpense"), `${t("common.delete")} "${name}"?`, [
            { text: t("common.cancel"), style: "cancel" },
            { text: t("common.delete"), style: "destructive", onPress: () => handleDeleteExpense(id) },
        ]);
    };

    const handleToggleActive = async (id: string, currentActive: boolean) => {
        if (!user) return;
        setLoading(true);
        try {
            const { error } = await supabase.from("expenses").update({ active: !currentActive }).eq("id", id);
            if (!error) {
                setExpenses((prev) =>
                    prev.map((expense) => (expense.id === id ? { ...expense, active: !currentActive } : expense)),
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const sortLabelMap = useMemo(
        () => Object.fromEntries(SORT_OPTIONS.map((option) => [option.value, t(option.labelKey)])),
        [t],
    );

    const categoryLabelMap = useMemo(
        () => ({
            personal: t("expenses.category.personal"),
            business: t("expenses.category.business"),
            family: t("expenses.category.family"),
            invest: t("expenses.category.invest"),
            entertainment: t("expenses.category.entertainment"),
        }),
        [t],
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
    const totalWeeklySpend = totalYearlySpend / 52;
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

    const entertainmentYearlySpend = expenses
        .filter((e) => e.active && e.category === "entertainment")
        .reduce((sum, e) => sum + e.yearlyTotal, 0);

    const getFrequencyLabel = (freq: Frequency): string => {
        switch (freq) {
            case "daily":
                return t("expenses.frequency.daily");
            case "weekly":
                return t("expenses.frequency.weekly");
            case "monthly":
                return t("expenses.frequency.monthly");
            case "quarterly":
                return t("expenses.frequency.quarterly");
            case "halfyearly":
                return t("expenses.frequency.halfyearly");
            case "yearly":
                return t("expenses.frequency.yearly");
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
                    ...baseSize,
                    color: theme.inputText,
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
                    ...baseButton(theme),
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
                    ...baseSmall,
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
                expenseWrapper: {
                    ...baseFlex("space-between", "flex-start"),
                    ...baseGap,
                },
                expenseInfo: {
                    flex: 1,
                },
                expenseLabel: {
                    ...baseMini,
                    opacity: 0.7,
                },
                expenseAmount: {
                    ...baseWeight,
                    ...baseMini,
                },
                expenseMeta: {
                    ...baseFlex("flex-start", "center"),
                    ...baseSpace,
                    marginTop: 6,
                },
                badge: {
                    ...baseBorder,
                    ...baseCorner,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    opacity: 0.7,
                },
                badgePersonal: {
                    backgroundColor: personalColor + "50",
                    borderColor: personalColor,
                },
                badgeBusiness: {
                    backgroundColor: businessColor + "50",
                    borderColor: businessColor,
                },
                badgeFamily: {
                    backgroundColor: familyColor + "50",
                    borderColor: familyColor,
                },
                badgeInvest: {
                    backgroundColor: investColor + "50",
                    borderColor: investColor,
                },
                badgeEntertainment: {
                    backgroundColor: entertainmentColor + "50",
                    borderColor: entertainmentColor,
                },
                badgeText: {
                    ...baseWeight,
                    fontSize: 11,
                    lineHeight: 12,
                    color: theme.text,
                    opacity: 0.9,
                },
                expenseIcons: {
                    ...baseIcons,
                },
                expenseIcon: {
                    ...baseIcon(theme),
                },
                expenseTotal: {
                    ...baseFlex("space-between"),
                    paddingTop: 8,
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: theme.dividerColor,
                },
                expensePeriod: {
                    ...baseMini,
                    color: slateColor,
                },
                expenseYearly: {
                    ...baseWeight,
                    ...baseSmall,
                    color: theme.text,
                },
                expenseMonthly: {
                    ...baseWeight,
                    ...baseSmall,
                    color: mediumGreyColor,
                },
                totalSection: {
                    ...baseBorder,
                    ...baseSpace,
                    ...baseRadius,
                    backgroundColor: theme.background,
                    margin: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 20,
                    flex: 1,
                    borderColor: theme.inputBorder,
                },
                totalTitle: {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.dividerColor,
                    paddingBottom: 12,
                },
                totalContent: { display: "flex", alignItems: "center" },
                totalLabel: { minWidth: 100 },
                totalDetails: {
                    ...baseFlex("space-between", "center"),
                    flexWrap: "wrap",
                    gap: 16,
                    paddingHorizontal: 16,
                    marginBottom: 16,
                },
                totalDots: {
                    width: 10,
                    height: 10,
                    borderRadius: 25,
                    marginRight: 8,
                    opacity: 0.75,
                },
                totalInline: {
                    ...baseBold,
                    paddingLeft: 8,
                },
                totalPeriod: {
                    marginHorizontal: 0,
                    marginTop: 0,
                    marginBottom: 0,
                    minWidth: 175,
                    alignSelf: "stretch",
                },
                totalAmount: {
                    ...baseBold,
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
                    ...baseOutline(theme),
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
                    opacity: 0.75,
                },
                chartButtonText: { ...baseWeight },
                chartButtonLabel: {
                    ...baseSmall,
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
                    ...baseMini,
                    color: theme.statLabel,
                },
                emptyState: {
                    ...baseEmpty,
                },
                emptyStateText: {
                    ...baseEmptyText(theme),
                },
            }),
        [theme],
    );

    return (
        <AuthGate>
            <ScrollView ref={scrollViewRef} contentContainerStyle={styles.container}>
                <ThemedView style={styles.fieldset}>
                    <ThemedText type="title" style={styles.heading}>
                        {t("expenses.title")}
                    </ThemedText>

                    <ThemedText style={styles.label}>{t("expenses.label.name")}</ThemedText>
                    <TextInput
                        ref={nameInputRef}
                        style={styles.input}
                        placeholder={t("expenses.placeholder.name")}
                        placeholderTextColor={theme.placeholder}
                        value={expenseName}
                        onChangeText={setExpenseName}
                    />

                    <ThemedText style={styles.label}>
                        {t("expenses.label.amount")} ({currencySymbol})
                    </ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        placeholderTextColor={theme.placeholder}
                        value={expenseAmount}
                        onChangeText={(text) => setExpenseAmount(formatNumber(text))}
                        keyboardType="decimal-pad"
                    />

                    <ThemedText style={styles.label}>{t("expenses.label.category")}</ThemedText>
                    <View style={styles.categoryGroup}>
                        <TouchableOpacity
                            style={[styles.categoryOption, category === "personal" && styles.categoryActive]}
                            onPress={() => setCategory("personal")}
                            accessibilityRole="radio"
                            accessibilityState={{
                                selected: category === "personal",
                            }}
                        >
                            <ThemedText>{t("expenses.category.personal")}</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.categoryOption, category === "business" && styles.categoryActive]}
                            onPress={() => setCategory("business")}
                            accessibilityRole="radio"
                            accessibilityState={{
                                selected: category === "business",
                            }}
                        >
                            <ThemedText>{t("expenses.category.business")}</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.categoryOption, category === "family" && styles.categoryActive]}
                            onPress={() => setCategory("family")}
                            accessibilityRole="radio"
                            accessibilityState={{
                                selected: category === "family",
                            }}
                        >
                            <ThemedText>{t("expenses.category.family")}</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.categoryOption, category === "invest" && styles.categoryActive]}
                            onPress={() => setCategory("invest")}
                            accessibilityRole="radio"
                            accessibilityState={{
                                selected: category === "invest",
                            }}
                        >
                            <ThemedText>{t("expenses.category.invest")}</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.categoryOption, category === "entertainment" && styles.categoryActive]}
                            onPress={() => setCategory("entertainment")}
                            accessibilityRole="radio"
                            accessibilityState={{
                                selected: category === "entertainment",
                            }}
                        >
                            <ThemedText>{t("expenses.category.entertainment")}</ThemedText>
                        </TouchableOpacity>
                    </View>

                    <ThemedText style={styles.label}>{t("expenses.label.frequency")}</ThemedText>
                    <View style={[styles.select]}>
                        <Picker
                            selectedValue={frequency}
                            onValueChange={(itemValue) => setFrequency(itemValue as Frequency)}
                            style={[
                                styles.selectInput,
                                Platform.OS === "web" ?
                                    ([
                                        {
                                            appearance: "none",
                                            WebkitAppearance: "none",
                                            MozAppearance: "none",
                                        } as any,
                                    ] as any)
                                :   null,
                            ]}
                            itemStyle={styles.selectOption}
                        >
                            <Picker.Item label={t("expenses.frequency.daily")} value="daily" />
                            <Picker.Item label={t("expenses.frequency.weekly")} value="weekly" />
                            <Picker.Item label={t("expenses.frequency.monthly")} value="monthly" />
                            <Picker.Item label={t("expenses.frequency.quarterly")} value="quarterly" />
                            <Picker.Item label={t("expenses.frequency.halfyearly")} value="halfyearly" />
                            <Picker.Item label={t("expenses.frequency.yearly")} value="yearly" />
                        </Picker>
                        {Platform.OS === "web" && (
                            <Ionicons name="chevron-down" size={18} color={theme.inputText} style={styles.selectIcon} />
                        )}
                    </View>

                    <View style={styles.buttons}>
                        <TouchableOpacity style={[styles.button, { ...baseGreen }]} onPress={handleAddExpense}>
                            <ThemedText style={styles.buttonText}>
                                {editingId ? t("expenses.button.updateExpense") : t("expenses.button.addExpense")}
                            </ThemedText>
                        </TouchableOpacity>
                        {editingId && (
                            <TouchableOpacity style={[styles.button, { ...baseRed }]} onPress={handleCancelEdit}>
                                <ThemedText style={styles.buttonText}>{t("common.cancel")}</ThemedText>
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
                                <View style={styles.expenseWrapper}>
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
                                                    expense.category === "entertainment" && styles.badgeEntertainment,
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
                        <ThemedView style={[styles.totalSection]}>
                            <ThemedText type="subtitle" style={styles.totalTitle}>
                                {t("expenses.yearlySpend")}
                            </ThemedText>
                            <ThemedText style={[styles.totalAmount, { fontSize: 32, marginBottom: 24 }]}>
                                {formatCurrency(totalYearlySpend, currencySymbol)}
                            </ThemedText>
                            <ThemedText style={styles.totalContent}>
                                <View
                                    style={[
                                        styles.totalDots,
                                        {
                                            backgroundColor: personalColor,
                                        },
                                    ]}
                                />{" "}
                                <ThemedText style={styles.totalLabel}> {t("expenses.category.personal")}:</ThemedText>{" "}
                                <ThemedText style={styles.totalInline}>
                                    {" "}
                                    {formatCurrency(personalYearlySpend, currencySymbol)}
                                </ThemedText>
                            </ThemedText>
                            <ThemedText style={styles.totalContent}>
                                <View
                                    style={[
                                        styles.totalDots,
                                        {
                                            backgroundColor: businessColor,
                                        },
                                    ]}
                                />{" "}
                                <ThemedText style={styles.totalLabel}> {t("expenses.category.business")}:</ThemedText>{" "}
                                <ThemedText style={styles.totalInline}>
                                    {" "}
                                    {formatCurrency(businessYearlySpend, currencySymbol)}
                                </ThemedText>
                            </ThemedText>
                            <ThemedText style={styles.totalContent}>
                                <View
                                    style={[
                                        styles.totalDots,
                                        {
                                            backgroundColor: familyColor,
                                        },
                                    ]}
                                />{" "}
                                <ThemedText style={styles.totalLabel}> {t("expenses.category.family")}:</ThemedText>{" "}
                                <ThemedText style={styles.totalInline}>
                                    {" "}
                                    {formatCurrency(familyYearlySpend, currencySymbol)}
                                </ThemedText>
                            </ThemedText>
                            <ThemedText style={styles.totalContent}>
                                <View
                                    style={[
                                        styles.totalDots,
                                        {
                                            backgroundColor: investColor,
                                        },
                                    ]}
                                />{" "}
                                <ThemedText style={styles.totalLabel}> {t("expenses.category.invest")}:</ThemedText>{" "}
                                <ThemedText style={styles.totalInline}>
                                    {" "}
                                    {formatCurrency(investYearlySpend, currencySymbol)}
                                </ThemedText>
                            </ThemedText>
                            <ThemedText style={styles.totalContent}>
                                <View
                                    style={[
                                        styles.totalDots,
                                        {
                                            backgroundColor: entertainmentColor,
                                        },
                                    ]}
                                />{" "}
                                <ThemedText style={styles.totalLabel}>
                                    {" "}
                                    {t("expenses.category.entertainment")}:
                                </ThemedText>{" "}
                                <ThemedText style={styles.totalInline}>
                                    {" "}
                                    {formatCurrency(entertainmentYearlySpend, currencySymbol)}
                                </ThemedText>
                            </ThemedText>
                        </ThemedView>

                        <View style={styles.totalDetails}>
                            <ThemedView style={[styles.totalSection, styles.totalPeriod]}>
                                <ThemedText type="defaultSemiBold" style={styles.totalTitle}>
                                    {t("expenses.monthlySpend")}
                                </ThemedText>
                                <ThemedText style={[styles.totalAmount, { fontSize: 28 }]}>
                                    {formatCurrency(totalMonthlySpend, currencySymbol)}
                                </ThemedText>
                            </ThemedView>

                            <ThemedView style={[styles.totalSection, styles.totalPeriod]}>
                                <ThemedText type="defaultSemiBold" style={styles.totalTitle}>
                                    {t("expenses.weeklySpend")}
                                </ThemedText>
                                <ThemedText style={[styles.totalAmount, { fontSize: 28 }]}>
                                    {formatCurrency(totalWeeklySpend, currencySymbol)}
                                </ThemedText>
                            </ThemedView>

                            <ThemedView style={[styles.totalSection, styles.totalPeriod]}>
                                <ThemedText type="defaultSemiBold" style={styles.totalTitle}>
                                    {t("expenses.dailySpend")}
                                </ThemedText>
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
                                theme={theme}
                            />
                            <View style={styles.chartStats}>
                                <View style={styles.chartButtons}>
                                    {(["personal", "business", "family", "invest", "entertainment"] as Category[]).map(
                                        (cat) => {
                                            let btnBgColor = theme.inputBackground;
                                            let btnBorderColor = theme.inputBorder;
                                            let dotColor = slateColor;
                                            let percent = 0;

                                            switch (cat) {
                                                case "personal":
                                                    dotColor = personalColor;
                                                    percent =
                                                        totalYearlySpend > 0 ?
                                                            (personalYearlySpend / totalYearlySpend) * 100
                                                        :   0;
                                                    break;
                                                case "business":
                                                    dotColor = businessColor;
                                                    percent =
                                                        totalYearlySpend > 0 ?
                                                            (businessYearlySpend / totalYearlySpend) * 100
                                                        :   0;
                                                    break;
                                                case "family":
                                                    dotColor = familyColor;
                                                    percent =
                                                        totalYearlySpend > 0 ?
                                                            (familyYearlySpend / totalYearlySpend) * 100
                                                        :   0;
                                                    break;
                                                case "invest":
                                                    dotColor = investColor;
                                                    percent =
                                                        totalYearlySpend > 0 ?
                                                            (investYearlySpend / totalYearlySpend) * 100
                                                        :   0;
                                                    break;
                                                case "entertainment":
                                                    dotColor = entertainmentColor;
                                                    percent =
                                                        totalYearlySpend > 0 ?
                                                            (entertainmentYearlySpend / totalYearlySpend) * 100
                                                        :   0;
                                                    break;
                                            }

                                            if (category === cat) {
                                                btnBgColor = dotColor + "50";
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
                                                        {t(`expenses.category.${cat}`)}
                                                    </ThemedText>
                                                    <ThemedText
                                                        style={[styles.chartButtonText, styles.chartButtonLabel]}
                                                    >
                                                        {percent.toFixed(1)}%
                                                    </ThemedText>
                                                </TouchableOpacity>
                                            );
                                        },
                                    )}
                                </View>
                                <View style={styles.chartItems}>
                                    {expenses.filter((e) => e.active && e.category === category).length === 0 ?
                                        <ThemedText>{t("expenses.noExpensesInPie")}</ThemedText>
                                    :   expenses
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
                                    }
                                </View>
                            </View>
                        </View>
                    </>
                )}

                {loading ?
                    <ThemedView style={styles.emptyState}>
                        <ThemedText style={styles.emptyStateText}>
                            <Ionicons name="time-outline" size={24} color={theme.inputText} />
                        </ThemedText>
                    </ThemedView>
                :   !loading &&
                    expenses.length === 0 && (
                        <ThemedView style={styles.emptyState}>
                            <ThemedText style={styles.emptyStateText}>{t("expenses.addFirstExpense")}</ThemedText>
                        </ThemedView>
                    )
                }
            </ScrollView>
        </AuthGate>
    );
}
