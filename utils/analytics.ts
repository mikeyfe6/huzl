import type { FirebaseAnalyticsTypes } from "@react-native-firebase/analytics";
import { Platform } from "react-native";
type AnalyticsModule = FirebaseAnalyticsTypes.Module;

// Capture GA ID for web
const GA_ID = Platform.OS === "web" ? process.env.EXPO_PUBLIC_GA_MEASUREMENT_ID : null;

// Silence legacy namespace warnings coming from dependencies (per RNFB v22 guide)
// Must run before Firebase modules initialize.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

// On native, use the RNFirebase modular API only (no namespaced fallback).
let rnfbAnalyticsMod: typeof import("@react-native-firebase/analytics") | null = null;
let rnfbAppMod: typeof import("@react-native-firebase/app") | null = null;
let nativeAnalyticsInstance: AnalyticsModule | null = null;
let nativeCollectionEnabled = false;

try {
    if (Platform.OS !== "web") {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        rnfbAnalyticsMod = require("@react-native-firebase/analytics");
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        rnfbAppMod = require("@react-native-firebase/app");
    }
} catch {
    rnfbAnalyticsMod = null;
    rnfbAppMod = null;
}

function getGlobal() {
    return typeof globalThis === "object" ? (globalThis as any) : null;
}

function getNativeAnalyticsInstance(): AnalyticsModule | null {
    if (Platform.OS === "web") return null;
    if (nativeAnalyticsInstance) return nativeAnalyticsInstance;
    if (!rnfbAnalyticsMod) return null;
    try {
        const getAnalytics = rnfbAnalyticsMod.getAnalytics as ((app?: any) => AnalyticsModule) | undefined;
        const getApp = rnfbAppMod?.getApp as (() => any) | undefined;
        const app = getApp ? getApp() : undefined;
        nativeAnalyticsInstance = getAnalytics ? getAnalytics(app) : null;
        // Ensure collection is enabled even if plist/json flags were off
        if (nativeAnalyticsInstance && !nativeCollectionEnabled) {
            try {
                if (typeof rnfbAnalyticsMod?.setAnalyticsCollectionEnabled === "function") {
                    rnfbAnalyticsMod.setAnalyticsCollectionEnabled(nativeAnalyticsInstance, true);
                }
            } finally {
                nativeCollectionEnabled = true;
            }
        }
    } catch {
        nativeAnalyticsInstance = null;
    }
    return nativeAnalyticsInstance;
}

function getGtag(): ((...args: any[]) => void) | null {
    const g = getGlobal();
    const w = g?.window;

    if (w?.gtag) {
        return w.gtag;
    }

    return null;
}

function waitForGtag(cb: (gtag: (...args: any[]) => void) => void, retries = 20) {
    if (Platform.OS === "web") {
        const g = getGlobal();
        const w = g?.window;

            cb(w.gtag);
            return;
        }

        if (retries > 0) {
            setTimeout(() => waitForGtag(cb, retries - 1), 100);
        }
    }
}

function getPageMetadata() {
    const g = getGlobal();

    return {
        page_title: g?.document?.title,
        page_location: g?.location?.href,
        page_path: g?.location?.pathname,
    };
}

export async function logScreenView(name: string) {
    if (!name) return;

    if (Platform.OS === "web") {
        waitForGtag((gtag) => {
            gtag("event", "page_view", {
                ...getPageMetadata(),
            });
        });
        return;
    }

    try {
        const inst = getNativeAnalyticsInstance();
        if (inst && typeof rnfbAnalyticsMod?.logScreenView === "function") {
            await rnfbAnalyticsMod.logScreenView(inst, {
                screen_name: name,
                screen_class: name,
            });
        }
    } catch {
        // noop
    }
}

export async function logEvent(eventName: string, params?: Record<string, any>) {
    if (!eventName) return;
    if (Platform.OS === "web") {
        waitForGtag((gtag) => {
            const gaParams = { send_to: GA_ID, ...params };
            gtag("event", eventName, gaParams);
        });
        return;
    }
    try {
        const inst = getNativeAnalyticsInstance();
        if (inst && typeof rnfbAnalyticsMod?.logEvent === "function") {
            await rnfbAnalyticsMod.logEvent(inst, eventName, params ?? {});
        }
    } catch {
        // noop
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
    try {
        const inst = getNativeAnalyticsInstance();
        if (inst && typeof rnfbAnalyticsMod?.setUserId === "function") {
            await rnfbAnalyticsMod.setUserId(inst, userId ?? null);
        }
    } catch {
        // noop
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
    try {
        const inst = getNativeAnalyticsInstance();
        if (inst && typeof rnfbAnalyticsMod?.setUserProperties === "function") {
            await rnfbAnalyticsMod.setUserProperties(inst, props);
        }
    } catch {
        // noop
    }
}
