"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type Props = {
    lang: string;
};

type User = {
    id: string;
    name: string;
    email: string;
};

export default function SidebarAccount({ lang }: Props) {
    const router = useRouter();

    const t = useTranslations("dashboard.account");

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        async function loadUser() {
            const token = localStorage.getItem("token");

            if (!token) {
                router.replace(`/${lang}/login`);
                return;
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            if (!apiUrl) {
                localStorage.removeItem("token");
                router.replace(`/${lang}/login`);
                return;
            }

            try {
                const response = await fetch(`${apiUrl}/api/auth/me`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    localStorage.removeItem("token");
                    router.replace(`/${lang}/login`);
                    return;
                }

                const data = await response.json();

                setUser(data.data ?? data);
            } catch {
                localStorage.removeItem("token");
                router.replace(`/${lang}/login`);
            } finally {
                setLoading(false);
            }
        }

        loadUser();
    }, [lang, router]);

    async function handleLogout() {
        const token = localStorage.getItem("token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        try {
            setLoggingOut(true);

            if (token && apiUrl) {
                await fetch(`${apiUrl}/api/auth/logout`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
        } finally {
            localStorage.removeItem("token");
            router.replace(`/${lang}/login`);
        }
    }

    if (loading) {
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