import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function BudgetsScreen() {
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
    const colorScheme = useColorScheme();

    const handleCreateBudget = () => {
        if (budgetName.trim() && totalAmount.trim()) {
            const newBudget = {
                id: Date.now().toString(),
                name: budgetName,
                total: parseFloat(totalAmount),
                spent: 0,
                expenses: [],
            };
            setBudgets([...budgets, newBudget]);
            setBudgetName("");
            setTotalAmount("");
        }
    };

    const handleAddExpense = () => {
        if (selectedBudgetId && expenseName.trim() && expenseAmount.trim()) {
            const updatedBudgets = budgets.map((budget) => {
                if (budget.id === selectedBudgetId) {
                    const expense = {
                        id: Date.now().toString(),
                        name: expenseName,
                        amount: parseFloat(expenseAmount),
                    };
                    return {
                        ...budget,
                        expenses: [...budget.expenses, expense],
                        spent: budget.spent + parseFloat(expenseAmount),
                    };
                }
                return budget;
            });
            setBudgets(updatedBudgets);
            setExpenseName("");
            setExpenseAmount("");
        }
    };

    const handleDeleteExpense = (expenseId: string) => {
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
    };

    const selectedBudget = budgets.find((b) => b.id === selectedBudgetId);
    const remainingAmount = selectedBudget
        ? selectedBudget.total - selectedBudget.spent
        : 0;

    return (
        <ScrollView
            style={[
                styles.container,
                {
                    backgroundColor:
                        colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5",
                },
            ]}
        >
            {/* Create Budget Section */}
            <ThemedView style={styles.inputSection}>
                <ThemedText type="title" style={styles.heading}>
                    Budgets
                </ThemedText>

                <ThemedText style={styles.label}>Potje Name</ThemedText>
                <TextInput
                    style={[
                        styles.input,
                        {
                            color: colorScheme === "dark" ? "#fff" : "#000",
                            borderColor:
                                colorScheme === "dark" ? "#333" : "#ddd",
                            backgroundColor:
                                colorScheme === "dark" ? "#2a2a2a" : "#fff",
                        },
                    ]}
                    placeholder="e.g., Groceries"
                    placeholderTextColor={
                        colorScheme === "dark" ? "#666" : "#999"
                    }
                    value={budgetName}
                    onChangeText={setBudgetName}
                />

                <ThemedText style={styles.label}>Total Amount ($)</ThemedText>
                <TextInput
                    style={[
                        styles.input,
                        {
                            color: colorScheme === "dark" ? "#fff" : "#000",
                            borderColor:
                                colorScheme === "dark" ? "#333" : "#ddd",
                            backgroundColor:
                                colorScheme === "dark" ? "#2a2a2a" : "#fff",
                        },
                    ]}
                    placeholder="0.00"
                    placeholderTextColor={
                        colorScheme === "dark" ? "#666" : "#999"
                    }
                    value={totalAmount}
                    onChangeText={setTotalAmount}
                    keyboardType="decimal-pad"
                />

                <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreateBudget}
                >
                    <ThemedText style={styles.buttonText}>
                        Create Potje
                    </ThemedText>
                </TouchableOpacity>
            </ThemedView>

            {/* Budget List */}
            {budgets.length > 0 && (
                <ThemedView style={styles.budgetListSection}>
                    <ThemedText type="subtitle">Your Potjes</ThemedText>
                    {budgets.map((budget) => (
                        <TouchableOpacity
                            key={budget.id}
                            style={[
                                styles.budgetCard,
                                {
                                    backgroundColor:
                                        selectedBudgetId === budget.id
                                            ? colorScheme === "dark"
                                                ? "#1e3a5f"
                                                : "#e3f2fd"
                                            : colorScheme === "dark"
                                            ? "#2a2a2a"
                                            : "#fff",
                                    borderColor:
                                        selectedBudgetId === budget.id
                                            ? "#2196F3"
                                            : colorScheme === "dark"
                                            ? "#333"
                                            : "#ddd",
                                },
                            ]}
                            onPress={() => setSelectedBudgetId(budget.id)}
                        >
                            <ThemedText type="defaultSemiBold">
                                {budget.name}
                            </ThemedText>
                            <ThemedText style={styles.budgetAmount}>
                                ${budget.spent.toFixed(2)} / $
                                {budget.total.toFixed(2)}
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
                        </TouchableOpacity>
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
                        Remaining: $
                        <ThemedText
                            style={{
                                color:
                                    remainingAmount < 0 ? "#f44336" : "#4caf50",
                            }}
                        >
                            {remainingAmount.toFixed(2)}
                        </ThemedText>
                    </ThemedText>

                    <ThemedText style={styles.label}>Expense Name</ThemedText>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                color: colorScheme === "dark" ? "#fff" : "#000",
                                borderColor:
                                    colorScheme === "dark" ? "#333" : "#ddd",
                                backgroundColor:
                                    colorScheme === "dark" ? "#2a2a2a" : "#fff",
                            },
                        ]}
                        placeholder="e.g., Apples"
                        placeholderTextColor={
                            colorScheme === "dark" ? "#666" : "#999"
                        }
                        value={expenseName}
                        onChangeText={setExpenseName}
                    />

                    <ThemedText style={styles.label}>Amount ($)</ThemedText>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                color: colorScheme === "dark" ? "#fff" : "#000",
                                borderColor:
                                    colorScheme === "dark" ? "#333" : "#ddd",
                                backgroundColor:
                                    colorScheme === "dark" ? "#2a2a2a" : "#fff",
                            },
                        ]}
                        placeholder="0.00"
                        placeholderTextColor={
                            colorScheme === "dark" ? "#666" : "#999"
                        }
                        value={expenseAmount}
                        onChangeText={setExpenseAmount}
                        keyboardType="decimal-pad"
                    />

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddExpense}
                    >
                        <ThemedText style={styles.buttonText}>
                            Add Expense
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
                            <View
                                key={expense.id}
                                style={[
                                    styles.expenseItem,
                                    {
                                        backgroundColor:
                                            colorScheme === "dark"
                                                ? "#2a2a2a"
                                                : "#f9f9f9",
                                        borderColor:
                                            colorScheme === "dark"
                                                ? "#333"
                                                : "#eee",
                                    },
                                ]}
                            >
                                <View style={styles.expenseInfo}>
                                    <ThemedText type="defaultSemiBold">
                                        {expense.name}
                                    </ThemedText>
                                    <ThemedText>
                                        ${expense.amount.toFixed(2)}
                                    </ThemedText>
                                </View>
                                <TouchableOpacity
                                    onPress={() =>
                                        handleDeleteExpense(expense.id)
                                    }
                                >
                                    <ThemedText style={styles.deleteButton}>
                                        Delete
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </ThemedView>
            )}

            {budgets.length === 0 && (
                <ThemedView style={styles.emptyState}>
                    <ThemedText style={styles.emptyStateText}>
                        Create a potje to get started!
                    </ThemedText>
                </ThemedView>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
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
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
    },
    createButton: {
        backgroundColor: "#2196F3",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 8,
    },
    addButton: {
        backgroundColor: "#4caf50",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 8,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    budgetListSection: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
    },
    budgetCard: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 2,
        gap: 8,
    },
    budgetAmount: {
        fontSize: 14,
        opacity: 0.8,
    },
    progressBar: {
        height: 8,
        backgroundColor: "#e0e0e0",
        borderRadius: 4,
        overflow: "hidden",
        marginTop: 4,
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#2196F3",
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
    },
    expenseItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 8,
    },
    expenseInfo: {
        flex: 1,
    },
    deleteButton: {
        color: "#f44336",
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
    },
});
