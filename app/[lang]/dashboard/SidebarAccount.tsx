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

export default function SidebarAccount({ lang }: Props) {
    const router = useRouter();
    const pathname = usePathname();

    const t = useTranslations("dashboard.account");

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        async function loadUser() {
            const token = localStorage.getItem("token");

            if (!token) {
                localStorage.removeItem(USER_STORAGE_KEY);
                router.replace(`/${lang}/login`);
                return;
            }

            const cachedUser = localStorage.getItem(USER_STORAGE_KEY);

            if (cachedUser) {
                try {
                    setUser(JSON.parse(cachedUser));
                } catch {
                    localStorage.removeItem(USER_STORAGE_KEY);
                }
            }

            try {
                const response = await apiFetch("organization/auth/me");

                if (!response.ok) {
                    localStorage.removeItem("token");
                    localStorage.removeItem(USER_STORAGE_KEY);
                    router.replace(`/${lang}/login`);
                    return;
                }

                const data = await response.json();

                const authenticatedUser: User = data.data ?? data;

                setUser(authenticatedUser);

                localStorage.setItem(
                    USER_STORAGE_KEY,
                    JSON.stringify(authenticatedUser)
                );

                if (
                    authenticatedUser.organization === null &&
                    authenticatedUser.onboarding?.status ===
                    "organization_required"
                ) {
                    const settingsPath = `/${lang}/dashboard/settings`;

                    if (pathname !== settingsPath) {
                        router.replace(settingsPath);
                        return;
                    }
                }
            } catch {
                localStorage.removeItem("token");
                localStorage.removeItem(USER_STORAGE_KEY);
                router.replace(`/${lang}/login`);
            } finally {
                setLoading(false);
            }
        }

        loadUser();
    }, [lang, pathname, router]);

    async function handleLogout() {
        try {
            setLoggingOut(true);

            await apiFetch("auth/logout", {
                method: "POST",
            });
        } finally {
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