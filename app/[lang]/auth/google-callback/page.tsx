"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";

type ConfigOptions = {
    languages: string[];
    timezones: string[];
    default_language: string;
    default_timezone: string;
};

const CONFIG_OPTIONS_STORAGE_KEY = "config_options";

function getConfigOptions(): ConfigOptions | null {
    const storedOptions = localStorage.getItem(
        CONFIG_OPTIONS_STORAGE_KEY
    );

    if (!storedOptions) {
        return null;
    }

    try {
        return JSON.parse(storedOptions);
    } catch {
        localStorage.removeItem(CONFIG_OPTIONS_STORAGE_KEY);
        return null;
    }
}

function getBrowserTimezone(): string | null {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
}

export default function GoogleCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams<{ lang: string }>();
    const t = useTranslations("googleCallback");

    const hasFetched = useRef(false);

    useEffect(() => {
        const code = searchParams.get("code");

        if (!code || hasFetched.current) {
            return;
        }

        hasFetched.current = true;

        const exchangeLoginCode = async () => {
            try {
                const response = await apiFetch(
                    "auth/exchange-login-code",
                    {
                        method: "POST",
                        auth: false,
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            code,
                        }),
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to exchange login code"
                    );
                }

                const data: { token: string } =
                    await response.json();

                localStorage.setItem("token", data.token);

                const config = getConfigOptions();

                const language =
                    config?.languages.includes(params.lang)
                        ? params.lang
                        : config?.default_language ?? "es";

                const browserTimezone =
                    getBrowserTimezone();

                const timezone =
                    browserTimezone &&
                        config?.timezones.includes(browserTimezone)
                        ? browserTimezone
                        : config?.default_timezone ??
                        "Europe/Madrid";

                const preferencesResponse = await apiFetch(
                    "auth/me",
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            language,
                            timezone,
                        }),
                    }
                );

                if (!preferencesResponse.ok) {
                    const body =
                        await preferencesResponse.text();

                    console.error(
                        "Failed to update user preferences:",
                        {
                            status:
                                preferencesResponse.status,
                            body,
                        }
                    );

                    throw new Error(
                        "Failed to update user preferences"
                    );
                }

                router.replace(
                    `/${language}/dashboard/settings`
                );
            } catch (error) {
                console.error(
                    "Google authentication error:",
                    error
                );

                router.replace(
                    `/${params.lang}/login?error=google_auth_failed`
                );
            }
        };

        exchangeLoginCode();
    }, [params.lang, router, searchParams]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 text-center shadow-sm">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
                    </div>

                    <h1 className="mt-6 text-xl font-semibold tracking-tight text-gray-900">
                        {t("title")}
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        {t("description")}
                    </p>
                </div>

                <p className="mt-6 text-center text-xs text-gray-400">
                    {t("secureAuthentication")}
                </p>
            </div>
        </main>
    );
}