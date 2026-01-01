import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useMemo, useRef, useState } from "react";
import { Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ExpensePieChart } from "@/components/ui/expense-pie-chart";
import { getSortLabel, SortModal, SortOption } from "@/components/ui/sort-modal";
import {
    blueColor,
    businessColor,
    Colors,
    familyColor,
    greenColor,
    mediumGreyColor,
    personalColor,
    redColor,
    slateColor,
    whiteColor,
} from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";
import { supabase } from "@/utils/supabase";

import { AuthGate } from "@/components/loading";

type Frequency = "daily" | "monthly" | "yearly";
type Category = "personal" | "business" | "family";
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
        setExpenseAmount(expense.amount.toString());
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

    const getFrequencyLabel = (freq: Frequency): string => {
        switch (freq) {
            case "daily":
                return "Daily";
            case "monthly":
                return "Monthly";
            case "yearly":
                return "Yearly";
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

    const baseGap = { gap: 12 };
    const baseSpace = { gap: 8 };
    const baseRadius = { borderRadius: 8 };
    const baseBorder = { borderWidth: 1 };
    const baseWeight = { fontWeight: "600" as const };

    const baseFlex = (
        justify: "flex-start" | "center" | "space-between" | undefined = undefined,
        align: "flex-start" | "center" | "flex-end" | undefined = undefined
    ) => ({
        flexDirection: "row" as const,
        justifyContent: justify,
        alignItems: align,
    });

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

    const baseList = {
        ...baseGap,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 20,
    };

    const baseCard = {
        ...baseInput,
        ...baseGap,
        padding: 12,
        backgroundColor: theme.cardBackground,
        borderColor: theme.borderColor,
    };

    const baseMain = {
        ...baseGap,
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 16,
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
                categoryGroup: {
                    ...baseFlex("center"),
                    ...baseGap,
                },
                categoryOption: {
                    ...baseFlex("center", "center"),
                    ...baseInput,
                    flex: 1,
                },
                categoryActive: {
                    borderColor: blueColor,
                    backgroundColor: theme.selectedTab,
                },
                select: {
                    ...baseInput,
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
                    ...baseInput,
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
                sortTrigger: {
                    ...baseFlex("center", "center"),
                    ...baseSpace,
                    ...baseInput,
                    ...baseSelect,
                },
                sortTriggerText: {
                    ...baseWeight,
                    color: theme.label,
                },
                expenseAmounts: {
                    ...baseFlex("center"),
                    ...baseSpace,
                },
                expenseCard: {
                    ...baseCard,
                },
                expenseInactive: {
                    opacity: 0.5,
                },
                expenseItem: {
                    ...baseFlex("space-between"),
                },
                expenseInfo: {
                    flex: 1,
                },
                expenseLabel: {
                    fontSize: 13,
                    opacity: 0.7,
                    marginTop: 4,
                },
                expenseIcons: {
                    ...baseFlex("center", "center"),
                    ...baseGap,
                },
                expenseIcon: {
                    ...baseBorder,
                    borderRadius: 6,
                    padding: 8,
                },
                expenseTotal: {
                    ...baseFlex("space-between"),
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: theme.dividerColor,
                },
                expensePeriod: {
                    fontSize: 13,
                    color: slateColor,
                },
                expenseYearly: {
                    ...baseWeight,
                    fontSize: 14,
                    color: blueColor,
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
                    gap: 32,
                },
                chartStats: {
                    width: "100%",
                    maxWidth: 800,
                    gap: 24,
                },
                chartButtons: {
                    ...baseFlex("center"),
                    ...baseGap,
                    flexWrap: "wrap",
                },
                chartButton: {
                    ...baseFlex("space-between", "center"),
                    ...baseRadius,
                    flex: 1,
                    flexBasis: 225,
                    outlineWidth: 0,
                    minHeight: 44,
                    paddingHorizontal: 18,
                    borderWidth: 1,
                },
                chartButtonDot: {
                    width: 12,
                    height: 12,
                    borderRadius: 25,
                },
                chartButtonText: { fontWeight: "600" },
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
        [theme]
    );

    return (
        <AuthGate>
            <ScrollView ref={scrollViewRef} contentContainerStyle={styles.container}>
                <ThemedView style={styles.fieldset}>
                    <ThemedText type="title" style={styles.heading}>
                        Expenses
                    </ThemedText>

                    <ThemedText style={styles.label}>Item Name</ThemedText>
                    <TextInput
                        ref={nameInputRef}
                        style={[styles.input, nameFocused && { borderColor: blueColor }]}
                        placeholder="e.g., Spotify"
                        placeholderTextColor={theme.placeholder}
                        value={expenseName}
                        onChangeText={setExpenseName}
                        onFocus={() => setNameFocused(true)}
                        onBlur={() => setNameFocused(false)}
                    />

                    <ThemedText style={styles.label}>Amount ({currencySymbol})</ThemedText>
                    <TextInput
                        style={[
                            styles.input,
                            amountFocused && {
                                borderColor: blueColor,
                            },
                        ]}
                        placeholder="0.00"
                        placeholderTextColor={theme.placeholder}
                        value={expenseAmount}
                        onChangeText={setExpenseAmount}
                        keyboardType="decimal-pad"
                        onFocus={() => setAmountFocused(true)}
                        onBlur={() => setAmountFocused(false)}
                    />

                    <ThemedText style={styles.label}>Category</ThemedText>
                    <View style={styles.categoryGroup}>
                        <TouchableOpacity
                            style={[styles.categoryOption, category === "personal" && styles.categoryActive]}
                            onPress={() => setCategory("personal")}
                            accessibilityRole="radio"
                            accessibilityState={{
                                selected: category === "personal",
                            }}
                        >
                            <ThemedText>Personal</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.categoryOption, category === "business" && styles.categoryActive]}
                            onPress={() => setCategory("business")}
                            accessibilityRole="radio"
                            accessibilityState={{
                                selected: category === "business",
                            }}
                        >
                            <ThemedText>Business</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.categoryOption, category === "family" && styles.categoryActive]}
                            onPress={() => setCategory("family")}
                            accessibilityRole="radio"
                            accessibilityState={{
                                selected: category === "family",
                            }}
                        >
                            <ThemedText>Family</ThemedText>
                        </TouchableOpacity>
                    </View>

                    <ThemedText style={styles.label}>Frequency</ThemedText>
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
                            <Picker.Item label="Daily" value="daily" />
                            <Picker.Item label="Monthly" value="monthly" />
                            <Picker.Item label="Yearly" value="yearly" />
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
                                {editingId ? "Update Expense" : "Add Expense"}
                            </ThemedText>
                        </TouchableOpacity>
                        {editingId && (
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: redColor }]}
                                onPress={handleCancelEdit}
                            >
                                <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                            </TouchableOpacity>
                        )}
                    </View>
                </ThemedView>

                {expenses.length > 0 && (
                    <ThemedView style={styles.expenseList}>
                        <View style={styles.expenseHeader}>
                            <View style={styles.expenseTitle}>
                                <ThemedText type="subtitle">Expenses List</ThemedText>
                                <ThemedText style={{ opacity: 0.6, fontSize: 16 }}>
                                    ({sortedExpenses.length})
                                </ThemedText>
                            </View>
                            <TouchableOpacity
                                style={styles.sortTrigger}
                                onPress={() => setSortModalVisible(true)}
                                accessibilityRole="button"
                                accessibilityLabel="Open sort options"
                            >
                                <Ionicons name="swap-vertical" size={16} color={theme.label} />
                                <ThemedText style={styles.sortTriggerText}>{getSortLabel(sortOption)}</ThemedText>
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
                                        <ThemedText type="defaultSemiBold">{expense.name}</ThemedText>
                                        <ThemedText
                                            style={[
                                                styles.expenseLabel,
                                                expense.category === "personal" && {
                                                    color: theme.personalLabel,
                                                },
                                                expense.category === "business" && {
                                                    color: theme.businessLabel,
                                                },
                                                expense.category === "family" && {
                                                    color: theme.familyLabel,
                                                },
                                            ]}
                                        >
                                            {currencySymbol} {expense.amount.toFixed(2)} -{" "}
                                            {getFrequencyLabel(expense.frequency)} -{" "}
                                            {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                                        </ThemedText>
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
                                            onPress={() => handleDeleteExpense(expense.id)}
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
                                    <ThemedText style={styles.expensePeriod}>Yearly / Monthly:</ThemedText>
                                    <View style={styles.expenseAmounts}>
                                        <ThemedText style={styles.expenseYearly}>
                                            {currencySymbol} {expense.yearlyTotal.toFixed(2)}
                                        </ThemedText>
                                        <ThemedText style={styles.expenseMonthly}>
                                            {currencySymbol} {(expense.yearlyTotal / 12).toFixed(2)}
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
                            <ThemedText type="subtitle">Total Yearly Spend</ThemedText>
                            <ThemedText style={styles.totalAmount}>
                                {currencySymbol} {totalYearlySpend.toFixed(2)}
                            </ThemedText>
                            <ThemedText>
                                Personal:{" "}
                                <ThemedText style={styles.totalInline}>
                                    {currencySymbol} {personalYearlySpend.toFixed(2)}
                                </ThemedText>
                            </ThemedText>
                            <ThemedText>
                                Business:{" "}
                                <ThemedText style={styles.totalInline}>
                                    {currencySymbol} {businessYearlySpend.toFixed(2)}
                                </ThemedText>
                            </ThemedText>
                            <ThemedText>
                                Family:{" "}
                                <ThemedText style={styles.totalInline}>
                                    {currencySymbol} {familyYearlySpend.toFixed(2)}
                                </ThemedText>
                            </ThemedText>
                        </ThemedView>

                        <View style={styles.totalDetails}>
                            <ThemedView style={[styles.totalSection, styles.totalPeriod, styles.totalMonth]}>
                                <ThemedText type="defaultSemiBold">Total Monthly Spend</ThemedText>
                                <ThemedText style={[styles.totalAmount, { fontSize: 28 }]}>
                                    {currencySymbol} {totalMonthlySpend.toFixed(2)}
                                </ThemedText>
                            </ThemedView>

                            <ThemedView style={[styles.totalSection, styles.totalPeriod, styles.totalDay]}>
                                <ThemedText type="defaultSemiBold">Total Daily Spend</ThemedText>
                                <ThemedText style={[styles.totalAmount, { fontSize: 28 }]}>
                                    {currencySymbol} {totalDailySpend.toFixed(2)}
                                </ThemedText>
                            </ThemedView>
                        </View>

                        <View style={styles.chartContainer}>
                            <ExpensePieChart
                                expenses={expenses}
                                selectedCategory={category}
                                onCategorySelect={setCategory}
                            />
                            <View style={styles.chartStats}>
                                <View style={styles.chartButtons}>
                                    {(["personal", "business", "family"] as Category[]).map((cat) => {
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
                                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
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
                                        <ThemedText>No expenses in this category.</ThemedText>
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
                        <ThemedText style={styles.emptyStateText}>
                            {user ? "Add your first expense!" : "Sign in to track your expenses."}
                        </ThemedText>
                    </ThemedView>
                )}
            </ScrollView>
        </AuthGate>
    );
}
