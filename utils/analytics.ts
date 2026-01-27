if (__DEV__) {
    (globalThis as any).RNFBDebug = true;
}

import type { Analytics } from "@react-native-firebase/analytics";
import { getApps } from "@react-native-firebase/app";
import { Platform } from "react-native";

type AnalyticsModule = Analytics;

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

        if (getApps().length === 0) {
            return null;
        }

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

// gtag helpers removed; web uses GTM dataLayer exclusively

function getPageMetadata() {
    const g = getGlobal();

    return {
        page_title: g?.document?.title,
        page_location: g?.location?.href,
        page_path: g?.location?.pathname,
    };
}

export async function logScreenView(name: string, title?: string) {
    if (!name) return;
    const screenName = title || name;

    if (Platform.OS === "web") {
        const g = getGlobal();
        const w = g?.window;
        let dl: Array<Record<string, any>> | undefined;
        if (w) {
            w.dataLayer = w.dataLayer || [];
            dl = w.dataLayer as Array<Record<string, any>>;
        }
        const metadata = {
            screen_name: screenName,
            page_referrer: (g?.document?.referrer as string | undefined) ?? undefined,
            ...getPageMetadata(),
        };

        // GTM-only: push to dataLayer
        if (dl) {
            dl.push({ event: "page_view", ...metadata });
        }
        return;
    }

    try {
        const inst = getNativeAnalyticsInstance();
        if (rnfbAppMod?.getApps?.().length === 0) {
            return null;
        }

        if (inst && typeof rnfbAnalyticsMod?.logScreenView === "function") {
            await rnfbAnalyticsMod.logScreenView(inst, {
                screen_name: screenName,
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
        const g = getGlobal();
        const w = g?.window;
        let dl: Array<Record<string, any>> | undefined;
        if (w) {
            w.dataLayer = w.dataLayer || [];
            dl = w.dataLayer as Array<Record<string, any>>;
        }

        // GTM-only: push to dataLayer
        if (dl) {
            if (params && Object.keys(params).length > 0) {
                dl.push({ event: eventName, ...params });
            } else {
                dl.push({ event: eventName });
            }
        }
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
        const g = getGlobal();
        const w = g?.window;
        let dl: Array<Record<string, any>> | undefined;
        if (w) {
            w.dataLayer = w.dataLayer || [];
            dl = w.dataLayer as Array<Record<string, any>>;
            // Expose user id for GTM JavaScript Variable consumption
            if (g) {
                g.huzlUserId = userId ?? null;
            }
        }
        if (dl) {
            dl.push({ event: "set_user", user_id: userId ?? null });
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
        const g = getGlobal();
        const w = g?.window;
        let dl: Array<Record<string, any>> | undefined;
        if (w) {
            w.dataLayer = w.dataLayer || [];
            dl = w.dataLayer as Array<Record<string, any>>;
        }
        if (dl) {
            dl.push({ event: "user_properties", ...props });
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
