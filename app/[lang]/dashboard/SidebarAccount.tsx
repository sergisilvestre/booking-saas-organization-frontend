"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";

type Props = {
    lang: string;
};

type User = {
    id?: string;
    name: string;
    email: string;
    role?: string;
    language?: string;
    timezone?: string;
    organization: {
        id: string;
        name: string;
        timezone: string;
    } | null;
    onboarding?: {
        status: string;
    };
};

const USER_STORAGE_KEY = "user";
const USER_LANGUAGE_STORAGE_KEY = "user_language";

export default function SidebarAccount({ lang }: Props) {
    const router = useRouter();
    const pathname = usePathname();

    const t = useTranslations("dashboard.account");

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        async function loadUser() {
            console.log("[SidebarAccount] Loading authenticated user...");

            const token = localStorage.getItem("token");

            console.log(
                "[SidebarAccount] Token:",
                token ? "present" : "missing"
            );

            if (!token) {
                console.log(
                    "[SidebarAccount] No token. Redirecting to login."
                );

                localStorage.removeItem(USER_STORAGE_KEY);
                router.replace(`/${lang}/login`);
                return;
            }

            const cachedUser = localStorage.getItem(USER_STORAGE_KEY);

            console.log(
                "[SidebarAccount] Cached user:",
                cachedUser ? "found" : "not found"
            );

            if (cachedUser) {
                try {
                    const parsedUser: User = JSON.parse(cachedUser);

                    console.log(
                        "[SidebarAccount] Using cached user:",
                        parsedUser
                    );

                    setUser(parsedUser);
                } catch (error) {
                    console.error(
                        "[SidebarAccount] Failed to parse cached user:",
                        error
                    );

                    localStorage.removeItem(USER_STORAGE_KEY);
                }
            }

            try {
                console.log(
                    "[SidebarAccount] Fetching authenticated user from API..."
                );

                const response = await apiFetch("organization/auth/me");

                console.log(
                    "[SidebarAccount] /me response status:",
                    response.status
                );

                if (!response.ok) {
                    console.log(
                        "[SidebarAccount] Authentication failed. Clearing storage."
                    );

                    localStorage.removeItem("token");
                    localStorage.removeItem(USER_STORAGE_KEY);

                    router.replace(`/${lang}/login`);
                    return;
                }

                const data = await response.json();

                console.log(
                    "[SidebarAccount] /me response data:",
                    data
                );

                const authenticatedUser: User = data.data ?? data;

                console.log(
                    "[SidebarAccount] Authenticated user:",
                    authenticatedUser
                );

                console.log(
                    "[SidebarAccount] User language:",
                    authenticatedUser.language
                );

                console.log(
                    "[SidebarAccount] User timezone:",
                    authenticatedUser.timezone
                );

                setUser(authenticatedUser);

                localStorage.setItem(
                    USER_STORAGE_KEY,
                    JSON.stringify(authenticatedUser)
                );

                console.log(
                    "[SidebarAccount] Updated user localStorage."
                );

                if (authenticatedUser.language) {
                    const previousLanguage = localStorage.getItem(
                        USER_LANGUAGE_STORAGE_KEY
                    );

                    console.log(
                        "[SidebarAccount] Previous user_language:",
                        previousLanguage
                    );

                    localStorage.setItem(
                        USER_LANGUAGE_STORAGE_KEY,
                        authenticatedUser.language
                    );

                    console.log(
                        "[SidebarAccount] Updated user_language:",
                        localStorage.getItem(
                            USER_LANGUAGE_STORAGE_KEY
                        )
                    );
                } else {
                    console.log(
                        "[SidebarAccount] No user language received. user_language was not changed."
                    );
                }

                if (
                    authenticatedUser.organization === null &&
                    authenticatedUser.onboarding?.status ===
                    "organization_required"
                ) {
                    const settingsPath = `/${lang}/dashboard/settings`;

                    console.log(
                        "[SidebarAccount] Organization required. Settings path:",
                        settingsPath
                    );

                    if (pathname !== settingsPath) {
                        console.log(
                            "[SidebarAccount] Redirecting to organization settings."
                        );

                        router.replace(settingsPath);
                        return;
                    }
                }
            } catch (error) {
                console.error(
                    "[SidebarAccount] Failed to load authenticated user:",
                    error
                );

                localStorage.removeItem("token");
                localStorage.removeItem(USER_STORAGE_KEY);

                router.replace(`/${lang}/login`);
            } finally {
                setLoading(false);

                console.log(
                    "[SidebarAccount] Loading completed."
                );
            }
        }

        loadUser();
    }, [lang, pathname, router]);

    async function handleLogout() {
        try {
            setLoggingOut(true);

            console.log("[SidebarAccount] Logging out...");

            await apiFetch("auth/logout", {
                method: "POST",
            });
        } finally {
            console.log(
                "[SidebarAccount] Clearing authentication storage."
            );

            localStorage.removeItem("token");
            localStorage.removeItem(USER_STORAGE_KEY);

            router.replace(`/${lang}/login`);
        }
    }

    if (loading && !user) {
        return (
            <div className="border-t border-gray-200 p-4">
                <div className="animate-pulse">
                    <div className="h-4 w-32 rounded bg-gray-200" />
                    <div className="mt-2 h-3 w-40 rounded bg-gray-200" />
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="border-t border-gray-200 p-4">
            <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                    {user.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                        {user.name}
                    </p>

                    <p className="truncate text-xs text-gray-500">
                        {user.email}
                    </p>
                </div>
            </div>

            <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loggingOut ? t("loggingOut") : t("logout")}
            </button>
        </div>
    );
}