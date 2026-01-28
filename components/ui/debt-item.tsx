import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

import { formatAmount, formatCurrency, formatNumber } from "@/utils/helpers";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { blueColor, greenColor, mediumGreyColor, orangeColor, redColor } from "@/constants/theme";
import { baseGreen, baseInactive, baseRed } from "@/styles/base";

export const DebtItem = memo(
    ({
        debt,
        styles,
        currencySymbol,
        setPaymentId,
        setPaymentAmount,
        paymentId,
        onToggleActive,
        onEdit,
        onDelete,
        loading,
        theme,
        paymentAmount,
        onPayment,
        t,
    }: DebtListProps) => {
        const renderNextPaymentDate = (dateString: string | null | undefined) => {
            if (!dateString) return <ThemedText style={[styles.itemPaymentText]}>—</ThemedText>;

            const dateObj = new Date(dateString);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            dateObj.setHours(0, 0, 0, 0);
            const formatted = dateObj.toLocaleDateString();

            if (dateObj.getTime() === today.getTime()) {
                return <ThemedText style={[styles.itemPaymentText, { fontWeight: "bold" }]}>{formatted} ◀︎</ThemedText>;
            } else if (dateObj < today) {
                return (
                    <ThemedText style={[styles.itemPaymentText, { fontWeight: "bold", color: redColor }]}>
                        {formatted}
                    </ThemedText>
                );
            } else {
                return <ThemedText style={[styles.itemPaymentText]}>{formatted}</ThemedText>;
            }
        };

        return (
            <ThemedView key={debt.id} style={[styles.item, !debt.active && baseInactive]}>
                <View style={styles.itemHeader}>
                    <View style={styles.itemTitle}>
                        <ThemedText type="defaultSemiBold" numberOfLines={1} ellipsizeMode="tail">
                            {debt.name}
                        </ThemedText>
                        <ThemedText style={styles.itemLabel}>
                            {t("debts.total")}: {formatCurrency(debt.amount, currencySymbol)}
                        </ThemedText>
                    </View>
                    <View style={styles.itemIcons}>
                        <TouchableOpacity
                            onPress={() => {
                                setPaymentId(paymentId === debt.id ? null : debt.id);
                                setPaymentAmount("");
                            }}
                            style={[
                                styles.itemIcon,
                                {
                                    borderColor: blueColor,
                                },
                            ]}
                        >
                            <Ionicons name="cash-outline" size={16} color={blueColor} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onToggleActive(debt.id, debt.active)}
                            style={[
                                styles.itemIcon,
                                {
                                    borderColor: debt.active ? greenColor : mediumGreyColor,
                                },
                            ]}
                        >
                            <Ionicons
                                name={debt.active ? "eye" : "eye-off"}
                                size={16}
                                color={debt.active ? greenColor : mediumGreyColor}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onEdit(debt)}
                            style={[
                                styles.itemIcon,
                                {
                                    borderColor: mediumGreyColor,
                                },
                            ]}
                        >
                            <Ionicons name="pencil" size={16} color={mediumGreyColor} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onDelete(debt.id, debt.name)}
                            style={[
                                styles.itemIcon,
                                {
                                    borderColor: redColor,
                                },
                            ]}
                        >
                            <Ionicons name="trash" size={16} color={redColor} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.itemAmount}>
                    <View style={styles.itemPayment}>
                        <Ionicons name="time-outline" size={16} color={orangeColor} />
                        {renderNextPaymentDate(debt.next_payment_date)}
                    </View>
                    {debt.pay_per_month && debt.pay_per_month > 0 ?
                        (() => {
                            const months = Math.ceil(debt.amount / debt.pay_per_month);
                            const remainder = debt.amount % debt.pay_per_month;
                            if (months === 1) {
                                return (
                                    <ThemedText style={styles.itemRemaining}>
                                        {t("debts.terms")}: 1 ({formatCurrency(debt.amount, currencySymbol)})
                                    </ThemedText>
                                );
                            } else if (remainder === 0) {
                                return (
                                    <ThemedText style={styles.itemRemaining}>
                                        {t("debts.terms")}: {months} (
                                        {formatCurrency(debt.pay_per_month, currencySymbol)})
                                    </ThemedText>
                                );
                            } else {
                                return (
                                    <ThemedText style={styles.itemRemaining}>
                                        {t("debts.terms")}: {months} ({months - 1} × {currencySymbol}{" "}
                                        {formatAmount(debt.pay_per_month)} — 1 x: {currencySymbol}{" "}
                                        {formatAmount(remainder)})
                                    </ThemedText>
                                );
                            }
                        })()
                    :   <ThemedText style={styles.itemRemaining}>{t("debts.terms")}: —</ThemedText>}
                </View>
                {paymentId === debt.id && (
                    <View style={styles.paymentSection}>
                        <TextInput
                            style={styles.paymentInput}
                            placeholder={`${t("debts.placeholder.amountPaid")} (${currencySymbol})`}
                            placeholderTextColor={theme.placeholder}
                            value={paymentAmount}
                            onChangeText={(text) => setPaymentAmount(formatNumber(text))}
                            keyboardType="decimal-pad"
                            autoFocus
                        />
                        <TouchableOpacity
                            style={[
                                styles.paymentButton,
                                { ...baseGreen },
                                (!paymentAmount.trim() || loading) && baseInactive,
                            ]}
                            onPress={() => onPayment(debt.id, Number.parseFloat(paymentAmount))}
                            disabled={loading || !paymentAmount.trim()}
                        >
                            <ThemedText style={styles.paymentButtonText}>{t("common.save")}</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.paymentButton, { ...baseRed }]}
                            onPress={() => {
                                setPaymentId(null);
                                setPaymentAmount("");
                            }}
                            disabled={loading}
                        >
                            <ThemedText style={styles.paymentButtonText}>{t("common.cancel")}</ThemedText>
                        </TouchableOpacity>
                    </View>
                )}
            </ThemedView>
        );
    },
);
