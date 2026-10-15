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
import { usePathname } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { OnboardingUser } from "@/lib/onboarding";
import { USER_LANGUAGE_STORAGE_KEY, USER_STORAGE_KEY, USER_TIMEZONE_STORAGE_KEY } from "@/lib/storage-keys";

const SUPPORTED_LANGUAGES = ["es", "ca", "en"];

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
    const pathname = usePathname();
    const redirectingRef = useRef(false);

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
        if (typeof window === "undefined") {
            setLoadingUser(false);
            return;
        }

        if (requestRef.current) {
            return requestRef.current;
        }

        const request = (async () => {
            try {
                const token = localStorage.getItem("token");

                // Do not request the authenticated endpoint without a token.
                if (!token) {
                    localStorage.removeItem(USER_STORAGE_KEY);
                    setUser(null);
                    return;
                }

                const response = await apiFetch("organization/auth/me");

                if (response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem(USER_STORAGE_KEY);
                    setUser(null);
                    return;
                }

                if (!response.ok) {
                    throw new Error(
                        `Unable to load current user (${response.status}).`,
                    );
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

                // Use cached user data only if a token still exists.
                const token = localStorage.getItem("token");
                const storedUser = token
                    ? localStorage.getItem(USER_STORAGE_KEY)
                    : null;

                if (!storedUser) {
                    setUser(null);
                    return;
                }

                try {
                    const currentUser = JSON.parse(
                        storedUser,
                    ) as CurrentUser;

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

    useEffect(() => {
        if (
            loadingUser ||
            !user?.language ||
            !pathname ||
            redirectingRef.current
        ) {
            return;
        }

        const savedLanguage = user.language;

        if (!SUPPORTED_LANGUAGES.includes(savedLanguage)) {
            return;
        }

        const segments = pathname.split("/").filter(Boolean);
        const urlLanguage = segments[0];

        // Only handle routes that already have a supported locale.
        if (!SUPPORTED_LANGUAGES.includes(urlLanguage)) {
            return;
        }

        if (urlLanguage === savedLanguage) {
            return;
        }

        const remainingPath = segments.slice(1).join("/");
        const targetPath = remainingPath
            ? `/${savedLanguage}/${remainingPath}`
            : `/${savedLanguage}`;

        // Preserve query parameters and URL fragments.
        const query = window.location.search;
        const hash = window.location.hash;

        redirectingRef.current = true;
        window.location.replace(`${targetPath}${query}${hash}`);
    }, [loadingUser, user?.language, pathname]);

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