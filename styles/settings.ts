import { StyleSheet } from "react-native";

import { linkColor, mediumGreyColor, redColor, silverColor, whiteColor } from "@/constants/theme";
import {
    baseBlank,
    baseButton,
    baseButtonText,
    baseCenter,
    baseFieldset,
    baseFlex,
    baseGap,
    baseGreen,
    baseInput,
    baseMedium,
    basePadding,
    baseSemiBold,
    baseSmall,
    baseSpace,
} from "./base";

export const getSettingsStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            paddingBottom: 24,
        },
        wrapper: {
            ...baseFieldset,
        },
        heading: {
            marginBottom: 16,
        },
        settingTitle: {
            ...baseSemiBold,
            marginTop: 8,
            marginBottom: 8,
            color: silverColor,
        },
        settingItem: {
            paddingTop: 12,
            paddingBottom: 20,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.dividerColor,
        },
        settingItemNoBorder: {
            borderBottomWidth: 0,
        },
        settingItemLessPadding: {
            paddingBottom: 8,
        },
        settingLabel: {
            ...baseSemiBold,
            ...baseSmall,
            color: theme.label,
            marginBottom: 12,
        },
        settingBox: {
            ...baseFlex("space-between", "center"),
        },
        settingWrapper: {
            ...baseGap,
            flexDirection: "row",
        },
        settingLink: {
            color: linkColor,
            marginBottom: 0,
        },
        settingLabelNoMargin: {
            marginBottom: 0,
        },
        settingValue: {
            ...baseSmall,
            color: theme.placeholder,
        },
        input: {
            ...baseInput(theme),
            ...basePadding,
        },
        saveButton: {
            ...baseButton(),
            ...baseGreen,
        },
        saveButtonText: {
            ...baseButtonText,
            color: whiteColor,
        },
        passwordButton: {
            ...baseButton(),
            marginTop: 16,
            borderColor: mediumGreyColor,
        },
        passwordButtonText: {
            ...baseButtonText,
            color: theme.text,
        },
        hr: {
            borderBottomColor: theme.dividerColor,
            borderBottomWidth: StyleSheet.hairlineWidth,
            marginTop: 16,
        },
        themeButton: {
            ...baseInput(theme),
            ...baseCenter,
            flex: 1,
        },
        themeButtonActive: {
            backgroundColor: linkColor,
            borderColor: linkColor,
        },
        themeButtonText: {
            color: theme.text,
        },
        themeButtonTextActive: {
            ...baseSemiBold,
            color: whiteColor,
        },
        linksContainer: {
            ...baseCenter,
            ...baseSpace,
            marginVertical: 12,
        },
        linksApps: {
            ...baseFlex("center", "center"),
            rowGap: 4,
            columnGap: 16,
            flexWrap: "wrap",
        },
        linksApp: {
            display: "flex",
            ...baseFlex("center", "center"),
            ...baseBlank,
        },
        linksWrapper: {
            ...baseFlex("center", "center"),
            ...baseGap,
        },
        linkText: {
            ...baseSmall,
        },
        poweredBy: {
            marginTop: 24,
        },
        poweredByText: {
            ...baseMedium,
            fontSize: 12,
            color: mediumGreyColor,
        },
        logOutButton: {
            ...baseButton(),
            borderColor: redColor,
        },
        logOutButtonText: {
            ...baseButtonText,
            color: redColor,
        },
    });
