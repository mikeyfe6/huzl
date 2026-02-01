import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, FlatList, Platform, Pressable, ScrollView, TextInput, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";

import { formatAmount, formatNumber } from "@/utils/helpers";
import { supabase } from "@/utils/supabase";

import { AuthGate } from "@/components/loading";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BudgetItem, ExpenseItem } from "@/components/ui/budget-item";

import { blueColor, Colors, greenColor, redColor } from "@/constants/theme";
import { baseBlue, baseGreen, baseRed } from "@/styles/base";
import { getBudgetsStyles } from "@/styles/budgets";

export default function BudgetsScreen() {
    const { t } = useTranslation();
    const { user } = useAuth();

    const colorScheme = useColorScheme();
    const { symbol: currencySymbol } = useCurrency();

    const nameInputRef = useRef<TextInput>(null);
    const expenseNameInputRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    const [budgetName, setBudgetName] = useState("");
    const [totalAmount, setTotalAmount] = useState("");
    const [budgets, setBudgets] = useState<BudgetItem[]>([]);
    const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
    const [expenseName, setExpenseName] = useState("");
    const [expenseAmount, setExpenseAmount] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const selectedBudget = budgets.find((b) => b.id === selectedBudgetId);
    const remainingAmount = selectedBudget ? selectedBudget.total - selectedBudget.spent : 0;

    const theme = Colors[colorScheme ?? "light"];
    const styles = useMemo(() => getBudgetsStyles(theme), [theme]);

    const budgetData = useMemo(() => {
        if (budgets.length === 0) {
            return [];
        }

        const data: any[] = [];

        budgets.forEach((budget) => {
            data.push({ type: "budget", budget });
        });

        if (selectedBudget) {
            data.push({ type: "expenseHeader" });

            selectedBudget.expenses.forEach((expense) => {
                data.push({ type: "expense", expense });
            });
        }

        return data;
    }, [budgets, selectedBudget]);

    const handleEditBudget = useCallback((budget: BudgetItem) => {
        setBudgetName(budget.name);
        setTotalAmount(budget.total.toFixed(2));
        setEditingId(budget.id);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        setTimeout(() => nameInputRef.current?.focus(), 100);
    }, []);

    const handleEditExpense = useCallback((expense: { id: string; name: string; amount: number; active: boolean }) => {
        setExpenseName(expense.name);
        setExpenseAmount(expense.amount.toFixed(2));
        setEditingExpenseId(expense.id);
        setTimeout(() => expenseNameInputRef.current?.focus(), 100);
    }, []);

    const handleToggleExpenseActive = useCallback(
        async (expenseId: string, currentActive: boolean) => {
            if (!user) return;

            setLoading(true);
            try {
                const { error } = await supabase
                    .from("budget_expenses")
                    .update({ active: !currentActive })
                    .eq("id", expenseId);

                if (!error) {
                    setBudgets((prev) =>
                        prev.map((b) => {
                            if (b.id !== selectedBudgetId) return b;

                            const updatedExpenses = b.expenses.map((e) =>
                                e.id === expenseId ? { ...e, active: !currentActive } : e,
                            );

                            const newSpent = updatedExpenses
                                .filter((e) => e.active)
                                .reduce((sum, e) => sum + e.amount, 0);
                            return {
                                ...b,
                                expenses: updatedExpenses,
                                spent: newSpent,
                            };
                        }),
                    );
                }
            } finally {
                setLoading(false);
            }
        },
        [user, selectedBudgetId],
    );

    const handleToggleBudgetActive = useCallback(
        async (budgetId: string, currentActive: boolean) => {
            if (!user) return;
            setLoading(true);
            try {
                const { error } = await supabase
                    .from("budgets")
                    .update({ active: !currentActive })
                    .eq("id", budgetId)
                    .eq("user_id", user.id);
                if (!error) {
                    setBudgets((prev) => prev.map((b) => (b.id === budgetId ? { ...b, active: !currentActive } : b)));
                }
            } finally {
                setLoading(false);
            }
        },
        [user],
    );

    const handleDeleteBudget = useCallback(
        async (budgetId: string) => {
            if (!user) return;

            setLoading(true);
            try {
                const { error } = await supabase.from("budgets").delete().eq("id", budgetId);

                if (!error) {
                    setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
                    if (selectedBudgetId === budgetId) {
                        setSelectedBudgetId(null);
                    }
                }
            } finally {
                setLoading(false);
            }
        },
        [selectedBudgetId, user],
    );

    const handleDeleteExpense = useCallback(
        async (expenseId: string) => {
            if (!user) return;

            setLoading(true);
            try {
                const { error } = await supabase.from("budget_expenses").delete().eq("id", expenseId);

                if (!error) {
                    setBudgets((prev) =>
                        prev.map((budget) => {
                            if (budget.id !== selectedBudgetId) return budget;

                            const expense = budget.expenses.find((e) => e.id === expenseId);

                            return {
                                ...budget,
                                expenses: budget.expenses.filter((e) => e.id !== expenseId),
                                spent: budget.spent - (expense?.amount || 0),
                            };
                        }),
                    );
                }
            } finally {
                setLoading(false);
            }
        },
        [user, selectedBudgetId],
    );

    const confirmDelete = useCallback(
        (id: string, name: string, type: "budget" | "expense") => {
            if (Platform.OS === "web") {
                const ok = globalThis.confirm(`${t("common.delete")} "${name}"?`);
                if (ok) {
                    type === "budget" ? handleDeleteBudget(id) : handleDeleteExpense(id);
                }
                return;
            }

            Alert.alert(`${t("budgets.deleteBudget")} ${type}`, `${t("common.delete")} "${name}"?`, [
                { text: t("common.cancel"), style: "cancel" },
                {
                    text: t("common.delete"),
                    style: "destructive",
                    onPress: () => {
                        type === "budget" ? handleDeleteBudget(id) : handleDeleteExpense(id);
                    },
                },
            ]);
        },
        [t, handleDeleteBudget, handleDeleteExpense],
    );

    const handleDeleteBudgetItem = useCallback(
        (id: string, name: string) => confirmDelete(id, name, "budget"),
        [confirmDelete],
    );

    const handleDeleteExpenseItem = useCallback(
        (id: string, name: string) => confirmDelete(id, name, "expense"),
        [confirmDelete],
    );

    const handleCancelEdit = () => {
        setBudgetName("");
        setTotalAmount("");
        setEditingId(null);
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
                                    e.id === editingExpenseId ?
                                        { ...e, name: data.name, amount: data.amount, created_at: data.created_at }
                                    :   e,
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
                                active: data.active,
                                created_at: data.created_at,
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

    const handleCancelExpenseEdit = () => {
        setExpenseName("");
        setExpenseAmount("");
        setEditingExpenseId(null);
    };

    const fetchBudgetExpenses = async (budgetId: string) => {
        if (!user) return { expenses: [], spent: 0 };
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
                created_at: exp.created_at,
            })),
            spent: expenses.filter((exp) => exp.active).reduce((sum, exp) => sum + exp.amount, 0),
        };
    };

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

    const BudgetHeader = (
        <>
            <ThemedView style={styles.fieldset}>
                <ThemedText type="title" style={styles.heading}>
                    {t("budgets.title")}
                </ThemedText>

                <ThemedText style={styles.label}>{t("budgets.label.name")}</ThemedText>
                <TextInput
                    ref={nameInputRef}
                    style={styles.input}
                    placeholder={t("budgets.placeholder.name")}
                    placeholderTextColor={theme.placeholder}
                    value={budgetName}
                    onChangeText={setBudgetName}
                />

                <ThemedText style={styles.label}>
                    {t("budgets.label.totalAmount")} ({currencySymbol})
                </ThemedText>
                <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={theme.placeholder}
                    value={totalAmount}
                    onChangeText={(text) => setTotalAmount(formatNumber(text))}
                    keyboardType="decimal-pad"
                />

                <View style={styles.buttons}>
                    <Pressable style={[styles.button, { ...baseBlue }]} onPress={handleCreateBudget} disabled={loading}>
                        <ThemedText style={styles.buttonText}>
                            {editingId ? t("budgets.button.updateBudget") : t("budgets.button.addBudget")}
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

            {budgets.length > 0 && (
                <ThemedText type="subtitle" style={styles.budgetHeader}>
                    {t("budgets.yourBudgets")}
                </ThemedText>
            )}
        </>
    );

    const ExpenseHeader = (
        <>
            {selectedBudget && (
                <View style={styles.fieldset}>
                    <ThemedText type="subtitle" style={styles.expenseHeader}>
                        <Ionicons name="caret-forward" size={16} color={blueColor} /> {selectedBudget.name}
                    </ThemedText>
                    <ThemedText style={styles.expenseRemaining}>
                        {t("budgets.remaining")} ({currencySymbol}):{" "}
                        <ThemedText
                            style={{
                                color: remainingAmount < 0 ? redColor : greenColor,
                            }}
                        >
                            {formatAmount(remainingAmount)}
                        </ThemedText>
                    </ThemedText>

                    <ThemedText style={styles.label}>{t("budgets.label.expenseName")}</ThemedText>
                    <TextInput
                        ref={expenseNameInputRef}
                        style={styles.input}
                        placeholder={t("budgets.placeholder.expenseName")}
                        placeholderTextColor={theme.placeholder}
                        value={expenseName}
                        onChangeText={setExpenseName}
                    />

                    <ThemedText style={styles.label}>
                        {t("budgets.label.expenseAmount")} ({currencySymbol})
                    </ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        placeholderTextColor={theme.placeholder}
                        value={expenseAmount}
                        onChangeText={(text) => setExpenseAmount(formatNumber(text))}
                        keyboardType="decimal-pad"
                    />

                    <View style={styles.buttons}>
                        <Pressable
                            style={[styles.button, { ...baseGreen }]}
                            onPress={handleAddExpense}
                            disabled={loading}
                        >
                            <ThemedText style={styles.buttonText}>
                                {editingExpenseId ? t("budgets.button.updateExpense") : t("budgets.button.addExpense")}
                            </ThemedText>
                        </Pressable>
                        {editingExpenseId && (
                            <Pressable
                                style={[styles.button, { ...baseRed }]}
                                onPress={handleCancelExpenseEdit}
                                disabled={loading}
                            >
                                <ThemedText style={styles.buttonText}>{t("common.cancel")}</ThemedText>
                            </Pressable>
                        )}
                    </View>

                    {selectedBudget.expenses.length > 0 ?
                        <ThemedText type="subtitle" style={styles.expenseList}>
                            {t("budgets.expenses")}
                        </ThemedText>
                    :   <ThemedView style={styles.emptyState}>
                            <ThemedText style={styles.emptyStateText}>{t("budgets.noExpenses")}</ThemedText>
                        </ThemedView>
                    }
                </View>
            )}
        </>
    );

    const renderItem = useCallback(
        (props: { item: BudgetListItem }) => {
            const { item } = props;
            if (item.type === "budget")
                return (
                    <BudgetItem
                        budget={item.budget}
                        currencySymbol={currencySymbol}
                        onToggleActive={handleToggleBudgetActive}
                        onEdit={handleEditBudget}
                        onDelete={handleDeleteBudgetItem}
                        selectedBudgetId={selectedBudgetId}
                        setSelectedBudgetId={setSelectedBudgetId}
                        styles={styles}
                    />
                );
            if (item.type === "expenseHeader") return ExpenseHeader;
            if (item.type === "expense")
                return (
                    <ExpenseItem
                        expense={item.expense}
                        currencySymbol={currencySymbol}
                        onToggleActive={handleToggleExpenseActive}
                        onEdit={handleEditExpense}
                        onDelete={handleDeleteExpenseItem}
                        styles={styles}
                        t={t}
                    />
                );
            return null;
        },
        [
            currencySymbol,
            handleToggleBudgetActive,
            handleEditBudget,
            confirmDelete,
            styles,
            selectedBudgetId,
            setSelectedBudgetId,
            ExpenseHeader,
            handleToggleExpenseActive,
            handleEditExpense,
        ],
    );

    return (
        <AuthGate>
            <FlatList
                data={budgetData}
                keyExtractor={(item, index) => {
                    if (item.type === "budget") return `budget-${item.budget.id}`;
                    if (item.type === "expense") return `expense-${item.expense.id}`;
                    return item.type + "-" + index;
                }}
                ListHeaderComponent={BudgetHeader}
                contentContainerStyle={budgetData.length > 0 ? { backgroundColor: theme.background } : undefined}
                renderItem={renderItem}
                ListEmptyComponent={
                    loading ?
                        <ThemedView style={styles.emptyState}>
                            <Ionicons name="time-outline" size={24} color={theme.inputText} />
                        </ThemedView>
                    :   <ThemedView style={styles.emptyState}>
                            <ThemedText style={styles.emptyStateText}>{t("budgets.addFirstBudget")}</ThemedText>
                        </ThemedView>
                }
            />
        </AuthGate>
    );
}
