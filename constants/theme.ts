/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

export const linkColor = "#1E95C8";
export const whiteColor = "#fff";
export const blackColor = "#000";
export const greenColor = "#4caf50";
export const redColor = "#f44336";
export const blueColor = "#0c86c5";
export const copperColor = "#aa6600";
export const goldColor = "#F7B900";
export const orangeColor = "#F49E0B";
export const fuchsiaColor = "#bd38d5ff";
export const steelColor = "#819fd2ff";

export const greenLightColor = "#4caf5080";
export const redLightColor = "#f4433680";
export const greenDarkColor = "#4caf5050";
export const redDarkColor = "#f4433650";

export const personalColor = "#d1d1d1";
export const businessColor = "#ffd044";
export const familyColor = "#599edb";
export const investColor = "#5AC4C9";
export const entertainmentColor = "#865ab9";
export const housingColor = "#F09C0B";
export const taxesColor = "#7F8EAF";
export const travelColor = "#E44946";
export const petColor = "#BD6C3B";
export const careColor = "#d9b495";
export const healthColor = "#88B93E";

export const lightGreyColor = "#ddd";
export const mediumGreyColor = "#999";
export const darkGreyColor = "#666";
export const veryDarkGreyColor = "#333";
export const almostBlackColor = "#2a2a2a";
export const charcoalColor = "#151718";
export const lightTextColor = "#ecedee";
export const smokeColor = "#f1f1f1";
export const slateColor = "#687076";
export const silverColor = "#9ba1a6";

// alternative theme colors; #F28B60, #22D6CB, #F3BB65
// rgba(24,150,103) which hex is #189667

export const Colors = {
    light: {
        text: almostBlackColor,
        background: whiteColor,
        tint: linkColor,
        icon: slateColor,
        focus: charcoalColor,
        main: smokeColor,

        cardPositiveBackground: greenLightColor,
        cardNegativeBackground: redLightColor,
        statLabel: darkGreyColor,

        selectedTab: whiteColor,

        cardBackground: lightTextColor,
        inputBackground: whiteColor,
        inputBorder: lightGreyColor,
        inputText: almostBlackColor,
        inputIcon: "light" as const,
        label: almostBlackColor,
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
        focus: "transparent" as const,
        main: blackColor,

        cardPositiveBackground: greenDarkColor,
        cardNegativeBackground: redDarkColor,
        statLabel: silverColor,

        selectedTab: almostBlackColor,

        cardBackground: almostBlackColor,
        inputBackground: almostBlackColor,
        inputBorder: veryDarkGreyColor,
        inputText: whiteColor,
        inputIcon: "dark" as const,
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
        rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
        mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
});
