import { StyleSheet } from "react-native";

import { blueColor, greenColor, redColor, silverColor } from "@/constants/theme";
import {
    baseBlank,
    baseBlur,
    baseBorder,
    baseButton,
    baseButtonText,
    baseCenter,
    baseCorner,
    baseFamily,
    baseFieldset,
    baseFlex,
    baseGap,
    baseGreen,
    baseIcon,
    baseInput,
    baseMedium,
    baseModal,
    basePadding,
    baseRed,
    baseSemiBold,
    baseSize,
    baseSmall,
    baseSpace,
} from "@/styles/base";

export const getIncomeStyles = (theme: any) =>
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
            marginBottom: 24,
        },
        label: {
            marginBottom: 12,
        },
        wrapper: {
            ...baseFlex("center", "center"),
        },
        item: {
            ...baseBorder,
            ...basePadding,
            flex: 1,
            borderColor: theme.inputBorder,
            borderRadius: 6,
        },
        nameRow: {
            ...baseFlex("space-between", "center"),
            ...baseGap,
            paddingTop: 6,
            paddingBottom: 12,
        },
        nameInput: {
            flex: 1,
        },
        nextDate: {
            ...baseFlex("center", "center"),
            gap: 6,
        },
        nextDateLabel: {
            ...baseSmall,
            color: theme.statLabel,
        },
        amountRow: {
            ...baseFlex("space-between", "center"),
            ...baseGap,
            flexWrap: "wrap",
            paddingVertical: 12,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: theme.inputBorder,
        },
        variableAverage: {
            ...baseFlex("flex-start", "center"),
            ...baseBlank,
            minWidth: 150,
        },
        input: {
            ...baseSize,
            ...baseSemiBold,
            color: theme.text,
            outlineWidth: 0,
        },
        amountInput: {
            flex: 1,
        },
        variableToggle: {
            ...baseFlex("center", "center"),
            gap: 6,
        },
        variableLabel: {
            ...baseSmall,
        },
        category: {
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: theme.inputBorder,
            paddingVertical: 10,
        },
        frequency: {
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: theme.inputBorder,
            paddingTop: 10,
        },
        type: {
            ...baseBorder,
            borderRadius: 7,
            paddingHorizontal: 14,
            paddingVertical: 5,
            borderColor: theme.inputBorder,
        },
        typeText: { ...baseSmall },
        icons: {
            ...baseGap,
            ...baseCenter,
            flexDirection: "column",
            marginLeft: 16,
        },
        icon: {
            ...baseIcon,
        },
        add: {
            ...baseFlex("flex-start", "center"),
            alignSelf: "flex-start",
            marginTop: 8,
            marginBottom: 6,
            padding: 4,
        },
        addText: {
            ...baseSemiBold,
            color: greenColor,
        },
        total: {
            ...baseFlex("space-between", "center"),
            ...baseCorner,
            fontSize: 18,
            backgroundColor: theme.cardBackground,
            padding: 16,
        },
        totalAverage: {
            ...baseSmall,
            color: blueColor,
            marginLeft: 2,
        },
        buttons: {
            ...baseFlex("center", "center"),
            ...baseGap,
            marginTop: 12,
        },
        saveButton: {
            ...baseButton(),
            ...baseGreen,
        },
        saveButtonText: {
            ...baseButtonText,
        },
        closeButton: {
            ...baseButton(),
            ...baseRed,
        },
        closeButtonText: {
            ...baseButtonText,
        },
        overlay: {
            ...baseFlex("center", "center"),
            ...baseBlur,
            flex: 1,
        },
        pickerOverlay: {
            ...baseFlex("center", "center"),
            ...baseBlur,
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        },
        modal: {
            ...baseModal(theme, 550),
            maxHeight: "75%",
        },
        header: {
            ...baseFlex("space-between", "center"),
            marginBottom: 12,
        },
        paymentInput: {
            ...baseInput(theme, 42),
            ...basePadding,
            marginBottom: 12,
        },
        dateInput: {
            ...baseInput(theme),
            ...baseFamily,
            borderStyle: "solid",
            paddingLeft: 12,
            paddingRight: 12,
            flex: 1,
        },
        paymentList: {
            marginVertical: 16,
        },
        noPayments: {
            ...baseSmall,
            textAlign: "center",
            color: redColor,
        },
        paymentRow: {
            ...baseFlex("space-between", "center"),
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.inputBorder,
            paddingVertical: 10,
        },
        paymentAmountIcons: {
            ...baseFlex("center", "center"),
            ...baseSpace,
        },
        paymentAmount: {
            marginRight: 8,
        },
        averageText: {
            ...baseMedium,
            ...baseSmall,
            marginTop: 8,
        },
        averageDescription: {
            ...baseSmall,
            marginTop: 4,
            color: silverColor,
        },
        datePicker: {
            ...baseCorner,
            ...baseCenter,
            backgroundColor: theme.inputBackground,
            margin: 24,
            padding: 16,
            height: 300,
        },
        paymentActions: {
            ...baseFlex("center", "center"),
            ...baseGap,
            marginTop: 8,
        },
        paymentAction: {
            flex: 1,
        },
    });
