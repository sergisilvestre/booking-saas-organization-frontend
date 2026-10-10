"use client";

import {
    createContext,
    useEffect,
    useState,
} from "react";
import { setLoadingListener } from "@/lib/api";

type LoadingContextValue = {
    loading: boolean;
};

const LoadingContext =
    createContext<LoadingContextValue | null>(null);

export function LoadingProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoadingListener(setLoading);

        return () => {
            setLoadingListener(null);
        };
    }, []);

    return (
        <LoadingContext.Provider value={{ loading }}>
            {children}

            {loading && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-sm">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
                </div>
            )}
        </LoadingContext.Provider>
    );
}