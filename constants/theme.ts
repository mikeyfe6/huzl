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
export const greenAlphaColor = "#133d2f";
export const redAlphaColor = "#3d1b1b";
export const blueColor = "#0c86c5";
export const goldColor = "#FAAF41";

export const almostWhiteColor = "#f5f5f5";
export const lightGreyColor = "#ddd";
export const mediumGreyColor = "#999";
export const darkGreyColor = "#666";
export const veryDarkGreyColor = "#333";
export const almostBlackColor = "#2a2a2a";
export const nearBlackColor = "#1a1a1a";
export const charcoalColor = "#151718";
export const onyxColor = "#11181C";
export const lightTextColor = "#ecedee";
export const slateColor = "#687076";
export const silverColor = "#9ba1a6";

export const Colors = {
    light: {
        text: onyxColor,
        background: whiteColor,
        tint: linkColor,
        icon: slateColor,
        tabIconDefault: slateColor,
        tabIconSelected: linkColor,

        // Add your expense screen colors
        screenBackground: almostWhiteColor,
        cardBackground: whiteColor,
        inputBackground: whiteColor,
        inputBorder: lightGreyColor,
        inputText: blackColor,
        label: blackColor,
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
        tabIconDefault: silverColor,
        tabIconSelected: linkColor,

        // Add your expense screen colors
        screenBackground: nearBlackColor,
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
