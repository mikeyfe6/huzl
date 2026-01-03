import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Modal, Platform, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors, linkColor } from "@/constants/theme";

import { baseBorder, baseFlex } from "@/styles/base";

type ThemeShape = (typeof Colors)[keyof typeof Colors];

export type SortOption = "default" | "alphabetic-asc" | "alphabetic-desc" | "cost-asc" | "cost-desc";

const SORT_OPTIONS: Array<{
    value: SortOption;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
}> = [
    { value: "default", label: "Default", icon: "time-outline" },
    { value: "alphabetic-asc", label: "A-Z", icon: "swap-vertical" },
    { value: "alphabetic-desc", label: "Z-A", icon: "swap-vertical" },
    { value: "cost-asc", label: "Cost ↑", icon: "trending-down" },
    { value: "cost-desc", label: "Cost ↓", icon: "trending-up" },
];

export const getSortLabel = (opt: SortOption): string => {
    const match = SORT_OPTIONS.find((o) => o.value === opt);
    return match ? match.label : "Default";
};

type SortModalProps = Readonly<{
    visible: boolean;
    sortOption: SortOption;
    onSelect: (opt: SortOption) => void;
    onRequestClose: () => void;
    theme: ThemeShape;
}>;

export function SortModal({ visible, sortOption, onSelect, onRequestClose, theme }: SortModalProps) {
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
                    width: "100%",
                    maxWidth: Platform.select({
                        ios: undefined,
                        android: undefined,
                        default: 600,
                    }),
                    borderRadius: 12,
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
                    borderBottomWidth: 1,
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
        [theme]
    );

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
            <View style={styles.backdrop}>
                <View style={styles.sheet}>
                    <ThemedText type="subtitle" style={styles.header}>
                        Sort by
                    </ThemedText>
                    {SORT_OPTIONS.map((option, index) => (
                        <TouchableOpacity
                            key={option.value}
                            style={[styles.item, index < SORT_OPTIONS.length - 1 && styles.itemDivider]}
                            onPress={() => onSelect(option.value)}
                        >
                            <View style={styles.itemLeft}>
                                <Ionicons name={option.icon} size={18} color={theme.label} />
                                <ThemedText>{option.label}</ThemedText>
                            </View>
                            {sortOption === option.value && <Ionicons name="checkmark" size={18} color={linkColor} />}
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.cancel} onPress={onRequestClose}>
                        <ThemedText type="danger">Cancel</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
