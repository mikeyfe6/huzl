import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
    blueColor,
    Colors,
    greenColor,
    redColor,
    whiteColor,
} from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";

export default function BudgetsScreen() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.replace("/");
        }
    }, [user]);

    const { symbol: currencySymbol } = useCurrency();
    const [budgetName, setBudgetName] = useState("");
    const [totalAmount, setTotalAmount] = useState("");
    const [budgets, setBudgets] = useState<
        {
            id: string;
            name: string;
            total: number;
            spent: number;
            expenses: { id: string; name: string; amount: number }[];
        }[]
    >([]);
    const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(
        null
    );
    const [expenseName, setExpenseName] = useState("");
    const [expenseAmount, setExpenseAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    const fetchBudgetExpenses = async (budgetId: string) => {
        const { data: expensesData } = await supabase
            .from("budget_expenses")
            .select("*")
            .eq("budget_id", budgetId)
            .order("created_at", { ascending: false });

        const expenses = expensesData || [];
        return {
            expenses: expenses.map((exp) => ({
                id: exp.id,
                name: exp.name,
                amount: exp.amount,
            })),
            spent: expenses.reduce((sum, exp) => sum + exp.amount, 0),
        };
    };

    const transformBudgetData = async (budget: any) => {
        const { expenses, spent } = await fetchBudgetExpenses(budget.id);
        return {
            id: budget.id,
            name: budget.name,
            total: budget.total,
            spent,
            expenses,
        };
    };

    useEffect(() => {
        if (!user) return;

        const fetchBudgets = async () => {
            setLoading(true);
            try {
                const { data: budgetsData, error: budgetsError } =
                    await supabase
                        .from("budgets")
                        .select("*")
                        .eq("user_id", user.id)
                        .order("created_at", { ascending: false });

                if (budgetsError) throw budgetsError;

                const budgetsWithExpenses = await Promise.all(
                    (budgetsData || []).map(transformBudgetData)
                );

                setBudgets(budgetsWithExpenses);
            } catch (error) {
                console.error("Error fetching budgets:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBudgets();
    }, [user]);

    const baseGap = { gap: 12 };

    const baseSpace = { gap: 8 };

    const baseWeight = { fontWeight: "600" as const };

    const baseRadius = { borderRadius: 8 };

    const baseBorder = { borderWidth: 1 };

    const baseCenter = {
        alignItems: "center" as const,
        justifyContent: "center" as const,
    };

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
        ...baseRadius,
        ...baseCenter,
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
                createButton: {
                    ...baseButton,
                    backgroundColor: blueColor,
                    marginTop: 8,
                },
                addButton: {
                    ...baseButton,
                    backgroundColor: greenColor,
                    marginTop: 8,
                },
                buttonText: {
                    ...baseButtonText,
                },
                budgetList: {
                    ...baseList,
                },
                budgetHeader: {
                    marginBottom: 8,
                },
                budgetCard: {
                    ...baseCard,
                },
                budgetSelected: {
                    borderColor: blueColor,
                    backgroundColor: theme.cardBackground,
                },
                budgetTitle: {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                },
                budgetInfo: {
                    flex: 1,
                },
                budgetIcon: {
                    ...baseBorder,
                    borderRadius: 6,
                    padding: 8,
                },
                budgetAmount: {
                    fontSize: 14,
                    opacity: 0.8,
                    color: theme.label,
                },
                budgetInline: {
                    ...baseWeight,
                },
                progressBar: {
                    height: 8,
                    backgroundColor: theme.inputBorder,
                    borderRadius: 4,
                    overflow: "hidden",
                    marginTop: 4,
                },
                progressFill: {
                    height: "100%",
                    backgroundColor: blueColor,
                },
                expenseSection: {
                    ...baseList,
                },
                expenseHeader: {
                    marginBottom: 4,
                },
                expenseRemaining: {
                    fontSize: 16,
                    fontWeight: "500",
                    marginBottom: 12,
                    color: theme.label,
                },
                expenseList: {
                    marginTop: 20,
                    marginBottom: 10,
                },
                expenseItem: {
                    ...baseCard,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                },
                expenseInfo: {
                    ...baseSpace,
                    flex: 1,
                },
                expenseLabel: {
                    fontSize: 14,
                    opacity: 0.7,
                    color: theme.label,
                },
                emptyState: {
                    ...baseCenter,
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

    const handleCreateBudget = async () => {
        if (!user || !budgetName.trim() || !totalAmount.trim()) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("budgets")
                .insert({
                    user_id: user.id,
                    name: budgetName,
                    total: Number.parseFloat(totalAmount),
                })
                .select()
                .single();

            if (error) {
                console.error("Error creating budget:", error);
                return;
            }

            if (data) {
                setBudgets([
                    ...budgets,
                    {
                        id: data.id,
                        name: data.name,
                        total: data.total,
                        spent: 0,
                        expenses: [],
                    },
                ]);
                setBudgetName("");
                setTotalAmount("");
            }
        } catch (err) {
            console.error("Exception creating budget:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async () => {
        if (
            !user ||
            !selectedBudgetId ||
            !expenseName.trim() ||
            !expenseAmount.trim()
        )
            return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("budget_expenses")
                .insert({
                    budget_id: selectedBudgetId,
                    name: expenseName,
                    amount: Number.parseFloat(expenseAmount),
                })
                .select()
                .single();

            if (!error && data) {
                const updatedBudgets = budgets.map((budget) => {
                    if (budget.id === selectedBudgetId) {
                        const expense = {
                            id: data.id,
                            name: data.name,
                            amount: data.amount,
                        };
                        return {
                            ...budget,
                            expenses: [...budget.expenses, expense],
                            spent: budget.spent + data.amount,
                        };
                    }
                    return budget;
                });
                setBudgets(updatedBudgets);
                setExpenseName("");
                setExpenseAmount("");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBudget = async (budgetId: string) => {
        if (!user) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from("budgets")
                .delete()
                .eq("id", budgetId);

            if (!error) {
                setBudgets(budgets.filter((b) => b.id !== budgetId));
                if (selectedBudgetId === budgetId) {
                    setSelectedBudgetId(null);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExpense = async (expenseId: string) => {
        if (!user) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from("budget_expenses")
                .delete()
                .eq("id", expenseId);

            if (!error) {
                const updatedBudgets = budgets.map((budget) => {
                    if (budget.id === selectedBudgetId) {
                        const expense = budget.expenses.find(
                            (e) => e.id === expenseId
                        );
                        return {
                            ...budget,
                            expenses: budget.expenses.filter(
                                (e) => e.id !== expenseId
                            ),
                            spent: budget.spent - (expense?.amount || 0),
                        };
                    }
                    return budget;
                });
                setBudgets(updatedBudgets);
            }
        } finally {
            setLoading(false);
        }
    };

    const selectedBudget = budgets.find((b) => b.id === selectedBudgetId);
    const remainingAmount = selectedBudget
        ? selectedBudget.total - selectedBudget.spent
        : 0;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <ThemedView style={styles.fieldset}>
                <ThemedText type="title" style={styles.heading}>
                    Budgets
                </ThemedText>

                <ThemedText style={styles.label}>Budget Name</ThemedText>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., Groceries"
                    placeholderTextColor={theme.placeholder}
                    value={budgetName}
                    onChangeText={setBudgetName}
                />

                <ThemedText style={styles.label}>
                    Total Amount ({currencySymbol})
                </ThemedText>
                <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={theme.placeholder}
                    value={totalAmount}
                    onChangeText={setTotalAmount}
                    keyboardType="decimal-pad"
                />

                <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreateBudget}
                    disabled={loading}
                >
                    <ThemedText style={styles.buttonText}>
                        {loading ? "Creating..." : "Create Budget"}
                    </ThemedText>
                </TouchableOpacity>
            </ThemedView>

            {budgets.length > 0 && (
                <ThemedView style={styles.budgetList}>
                    <ThemedText type="subtitle" style={styles.budgetHeader}>
                        Your Budgets
                    </ThemedText>
                    {budgets.map((budget) => (
                        <View
                            key={budget.id}
                            style={[
                                styles.budgetCard,
                                selectedBudgetId === budget.id &&
                                    styles.budgetSelected,
                            ]}
                        >
                            <View style={styles.budgetTitle}>
                                <TouchableOpacity
                                    style={styles.budgetInfo}
                                    onPress={() =>
                                        setSelectedBudgetId(budget.id)
                                    }
                                >
                                    <ThemedText type="defaultSemiBold">
                                        {budget.name}
                                    </ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() =>
                                        handleDeleteBudget(budget.id)
                                    }
                                    style={[
                                        styles.budgetIcon,
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
                            <ThemedText style={styles.budgetAmount}>
                                {currencySymbol} {budget.spent.toFixed(2)} -{" "}
                                <ThemedText
                                    style={[
                                        styles.budgetAmount,
                                        styles.budgetInline,
                                    ]}
                                >
                                    {currencySymbol} {budget.total.toFixed(2)}
                                </ThemedText>
                            </ThemedText>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: `${Math.min(
                                                (budget.spent / budget.total) *
                                                    100,
                                                100
                                            )}%`,
                                        },
                                    ]}
                                />
                            </View>
                        </View>
                    ))}
                </ThemedView>
            )}

            {selectedBudget && (
                <ThemedView style={styles.expenseSection}>
                    <ThemedText type="subtitle" style={styles.expenseHeader}>
                        {selectedBudget.name}
                    </ThemedText>
                    <ThemedText style={styles.expenseRemaining}>
                        Remaining ({currencySymbol}):{" "}
                        <ThemedText
                            style={{
                                color:
                                    remainingAmount < 0 ? redColor : greenColor,
                            }}
                        >
                            {remainingAmount.toFixed(2)}
                        </ThemedText>
                    </ThemedText>

                    <ThemedText style={styles.label}>Expense Name</ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Apples"
                        placeholderTextColor={theme.placeholder}
                        value={expenseName}
                        onChangeText={setExpenseName}
                    />

                    <ThemedText style={styles.label}>
                        Amount ({currencySymbol})
                    </ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        placeholderTextColor={theme.placeholder}
                        value={expenseAmount}
                        onChangeText={setExpenseAmount}
                        keyboardType="decimal-pad"
                    />

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddExpense}
                        disabled={loading}
                    >
                        <ThemedText style={styles.buttonText}>
                            {loading ? "Adding..." : "Add Expense"}
                        </ThemedText>
                    </TouchableOpacity>

                    <ThemedText type="subtitle" style={styles.expenseList}>
                        Expenses
                    </ThemedText>
                    {selectedBudget.expenses.length === 0 ? (
                        <ThemedView style={styles.emptyState}>
                            <ThemedText style={styles.emptyStateText}>
                                No expenses yet
                            </ThemedText>
                        </ThemedView>
                    ) : (
                        selectedBudget.expenses.map((expense) => (
                            <View key={expense.id} style={styles.expenseItem}>
                                <View style={styles.expenseInfo}>
                                    <ThemedText type="defaultSemiBold">
                                        {expense.name}
                                    </ThemedText>
                                    <ThemedText style={styles.expenseLabel}>
                                        {currencySymbol}{" "}
                                        {expense.amount.toFixed(2)}
                                    </ThemedText>
                                </View>
                                <TouchableOpacity
                                    onPress={() =>
                                        handleDeleteExpense(expense.id)
                                    }
                                    style={[
                                        styles.budgetIcon,
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
                        ))
                    )}
                </ThemedView>
            )}

            {budgets.length === 0 && (
                <ThemedView style={styles.emptyState}>
                    <ThemedText style={styles.emptyStateText}>
                        Create a budget to get started!
                    </ThemedText>
                </ThemedView>
            )}
        </ScrollView>
    );
}
