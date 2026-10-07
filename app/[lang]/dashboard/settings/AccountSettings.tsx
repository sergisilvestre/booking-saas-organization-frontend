"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type User = {
    id: string;
    name: string;
    email: string;
    language?: string;
    timezone?: string;
};

type ConfigOptions = {
    languages: string[];
    default_language: string;
    timezones: string[];
    default_timezone: string;
};

type Props = {
    translations: {
        title: string;
        description: string;
        name: string;
        namePlaceholder: string;
        email: string;
        emailPlaceholder: string;
        language: string;
        timezone: string;
        save: string;
    };
    user: User | null;
};

const CONFIG_OPTIONS_STORAGE_KEY = "config_options";
const USER_STORAGE_KEY = "user";
const USER_LANGUAGE_STORAGE_KEY = "user_language";
const USER_TIMEZONE_STORAGE_KEY = "user_timezone";

export default function AccountSettings({
    translations: t,
    user,
}: Props) {
    const [config, setConfig] = useState<ConfigOptions | null>(null);
    const [language, setLanguage] = useState(user?.language ?? "");
    const [timezone, setTimezone] = useState(user?.timezone ?? "");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const storedOptions = localStorage.getItem(
            CONFIG_OPTIONS_STORAGE_KEY
        );

        if (storedOptions) {
            try {
                const options: ConfigOptions = JSON.parse(storedOptions);

                setConfig(options);

                setLanguage(
                    user?.language ??
                    localStorage.getItem(USER_LANGUAGE_STORAGE_KEY) ??
                    options.default_language
                );

                setTimezone(
                    user?.timezone ??
                    localStorage.getItem(USER_TIMEZONE_STORAGE_KEY) ??
                    options.default_timezone
                );

                return;
            } catch {
                localStorage.removeItem(CONFIG_OPTIONS_STORAGE_KEY);
            }
        }

        const loadConfig = async () => {
            try {
                const response = await apiFetch("config/options", {
                    auth: false,
                });

                if (!response.ok) {
                    throw new Error("Failed to load config options");
                }

                const options: ConfigOptions = await response.json();

                localStorage.setItem(
                    CONFIG_OPTIONS_STORAGE_KEY,
                    JSON.stringify(options)
                );

                setConfig(options);

                setLanguage(
                    user?.language ??
                    localStorage.getItem(USER_LANGUAGE_STORAGE_KEY) ??
                    options.default_language
                );

                setTimezone(
                    user?.timezone ??
                    localStorage.getItem(USER_TIMEZONE_STORAGE_KEY) ??
                    options.default_timezone
                );
            } catch {
                setConfig(null);
            }
        };

        loadConfig();
    }, [user]);

    useEffect(() => {
        if (!user) {
            return;
        }

        setLanguage(user.language ?? "");
        setTimezone(user.timezone ?? "");
    }, [user]);

    const handleSave = async () => {
        if (!user || saving) {
            return;
        }

        try {
            setSaving(true);

            const response = await apiFetch("auth/me", {
                method: "PUT",
                body: JSON.stringify({
                    language,
                    timezone,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update account settings");
            }

            const updatedUser: User = await response.json();

            localStorage.setItem(
                USER_STORAGE_KEY,
                JSON.stringify(updatedUser)
            );

            localStorage.setItem(
                USER_LANGUAGE_STORAGE_KEY,
                updatedUser.language ?? language
            );

            localStorage.setItem(
                USER_TIMEZONE_STORAGE_KEY,
                updatedUser.timezone ?? timezone
            );

            setLanguage(updatedUser.language ?? language);
            setTimezone(updatedUser.timezone ?? timezone);
        } catch (error) {
            console.error("Failed to save account settings:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-900">
                    {t.title}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                    {t.description}
                </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
                <div>
                    <label
                        htmlFor="account-name"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        {t.name}
                    </label>

                    <input
                        id="account-name"
                        name="account_name"
                        type="text"
                        value={user?.name ?? ""}
                        disabled
                        placeholder={t.namePlaceholder}
                        autoComplete="off"
                        className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-gray-500 outline-none disabled:cursor-not-allowed"
                    />
                </div>

                <div>
                    <label
                        htmlFor="account-email"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        {t.email}
                    </label>

                    <input
                        id="account-email"
                        name="account_email"
                        type="email"
                        value={user?.email ?? ""}
                        disabled
                        placeholder={t.emailPlaceholder}
                        autoComplete="off"
                        className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-gray-500 outline-none disabled:cursor-not-allowed"
                    />
                </div>

                <div>
                    <label
                        htmlFor="account-language"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        {t.language}
                    </label>

                    <select
                        id="account-language"
                        name="language"
                        value={language}
                        onChange={(event) =>
                            setLanguage(event.target.value)
                        }
                        disabled={!config?.languages.length || saving}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                    >
                        {config?.languages.map((languageOption) => (
                            <option
                                key={languageOption}
                                value={languageOption}
                            >
                                {languageOption.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="account-timezone"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        {t.timezone}
                    </label>

                    <select
                        id="account-timezone"
                        name="timezone"
                        value={timezone}
                        onChange={(event) =>
                            setTimezone(event.target.value)
                        }
                        disabled={!config?.timezones.length || saving}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                    >
                        {config?.timezones.map((timezoneOption) => (
                            <option
                                key={timezoneOption}
                                value={timezoneOption}
                            >
                                {timezoneOption}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={
                        saving ||
                        !user ||
                        !language ||
                        !timezone
                    }
                    className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                    {saving ? "Saving..." : t.save}
                </button>
            </div>
        </section>
    );
}