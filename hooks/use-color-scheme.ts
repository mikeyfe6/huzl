import { useThemePreference } from "./use-theme-preference";

export function useColorScheme() {
    const { colorScheme } = useThemePreference();
    return colorScheme;
}

export { ThemeProvider } from "./use-theme-preference";
