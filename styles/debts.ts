import { StyleSheet } from "react-native";

import { redColor, slateColor, whiteColor } from "@/constants/theme";
import {
    baseBlur,
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
    baseGreen,
    baseHeight,
    baseIcon,
    baseIcons,
    baseInput,
    baseLabel,
    baseList,
    baseMini,
    baseOpacity,
    baseRadius,
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
            flex: 1,
        },
        dateWrapper: {
            ...baseFlex("center"),
            ...baseGap,
        },
        dateWrapperMob: {
            ...baseFlex("center"),
            ...baseGap,
        },
        dateInput: {
            ...baseInput(theme),
            ...baseFamily,
            borderStyle: "solid",
            paddingLeft: 12,
            paddingRight: 12,
            height: 44,
            flex: 1,
        },
        cancel: {
            ...baseCenter,
            ...baseRadius,
            ...baseHeight,
            backgroundColor: redColor,
            color: whiteColor,
            width: 44,
            borderWidth: 0,
        },
        modal: { ...baseBlur, flex: 1, justifyContent: "center" },
        datepicker: {
            ...baseCorner,
            ...baseCenter,
            backgroundColor: theme.inputBackground,
            margin: 24,
            padding: 16,
            height: 300,
        },
        saveButton: {
            ...baseButton(theme),
            ...baseGreen,
            width: "100%",
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
            ...baseFlex("center", "center"),
            gap: 4,
        },
        itemPaymentText: {
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
