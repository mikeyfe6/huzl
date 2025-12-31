import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

interface RefreshContextType {
    refreshFlag: number;
    triggerRefresh: () => void;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export function RefreshProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const [refreshFlag, setRefreshFlag] = useState(0);
    const triggerRefresh = useCallback(() => {
        setRefreshFlag((f) => f + 1);
    }, []);
    const contextValue = useMemo(() => ({ refreshFlag, triggerRefresh }), [refreshFlag, triggerRefresh]);
    return <RefreshContext.Provider value={contextValue}>{children}</RefreshContext.Provider>;
}

export function useRefreshContext() {
    const ctx = useContext(RefreshContext);
    if (!ctx) throw new Error("useRefreshContext must be used within RefreshProvider");
    return ctx;
}
