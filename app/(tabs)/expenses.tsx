import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

type Frequency = "daily" | "monthly" | "yearly";

interface ExpenseItem {
    id: string;
    name: string;
    amount: number;
    frequency: Frequency;
    yearlyTotal: number;
}

export default function ExpensesScreen() {
    const [expenseName, setExpenseName] = useState("");
    const [expenseAmount, setExpenseAmount] = useState("");
    const [frequency, setFrequency] = useState<Frequency>("monthly");
    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
    // const colorScheme = useColorScheme();
    const colorScheme = "dark";

    const calculateYearlyTotal = (amount: number, freq: Frequency): number => {
        const num = parseFloat(amount.toString());
        if (isNaN(num)) return 0;

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

    const handleAddExpense = () => {
        if (expenseName.trim() && expenseAmount.trim()) {
            const yearlyTotal = calculateYearlyTotal(
                parseFloat(expenseAmount),
                frequency
            );
            const newExpense: ExpenseItem = {
                id: Date.now().toString(),
                name: expenseName,
                amount: parseFloat(expenseAmount),
                frequency,
                yearlyTotal,
            };
            setExpenses([...expenses, newExpense]);
            setExpenseName("");
            setExpenseAmount("");
            setFrequency("monthly");
        }
    };

    const handleDeleteExpense = (id: string) => {
        setExpenses(expenses.filter((expense) => expense.id !== id));
    };

    const totalYearlySpend = expenses.reduce(
        (sum, expense) => sum + expense.yearlyTotal,
        0
    );

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

    return (
        <SafeAreaView
            style={[
                styles.safeAreaView,
                {
                    flex: 1,
                    backgroundColor:
                        colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5",
                },
            ]}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 24 }}
            >
                {/* Input Section */}
                <ThemedView style={styles.inputSection}>
                    <ThemedText type="title" style={styles.heading}>
                        Expenses
                    </ThemedText>

                    <ThemedText style={styles.label}>Item Name</ThemedText>
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
                        placeholder="e.g., Spotify"
                        placeholderTextColor={
                            colorScheme === "dark" ? "#666" : "#999"
                        }
                        value={expenseName}
                        onChangeText={setExpenseName}
                    />

                    <ThemedText style={styles.label}>Amount (€)</ThemedText>
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

                    <ThemedText style={styles.label}>Frequency</ThemedText>
                    <View
                        style={[
                            styles.pickerContainer,
                            {
                                borderColor:
                                    colorScheme === "dark" ? "#333" : "#ddd",
                                backgroundColor:
                                    colorScheme === "dark" ? "#2a2a2a" : "#fff",
                            },
                            Platform.OS === "ios"
                                ? { height: 150, overflow: "hidden" }
                                : null,
                        ]}
                    >
                        <Picker
                            selectedValue={frequency}
                            onValueChange={(itemValue) =>
                                setFrequency(itemValue as Frequency)
                            }
                            style={[styles.pickerInput]}
                            {...(Platform.OS === "android"
                                ? {
                                      mode: "dropdown" as const,
                                      dropdownIconColor: "#000",
                                  }
                                : {})}
                        >
                            <Picker.Item label="Daily" value="daily" />
                            <Picker.Item label="Monthly" value="monthly" />
                            <Picker.Item label="Yearly" value="yearly" />
                        </Picker>
                    </View>

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddExpense}
                    >
                        <ThemedText style={styles.buttonText}>
                            Add Expense
                        </ThemedText>
                    </TouchableOpacity>
                </ThemedView>

                {/* Expenses List */}
                {expenses.length > 0 && (
                    <ThemedView style={styles.listSection}>
                        <ThemedText type="subtitle">Expenses List</ThemedText>

                        {expenses.map((expense) => (
                            <View
                                key={expense.id}
                                style={[
                                    styles.expenseCard,
                                    {
                                        backgroundColor:
                                            colorScheme === "dark"
                                                ? "#2a2a2a"
                                                : "#fff",
                                        borderColor:
                                            colorScheme === "dark"
                                                ? "#333"
                                                : "#ddd",
                                    },
                                ]}
                            >
                                <View style={styles.expenseHeader}>
                                    <View style={styles.expenseInfo}>
                                        <ThemedText type="defaultSemiBold">
                                            {expense.name}
                                        </ThemedText>
                                        <ThemedText
                                            style={styles.frequencyLabel}
                                        >
                                            €{expense.amount.toFixed(2)} /{" "}
                                            {getFrequencyLabel(
                                                expense.frequency
                                            )}
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
                                <View style={styles.yearlyTotalBox}>
                                    <ThemedText style={styles.yearlyLabel}>
                                        Yearly Total:
                                    </ThemedText>
                                    <ThemedText style={styles.yearlyAmount}>
                                        €{expense.yearlyTotal.toFixed(2)}
                                    </ThemedText>
                                </View>
                            </View>
                        ))}
                    </ThemedView>
                )}

                {/* Total Yearly Spend */}
                {expenses.length > 0 && (
                    <ThemedView style={styles.totalSection}>
                        <ThemedText type="subtitle" style={styles.totalLabel}>
                            Total Yearly Spend
                        </ThemedText>
                        <ThemedText style={styles.totalAmount}>
                            €{totalYearlySpend.toFixed(2)}
                        </ThemedText>
                    </ThemedView>
                )}

                {expenses.length === 0 && (
                    <ThemedView style={styles.emptyState}>
                        <ThemedText style={styles.emptyStateText}>
                            Add your first expense!
                        </ThemedText>
                    </ThemedView>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1,
    },
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
    pickerContainer: {
        borderWidth: 1,
        borderRadius: 8,
        marginTop: 4,
        justifyContent: "center",
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
            ios: "#fff",
            android: "#000",
            default: "#000",
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
    listSection: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
    },
    expenseCard: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 8,
        gap: 12,
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
    deleteButton: {
        color: "#f44336",
        fontWeight: "600",
    },
    yearlyTotalBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.1)",
    },
    yearlyLabel: {
        fontSize: 13,
        fontWeight: "500",
    },
    yearlyAmount: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2196F3",
    },
    totalSection: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: "#2196F3",
        gap: 8,
    },
    totalLabel: {
        color: "#fff",
    },
    totalAmount: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#fff",
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
