import { StyleSheet } from "react-native";

import { slateColor } from "@/constants/theme";
import {
    baseButton,
    baseButtonText,
    baseCard,
    baseEmpty,
    baseEmptyText,
    baseFieldset,
    baseFlex,
    baseGap,
    baseIcon,
    baseIcons,
    baseInput,
    baseLabel,
    baseList,
    baseMini,
    baseOpacity,
    baseSelect,
    baseSmall,
    baseWeight,
} from "@/styles/base";

export const getDebtsStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            paddingBottom: 24,
        },
        fieldset: {
            ...baseFieldset,
        },
        heading: {
            marginBottom: 16,
        },
        label: {
            ...baseLabel(theme),
        },
        input: {
            ...baseInput(theme),
            ...baseSelect,
        },
        buttons: {
            ...baseFlex("center"),
            ...baseGap,
            marginTop: 8,
        },
        button: {
            ...baseButton(theme),
        },
        buttonText: { ...baseButtonText },
        list: { ...baseList },
        header: {
            marginBottom: 12,
        },
        item: {
            ...baseCard(theme),
        },
        itemHeader: {
            ...baseFlex("space-between", "flex-start"),
            ...baseGap,
        },
        itemTitle: {
            flex: 1,
        },
        itemLabel: {
            ...baseWeight,
            ...baseSmall,
            opacity: 0.7,
            marginTop: 4,
        },
        itemIcons: {
            ...baseIcons,
        },
        itemIcon: {
            ...baseIcon(theme),
        },
        itemAmount: {
            ...baseFlex("space-between"),
            flexWrap: "wrap",
            gap: 4,
            paddingTop: 8,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: theme.dividerColor,
        },
        itemPayment: {
            ...baseMini,
            color: slateColor,
        },
        itemRemaining: {
            ...baseWeight,
            ...baseMini,
            ...baseOpacity,
        },
        paymentSection: {
            ...baseFlex("center"),
            ...baseGap,
            flexWrap: "wrap",
        },
        paymentInput: {
            ...baseInput(theme),
            ...baseSelect,
            flex: 2,
            minWidth: 150,
        },
        paymentButton: {
            ...baseButton(theme),
            minWidth: 100,
        },
        paymentButtonText: {
            ...baseButtonText,
        },
        emptyState: {
            ...baseEmpty,
        },
        emptyStateText: {
            ...baseEmptyText(theme),
        },
    });
