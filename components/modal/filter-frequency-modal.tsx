import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { linkColor } from "@/constants/theme";
import { baseBlur, baseBorder, baseCorner, baseFlex, baseHorizontal, baseOutline, baseSpace } from "@/styles/base";

export function FilterFrequencyModal({
    visible,
    frequencies,
    selected,
    onSelect,
    onClose,
    theme,
}: Readonly<FilterFrequencyModalProps>) {
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
                    ...baseFlex("center", "center"),
                    ...baseSpace,
                },
                cancel: {
                    ...baseFlex("center"),
                    ...baseOutline(theme),
                    ...baseHorizontal,
                    paddingVertical: 12,
                },
            }),
        [theme],
    );

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <View style={styles.sheet}>
                    <ThemedText type="subtitle" style={styles.header}>
                        {t("filtering.filterBy")}
                    </ThemedText>

                    <Pressable
                        key="reset"
                        style={[styles.item, frequencies.length > 0 && styles.itemDivider]}
                        onPress={() => onSelect(null)}
                    >
                        <View style={styles.itemLeft}>
                            <Ionicons name="close" size={18} color={theme.label} />
                            <ThemedText>{t("filtering.resetFilter")}</ThemedText>
                        </View>
                    </Pressable>
                    {frequencies.map((freq, index) => (
                        <Pressable
                            key={freq}
                            style={[styles.item, index < frequencies.length - 1 && styles.itemDivider]}
                            onPress={() => onSelect(freq)}
                        >
                            <View style={styles.itemLeft}>
                                <Ionicons name="repeat" size={18} color={theme.label} />
                                <ThemedText>{t(`expenses.frequency.${freq}`)}</ThemedText>
                            </View>
                            {selected === freq && <Ionicons name="checkmark" size={18} color={linkColor} />}
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
