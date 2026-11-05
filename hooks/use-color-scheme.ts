import { useThemePreference } from "@/hooks/use-theme-preference";

export function useColorScheme() {
    const { colorScheme } = useThemePreference();
    return colorScheme;
}

export { ThemeProvider } from "@/hooks/use-theme-preference";
