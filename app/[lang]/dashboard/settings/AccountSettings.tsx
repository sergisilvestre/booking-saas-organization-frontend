"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type User = {
    id: string;
    name: string;
    email: string;
    language?: string | null;
    timezone?: string | null;
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
        saving: string;
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
    const [config, setConfig] =
        useState<ConfigOptions | null>(null);

    const [language, setLanguage] = useState("");
    const [timezone, setTimezone] = useState("");

    // Values received from the authenticated user.
    // These are the values used to determine if the form has changes.
    const [currentLanguage, setCurrentLanguage] = useState("");
    const [currentTimezone, setCurrentTimezone] = useState("");

    const [saving, setSaving] = useState(false);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const initialize = (options: ConfigOptions) => {
            setConfig(options);

            const storedLanguage = localStorage.getItem(
                USER_LANGUAGE_STORAGE_KEY
            );

            const storedTimezone = localStorage.getItem(
                USER_TIMEZONE_STORAGE_KEY
            );

            const effectiveLanguage =
                user?.language ??
                storedLanguage ??
                options.default_language;

            const effectiveTimezone =
                user?.timezone ??
                storedTimezone ??
                options.default_timezone;

            setLanguage(effectiveLanguage);
            setTimezone(effectiveTimezone);

            setCurrentLanguage(effectiveLanguage);
            setCurrentTimezone(effectiveTimezone);

            setInitialized(true);
        };

        const loadConfig = async () => {
            const storedOptions = localStorage.getItem(
                CONFIG_OPTIONS_STORAGE_KEY
            );

            if (storedOptions) {
                try {
                    const options: ConfigOptions =
                        JSON.parse(storedOptions);

                    initialize(options);

                    return;
                } catch {
                    localStorage.removeItem(
                        CONFIG_OPTIONS_STORAGE_KEY
                    );
                }
            }

            try {
                const response = await apiFetch(
                    "config/options",
                    {
                        auth: false,
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to load config options"
                    );
                }

                const options: ConfigOptions =
                    await response.json();

                localStorage.setItem(
                    CONFIG_OPTIONS_STORAGE_KEY,
                    JSON.stringify(options)
                );

                initialize(options);
            } catch (error) {
                console.error(
                    "Failed to load config options:",
                    error
                );

                setInitialized(true);
            }
        };

        loadConfig();
    }, [user]);

    useEffect(() => {
        const handleUserUpdated = () => {
            const cachedUser =
                localStorage.getItem(USER_STORAGE_KEY);

            if (!cachedUser) {
                return;
            }

            try {
                const updatedUser: User =
                    JSON.parse(cachedUser);

                const updatedLanguage =
                    updatedUser.language ??
                    localStorage.getItem(
                        USER_LANGUAGE_STORAGE_KEY
                    ) ??
                    config?.default_language ??
                    "";

                const updatedTimezone =
                    updatedUser.timezone ??
                    localStorage.getItem(
                        USER_TIMEZONE_STORAGE_KEY
                    ) ??
                    config?.default_timezone ??
                    "";

                // Update form values
                setLanguage(updatedLanguage);
                setTimezone(updatedTimezone);

                // Update the values used by hasChanges
                setCurrentLanguage(updatedLanguage);
                setCurrentTimezone(updatedTimezone);

                setInitialized(true);
            } catch (error) {
                console.error(
                    "Failed to parse updated user:",
                    error
                );
            }
        };

        window.addEventListener(
            "auth:user-updated",
            handleUserUpdated
        );

        return () => {
            window.removeEventListener(
                "auth:user-updated",
                handleUserUpdated
            );
        };
    }, [config]);

    const hasChanges =
        language !== currentLanguage ||
        timezone !== currentTimezone;

    const handleSave = async () => {
        if (
            !user ||
            saving ||
            !language ||
            !timezone ||
            !hasChanges
        ) {
            return;
        }

        try {
            setSaving(true);

            const response = await apiFetch("auth/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    language,
                    timezone,
                }),
            });

            if (!response.ok) {
                const body = await response.text();

                console.error(
                    "Failed to update account settings:",
                    {
                        status: response.status,
                        body,
                    }
                );

                throw new Error(
                    "Failed to update account settings"
                );
            }

            const responseData =
                await response.json();

            const updatedUser: User =
                responseData.data ?? responseData;

            const updatedLanguage =
                updatedUser.language ?? language;

            const updatedTimezone =
                updatedUser.timezone ?? timezone;

            localStorage.setItem(
                USER_STORAGE_KEY,
                JSON.stringify(updatedUser)
            );

            localStorage.setItem(
                USER_LANGUAGE_STORAGE_KEY,
                updatedLanguage
            );

            localStorage.setItem(
                USER_TIMEZONE_STORAGE_KEY,
                updatedTimezone
            );

            setLanguage(updatedLanguage);
            setTimezone(updatedTimezone);

            // The saved values are now the current values.
            setCurrentLanguage(updatedLanguage);
            setCurrentTimezone(updatedTimezone);

            window.dispatchEvent(
                new Event("auth:user-updated")
            );
        } catch (error) {
            console.error(
                "Failed to save account settings:",
                error
            );
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
                        disabled={
                            !initialized ||
                            !config?.languages.length ||
                            saving
                        }
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                    >
                        {config?.languages.map(
                            (languageOption) => (
                                <option
                                    key={languageOption}
                                    value={languageOption}
                                >
                                    {languageOption.toUpperCase()}
                                </option>
                            )
                        )}
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
                        disabled={
                            !initialized ||
                            !config?.timezones.length ||
                            saving
                        }
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                    >
                        {config?.timezones.map(
                            (timezoneOption) => (
                                <option
                                    key={timezoneOption}
                                    value={timezoneOption}
                                >
                                    {timezoneOption}
                                </option>
                            )
                        )}
                    </select>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={
                        !initialized ||
                        saving ||
                        !user ||
                        !language ||
                        !timezone ||
                        !hasChanges
                    }
                    className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                    {saving ? t.saving : t.save}
                </button>
            </div>
        </section>
    );
}