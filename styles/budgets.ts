import { StyleSheet } from "react-native";

import { blueColor } from "@/constants/theme";
import {
    baseButton,
    baseButtonText,
    baseCard,
    baseEmpty,
    baseEmptyText,
    baseFieldset,
    baseFlex,
    baseGap,
    baseHorizontal,
    baseIcon,
    baseIcons,
    baseInput,
    baseLabel,
    baseSelect,
    baseSmall,
    baseSpace,
    baseWeight,
} from "@/styles/base";

export const getBudgetsStyles = (theme: any) =>
    StyleSheet.create({
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
            backgroundColor: blueColor,
        },
        buttonText: {
            ...baseButtonText,
        },
        budgetHeader: {
            ...baseHorizontal,
            marginTop: 8,
            marginBottom: 32,
        },
        budgetCard: {
            ...baseCard(theme),
        },
        budgetSelected: {
            borderColor: blueColor,
            backgroundColor: theme.cardBackground,
        },
        budgetTitle: {
            ...baseFlex("space-between", "flex-start"),
            ...baseGap,
        },
        budgetAmount: {
            ...baseSmall,
            opacity: 0.8,
            color: theme.label,
        },
        budgetInline: {
            ...baseWeight,
        },
        budgetIcons: {
            ...baseIcons,
        },
        budgetIcon: {
            ...baseIcon(theme),
        },
        progressBar: {
            height: 8,
            backgroundColor: theme.inputBorder,
            borderRadius: 4,
            overflow: "hidden",
            marginTop: 4,
        },
        progressFill: {
            height: "100%",
            backgroundColor: blueColor,
        },
        expenseHeader: {
            marginBottom: 4,
        },
        expenseRemaining: {
            ...baseWeight,
            marginBottom: 12,
            color: theme.label,
        },
        expenseList: {
            marginTop: 20,
            marginBottom: 10,
        },
        expenseItem: {
            ...baseFlex("space-between", "center"),
            ...baseCard(theme),
        },
        expenseInfo: {
            ...baseSpace,
            flex: 1,
        },
        expenseLabel: {
            ...baseSmall,
            opacity: 0.7,
            color: theme.label,
        },
        emptyState: {
            ...baseEmpty,
        },
        emptyStateText: {
            ...baseEmptyText(theme),
        },
    });
