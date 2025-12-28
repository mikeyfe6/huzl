import { useEffect, useState } from "react";
import { useThemePreference } from "./use-theme-preference";

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
    const [hasHydrated, setHasHydrated] = useState(false);
    const { colorScheme, isLoaded } = useThemePreference();

    useEffect(() => {
        setHasHydrated(true);
    }, []);

    if (hasHydrated && isLoaded) {
        return colorScheme;
    }

    return "light";
}

export { ThemeProvider } from "./use-theme-preference";
