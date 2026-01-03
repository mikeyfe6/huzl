import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";

import { supabase } from "@/utils/supabase";

import { AuthGate } from "@/components/loading";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { blueColor, Colors, greenColor, mediumGreyColor, redColor } from "@/constants/theme";
import {
    baseBorder,
    baseButton,
    baseButtonText,
    baseCard,
    baseFlex,
    baseGap,
    baseIcon,
    baseIcons,
    baseInput,
    baseLabel,
    baseList,
    baseMain,
    baseSelect,
    baseSpace,
    baseWeight,
} from "@/styles/base";

type BudgetItem = {
    id: string;
    name: string;
    total: number;
    spent: number;
    active: boolean;
    expenses: { id: string; name: string; amount: number; active: boolean }[];
};

export default function BudgetsScreen() {
    const { user } = useAuth();

    const { symbol: currencySymbol } = useCurrency();
    const [budgetName, setBudgetName] = useState("");
    const [totalAmount, setTotalAmount] = useState("");
    const [budgets, setBudgets] = useState<BudgetItem[]>([]);
    const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
    const [expenseName, setExpenseName] = useState("");
    const [expenseAmount, setExpenseAmount] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    const nameInputRef = useRef<TextInput>(null);
    const expenseNameInputRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<ScrollView>(null);

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
                active: exp.active ?? true,
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
            active: budget.active ?? true,
            expenses,
        };
    };

    const handleEditBudget = (budget: BudgetItem) => {
        setBudgetName(budget.name);
        setTotalAmount(budget.total.toString());
        setEditingId(budget.id);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        setTimeout(() => nameInputRef.current?.focus(), 100);
    };

    const handleCancelEdit = () => {
        setBudgetName("");
        setTotalAmount("");
        setEditingId(null);
    };

    const handleEditExpense = (expense: { id: string; name: string; amount: number; active: boolean }) => {
        setExpenseName(expense.name);
        setExpenseAmount(expense.amount.toString());
        setEditingExpenseId(expense.id);
        setTimeout(() => expenseNameInputRef.current?.focus(), 100);
    };

    const handleCancelExpenseEdit = () => {
        setExpenseName("");
        setExpenseAmount("");
        setEditingExpenseId(null);
    };

    const handleToggleActive = async (budgetId: string, currentActive: boolean) => {
        if (!user) return;
        setLoading(true);
        try {
            const { error } = await supabase.from("budgets").update({ active: !currentActive }).eq("id", budgetId);
            if (!error) {
                setBudgets((prev) => prev.map((b) => (b.id === budgetId ? { ...b, active: !currentActive } : b)));
            }
        } finally {
            setLoading(false);
        }
    };

    const updateExpenseActive = (b: BudgetItem, expenseId: string, newActive: boolean): BudgetItem => {
        if (b.id === selectedBudgetId) {
            return {
                ...b,
                expenses: b.expenses.map((e) => (e.id === expenseId ? { ...e, active: newActive } : e)),
            };
        }
        return b;
    };

    const handleToggleExpenseActive = async (expenseId: string, currentActive: boolean) => {
        if (!user) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from("budget_expenses")
                .update({ active: !currentActive })
                .eq("id", expenseId);
            if (!error) {
                setBudgets((prev) => prev.map((b) => updateExpenseActive(b, expenseId, !currentActive)));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBudget = async () => {
        if (!user || !budgetName.trim() || !totalAmount.trim()) return;

        setLoading(true);
        try {
            if (editingId) {
                const { data, error } = await supabase
                    .from("budgets")
                    .update({
                        name: budgetName,
                        total: Number.parseFloat(totalAmount),
                    })
                    .eq("id", editingId)
                    .select();

                if (!error && Array.isArray(data) && data.length > 0) {
                    setBudgets((prev) => prev.map((b) => (b.id === editingId ? { ...b, ...data[0] } : b)));
                    handleCancelEdit();
                }
            } else {
                const { data, error } = await supabase
                    .from("budgets")
                    .insert({
                        user_id: user.id,
                        name: budgetName,
                        total: Number.parseFloat(totalAmount),
                        active: true,
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
                            active: true,
                            expenses: [],
                        },
                    ]);
                    setBudgetName("");
                    setTotalAmount("");
                }
            }
        } catch (err) {
            console.error("Exception creating budget:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async () => {
        if (!user || !selectedBudgetId || !expenseName.trim() || !expenseAmount.trim()) return;

        setLoading(true);
        try {
            if (editingExpenseId) {
                const { data, error } = await supabase
                    .from("budget_expenses")
                    .update({
                        name: expenseName,
                        amount: Number.parseFloat(expenseAmount),
                    })
                    .eq("id", editingExpenseId)
                    .select()
                    .single();

                if (!error && data) {
                    const updatedBudgets = budgets.map((budget) => {
                        if (budget.id === selectedBudgetId) {
                            const oldExpense = budget.expenses.find((e) => e.id === editingExpenseId);
                            const amountDiff = data.amount - (oldExpense?.amount || 0);
                            return {
                                ...budget,
                                expenses: budget.expenses.map((e) =>
                                    e.id === editingExpenseId ? { ...e, name: data.name, amount: data.amount } : e
                                ),
                                spent: budget.spent + amountDiff,
                            };
                        }
                        return budget;
                    });
                    setBudgets(updatedBudgets);
                    handleCancelExpenseEdit();
                }
            } else {
                const { data, error } = await supabase
                    .from("budget_expenses")
                    .insert({
                        budget_id: selectedBudgetId,
                        name: expenseName,
                        amount: Number.parseFloat(expenseAmount),
                        active: true,
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
                                active: true,
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
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBudget = async (budgetId: string) => {
        if (!user) return;

        setLoading(true);
        try {
            const { error } = await supabase.from("budgets").delete().eq("id", budgetId);

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
            const { error } = await supabase.from("budget_expenses").delete().eq("id", expenseId);

            if (!error) {
                const updatedBudgets = budgets.map((budget) => {
                    if (budget.id === selectedBudgetId) {
                        const expense = budget.expenses.find((e) => e.id === expenseId);
                        return {
                            ...budget,
                            expenses: budget.expenses.filter((e) => e.id !== expenseId),
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

    const confirmDelete = (id: string, name: string, type: "budget" | "expense") => {
        if (Platform.OS === "web") {
            const ok = globalThis.confirm(`Delete "${name}"?`);
            if (ok) {
                type === "budget" ? handleDeleteBudget(id) : handleDeleteExpense(id);
            }
            return;
        }

        Alert.alert(`Delete ${type}`, `Are you sure you want to delete "${name}"?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                    type === "budget" ? handleDeleteBudget(id) : handleDeleteExpense(id);
                },
            },
        ]);
    };

    const selectedBudget = budgets.find((b) => b.id === selectedBudgetId);
    const remainingAmount = selectedBudget ? selectedBudget.total - selectedBudget.spent : 0;

    useEffect(() => {
        if (!user) return;

        const fetchBudgets = async () => {
            setLoading(true);
            try {
                const { data: budgetsData, error: budgetsError } = await supabase
                    .from("budgets")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });

                if (budgetsError) throw budgetsError;

                const budgetsWithExpenses = await Promise.all((budgetsData || []).map(transformBudgetData));

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
                    backgroundColor: blueColor,
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
                    ...baseCard(theme),
                },
                budgetSelected: {
                    borderColor: blueColor,
                    backgroundColor: theme.cardBackground,
                },
                budgetTitle: {
                    ...baseFlex("space-between", "center"),
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
                budgetIcons: {
                    ...baseIcons,
                },
                budgetItemIcon: {
                    ...baseIcon,
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
                    ...baseWeight,
                    marginBottom: 12,
                    color: theme.label,
                },
                expenseList: {
                    marginTop: 20,
                    marginBottom: 10,
                },
                expenseItem: {
                    ...baseFlex("space-between", "center"),
                    ...baseCard(theme),
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

    return (
        <AuthGate>
            <ScrollView ref={scrollViewRef} contentContainerStyle={styles.container}>
                <ThemedView style={styles.fieldset}>
                    <ThemedText type="title" style={styles.heading}>
                        Budgets
                    </ThemedText>

                    <ThemedText style={styles.label}>Budget Name</ThemedText>
                    <TextInput
                        ref={nameInputRef}
                        style={styles.input}
                        placeholder="e.g., Groceries"
                        placeholderTextColor={theme.placeholder}
                        value={budgetName}
                        onChangeText={setBudgetName}
                    />

                    <ThemedText style={styles.label}>Total Amount ({currencySymbol})</ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        placeholderTextColor={theme.placeholder}
                        value={totalAmount}
                        onChangeText={setTotalAmount}
                        keyboardType="decimal-pad"
                    />

                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: blueColor }]}
                            onPress={handleCreateBudget}
                            disabled={loading}
                        >
                            <ThemedText style={styles.buttonText}>
                                {editingId ? "Update Budget" : "Create Budget"}
                            </ThemedText>
                        </TouchableOpacity>
                        {editingId && (
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: redColor }]}
                                onPress={handleCancelEdit}
                                disabled={loading}
                            >
                                <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                            </TouchableOpacity>
                        )}
                    </View>
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
                                    selectedBudgetId === budget.id && styles.budgetSelected,
                                    !budget.active && { opacity: 0.5 },
                                ]}
                            >
                                <View style={styles.budgetTitle}>
                                    <TouchableOpacity
                                        style={styles.budgetInfo}
                                        onPress={() => setSelectedBudgetId(budget.id)}
                                    >
                                        <ThemedText type="defaultSemiBold">{budget.name}</ThemedText>
                                    </TouchableOpacity>
                                    <View style={styles.budgetIcons}>
                                        <TouchableOpacity
                                            onPress={() => handleToggleActive(budget.id, budget.active)}
                                            style={[
                                                styles.budgetItemIcon,
                                                {
                                                    borderColor: budget.active ? greenColor : mediumGreyColor,
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name={budget.active ? "eye" : "eye-off"}
                                                size={16}
                                                color={budget.active ? greenColor : mediumGreyColor}
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleEditBudget(budget)}
                                            style={[
                                                styles.budgetItemIcon,
                                                {
                                                    borderColor: mediumGreyColor,
                                                },
                                            ]}
                                        >
                                            <Ionicons name="pencil" size={16} color={mediumGreyColor} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => confirmDelete(budget.id, budget.name, "budget")}
                                            style={[
                                                styles.budgetItemIcon,
                                                {
                                                    borderColor: redColor,
                                                },
                                            ]}
                                        >
                                            <Ionicons name="trash" size={16} color={redColor} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <ThemedText style={styles.budgetAmount}>
                                    {currencySymbol} {budget.spent.toFixed(2)} -{" "}
                                    <ThemedText style={[styles.budgetAmount, styles.budgetInline]}>
                                        {currencySymbol} {budget.total.toFixed(2)}
                                    </ThemedText>
                                </ThemedText>
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            {
                                                width: `${Math.min((budget.spent / budget.total) * 100, 100)}%`,
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
                                    color: remainingAmount < 0 ? redColor : greenColor,
                                }}
                            >
                                {remainingAmount.toFixed(2)}
                            </ThemedText>
                        </ThemedText>

                        <ThemedText style={styles.label}>Expense Name</ThemedText>
                        <TextInput
                            ref={expenseNameInputRef}
                            style={styles.input}
                            placeholder="e.g., Apples"
                            placeholderTextColor={theme.placeholder}
                            value={expenseName}
                            onChangeText={setExpenseName}
                        />

                        <ThemedText style={styles.label}>Amount ({currencySymbol})</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            placeholderTextColor={theme.placeholder}
                            value={expenseAmount}
                            onChangeText={setExpenseAmount}
                            keyboardType="decimal-pad"
                        />

                        <View style={styles.buttons}>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: greenColor }]}
                                onPress={handleAddExpense}
                                disabled={loading}
                            >
                                <ThemedText style={styles.buttonText}>
                                    {editingExpenseId ? "Update Expense" : "Add Expense"}
                                </ThemedText>
                            </TouchableOpacity>
                            {editingExpenseId && (
                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: redColor }]}
                                    onPress={handleCancelExpenseEdit}
                                    disabled={loading}
                                >
                                    <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                                </TouchableOpacity>
                            )}
                        </View>

                        <ThemedText type="subtitle" style={styles.expenseList}>
                            Expenses
                        </ThemedText>
                        {selectedBudget.expenses.length === 0 ? (
                            <ThemedView style={styles.emptyState}>
                                <ThemedText style={styles.emptyStateText}>No expenses yet</ThemedText>
                            </ThemedView>
                        ) : (
                            selectedBudget.expenses.map((expense) => (
                                <View
                                    key={expense.id}
                                    style={[styles.expenseItem, !expense.active && { opacity: 0.5 }]}
                                >
                                    <View style={styles.expenseInfo}>
                                        <ThemedText type="defaultSemiBold">{expense.name}</ThemedText>
                                        <ThemedText style={styles.expenseLabel}>
                                            {currencySymbol} {expense.amount.toFixed(2)}
                                        </ThemedText>
                                    </View>
                                    <View style={styles.budgetIcons}>
                                        <TouchableOpacity
                                            onPress={() => handleToggleExpenseActive(expense.id, expense.active)}
                                            style={[
                                                styles.budgetItemIcon,
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
                                                styles.budgetItemIcon,
                                                {
                                                    borderColor: mediumGreyColor,
                                                },
                                            ]}
                                        >
                                            <Ionicons name="pencil" size={16} color={mediumGreyColor} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => confirmDelete(expense.id, expense.name, "expense")}
                                            style={[
                                                styles.budgetItemIcon,
                                                {
                                                    borderColor: redColor,
                                                },
                                            ]}
                                        >
                                            <Ionicons name="trash" size={16} color={redColor} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </ThemedView>
                )}

                {budgets.length === 0 && (
                    <ThemedView style={styles.emptyState}>
                        <ThemedText style={styles.emptyStateText}>Create a budget to get started!</ThemedText>
                    </ThemedView>
                )}
            </ScrollView>
        </AuthGate>
    );
}
