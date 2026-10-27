import { Platform, StyleSheet } from "react-native";

import { greenColor, mediumGreyColor, orangeColor, redColor, whiteColor } from "@/constants/theme";
import {
    baseBlank,
    baseBold,
    baseBorder,
    baseButton,
    baseCenter,
    baseCorner,
    baseError,
    baseFlex,
    baseGap,
    baseHeight,
    baseHorizontal,
    baseInput,
    baseLarge,
    baseMedium,
    baseMini,
    basePadding,
    baseSemiBold,
    baseSmall,
    baseSpace,
    baseSuccess,
} from "@/styles/base";

export const getIndexStyles = (theme: any) =>
    StyleSheet.create({
        logo: { ...baseFlex("center", "center"), ...baseSpace, marginBottom: 16, pointerEvents: "none" },
        image: {
            maxWidth: 100,
            height: 100,
        },
        container: {
            ...baseCenter,
            ...baseSpace,
            flex: 1,
            padding: 16,
        },
        text: {
            marginTop: 8,
        },
        fieldset: {
            ...baseGap,
            width: "100%",
            marginTop: 16,
            maxWidth: 500,
            marginBottom: 32,
        },
        input: {
            ...baseInput(theme),
            ...basePadding,
            color: theme.inputText,
        },
        signInButton: {
            ...baseButton(theme),
            backgroundColor: greenColor,
            borderColor: greenColor,
        },
        signInText: {
            ...baseSemiBold,
            color: whiteColor,
        },
        signUpButton: {
            ...baseButton(theme),
            ...baseSemiBold,
            borderColor: mediumGreyColor,
        },
        signUpText: {
            ...baseSemiBold,
        },
        forgetButton: {
            ...baseFlex("center", "center"),
            ...baseHeight,
        },
        forgetButtonText: {
            ...baseSmall,
            ...baseSemiBold,
            textAlign: "center",
            color: mediumGreyColor,
        },
        termsText: {
            color: mediumGreyColor,
            marginHorizontal: "auto",
            textAlign: "center",
            maxWidth: "90%",
            lineHeight: Platform.select({
                ios: 26,
                android: 26,
                default: 12,
            }),
            fontSize: Platform.select({
                ios: 14,
                android: 14,
                default: 12,
            }),
        },
        termsLink: {
            fontSize: Platform.select({
                ios: 14,
                android: 14,
                default: 12,
            }),
        },
        poweredBy: {
            ...baseFlex("center", "center"),
        },
        poweredByText: {
            fontSize: 12,
            color: mediumGreyColor,
        },
        appContainer: {
            ...baseFlex("center", "center"),
            rowGap: 4,
            columnGap: 16,
            flexWrap: "wrap",
        },
        appLink: {
            display: "flex",
            ...baseFlex("center", "center"),
            ...baseBlank,
        },
        errorContainer: { ...baseCenter, ...baseHeight },
        errorText: {
            ...baseError,
        },
        successText: {
            ...baseSuccess,
        },
        errorHidden: {
            opacity: 0,
        },
        user: {
            color: mediumGreyColor,
        },
        terminate: {
            ...baseError,
        },
        statsContainer: {
            ...baseGap,
            width: "100%",
            maxWidth: 500,
            marginTop: 24,
            marginBottom: 16,
        },
        statCard: {
            ...baseSpace,
            ...baseCorner,
            ...baseHorizontal,
            paddingTop: 14,
            paddingBottom: 16,
            backgroundColor: theme.cardBackground,
        },
        statLabel: {
            ...baseSmall,
            color: theme.statLabel,
            textAlign: "center",
        },
        statAverage: {
            ...baseLarge,
            ...baseMedium,
            color: greenColor,
        },
        statWrapper: {
            ...baseFlex("center", "center"),
            ...baseBlank,
        },
        statValue: {
            ...baseLarge,
            ...baseBold,
            textAlign: "center",
        },
        statCardPositive: {
            backgroundColor: theme.cardPositiveBackground,
        },
        statCardNegative: {
            backgroundColor: theme.cardNegativeBackground,
        },
        nextDetails: {
            ...baseGap,
            marginTop: 12,
        },
        nextDebt: {
            ...baseFlex("center", "center"),
            ...baseBlank,
            flexWrap: "wrap",
        },
        nextDebtIntro: {
            ...baseMini,
            color: orangeColor,
            textAlign: "center",
        },
        nextDebtBadge: {
            ...baseCenter,
            ...baseBorder,
            backgroundColor: orangeColor + "50",
            borderColor: orangeColor,
            borderRadius: 10,
            paddingHorizontal: 6,
            marginLeft: 2,
            opacity: 0.9,
            height: 18,
        },
        nextDebtExtra: {
            ...baseMedium,
            color: orangeColor,
            marginLeft: 2,
            fontSize: 11,
        },
        nextDebtDate: {
            ...baseMedium,
            fontSize: 10,
        },
        nextIncome: {
            ...baseFlex("center", "center"),
            ...baseBlank,
            flexWrap: "wrap",
        },
        nextIncomeBadge: {
            ...baseCenter,
            ...baseBorder,
            backgroundColor: greenColor + "50",
            borderColor: greenColor,
            borderRadius: 10,
            paddingHorizontal: 6,
            marginLeft: 2,
            opacity: 0.9,
            height: 18,
        },
        nextIncomeDate: {
            ...baseMedium,
            fontSize: 10,
        },
        nextIncomeIntro: {
            ...baseMini,
            color: greenColor,
            textAlign: "center",
        },
        overdueDebts: {
            ...baseMini,
            ...baseBold,
            color: redColor,
            textAlign: "center",
        },
    });
