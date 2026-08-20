import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/utils/supabase";

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
    const { user, refreshUser } = useAuth();
    const [preference, setPreference] = useState<ThemePreference>("system");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadPreference = async () => {
            const localValue = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
            if (!cancelled && (localValue === "light" || localValue === "dark" || localValue === "system")) {
                setPreference(localValue);
            }

            if (user) {
                const { data } = await supabase.auth.getUser();
                const cloudValue = data.user?.user_metadata?.theme;
                if (!cancelled && (cloudValue === "light" || cloudValue === "dark" || cloudValue === "system")) {
                    setPreference(cloudValue);
                    await AsyncStorage.setItem(THEME_PREFERENCE_KEY, cloudValue);
                }
            }

            if (!cancelled) setIsLoaded(true);
        };

        void loadPreference();

        return () => {
            cancelled = true;
        };
    }, [user]);

    const updatePreference = (newPreference: ThemePreference) => {
        setPreference(newPreference);
        void AsyncStorage.setItem(THEME_PREFERENCE_KEY, newPreference);

        const saveCloudPreference = async () => {
            if (!user) return;
            const { data } = await supabase.auth.getSession();
            if (!data.session) return;
            const { error } = await supabase.auth.updateUser({ data: { theme: newPreference } });
            if (!error) await refreshUser();
        };

        void saveCloudPreference();
    };

    // Determine the actual color scheme to use
    const colorScheme = useMemo<"light" | "dark">(() => {
        if (preference !== "system") return preference;
        return systemColorScheme === "dark" ? "dark" : "light";
    }, [preference, systemColorScheme]);

    const value = useMemo(
        () => ({
            preference,
            colorScheme,
            updatePreference,
            isLoaded,
        }),
        [preference, colorScheme, isLoaded],
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
