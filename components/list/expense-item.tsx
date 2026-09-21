import { Ionicons } from "@expo/vector-icons";
import { memo, useState } from "react";
import { Pressable, View } from "react-native";

import { formatCurrency, formatDate } from "@/utils/helpers";

import { ThemedText } from "@/components/themed-text";

import { greenColor, mediumGreyColor, redColor, steelColor } from "@/constants/theme";
import { baseInactive } from "@/styles/base";

export const ExpenseItem = memo(
    ({
        expense,
        currencySymbol,
        onToggleActive,
        onEdit,
        onDelete,
        frequencyLabel,
        categoryLabelMap,
        styles,
        t,
    }: ExpenseListProps) => {
        const [showInfoModal, setShowInfoModal] = useState(false);

        return (
            <View style={[styles.expenseCard, !expense.active && baseInactive]}>
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
                                - {frequencyLabel}
                            </ThemedText>
                        </View>
                    </View>
                    <View style={styles.expenseIcons}>
                        <Pressable
                            onPress={() => onToggleActive(expense.id, expense.active)}
                            style={[styles.expenseIcon, { borderColor: expense.active ? greenColor : mediumGreyColor }]}
                        >
                            <Ionicons
                                name={expense.active ? "eye" : "eye-off"}
                                size={16}
                                color={expense.active ? greenColor : mediumGreyColor}
                            />
                        </Pressable>
                        <Pressable
                            onPress={() => onEdit(expense)}
                            style={[styles.expenseIcon, { borderColor: mediumGreyColor }]}
                        >
                            <Ionicons name="pencil" size={16} color={mediumGreyColor} />
                        </Pressable>
                        <Pressable
                            onPress={() => setShowInfoModal(true)}
                            style={[styles.expenseIcon, { borderColor: steelColor }]}
                        >
                            <Ionicons name="information-circle-outline" size={16} color={steelColor} />
                        </Pressable>
                        <Pressable
                            onPress={() => onDelete(expense.id, expense.name)}
                            style={[styles.expenseIcon, { borderColor: redColor }]}
                        >
                            <Ionicons name="trash" size={16} color={redColor} />
                        </Pressable>
                    </View>
                </View>
                <View style={styles.expenseTotal}>
                    <View
                        style={[
                            styles.badge,
                            (styles as any)[
                                `badge${expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}`
                            ],
                        ]}
                    >
                        <ThemedText style={styles.badgeText}>{categoryLabelMap[expense.category]}</ThemedText>
                    </View>
                    <View style={styles.expenseAmounts}>
                        <View style={styles.expenseYearly}>
                            <ThemedText style={styles.expenseYearlyLabel}>{t("expenses.perYear")}: </ThemedText>
                            <ThemedText style={styles.expenseYearlyValue}>
                                {formatCurrency(expense.yearlyTotal, currencySymbol)}
                            </ThemedText>
                        </View>

                        <View style={styles.expenseMonthly}>
                            <ThemedText style={styles.expenseMonthlyLabel}> {t("expenses.perMonth")}: </ThemedText>
                            <ThemedText style={styles.expenseMonthlyValue}>
                                {formatCurrency(expense.yearlyTotal / 12, currencySymbol)}
                            </ThemedText>
                        </View>
                    </View>
                </View>

                {showInfoModal && (
                    <View style={styles.infoOverlay}>
                        <View style={styles.infoTitle}>
                            <ThemedText type="defaultSemiBold" numberOfLines={1} ellipsizeMode="tail">
                                {expense.name}
                            </ThemedText>
                            <Pressable
                                onPress={() => setShowInfoModal(false)}
                                accessibilityRole="button"
                                accessibilityLabel={t("common.close")}
                                style={[styles.expenseIcon, { borderColor: redColor }]}
                            >
                                <Ionicons name="close" size={20} color={redColor} />
                            </Pressable>
                        </View>
                        <View style={styles.infoRow}>
                            <ThemedText style={styles.infoLabel} numberOfLines={1} ellipsizeMode="tail">
                                {t("expenses.info.updatedAt")}
                            </ThemedText>
                            <ThemedText style={styles.infoValue}>
                                {formatDate(expense.updated_at ?? expense.created_at, t("seo.lang"))}
                            </ThemedText>
                        </View>
                        <View style={styles.infoRow}>
                            <ThemedText style={styles.infoLabel}>{t("expenses.info.createdAt")}</ThemedText>
                            <ThemedText style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
                                {formatDate(expense.created_at, t("seo.lang"))}
                            </ThemedText>
                        </View>
                    </View>
                )}
            </View>
        );
    },
);
