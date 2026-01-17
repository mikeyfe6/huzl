import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Platform, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

import { Colors, linkColor } from "@/constants/theme";
import { baseBorder, baseCorner, baseFlex } from "@/styles/base";

type ThemeShape = (typeof Colors)[keyof typeof Colors];

export type SortOption = "default" | "alphabetic-asc" | "alphabetic-desc" | "cost-asc" | "cost-desc";

export const SORT_OPTIONS = [
    { value: "default" as const, labelKey: "sorting.dateAdded", icon: "time-outline" as const },
    { value: "alphabetic-asc" as const, labelKey: "sorting.nameAToZ", icon: "swap-vertical" as const },
    { value: "alphabetic-desc" as const, labelKey: "sorting.nameZToA", icon: "swap-vertical" as const },
    { value: "cost-asc" as const, labelKey: "sorting.amountLowToHigh", icon: "trending-down" as const },
    { value: "cost-desc" as const, labelKey: "sorting.amountHighToLow", icon: "trending-up" as const },
] as const;

type SortModalProps = Readonly<{
    visible: boolean;
    sortOption: SortOption;
    onSelect: (opt: SortOption) => void;
    onRequestClose: () => void;
    theme: ThemeShape;
}>;

export function SortModal({ visible, sortOption, onSelect, onRequestClose, theme }: SortModalProps) {
    const { t } = useTranslation();

    const styles = useMemo(
        () =>
            StyleSheet.create({
                backdrop: {
                    ...baseFlex("center", "center"),
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.4)",
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
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    color: theme.label,
                },
                item: {
                    ...baseFlex("space-between", "center"),
                    paddingHorizontal: 16,
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
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    alignItems: "center",
                },
            }),
        [theme],
    );

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
            <View style={styles.backdrop}>
                <View style={styles.sheet}>
                    <ThemedText type="subtitle" style={styles.header}>
                        {t("sorting.sortBy")}
                    </ThemedText>
                    {SORT_OPTIONS.map((option, index) => (
                        <TouchableOpacity
                            key={option.value}
                            style={[styles.item, index < SORT_OPTIONS.length - 1 && styles.itemDivider]}
                            onPress={() => onSelect(option.value)}
                        >
                            <View style={styles.itemLeft}>
                                <Ionicons name={option.icon} size={18} color={theme.label} />
                                <ThemedText>{t(option.labelKey)}</ThemedText>
                            </View>
                            {sortOption === option.value && <Ionicons name="checkmark" size={18} color={linkColor} />}
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.cancel} onPress={onRequestClose}>
                        <ThemedText type="danger">{t("sorting.cancel")}</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
