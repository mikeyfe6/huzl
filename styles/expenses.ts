import { Platform, StyleSheet } from "react-native";

import {
    businessColor,
    careColor,
    entertainmentColor,
    familyColor,
    healthColor,
    housingColor,
    investColor,
    linkColor,
    mediumGreyColor,
    personalColor,
    petColor,
    slateColor,
    taxesColor,
    travelColor,
} from "@/constants/theme";
import {
    baseBold,
    baseBorder,
    baseButton,
    baseButtonText,
    baseCard,
    baseCenter,
    baseCorner,
    baseEmpty,
    baseEmptyText,
    baseFamily,
    baseFieldset,
    baseFlex,
    baseGap,
    baseHeight,
    baseHorizontal,
    baseIcon,
    baseIcons,
    baseInput,
    baseLabel,
    baseMini,
    baseOpacity,
    baseOutline,
    baseRadius,
    baseSelect,
    baseSeparation,
    baseSize,
    baseSmall,
    baseSpace,
    baseWeight,
} from "@/styles/base";

export const getExpensesStyles = (theme: any) =>
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
        categoryGroup: {
            ...baseFlex("center"),
            ...baseGap,
            flexWrap: "wrap",
        },
        categoryOption: {
            ...baseFlex("center", "center"),
            ...baseInput(theme),
            flex: 1,
            minWidth: 150,
        },
        categoryActive: {
            borderColor: linkColor,
            backgroundColor: theme.selectedTab,
        },
        select: {
            ...baseInput(theme),
            justifyContent: "center",
            overflow: Platform.select({
                ios: "hidden",
                android: "hidden",
                default: "visible",
            }),
            height: Platform.select({
                ios: 125,
                android: undefined,
                default: undefined,
            }),
        },
        selectInput: {
            ...baseInput(theme),
            ...baseFamily,
            borderWidth: 0,
            color: theme.inputText,
            height: Platform.select({
                ios: 216,
                android: 44,
                default: 44,
            }),
            paddingHorizontal: Platform.select({
                ios: 0,
                android: 0,
                default: 12,
            }),
            paddingVertical: Platform.select({
                ios: 0,
                android: 0,
                default: 10,
            }),
            minHeight: Platform.select({
                android: "100%",
            }),
        },
        selectOption: {
            ...baseSize,
            color: theme.inputText,
        },
        selectIcon: {
            position: "absolute",
            right: 12,
            top: "50%",
            marginTop: -9,
            pointerEvents: "none",
        },
        buttons: {
            ...baseFlex("center"),
            ...baseGap,
            marginTop: 8,
        },
        button: {
            ...baseButton(theme),
        },
        buttonText: {
            ...baseButtonText,
        },
        expenseHeader: {
            ...baseFlex("space-between", "center"),
            ...baseSpace,
            ...baseHorizontal,
            marginBottom: 16,
        },
        expenseTitle: {
            ...baseFlex("center", "center"),
            ...baseSpace,
        },
        expenseNumber: {
            ...baseSize,
            ...baseOpacity,
        },
        expenseSearch: {
            ...baseHorizontal,
            marginBottom: 16,
        },
        sortTrigger: {
            ...baseFlex("center", "center"),
            ...baseInput(theme),
            ...baseSpace,
            ...baseSelect,
        },
        sortTriggerText: {
            ...baseWeight,
            ...baseSmall,
            color: theme.label,
        },
        expenseAmounts: {
            ...baseFlex("center"),
            ...baseSpace,
        },
        expenseCard: {
            ...baseCard(theme),
        },
        expenseWrapper: {
            ...baseFlex("space-between", "flex-start"),
            ...baseGap,
        },
        expenseInfo: {
            flex: 1,
        },
        expenseLabel: {
            ...baseMini,
            opacity: 0.7,
        },
        expenseAmount: {
            ...baseWeight,
            ...baseMini,
        },
        expenseMeta: {
            ...baseFlex("flex-start", "center"),
            ...baseSpace,
            marginTop: 6,
        },
        badge: {
            ...baseBorder,
            ...baseCorner,
            ...baseCenter,
            paddingHorizontal: 8,
            opacity: 0.75,
            height: 22,
        },
        badgePersonal: {
            backgroundColor: personalColor + "50",
            borderColor: personalColor,
        },
        badgeBusiness: {
            backgroundColor: businessColor + "50",
            borderColor: businessColor,
        },
        badgeFamily: {
            backgroundColor: familyColor + "50",
            borderColor: familyColor,
        },
        badgeInvest: {
            backgroundColor: investColor + "50",
            borderColor: investColor,
        },
        badgeEntertainment: {
            backgroundColor: entertainmentColor + "50",
            borderColor: entertainmentColor,
        },
        badgeHousing: {
            backgroundColor: housingColor + "50",
            borderColor: housingColor,
        },
        badgeTaxes: {
            backgroundColor: taxesColor + "50",
            borderColor: taxesColor,
        },
        badgeTravel: {
            backgroundColor: travelColor + "50",
            borderColor: travelColor,
        },
        badgePet: {
            backgroundColor: petColor + "50",
            borderColor: petColor,
        },
        badgeCare: {
            backgroundColor: careColor + "50",
            borderColor: careColor,
        },
        badgeHealth: {
            backgroundColor: healthColor + "50",
            borderColor: healthColor,
        },
        badgeText: {
            ...baseWeight,
            fontSize: 11,
            lineHeight: 12,
            color: theme.text,
            opacity: 0.9,
        },
        expenseIcons: {
            ...baseIcons,
        },
        expenseIcon: {
            ...baseIcon(theme),
        },
        expenseTotal: {
            ...baseFlex("space-between", "center"),
            paddingTop: 12,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: theme.dividerColor,
        },
        expensePeriod: {
            ...baseMini,
            color: slateColor,
        },
        expenseYearly: { ...baseFlex("center") },
        expenseYearlyLabel: {
            ...baseMini,
            opacity: 0.8,
            color: theme.text,
        },
        expenseYearlyValue: { ...baseWeight, ...baseSmall, color: theme.text },
        expenseMonthly: {
            ...baseFlex("center"),
        },
        expenseMonthlyLabel: {
            ...baseMini,
            opacity: 0.8,
            color: mediumGreyColor,
        },
        expenseMonthlyValue: { ...baseWeight, ...baseSmall, color: mediumGreyColor },
        totalSection: {
            ...baseBorder,
            ...baseSpace,
            ...baseRadius,
            ...baseHorizontal,
            backgroundColor: theme.background,
            margin: 16,
            paddingVertical: 20,
            flex: 1,
            borderColor: theme.inputBorder,
        },
        totalTitle: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.dividerColor,
            paddingBottom: 12,
        },
        totalContent: { display: "flex", alignItems: "center" },
        totalLabel: { minWidth: 150 },
        totalDetails: {
            ...baseFlex("space-between", "center"),
            ...baseHorizontal,
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 16,
        },
        totalDots: {
            width: 10,
            height: 10,
            borderRadius: 25,
            marginRight: 8,
            opacity: 0.75,
        },
        totalInline: {
            ...baseBold,
            paddingLeft: 8,
        },
        totalPeriod: {
            marginHorizontal: 0,
            marginTop: 0,
            marginBottom: 0,
            minWidth: 175,
            alignSelf: "stretch",
        },
        totalAmount: {
            ...baseBold,
            lineHeight: 40,
        },
        chartContainer: {
            ...baseFlex("center", "flex-start"),
            ...baseHorizontal,
            backgroundColor: theme.background,
            flexWrap: "wrap",
            paddingVertical: 32,
            rowGap: 24,
            columnGap: 64,
        },
        chartStats: {
            ...baseSeparation,
            width: "100%",
            maxWidth: 900,
            minWidth: 300,
            marginVertical: 8,
            flex: 1,
        },
        chartButtons: {
            ...baseFlex("center"),
            ...baseGap,
            flexWrap: "wrap",
        },
        chartButton: {
            ...baseFlex("space-between", "center"),
            ...baseOutline(theme),
            ...baseRadius,
            ...baseBorder,
            ...baseHeight,
            flex: 1,
            flexBasis: 250,
            paddingHorizontal: 18,
        },
        chartButtonDot: {
            width: 12,
            height: 12,
            borderRadius: 25,
            opacity: 0.75,
        },
        chartButtonText: { ...baseWeight },
        chartButtonLabel: {
            ...baseSmall,
            color: theme.statLabel,
        },
        chartItems: {
            ...baseFlex("center", "center"),
            flexWrap: "wrap",
            rowGap: 10,
            columnGap: 8,
        },
        chartItem: {
            ...baseRadius,
            paddingHorizontal: 12,
            paddingTop: 3,
            paddingBottom: 4,
            opacity: 0.75,
            backgroundColor: theme.dividerColor,
            borderColor: theme.borderColor,
        },
        chartItemText: {
            ...baseWeight,
        },
        chartItemLabel: {
            ...baseMini,
            color: theme.statLabel,
        },
        emptyState: {
            ...baseEmpty,
        },
        emptyStateText: {
            ...baseEmptyText(theme),
        },
    }) as Record<string, any>;
