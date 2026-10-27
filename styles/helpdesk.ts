import { Platform, StyleSheet } from "react-native";

import { redColor, silverColor } from "@/constants/theme";
import {
    baseBlue,
    baseButton,
    baseButtonText,
    baseCard,
    baseEmpty,
    baseEmptyText,
    baseFamily,
    baseFieldset,
    baseFlex,
    baseGreen,
    baseHorizontal,
    baseIcon,
    baseInput,
    baseLabel,
    baseList,
    baseMini,
    basePadding,
    baseSelect,
    baseSemiBold,
    baseSize,
    baseSpace,
} from "./base";

export const getHelpdeskStyles = (theme: any) =>
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
        subtitle: {
            color: silverColor,
            fontSize: 18,
        },
        email: {
            ...baseSemiBold,
        },
        or: {
            marginTop: 16,
        },
        login: {
            ...baseHorizontal,
        },
        loginText: {
            ...baseEmptyText(theme),
        },
        loginButton: {
            ...baseButton(),
            ...baseBlue,
            marginTop: 4,
        },
        loginButtonText: {
            ...baseButtonText,
        },
        label: {
            ...baseLabel(theme),
        },
        select: {
            ...baseInput(theme),
            ...baseSelect,
        },
        selectInput: {
            ...baseFamily,
            ...baseInput(theme),
            borderWidth: 0,
            color: theme.inputText,
            height: Platform.select({
                ios: 216,
                default: 44,
            }),
            paddingHorizontal: Platform.select({
                ios: 0,
                default: 12,
            }),
            paddingVertical: Platform.select({
                ios: 0,
                default: 10,
            }),
        },
        selectInputAndroid: { height: 56, color: theme.inputText },
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
        input: {
            ...baseInput(theme),
            ...basePadding,
            height: 100,
            textAlignVertical: "top",
        },
        button: {
            ...baseButton(),
            ...baseGreen,
            marginTop: 8,
        },
        buttonText: { ...baseButtonText },
        list: { ...baseList },
        header: {
            marginBottom: 8,
        },
        item: {
            ...baseFlex("space-between", "flex-start"),
            ...baseCard(theme),
        },
        icon: {
            ...baseIcon,
            borderColor: redColor,
        },
        itemContent: {
            ...baseSpace,
            flex: 1,
        },
        time: {
            ...baseMini,
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
