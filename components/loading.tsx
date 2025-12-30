import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useRootNavigationState } from "expo-router";
import React from "react";

export function AuthGate({ children }: { readonly children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const rootNavigationState = useRootNavigationState();

    if (!rootNavigationState?.key) return null;
    if (authLoading) {
        return (
            <ThemedView
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <ThemedText>Loading…</ThemedText>
            </ThemedView>
        );
    }
    if (!user) return <Redirect href="/" />;
    return <>{children}</>;
}
