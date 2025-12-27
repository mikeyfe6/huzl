import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
    getSortLabel,
    SortModal,
    SortOption,
} from "@/components/ui/sort-modal";
import {
    blackColor,
    blueColor,
    Colors,
    goldColor,
    greenColor,
    mediumGreyColor,
    redColor,
    whiteColor,
} from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "@/utils/supabase";

type Frequency = "daily" | "monthly" | "yearly";
type Category = "personal" | "business";
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
    const [expenseName, setExpenseName] = useState("");
    const [expenseAmount, setExpenseAmount] = useState("");
    const [frequency, setFrequency] = useState<Frequency>("monthly");
    const [category, setCategory] = useState<Category>("personal");
    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<SortOption>("default");
    const [sortModalVisible, setSortModalVisible] = useState(false);
    const currencySymbol = "€";

    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    const nameInputRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: {
                    flex: 1,
                    paddingHorizontal: 0,
                },
                inputSection: {
                    padding: 16,
                    paddingTop: 24,
                    gap: 12,
                },
                heading: {
                    marginBottom: 16,
                },
                label: {
                    fontSize: 14,
                    fontWeight: "600",
                    marginTop: 8,
                    color: theme.label,
                },
                categoryGroup: {
                    flexDirection: "row",
                    gap: 12,
                    marginTop: 4,
                },
                categoryOption: {
                    flex: 1,
                    borderWidth: 1.5,
                    borderRadius: 8,
                    paddingVertical: 10,
                    alignItems: "center",
                    borderColor: theme.inputBorder,
                    backgroundColor: theme.inputBackground,
                },
                categoryOptionActive: {
                    borderColor: blueColor,
                    backgroundColor: theme.cardBackground,
                },
                input: {
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    fontSize: 16,
                    color: theme.inputText,
                    borderColor: theme.inputBorder,
                    backgroundColor: theme.inputBackground,
                },
                placeholderText: {
                    color: theme.placeholder,
                },
                pickerContainer: {
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
                    borderWidth: 1,
                    borderRadius: 8,
                    marginTop: 4,
                    justifyContent: "center",
                    borderColor: theme.inputBorder,
                    backgroundColor: theme.inputBackground,
                },
                pickerInput: {
                    fontFamily: "System",
                    fontSize: Platform.select({
                        ios: 16,
                        android: 16,
                        default: 16,
                    }),
                    borderRadius: 8,
                    color: Platform.select({
                        ios: whiteColor,
                        android: whiteColor,
                        default: blackColor,
                    }),
                    height: Platform.select({
                        ios: 216,
                        android: 50,
                        default: 50,
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
                pickerOption: {
                    fontSize: Platform.select({
                        ios: 16,
                        android: 16,
                        default: 16,
                    }),
                },
                pickerIcon: {
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    marginTop: -9,
                    pointerEvents: "none",
                },
                inputButtons: {
                    flexDirection: "row",
                    gap: 12,
                },
                inputButton: {
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: "center",
                    marginTop: 8,
                    flex: 1,
                },
                buttonText: {
                    color: whiteColor,
                    fontWeight: "600",
                    fontSize: 16,
                },
                expenseList: {
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    gap: 10,
                },
                expenseTitle: {
                    marginBottom: 12,
                },
                sortHeader: {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                    gap: 8,
                },
                sortTrigger: {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.inputBorder,
                    backgroundColor: theme.cardBackground,
                },
                sortTriggerText: {
                    color: theme.label,
                    fontWeight: "600",
                },
                expenseCard: {
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    marginBottom: 8,
                    gap: 12,
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.borderColor,
                },
                expenseHeader: {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                },
                expenseInfo: {
                    flex: 1,
                },
                frequencyLabel: {
                    fontSize: 13,
                    opacity: 0.7,
                    marginTop: 4,
                },
                expenseIcons: {
                    flexDirection: "row",
                    gap: 16,
                },
                expenseIcon: {
                    borderWidth: 1,
                    borderRadius: 6,
                    padding: 8,
                },
                editButton: {
                    color: blueColor,
                    fontWeight: "600",
                },
                deleteButton: {
                    color: redColor,
                    fontWeight: "600",
                },
                yearlyTotalBox: {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: theme.dividerColor,
                },
                yearlyLabel: {
                    fontSize: 13,
                    fontWeight: "500",
                },
                yearlyAmount: {
                    fontSize: 14,
                    fontWeight: "600",
                    color: blueColor,
                },
                totalSection: {
                    paddingHorizontal: 16,
                    paddingVertical: 20,
                    marginHorizontal: 16,
                    marginTop: 24,
                    marginBottom: 16,
                    borderRadius: 12,
                    backgroundColor: blueColor,
                    gap: 8,
                },
                totalDetails: {
                    flexDirection: "row",
                    gap: 12,
                    paddingHorizontal: 16,
                    marginBottom: 16,
                },
                totalPeriod: {
                    flex: 1,
                    marginHorizontal: 0,
                    marginTop: 0,
                    marginBottom: 0,
                },
                totalLabel: {
                    color: whiteColor,
                },
                totalAmount: {
                    fontSize: 32,
                    fontWeight: "bold",
                    color: whiteColor,
                    lineHeight: 40,
                },
                emptyState: {
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
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
        if (!user) return; // require auth
        if (!expenseName.trim() || !expenseAmount.trim()) return;

        setLoading(true);
        try {
            if (editingId) {
                // Update existing expense
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
                                      category:
                                          (data.category as Category) ??
                                          "personal",
                                      yearlyTotal: calculateYearlyTotal(
                                          amount,
                                          data.frequency as Frequency
                                      ),
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
                // Create new expense
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
                        yearlyTotal: calculateYearlyTotal(
                            amount,
                            data.frequency as Frequency
                        ),
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
            const { error } = await supabase
                .from("expenses")
                .delete()
                .eq("id", id);
            if (!error) {
                setExpenses((prev) =>
                    prev.filter((expense) => expense.id !== id)
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (id: string, currentActive: boolean) => {
        if (!user) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from("expenses")
                .update({ active: !currentActive })
                .eq("id", id);
            if (!error) {
                setExpenses((prev) =>
                    prev.map((expense) =>
                        expense.id === id
                            ? { ...expense, active: !currentActive }
                            : expense
                    )
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

    const totalYearlySpend = expenses
        .filter((e) => e.active)
        .reduce((sum, expense) => sum + expense.yearlyTotal, 0);

    const totalMonthlySpend = totalYearlySpend / 12;
    const totalDailySpend = totalYearlySpend / 365;

    const personalYearlySpend = expenses
        .filter((e) => e.active && e.category === "personal")
        .reduce((sum, e) => sum + e.yearlyTotal, 0);

    const businessYearlySpend = expenses
        .filter((e) => e.active && e.category === "business")
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
                            yearlyTotal: calculateYearlyTotal(
                                amount,
                                row.frequency as Frequency
                            ),
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

    return (
        <ScrollView
            ref={scrollViewRef}
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 24 }}
        >
            <ThemedView style={styles.inputSection}>
                <ThemedText type="title" style={styles.heading}>
                    Expenses
                </ThemedText>

                <ThemedText style={styles.label}>Item Name</ThemedText>
                <TextInput
                    ref={nameInputRef}
                    style={styles.input}
                    placeholder="e.g., Spotify"
                    placeholderTextColor={theme.placeholder}
                    value={expenseName}
                    onChangeText={setExpenseName}
                />

                <ThemedText style={styles.label}>Amount (€)</ThemedText>
                <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={theme.placeholder}
                    value={expenseAmount}
                    onChangeText={setExpenseAmount}
                    keyboardType="decimal-pad"
                />

                <ThemedText style={styles.label}>Category</ThemedText>
                <View style={styles.categoryGroup}>
                    <TouchableOpacity
                        style={[
                            styles.categoryOption,
                            category === "personal" &&
                                styles.categoryOptionActive,
                        ]}
                        onPress={() => setCategory("personal")}
                        accessibilityRole="radio"
                        accessibilityState={{
                            selected: category === "personal",
                        }}
                    >
                        <ThemedText>Personal</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.categoryOption,
                            category === "business" &&
                                styles.categoryOptionActive,
                        ]}
                        onPress={() => setCategory("business")}
                        accessibilityRole="radio"
                        accessibilityState={{
                            selected: category === "business",
                        }}
                    >
                        <ThemedText>Business</ThemedText>
                    </TouchableOpacity>
                </View>

                <ThemedText style={styles.label}>Frequency</ThemedText>
                <View style={[styles.pickerContainer]}>
                    <Picker
                        selectedValue={frequency}
                        onValueChange={(itemValue) =>
                            setFrequency(itemValue as Frequency)
                        }
                        style={[
                            styles.pickerInput,
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
                        itemStyle={styles.pickerOption}
                    >
                        <Picker.Item label="Daily" value="daily" />
                        <Picker.Item label="Monthly" value="monthly" />
                        <Picker.Item label="Yearly" value="yearly" />
                    </Picker>
                    {Platform.OS === "web" && (
                        <Ionicons
                            name="chevron-down"
                            size={18}
                            color={blackColor}
                            style={styles.pickerIcon}
                        />
                    )}
                </View>

                <View style={styles.inputButtons}>
                    <TouchableOpacity
                        style={[
                            styles.inputButton,
                            { backgroundColor: greenColor },
                        ]}
                        onPress={handleAddExpense}
                    >
                        <ThemedText style={styles.buttonText}>
                            {editingId ? "Update Expense" : "Add Expense"}
                        </ThemedText>
                    </TouchableOpacity>
                    {editingId && (
                        <TouchableOpacity
                            style={[
                                styles.inputButton,
                                { backgroundColor: redColor },
                            ]}
                            onPress={handleCancelEdit}
                        >
                            <ThemedText style={styles.buttonText}>
                                Cancel
                            </ThemedText>
                        </TouchableOpacity>
                    )}
                </View>
            </ThemedView>

            {expenses.length > 0 && (
                <ThemedView style={styles.expenseList}>
                    <View style={styles.sortHeader}>
                        <ThemedText type="subtitle">Expenses List</ThemedText>
                        <TouchableOpacity
                            style={styles.sortTrigger}
                            onPress={() => setSortModalVisible(true)}
                            accessibilityRole="button"
                            accessibilityLabel="Open sort options"
                        >
                            <Ionicons
                                name="swap-vertical"
                                size={16}
                                color={theme.label}
                            />
                            <ThemedText style={styles.sortTriggerText}>
                                {getSortLabel(sortOption)}
                            </ThemedText>
                            <Ionicons
                                name="chevron-down"
                                size={16}
                                color={theme.label}
                            />
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
                        <View key={expense.id} style={styles.expenseCard}>
                            <View style={styles.expenseHeader}>
                                <View style={styles.expenseInfo}>
                                    <ThemedText type="defaultSemiBold">
                                        {expense.name}
                                    </ThemedText>
                                    <ThemedText
                                        style={[
                                            styles.frequencyLabel,
                                            expense.category === "business" && {
                                                color: goldColor,
                                            },
                                        ]}
                                    >
                                        {currencySymbol}{" "}
                                        {expense.amount.toFixed(2)} -{" "}
                                        {getFrequencyLabel(expense.frequency)} -{" "}
                                        {expense.category
                                            .charAt(0)
                                            .toUpperCase() +
                                            expense.category.slice(1)}
                                    </ThemedText>
                                </View>
                                <View style={styles.expenseIcons}>
                                    <TouchableOpacity
                                        onPress={() =>
                                            handleToggleActive(
                                                expense.id,
                                                expense.active
                                            )
                                        }
                                        style={[
                                            styles.expenseIcon,
                                            {
                                                borderColor: expense.active
                                                    ? greenColor
                                                    : mediumGreyColor,
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name={
                                                expense.active
                                                    ? "eye"
                                                    : "eye-off"
                                            }
                                            size={16}
                                            color={
                                                expense.active
                                                    ? greenColor
                                                    : mediumGreyColor
                                            }
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() =>
                                            handleEditExpense(expense)
                                        }
                                        style={[
                                            styles.expenseIcon,
                                            {
                                                borderColor: mediumGreyColor,
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name="pencil"
                                            size={16}
                                            color={mediumGreyColor}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() =>
                                            handleDeleteExpense(expense.id)
                                        }
                                        style={[
                                            styles.expenseIcon,
                                            {
                                                borderColor: redColor,
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name="trash"
                                            size={16}
                                            color={redColor}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.yearlyTotalBox}>
                                <ThemedText style={styles.yearlyLabel}>
                                    Yearly Total:
                                </ThemedText>
                                <ThemedText style={styles.yearlyAmount}>
                                    {currencySymbol}{" "}
                                    {expense.yearlyTotal.toFixed(2)}
                                </ThemedText>
                            </View>
                        </View>
                    ))}
                </ThemedView>
            )}

            {expenses.length > 0 && (
                <>
                    <ThemedView style={styles.totalSection}>
                        <ThemedText type="subtitle" style={styles.totalLabel}>
                            Total Yearly Spend
                        </ThemedText>
                        <ThemedText style={styles.totalAmount}>
                            {currencySymbol} {totalYearlySpend.toFixed(2)}
                        </ThemedText>
                        <ThemedText style={styles.totalLabel}>
                            Personal: {currencySymbol}{" "}
                            {personalYearlySpend.toFixed(2)}
                        </ThemedText>
                        <ThemedText style={styles.totalLabel}>
                            Business: {currencySymbol}{" "}
                            {businessYearlySpend.toFixed(2)}
                        </ThemedText>
                    </ThemedView>

                    <View style={styles.totalDetails}>
                        <ThemedView
                            style={[styles.totalSection, styles.totalPeriod]}
                        >
                            <ThemedText
                                type="defaultSemiBold"
                                style={styles.totalLabel}
                            >
                                Total Monthly Spend
                            </ThemedText>
                            <ThemedText
                                style={[styles.totalAmount, { fontSize: 24 }]}
                            >
                                {currencySymbol} {totalMonthlySpend.toFixed(2)}
                            </ThemedText>
                        </ThemedView>

                        <ThemedView
                            style={[styles.totalSection, styles.totalPeriod]}
                        >
                            <ThemedText
                                type="defaultSemiBold"
                                style={styles.totalLabel}
                            >
                                Total Daily Spend
                            </ThemedText>
                            <ThemedText
                                style={[styles.totalAmount, { fontSize: 24 }]}
                            >
                                {currencySymbol} {totalDailySpend.toFixed(2)}
                            </ThemedText>
                        </ThemedView>
                    </View>
                </>
            )}

            {expenses.length === 0 && !loading && (
                <ThemedView style={styles.emptyState}>
                    <ThemedText style={styles.emptyStateText}>
                        {user
                            ? "Add your first expense!"
                            : "Sign in to track your expenses."}
                    </ThemedText>
                </ThemedView>
            )}
        </ScrollView>
    );
}
