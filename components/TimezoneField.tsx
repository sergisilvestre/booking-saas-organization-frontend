"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
    value: string;
    onChange: (timezone: string) => void;
    name?: string;
    id?: string;
    label?: string;
    disabled?: boolean;
};

type ConfigOptions = {
    timezones: string[];
    default_timezone: string;
};

type StoredUser = {
    timezone?: string | null;
};

const CONFIG_OPTIONS_STORAGE_KEY = "config_options";
const USER_STORAGE_KEY = "user";

function getUtcOffset(timeZone: string): string {
    try {
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone,
            timeZoneName: "longOffset",
        }).formatToParts(new Date());

        const offset = parts.find(
            (part) => part.type === "timeZoneName",
        )?.value;

        return offset?.replace("GMT", "UTC") ?? "UTC";
    } catch {
        return "UTC";
    }
}

function getStoredUser(): StoredUser | null {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser);
    } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
    }
}

function saveUserTimezone(timezone: string): void {
    const user = getStoredUser();

    if (!user) {
        return;
    }

    localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify({
            ...user,
            timezone,
        }),
    );
}

function detectTimezone(timezones: string[]): string | null {
    const detectedTimezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone;

    return detectedTimezone && timezones.includes(detectedTimezone)
        ? detectedTimezone
        : null;
}

export default function TimezoneField({
    value,
    onChange,
    name = "timezone",
    id = "timezone",
    label,
    disabled = false,
}: Props) {
    const [timezones, setTimezones] = useState<string[]>([]);

    useEffect(() => {
        const storedOptions = localStorage.getItem(
            CONFIG_OPTIONS_STORAGE_KEY,
        );

        if (!storedOptions) {
            console.error(
                "Configuration options not found in localStorage.",
            );
            return;
        }

        try {
            const config = JSON.parse(
                storedOptions,
            ) as ConfigOptions;

            if (
                !Array.isArray(config.timezones) ||
                config.timezones.length === 0
            ) {
                console.error("Invalid configuration timezones.");
                return;
            }

            setTimezones(config.timezones);

            const storedUser = getStoredUser();

            if (
                storedUser?.timezone &&
                config.timezones.includes(storedUser.timezone)
            ) {
                if (!value) {
                    onChange(storedUser.timezone);
                }

                return;
            }

            if (value && config.timezones.includes(value)) {
                return;
            }

            const detectedTimezone = detectTimezone(
                config.timezones,
            );

            const initialTimezone =
                detectedTimezone ?? config.default_timezone;

            if (initialTimezone && config.timezones.includes(initialTimezone)) {
                onChange(initialTimezone);
                saveUserTimezone(initialTimezone);
            }
        } catch (error) {
            console.error(
                "Unable to initialize timezone options:",
                error,
            );
        }
    }, []);

    const timezoneOptions = useMemo(
        () =>
            timezones.map((timezone) => ({
                value: timezone,
                label: `${timezone} (${getUtcOffset(timezone)})`,
            })),
        [timezones],
    );

    return (
        <div>
            {label && (
                <label
                    htmlFor={id}
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    {label}
                </label>
            )}

            <select
                id={id}
                name={name}
                value={value}
                onChange={(event) => {
                    const timezone = event.target.value;

                    onChange(timezone);
                    saveUserTimezone(timezone);
                }}
                disabled={disabled || timezones.length === 0}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
            >
                {timezoneOptions.map((timezone) => (
                    <option
                        key={timezone.value}
                        value={timezone.value}
                    >
                        {timezone.label}
                    </option>
                ))}
            </select>
        </div>
    );
}