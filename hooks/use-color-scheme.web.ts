import { useThemePreference } from "@/hooks/use-theme-preference";
import { useEffect, useState } from "react";

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

export { ThemeProvider } from "@/hooks/use-theme-preference";
