import { Redirect, useRootNavigationState } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/hooks/use-auth";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { baseCenter, baseWeight } from "@/styles/base";

export function AuthGate({ children }: { readonly children: React.ReactNode }) {
    const { t } = useTranslation();
    const { user, loading: authLoading } = useAuth();
    const rootNavigationState = useRootNavigationState();

    if (!rootNavigationState?.key) return null;
    if (authLoading) {
        return (
            <ThemedView
                style={{
                    ...baseCenter,
                    flex: 1,
                }}
            >
                <ThemedText
                    style={{
                        ...baseWeight,
                    }}
                >
                    {t("common.loading")}
                </ThemedText>
            </ThemedView>
        );
    }
    if (!user) return <Redirect href="/" />;
    return <>{children}</>;
}
