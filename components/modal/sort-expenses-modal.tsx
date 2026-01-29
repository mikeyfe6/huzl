import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

import { linkColor } from "@/constants/theme";
import { baseBlur, baseBorder, baseCorner, baseFlex, baseHorizontal, baseOutline } from "@/styles/base";

export const SORT_OPTIONS = [
    { value: "default" as const, labelKey: "sorting.dateAdded", icon: "time-outline" as const },
    { value: "alphabetic-asc" as const, labelKey: "sorting.nameAToZ", icon: "swap-vertical" as const },
    { value: "alphabetic-desc" as const, labelKey: "sorting.nameZToA", icon: "swap-vertical" as const },
    { value: "cost-asc" as const, labelKey: "sorting.amountLowToHigh", icon: "trending-down" as const },
    { value: "cost-desc" as const, labelKey: "sorting.amountHighToLow", icon: "trending-up" as const },
] as const;

export function SortModal({ visible, sortOption, onSelect, onClose, theme }: Readonly<SortModalProps>) {
    const { t } = useTranslation();

    const styles = useMemo(
        () =>
            StyleSheet.create({
                backdrop: {
                    ...baseFlex("center", "center"),
                    ...baseBlur,
                    flex: 1,
                    paddingHorizontal: 24,
                },
                sheet: {
                    ...baseBorder,
                    ...baseCorner,
                    width: "100%",
                    maxWidth: Platform.select({
                        ios: undefined,
                        android: undefined,
                        default: 600,
                    }),
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.borderColor,
                    paddingVertical: 8,
                },
                header: {
                    ...baseHorizontal,
                    paddingVertical: 12,
                    color: theme.label,
                },
                item: {
                    ...baseFlex("space-between", "center"),
                    ...baseOutline(theme),
                    ...baseHorizontal,
                    paddingVertical: 12,
                },
                itemDivider: {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.dividerColor,
                },
                itemLeft: {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                },
                cancel: {
                    ...baseOutline(theme),
                    ...baseHorizontal,
                    paddingVertical: 12,
                    alignItems: "center",
                },
            }),
        [theme],
    );

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <View style={styles.sheet}>
                    <ThemedText type="subtitle" style={styles.header}>
                        {t("sorting.sortBy")}
                    </ThemedText>
                    {SORT_OPTIONS.map((option, index) => (
                        <Pressable
                            key={option.value}
                            style={[styles.item, index < SORT_OPTIONS.length - 1 && styles.itemDivider]}
                            onPress={() => onSelect(option.value)}
                        >
                            <View style={styles.itemLeft}>
                                <Ionicons name={option.icon} size={18} color={theme.label} />
                                <ThemedText>{t(option.labelKey)}</ThemedText>
                            </View>
                            {sortOption === option.value && <Ionicons name="checkmark" size={18} color={linkColor} />}
                        </Pressable>
                    ))}
                    <Pressable style={styles.cancel} onPress={onClose}>
                        <ThemedText type="danger">{t("common.close")}</ThemedText>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}
