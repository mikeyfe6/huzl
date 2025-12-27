import { useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { blueColor, whiteColor } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { AVAILABLE_CURRENCIES, type Currency } from "@/hooks/use-currency";
import { supabase } from "@/utils/supabase";

interface CurrencyPickerModalProps {
    readonly visible: boolean;
    readonly onClose: () => void;
    readonly currentSymbol: string;
}

export function CurrencyPickerModal({
    visible,
    onClose,
    currentSymbol,
}: CurrencyPickerModalProps) {
    const { refreshUser } = useAuth();
    const [saving, setSaving] = useState(false);

    const handleSelect = async (currency: Currency) => {
        setSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    currency_symbol: currency.symbol,
                    currency_code: currency.code,
                },
            });

            if (error) {
                Alert.alert(
                    "Error",
                    `Failed to update currency: ${error.message}`
                );
                return;
            }

            await refreshUser();
            onClose();
        } catch (e) {
            console.error("Currency update error:", e);
            const msg =
                e instanceof Error
                    ? e.message
                    : "An unexpected error occurred.";
            Alert.alert("Error", msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <ThemedView style={styles.container}>
                <ThemedView style={styles.header}>
                    <ThemedText type="title">Select Currency</ThemedText>
                    <TouchableOpacity onPress={onClose} disabled={saving}>
                        <ThemedText type="danger">Close</ThemedText>
                    </TouchableOpacity>
                </ThemedView>

                <ScrollView style={styles.list}>
                    {AVAILABLE_CURRENCIES.map((currency) => {
                        const isSelected = currency.symbol === currentSymbol;
                        return (
                            <TouchableOpacity
                                key={currency.code}
                                style={[
                                    styles.currencyItem,
                                    isSelected && styles.currencyItemSelected,
                                ]}
                                onPress={() => handleSelect(currency)}
                                disabled={saving}
                            >
                                <View style={styles.currencyInfo}>
                                    <ThemedText
                                        style={[
                                            styles.currencySymbol,
                                            isSelected && styles.selectedText,
                                        ]}
                                    >
                                        {currency.symbol}
                                    </ThemedText>
                                    <View>
                                        <ThemedText
                                            style={[
                                                styles.currencyName,
                                                isSelected &&
                                                    styles.selectedText,
                                            ]}
                                        >
                                            {currency.name}
                                        </ThemedText>
                                        <ThemedText
                                            style={[
                                                styles.currencyCode,
                                                isSelected &&
                                                    styles.selectedText,
                                            ]}
                                        >
                                            {currency.code}
                                        </ThemedText>
                                    </View>
                                </View>
                                {isSelected && (
                                    <ThemedText style={styles.checkmark}>
                                        ✓
                                    </ThemedText>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </ThemedView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    list: {
        flex: 1,
        paddingHorizontal: 20,
    },
    currencyItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    currencyItemSelected: {
        backgroundColor: blueColor,
    },
    currencyInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    currencySymbol: {
        fontSize: 28,
        fontWeight: "bold",
        width: 40,
        height: 24,
        lineHeight: 24,
    },
    currencyName: {
        fontSize: 16,
        fontWeight: "600",
    },
    currencyCode: {
        fontSize: 13,
        opacity: 0.7,
        marginTop: 2,
    },
    checkmark: {
        fontSize: 24,
        fontWeight: "bold",
        color: whiteColor,
    },
    selectedText: {
        color: whiteColor,
    },
});
