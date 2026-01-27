import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { TouchableOpacity, View } from "react-native";

import { formatCurrency } from "@/utils/helpers";

import { ThemedText } from "@/components/themed-text";

import { blueColor, greenColor, mediumGreyColor, redColor } from "@/constants/theme";
import { baseInactive } from "@/styles/base";

export const BudgetItem = memo(
    ({
        budget,
        currencySymbol,
        onToggleActive,
        onEdit,
        onDelete,
        styles,
        selectedBudgetId,
        setSelectedBudgetId,
    }: BudgetListProps) => {
        return (
            <View
                key={budget.id}
                style={[
                    styles.budgetCard,
                    selectedBudgetId === budget.id && styles.budgetSelected,
                    !budget.active && baseInactive,
                ]}
            >
                <View style={styles.budgetTitle}>
                    <ThemedText type="defaultSemiBold" numberOfLines={1} ellipsizeMode="tail">
                        {budget.name}
                    </ThemedText>
                    <View style={styles.budgetIcons}>
                        <TouchableOpacity
                            onPress={() => setSelectedBudgetId(selectedBudgetId === budget.id ? null : budget.id)}
                            style={[
                                styles.budgetIcon,
                                {
                                    borderColor: blueColor,
                                },
                            ]}
                        >
                            <Ionicons name="cash-outline" size={16} color={blueColor} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onToggleActive(budget.id, budget.active)}
                            style={[
                                styles.budgetIcon,
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
                            onPress={() => onEdit(budget)}
                            style={[
                                styles.budgetIcon,
                                {
                                    borderColor: mediumGreyColor,
                                },
                            ]}
                        >
                            <Ionicons name="pencil" size={16} color={mediumGreyColor} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onDelete(budget.id, budget.name)}
                            style={[
                                styles.budgetIcon,
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
                    {formatCurrency(budget.spent, currencySymbol)} -{" "}
                    <ThemedText style={[styles.budgetAmount, styles.budgetInline]}>
                        {formatCurrency(budget.total, currencySymbol)}
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
        );
    },
);

export const ExpenseItem = memo(
    ({ expense, currencySymbol, onToggleActive, onEdit, onDelete, styles }: BudgetExpenseListProps) => {
        return (
            <View key={expense.id} style={[styles.expenseItem, !expense.active && baseInactive]}>
                <View style={styles.expenseInfo}>
                    <ThemedText type="defaultSemiBold" numberOfLines={1} ellipsizeMode="tail">
                        {expense.name}
                    </ThemedText>
                    <ThemedText style={styles.expenseLabel}>
                        {formatCurrency(expense.amount, currencySymbol)}
                    </ThemedText>
                </View>
                <View style={styles.budgetIcons}>
                    <TouchableOpacity
                        onPress={() => onToggleActive(expense.id, expense.active)}
                        style={[
                            styles.budgetIcon,
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
                        onPress={() => onEdit(expense)}
                        style={[
                            styles.budgetIcon,
                            {
                                borderColor: mediumGreyColor,
                            },
                        ]}
                    >
                        <Ionicons name="pencil" size={16} color={mediumGreyColor} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onDelete(expense.id, expense.name)}
                        style={[
                            styles.budgetIcon,
                            {
                                borderColor: redColor,
                            },
                        ]}
                    >
                        <Ionicons name="trash" size={16} color={redColor} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    },
);
