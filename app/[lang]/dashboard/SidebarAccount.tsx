"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
    USER_STORAGE_KEY,
    USER_LANGUAGE_STORAGE_KEY,
} from "@/lib/storage-keys";

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

export default function SidebarAccount({ lang }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations("dashboard.account");

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            localStorage.removeItem(USER_STORAGE_KEY);
            setUser(null);
            setLoading(false);
            router.replace(`/ ${lang}/auth/login`);
            return;
        }

        const cachedUser = localStorage.getItem(USER_STORAGE_KEY);

        if (!cachedUser) {
            setUser(null);
            setLoading(false);
            router.replace(`/${lang}/auth/login`);
            return;
        }

        try {
            const parsedUser: User = JSON.parse(cachedUser);

            if (
                !parsedUser ||
                typeof parsedUser.name !== "string" ||
                typeof parsedUser.email !== "string"
            ) {
                throw new Error("Invalid cached user data");
            }

            setUser(parsedUser);

            if (parsedUser.language) {
                localStorage.setItem(
                    USER_LANGUAGE_STORAGE_KEY,
                    parsedUser.language,
                );
            }

            if (
                parsedUser.organization === null &&
                parsedUser.onboarding?.status === "organization_required"
            ) {
                const settingsPath = `/${lang}/dashboard/settings`;

                if (pathname !== settingsPath) {
                    router.replace(settingsPath);
                }
            }
        } catch (error) {
            console.error(
                "[SidebarAccount] Failed to load cached user:",
                error,
            );

            localStorage.removeItem(USER_STORAGE_KEY);
            setUser(null);
            router.replace(`/${lang}/auth/login`);
        } finally {
            setLoading(false);
        }
    }, [lang, pathname, router]);

    function handleLogout() {
        setLoggingOut(true);

        localStorage.removeItem("token");
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(USER_LANGUAGE_STORAGE_KEY);

        router.replace(`/${lang}/auth/login`);
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