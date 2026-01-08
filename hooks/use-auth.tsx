import { logEvent, setUserId } from "@/utils/analytics";
import { supabase } from "@/utils/supabase";
import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthContextValue = {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error?: string }>;
    signUp: (email: string, password: string) => Promise<{ error?: string; success: boolean }>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        supabase.auth
            .getSession()
            .then(({ data }) => {
                if (!isMounted) return;
                setUser(data.session?.user ?? null);
                setLoading(false);
            })
            .catch(() => setLoading(false));

        let lastUserIdSent: string | null = null;
        let initialized = false;

        const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
            const nextUser = session?.user ?? null;
            const nextUserId = nextUser?.id ?? null;
            setUser(nextUser);

            if (event === "SIGNED_IN" && nextUserId) {
                if (nextUserId !== lastUserIdSent) {
                    setUserId(nextUserId);
                    lastUserIdSent = nextUserId;
                }
            } else if (event === "SIGNED_OUT") {
                if (initialized && lastUserIdSent) {
                    setUserId(null);
                    logEvent("sign_out");
                }
                lastUserIdSent = null;
            }

            initialized = true;
        });

        return () => {
            isMounted = false;
            sub.subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (!error) {
            logEvent("sign_in");
        }
        return { error: error?.message };
    };

    const signUp = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (!error && data.user) {
            logEvent("sign_up", { method: "password" });
        }
        return { error: error?.message, success: !error && !!data.user };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const refreshUser = async () => {
        const { data } = await supabase.auth.getUser();
        setUser(data.user ?? null);
    };

    const value = useMemo<AuthContextValue>(
        () => ({ user, loading, signIn, signUp, signOut, refreshUser }),
        [user, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
