import { Platform } from "react-native";

// On native, use @react-native-firebase/analytics if available.
// On web, use GA4 gtag if available (loaded via Head in app/_layout).
let nativeAnalytics: any = null;
try {
    if (Platform.OS !== "web") {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        nativeAnalytics = require("@react-native-firebase/analytics").default;
    }
} catch {
    nativeAnalytics = null;
}

function getGtag(): ((...args: any[]) => void) | null {
    if (typeof globalThis !== "undefined" && (globalThis as any).window?.gtag) {
        return (globalThis as any).window.gtag as (...args: any[]) => void;
    }
    return null;
}

function getPageMetadata() {
    const hasDocument = typeof document !== "undefined";
    const hasLocation = typeof globalThis !== "undefined" && globalThis.location;

    return {
        page_title: hasDocument ? document.title : undefined,
        page_location: hasLocation ? globalThis.location.href : undefined,
        page_path: hasLocation ? globalThis.location.pathname : undefined,
    };
}

export async function logScreenView(name: string) {
    if (!name) return;
    if (Platform.OS === "web") {
        const gtag = getGtag();
        if (gtag) {
            gtag("event", "page_view", getPageMetadata());
        }
        return;
    }
    if (nativeAnalytics) {
        try {
            await nativeAnalytics().logScreenView({ screen_name: name, screen_class: name });
        } catch {
            // noop
        }
    }
}

export async function logEvent(eventName: string, params?: Record<string, any>) {
    if (!eventName) return;
    if (Platform.OS === "web") {
        const gtag = getGtag();
        if (gtag) {
            gtag("event", eventName, params ?? {});
        }
        return;
    }
    if (nativeAnalytics) {
        try {
            await nativeAnalytics().logEvent(eventName, params ?? {});
        } catch {
            // noop
        }
    }
}

export async function setUserId(userId: string | null) {
    if (Platform.OS === "web") {
        const gtag = getGtag();
        if (gtag && userId) {
            gtag("set", { user_id: userId });
        }
        return;
    }
    if (nativeAnalytics) {
        try {
            await nativeAnalytics().setUserId(userId ?? undefined);
        } catch {
            // noop
        }
    }
}

export async function setUserProperties(props: Record<string, string>) {
    if (Platform.OS === "web") {
        const gtag = getGtag();
        if (gtag) {
            gtag("set", props);
        }
        return;
    }
    if (nativeAnalytics) {
        try {
            await nativeAnalytics().setUserProperties(props);
        } catch {
            // noop
        }
    }
}
