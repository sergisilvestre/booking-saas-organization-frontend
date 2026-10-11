"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { apiFetch } from "@/lib/api";
import type { OnboardingUser } from "@/lib/onboarding";

const USER_STORAGE_KEY = "user";
const USER_LANGUAGE_STORAGE_KEY = "user_language";
const USER_TIMEZONE_STORAGE_KEY = "user_timezone";

export type CurrentUser = OnboardingUser & {
    email?: string;
    language?: string;
    timezone?: string;
};

type CurrentUserContextValue = {
    user: CurrentUser | null;
    loadingUser: boolean;
    reloadUser: () => Promise<void>;
};

const CurrentUserContext =
    createContext<CurrentUserContextValue | undefined>(undefined);

type Props = {
    children: ReactNode;
};

export function CurrentUserProvider({ children }: Props) {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const requestRef = useRef<Promise<void> | null>(null);

    const saveUserPreferences = useCallback((currentUser: CurrentUser) => {
        if (currentUser.language) {
            localStorage.setItem(
                USER_LANGUAGE_STORAGE_KEY,
                currentUser.language,
            );
        }

        if (currentUser.timezone) {
            localStorage.setItem(
                USER_TIMEZONE_STORAGE_KEY,
                currentUser.timezone,
            );
        }
    }, []);

    const loadUser = useCallback(async (): Promise<void> => {
        if (requestRef.current) {
            return requestRef.current;
        }

        const request = (async () => {
            try {
                const response = await apiFetch("organization/auth/me");

                if (!response.ok) {
                    throw new Error("Unable to load current user.");
                }

                const data = await response.json();
                const currentUser: CurrentUser = data.data ?? data;

                localStorage.setItem(
                    USER_STORAGE_KEY,
                    JSON.stringify(currentUser),
                );

                saveUserPreferences(currentUser);
                setUser(currentUser);
            } catch (error) {
                console.error("Unable to load user:", error);

                const storedUser = localStorage.getItem(USER_STORAGE_KEY);

                if (!storedUser) {
                    setUser(null);
                    return;
                }

                try {
                    const currentUser = JSON.parse(storedUser) as CurrentUser;

                    saveUserPreferences(currentUser);
                    setUser(currentUser);
                } catch {
                    localStorage.removeItem(USER_STORAGE_KEY);
                    setUser(null);
                }
            } finally {
                setLoadingUser(false);
            }
        })();

        requestRef.current = request;

        try {
            await request;
        } finally {
            if (requestRef.current === request) {
                requestRef.current = null;
            }
        }
    }, [saveUserPreferences]);

    useEffect(() => {
        void loadUser();

        const handleOrganizationRegistered = () => {
            void loadUser();
        };

        window.addEventListener(
            "organization-registered",
            handleOrganizationRegistered,
        );

        return () => {
            window.removeEventListener(
                "organization-registered",
                handleOrganizationRegistered,
            );
        };
    }, [loadUser]);



    return (
        <CurrentUserContext.Provider
            value={{
                user,
                loadingUser,
                reloadUser: loadUser,
            }}
        >
            {children}
        </CurrentUserContext.Provider>
    );
}

export function useCurrentUserContext() {
    const context = useContext(CurrentUserContext);

    if (!context) {
        throw new Error(
            "useCurrentUser must be used inside CurrentUserProvider.",
        );
    }

    return context;
}