import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { useAvailableCurrencies, type Currency } from "@/hooks/use-currency";

import { supabase } from "@/utils/supabase";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { Colors, linkColor, whiteColor } from "@/constants/theme";
import { baseBold, baseCorner, baseFlex, baseLarge, baseMini, baseOutline, baseTitle, baseWeight } from "@/styles/base";

type ThemeProps = (typeof Colors)[keyof typeof Colors];

interface CurrencyPickerModalProps {
    readonly visible: boolean;
    readonly onClose: () => void;
    readonly currentSymbol: string;
    readonly theme: ThemeProps;
}

export function CurrencyPickerModal({ visible, onClose, currentSymbol, theme }: CurrencyPickerModalProps) {
    const { t } = useTranslation();
    const { refreshUser } = useAuth();
    const availableCurrencies = useAvailableCurrencies();

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
                Alert.alert("Error", `Failed to update currency: ${error.message}`);
                return;
            }

            await refreshUser();
            onClose();
        } catch (e) {
            console.error("Currency update error:", e);
            const msg = e instanceof Error ? e.message : "An unexpected error occurred.";
            Alert.alert("Error", msg);
        } finally {
            setSaving(false);
        }
    };

    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: {
                    flex: 1,
                    paddingTop: 60,
                },
                header: {
                    ...baseFlex("space-between", "center"),
                    paddingHorizontal: 20,
                    paddingBottom: 32,
                },
                list: {
                    flex: 1,
                    paddingTop: 8,
                    paddingHorizontal: 20,
                },
                currencyItem: {
                    ...baseFlex("space-between", "center"),
                    ...baseOutline(theme),
                    ...baseCorner,
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                    marginBottom: 8,
                },
                currencyItemSelected: {
                    backgroundColor: linkColor,
                },
                currencyInfo: {
                    ...baseFlex("space-between", "center"),
                    gap: 16,
                },
                currencySymbol: {
                    ...baseTitle,
                    width: 40,
                    height: 40,
                },
                currencyName: {
                    ...baseWeight,
                },
                currencyCode: {
                    ...baseMini,
                    opacity: 0.7,
                    marginTop: 2,
                },
                checkmark: {
                    ...baseLarge,
                    ...baseBold,
                    color: whiteColor,
                },
                selectedText: {
                    color: whiteColor,
                },
            }),
        [theme],
    );

    return (
        <Modal visible={visible} animationType="fade" presentationStyle="pageSheet" onRequestClose={onClose}>
            <ThemedView style={styles.container}>
                <ThemedView style={styles.header}>
                    <ThemedText type="title">{t("currency.selectCurrency")}</ThemedText>
                    <TouchableOpacity onPress={onClose} disabled={saving} style={{ ...baseOutline(theme) }}>
                        <ThemedText type="danger">{t("currency.close")}</ThemedText>
                    </TouchableOpacity>
                </ThemedView>

                <ScrollView style={styles.list}>
                    {availableCurrencies.map((currency) => {
                        const isSelected = currency.symbol === currentSymbol;
                        return (
                            <TouchableOpacity
                                key={currency.code}
                                style={[styles.currencyItem, isSelected && styles.currencyItemSelected]}
                                onPress={() => handleSelect(currency)}
                                disabled={saving}
                            >
                                <View style={styles.currencyInfo}>
                                    <ThemedText style={[styles.currencySymbol, isSelected && styles.selectedText]}>
                                        {currency.symbol}
                                    </ThemedText>
                                    <View>
                                        <ThemedText style={[styles.currencyName, isSelected && styles.selectedText]}>
                                            {currency.name}
                                        </ThemedText>
                                        <ThemedText style={[styles.currencyCode, isSelected && styles.selectedText]}>
                                            {currency.code}
                                        </ThemedText>
                                    </View>
                                </View>
                                {isSelected && <ThemedText style={styles.checkmark}>✓</ThemedText>}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </ThemedView>
        </Modal>
    );
}
