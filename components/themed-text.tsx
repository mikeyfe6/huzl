import { StyleSheet, Text, type TextProps } from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";

import { lightGreyColor, linkColor, redColor } from "@/constants/theme";
import { baseBold, baseSize } from "@/styles/base";

export type ThemedTextProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link" | "danger" | "label" | "logo" | "app";
};

export function ThemedText({ style, lightColor, darkColor, type = "default", ...rest }: ThemedTextProps) {
    const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

    return (
        <Text
            style={[
                { color },
                type === "default" ? styles.default : undefined,
                type === "title" ? styles.title : undefined,
                type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
                type === "subtitle" ? styles.subtitle : undefined,
                type === "link" ? styles.link : undefined,
                type === "app" ? styles.app : undefined,
                type === "danger" ? styles.danger : undefined,
                type === "label" ? styles.label : undefined,
                type === "logo" ? styles.logo : undefined,
                style,
            ]}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
    default: {
        ...baseSize,
        lineHeight: 24,
    },
    defaultSemiBold: {
        ...baseSize,
        ...baseBold,
        lineHeight: 24,
    },
    title: {
        ...baseBold,
        fontSize: 32,
        lineHeight: 32,
    },
    subtitle: {
        ...baseBold,
        fontSize: 20,
    },
    link: {
        ...baseSize,
        lineHeight: 30,
        color: linkColor,
        textDecorationLine: "underline",
    },
    app: {
        ...baseSize,
        ...baseBold,
        lineHeight: 30,
        color: linkColor,
    },
    danger: {
        ...baseSize,
        color: redColor,
    },
    label: {
        color: lightGreyColor,
    },
    logo: {
        fontFamily: "BebasNeue-Regular",
        fontSize: 128,
        paddingTop: 16,
    },
});
