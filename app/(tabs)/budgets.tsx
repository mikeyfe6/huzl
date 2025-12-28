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

export default function BudgetsScreen() {
    const { user } = useAuth();
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

    // Helper function to fetch and transform budget expenses
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

    // Helper function to transform budget data
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

    // Fetch budgets and their expenses on mount
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
                createButton: {
                    backgroundColor: blueColor,
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: "center",
                    marginTop: 8,
                },
                addButton: {
                    backgroundColor: greenColor,
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: "center",
                    marginTop: 8,
                },
                buttonText: {
                    color: whiteColor,
                    fontWeight: "600",
                    fontSize: 16,
                },
                budgetListSection: {
                    paddingHorizontal: 16,
                    paddingVertical: 24,
                    gap: 10,
                },
                budgetListTitle: {
                    marginBottom: 8,
                },
                budgetCard: {
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 2,
                    gap: 8,
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.borderColor,
                },
                budgetHeader: {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                },
                budgetAmount: {
                    fontSize: 14,
                    opacity: 0.8,
                    color: theme.label,
                },
                budgetTotalInline: {
                    fontWeight: "600",
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
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    gap: 12,
                },
                remainingText: {
                    fontSize: 16,
                    fontWeight: "500",
                    marginBottom: 8,
                    color: theme.label,
                },
                expenseItem: {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    marginBottom: 8,
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.borderColor,
                },
                expenseInfo: {
                    flex: 1,
                },
                expenseIcon: {
                    borderWidth: 1,
                    borderRadius: 6,
                    padding: 8,
                },
                deleteButton: {
                    color: redColor,
                    fontWeight: "600",
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
                selectedCard: {
                    borderColor: blueColor,
                    backgroundColor: theme.cardBackground,
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
            // Delete budget (cascade should delete expenses)
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
        <ScrollView style={styles.container}>
            {/* Create Budget Section */}
            <ThemedView style={styles.inputSection}>
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

            {/* Budget List */}
            {budgets.length > 0 && (
                <ThemedView style={styles.budgetListSection}>
                    <ThemedText type="subtitle" style={styles.budgetListTitle}>
                        Your Budgets
                    </ThemedText>
                    {budgets.map((budget) => (
                        <View
                            key={budget.id}
                            style={[
                                styles.budgetCard,
                                selectedBudgetId === budget.id &&
                                    styles.selectedCard,
                            ]}
                        >
                            <View style={styles.budgetHeader}>
                                <TouchableOpacity
                                    style={{ flex: 1 }}
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
                            <ThemedText style={styles.budgetAmount}>
                                {currencySymbol} {budget.spent.toFixed(2)} -{" "}
                                <ThemedText
                                    style={[
                                        styles.budgetAmount,
                                        styles.budgetTotalInline,
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

            {/* Expense Input Section */}
            {selectedBudget && (
                <ThemedView style={styles.expenseSection}>
                    <ThemedText type="subtitle">
                        {selectedBudget.name}
                    </ThemedText>
                    <ThemedText style={styles.remainingText}>
                        Remaining: {currencySymbol}{" "}
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

                    {/* Expenses List */}
                    <ThemedText
                        type="subtitle"
                        style={{ marginTop: 20, marginBottom: 10 }}
                    >
                        Expenses
                    </ThemedText>
                    {selectedBudget.expenses.length === 0 ? (
                        <ThemedText
                            style={{
                                textAlign: "center",
                                marginVertical: 20,
                                opacity: 0.6,
                            }}
                        >
                            No expenses yet
                        </ThemedText>
                    ) : (
                        selectedBudget.expenses.map((expense) => (
                            <View key={expense.id} style={styles.expenseItem}>
                                <View style={styles.expenseInfo}>
                                    <ThemedText type="defaultSemiBold">
                                        {expense.name}
                                    </ThemedText>
                                    <ThemedText>
                                        {currencySymbol}{" "}
                                        {expense.amount.toFixed(2)}
                                    </ThemedText>
                                </View>
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
