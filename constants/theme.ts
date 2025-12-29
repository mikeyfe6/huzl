/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

export const linkColor = "#0a7ea4";
export const whiteColor = "#fff";
export const blackColor = "#000";
export const greenColor = "#4caf50";
export const redColor = "#f44336";
export const blueColor = "#0c86c5";
export const copperColor = "#aa6600";
export const goldColor = "#d1982eff";

export const greenLightColor = "#4caf5080";
export const redLightColor = "#f4433680";
export const greenDarkColor = "#4caf5050";
export const redDarkColor = "#f4433650";
export const copperDarkColor = "#a0600075";
export const goldDarkColor = "#da902290";
export const linkDarkColor = "#0a7ea490";

export const almostWhiteColor = "#f5f5f5";
export const lightGreyColor = "#ddd";
export const mediumGreyColor = "#999";
export const darkGreyColor = "#666";
export const veryDarkGreyColor = "#333";
export const almostBlackColor = "#2a2a2a";
export const nearBlackColor = "#1a1a1a";
export const charcoalColor = "#151718";
export const lightTextColor = "#ecedee";
export const slateColor = "#687076";
export const silverColor = "#9ba1a6";

export const Colors = {
    light: {
        text: charcoalColor,
        background: whiteColor,
        tint: linkColor,
        icon: slateColor,

        cardPositiveBackground: greenLightColor,
        cardNegativeBackground: redLightColor,
        statLabel: darkGreyColor,

        specialLabel: copperColor,
        selectedTab: whiteColor,

        dailyTab: linkDarkColor,
        monthlyTab: goldDarkColor,
        yearlyTab: greenLightColor,

        cardBackground: lightTextColor,
        inputBackground: whiteColor,
        inputBorder: lightGreyColor,
        inputText: nearBlackColor,
        label: nearBlackColor,
        placeholder: mediumGreyColor,
        emptyStateText: darkGreyColor,
        borderColor: lightGreyColor,
        dividerColor: "rgba(0,0,0,0.1)",
    },
    dark: {
        text: lightTextColor,
        background: charcoalColor,
        tint: linkColor,
        icon: silverColor,

        cardPositiveBackground: greenDarkColor,
        cardNegativeBackground: redDarkColor,
        statLabel: silverColor,

        dailyTab: linkDarkColor,
        monthlyTab: copperDarkColor,
        yearlyTab: greenDarkColor,

        specialLabel: goldColor,
        selectedTab: almostBlackColor,

        cardBackground: almostBlackColor,
        inputBackground: almostBlackColor,
        inputBorder: veryDarkGreyColor,
        inputText: whiteColor,
        label: whiteColor,
        placeholder: darkGreyColor,
        emptyStateText: mediumGreyColor,
        borderColor: veryDarkGreyColor,
        dividerColor: "rgba(255,255,255,0.1)",
    },
};

export const Fonts = Platform.select({
    ios: {
        /** iOS `UIFontDescriptorSystemDesignDefault` */
        sans: "system-ui",
        /** iOS `UIFontDescriptorSystemDesignSerif` */
        serif: "ui-serif",
        /** iOS `UIFontDescriptorSystemDesignRounded` */
        rounded: "ui-rounded",
        /** iOS `UIFontDescriptorSystemDesignMonospaced` */
        mono: "ui-monospace",
    },
    default: {
        sans: "normal",
        serif: "serif",
        rounded: "normal",
        mono: "monospace",
    },
    web: {
        sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        serif: "Georgia, 'Times New Roman', serif",
        rounded:
            "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
        mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
});
