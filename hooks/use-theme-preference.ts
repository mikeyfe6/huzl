import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

const THEME_PREFERENCE_KEY = "@huzl_theme_preference";

export type ThemePreference = "light" | "dark" | "system";

type ThemeContextType = {
    preference: ThemePreference;
    colorScheme: "light" | "dark";
    updatePreference: (newPreference: ThemePreference) => void;
    isLoaded: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemColorScheme = useSystemColorScheme();
    const [preference, setPreference] = useState<ThemePreference>("system");
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved preference on mount
    useEffect(() => {
        AsyncStorage.getItem(THEME_PREFERENCE_KEY).then(
            (value: string | null) => {
                if (
                    value === "light" ||
                    value === "dark" ||
                    value === "system"
                ) {
                    setPreference(value);
                }
                setIsLoaded(true);
            }
        );
    }, []);

    // Save preference when it changes
    const updatePreference = (newPreference: ThemePreference) => {
        setPreference(newPreference);
        AsyncStorage.setItem(THEME_PREFERENCE_KEY, newPreference);
    };

    // Determine the actual color scheme to use
    const colorScheme = useMemo(
        () =>
            preference === "system" ? systemColorScheme ?? "light" : preference,
        [preference, systemColorScheme]
    );

    const value = useMemo(
        () => ({
            preference,
            colorScheme,
            updatePreference,
            isLoaded,
        }),
        [preference, colorScheme, isLoaded]
    );

    return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useThemePreference() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useThemePreference must be used within ThemeProvider");
    }
    return context;
}
