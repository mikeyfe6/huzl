import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { memo, useEffect, useState } from "react";
import { Modal, Platform, Pressable, TextInput, View } from "react-native";

import { formatAmount, formatCurrency, formatNumber } from "@/utils/helpers";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { blueColor, greenColor, mediumGreyColor, orangeColor, redColor, whiteColor } from "@/constants/theme";
import { baseInactive } from "@/styles/base";

export const DebtItem = memo(
    ({
        debt,
        index,
        styles,
        currencySymbol,
        setPaymentId,
        setPaymentAmount,
        paymentId,
        onToggleActive,
        onTogglePayment,
        onEdit,
        onDelete,
        loading,
        theme,
        paymentAmount,
        onPayment,
        t,
    }: DebtListProps) => {
        const [paymentDate, setPaymentDate] = useState<string>(debt.next_payment_date ?? "");
        const [showDatePicker, setShowDatePicker] = useState(false);
        const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null);

        useEffect(() => {
            if (paymentId === debt.id) {
                setPaymentDate(debt.next_payment_date ?? "");
                setTempSelectedDate(debt.next_payment_date ? new Date(debt.next_payment_date) : new Date());
            }
        }, [paymentId, debt.id, debt.next_payment_date]);

        const renderNextPaymentDate = (dateString: string | null | undefined) => {
            if (!dateString) return <ThemedText style={[styles.itemPaymentText]}>—</ThemedText>;
            if (debt.amount === 0)
                return (
                    <ThemedText style={[styles.itemPaymentText, { fontWeight: "bold", color: greenColor }]}>
                        {t("debts.paidOff")}
                    </ThemedText>
                );

            const dateObj = new Date(dateString);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            dateObj.setHours(0, 0, 0, 0);
            const formatted = dateObj.toLocaleDateString(t("seo.lang"));

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

        const renderPayPerMonth = () => {
            if (debt.pay_per_month && debt.pay_per_month > 0) {
                const months = Math.ceil(debt.amount / debt.pay_per_month);
                const remainder = debt.amount % debt.pay_per_month;

                if (months === 0) {
                    return <ThemedText style={styles.itemRemaining}>{t("debts.terms")}: 0</ThemedText>;
                } else if (months === 1) {
                    return (
                        <ThemedText style={styles.itemRemaining}>
                            {t("debts.terms")}: 1 ({formatCurrency(debt.amount, currencySymbol)})
                        </ThemedText>
                    );
                } else if (remainder === 0) {
                    return (
                        <ThemedText style={styles.itemRemaining}>
                            {t("debts.terms")}: {months} ({formatCurrency(debt.pay_per_month, currencySymbol)})
                        </ThemedText>
                    );
                } else {
                    return (
                        <ThemedText style={styles.itemRemaining}>
                            {t("debts.terms")}: {months} ({months - 1} × {currencySymbol}{" "}
                            {formatAmount(debt.pay_per_month)} — 1 x: {currencySymbol} {formatAmount(remainder)})
                        </ThemedText>
                    );
                }
            } else {
                return <ThemedText style={styles.itemRemaining}>{t("debts.terms")}: —</ThemedText>;
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
                        <Pressable
                            onPress={() => onTogglePayment(debt.id, index)}
                            style={[
                                styles.itemIcon,
                                {
                                    borderColor: blueColor,
                                },
                            ]}
                        >
                            <Ionicons name="cash-outline" size={16} color={blueColor} />
                        </Pressable>
                        <Pressable
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
                        </Pressable>
                        <Pressable
                            onPress={() => onEdit(debt)}
                            style={[
                                styles.itemIcon,
                                {
                                    borderColor: mediumGreyColor,
                                },
                            ]}
                        >
                            <Ionicons name="pencil" size={16} color={mediumGreyColor} />
                        </Pressable>
                        <Pressable
                            onPress={() => onDelete(debt.id, debt.name)}
                            style={[
                                styles.itemIcon,
                                {
                                    borderColor: redColor,
                                },
                            ]}
                        >
                            <Ionicons name="trash" size={16} color={redColor} />
                        </Pressable>
                    </View>
                </View>
                <View style={styles.itemAmount}>
                    <View style={styles.itemPayment}>
                        <Ionicons name="time-outline" size={16} color={orangeColor} />
                        {renderNextPaymentDate(debt.next_payment_date)}
                    </View>
                    {renderPayPerMonth()}
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
                        <View style={{ ...styles.paymentMetaRow, ...styles.paymentMetaRowMobile }}>
                            {Platform.OS === "web" ?
                                <div style={{ ...styles.dateWrapper, ...styles.dateWrapperMobile }}>
                                    <input
                                        type="date"
                                        style={styles.dateInput}
                                        value={paymentDate ? paymentDate.slice(0, 10) : ""}
                                        onChange={(e) =>
                                            setPaymentDate(e.target.value ? new Date(e.target.value).toISOString() : "")
                                        }
                                        placeholder={t("debts.placeholder.nextPaymentDate")}
                                    />
                                </div>
                            :   <Pressable
                                    style={styles.paymentDateButton}
                                    onPress={() => {
                                        setTempSelectedDate(paymentDate ? new Date(paymentDate) : new Date());
                                        setShowDatePicker(true);
                                    }}
                                    accessibilityRole="button"
                                    accessibilityLabel={t("debts.label.nextPaymentDate")}
                                >
                                    <Ionicons name="calendar-outline" size={16} color={orangeColor} />
                                    <ThemedText
                                        style={[styles.paymentDateText, !paymentDate && { color: theme.placeholder }]}
                                    >
                                        {paymentDate ?
                                            new Date(paymentDate).toLocaleDateString(t("seo.lang"))
                                        :   t("debts.placeholder.nextPaymentDate")}
                                    </ThemedText>
                                </Pressable>
                            }
                        </View>
                        <View style={styles.paymentButtons}>
                            <Pressable
                                style={[styles.saveButton, (!paymentAmount.trim() || loading) && baseInactive]}
                                onPress={() =>
                                    onPayment(debt.id, Number.parseFloat(paymentAmount), paymentDate || null)
                                }
                                disabled={loading || !paymentAmount.trim()}
                            >
                                <ThemedText style={styles.buttonText}>{t("common.save")}</ThemedText>
                            </Pressable>
                            <Pressable
                                style={styles.cancelButton}
                                onPress={() => {
                                    setPaymentId(null);
                                    setPaymentAmount("");
                                    setShowDatePicker(false);
                                }}
                                disabled={loading}
                            >
                                <Ionicons name="close" size={20} color={whiteColor} />
                            </Pressable>
                        </View>

                        {Platform.OS === "ios" && (
                            <Modal
                                transparent
                                animationType="fade"
                                visible={showDatePicker}
                                onRequestClose={() => setShowDatePicker(false)}
                            >
                                <View style={styles.modal}>
                                    <View style={styles.datepicker}>
                                        <DateTimePicker
                                            value={
                                                tempSelectedDate || (paymentDate ? new Date(paymentDate) : new Date())
                                            }
                                            mode="date"
                                            display="spinner"
                                            textColor={theme.inputText}
                                            onValueChange={(_, selectedDate) => {
                                                setTempSelectedDate(selectedDate);
                                            }}
                                        />
                                        <View style={styles.dateButtons}>
                                            <Pressable
                                                style={styles.cancelButton}
                                                onPress={() => setShowDatePicker(false)}
                                            >
                                                <Ionicons name="close" size={24} color={whiteColor} />
                                            </Pressable>
                                            <Pressable
                                                style={styles.saveButton}
                                                onPress={() => {
                                                    if (tempSelectedDate) {
                                                        setPaymentDate(tempSelectedDate.toISOString());
                                                    }
                                                    setShowDatePicker(false);
                                                }}
                                            >
                                                <ThemedText style={styles.buttonText}>{t("common.save")}</ThemedText>
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            </Modal>
                        )}

                        {Platform.OS === "android" && showDatePicker && (
                            <DateTimePicker
                                value={paymentDate ? new Date(paymentDate) : new Date()}
                                mode="date"
                                display="default"
                                onValueChange={(_, selectedDate) => {
                                    setShowDatePicker(false);
                                    setPaymentDate(selectedDate.toISOString());
                                }}
                                onDismiss={() => setShowDatePicker(false)}
                            />
                        )}
                    </View>
                )}
            </ThemedView>
        );
    },
);
